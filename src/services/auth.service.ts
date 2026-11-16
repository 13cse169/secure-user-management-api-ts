import argon2 from "argon2";
import pool from "../config/db.js";
import { AppError } from "../utils/app-error.js";
import { createVerificationToken } from "./email-verification.service.js";

type RegisterInput = {
    name: string;
    email: string;
    password: string;
};

export const registerUser = async (userData: RegisterInput) => {
    const { name, email, password } = userData;

    // Hash password before opening the transaction
    const passwordHash = await argon2.hash(password, {
        type: argon2.argon2id
    });

    const client = await pool.connect();

  try {
        // const result = await pool.query(
        //     `INSERT INTO users (name, email, password_hash)
        //     VALUES ($1, $2, $3)
        //     RETURNING id, name, email, is_email_verified, is_active, created_at`,
        //     [name, email, passwordHash]
        // );

        // Start transaction
        await client.query("BEGIN");

        // Insert user
        const result = await client.query(
            `INSERT INTO users (name, email, password_hash)
            VALUES ($1, $2, $3)
            RETURNING id, name, email, is_email_verified, is_active, created_at`,
            [name, email, passwordHash]
        );

        // return result.rows[0];
        const user = result.rows[0];

        // Generate and store email verification token
        const verificationToken = await createVerificationToken(
            String(user.id),
            client
        );

        // Commit transaction
        await client.query("COMMIT");

        return {
            user,
            verificationToken
        };
    } catch (error: unknown) {
        await client.query("ROLLBACK");

        if (
            typeof error === "object" &&
            error !== null &&
            "code" in error &&
            error.code === "23505"
        ) {
            throw new AppError(409, "Email address is already registered");
        }

        throw error;
        
    } finally {
        client.release();
    }
};