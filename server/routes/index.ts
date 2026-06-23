import { Router } from "express";
import { ResponseHandler } from "../utils/responseHandler.js";
import { authRouter } from "./auth.routes.js";
import { quizRouter } from "./quiz.routes.js";
import { attemptRouter } from "./attempt.routes.js";

export const apiRouter = Router();

// Platform healthcheck
apiRouter.get("/health", (req, res) => {
  ResponseHandler.success(res, "Quiz Platform Core API is healthy and operational", {
    version: "1.0.0",
    uptime: process.uptime(),
  });
});

// Register Module Routes
apiRouter.use("/auth", authRouter);
apiRouter.use("/quizzes", quizRouter);
apiRouter.use("/attempts", attemptRouter);

// Admin-only metrics health check
apiRouter.get("/admin/ping", (req, res) => {
  ResponseHandler.success(res, "Admin sub-system pong", { role: "ADMIN" });
});

