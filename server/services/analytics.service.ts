import { AnalyticsRepository } from "../repositories/analytics.repository.js";
import { QuizRepository } from "../repositories/quiz.repository.js";
import { AppError } from "../middleware/errorMiddleware.js";

export class AnalyticsService {
  /**
   * Get global leaderboard top performers
   */
  static async getGlobalLeaderboard(limit: number = 20): Promise<any[]> {
    return AnalyticsRepository.getGlobalLeaderboard(limit);
  }

  /**
   * Get scoreboard ranking for a specific quiz
   */
  static async getQuizLeaderboard(quizId: string): Promise<any> {
    const quiz = await QuizRepository.findById(quizId);
    if (!quiz) {
      throw new AppError("Quiz not found.", 404, "QUIZ_NOT_FOUND");
    }

    const leaderboard = await AnalyticsRepository.getQuizLeaderboard(quizId);
    return {
      quiz: {
        _id: quiz._id,
        title: quiz.title,
        category: quiz.category,
        difficulty: quiz.difficulty,
        totalQuestions: quiz.questions?.length || 0,
      },
      leaderboard,
    };
  }

  /**
   * Get main dashboard metrics
   */
  static async getDashboardMetrics(): Promise<any> {
    const quizCounts = await AnalyticsRepository.getQuizCounts();
    const attemptsOverview = await AnalyticsRepository.getAttemptOverviewStats();
    const userGrowthTrend = await AnalyticsRepository.getUserGrowthTrend();
    const performanceTrends = await AnalyticsRepository.getPerformanceTrends();

    return {
      quizzes: quizCounts,
      attempts: attemptsOverview,
      userGrowth: userGrowthTrend,
      performanceTrends,
    };
  }

  /**
   * Get user analytics dashboard
   */
  static async getUserAnalytics(userId: string): Promise<any> {
    return AnalyticsRepository.getUserAnalytics(userId);
  }
}
