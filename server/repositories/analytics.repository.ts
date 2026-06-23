import mongoose from "mongoose";
import { Attempt } from "../models/Attempt.js";
import { User } from "../models/User.js";
import { Quiz } from "../models/Quiz.js";

export class AnalyticsRepository {
  /**
   * Aggregate global leaderboard of top performers
   */
  static async getGlobalLeaderboard(limit: number = 20): Promise<any[]> {
    return Attempt.aggregate([
      { $match: { status: "COMPLETED" } },
      {
        $group: {
          _id: "$userId",
          totalScore: { $sum: "$score" },
          averagePercentage: { $avg: "$percentage" },
          quizzesAttempted: { $sum: 1 },
          totalTimeSpent: { $sum: "$timeTaken" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      { $unwind: "$userDetails" },
      {
        $project: {
          _id: 1,
          totalScore: 1,
          averagePercentage: { $round: ["$averagePercentage", 2] },
          quizzesAttempted: 1,
          totalTimeSpent: 1,
          name: "$userDetails.name",
          email: "$userDetails.email",
          avatar: "$userDetails.avatar",
        },
      },
      { $sort: { totalScore: -1, totalTimeSpent: 1 } },
      { $limit: limit },
    ]).exec();
  }

  /**
   * Aggregate completed attempts for a specific quiz for its scoreboard ranking
   */
  static async getQuizLeaderboard(quizId: string): Promise<any[]> {
    const qId = new mongoose.Types.ObjectId(quizId);
    return Attempt.aggregate([
      {
        $match: {
          $or: [{ quizId: qId }, { quiz: qId }],
          status: "COMPLETED",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      { $unwind: "$userDetails" },
      {
        $project: {
          _id: 1,
          score: 1,
          percentage: 1,
          rank: 1,
          timeTaken: 1,
          completedAt: 1,
          name: "$userDetails.name",
          email: "$userDetails.email",
          avatar: "$userDetails.avatar",
        },
      },
      { $sort: { score: -1, timeTaken: 1 } },
    ]).exec();
  }

  /**
   * Get total quizzes stats
   */
  static async getQuizCounts(): Promise<{ total: number; published: number; draft: number }> {
    const total = await Quiz.countDocuments();
    const published = await Quiz.countDocuments({ isPublished: true });
    return {
      total,
      published,
      draft: total - published,
    };
  }

  /**
   * Aggregate attempt stats (total, completed, started, average score, percentage)
   */
  static async getAttemptOverviewStats(): Promise<any> {
    const stats = await Attempt.aggregate([
      {
        $facet: {
          totals: [
            {
              $group: {
                _id: null,
                totalAttempts: { $sum: 1 },
                completedCount: {
                  $sum: { $cond: [{ $eq: ["$status", "COMPLETED"] }, 1, 0] },
                },
                startedCount: {
                  $sum: { $cond: [{ $eq: ["$status", "STARTED"] }, 1, 0] },
                },
                averageScore: {
                  $avg: { $cond: [{ $eq: ["$status", "COMPLETED"] }, "$score", null] },
                },
                averagePercentage: {
                  $avg: { $cond: [{ $eq: ["$status", "COMPLETED"] }, "$percentage", null] },
                },
              },
            },
          ],
          byCategory: [
            {
              $lookup: {
                from: "quizzes",
                localField: "quizId",
                foreignField: "_id",
                as: "quizDetails",
              },
            },
            { $unwind: { path: "$quizDetails", preserveNullAndEmptyArrays: true } },
            {
              $group: {
                _id: { $ifNull: ["$quizDetails.category", "General"] },
                attemptsCount: { $sum: 1 },
                completedCount: {
                  $sum: { $cond: [{ $eq: ["$status", "COMPLETED"] }, 1, 0] },
                },
                avgScore: {
                  $avg: { $cond: [{ $eq: ["$status", "COMPLETED"] }, "$score", null] },
                },
                avgPercentage: {
                  $avg: { $cond: [{ $eq: ["$status", "COMPLETED"] }, "$percentage", null] },
                },
              },
            },
            {
              $project: {
                category: "$_id",
                attemptsCount: 1,
                completedCount: 1,
                avgScore: { $round: ["$avgScore", 2] },
                avgPercentage: { $round: ["$avgPercentage", 2] },
              },
            },
          ],
        },
      },
    ]).exec();

    const totals = stats[0]?.totals[0] || {
      totalAttempts: 0,
      completedCount: 0,
      startedCount: 0,
      averageScore: 0,
      averagePercentage: 0,
    };

    return {
      totalAttempts: totals.totalAttempts,
      completedCount: totals.completedCount,
      startedCount: totals.startedCount,
      averageScore: totals.averageScore ? Math.round(totals.averageScore * 100) / 100 : 0,
      averagePercentage: totals.averagePercentage ? Math.round(totals.averagePercentage * 100) / 100 : 0,
      byCategory: stats[0]?.byCategory || [],
    };
  }

  /**
   * Aggregate User registration growth trend (over last 12 months)
   */
  static async getUserGrowthTrend(): Promise<any[]> {
    return User.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          users: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          month: "$_id",
          users: 1,
          _id: 0,
        },
      },
    ]).exec();
  }

  /**
   * Aggregate Performance Trends & Attempt frequency (by date) over last 30 days
   */
  static async getPerformanceTrends(): Promise<any[]> {
    return Attempt.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // last 30 days
          },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          attemptsCount: { $sum: 1 },
          avgScore: {
            $avg: { $cond: [{ $eq: ["$status", "COMPLETED"] }, "$score", null] },
          },
          avgPercentage: {
            $avg: { $cond: [{ $eq: ["$status", "COMPLETED"] }, "$percentage", null] },
          },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          date: "$_id",
          attemptsCount: 1,
          avgScore: { $round: [{ $ifNull: ["$avgScore", 0] }, 2] },
          avgPercentage: { $round: [{ $ifNull: ["$avgPercentage", 0] }, 2] },
          _id: 0,
        },
      },
    ]).exec();
  }

  /**
   * Aggregate a specific user's performance metrics
   */
  static async getUserAnalytics(userId: string): Promise<any> {
    const uId = new mongoose.Types.ObjectId(userId);
    const userAttempts = await Attempt.aggregate([
      {
        $match: {
          $or: [{ userId: uId }, { user: uId }],
        },
      },
      {
        $facet: {
          overview: [
            {
              $group: {
                _id: null,
                totalAttempts: { $sum: 1 },
                completedCount: {
                  $sum: { $cond: [{ $eq: ["$status", "COMPLETED"] }, 1, 0] },
                },
                averageScore: {
                  $avg: { $cond: [{ $eq: ["$status", "COMPLETED"] }, "$score", null] },
                },
                averagePercentage: {
                  $avg: { $cond: [{ $eq: ["$status", "COMPLETED"] }, "$percentage", null] },
                },
                highestScore: { $max: { $cond: [{ $eq: ["$status", "COMPLETED"] }, "$score", null] } },
                totalTimeSpent: { $sum: "$timeTaken" },
              },
            },
          ],
          byQuiz: [
            {
              $lookup: {
                from: "quizzes",
                localField: "quizId",
                foreignField: "_id",
                as: "quizDetails",
              },
            },
            { $unwind: { path: "$quizDetails", preserveNullAndEmptyArrays: true } },
            {
              $group: {
                _id: "$quizId",
                quizTitle: { $first: { $ifNull: ["$quizDetails.title", "Deleted Quiz"] } },
                category: { $first: { $ifNull: ["$quizDetails.category", "General"] } },
                attemptsCount: { $sum: 1 },
                bestScore: { $max: { $cond: [{ $eq: ["$status", "COMPLETED"] }, "$score", null] } },
                bestPercentage: { $max: { $cond: [{ $eq: ["$status", "COMPLETED"] }, "$percentage", null] } },
              },
            },
          ],
          trends: [
            { $match: { status: "COMPLETED" } },
            { $sort: { createdAt: 1 } },
            { $limit: 10 },
            {
              $project: {
                date: { $dateToString: { format: "%m-%d", date: "$createdAt" } },
                score: 1,
                percentage: 1,
              },
            },
          ],
        },
      },
    ]).exec();

    const overview = userAttempts[0]?.overview[0] || {
      totalAttempts: 0,
      completedCount: 0,
      averageScore: 0,
      averagePercentage: 0,
      highestScore: 0,
      totalTimeSpent: 0,
    };

    return {
      totalAttempts: overview.totalAttempts,
      completedCount: overview.completedCount,
      averageScore: overview.averageScore ? Math.round(overview.averageScore * 100) / 100 : 0,
      averagePercentage: overview.averagePercentage ? Math.round(overview.averagePercentage * 100) / 100 : 0,
      highestScore: overview.highestScore || 0,
      totalTimeSpent: overview.totalTimeSpent || 0,
      byQuiz: userAttempts[0]?.byQuiz || [],
      trends: userAttempts[0]?.trends || [],
    };
  }
}
