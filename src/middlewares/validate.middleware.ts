import type { RequestHandler } from "express";
import type { ZodType } from "zod";
import { sendResponse } from "../utils/api-response.js";

export const validate = (schema: ZodType): RequestHandler => {
    return (req, res, next) => {
        const result = schema.safeParse(req.body);

        if (!result.success) {
            const errors = result.error.issues.map((issue) => ({
                field: issue.path.join("."),
                message: issue.message
            }));

            sendResponse(res, 400, "Validation failed", errors);

            return;
        }

        req.body = result.data;

        next();
    };
};