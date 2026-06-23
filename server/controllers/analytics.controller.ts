import { Request, Response, NextFunction } from "express";
import { AnalyticsService } from "../services/analytics.service.js";
import { ResponseHandler } from "../utils/responseHandler.js";
import { getOrSetCache } from "../utils/redis.js";

export class AnalyticsController {
  /**
   * Get global user ranking leaderboard
   */
  static async getGlobalLeaderboard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
      
      const cacheKey = `leaderboard:global:${limit}`;
      const leaderboard = await getOrSetCache(cacheKey, async () => {
        return AnalyticsService.getGlobalLeaderboard(limit);
      }, 60); // cache for 1 minute

      ResponseHandler.success(res, "Global leaderboard retrieved successfully", leaderboard);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get scoreboard ranking leaderboard for a specific quiz
   */
  static async getQuizLeaderboard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { quizId } = req.params;
      if (!quizId) {
        res.status(400).json({ success: false, message: "quizId parameter is required" });
        return;
      }

      const cacheKey = `leaderboard:quiz:${quizId}`;
      const data = await getOrSetCache(cacheKey, async () => {
        return AnalyticsService.getQuizLeaderboard(quizId);
      }, 60); // cache for 1 minute

      ResponseHandler.success(res, "Quiz ranking leaderboard retrieved successfully", data);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get main platform analytics metrics dashboard (Admin or general, depending on context)
   */
  static async getDashboardMetrics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await AnalyticsService.getDashboardMetrics();
      ResponseHandler.success(res, "Dashboard analytics metrics retrieved successfully", data);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get specific user performance trends & metric summary
   */
  static async getUserAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Allow logged-in user to see their own, or admin to see target userId
      const targetUserId = req.query.userId ? (req.query.userId as string) : req.user?._id?.toString();
      
      if (!targetUserId) {
        res.status(401).json({ success: false, message: "User context not established." });
        return;
      }

      const data = await AnalyticsService.getUserAnalytics(targetUserId);
      ResponseHandler.success(res, "User performance analytics retrieved successfully", data);
    } catch (error) {
      next(error);
    }
  }
}
