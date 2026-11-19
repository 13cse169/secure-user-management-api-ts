import express from "express";

import healthRouter from "./routes/health.routes.js";
import userRouter from "./routes/user.routes.js";
import authRouter from "./routes/auth/auth.routes.js";

import { requestLogger } from "./middlewares/request-logger.middleware.js";
import { notFoundHandler } from "./middlewares/not-found.middleware.js";
import { errorHandler } from "./middlewares/error-handler.middleware.js";

const app = express();

// Parse incoming JSON
app.use(express.json());

// Log incoming requests
app.use(requestLogger);

// Register API routes
app.use("/api/health", healthRouter);
app.use("/api/users", userRouter);
app.use("/api/auth", authRouter);

// Handle unknown routes
app.use(notFoundHandler);

// Handle errors
app.use(errorHandler);

export default app;