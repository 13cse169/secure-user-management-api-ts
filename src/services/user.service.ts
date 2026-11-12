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
