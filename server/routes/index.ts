import { Router } from "express";
import { ResponseHandler } from "../utils/responseHandler.js";

export const apiRouter = Router();

// Platform healthcheck
apiRouter.get("/health", (req, res) => {
  ResponseHandler.success(res, "Quiz Platform Core API is healthy and operational", {
    version: "1.0.0",
    uptime: process.uptime(),
  });
});

// Admin-only metrics health check
apiRouter.get("/admin/ping", (req, res) => {
  ResponseHandler.success(res, "Admin sub-system pong", { role: "ADMIN" });
});
