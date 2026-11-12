import type { RequestHandler } from "express";
import { sendResponse } from "../utils/api-response.js";

export const notFoundHandler: RequestHandler = (req, res, _next) => {
    // res.status(404).json({
    //     success: false,
    //     message: `Route not found: ${req.method} ${req.originalUrl}`
    // });

    sendResponse(res, 404, `Route not found: ${req.method} ${req.originalUrl}`);
};