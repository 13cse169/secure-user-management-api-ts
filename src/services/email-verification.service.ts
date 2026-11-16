import pool from "../config/db.js";
import type { PoolClient } from "pg";
import { generateVerificationToken } from "../utils/token.js";
import { createHash } from "node:crypto";
import { AppError } from "../utils/app-error.js";

export const createVerificationToken = async (
    userId: string,
    client: PoolClient
): Promise<string> => {
    // Step 1: Generate token and hash
    const { token, tokenHash } = generateVerificationToken();

    // Step 2: Store hash in PostgreSQL
    // await pool.query(

    await client.query(
        `INSERT INTO email_verification_tokens
        (user_id, token_hash, expires_at)
        VALUES ($1, $2, NOW() + INTERVAL '15 minutes')`,
        [userId, tokenHash]
    );

    // Step 3: Return original token for email delivery
    return token;
};


export const verifyEmailToken = async (
    token: string
): Promise<void> => {
    // Step 1: Hash the received token
    const tokenHash = createHash("sha256").update(token).digest("hex");

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        // Step 2: Find a valid, unused, unexpired token
        const result = await client.query(
            `SELECT id, user_id
            FROM email_verification_tokens
            WHERE token_hash = $1
            AND used_at IS NULL
            AND expires_at > NOW()
            FOR UPDATE`,
            [tokenHash]
        );

        if (result.rowCount === 0) {
            throw new AppError(
                400,
                "Invalid or expired verification token"
            );
        }

        const verificationRecord = result.rows[0];

        // Step 3: Mark the user's email as verified
        await client.query(
            `UPDATE users
            SET is_email_verified = TRUE,
            updated_at = NOW()
            WHERE id = $1`,
            [verificationRecord.user_id]
        );

        // Step 4: Mark token as used
        await client.query(
            `UPDATE email_verification_tokens
            SET used_at = NOW()
            WHERE id = $1`,
            [verificationRecord.id]
        );

        await client.query("COMMIT");

    } catch (error) {
        await client.query("ROLLBACK");
        throw error;

    } finally {
        client.release();
    }
};