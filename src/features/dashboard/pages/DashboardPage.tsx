import React from "react";
import { useAuth } from "../../auth/components/AuthProvider.js";
import { LogOut, Award, BookOpen, Layers, Zap, User as UserIcon } from "lucide-react";

export const DashboardPage: React.FC = () => {
  const { user, logoutUser, toggleTheme, theme } = useAuth();

  return (
    <div id="dashboard-wrapper" className="min-h-screen bg-gray-50 text-gray-900 transition-colors duration-300 dark:bg-zinc-950 dark:text-zinc-50">
      {/* Upper Navigation Bar */}
      <nav className="border-b border-gray-100 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/10">
              <span className="font-sans text-lg font-black">Q</span>
            </div>
            <span className="font-sans text-lg font-bold tracking-tight">Quiz Platform</span>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              id="dashboard-theme-toggle"
              className="rounded-full p-2 text-gray-500 hover:bg-gray-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            >
              {theme === "light" ? "🌙" : "☀️"}
            </button>
            
            <div className="flex items-center space-x-3 border-l border-gray-200 pl-4 dark:border-zinc-800">
              <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                <UserIcon className="h-4 w-4" />
              </div>
              <span className="hidden font-sans text-sm font-semibold sm:inline-block">
                {user?.name}
              </span>
              <button
                onClick={logoutUser}
                id="logout-button"
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-red-600 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-red-400"
                title="Log Out"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-6 py-12">
        <div className="space-y-8">
          {/* Header Card */}
          <div className="rounded-3xl bg-white p-8 shadow-sm border border-gray-100 dark:bg-zinc-900 dark:border-zinc-800">
            <div className="md:flex md:items-center md:justify-between">
              <div>
                <h1 className="font-sans text-3xl font-extrabold tracking-tight">
                  Welcome to your Workspace, {user?.name}!
                </h1>
                <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400">
                  Account Level: <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">{user?.role}</span> • Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Today"}
                </p>
              </div>
              <div className="mt-4 md:mt-0">
                <button
                  id="start-session-btn"
                  className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/10 hover:bg-indigo-700 transition"
                >
                  Create Quiz with AI
                </button>
              </div>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100 dark:bg-zinc-900 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-500 dark:text-zinc-400">Active Quizzes</span>
                <Layers className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <p className="mt-4 text-3xl font-extrabold">12</p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100 dark:bg-zinc-900 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-500 dark:text-zinc-400">Your Attempts</span>
                <BookOpen className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <p className="mt-4 text-3xl font-extrabold">4</p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100 dark:bg-zinc-900 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-500 dark:text-zinc-400">Leaderboard Rank</span>
                <Award className="h-5 w-5 text-amber-500" />
              </div>
              <p className="mt-4 text-3xl font-extrabold">#3</p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100 dark:bg-zinc-900 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-500 dark:text-zinc-400">AI Tokens Remaining</span>
                <Zap className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <p className="mt-4 text-3xl font-extrabold">100 / 100</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
