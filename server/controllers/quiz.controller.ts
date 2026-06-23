import { Request, Response, NextFunction } from "express";
import { QuizService } from "../services/quiz.service.js";
import { ResponseHandler } from "../utils/responseHandler.js";
import { AppError } from "../middleware/errorMiddleware.js";
import { getOrSetCache, invalidateCachePattern } from "../utils/redis.js";
import { broadcastNotification } from "../utils/socket.js";

export class QuizController {
  /**
   * Create a new quiz (Admin and authorized users)
   */
  static async createQuiz(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError("Authentication required.", 401, "UNAUTHORIZED");
      }

      const quiz = await QuizService.createQuiz(req.body, req.user.id);
      
      // Invalidate existing quizzes caches
      await invalidateCachePattern("quizzes:*");

      if (quiz.isPublished) {
        broadcastNotification(
          "New Quiz Alert! 🎯",
          `"${quiz.title}" is now live! Attempt it now in the dashboard.`,
          "success"
        );
      }

      ResponseHandler.created(res, "Quiz created successfully.", { quiz });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update quiz configuration and questions
   */
  static async updateQuiz(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError("Authentication required.", 401, "UNAUTHORIZED");
      }

      const { id } = req.params;
      const quiz = await QuizService.updateQuiz(id, req.body, req.user.id, req.user.role);

      // Invalidate cache for quizzes and this specific quiz
      await invalidateCachePattern("quizzes:*");
      await invalidateCachePattern(`quiz:${id}`);

      ResponseHandler.success(res, "Quiz updated successfully.", { quiz });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Publish or Unpublish quiz state
   */
  static async togglePublish(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError("Authentication required.", 401, "UNAUTHORIZED");
      }

      const { id } = req.params;
      const { isPublished } = req.body;

      if (typeof isPublished !== "boolean") {
        throw new AppError("isPublished boolean value is required in the body.", 400, "BAD_REQUEST");
      }

      const quiz = await QuizService.togglePublishStatus(id, isPublished, req.user.id, req.user.role);
      
      // Invalidate cache for quizzes
      await invalidateCachePattern("quizzes:*");
      await invalidateCachePattern(`quiz:${id}`);

      if (isPublished) {
        broadcastNotification(
          "New Quiz Published! 🚀",
          `Challenge yourself with "${quiz.title}". Tap to start now!`,
          "success"
        );
      }

      const message = isPublished ? "Quiz published successfully." : "Quiz unpublished successfully.";
      ResponseHandler.success(res, message, { quiz });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete quiz from database
   */
  static async deleteQuiz(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError("Authentication required.", 401, "UNAUTHORIZED");
      }

      const { id } = req.params;
      await QuizService.deleteQuiz(id, req.user.id, req.user.role);

      // Invalidate caches
      await invalidateCachePattern("quizzes:*");
      await invalidateCachePattern(`quiz:${id}`);

      ResponseHandler.success(res, "Quiz deleted successfully.");
    } catch (error) {
      next(error);
    }
  }

  /**
   * Fetch single quiz details
   */
  static async getQuiz(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      
      // Use Redis caching for the quiz details
      const quiz = await getOrSetCache(`quiz:${id}`, async () => {
        return QuizService.getQuizById(id);
      }, 600); // cache for 10 minutes

      // If the quiz isn't published yet and requester is not admin or the creator
      if (!quiz.isPublished) {
        const userId = req.user?.id;
        const userRole = req.user?.role;
        if (userRole !== "ADMIN" && quiz.createdBy.toString() !== userId) {
          throw new AppError("You are not authorized to view this draft quiz.", 403, "QUIZ_DRAFT_RESTRICTED");
        }
      }

      ResponseHandler.success(res, "Quiz retrieved successfully.", { quiz });
    } catch (error) {
      next(error);
    }
  }

  /**
   * List all available quizzes with custom query parameters
   */
  static async listQuizzes(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 10;
      const category = req.query.category as string || "";
      const difficulty = req.query.difficulty as string || "";
      const search = req.query.search as string || "";

      // Regular players can only list published quizzes. Admins/Creators can see all.
      const showAll = req.user?.role === "ADMIN";
      const isPublished = showAll ? undefined : true;

      const cacheKey = `quizzes:cat=${category}:diff=${difficulty}:pub=${isPublished !== undefined ? isPublished : "all"}:search=${search}:p=${page}:l=${limit}`;

      const cachedResult = await getOrSetCache(cacheKey, async () => {
        const { quizzes, total } = await QuizService.listQuizzes(
          { category, difficulty, isPublished, search },
          page,
          limit
        );
        return { quizzes, total };
      }, 120); // Cache lists for 2 minutes

      ResponseHandler.success(res, "Quizzes list loaded successfully.", cachedResult.quizzes, 200, {
        page,
        limit,
        total: cachedResult.total,
      });
    } catch (error) {
      next(error);
    }
  }
}
