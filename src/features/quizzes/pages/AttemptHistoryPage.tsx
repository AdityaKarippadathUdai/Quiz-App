import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { useGetUserAttemptsQuery } from "../services/attemptApiSlice.js";
import {
  TrendingUp,
  Award,
  Clock,
  ArrowRight,
  AlertTriangle,
  History,
  Trophy,
  Activity,
  Percent,
} from "lucide-react";

export const AttemptHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: attemptsResponse, isLoading, error } = useGetUserAttemptsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const attempts = attemptsResponse?.data || [];

  const formatSeconds = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs}s`;
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-zinc-950">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
        <p className="mt-4 font-mono text-xs tracking-wider text-gray-400">RETRIEVING ATTEMPT HISTORIES...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-zinc-950 px-6 text-center">
        <AlertTriangle className="h-12 w-12 text-red-500" />
        <h2 className="mt-4 font-sans text-xl font-bold text-gray-900 dark:text-white">Failed to load history</h2>
        <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400">We faced an issue communicating with the database.</p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center space-x-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-indigo-700"
        >
          <span>Return to Dashboard</span>
        </Link>
      </div>
    );
  }

  return (
    <div id="attempt-history-wrapper" className="min-h-screen bg-gray-50 text-gray-900 transition-colors duration-300 dark:bg-zinc-950 dark:text-zinc-50">
      {/* Upper Navigation Bar */}
      <nav className="border-b border-gray-100 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/10">
              <span className="font-sans text-lg font-black">Q</span>
            </div>
            <span className="font-sans text-lg font-bold tracking-tight">Quiz Platform</span>
          </div>

          <Link
            to="/"
            className="flex items-center space-x-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            <span>Back to Dashboard</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-5xl px-6 py-12">
        <div className="space-y-8">
          {/* Header Description */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <History className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                <h1 className="font-sans text-2xl font-black tracking-tight md:text-3xl">
                  Assessment History
                </h1>
              </div>
              <p className="text-sm text-gray-500 dark:text-zinc-400">
                Track your progressive scores, accuracy metrics, ranks, and complete question reviews.
              </p>
            </div>

            <div className="flex items-center space-x-4 bg-white border border-gray-100 rounded-2xl p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="text-center px-4">
                <span className="block text-2xl font-black text-indigo-600 dark:text-indigo-400">{attempts.length}</span>
                <span className="font-mono text-[9px] font-bold text-gray-400 uppercase tracking-wider">Attempts</span>
              </div>
              <div className="h-8 w-px bg-gray-100 dark:bg-zinc-800" />
              <div className="text-center px-4">
                <span className="block text-2xl font-black text-green-500">
                  {attempts.filter(a => a.status === "COMPLETED").length}
                </span>
                <span className="font-mono text-[9px] font-bold text-gray-400 uppercase tracking-wider">Completed</span>
              </div>
            </div>
          </div>

          {/* History List */}
          {attempts.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-gray-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-900">
              <Activity className="h-12 w-12 text-gray-300" />
              <h3 className="mt-4 font-sans text-base font-bold text-gray-900 dark:text-white">No attempts recorded yet</h3>
              <p className="mt-2 text-xs text-gray-500 dark:text-zinc-400 max-w-sm">
                You haven't initiated any assessment challenges. Choose a quiz from the dashboard to start!
              </p>
              <Link
                to="/"
                className="mt-6 inline-flex items-center space-x-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-indigo-700 transition"
              >
                <span>Browse Quizzes</span>
              </Link>
            </div>
          ) : (
            <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="divide-y divide-gray-100 dark:divide-zinc-800">
                {attempts.map((att) => {
                  const quizObj = typeof att.quiz === "object" ? att.quiz : null;
                  const quizTitle = quizObj?.title || "Quiz Assessment";
                  const quizCategory = quizObj?.category || "General";
                  const isCompleted = att.status === "COMPLETED";
                  
                  const scorePercentage = typeof att.percentage === "number" 
                    ? att.percentage 
                    : (att.totalMarks > 0 ? Math.round((att.score / att.totalMarks) * 100) : 0);

                  return (
                    <div
                      key={att._id}
                      className="flex flex-col lg:flex-row lg:items-center lg:justify-between p-6 gap-6 hover:bg-gray-50/50 dark:hover:bg-zinc-800/10 transition"
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-[9px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded dark:bg-indigo-950/40 dark:text-indigo-400 uppercase">
                            {quizCategory}
                          </span>
                          <span className={`font-mono text-[9px] font-bold px-2 py-0.5 rounded ${
                            isCompleted 
                              ? "bg-green-50 text-green-600 dark:bg-green-950/40 dark:text-green-400" 
                              : "bg-amber-50 text-amber-500 dark:bg-amber-950/40 dark:text-amber-500"
                          }`}>
                            {att.status}
                          </span>
                        </div>
                        <h3 className="font-sans text-lg font-black text-gray-900 dark:text-white">
                          {quizTitle}
                        </h3>
                        <p className="text-xs text-gray-400">
                          Attempted on {new Date(att.createdAt).toLocaleDateString()} at {new Date(att.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 sm:gap-8 lg:text-right">
                        <div className="min-w-[80px]">
                          <span className="flex items-center gap-1 font-mono text-[9px] text-gray-400 font-bold uppercase tracking-wider lg:justify-end">
                            <Award className="h-3 w-3" /> Score
                          </span>
                          <p className="font-sans text-base font-extrabold text-gray-900 dark:text-white mt-1">
                            {isCompleted ? `${att.score} / ${att.totalMarks}` : "—"}
                          </p>
                        </div>

                        <div className="min-w-[80px]">
                          <span className="flex items-center gap-1 font-mono text-[9px] text-gray-400 font-bold uppercase tracking-wider lg:justify-end">
                            <Percent className="h-3 w-3" /> Accuracy
                          </span>
                          <p className="font-sans text-base font-extrabold text-blue-600 dark:text-blue-400 mt-1">
                            {isCompleted ? `${scorePercentage}%` : "In Progress"}
                          </p>
                        </div>

                        <div className="min-w-[80px]">
                          <span className="flex items-center gap-1 font-mono text-[9px] text-gray-400 font-bold uppercase tracking-wider lg:justify-end">
                            <Trophy className="h-3 w-3 animate-pulse text-amber-500" /> Rank
                          </span>
                          <p className="font-sans text-base font-extrabold text-amber-500 mt-1">
                            {isCompleted && att.rank > 0 ? `#${att.rank}` : "—"}
                          </p>
                        </div>

                        <div className="min-w-[80px]">
                          <span className="flex items-center gap-1 font-mono text-[9px] text-gray-400 font-bold uppercase tracking-wider lg:justify-end">
                            <Clock className="h-3 w-3" /> Duration
                          </span>
                          <p className="font-sans text-sm font-semibold text-gray-700 dark:text-zinc-300 mt-1">
                            {formatSeconds(att.timeTaken || att.timeSpent)}
                          </p>
                        </div>

                        <div className="flex items-center pl-2">
                          <button
                            onClick={() => {
                              if (isCompleted) {
                                navigate(`/quizzes/result/${att._id}`);
                              } else {
                                navigate(`/quizzes/take/${att._id}`);
                              }
                            }}
                            className={`rounded-xl px-5 py-2.5 text-xs font-bold transition shadow ${
                              isCompleted
                                ? "bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-400 dark:hover:bg-indigo-900/30"
                                : "bg-amber-500 text-white hover:bg-amber-600 shadow-amber-500/10"
                            }`}
                          >
                            {isCompleted ? "View Report" : "Resume Quiz"}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
