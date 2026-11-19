import jwt from "jsonwebtoken";
import { jwtConfig } from "../config/jwt.js";

type TokenPayload = {
    userId: string;
    sessionId: string;
};

export const generateAccessToken = (
    userId: string,
    sessionId: string
): string => {
    return jwt.sign(
        { userId, sessionId } satisfies TokenPayload,
        jwtConfig.accessTokenSecret,
        {
            expiresIn: jwtConfig.accessTokenExpiresIn as jwt.SignOptions["expiresIn"]
        }
    );
};

export const generateRefreshToken = (
    userId: string,
    sessionId: string
): string => {
    return jwt.sign(
        { userId, sessionId } satisfies TokenPayload,
        jwtConfig.refreshTokenSecret,
        {
            expiresIn: jwtConfig.refreshTokenExpiresIn as jwt.SignOptions["expiresIn"]
        }
    );
};

export const verifyAccessToken = (
    token: string
): TokenPayload => {
    const decoded = jwt.verify(token, jwtConfig.accessTokenSecret);

    if (
        typeof decoded === "string" ||
        typeof decoded.userId !== "string" ||
        typeof decoded.sessionId !== "string"
    ) {
        throw new Error("Invalid access token");
    }

    return {
        userId: decoded.userId,
        sessionId: decoded.sessionId
    };
};

export const verifyRefreshToken = (
    token: string
): TokenPayload => {
    const decoded = jwt.verify(token, jwtConfig.refreshTokenSecret);

    if (
        typeof decoded === "string" ||
        typeof decoded.userId !== "string" ||
        typeof decoded.sessionId !== "string"
    ) {
        throw new Error("Invalid refresh token");
    }

    return {
        userId: decoded.userId,
        sessionId: decoded.sessionId
    };
};
