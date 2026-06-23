import React from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import {
  useGetDashboardMetricsQuery,
  useGetUserAnalyticsQuery,
} from "../services/analyticsApiSlice.js";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  BarChart2,
  TrendingUp,
  Award,
  Users,
  CheckCircle,
  FileText,
  Clock,
  ArrowRight,
  TrendingDown,
  Sparkles,
} from "lucide-react";

export const AnalyticsPage: React.FC = () => {
  // Fetch queries
  const { data: metricsResponse, isLoading: isPlatformLoading } = useGetDashboardMetricsQuery();
  const { data: userResponse, isLoading: isUserLoading } = useGetUserAnalyticsQuery();

  const platformData = metricsResponse?.data;
  const userStats = userResponse?.data;

  const isLoading = isPlatformLoading || isUserLoading;

  if (isLoading || !platformData) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-zinc-950">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
        <p className="mt-4 font-mono text-xs tracking-wider text-gray-400">LOADING ANALYTICS ENGINE...</p>
      </div>
    );
  }

  // Pre-process data for Pie Chart
  const pieColors = ["#6366f1", "#10b981", "#3b82f6", "#f59e0b", "#ec4899", "#8b5cf6"];
  const quizCategoryData = platformData.attempts.byCategory.map((cat) => ({
    name: cat.category,
    value: cat.attemptsCount,
  }));

  // Average time spent formatted
  const formatSeconds = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 transition-colors duration-300 dark:bg-zinc-950 dark:text-zinc-50">
      {/* Navigation Header */}
      <nav className="border-b border-gray-100 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/10">
              <BarChart2 className="h-5 w-5" />
            </div>
            <span className="font-sans text-lg font-bold tracking-tight">Quiz Platform</span>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              to="/leaderboard"
              className="font-sans text-xs font-semibold text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400"
            >
              Leaderboard Arena
            </Link>
            <Link
              to="/"
              className="flex items-center space-x-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
              <span>Dashboard</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-6 py-12">
        <div className="space-y-10">
          {/* Header Banner */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-2">
              <h1 className="font-sans text-3xl font-black tracking-tight md:text-4xl">Platform Insights</h1>
              <p className="text-sm text-gray-500 dark:text-zinc-400">
                Advanced analytics visualizers for quiz completions, registration counts, and success trends.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/leaderboard"
                className="inline-flex items-center space-x-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 px-4.5 py-2.5 text-xs font-bold transition dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
              >
                <span>Browse Leaderboards</span>
                <ChevronRightIcon className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Core Analytics Cards Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center justify-between text-gray-400">
                <span className="font-sans text-xs font-bold uppercase tracking-wider">Total Quizzes</span>
                <FileText className="h-5 w-5 text-indigo-500" />
              </div>
              <div className="mt-4 flex items-baseline space-x-2">
                <span className="font-sans text-3xl font-black">{platformData.quizzes.total}</span>
                <span className="font-mono text-xs text-gray-400">Total</span>
              </div>
              <div className="mt-3 flex items-center space-x-1 font-mono text-[10px] text-gray-500">
                <span className="font-bold text-green-500">{platformData.quizzes.published} Published</span>
                <span>•</span>
                <span>{platformData.quizzes.draft} Drafts</span>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center justify-between text-gray-400">
                <span className="font-sans text-xs font-bold uppercase tracking-wider">Platform Attempts</span>
                <CheckCircle className="h-5 w-5 text-emerald-500" />
              </div>
              <div className="mt-4 flex items-baseline space-x-2">
                <span className="font-sans text-3xl font-black">{platformData.attempts.totalAttempts}</span>
                <span className="font-mono text-xs text-gray-400">Times Played</span>
              </div>
              <div className="mt-3 flex items-center space-x-1 font-mono text-[10px] text-gray-500">
                <span className="font-bold text-indigo-500">{platformData.attempts.completedCount} Completed</span>
                <span>•</span>
                <span>{platformData.attempts.startedCount} Started</span>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center justify-between text-gray-400">
                <span className="font-sans text-xs font-bold uppercase tracking-wider">Average Score</span>
                <Award className="h-5 w-5 text-blue-500" />
              </div>
              <div className="mt-4 flex items-baseline space-x-2">
                <span className="font-sans text-3xl font-black text-blue-600 dark:text-blue-400">
                  {platformData.attempts.averagePercentage}%
                </span>
                <span className="font-mono text-xs text-gray-400">Accuracy</span>
              </div>
              <div className="mt-3 flex items-center space-x-1 font-mono text-[10px] text-gray-500">
                <span>Avg raw points:</span>
                <span className="font-bold text-blue-500">{platformData.attempts.averageScore}</span>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center justify-between text-gray-400">
                <span className="font-sans text-xs font-bold uppercase tracking-wider">Total Registrants</span>
                <Users className="h-5 w-5 text-purple-500" />
              </div>
              <div className="mt-4 flex items-baseline space-x-2">
                <span className="font-sans text-3xl font-black">
                  {platformData.userGrowth.reduce((acc, curr) => acc + curr.users, 0)}
                </span>
                <span className="font-mono text-xs text-gray-400">Registered</span>
              </div>
              <div className="mt-3 flex items-center space-x-1 font-mono text-[10px] text-gray-500">
                <span>Latest growth month:</span>
                <span className="font-bold text-purple-500">
                  {platformData.userGrowth[platformData.userGrowth.length - 1]?.month || "—"}
                </span>
              </div>
            </div>
          </div>

          {/* Charts Grid Row 1: Daily Activity & User Growth */}
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Daily Activity / Performance Trends */}
            <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="font-sans text-base font-black text-gray-900 dark:text-white">Daily Quiz Activity Trend</h3>
                  <p className="text-xs text-gray-400">Total assessment attempts and averages over the last 30 days</p>
                </div>
                <TrendingUp className="h-5 w-5 text-indigo-500" />
              </div>

              <div className="h-80 w-full">
                {platformData.performanceTrends.length === 0 ? (
                  <div className="flex h-full items-center justify-center font-mono text-xs text-gray-400">
                    No attempts registered in last 30 days.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={platformData.performanceTrends}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="attemptsGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" className="dark:stroke-zinc-800" />
                      <XAxis
                        dataKey="date"
                        stroke="#888888"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1f2937",
                          borderRadius: "12px",
                          border: "none",
                          color: "#fff",
                          fontSize: "12px",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="attemptsCount"
                        name="Quiz Attempts"
                        stroke="#6366f1"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#attemptsGradient)"
                      />
                      <Line
                        type="monotone"
                        dataKey="avgPercentage"
                        name="Avg Accuracy (%)"
                        stroke="#10b981"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* User Growth Trend over Time */}
            <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="font-sans text-base font-black text-gray-900 dark:text-white">User Growth Pipeline</h3>
                  <p className="text-xs text-gray-400">Monthly new user registrations trend</p>
                </div>
                <Users className="h-5 w-5 text-purple-500" />
              </div>

              <div className="h-80 w-full">
                {platformData.userGrowth.length === 0 ? (
                  <div className="flex h-full items-center justify-center font-mono text-xs text-gray-400">
                    No users registered in the database.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={platformData.userGrowth}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" className="dark:stroke-zinc-800" />
                      <XAxis
                        dataKey="month"
                        stroke="#888888"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1f2937",
                          borderRadius: "12px",
                          border: "none",
                          color: "#fff",
                          fontSize: "12px",
                        }}
                      />
                      <Bar dataKey="users" name="New Signups" fill="#8b5cf6" radius={[4, 4, 0, 0]}>
                        {platformData.userGrowth.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "#8b5cf6" : "#c084fc"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          {/* Charts Grid Row 2: Category Breakdown & Personal User Analytics */}
          <div className="grid gap-8 lg:grid-cols-12">
            {/* Category Analysis and Volume */}
            <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60 lg:col-span-5 flex flex-col justify-between">
              <div>
                <h3 className="font-sans text-base font-black text-gray-900 dark:text-white mb-1">Category Statistics</h3>
                <p className="text-xs text-gray-400 mb-6">Percentage distribution of quiz completions by stream</p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-4">
                <div className="h-48 w-48 relative">
                  {quizCategoryData.length === 0 ? (
                    <div className="absolute inset-0 flex items-center justify-center font-mono text-xs text-gray-400">
                      No categories found.
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={quizCategoryData}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={75}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {quizCategoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1f2937",
                            borderRadius: "12px",
                            border: "none",
                            color: "#fff",
                            fontSize: "11px",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                  {quizCategoryData.length > 0 && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="font-sans text-xl font-black">
                        {quizCategoryData.reduce((acc, curr) => acc + curr.value, 0)}
                      </span>
                      <span className="font-mono text-[8px] text-gray-400 tracking-wider uppercase">Plays</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-2.5">
                  {platformData.attempts.byCategory.map((cat, idx) => (
                    <div key={cat.category} className="flex items-center justify-between text-xs font-semibold">
                      <div className="flex items-center space-x-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: pieColors[idx % pieColors.length] }}
                        />
                        <span className="text-gray-700 dark:text-zinc-300 line-clamp-1">{cat.category}</span>
                      </div>
                      <span className="font-mono text-gray-400">{cat.attemptsCount} attempts</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Personal User Performance Card */}
            {userStats && (
              <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60 lg:col-span-7 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-sans text-base font-black text-gray-900 dark:text-white flex items-center space-x-1.5">
                      <Sparkles className="h-4 w-4 text-indigo-500 animate-pulse" />
                      <span>Your Custom Dashboard</span>
                    </h3>
                    <p className="text-xs text-gray-400">Individual scores and progress markers</p>
                  </div>
                </div>

                {/* Grid stats */}
                <div className="grid grid-cols-3 gap-4 border-b border-gray-100 pb-6 dark:border-zinc-800">
                  <div className="rounded-xl bg-gray-50/50 p-3 text-center dark:bg-zinc-800/20">
                    <span className="font-mono text-[9px] text-gray-400 uppercase tracking-widest font-bold block">Accuracy</span>
                    <span className="font-sans text-lg font-black text-indigo-600 dark:text-indigo-400 mt-1 block">
                      {userStats.averagePercentage}%
                    </span>
                  </div>
                  <div className="rounded-xl bg-gray-50/50 p-3 text-center dark:bg-zinc-800/20">
                    <span className="font-mono text-[9px] text-gray-400 uppercase tracking-widest font-bold block">Peak Score</span>
                    <span className="font-sans text-lg font-black text-green-500 mt-1 block">
                      {userStats.highestScore} pts
                    </span>
                  </div>
                  <div className="rounded-xl bg-gray-50/50 p-3 text-center dark:bg-zinc-800/20">
                    <span className="font-mono text-[9px] text-gray-400 uppercase tracking-widest font-bold block">Time Spent</span>
                    <span className="font-sans text-sm font-bold text-gray-700 dark:text-zinc-300 mt-1.5 block">
                      {formatSeconds(userStats.totalTimeSpent)}
                    </span>
                  </div>
                </div>

                {/* Individual trends chart */}
                <div>
                  <h4 className="font-mono text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">
                    Your Latest 10 Assessments Progress
                  </h4>
                  <div className="h-40 w-full">
                    {userStats.trends.length === 0 ? (
                      <div className="flex h-full items-center justify-center font-mono text-xs text-gray-400">
                        Take a quiz to visualize your score progression!
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={userStats.trends} margin={{ top: 5, right: 10, left: -30, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" className="dark:stroke-zinc-800" />
                          <XAxis dataKey="date" stroke="#888888" fontSize={9} tickLine={false} axisLine={false} />
                          <YAxis stroke="#888888" fontSize={9} tickLine={false} axisLine={false} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#1f2937",
                              borderRadius: "12px",
                              border: "none",
                              color: "#fff",
                              fontSize: "11px",
                            }}
                          />
                          <Line
                            type="monotone"
                            dataKey="percentage"
                            name="Accuracy (%)"
                            stroke="#4f46e5"
                            strokeWidth={2}
                            dot={{ r: 3 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

// Internal icon component for simple rendering
function ChevronRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2.5}
      stroke="currentColor"
      {...props}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
  );
}
