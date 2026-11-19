import argon2 from "argon2";
import pool from "../config/db.js";
import { AppError } from "../utils/app-error.js";
import { getUserByEmail } from "./user.service.js";
import { createSession, validateActiveSession } from "./session.service.js";
import { getUserAuthStatus } from "./user.service.js";
import { createVerificationToken } from "./email-verification.service.js";

import {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken
} from "./jwt.service.js";

import {
    findValidRefreshToken,
    rotateRefreshToken,
    storeRefreshToken
} from "./refresh-token.service.js";

type RegisterInput = {
    name: string;
    email: string;
    password: string;
};

type LoginInput = {
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

export const loginUser = async (loginData: LoginInput) => {
    const { email, password } = loginData;

    // 1. Find user
    const user = await getUserByEmail(email);

    if (!user) {
        throw new AppError(401, "Invalid email or password");
    }

    // 2. Check account status
    if (!user.is_active) {
        throw new AppError(403, "Your account is inactive");
    }

    if (!user.is_email_verified) {
        throw new AppError(403, "Please verify your email before logging in");
    }

    // 3. Verify password
    const isPasswordValid = await argon2.verify(
        user.password_hash,
        password
    );

    if (!isPasswordValid) {
        throw new AppError(401, "Invalid email or password");
    }

    // 4. Calculate session expiry (7 days)
    const expiresAt = new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000
    );

    // 5. Create a new login session
    const sessionId = await createSession({
        userId: user.id,
        expiresAt
    });

    // 6. Generate tokens with session ID
    const accessToken = generateAccessToken(user.id, sessionId);

    const refreshToken = generateRefreshToken(user.id, sessionId);

    // 7. Store refresh token with session ID
    await storeRefreshToken({
        userId: user.id,
        sessionId,
        refreshToken
    });

    // 8. Return safe user information
    return {
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            is_email_verified: user.is_email_verified,
            is_active: user.is_active
        },
        accessToken,
        refreshToken
    };
};

export const refreshUserTokens = async (refreshToken: string) => {
    // 1. Verify refresh JWT
    let decoded: {
        userId: string;
        sessionId: string;
    };

    try {
        decoded = verifyRefreshToken(refreshToken);
    } catch {
        throw new AppError(401, "Invalid or expired refresh token");
    }

    // 2. Check refresh token in PostgreSQL
    const storedToken = await findValidRefreshToken(refreshToken);

    if (!storedToken || String(storedToken.user_id) !== decoded.userId) {
        throw new AppError(401, "Invalid or expired refresh token");
    }

    // 3. Check current user status
    const user = await getUserAuthStatus(decoded.userId);

    const isSessionActive = await validateActiveSession(
        decoded.userId,
        decoded.sessionId
    );

    if (!isSessionActive) {
        throw new AppError(401, "Session has expired or been revoked");
    }

    if (!user) {
        throw new AppError(401, "User account not found");
    }

    if (!user.is_active) {
        throw new AppError(403, "Your account is inactive");
    }

    if (!user.is_email_verified) {
        throw new AppError(403, "Please verify your email first");
    }

    // 4. Generate new tokens
    const newAccessToken = generateAccessToken(
        decoded.userId,
        decoded.sessionId
    );
    const newRefreshToken = generateRefreshToken(
        decoded.userId,
        decoded.sessionId
    );

    // 5. Rotate the refresh token
    await rotateRefreshToken({
        userId: decoded.userId,
        sessionId: decoded.sessionId,
        oldRefreshToken: refreshToken,
        newRefreshToken
    });

    // 6. Return new tokens
    return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
    };
};

export const logoutUser = async (refreshToken: string): Promise<void> => {
    // 1. Verify refresh token
    let decoded: { userId: string; sessionId: string };

    try {
        decoded = verifyRefreshToken(refreshToken);
    } catch {
        throw new AppError(401, "Invalid or expired refresh token");
    }

    // 2. Find the refresh token in the database
    const storedToken = await findValidRefreshToken(refreshToken);

    if (
        !storedToken ||
        String(storedToken.user_id) !== decoded.userId ||
        String(storedToken.session_id) !== decoded.sessionId
    ) {
        throw new AppError(401, "Invalid or expired refresh token");
    }

    // 3. Start database transaction
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        // 4. Revoke the current login session
        const sessionResult = await client.query(
            `UPDATE user_sessions
            SET revoked_at = NOW()
            WHERE id = $1
               AND user_id = $2
               AND revoked_at IS NULL
               AND expires_at > NOW()
            RETURNING id`,
            [decoded.sessionId, decoded.userId]
        );

        if (sessionResult.rowCount === 0) {
            throw new AppError(401, "Session has expired or been revoked");
        }

        // 5. Revoke all refresh tokens belonging to this session
        await client.query(
            `UPDATE refresh_tokens
            SET revoked_at = NOW()
            WHERE session_id = $1
               AND revoked_at IS NULL`,
            [decoded.sessionId]
        );

        // 6. Save database changes
        await client.query("COMMIT");

    } catch (error) {
        await client.query("ROLLBACK");
        throw error;

    } finally {
        client.release();
    }
};