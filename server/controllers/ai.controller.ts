import { Request, Response, NextFunction } from "express";
import { AIService } from "../services/ai.service.js";
import { QuizService } from "../services/quiz.service.js";
import { ResponseHandler } from "../utils/responseHandler.js";
import { AppError } from "../middleware/errorMiddleware.js";
import { QuizDifficulty } from "../models/Quiz.js";

export class AIController {
  /**
   * Generates quiz questions using Gemini API
   */
  static async generateQuestions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { topic, difficulty, numQuestions } = req.body;

      if (!topic) {
        throw new AppError("Topic is required to generate a quiz.", 400, "MISSING_TOPIC");
      }

      console.log(`[AIController] Generating ${numQuestions} questions for topic: "${topic}" (Difficulty: ${difficulty})`);
      
      const generationResult = await AIService.generateQuizQuestions(
        topic,
        difficulty || QuizDifficulty.MEDIUM,
        numQuestions || 5
      );

      ResponseHandler.success(
        res,
        "Quiz questions generated successfully using Gemini API",
        generationResult
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Saves a generated quiz after final review
   */
  static async saveQuiz(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { title, description, category, difficulty, timeLimit, negativeMarking, questions, isPublished } = req.body;
      const userId = (req as any).user?.id;

      if (!userId) {
        throw new AppError("Authentication required to save quiz.", 401, "UNAUTHORIZED_SAVE");
      }

      if (!questions || !Array.isArray(questions) || questions.length === 0) {
        throw new AppError("A quiz must contain at least one question.", 400, "QUIZ_WITHOUT_QUESTIONS");
      }

      // Map AI questions format (answer) to Mongoose schema format (correctAnswer)
      const mappedQuestions = questions.map((q: any, index: number) => {
        const ans = q.answer || q.correctAnswer;
        if (!ans) {
          throw new AppError(`Question at index ${index} is missing a correct answer choice.`, 400, "INVALID_QUESTION_DATA");
        }
        return {
          question: q.question,
          options: q.options,
          correctAnswer: ans,
          explanation: q.explanation || "",
          marks: q.marks || 1,
        };
      });

      const quizPayload = {
        title,
        description,
        category,
        difficulty: difficulty || QuizDifficulty.MEDIUM,
        timeLimit: timeLimit || 15,
        negativeMarking: !!negativeMarking,
        isPublished: !!isPublished,
        questions: mappedQuestions,
      };

      console.log(`[AIController] Creating new quiz from AI generation titled: "${title}" for creator ${userId}`);
      const savedQuiz = await QuizService.createQuiz(quizPayload as any, userId);

      ResponseHandler.created(
        res,
        "AI generated quiz has been saved successfully.",
        savedQuiz
      );
    } catch (error) {
      next(error);
    }
  }
}
