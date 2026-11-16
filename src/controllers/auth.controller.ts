import type { Request, Response, NextFunction } from "express";
import { registerUser } from "../services/auth.service.js";
import { sendVerificationEmail } from "../services/email.service.js";
import { sendResponse } from "../utils/api-response.js";
import { AppError } from "../utils/app-error.js";
import { verifyEmailToken } from "../services/email-verification.service.js";

export const register = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // Create user and verification token
        const { user, verificationToken } = await registerUser(req.body);

        // Send verification email after database commit
        try {
            await sendVerificationEmail(
                user.email,
                user.name,
                verificationToken
            );
        } catch (emailError) {
            console.error("Verification email delivery failed:", emailError);

            next(
                new AppError(
                    503,
                    "Account created, but verification email could not be sent. Please try again later."
                )
            );
            return;
        }

        // Send API response
        sendResponse(
            res,
            201,
            "Registration successful. Please verify your email.",
            user
        );

    } catch (error) {
        next(error);
    }
};

export const verifyEmail = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        await verifyEmailToken(req.body.token);

        sendResponse(
            res,
            200,
            "Email verified successfully"
        );
    } catch (error) {
        next(error);
    }
};