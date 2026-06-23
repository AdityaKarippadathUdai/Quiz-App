import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  useGetGlobalLeaderboardQuery,
  useGetQuizLeaderboardQuery,
} from "../services/analyticsApiSlice.js";
import { useGetQuizzesQuery } from "../services/quizApiSlice.js";
import {
  Trophy,
  Search,
  ArrowRight,
  Clock,
  Award,
  ChevronRight,
  Users,
  Target,
  FileText,
  Calendar,
} from "lucide-react";

export const LeaderboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"global" | "quiz">("global");
  const [selectedQuizId, setSelectedQuizId] = useState<string>("");
  const [globalSearch, setGlobalSearch] = useState("");
  const [quizSearch, setQuizSearch] = useState("");

  // Queries
  const { data: globalResponse, isLoading: isGlobalLoading } = useGetGlobalLeaderboardQuery();
  const { data: quizzesResponse } = useGetQuizzesQuery({ limit: 100 });
  const { data: quizLeaderboardResponse, isLoading: isQuizLeaderboardLoading } =
    useGetQuizLeaderboardQuery(selectedQuizId, { skip: !selectedQuizId });

  const globalLeaderboard = globalResponse?.data || [];
  const quizzes = quizzesResponse?.data?.filter((q) => q.isPublished) || [];
  const selectedQuizLeaderboard = quizLeaderboardResponse?.data?.leaderboard || [];
  const selectedQuizDetails = quizLeaderboardResponse?.data?.quiz;

  // Filter lists based on search
  const filteredGlobalList = globalLeaderboard.filter((user) =>
    user.name.toLowerCase().includes(globalSearch.toLowerCase()) ||
    user.email.toLowerCase().includes(globalSearch.toLowerCase())
  );

  const filteredQuizList = selectedQuizLeaderboard.filter((entry) =>
    entry.name.toLowerCase().includes(quizSearch.toLowerCase()) ||
    entry.email.toLowerCase().includes(quizSearch.toLowerCase())
  );

  const formatSeconds = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs}s`;
  };

  // Helper to generate consistent initials-based avatar backgrounds
  const getAvatarBg = (name: string) => {
    const colors = [
      "bg-emerald-500",
      "bg-indigo-500",
      "bg-purple-500",
      "bg-rose-500",
      "bg-sky-500",
      "bg-amber-500",
    ];
    let sum = 0;
    for (let i = 0; i < name.length; i++) {
      sum += name.charCodeAt(i);
    }
    return colors[sum % colors.length];
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 transition-colors duration-300 dark:bg-zinc-950 dark:text-zinc-50">
      {/* Navigation Header */}
      <nav className="border-b border-gray-100 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/10">
              <Trophy className="h-5 w-5" />
            </div>
            <span className="font-sans text-lg font-bold tracking-tight">Quiz Platform</span>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              to="/analytics"
              className="font-sans text-xs font-semibold text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400"
            >
              Analytics Dashboard
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

      <main className="mx-auto max-w-6xl px-6 py-12">
        <div className="space-y-8">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="font-sans text-3xl font-black tracking-tight md:text-4xl">Leaderboard Arena</h1>
            <p className="text-sm text-gray-500 dark:text-zinc-400">
              Check top performers across the entire platform or look up score rankings for specific quiz assessments.
            </p>
          </div>

          {/* Tab Selection Switch */}
          <div className="flex border-b border-gray-200 dark:border-zinc-800">
            <button
              onClick={() => setActiveTab("global")}
              className={`pb-4 text-sm font-bold border-b-2 px-6 transition ${
                activeTab === "global"
                  ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                  : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              <span className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>Global Rankings</span>
              </span>
            </button>
            <button
              onClick={() => setActiveTab("quiz")}
              className={`pb-4 text-sm font-bold border-b-2 px-6 transition ${
                activeTab === "quiz"
                  ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                  : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              <span className="flex items-center space-x-2">
                <Target className="h-4 w-4" />
                <span>Quiz Scoreboards</span>
              </span>
            </button>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === "global" ? (
              <motion.div
                key="global-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="space-y-8"
              >
                {/* Search Bar */}
                <div className="flex max-w-md items-center space-x-2 rounded-2xl border border-gray-200 bg-white px-3.5 py-2.5 shadow-sm focus-within:border-indigo-500 dark:border-zinc-800 dark:bg-zinc-900">
                  <Search className="h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search champion names or emails..."
                    value={globalSearch}
                    onChange={(e) => setGlobalSearch(e.target.value)}
                    className="w-full bg-transparent text-sm focus:outline-none"
                  />
                </div>

                {isGlobalLoading ? (
                  <div className="flex h-64 flex-col items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
                    <p className="mt-3 font-mono text-xs text-gray-400">LOADING CORE LEADERBOARD...</p>
                  </div>
                ) : filteredGlobalList.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-gray-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-900">
                    <Trophy className="h-10 w-10 text-gray-300" />
                    <p className="mt-4 text-sm text-gray-500">No champions match your query.</p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {/* Top 3 Visual Podium Cards (Only shown if search query is empty to preserve ranks) */}
                    {!globalSearch && filteredGlobalList.length >= 1 && (
                      <div className="grid gap-6 md:grid-cols-3">
                        {/* 2nd Place */}
                        {filteredGlobalList[1] && (
                          <div className="order-2 md:order-1 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60 flex flex-col items-center text-center justify-between">
                            <div className="space-y-4">
                              <div className="relative">
                                <div className={`h-16 w-16 rounded-full flex items-center justify-center font-bold text-white text-xl shadow-lg ${getAvatarBg(filteredGlobalList[1].name)}`}>
                                  {filteredGlobalList[1].name.substring(0, 2).toUpperCase()}
                                </div>
                                <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-slate-300 text-xs font-black text-slate-800 shadow">
                                  2
                                </span>
                              </div>
                              <div>
                                <h3 className="font-sans text-base font-black text-gray-900 dark:text-white line-clamp-1">{filteredGlobalList[1].name}</h3>
                                <p className="text-xs text-gray-400 line-clamp-1">{filteredGlobalList[1].email}</p>
                              </div>
                            </div>
                            <div className="mt-6 w-full pt-4 border-t border-gray-50 dark:border-zinc-800 flex items-center justify-between">
                              <span className="font-mono text-xs text-gray-400 uppercase font-semibold">Total Points</span>
                              <span className="font-sans text-base font-extrabold text-slate-500">{filteredGlobalList[1].totalScore} pts</span>
                            </div>
                          </div>
                        )}

                        {/* 1st Place */}
                        {filteredGlobalList[0] && (
                          <div className="order-1 md:order-2 rounded-3xl border-2 border-amber-300 bg-white p-8 shadow-md shadow-amber-500/5 dark:border-amber-500/40 dark:bg-zinc-900 flex flex-col items-center text-center justify-between scale-105">
                            <div className="space-y-4">
                              <div className="relative">
                                <div className={`h-20 w-20 rounded-full flex items-center justify-center font-bold text-white text-2xl shadow-xl ring-4 ring-amber-100 dark:ring-amber-900/20 ${getAvatarBg(filteredGlobalList[0].name)}`}>
                                  {filteredGlobalList[0].name.substring(0, 2).toUpperCase()}
                                </div>
                                <span className="absolute -bottom-1.5 -right-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-sm font-black text-white shadow-lg animate-bounce">
                                  👑
                                </span>
                              </div>
                              <div>
                                <span className="font-mono text-[9px] font-black text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full dark:bg-amber-950/40 dark:text-amber-400 uppercase tracking-widest">
                                  CHAMPION
                                </span>
                                <h3 className="font-sans text-lg font-black text-gray-900 dark:text-white mt-1.5 line-clamp-1">{filteredGlobalList[0].name}</h3>
                                <p className="text-xs text-gray-400 line-clamp-1">{filteredGlobalList[0].email}</p>
                              </div>
                            </div>
                            <div className="mt-6 w-full pt-4 border-t border-amber-100/50 dark:border-amber-950/30 flex items-center justify-between">
                              <span className="font-mono text-xs text-amber-600 uppercase font-bold">Total Points</span>
                              <span className="font-sans text-xl font-black text-amber-500">{filteredGlobalList[0].totalScore} pts</span>
                            </div>
                          </div>
                        )}

                        {/* 3rd Place */}
                        {filteredGlobalList[2] && (
                          <div className="order-3 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60 flex flex-col items-center text-center justify-between">
                            <div className="space-y-4">
                              <div className="relative">
                                <div className={`h-16 w-16 rounded-full flex items-center justify-center font-bold text-white text-xl shadow-lg ${getAvatarBg(filteredGlobalList[2].name)}`}>
                                  {filteredGlobalList[2].name.substring(0, 2).toUpperCase()}
                                </div>
                                <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-amber-700 text-xs font-black text-white shadow">
                                  3
                                </span>
                              </div>
                              <div>
                                <h3 className="font-sans text-base font-black text-gray-900 dark:text-white line-clamp-1">{filteredGlobalList[2].name}</h3>
                                <p className="text-xs text-gray-400 line-clamp-1">{filteredGlobalList[2].email}</p>
                              </div>
                            </div>
                            <div className="mt-6 w-full pt-4 border-t border-gray-50 dark:border-zinc-800 flex items-center justify-between">
                              <span className="font-mono text-xs text-gray-400 uppercase font-semibold">Total Points</span>
                              <span className="font-sans text-base font-extrabold text-amber-700">{filteredGlobalList[2].totalScore} pts</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Complete Rankings List Table */}
                    <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-gray-100 font-mono text-[10px] font-bold text-gray-400 uppercase tracking-wider dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/40">
                              <th className="py-4.5 px-6">Rank</th>
                              <th className="py-4.5 px-6">Contestant</th>
                              <th className="py-4.5 px-6 text-center">Completed Quizzes</th>
                              <th className="py-4.5 px-6 text-right">Avg Accuracy</th>
                              <th className="py-4.5 px-6 text-right">Time Spent</th>
                              <th className="py-4.5 px-6 text-right">Agg Score</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                            {filteredGlobalList.map((row, index) => {
                              const isTopThree = index < 3 && !globalSearch;
                              const rankNum = index + 1;
                              return (
                                <tr
                                  key={row._id}
                                  className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/15 transition duration-150"
                                >
                                  <td className="py-4 px-6 font-mono text-sm font-black">
                                    {isTopThree ? (
                                      <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full font-black text-xs ${
                                        rankNum === 1 ? "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400" :
                                        rankNum === 2 ? "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300" :
                                        "bg-amber-900/10 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400"
                                      }`}>
                                        {rankNum}
                                      </span>
                                    ) : (
                                      `#${rankNum}`
                                    )}
                                  </td>
                                  <td className="py-4 px-6">
                                    <div className="flex items-center space-x-3">
                                      <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-black text-white ${getAvatarBg(row.name)}`}>
                                        {row.name.substring(0, 2).toUpperCase()}
                                      </div>
                                      <div>
                                        <h4 className="font-sans text-sm font-bold text-gray-900 dark:text-white line-clamp-1">
                                          {row.name}
                                        </h4>
                                        <p className="text-xs text-gray-400 line-clamp-1">{row.email}</p>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="py-4 px-6 text-center font-mono text-sm font-semibold">
                                    {row.quizzesAttempted}
                                  </td>
                                  <td className="py-4 px-6 text-right font-mono text-sm font-bold text-blue-600 dark:text-blue-400">
                                    {row.averagePercentage}%
                                  </td>
                                  <td className="py-4 px-6 text-right font-mono text-sm text-gray-500">
                                    {formatSeconds(row.totalTimeSpent)}
                                  </td>
                                  <td className="py-4 px-6 text-right font-sans text-sm font-black text-indigo-600 dark:text-indigo-400">
                                    {row.totalScore} pts
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="quiz-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="space-y-8"
              >
                {/* Select Quiz Dropdown & Details */}
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="font-mono text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      Select Assessment Quiz
                    </label>
                    <select
                      value={selectedQuizId}
                      onChange={(e) => {
                        setSelectedQuizId(e.target.value);
                        setQuizSearch("");
                      }}
                      className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-800 shadow-sm focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
                    >
                      <option value="">-- Choose Quiz Scoreboard --</option>
                      {quizzes.map((q) => (
                        <option key={q._id} value={q._id}>
                          [{q.category.toUpperCase()}] {q.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedQuizId && (
                    <div className="flex max-w-md items-end">
                      <div className="flex w-full items-center space-x-2 rounded-2xl border border-gray-200 bg-white px-3.5 py-3 shadow-sm focus-within:border-indigo-500 dark:border-zinc-800 dark:bg-zinc-900">
                        <Search className="h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search scorers by name..."
                          value={quizSearch}
                          onChange={(e) => setQuizSearch(e.target.value)}
                          className="w-full bg-transparent text-sm focus:outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {!selectedQuizId ? (
                  <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-gray-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-900">
                    <Target className="h-10 w-10 text-gray-300" />
                    <h3 className="mt-4 font-sans text-base font-bold text-gray-900 dark:text-white">Choose a Quiz</h3>
                    <p className="mt-1.5 text-xs text-gray-400 max-w-sm">
                      Select one of the active quizzes above to view its direct competitor scoreboard, times taken, and ranks.
                    </p>
                  </div>
                ) : isQuizLeaderboardLoading ? (
                  <div className="flex h-64 flex-col items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
                    <p className="mt-3 font-mono text-xs text-gray-400">LOADING QUIZ RANKINGS...</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Selected Quiz Metadata header banner */}
                    {selectedQuizDetails && (
                      <div className="rounded-2xl border border-gray-100 bg-indigo-50/50 p-6 dark:border-zinc-800/40 dark:bg-zinc-900/30">
                        <span className="font-mono text-[9px] font-bold text-indigo-600 bg-indigo-100/60 px-2.5 py-0.5 rounded-full dark:bg-indigo-950/50 dark:text-indigo-400 uppercase tracking-widest">
                          {selectedQuizDetails.category}
                        </span>
                        <h2 className="font-sans text-xl font-black text-gray-900 dark:text-white mt-2">
                          Scoreboard: {selectedQuizDetails.title}
                        </h2>
                        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs font-semibold text-gray-500">
                          <span className="flex items-center space-x-1">
                            <Award className="h-4 w-4 text-indigo-500" />
                            <span>Difficulty: {selectedQuizDetails.difficulty}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Clock className="h-4 w-4 text-blue-500" />
                            <span>Time Limit: {selectedQuizDetails.timeLimit} mins</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <FileText className="h-4 w-4 text-green-500" />
                            <span>Questions: {selectedQuizDetails.totalQuestions}</span>
                          </span>
                        </div>
                      </div>
                    )}

                    {filteredQuizList.length === 0 ? (
                      <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-gray-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-900">
                        <Users className="h-8 w-8 text-gray-300" />
                        <p className="mt-3 text-sm text-gray-500">No score records found for this quiz.</p>
                      </div>
                    ) : (
                      <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="border-b border-gray-100 font-mono text-[10px] font-bold text-gray-400 uppercase tracking-wider dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/40">
                                <th className="py-4.5 px-6">Rank</th>
                                <th className="py-4.5 px-6">Player</th>
                                <th className="py-4.5 px-6 text-right">Accuracy</th>
                                <th className="py-4.5 px-6 text-right">Completion Time</th>
                                <th className="py-4.5 px-6 text-right">Date</th>
                                <th className="py-4.5 px-6 text-right">Final Score</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                              {filteredQuizList.map((row, index) => {
                                const isTopThree = index < 3 && !quizSearch;
                                const rankNum = index + 1;
                                return (
                                  <tr
                                    key={row._id}
                                    className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/15 transition duration-150"
                                  >
                                    <td className="py-4 px-6 font-mono text-sm font-black">
                                      {isTopThree ? (
                                        <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full font-black text-xs ${
                                          rankNum === 1 ? "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400" :
                                          rankNum === 2 ? "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300" :
                                          "bg-amber-900/10 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400"
                                        }`}>
                                          {rankNum}
                                        </span>
                                      ) : (
                                        `#${rankNum}`
                                      )}
                                    </td>
                                    <td className="py-4 px-6">
                                      <div className="flex items-center space-x-3">
                                        <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-black text-white ${getAvatarBg(row.name)}`}>
                                          {row.name.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                          <h4 className="font-sans text-sm font-bold text-gray-900 dark:text-white line-clamp-1">
                                            {row.name}
                                          </h4>
                                          <p className="text-xs text-gray-400 line-clamp-1">{row.email}</p>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="py-4 px-6 text-right font-mono text-sm font-bold text-blue-600 dark:text-blue-400">
                                      {row.percentage}%
                                    </td>
                                    <td className="py-4 px-6 text-right font-mono text-sm text-gray-500">
                                      {formatSeconds(row.timeTaken)}
                                    </td>
                                    <td className="py-4 px-6 text-right font-mono text-xs text-gray-400">
                                      <span className="flex items-center justify-end space-x-1">
                                        <Calendar className="h-3 w-3" />
                                        <span>{new Date(row.completedAt || row.createdAt).toLocaleDateString()}</span>
                                      </span>
                                    </td>
                                    <td className="py-4 px-6 text-right font-sans text-sm font-black text-indigo-600 dark:text-indigo-400">
                                      {row.score} pts
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};
