import { Router } from "express";
import { AttemptController } from "../controllers/attempt.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.js";
import { saveProgressSchema, submitAttemptSchema } from "../validations/attempt.validation.js";

export const attemptRouter = Router();

// All attempt routes require active session authentication
attemptRouter.use(authenticate);

// Start assessment session
attemptRouter.post("/start/:quizId", AttemptController.startAttempt);

// Save progressive answers (autosave)
attemptRouter.post(
  "/:attemptId/progress",
  validate({ body: saveProgressSchema }),
  AttemptController.saveProgress
);

// Submit and grade the completed assessment
attemptRouter.post(
  "/:attemptId/submit",
  validate({ body: submitAttemptSchema }),
  AttemptController.submitAttempt
);

// Retrieve detailed metrics of a finalized attempt
attemptRouter.get("/:attemptId/result", AttemptController.getAttemptResult);

// Get authenticated user's attempt history
attemptRouter.get("/history", AttemptController.listUserAttempts);
