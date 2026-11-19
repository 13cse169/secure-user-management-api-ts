import pool from "../config/db.js";

type CreateSessionInput = {
    userId: string;
    expiresAt: Date;
    userAgent?: string;
    ipAddress?: string;
};

export const createSession = async (
    sessionData: CreateSessionInput
): Promise<string> => {
    const {
        userId,
        expiresAt,
        userAgent,
        ipAddress
    } = sessionData;

    const result = await pool.query(
        `INSERT INTO user_sessions (
            user_id,
            expires_at,
            user_agent,
            ip_address
        )
        VALUES ($1, $2, $3, $4)
        RETURNING id`,
        [
            userId,
            expiresAt,
            userAgent ?? null,
            ipAddress ?? null
        ]
    );

    return String(result.rows[0].id);
};

export const validateActiveSession = async (
    userId: string,
    sessionId: string
): Promise<boolean> => {

    const result = await pool.query(
        `UPDATE user_sessions
        SET last_used_at = NOW()
        WHERE id = $1
           AND user_id = $2
           AND revoked_at IS NULL
           AND expires_at > NOW()
        RETURNING id`,
        [sessionId, userId]
    );

    return result.rowCount !== null && result.rowCount > 0;
};