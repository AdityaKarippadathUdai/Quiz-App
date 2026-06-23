import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/components/AuthProvider.js";
import {
  useGetQuizzesQuery,
  useTogglePublishQuizMutation,
  useDeleteQuizMutation,
} from "../../quizzes/services/quizApiSlice.js";
import { useGetUserAttemptsQuery } from "../../quizzes/services/attemptApiSlice.js";
import {
  LogOut,
  Award,
  BookOpen,
  Layers,
  Zap,
  User as UserIcon,
  Search,
  Filter,
  Plus,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  Clock,
  HelpCircle,
  TrendingUp,
} from "lucide-react";
import { UserRole, QuizDifficulty } from "../../../types.js";

export const DashboardPage: React.FC = () => {
  const { user, logoutUser, toggleTheme, theme } = useAuth();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [page, setPage] = useState(1);

  // RTK Queries
  const { data: quizzesResponse, isLoading, refetch } = useGetQuizzesQuery({
    page,
    limit: 12,
    search: searchTerm || undefined,
    difficulty: selectedDifficulty || undefined,
    category: selectedCategory || undefined,
  });

  const [togglePublish, { isLoading: isPublishing }] = useTogglePublishQuizMutation();
  const [deleteQuiz, { isLoading: isDeleting }] = useDeleteQuizMutation();

  const isAdmin = user?.role === UserRole.ADMIN;

  const { data: attemptsResponse } = useGetUserAttemptsQuery(undefined, {
    skip: isAdmin,
  });
  const attempts = attemptsResponse?.data || [];

  const quizzes = quizzesResponse?.data || [];
  const totalQuizzes = quizzesResponse?.meta?.total || 0;
  const totalPages = Math.ceil(totalQuizzes / 12);

  const handleTogglePublish = async (id: string, currentStatus: boolean) => {
    try {
      await togglePublish({ id, isPublished: !currentStatus }).unwrap();
    } catch (err) {
      alert("Failed to update quiz publish status.");
    }
  };

  const handleDeleteQuiz = async (id: string) => {
    if (window.confirm("Are you sure you want to permanently delete this quiz assessment?")) {
      try {
        await deleteQuiz(id).unwrap();
      } catch (err) {
        alert("Failed to delete quiz.");
      }
    }
  };

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
              {isAdmin && (
                <div className="mt-4 md:mt-0 flex gap-3">
                  <Link
                    to="/quizzes/create"
                    id="create-quiz-btn"
                    className="flex items-center space-x-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/10 hover:bg-indigo-700 transition"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Create Quiz</span>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100 dark:bg-zinc-900 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-500 dark:text-zinc-400">Active Quizzes</span>
                <Layers className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <p className="mt-4 text-3xl font-extrabold">{totalQuizzes}</p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100 dark:bg-zinc-900 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-500 dark:text-zinc-400">User Role</span>
                <BookOpen className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <p className="mt-4 text-2xl font-extrabold">{user?.role}</p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100 dark:bg-zinc-900 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-500 dark:text-zinc-400">Streak Score</span>
                <Award className="h-5 w-5 text-amber-500" />
              </div>
              <p className="mt-4 text-3xl font-extrabold">#1</p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100 dark:bg-zinc-900 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-500 dark:text-zinc-400">Theme</span>
                <Zap className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <p className="mt-4 text-2xl font-extrabold capitalize">{theme}</p>
            </div>
          </div>

          {/* Filtering and Searching Bar */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white p-4 rounded-2xl border border-gray-100 dark:bg-zinc-900 dark:border-zinc-800">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-gray-400" />
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-indigo-500 transition dark:bg-zinc-950 dark:border-zinc-800 dark:text-white"
                placeholder="Search assessments by title or topic..."
              />
            </div>

            <div className="flex flex-wrap gap-2.5">
              <select
                value={selectedDifficulty}
                onChange={(e) => {
                  setSelectedDifficulty(e.target.value);
                  setPage(1);
                }}
                className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500 dark:bg-zinc-950 dark:border-zinc-800"
              >
                <option value="">All Difficulties</option>
                <option value={QuizDifficulty.EASY}>Easy</option>
                <option value={QuizDifficulty.MEDIUM}>Medium</option>
                <option value={QuizDifficulty.HARD}>Hard</option>
              </select>

              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setPage(1);
                }}
                className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500 dark:bg-zinc-950 dark:border-zinc-800"
              >
                <option value="">All Categories</option>
                <option value="Web Development">Web Development</option>
                <option value="Data Science">Data Science</option>
                <option value="General Knowledge">General Knowledge</option>
                <option value="Aptitude">Aptitude</option>
              </select>
            </div>
          </div>

          {/* Quizzes Grid Feed */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
              <p className="mt-4 font-mono text-xs tracking-wider text-gray-400">LOAD ASSESSMENT CONFIGS...</p>
            </div>
          ) : quizzes.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 dark:bg-zinc-900 dark:border-zinc-800">
              <HelpCircle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 font-sans text-lg font-bold">No assessments found</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">
                Try loosening your filters or create a new assessment from scratch.
              </p>
              {isAdmin && (
                <Link
                  to="/quizzes/create"
                  className="mt-6 inline-flex items-center space-x-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-indigo-700"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create First Quiz</span>
                </Link>
              )}
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {quizzes.map((quiz) => (
                <div
                  key={quiz._id}
                  className="group relative flex flex-col justify-between rounded-2xl bg-white p-6 shadow-sm border border-gray-100 hover:shadow-md transition duration-300 dark:bg-zinc-900 dark:border-zinc-800"
                >
                  <div>
                    {/* Badge line */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-mono text-xs font-bold uppercase text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full dark:bg-indigo-950/40 dark:text-indigo-400">
                        {quiz.category}
                      </span>
                      <span className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded border ${
                        quiz.difficulty === QuizDifficulty.EASY
                          ? "text-green-600 bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-900/30"
                          : quiz.difficulty === QuizDifficulty.MEDIUM
                          ? "text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900/30"
                          : "text-red-600 bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-900/30"
                      }`}>
                        {quiz.difficulty}
                      </span>
                    </div>

                    <h3 className="font-sans text-lg font-bold tracking-tight text-gray-900 group-hover:text-indigo-600 transition dark:text-white dark:group-hover:text-indigo-400">
                      {quiz.title}
                    </h3>
                    <p className="mt-1.5 text-sm text-gray-500 line-clamp-2 dark:text-zinc-400">
                      {quiz.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-5 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between">
                    <div className="flex items-center space-x-3 text-xs text-gray-400">
                      <span className="flex items-center space-x-1">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{quiz.timeLimit} mins</span>
                      </span>
                      <span>•</span>
                      <span>{quiz.questions.length} questions</span>
                    </div>

                    {/* Manage state tools for Admin role */}
                    {isAdmin ? (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleTogglePublish(quiz._id, quiz.isPublished)}
                          className={`rounded-lg p-1.5 border transition ${
                            quiz.isPublished
                              ? "bg-green-50 border-green-200 text-green-600 hover:bg-green-100 dark:bg-green-950/30 dark:border-green-900/40 dark:text-green-400"
                              : "bg-gray-50 border-gray-200 text-gray-400 hover:bg-gray-100 dark:bg-zinc-800 dark:border-zinc-700"
                          }`}
                          title={quiz.isPublished ? "Unpublish Assessment" : "Publish Assessment"}
                        >
                          {quiz.isPublished ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        </button>

                        <button
                          onClick={() => navigate(`/quizzes/edit/${quiz._id}`)}
                          className="rounded-lg p-1.5 border border-gray-200 text-gray-500 hover:bg-gray-100 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800"
                          title="Edit Quiz"
                        >
                          <Edit className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() => handleDeleteQuiz(quiz._id)}
                          className="rounded-lg p-1.5 border border-gray-200 text-gray-400 hover:text-red-600 hover:bg-red-50 hover:border-red-100 dark:border-zinc-800 dark:hover:bg-red-950/20 dark:hover:text-red-400"
                          title="Delete Quiz"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => navigate(`/quizzes/details/${quiz._id}`)}
                        className="rounded-lg bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 text-xs font-semibold text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 dark:hover:bg-indigo-900/30"
                      >
                        Start Quiz
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Simple Pagination bar */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 pt-6">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900"
              >
                Previous
              </button>
              <span className="text-sm text-gray-500 font-medium dark:text-zinc-400">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900"
              >
                Next
              </button>
            </div>
          )}

          {/* Assessment Activity History */}
          {!isAdmin && attempts.length > 0 && (
            <div className="mt-12 space-y-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <h2 className="font-sans text-xl font-bold tracking-tight">Your Recent Assessment History</h2>
              </div>

              <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white dark:border-zinc-800 dark:bg-zinc-900">
                <div className="divide-y divide-gray-100 dark:divide-zinc-800">
                  {attempts.map((att: any) => {
                    const quizTitle = typeof att.quiz === "object" ? att.quiz?.title : "Quiz Assessment";
                    const quizCategory = typeof att.quiz === "object" ? att.quiz?.category : "General";
                    const isCompleted = att.status === "COMPLETED";

                    return (
                      <div
                        key={att._id}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-6 gap-4 hover:bg-gray-50/50 dark:hover:bg-zinc-800/20 transition"
                      >
                        <div className="space-y-1">
                          <span className="font-mono text-[9px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded dark:bg-indigo-950/40 dark:text-indigo-400 uppercase">
                            {quizCategory}
                          </span>
                          <h3 className="font-sans text-base font-bold text-gray-900 dark:text-white mt-1">
                            {quizTitle}
                          </h3>
                          <p className="text-xs text-gray-400">
                            Attempted on {new Date(att.createdAt).toLocaleDateString()}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                          <div className="text-right hidden sm:block">
                            <p className="font-mono text-[10px] text-gray-400 font-bold uppercase tracking-wider">Status</p>
                            <span className={`font-mono text-xs font-bold ${isCompleted ? "text-green-600 dark:text-green-400" : "text-amber-500"}`}>
                              {att.status}
                            </span>
                          </div>

                          <div className="text-right min-w-[70px]">
                            <p className="font-mono text-[10px] text-gray-400 font-bold uppercase tracking-wider">Score</p>
                            <p className="font-sans text-sm font-extrabold text-gray-900 dark:text-white">
                              {isCompleted ? `${att.score} / ${att.totalMarks}` : "In Progress"}
                            </p>
                          </div>

                          <button
                            onClick={() => {
                              if (isCompleted) {
                                navigate(`/quizzes/result/${att._id}`);
                              } else {
                                navigate(`/quizzes/take/${att._id}`);
                              }
                            }}
                            className={`rounded-xl px-4 py-2 text-xs font-bold transition shadow ${
                              isCompleted
                                ? "bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-400 dark:hover:bg-indigo-900/30"
                                : "bg-amber-500 text-white hover:bg-amber-600 shadow-amber-500/10"
                            }`}
                          >
                            {isCompleted ? "View Results" : "Resume"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
