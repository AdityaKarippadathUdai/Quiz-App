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
        userId: userId as any,
        quizId: quizId as any,
        user: userId as any,
        quiz: quizId as any,
        status: AttemptStatus.STARTED,
        answers: [],
        timeTaken: 0,
        timeSpent: 0,
        score: 0,
        percentage: 0,
        rank: 0,
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
    answers: { questionId?: string; questionIndex: number; selectedOption: string }[],
    timeSpent: number
  ): Promise<IAttempt> {
    const attempt = await AttemptRepository.findById(attemptId);
    if (!attempt) {
      throw new AppError("Quiz attempt not found.", 404, "ATTEMPT_NOT_FOUND");
    }

    const attemptUser = attempt.userId ? attempt.userId.toString() : attempt.user._id.toString();
    if (attemptUser !== userId) {
      throw new AppError("You are not authorized to edit this attempt.", 403, "UNAUTHORIZED_ATTEMPT_EDIT");
    }

    if (attempt.status === AttemptStatus.COMPLETED) {
      throw new AppError("This assessment has already been submitted and finalized.", 400, "ATTEMPT_ALREADY_COMPLETED");
    }

    // Fetch quiz to check isCorrect if needed or just save options
    const quiz = await QuizRepository.findById(attempt.quizId?.toString() || attempt.quiz?._id?.toString());
    
    // Update answers format with timestamp
    const formattedAnswers = answers.map((ans) => {
      let isCorrect = false;
      if (quiz && quiz.questions) {
        const q = quiz.questions[ans.questionIndex];
        if (q && q.correctAnswer && ans.selectedOption) {
          isCorrect = q.correctAnswer.trim() === ans.selectedOption.trim();
        }
      }
      return {
        questionId: ans.questionId,
        questionIndex: ans.questionIndex,
        selectedOption: ans.selectedOption,
        isCorrect,
        savedAt: new Date(),
      };
    });

    const updated = await AttemptRepository.update(attemptId, {
      answers: formattedAnswers as any,
      timeTaken: timeSpent,
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
    answers?: { questionId?: string; questionIndex: number; selectedOption: string }[],
    timeSpent?: number
  ): Promise<IAttempt> {
    const attempt = await AttemptRepository.findById(attemptId);
    if (!attempt) {
      throw new AppError("Quiz attempt not found.", 404, "ATTEMPT_NOT_FOUND");
    }

    const attemptUser = attempt.userId ? attempt.userId.toString() : attempt.user._id.toString();
    if (attemptUser !== userId) {
      throw new AppError("You are not authorized to submit this attempt.", 403, "UNAUTHORIZED_ATTEMPT_SUBMISSION");
    }

    if (attempt.status === AttemptStatus.COMPLETED) {
      return attempt; // Already submitted, return results
    }

    // Save final state if provided in submission request payload
    let inputAnswers = answers || [];
    let currentTimeSpent = typeof timeSpent === "number" ? timeSpent : attempt.timeSpent || 0;

    // Calculate score, checking against the full Quiz model with answers
    const quizIdStr = attempt.quizId ? attempt.quizId.toString() : attempt.quiz.toString();
    const quiz = await QuizRepository.findById(quizIdStr);
    if (!quiz) {
      throw new AppError("Associated quiz not found.", 404, "QUIZ_NOT_FOUND");
    }

    let correctCount = 0;
    let incorrectCount = 0;
    let totalScore = 0;
    let totalMarks = 0;

    const quizQuestions = quiz.questions;
    const finalAnswers: any[] = [];

    // Evaluate answers
    for (let i = 0; i < quizQuestions.length; i++) {
      const question = quizQuestions[i];
      const qId = (question as any)._id ? (question as any)._id.toString() : "";
      totalMarks += question.marks;

      // Find user response either by questionIndex or questionId
      const userAns = inputAnswers.length > 0 
        ? inputAnswers.find((a) => a.questionIndex === i || (a.questionId && a.questionId === qId))
        : attempt.answers.find((a) => a.questionIndex === i || (a.questionId && a.questionId === qId));

      const selectedOption = userAns ? userAns.selectedOption : "";
      let isCorrect = false;

      if (selectedOption && selectedOption.trim()) {
        if (selectedOption.trim() === question.correctAnswer.trim()) {
          correctCount++;
          totalScore += question.marks;
          isCorrect = true;
        } else {
          incorrectCount++;
          isCorrect = false;
          if (quiz.negativeMarking) {
            totalScore -= 0.25 * question.marks; // 1/4 marks negative penalty
          }
        }
      }

      finalAnswers.push({
        questionId: qId,
        questionIndex: i,
        selectedOption,
        isCorrect,
        savedAt: userAns?.savedAt || new Date(),
      });
    }

    // Keep score non-negative
    if (totalScore < 0) {
      totalScore = 0;
    }

    // Round score to 2 decimal places
    totalScore = Math.round(totalScore * 100) / 100;

    // Calculate Percentage
    const percentage = totalMarks > 0 ? Math.round((totalScore / totalMarks) * 100 * 100) / 100 : 0;

    // Save initial update so it is part of the completed list for ranking
    const preliminaryUpdate = await AttemptRepository.update(attemptId, {
      answers: finalAnswers,
      timeTaken: currentTimeSpent,
      timeSpent: currentTimeSpent,
      score: totalScore,
      percentage,
      correctAnswersCount: correctCount,
      incorrectAnswersCount: incorrectCount,
      totalMarks,
      status: AttemptStatus.COMPLETED,
      completedAt: new Date(),
    });

    if (!preliminaryUpdate) {
      throw new AppError("Failed to finalize assessment submission.", 500, "SUBMISSION_FAILED");
    }

    // GENERATE RANK:
    // Update and compute ranks for all completed attempts of this specific quiz
    const completedAttempts = await AttemptRepository.findCompletedAttemptsForQuiz(quizIdStr);
    
    // Sort them strictly: highest score first, then lowest timeTaken (faster is better)
    completedAttempts.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return a.timeTaken - b.timeTaken;
    });

    // Update ranks in database
    let assignedRankForCurrent = 0;
    for (let index = 0; index < completedAttempts.length; index++) {
      const currentRank = index + 1;
      const att = completedAttempts[index];
      
      // Save rank
      await AttemptRepository.update(att._id.toString(), { rank: currentRank });
      if (att._id.toString() === attemptId) {
        assignedRankForCurrent = currentRank;
      }
    }

    // Reload and return the final updated attempt with computed rank
    const finalCompletedAttempt = await AttemptRepository.findById(attemptId);
    if (!finalCompletedAttempt) {
      throw new AppError("Failed to retrieve final ranked attempt.", 500, "SUBMISSION_FAILED");
    }

    return finalCompletedAttempt;
  }

  /**
   * Get attempt metrics & detailed response feedback (including correct answers & explanations)
   */
  static async getAttemptResult(attemptId: string, userId: string): Promise<{ attempt: IAttempt; quiz: any }> {
    const attempt = await AttemptRepository.findById(attemptId);
    if (!attempt) {
      throw new AppError("Quiz attempt not found.", 404, "ATTEMPT_NOT_FOUND");
    }

    const attemptUser = attempt.userId ? attempt.userId.toString() : attempt.user._id.toString();
    if (attemptUser !== userId) {
      throw new AppError("You are not authorized to view this result.", 403, "UNAUTHORIZED_VIEW");
    }

    const quizIdStr = attempt.quizId ? attempt.quizId.toString() : attempt.quiz._id.toString();
    const quiz = await QuizRepository.findById(quizIdStr);
    if (!quiz) {
      throw new AppError("Associated quiz not found.", 404, "QUIZ_NOT_FOUND");
    }

    if (attempt.status === AttemptStatus.STARTED) {
      // Strip correct answers & explanations to prevent cheating
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
