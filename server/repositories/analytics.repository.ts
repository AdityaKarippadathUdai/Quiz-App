import mongoose from "mongoose";
import { Attempt } from "../models/Attempt.js";
import { User } from "../models/User.js";
import { Quiz } from "../models/Quiz.js";
import { isMongoConnected } from "../config/db.js";
import { mockAttempts, mockUsers, mockQuizzes } from "./fallbackStore.js";

export class AnalyticsRepository {
  /**
   * Aggregate global leaderboard of top performers
   */
  static async getGlobalLeaderboard(limit: number = 20): Promise<any[]> {
    if (!isMongoConnected) {
      const completed = mockAttempts.filter(x => x.status === "COMPLETED");
      const grouped: { [userId: string]: any } = {};

      for (const att of completed) {
        const uId = att.userId?.toString() || att.user?.toString();
        if (!uId) continue;
        if (!grouped[uId]) {
          grouped[uId] = {
            _id: uId,
            totalScore: 0,
            totalPercentage: 0,
            quizzesAttempted: 0,
            totalTimeSpent: 0,
          };
        }
        grouped[uId].totalScore += att.score || 0;
        grouped[uId].totalPercentage += att.percentage || 0;
        grouped[uId].quizzesAttempted += 1;
        grouped[uId].totalTimeSpent += att.timeTaken || 0;
      }

      const list = Object.values(grouped).map(g => {
        const user = mockUsers.find(u => u._id === g._id) || { name: "Alex Trivia Champ", email: "player@quiz.com", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150" };
        return {
          _id: g._id,
          totalScore: g.totalScore,
          averagePercentage: g.quizzesAttempted > 0 ? Math.round((g.totalPercentage / g.quizzesAttempted) * 100) / 100 : 0,
          quizzesAttempted: g.quizzesAttempted,
          totalTimeSpent: g.totalTimeSpent,
          name: user.name,
          email: user.email,
          avatar: user.avatar || "",
        };
      });

      list.sort((a, b) => {
        if (b.totalScore !== a.totalScore) {
          return b.totalScore - a.totalScore;
        }
        return a.totalTimeSpent - b.totalTimeSpent;
      });

      return list.slice(0, limit);
    }

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
    if (!isMongoConnected) {
      const completed = mockAttempts.filter(x => 
        ((x.quizId && x.quizId.toString() === quizId.toString()) || (x.quiz && x.quiz.toString() === quizId.toString())) &&
        x.status === "COMPLETED"
      );

      const list = completed.map(att => {
        const user = mockUsers.find(u => u._id === att.userId) || { name: "User", email: "user@quiz.com", avatar: "" };
        return {
          _id: att._id,
          score: att.score,
          percentage: att.percentage,
          rank: att.rank,
          timeTaken: att.timeTaken,
          completedAt: att.completedAt || att.updatedAt,
          name: user.name,
          email: user.email,
          avatar: user.avatar || "",
        };
      });

      list.sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score;
        }
        return a.timeTaken - b.timeTaken;
      });

      return list;
    }

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
    if (!isMongoConnected) {
      const total = mockQuizzes.length;
      const published = mockQuizzes.filter(q => q.isPublished).length;
      return {
        total,
        published,
        draft: total - published,
      };
    }

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
    if (!isMongoConnected) {
      const totalAttempts = mockAttempts.length;
      const completed = mockAttempts.filter(x => x.status === "COMPLETED");
      const startedCount = mockAttempts.filter(x => x.status === "STARTED").length;
      
      let sumScore = 0;
      let sumPercentage = 0;
      for (const c of completed) {
        sumScore += c.score || 0;
        sumPercentage += c.percentage || 0;
      }

      const catGroups: { [cat: string]: any } = {};
      for (const att of mockAttempts) {
        const q = mockQuizzes.find(x => x._id === att.quizId) || { category: "General" };
        const category = q.category || "General";
        if (!catGroups[category]) {
          catGroups[category] = {
            category,
            attemptsCount: 0,
            completedCount: 0,
            sumScore: 0,
            sumPercentage: 0
          };
        }
        catGroups[category].attemptsCount += 1;
        if (att.status === "COMPLETED") {
          catGroups[category].completedCount += 1;
          catGroups[category].sumScore += att.score || 0;
          catGroups[category].sumPercentage += att.percentage || 0;
        }
      }

      const byCategory = Object.values(catGroups).map((cg: any) => ({
        category: cg.category,
        attemptsCount: cg.attemptsCount,
        completedCount: cg.completedCount,
        avgScore: cg.completedCount > 0 ? Math.round((cg.sumScore / cg.completedCount) * 100) / 100 : 0,
        avgPercentage: cg.completedCount > 0 ? Math.round((cg.sumPercentage / cg.completedCount) * 100) / 100 : 0
      }));

      return {
        totalAttempts,
        completedCount: completed.length,
        startedCount,
        averageScore: completed.length > 0 ? Math.round((sumScore / completed.length) * 100) / 100 : 0,
        averagePercentage: completed.length > 0 ? Math.round((sumPercentage / completed.length) * 100) / 100 : 0,
        byCategory
      };
    }

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
    if (!isMongoConnected) {
      const groups: { [month: string]: number } = {};
      for (const u of mockUsers) {
        const d = u.createdAt instanceof Date ? u.createdAt : new Date(u.createdAt);
        const yyyymm = d.toISOString().slice(0, 7);
        groups[yyyymm] = (groups[yyyymm] || 0) + 1;
      }
      return Object.keys(groups).sort().map(month => ({
        month,
        users: groups[month]
      }));
    }

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
    if (!isMongoConnected) {
      const limitDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const recent = mockAttempts.filter(x => {
        const d = x.createdAt instanceof Date ? x.createdAt : new Date(x.createdAt);
        return d >= limitDate;
      });

      const groups: { [date: string]: any } = {};
      for (const att of recent) {
        const d = att.createdAt instanceof Date ? att.createdAt : new Date(att.createdAt);
        const yyyymmdd = d.toISOString().slice(0, 10);
        if (!groups[yyyymmdd]) {
          groups[yyyymmdd] = {
            date: yyyymmdd,
            attemptsCount: 0,
            completedCount: 0,
            sumScore: 0,
            sumPercentage: 0
          };
        }
        groups[yyyymmdd].attemptsCount += 1;
        if (att.status === "COMPLETED") {
          groups[yyyymmdd].completedCount += 1;
          groups[yyyymmdd].sumScore += att.score || 0;
          groups[yyyymmdd].sumPercentage += att.percentage || 0;
        }
      }

      return Object.keys(groups).sort().map(date => {
        const g = groups[date];
        return {
          date,
          attemptsCount: g.attemptsCount,
          avgScore: g.completedCount > 0 ? Math.round((g.sumScore / g.completedCount) * 100) / 100 : 0,
          avgPercentage: g.completedCount > 0 ? Math.round((g.sumPercentage / g.completedCount) * 100) / 100 : 0
        };
      });
    }

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
    if (!isMongoConnected) {
      const uId = userId.toString();
      const userAtts = mockAttempts.filter(x => 
        (x.userId && x.userId.toString() === uId) || 
        (x.user && x.user.toString() === uId)
      );

      const completed = userAtts.filter(x => x.status === "COMPLETED");
      
      let sumScore = 0;
      let sumPercentage = 0;
      let highestScore = 0;
      let totalTimeSpent = 0;

      for (const c of completed) {
        sumScore += c.score || 0;
        sumPercentage += c.percentage || 0;
        if ((c.score || 0) > highestScore) {
          highestScore = c.score;
        }
        totalTimeSpent += c.timeTaken || 0;
      }

      const quizGroups: { [qId: string]: any } = {};
      for (const att of userAtts) {
        const qId = att.quizId?.toString() || att.quiz?.toString();
        if (!qId) continue;
        if (!quizGroups[qId]) {
          const qDetails = mockQuizzes.find(x => x._id === qId) || { title: "Deleted Quiz", category: "General" };
          quizGroups[qId] = {
            _id: qId,
            quizTitle: qDetails.title,
            category: qDetails.category,
            attemptsCount: 0,
            bestScore: 0,
            bestPercentage: 0
          };
        }
        quizGroups[qId].attemptsCount += 1;
        if (att.status === "COMPLETED") {
          if (att.score > quizGroups[qId].bestScore) {
            quizGroups[qId].bestScore = att.score;
          }
          if (att.percentage > quizGroups[qId].bestPercentage) {
            quizGroups[qId].bestPercentage = att.percentage;
          }
        }
      }

      const trends = completed.slice(0, 10).map(att => {
        const d = att.createdAt instanceof Date ? att.createdAt : new Date(att.createdAt);
        return {
          date: d.toISOString().slice(5, 10).replace("-", "/"),
          score: att.score,
          percentage: att.percentage
        };
      });

      return {
        totalAttempts: userAtts.length,
        completedCount: completed.length,
        averageScore: completed.length > 0 ? Math.round((sumScore / completed.length) * 100) / 100 : 0,
        averagePercentage: completed.length > 0 ? Math.round((sumPercentage / completed.length) * 100) / 100 : 0,
        highestScore,
        totalTimeSpent,
        byQuiz: Object.values(quizGroups),
        trends
      };
    }

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
