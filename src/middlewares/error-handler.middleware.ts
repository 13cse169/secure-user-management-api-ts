import type { ErrorRequestHandler } from "express";
import { AppError } from "../utils/app-error.js";
import { sendResponse } from "../utils/api-response.js";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
    console.error(err);

    if (res.headersSent) return;

    if (err instanceof AppError) {
        sendResponse(res, err.statusCode, err.message);
        return;
    }

    sendResponse(res, 500, "Internal server error");
};