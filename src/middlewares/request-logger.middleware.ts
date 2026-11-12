import type { RequestHandler } from "express";

export const requestLogger: RequestHandler = (req, res, next) => {
    console.log(`${req.method} ${req.originalUrl} - ${new Date().toDateString()}`);
    next();
};