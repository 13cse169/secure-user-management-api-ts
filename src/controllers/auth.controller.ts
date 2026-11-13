import type { Request, Response, NextFunction } from "express";
import { registerUser } from "../services/auth.service.js";
import { sendResponse } from "../utils/api-response.js";

export const register = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const user = await registerUser(req.body);

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