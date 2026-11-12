import type { Response } from "express";

type ApiResponse<T> = {
    success: boolean;
    message: string;
    data: T | null;
};

export const sendResponse = <T>(
    res: Response,
    statusCode: number,
    message: string,
    data: T | null = null
): void => {
    const response: ApiResponse<T> = {
        success: statusCode < 400,
        message,
        data
    };

    res.status(statusCode).json(response);
};