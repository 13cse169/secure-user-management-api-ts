import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../utils/app-error.js";
import { verifyAccessToken } from "../services/jwt.service.js";
import { getUserAuthStatus } from "../services/user.service.js";
import { validateActiveSession } from "../services/session.service.js";

export const authenticate: RequestHandler = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new AppError(401, "Access token is required");
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            throw new AppError(401, "Access token is required");
        }

        let decoded: { userId: string; sessionId: string };

        try {
            decoded = verifyAccessToken(token);
        } catch (error) {
            if (
                error instanceof jwt.TokenExpiredError ||
                error instanceof jwt.JsonWebTokenError ||
                error instanceof jwt.NotBeforeError
            ) {
                throw new AppError(401, "Invalid or expired access token");
            }

            throw error;
        }

        // Check whether the user exists and is active
        const user = await getUserAuthStatus(decoded.userId);

        if (!user) {
            throw new AppError(401, "User account not found");
        }

        if (!user.is_active) {
            throw new AppError(403, "Your account is inactive");
        }

        if (!user.is_email_verified) {
            throw new AppError(
                403,
                "Please verify your email before accessing this resource"
            );
        }

        // Check whether the login session is active
        const isSessionActive = await validateActiveSession(
            decoded.userId,
            decoded.sessionId
        );

        if (!isSessionActive) {
            throw new AppError(401, "Session has expired or been revoked");
        }

        res.locals.userId = decoded.userId;
        res.locals.sessionId = decoded.sessionId;

        next();

    } catch (error) {
        next(error);
    }
};