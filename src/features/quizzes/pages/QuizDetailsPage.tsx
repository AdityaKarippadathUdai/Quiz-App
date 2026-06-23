import React from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "motion/react";
import { useGetQuizQuery } from "../services/quizApiSlice.js";
import { useStartAttemptMutation } from "../services/attemptApiSlice.js";
import { useAuth } from "../../auth/components/AuthProvider.js";
import {
  Clock,
  Award,
  AlertTriangle,
  ArrowLeft,
  Play,
  CheckCircle,
  HelpCircle,
  Info,
} from "lucide-react";
import { QuizDifficulty } from "../../../types.js";

export const QuizDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { theme } = useAuth();

  const { data: quizResponse, isLoading, error } = useGetQuizQuery(id || "");
  const [startAttempt, { isLoading: isStarting }] = useStartAttemptMutation();

  const quiz = quizResponse?.data?.quiz;

  const handleStart = async () => {
    if (!id) return;
    try {
      const response = await startAttempt(id).unwrap();
      const attemptId = response.data.attempt._id;
      navigate(`/quizzes/take/${attemptId}`);
    } catch (err: any) {
      alert(err?.data?.message || "Failed to start quiz session. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-zinc-950">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
        <p className="mt-4 font-mono text-xs tracking-wider text-gray-400">LOADING METADATA...</p>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-zinc-950 px-6 text-center">
        <AlertTriangle className="h-12 w-12 text-red-500" />
        <h2 className="mt-4 font-sans text-xl font-bold text-gray-900 dark:text-white">Failed to load quiz details</h2>
        <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400">The requested quiz may not exist or is unpublished.</p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center space-x-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-indigo-700"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Return to Dashboard</span>
        </Link>
      </div>
    );
  }

  const difficultyColors =
    quiz.difficulty === QuizDifficulty.EASY
      ? "text-green-600 bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-900/30"
      : quiz.difficulty === QuizDifficulty.MEDIUM
      ? "text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900/30"
      : "text-red-600 bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-900/30";

  return (
    <div id="details-wrapper" className="min-h-screen bg-gray-50 text-gray-900 transition-colors duration-300 dark:bg-zinc-950 dark:text-zinc-50">
      {/* Upper Navigation Bar */}
      <nav className="border-b border-gray-100 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 text-sm font-semibold text-gray-600 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Link>
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="font-sans text-xs font-semibold text-gray-400">Ready to attempt</span>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-3xl px-6 py-12 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-8"
        >
          {/* Main Info Card */}
          <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-10">
            {/* Badges */}
            <div className="flex flex-wrap gap-2.5">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full dark:bg-indigo-950/40 dark:text-indigo-400">
                {quiz.category}
              </span>
              <span className={`font-mono text-xs font-bold px-3 py-1 rounded-full border uppercase ${difficultyColors}`}>
                {quiz.difficulty}
              </span>
            </div>

            {/* Title & Description */}
            <h1 className="mt-6 font-sans text-3xl font-extrabold tracking-tight sm:text-4xl text-gray-900 dark:text-white">
              {quiz.title}
            </h1>
            <p className="mt-4 text-base leading-relaxed text-gray-600 dark:text-zinc-400">
              {quiz.description}
            </p>

            {/* Stats list */}
            <div className="mt-8 grid gap-4 border-t border-b border-gray-100 py-6 dark:border-zinc-800 sm:grid-cols-3">
              <div className="flex items-center space-x-3.5">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-mono text-[10px] font-bold text-gray-400 uppercase tracking-wider">Duration</p>
                  <p className="font-sans text-base font-extrabold">{quiz.timeLimit} Minutes</p>
                </div>
              </div>

              <div className="flex items-center space-x-3.5">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
                  <HelpCircle className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-mono text-[10px] font-bold text-gray-400 uppercase tracking-wider">Questions</p>
                  <p className="font-sans text-base font-extrabold">{quiz.questions.length} Items</p>
                </div>
              </div>

              <div className="flex items-center space-x-3.5">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-mono text-[10px] font-bold text-gray-400 uppercase tracking-wider">Marking</p>
                  <p className="font-sans text-base font-extrabold">
                    {quiz.questions.reduce((sum, q) => sum + q.marks, 0)} Total Marks
                  </p>
                </div>
              </div>
            </div>

            {/* Instructions box */}
            <div className="mt-8 rounded-2xl bg-indigo-50/40 p-5 dark:bg-indigo-950/10 border border-indigo-100/30">
              <h3 className="flex items-center space-x-2 font-sans text-sm font-bold text-indigo-900 dark:text-indigo-400">
                <Info className="h-4 w-4" />
                <span>Assessment Instructions & Rules</span>
              </h3>
              <ul className="mt-3.5 space-y-2.5 text-xs font-medium text-gray-600 dark:text-zinc-400">
                <li className="flex items-start space-x-2">
                  <CheckCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-indigo-600 dark:text-indigo-400" />
                  <span>The timer will start the moment you click the button below.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-indigo-600 dark:text-indigo-400" />
                  <span>Your answers will automatically be saved in real-time as you navigate.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-indigo-600 dark:text-indigo-400" />
                  <span>You can jump between questions using the Question Palette sidebar.</span>
                </li>
                {quiz.negativeMarking && (
                  <li className="flex items-start space-x-2 text-amber-700 dark:text-amber-400 font-semibold">
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
                    <span>Negative Marking Enabled: Incorrect answers will deduct 25% of the question marks.</span>
                  </li>
                )}
              </ul>
            </div>

            {/* Start Action */}
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-end">
              <Link
                to="/"
                className="flex items-center justify-center space-x-2 rounded-2xl border border-gray-200 px-6 py-4 text-sm font-bold text-gray-600 hover:bg-gray-50 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 transition"
              >
                <span>Back</span>
              </Link>
              <button
                onClick={handleStart}
                disabled={isStarting}
                id="start-session-btn"
                className="flex items-center justify-center space-x-2.5 rounded-2xl bg-indigo-600 px-8 py-4 text-sm font-bold text-white shadow-xl shadow-indigo-600/15 hover:bg-indigo-700 disabled:opacity-50 transition"
              >
                {isStarting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Preparing questions...</span>
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 fill-current" />
                    <span>Start Assessment Session</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};
