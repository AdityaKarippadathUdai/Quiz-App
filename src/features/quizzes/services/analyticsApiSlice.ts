import { apiSlice } from "../../../store/apiSlice.js";

export interface GlobalLeaderboardEntry {
  _id: string;
  totalScore: number;
  averagePercentage: number;
  quizzesAttempted: number;
  totalTimeSpent: number;
  name: string;
  email: string;
  avatar?: string;
}

export interface QuizLeaderboardEntry {
  _id: string;
  score: number;
  percentage: number;
  rank: number;
  timeTaken: number;
  completedAt: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface CategoryStat {
  category: string;
  attemptsCount: number;
  completedCount: number;
  avgScore: number;
  avgPercentage: number;
}

export interface DashboardMetrics {
  quizzes: {
    total: number;
    published: number;
    draft: number;
  };
  attempts: {
    totalAttempts: number;
    completedCount: number;
    startedCount: number;
    averageScore: number;
    averagePercentage: number;
    byCategory: CategoryStat[];
  };
  userGrowth: {
    month: string;
    users: number;
  }[];
  performanceTrends: {
    date: string;
    attemptsCount: number;
    avgScore: number;
    avgPercentage: number;
  }[];
}

export interface UserAnalytics {
  totalAttempts: number;
  completedCount: number;
  averageScore: number;
  averagePercentage: number;
  highestScore: number;
  totalTimeSpent: number;
  byQuiz: {
    _id: string;
    quizTitle: string;
    category: string;
    attemptsCount: number;
    bestScore: number;
    bestPercentage: number;
  }[];
  trends: {
    date: string;
    score: number;
    percentage: number;
  }[];
}

export const analyticsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getGlobalLeaderboard: builder.query<{ success: boolean; data: GlobalLeaderboardEntry[] }, { limit?: number } | void>({
      query: (params) => ({
        url: "/analytics/leaderboard/global",
        params: params ? { limit: params.limit } : undefined,
      }),
      providesTags: ["Analytics"],
    }),
    getQuizLeaderboard: builder.query<{ success: boolean; data: { quiz: any; leaderboard: QuizLeaderboardEntry[] } }, string>({
      query: (quizId) => `/analytics/leaderboard/quiz/${quizId}`,
      providesTags: (result, error, id) => [{ type: "Analytics", id }],
    }),
    getDashboardMetrics: builder.query<{ success: boolean; data: DashboardMetrics }, void>({
      query: () => "/analytics/dashboard",
      providesTags: ["Analytics"],
    }),
    getUserAnalytics: builder.query<{ success: boolean; data: UserAnalytics }, { userId?: string } | void>({
      query: (params) => ({
        url: "/analytics/user",
        params: params ? { userId: params.userId } : undefined,
      }),
      providesTags: ["Analytics"],
    }),
  }),
});

export const {
  useGetGlobalLeaderboardQuery,
  useGetQuizLeaderboardQuery,
  useGetDashboardMetricsQuery,
  useGetUserAnalyticsQuery,
} = analyticsApiSlice;
