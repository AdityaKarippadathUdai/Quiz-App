import { QuizRepository } from "../repositories/quiz.repository.js";
import { IQuiz } from "../models/Quiz.js";
import { AppError } from "../middleware/errorMiddleware.js";

export class QuizService {
  /**
   * Create a new quiz
   */
  static async createQuiz(quizData: Partial<IQuiz>, userId: string): Promise<IQuiz> {
    if (!quizData.questions || quizData.questions.length === 0) {
      throw new AppError("A quiz must contain at least one question.", 400, "QUIZ_WITHOUT_QUESTIONS");
    }

    // Validate that correct answer is one of the choices
    for (const q of quizData.questions) {
      if (!q.options.includes(q.correctAnswer)) {
        throw new AppError(
          `Correct answer "${q.correctAnswer}" must be one of the listed options: [${q.options.join(", ")}]`,
          400,
          "INVALID_CORRECT_ANSWER"
        );
      }
    }

    const payload = {
      ...quizData,
      createdBy: userId as any,
    };

    return QuizRepository.create(payload);
  }

  /**
   * Update an existing quiz
   */
  static async updateQuiz(id: string, updateData: Partial<IQuiz>, userId: string, userRole: string): Promise<IQuiz> {
    const existingQuiz = await QuizRepository.findById(id);
    if (!existingQuiz) {
      throw new AppError("Quiz not found.", 404, "QUIZ_NOT_FOUND");
    }

    // Auth validation: Only creator or admin can update
    if (userRole !== "ADMIN" && existingQuiz.createdBy.toString() !== userId) {
      throw new AppError("You are not authorized to update this quiz.", 403, "UNAUTHORIZED_QUIZ_EDIT");
    }

    if (updateData.questions) {
      if (updateData.questions.length === 0) {
        throw new AppError("A quiz must contain at least one question.", 400, "QUIZ_WITHOUT_QUESTIONS");
      }

      for (const q of updateData.questions) {
        if (!q.options.includes(q.correctAnswer)) {
          throw new AppError(
            `Correct answer "${q.correctAnswer}" must be one of the listed options: [${q.options.join(", ")}]`,
            400,
            "INVALID_CORRECT_ANSWER"
          );
        }
      }
    }

    const updatedQuiz = await QuizRepository.update(id, updateData);
    if (!updatedQuiz) {
      throw new AppError("Quiz update failed.", 500, "QUIZ_UPDATE_FAILED");
    }

    return updatedQuiz;
  }

  /**
   * Toggle Quiz Publishing Status
   */
  static async togglePublishStatus(id: string, isPublished: boolean, userId: string, userRole: string): Promise<IQuiz> {
    const existingQuiz = await QuizRepository.findById(id);
    if (!existingQuiz) {
      throw new AppError("Quiz not found.", 404, "QUIZ_NOT_FOUND");
    }

    if (userRole !== "ADMIN" && existingQuiz.createdBy.toString() !== userId) {
      throw new AppError("You are not authorized to publish/unpublish this quiz.", 403, "UNAUTHORIZED_QUIZ_STATE_CHANGE");
    }

    const updatedQuiz = await QuizRepository.update(id, { isPublished });
    if (!updatedQuiz) {
      throw new AppError("Publish status update failed.", 500, "QUIZ_UPDATE_FAILED");
    }

    return updatedQuiz;
  }

  /**
   * Delete an existing quiz
   */
  static async deleteQuiz(id: string, userId: string, userRole: string): Promise<void> {
    const existingQuiz = await QuizRepository.findById(id);
    if (!existingQuiz) {
      throw new AppError("Quiz not found.", 404, "QUIZ_NOT_FOUND");
    }

    if (userRole !== "ADMIN" && existingQuiz.createdBy.toString() !== userId) {
      throw new AppError("You are not authorized to delete this quiz.", 403, "UNAUTHORIZED_QUIZ_DELETION");
    }

    await QuizRepository.delete(id);
  }

  /**
   * Get single quiz details
   */
  static async getQuizById(id: string): Promise<IQuiz> {
    const quiz = await QuizRepository.findById(id);
    if (!quiz) {
      throw new AppError("Quiz not found.", 404, "QUIZ_NOT_FOUND");
    }
    return quiz;
  }

  /**
   * Get filtered quizzes list
   */
  static async listQuizzes(
    filters: { category?: string; difficulty?: string; isPublished?: boolean; search?: string },
    page: number,
    limit: number
  ): Promise<{ quizzes: IQuiz[]; total: number }> {
    return QuizRepository.findAll(filters, page, limit);
  }
}
