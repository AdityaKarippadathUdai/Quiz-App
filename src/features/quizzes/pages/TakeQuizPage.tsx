import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "motion/react";
import {
  useGetAttemptResultQuery,
  useSaveProgressMutation,
  useSubmitAttemptMutation,
} from "../services/attemptApiSlice.js";
import { Timer } from "../components/Timer.js";
import { QuestionCard } from "../components/QuestionCard.js";
import { QuestionPalette } from "../components/QuestionPalette.js";
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  Check,
  RotateCcw,
  AlertTriangle,
  CloudLightning,
  CloudOff,
  Cloud,
} from "lucide-react";
import { AttemptStatus } from "../../../types.js";

type SyncState = "SAVED" | "SAVING" | "ERROR";

export const TakeQuizPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Current question pointer
  const [currentIndex, setCurrentIndex] = useState(0);

  // Local answers state dictionary: questionId -> selectedOption
  const [answers, setAnswers] = useState<Record<string, string>>({});

  // Marked for review indices state set
  const [markedForReview, setMarkedForReview] = useState<Set<number>>(new Set());

  // Cloud sync status state
  const [syncState, setSyncState] = useState<SyncState>("SAVED");

  // Timer trackers
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

  // Query and Mutation API hooks
  const { data: attemptResponse, isLoading, error, refetch } = useGetAttemptResultQuery(id || "", {
    skip: !id,
    refetchOnMountOrArgChange: true,
  });

  const [saveProgress] = useSaveProgressMutation();
  const [submitAttempt, { isLoading: isSubmitting }] = useSubmitAttemptMutation();

  const attempt = attemptResponse?.data?.attempt;
  const quiz = attemptResponse?.data?.quiz;

  // Auto-submit guard ref to prevent multiple triggerings
  const hasAutoSubmitted = useRef(false);

  // Load backend states into local states
  useEffect(() => {
    if (attempt) {
      // Redirect if already completed
      if (attempt.status === AttemptStatus.COMPLETED) {
        navigate(`/quizzes/result/${attempt._id}`, { replace: true });
        return;
      }

      // Sync answers dictionary
      const backendAnswers: Record<string, string> = {};
      attempt.answers.forEach((ans) => {
        backendAnswers[ans.questionId] = ans.selectedOption;
      });
      setAnswers(backendAnswers);

      // Initialize remaining seconds
      if (quiz && secondsLeft === null) {
        const totalDuration = quiz.timeLimit * 60;
        const remaining = Math.max(0, totalDuration - attempt.timeSpent);
        setSecondsLeft(remaining);
      }
    }
  }, [attempt, quiz, navigate]);

  // Periodic autosave for time spent and answers every 10 seconds
  useEffect(() => {
    if (!attempt || !quiz || secondsLeft === null || attempt.status === AttemptStatus.COMPLETED) return;

    const interval = setInterval(async () => {
      await handleSyncProgress();
    }, 10000);

    return () => clearInterval(interval);
  }, [answers, secondsLeft, attempt, quiz]);

  const handleSyncProgress = async (answersOverride?: Record<string, string>) => {
    if (!id || !attempt || !quiz || secondsLeft === null) return;
    setSyncState("SAVING");

    const answersList = Object.entries(answersOverride || answers).map(([questionId, selectedOption]) => ({
      questionId,
      selectedOption,
    }));

    const totalDuration = quiz.timeLimit * 60;
    const timeSpent = Math.max(0, totalDuration - secondsLeft);

    try {
      await saveProgress({
        attemptId: id,
        answers: answersList,
        timeSpent,
      }).unwrap();
      setSyncState("SAVED");
    } catch (err) {
      console.error("Autosave sync failed:", err);
      setSyncState("ERROR");
    }
  };

  const handleSelectOption = async (option: string) => {
    if (!quiz) return;
    const currentQuestion = quiz.questions[currentIndex];
    const qId = (currentQuestion as any)._id;

    const updatedAnswers = {
      ...answers,
      [qId]: option,
    };

    setAnswers(updatedAnswers);
    // Instantly save to the cloud when user makes a selection
    await handleSyncProgress(updatedAnswers);
  };

  const handleClearChoice = async () => {
    if (!quiz) return;
    const currentQuestion = quiz.questions[currentIndex];
    const qId = (currentQuestion as any)._id;

    const updatedAnswers = { ...answers };
    delete updatedAnswers[qId];

    setAnswers(updatedAnswers);
    await handleSyncProgress(updatedAnswers);
  };

  const handleToggleMarkForReview = () => {
    const nextMarked = new Set(markedForReview);
    if (nextMarked.has(currentIndex)) {
      nextMarked.delete(currentIndex);
    } else {
      nextMarked.add(currentIndex);
    }
    setMarkedForReview(nextMarked);
  };

  const handleTimerTick = (remaining: number) => {
    setSecondsLeft(remaining);
  };

  const handleTimerExpire = async () => {
    if (hasAutoSubmitted.current) return;
    hasAutoSubmitted.current = true;

    setSyncState("SAVING");
    try {
      const answersList = Object.entries(answers).map(([questionId, selectedOption]) => ({
        questionId,
        selectedOption,
      }));

      await submitAttempt({
        attemptId: id || "",
        answers: answersList,
        timeSpent: quiz ? quiz.timeLimit * 60 : 0,
      }).unwrap();

      navigate(`/quizzes/result/${id}`, { replace: true });
    } catch (err) {
      alert("Assessment time is up! We faced an issue auto-submitting, but your progress has been securely saved.");
    }
  };

  const handleManualSubmit = async () => {
    const totalCount = quiz?.questions.length || 0;
    const answeredCount = Object.keys(answers).length;
    const unansweredCount = totalCount - answeredCount;

    const confirmMsg = unansweredCount > 0 
      ? `You have ${unansweredCount} unanswered questions left. Are you sure you want to finalize and submit this assessment?`
      : "Are you sure you want to finalize and submit this assessment?";

    if (window.confirm(confirmMsg)) {
      setSyncState("SAVING");
      try {
        const answersList = Object.entries(answers).map(([questionId, selectedOption]) => ({
          questionId,
          selectedOption,
        }));

        const totalDuration = quiz ? quiz.timeLimit * 60 : 0;
        const timeSpent = secondsLeft !== null ? Math.max(0, totalDuration - secondsLeft) : 0;

        await submitAttempt({
          attemptId: id || "",
          answers: answersList,
          timeSpent,
        }).unwrap();

        navigate(`/quizzes/result/${id}`, { replace: true });
      } catch (err: any) {
        alert(err?.data?.message || "Failed to submit assessment. Please try again.");
        setSyncState("ERROR");
      }
    }
  };

  if (isLoading || secondsLeft === null) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-zinc-950">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
        <p className="mt-4 font-mono text-xs tracking-wider text-gray-400">CONNECTING SECURE SESSION...</p>
      </div>
    );
  }

  if (error || !attempt || !quiz) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-zinc-950 px-6 text-center">
        <AlertTriangle className="h-12 w-12 text-red-500" />
        <h2 className="mt-4 font-sans text-xl font-bold text-gray-900 dark:text-white">Active session error</h2>
        <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400">We could not load or verify your active quiz taking session.</p>
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

  const currentQuestion = quiz.questions[currentIndex];
  const currentQId = (currentQuestion as any)._id;
  const currentAnswer = answers[currentQId];
  const questionIds = quiz.questions.map((q: any) => q._id);

  return (
    <div id="quiz-gameplay-wrapper" className="min-h-screen bg-gray-50 text-gray-900 transition-colors duration-300 dark:bg-zinc-950 dark:text-zinc-50">
      {/* Upper Active Header */}
      <header className="sticky top-0 z-10 border-b border-gray-100 bg-white px-6 py-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center space-x-4">
            <div>
              <h1 className="font-sans text-base font-extrabold tracking-tight">{quiz.title}</h1>
              <div className="mt-0.5 flex items-center space-x-2">
                <span className="font-mono text-[10px] font-bold text-gray-400 uppercase tracking-wider">{quiz.category}</span>
                {quiz.negativeMarking && (
                  <span className="font-mono text-[9px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/50 dark:bg-amber-950/20 dark:border-amber-900/30">
                    NEGATIVE PENALTY (25%)
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Sync Badge */}
            <div className="hidden sm:flex items-center space-x-1.5 text-xs font-semibold text-gray-400">
              {syncState === "SAVED" ? (
                <>
                  <Cloud className="h-4 w-4 text-green-500" />
                  <span className="text-[11px] font-medium text-green-600 dark:text-green-400">Autosaved</span>
                </>
              ) : syncState === "SAVING" ? (
                <>
                  <CloudLightning className="h-4 w-4 text-indigo-500 animate-bounce" />
                  <span className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400">Syncing...</span>
                </>
              ) : (
                <>
                  <CloudOff className="h-4 w-4 text-red-500" />
                  <span className="text-[11px] font-medium text-red-500">Offline Error</span>
                </>
              )}
            </div>

            {/* Timer */}
            <Timer
              initialSeconds={secondsLeft}
              onTick={handleTimerTick}
              onExpire={handleTimerExpire}
            />
          </div>
        </div>
      </header>

      {/* Main taking screen split layout */}
      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Left Column: Active Question */}
          <div className="lg:col-span-8 space-y-6">
            {/* Progress Bar */}
            <div className="rounded-2xl border border-gray-100 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex justify-between text-xs font-bold text-gray-400 mb-2">
                <span>PROGRESS</span>
                <span>{Object.keys(answers).length} of {quiz.questions.length} answered</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-zinc-800">
                <div
                  className="h-full bg-indigo-600 transition-all duration-300 dark:bg-indigo-500"
                  style={{ width: `${(Object.keys(answers).length / quiz.questions.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Question Display Card */}
            <QuestionCard
              question={currentQuestion}
              currentIndex={currentIndex}
              totalQuestions={quiz.questions.length}
              selectedOption={currentAnswer}
              onSelectOption={handleSelectOption}
            />

            {/* Gameplay Navigation bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-gray-100 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex gap-2">
                <button
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex((p) => p - 1)}
                  className="flex items-center space-x-1.5 rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 transition"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>PREVIOUS</span>
                </button>
                <button
                  disabled={currentIndex === quiz.questions.length - 1}
                  onClick={() => setCurrentIndex((p) => p + 1)}
                  className="flex items-center space-x-1.5 rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 transition"
                >
                  <span>NEXT</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={handleToggleMarkForReview}
                  className={`flex items-center space-x-1.5 rounded-xl border px-4 py-2.5 text-xs font-bold transition ${
                    markedForReview.has(currentIndex)
                      ? "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-400"
                      : "border-gray-200 text-gray-500 hover:bg-gray-50 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800"
                  }`}
                >
                  <Bookmark className="h-3.5 w-3.5" />
                  <span>
                    {markedForReview.has(currentIndex) ? "MARKED FOR REVIEW" : "MARK FOR REVIEW"}
                  </span>
                </button>

                <button
                  onClick={handleClearChoice}
                  className="flex items-center space-x-1.5 rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-bold text-gray-500 hover:text-red-500 hover:bg-red-50 hover:border-red-100 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800/50 transition"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>CLEAR CHOICE</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Sidebar Palette & Quick Actions */}
          <div className="lg:col-span-4 space-y-6">
            <QuestionPalette
              totalQuestions={quiz.questions.length}
              currentIndex={currentIndex}
              answers={answers}
              questionIds={questionIds}
              markedForReview={markedForReview}
              onJumpToQuestion={(idx) => setCurrentIndex(idx)}
            />

            {/* Submission Actions */}
            <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
              <h3 className="font-sans text-sm font-bold text-gray-800 dark:text-zinc-200">
                FINALIZE ASSESSMENT
              </h3>
              <p className="text-xs text-gray-500 dark:text-zinc-400">
                Double-check your answers in the Question Palette before completing. Your progress is fully synchronized.
              </p>
              <button
                onClick={handleManualSubmit}
                disabled={isSubmitting}
                id="submit-assessment-btn"
                className="flex w-full items-center justify-center space-x-2 rounded-2xl bg-indigo-600 py-4 text-sm font-bold text-white shadow-xl shadow-indigo-600/10 hover:bg-indigo-700 disabled:opacity-50 transition"
              >
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Grading assessment...</span>
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    <span>Submit & Finish Quiz</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
