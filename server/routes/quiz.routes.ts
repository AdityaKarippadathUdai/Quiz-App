import { Router } from "express";
import { QuizController } from "../controllers/quiz.controller.js";
import { authenticate, requireRole } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.js";
import { UserRole } from "../models/User.js";
import { quizCreateSchema, quizUpdateSchema, publishToggleSchema } from "../validations/quiz.validation.js";

export const quizRouter = Router();

// Public/Optional Session - players listing published quizzes
// We use a custom permissive session finder so logged-in admins can also see drafts
quizRouter.get("/", (req, res, next) => {
  // If an Authorization header is provided, use standard authenticate guard, otherwise proceed as guest
  if (req.headers.authorization) {
    authenticate(req, res, next);
  } else {
    next();
  }
}, QuizController.listQuizzes);

// Read-only individual Quiz endpoint
quizRouter.get("/:id", (req, res, next) => {
  if (req.headers.authorization) {
    authenticate(req, res, next);
  } else {
    next();
  }
}, QuizController.getQuiz);

// Protected Management routes (Admin role authorized)
quizRouter.post(
  "/",
  authenticate,
  requireRole(UserRole.ADMIN),
  validate({ body: quizCreateSchema }),
  QuizController.createQuiz
);

quizRouter.put(
  "/:id",
  authenticate,
  requireRole(UserRole.ADMIN),
  validate({ body: quizUpdateSchema }),
  QuizController.updateQuiz
);

quizRouter.patch(
  "/:id/publish",
  authenticate,
  requireRole(UserRole.ADMIN),
  validate({ body: publishToggleSchema }),
  QuizController.togglePublish
);

quizRouter.delete(
  "/:id",
  authenticate,
  requireRole(UserRole.ADMIN),
  QuizController.deleteQuiz
);
