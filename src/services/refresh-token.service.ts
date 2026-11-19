import jwt from "jsonwebtoken";
import pool from "../config/db.js";
import { hashToken } from "../utils/token.js";
import { AppError } from "../utils/app-error.js";

type StoreRefreshTokenInput = {
    userId: string;
    sessionId: string;
    refreshToken: string;
};

type RotateRefreshTokenInput = {
    userId: string;
    sessionId: string;
    oldRefreshToken: string;
    newRefreshToken: string;
};

export const storeRefreshToken = async (
    tokenData: StoreRefreshTokenInput
): Promise<void> => {
    const { userId, sessionId, refreshToken } = tokenData;

    const tokenHash = hashToken(refreshToken);

    await pool.query(
        `INSERT INTO refresh_tokens (
            user_id,
            session_id,
            token_hash,
            expires_at
        )
        VALUES ($1, $2, $3, NOW() + INTERVAL '7 days')`,
        [userId, sessionId, tokenHash]
    );
};


export const findValidRefreshToken = async (refreshToken: string) => {
    const tokenHash = hashToken(refreshToken);

    const result = await pool.query(
        `SELECT
            id,
            user_id,
            session_id,
            expires_at,
            revoked_at
        FROM refresh_tokens
        WHERE token_hash = $1
            AND revoked_at IS NULL
            AND expires_at > NOW()
        LIMIT 1`,
        [tokenHash]
    );

    return result.rows[0] ?? null;
};

export const rotateRefreshToken = async (
    tokenData: RotateRefreshTokenInput
): Promise<void> => {
    const { userId, sessionId, oldRefreshToken, newRefreshToken } = tokenData;

    const oldTokenHash = hashToken(oldRefreshToken);
    const newTokenHash = hashToken(newRefreshToken);

    const decoded = jwt.decode(newRefreshToken);

    if (
        typeof decoded !== "object" ||
        decoded === null ||
        typeof decoded.exp !== "number"
    ) {
        throw new Error("Invalid new refresh token expiration");
    }

    const expiresAt = new Date(decoded.exp * 1000);

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const result = await client.query(
            `SELECT id
            FROM refresh_tokens
            WHERE token_hash = $1
                AND user_id = $2
                AND revoked_at IS NULL
                AND expires_at > NOW()
                AND session_id = $3
            FOR UPDATE`,
            [oldTokenHash, userId, sessionId]
        );

        if (result.rowCount === 0) {
            throw new AppError(401, "Invalid or expired refresh token");
        }

        await client.query(
            `UPDATE refresh_tokens
                SET revoked_at = NOW()
            WHERE id = $1`,
            [result.rows[0].id]
        );

        await client.query(
            `INSERT INTO refresh_tokens (
                user_id,
                session_id,
                token_hash,
                expires_at
            )
            VALUES ($1, $2, $3, $4)`,
            [userId, sessionId, newTokenHash, expiresAt]
        );

        await client.query("COMMIT");
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
};


export const revokeRefreshToken = async (
    refreshToken: string
): Promise<void> => {
    const tokenHash = hashToken(refreshToken);

    await pool.query(
        `UPDATE refresh_tokens
            SET revoked_at = NOW()
        WHERE token_hash = $1
        AND revoked_at IS NULL`,
        [tokenHash]
    );
};
