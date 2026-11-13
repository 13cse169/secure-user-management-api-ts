import type { Request, Response, NextFunction } from "express";
import { getAllUsers } from "../services/user.service.js";
import { sendResponse } from "../utils/api-response.js";

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