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

/*
1. Why async?
    Because our database query takes time to execute.

2. Why await getAllUsers()?
    It waits for PostgreSQL to return the records before sending the response.

3. Why try/catch?
    Database operations can fail. For example:
        - Database server is unavailable.
        - Connection pool is exhausted.
        - SQL query contains an error.

4. Why next(error)?
    It forwards the error to our existing global error-handling middleware. We don't need to format database errors separately in every controller.
*/