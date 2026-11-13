import argon2 from "argon2";
import pool from "../config/db.js";
import { AppError } from "../utils/app-error.js";

type RegisterInput = {
    name: string;
    email: string;
    password: string;
};

export const registerUser = async (userData: RegisterInput) => {
    const { name, email, password } = userData;

    const passwordHash = await argon2.hash(password, {
        type: argon2.argon2id
    });

  try {
        const result = await pool.query(
            `INSERT INTO users (name, email, password_hash)
            VALUES ($1, $2, $3)
            RETURNING id, name, email, is_email_verified, is_active, created_at`,
            [name, email, passwordHash]
        );

        return result.rows[0];
    } catch (error: unknown) {
        if (
            typeof error === "object" &&
            error !== null &&
            "code" in error &&
            error.code === "23505"
        ) {
            throw new AppError(409, "Email address is already registered");
        }

        throw error;
    }
};