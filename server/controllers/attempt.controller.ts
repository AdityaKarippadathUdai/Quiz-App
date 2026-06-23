import { Request, Response, NextFunction } from "express";
import { AttemptService } from "../services/attempt.service.js";
import { ResponseHandler } from "../utils/responseHandler.js";
import { AppError } from "../middleware/errorMiddleware.js";

export class AttemptController {
  /**
   * Start a new assessment session
   */
  static async startAttempt(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError("Authentication is required.", 401, "UNAUTHORIZED");
      }

      const { quizId } = req.params;
      const data = await AttemptService.startAttempt(req.user.id, quizId);

      ResponseHandler.success(res, "Assessment session initiated successfully.", data);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Save progressive answers state (autosave)
   */
  static async saveProgress(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError("Authentication is required.", 401, "UNAUTHORIZED");
      }

      const { attemptId } = req.params;
      const { answers, timeSpent } = req.body;

      if (!Array.isArray(answers)) {
        throw new AppError("answers must be a valid array.", 400, "BAD_REQUEST");
      }

      const attempt = await AttemptService.saveProgress(attemptId, req.user.id, answers, timeSpent || 0);
      ResponseHandler.success(res, "Progress autosaved successfully.", { attempt });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Submit and evaluate the completed assessment
   */
  static async submitAttempt(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError("Authentication is required.", 401, "UNAUTHORIZED");
      }

      const { attemptId } = req.params;
      const { answers, timeSpent } = req.body;

      const attempt = await AttemptService.submitAttempt(attemptId, req.user.id, answers, timeSpent);
      
      // Load full quiz details for results view feedback
      const results = await AttemptService.getAttemptResult(attemptId, req.user.id);
      
      ResponseHandler.success(res, "Assessment submitted and scored successfully.", results);
    } catch (error) {
      next(error);
    }
  }

  /**
   * View detailed metrics of a completed attempt
   */
  static async getAttemptResult(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError("Authentication is required.", 401, "UNAUTHORIZED");
      }

      const { attemptId } = req.params;
      const results = await AttemptService.getAttemptResult(attemptId, req.user.id);

      ResponseHandler.success(res, "Detailed results loaded successfully.", results);
    } catch (error) {
      next(error);
    }
  }

  /**
   * List authenticated user's quiz attempt history
   */
  static async listUserAttempts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError("Authentication is required.", 401, "UNAUTHORIZED");
      }

      const attempts = await AttemptService.listUserAttempts(req.user.id);
      ResponseHandler.success(res, "Attempt history retrieved successfully.", attempts);
    } catch (error) {
      next(error);
    }
  }
}
