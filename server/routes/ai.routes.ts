import { Router } from "express";
import { AIController } from "../controllers/ai.controller.js";
import { authenticate, requireRole } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.js";
import { UserRole } from "../models/User.js";
import { aiGenerateSchema, aiSaveSchema } from "../validations/ai.validation.js";

export const aiRouter = Router();

// Secure all AI routes for admins only
aiRouter.use(authenticate);
aiRouter.use(requireRole(UserRole.ADMIN));

// POST /api/v1/ai/generate - Generates questions
aiRouter.post(
  "/generate",
  validate({ body: aiGenerateSchema }),
  AIController.generateQuestions
);

// POST /api/v1/ai/save - Saves final reviewed quiz
aiRouter.post(
  "/save",
  validate({ body: aiSaveSchema }),
  AIController.saveQuiz
);
