import { Router } from "express";
import { AnalyticsController } from "../controllers/analytics.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

export const analyticsRouter = Router();

// Secure all analytics routes under authenticated user sessions
analyticsRouter.use(authenticate);

// Global Leaderboard endpoint
analyticsRouter.get("/leaderboard/global", AnalyticsController.getGlobalLeaderboard);

// Quiz Specific Leaderboard endpoint
analyticsRouter.get("/leaderboard/quiz/:quizId", AnalyticsController.getQuizLeaderboard);

// Platform level dashboard aggregate stats endpoint (useful for charts)
analyticsRouter.get("/dashboard", AnalyticsController.getDashboardMetrics);

// User specific analytics
analyticsRouter.get("/user", AnalyticsController.getUserAnalytics);
