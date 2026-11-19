import type { Request, Response, NextFunction } from "express";
import { getAllUsers, getUserById } from "../services/user.service.js";
import { sendResponse } from "../utils/api-response.js";
import { AppError } from "../utils/app-error.js";

export const getUsers = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const users = await getAllUsers();

        sendResponse(
            res,
            200,
            "Users fetched successfully",
            users
        );
    } catch (error) {
        next(error);
    }
};

export const getMyProfile = async (
    _req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const userId = res.locals.userId as string;

        const user = await getUserById(userId);

        if (!user) {
            throw new AppError(404, "User not found");
        }

        sendResponse(res, 200, "Profile fetched successfully", user);
    } catch (error) {
        next(error);
    }
};