import { AttemptRepository } from "../repositories/attempt.repository.js";
import { QuizRepository } from "../repositories/quiz.repository.js";
import { AttemptStatus, IAttempt } from "../models/Attempt.js";
import { AppError } from "../middleware/errorMiddleware.js";

export class AttemptService {
  /**
   * Start a new quiz attempt or resume an active one
   */
  static async startAttempt(userId: string, quizId: string): Promise<{ attempt: IAttempt; quiz: any }> {
    const quiz = await QuizRepository.findById(quizId);
    if (!quiz) {
      throw new AppError("Quiz not found.", 404, "QUIZ_NOT_FOUND");
    }

    if (!quiz.isPublished) {
      throw new AppError("This quiz is currently in draft and cannot be attempted.", 400, "QUIZ_NOT_PUBLISHED");
    }

    // Check for an active, unfinished attempt to auto-resume
    let attempt = await AttemptRepository.findActiveAttempt(userId, quizId);
    
    if (!attempt) {
      // Create new attempt
      attempt = await AttemptRepository.create({
        user: userId as any,
        quiz: quizId as any,
        status: AttemptStatus.STARTED,
        answers: [],
        timeSpent: 0,
        score: 0,
        startedAt: new Date(),
      });
    }

    // Strip correct answers & explanations to prevent client-side inspection cheating
    const quizObj = quiz.toObject ? quiz.toObject() : JSON.parse(JSON.stringify(quiz));
    const sanitizedQuestions = quizObj.questions.map((q: any) => {
      const { correctAnswer, explanation, ...rest } = q;
      return rest;
    });

    const sanitizedQuiz = {
      ...quizObj,
      questions: sanitizedQuestions,
    };

    return { attempt, quiz: sanitizedQuiz };
  }

  /**
   * Auto-save quiz progress (answers and time spent)
   */
  static async saveProgress(
    attemptId: string,
    userId: string,
    answers: { questionId: string; selectedOption: string }[],
    timeSpent: number
  ): Promise<IAttempt> {
    const attempt = await AttemptRepository.findById(attemptId);
    if (!attempt) {
      throw new AppError("Quiz attempt not found.", 404, "ATTEMPT_NOT_FOUND");
    }

    if (attempt.user._id.toString() !== userId) {
      throw new AppError("You are not authorized to edit this attempt.", 403, "UNAUTHORIZED_ATTEMPT_EDIT");
    }

    if (attempt.status === AttemptStatus.COMPLETED) {
      throw new AppError("This assessment has already been submitted and finalized.", 400, "ATTEMPT_ALREADY_COMPLETED");
    }

    // Update answers format with timestamp
    const formattedAnswers = answers.map((ans) => ({
      questionId: ans.questionId,
      selectedOption: ans.selectedOption,
      savedAt: new Date(),
    }));

    const updated = await AttemptRepository.update(attemptId, {
      answers: formattedAnswers,
      timeSpent,
    });

    if (!updated) {
      throw new AppError("Failed to auto-save progress.", 500, "SAVE_FAILED");
    }

    return updated;
  }

  /**
   * Submit quiz attempt, calculate score, evaluate performance and finalize
   */
  static async submitAttempt(
    attemptId: string,
    userId: string,
    answers?: { questionId: string; selectedOption: string }[],
    timeSpent?: number
  ): Promise<IAttempt> {
    const attempt = await AttemptRepository.findById(attemptId);
    if (!attempt) {
      throw new AppError("Quiz attempt not found.", 404, "ATTEMPT_NOT_FOUND");
    }

    if (attempt.user._id.toString() !== userId) {
      throw new AppError("You are not authorized to submit this attempt.", 403, "UNAUTHORIZED_ATTEMPT_SUBMISSION");
    }

    if (attempt.status === AttemptStatus.COMPLETED) {
      return attempt; // Already submitted, return results
    }

    // Save final state if provided in submission request payload
    let currentAnswers = attempt.answers;
    let currentTimeSpent = attempt.timeSpent;

    if (answers) {
      const formattedAnswers = answers.map((ans) => ({
        questionId: ans.questionId,
        selectedOption: ans.selectedOption,
        savedAt: new Date(),
      }));
      currentAnswers = formattedAnswers as any;
    }
    if (typeof timeSpent === "number") {
      currentTimeSpent = timeSpent;
    }

    // Calculate score, checking against the full Quiz model with answers
    const quiz = await QuizRepository.findById(attempt.quiz.toString());
    if (!quiz) {
      throw new AppError("Associated quiz not found.", 404, "QUIZ_NOT_FOUND");
    }

    let correctCount = 0;
    let incorrectCount = 0;
    let totalScore = 0;
    let totalMarks = 0;

    const quizQuestions = quiz.questions;

    for (const question of quizQuestions) {
      const qId = (question as any)._id ? (question as any)._id.toString() : "";
      totalMarks += question.marks;

      const userAns = currentAnswers.find((a) => a.questionId === qId);

      if (userAns && userAns.selectedOption) {
        if (userAns.selectedOption.trim() === question.correctAnswer.trim()) {
          correctCount++;
          totalScore += question.marks;
        } else {
          incorrectCount++;
          if (quiz.negativeMarking) {
            totalScore -= 0.25 * question.marks; // 1/4 marks negative penalty
          }
        }
      }
    }

    // Keep score non-negative
    if (totalScore < 0) {
      totalScore = 0;
    }

    // Round score to 2 decimal places
    totalScore = Math.round(totalScore * 100) / 100;

    const updated = await AttemptRepository.update(attemptId, {
      answers: currentAnswers,
      timeSpent: currentTimeSpent,
      score: totalScore,
      correctAnswersCount: correctCount,
      incorrectAnswersCount: incorrectCount,
      totalMarks,
      status: AttemptStatus.COMPLETED,
      completedAt: new Date(),
    });

    if (!updated) {
      throw new AppError("Failed to finalize assessment submission.", 500, "SUBMISSION_FAILED");
    }

    return updated;
  }

  /**
   * Get attempt metrics & detailed response feedback (including correct answers & explanations)
   */
  static async getAttemptResult(attemptId: string, userId: string): Promise<{ attempt: IAttempt; quiz: any }> {
    const attempt = await AttemptRepository.findById(attemptId);
    if (!attempt) {
      throw new AppError("Quiz attempt not found.", 404, "ATTEMPT_NOT_FOUND");
    }

    if (attempt.user._id.toString() !== userId) {
      throw new AppError("You are not authorized to view this result.", 403, "UNAUTHORIZED_VIEW");
    }

    const quiz = await QuizRepository.findById(attempt.quiz._id.toString());
    if (!quiz) {
      throw new AppError("Associated quiz not found.", 404, "QUIZ_NOT_FOUND");
    }

    if (attempt.status === AttemptStatus.STARTED) {
      // Strip correct answers & explanations to prevent client-side inspection cheating on reload
      const quizObj = quiz.toObject ? quiz.toObject() : JSON.parse(JSON.stringify(quiz));
      const sanitizedQuestions = quizObj.questions.map((q: any) => {
        const { correctAnswer, explanation, ...rest } = q;
        return rest;
      });
      const sanitizedQuiz = {
        ...quizObj,
        questions: sanitizedQuestions,
      };
      return { attempt, quiz: sanitizedQuiz };
    }

    return { attempt, quiz };
  }

  /**
   * List all historical attempts of a user
   */
  static async listUserAttempts(userId: string): Promise<IAttempt[]> {
    return AttemptRepository.findByUser(userId);
  }
}
