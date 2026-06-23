import React from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "motion/react";
import { useGetAttemptResultQuery } from "../services/attemptApiSlice.js";
import {
  Award,
  CheckCircle,
  XCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  FileText,
  Percent,
  Trophy,
} from "lucide-react";

export const QuizResultsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: resultsResponse, isLoading, error } = useGetAttemptResultQuery(id || "", {
    skip: !id,
    refetchOnMountOrArgChange: true,
  });

  const attempt = resultsResponse?.data?.attempt;
  const quiz = resultsResponse?.data?.quiz;

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-zinc-950">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
        <p className="mt-4 font-mono text-xs tracking-wider text-gray-400">COMPILING ASSESSMENT REPORT...</p>
      </div>
    );
  }

  if (error || !attempt || !quiz) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-zinc-950 px-6 text-center">
        <AlertTriangle className="h-12 w-12 text-red-500" />
        <h2 className="mt-4 font-sans text-xl font-bold text-gray-900 dark:text-white">Results not found</h2>
        <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400">We couldn't retrieve valid score reports for this session.</p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center space-x-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-indigo-700"
        >
          <span>Return to Dashboard</span>
        </Link>
      </div>
    );
  }

  const scorePercentage = typeof attempt.percentage === "number" 
    ? attempt.percentage 
    : (attempt.totalMarks > 0 ? Math.round((attempt.score / attempt.totalMarks) * 100) : 0);
  
  // Custom feedback messages depending on score percentage
  let feedbackTitle = "Keep learning!";
  let feedbackDescription = "Try reviewing the questions and explanation logs to sharpen your skill sets.";
  let feedbackTheme = "text-red-600 border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900/40 dark:text-red-400";

  if (scorePercentage >= 80) {
    feedbackTitle = "Outstanding Job!";
    feedbackDescription = "You've demonstrated a complete mastery of these topics! Splendid effort.";
    feedbackTheme = "text-green-600 border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-900/40 dark:text-green-400";
  } else if (scorePercentage >= 50) {
    feedbackTitle = "Great Effort!";
    feedbackDescription = "You have a solid foundation! Read through explanations to bridge remaining knowledge gaps.";
    feedbackTheme = "text-amber-600 border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900/40 dark:text-amber-400";
  }

  const formatSeconds = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    if (mins === 0) return `${secs} secs`;
    return `${mins}m ${secs}s`;
  };

  return (
    <div id="results-report-wrapper" className="min-h-screen bg-gray-50 text-gray-900 transition-colors duration-300 dark:bg-zinc-950 dark:text-zinc-50">
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

      <main className="mx-auto max-w-4xl px-6 py-12">
        <div className="space-y-8">
          {/* Header Performance Summary */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className={`rounded-3xl border p-8 md:p-10 ${feedbackTheme}`}
          >
            <div className="md:flex md:items-center md:justify-between">
              <div>
                <span className="font-mono text-[10px] font-extrabold uppercase tracking-widest opacity-80">
                  ASSESSMENT COMPLETED • PERFORMANCE REPORT
                </span>
                <h1 className="mt-2 font-sans text-3xl font-black tracking-tight md:text-4xl">
                  {feedbackTitle}
                </h1>
                <p className="mt-3 text-sm md:text-base font-medium opacity-90 max-w-xl">
                  {feedbackDescription}
                </p>
                {attempt.rank > 0 && (
                  <div className="mt-4 flex items-center space-x-2">
                    <Trophy className="h-5 w-5 text-amber-500 animate-bounce" />
                    <span className="font-sans text-sm font-bold bg-white/40 dark:bg-white/10 px-3 py-1 rounded-lg">
                      Ranked #{attempt.rank} among all participants
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-6 md:mt-0 flex flex-col items-center justify-center text-center">
                <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-white/40 dark:bg-white/10 shadow-lg border border-white/50 backdrop-blur-sm">
                  <div className="text-center">
                    <span className="font-sans text-3xl font-extrabold tracking-tight block">
                      {scorePercentage}%
                    </span>
                    <span className="font-mono text-[9px] font-bold tracking-widest uppercase opacity-85">
                      ACCURACY
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Detailed Statistics Metrics Grid */}
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center justify-between text-gray-400">
                <span className="font-sans text-xs font-bold uppercase tracking-wider">Final Score</span>
                <Award className="h-4.5 w-4.5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <p className="mt-4 font-sans text-2xl font-extrabold">
                {attempt.score} <span className="text-sm font-semibold text-gray-400">/ {attempt.totalMarks} points</span>
              </p>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center justify-between text-gray-400">
                <span className="font-sans text-xs font-bold uppercase tracking-wider">Percentage</span>
                <Percent className="h-4.5 w-4.5 text-blue-500" />
              </div>
              <p className="mt-4 font-sans text-2xl font-extrabold text-blue-600 dark:text-blue-400">
                {scorePercentage}%
              </p>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center justify-between text-gray-400">
                <span className="font-sans text-xs font-bold uppercase tracking-wider">Rank Position</span>
                <Trophy className="h-4.5 w-4.5 text-amber-500" />
              </div>
              <p className="mt-4 font-sans text-2xl font-extrabold text-amber-500">
                #{attempt.rank || "1"}
              </p>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center justify-between text-gray-400">
                <span className="font-sans text-xs font-bold uppercase tracking-wider">Correct</span>
                <CheckCircle className="h-4.5 w-4.5 text-green-500" />
              </div>
              <p className="mt-4 font-sans text-2xl font-extrabold text-green-600 dark:text-green-400">
                {attempt.correctAnswersCount} <span className="text-xs font-semibold text-gray-400 block">questions</span>
              </p>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center justify-between text-gray-400">
                <span className="font-sans text-xs font-bold uppercase tracking-wider">Time Taken</span>
                <Clock className="h-4.5 w-4.5 text-purple-500" />
              </div>
              <p className="mt-4 font-sans text-2xl font-extrabold">
                {formatSeconds(attempt.timeTaken || attempt.timeSpent)}
              </p>
            </div>
          </div>

          {/* Question Review Feedback List */}
          <div className="space-y-6">
            <h2 className="flex items-center space-x-2 font-sans text-lg font-bold tracking-tight text-gray-800 dark:text-zinc-200">
              <FileText className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <span>QUESTION BY QUESTION REVIEW</span>
            </h2>

            {quiz.questions.map((question: any, index: number) => {
              const qId = question._id ? question._id.toString() : "";
              // Resilient match: try matching by questionIndex or questionId
              const userAnswer = attempt.answers.find(
                (a: any) => a.questionIndex === index || (qId && a.questionId === qId)
              );
              const isCorrect = userAnswer?.isCorrect !== undefined 
                ? userAnswer.isCorrect 
                : userAnswer?.selectedOption?.trim() === question.correctAnswer?.trim();

              return (
                <div
                  key={index}
                  id={`review-question-${index}`}
                  className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
                >
                  {/* Status Indicator Bar */}
                  <div className="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-zinc-800">
                    <span className="font-sans text-xs font-bold text-gray-400">
                      QUESTION {index + 1} ({question.marks} MARKS)
                    </span>
                    {userAnswer ? (
                      isCorrect ? (
                        <span className="flex items-center space-x-1 font-sans text-xs font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full dark:bg-green-950/20 dark:text-green-400">
                          <CheckCircle className="h-3.5 w-3.5" />
                          <span>CORRECT</span>
                        </span>
                      ) : (
                        <span className="flex items-center space-x-1 font-sans text-xs font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-full dark:bg-red-950/20 dark:text-red-400">
                          <XCircle className="h-3.5 w-3.5" />
                          <span>INCORRECT</span>
                        </span>
                      )
                    ) : (
                      <span className="font-sans text-xs font-bold text-gray-500 bg-gray-50 px-2.5 py-1 rounded-full dark:bg-zinc-800 dark:text-zinc-400">
                        UNANSWERED
                      </span>
                    )}
                  </div>

                  {/* Question Text */}
                  <h3 className="mt-4 font-sans text-base font-bold text-gray-900 dark:text-white leading-relaxed">
                    {question.question}
                  </h3>

                  {/* Options with Highlight overlays */}
                  <div className="mt-5 space-y-2.5">
                    {question.options.map((option: string, optIdx: number) => {
                      const isUserChoice = userAnswer?.selectedOption === option;
                      const isCorrectChoice = question.correctAnswer === option;

                      let optionBorderClass = "border-gray-200 dark:border-zinc-800";
                      let optionBgClass = "bg-white dark:bg-zinc-900";
                      let textClass = "text-gray-700 dark:text-zinc-300";

                      if (isCorrectChoice) {
                        optionBorderClass = "border-green-400 dark:border-green-900";
                        optionBgClass = "bg-green-50/40 dark:bg-green-950/10";
                        textClass = "text-green-800 dark:text-green-400 font-semibold";
                      } else if (isUserChoice && !isCorrect) {
                        optionBorderClass = "border-red-300 dark:border-red-900/50";
                        optionBgClass = "bg-red-50/30 dark:bg-red-950/10";
                        textClass = "text-red-800 dark:text-red-400 font-semibold";
                      }

                      return (
                        <div
                          key={optIdx}
                          className={`flex items-center justify-between rounded-xl border p-3.5 text-sm transition ${optionBorderClass} ${optionBgClass}`}
                        >
                          <span className={textClass}>{option}</span>
                          <div className="flex items-center space-x-1.5">
                            {isCorrectChoice && (
                              <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-green-600 bg-green-50 dark:bg-green-950/30 px-2 py-0.5 rounded">
                                Correct Choice
                              </span>
                            )}
                            {isUserChoice && (
                              <span className={`font-mono text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                                isCorrect
                                  ? "text-green-600 bg-green-50 dark:bg-green-950/30"
                                  : "text-red-600 bg-red-50 dark:bg-red-950/30"
                              }`}>
                                Your Answer
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanatory annotation box */}
                  {question.explanation && (
                    <div className="mt-5 rounded-2xl bg-indigo-50/30 p-4 border border-indigo-100/20 dark:bg-indigo-950/10 dark:border-indigo-900/10">
                      <h4 className="font-sans text-xs font-bold text-indigo-900 dark:text-indigo-400 uppercase tracking-wide">
                        Knowledge Explanation Feedback
                      </h4>
                      <p className="mt-2 text-xs font-medium text-gray-600 dark:text-zinc-400 leading-relaxed">
                        {question.explanation}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Quick Bottom Navigation */}
          <div className="pt-6 flex justify-center space-x-4">
            <Link
              to="/quizzes/history"
              className="inline-flex items-center space-x-2 rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 px-6 py-4 text-sm font-bold transition dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
            >
              <TrendingUp className="h-4.5 w-4.5 text-indigo-600 dark:text-indigo-400" />
              <span>View Attempt History</span>
            </Link>
            <Link
              to="/"
              className="inline-flex items-center space-x-2 rounded-2xl bg-indigo-600 px-8 py-4 text-sm font-bold text-white shadow-xl shadow-indigo-600/10 hover:bg-indigo-700 transition"
            >
              <span>Return to Dashboard</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};
