import pool from "../config/db.js";
import type { User } from "../types/user.types.js";

export const getAllUsers = async (): Promise<User[]> => {
    const result = await pool.query<User>(
        `SELECT
            id,
            name,
            email,
            is_email_verified,
            is_active,
            created_at,
            updated_at
        FROM users
        ORDER BY id ASC`
    );

    return result.rows;
};

export const getUserByEmail = async (email: string) => {
    const result = await pool.query(
        `SELECT
            id,
            name,
            email,
            password_hash,
            is_email_verified,
            is_active
        FROM users
        WHERE LOWER(email) = LOWER($1)
        LIMIT 1`,
        [email]
    );

    return result.rows[0] ?? null;
};

export const getUserById = async (userId: string) => {
    const result = await pool.query(
        `SELECT
            id,
            name,
            email,
            is_email_verified,
            is_active,
            created_at,
            updated_at
        FROM users
        WHERE id = $1
        LIMIT 1`,
        [userId]
    );

    return result.rows[0] ?? null;
};

export const getUserAuthStatus = async (userId: string) => {
    const result = await pool.query(
        `SELECT is_active, is_email_verified FROM users WHERE id = $1 LIMIT 1`,
        [userId]
    );

    return result.rows[0] ?? null;
};
