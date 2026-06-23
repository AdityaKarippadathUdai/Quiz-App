import React from "react";
import { Grid, Eye } from "lucide-react";

interface QuestionPaletteProps {
  totalQuestions: number;
  currentIndex: number;
  answers: Record<string, string>; // questionId -> selectedOption
  questionIds: string[];
  markedForReview: Set<number>; // Indices marked for review
  onJumpToQuestion: (index: number) => void;
}

export const QuestionPalette: React.FC<QuestionPaletteProps> = ({
  totalQuestions,
  currentIndex,
  answers,
  questionIds,
  markedForReview,
  onJumpToQuestion,
}) => {
  return (
    <div
      id="question-palette-container"
      className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
    >
      <div className="flex items-center space-x-2 border-b border-gray-100 pb-4 dark:border-zinc-800">
        <Grid className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
        <span className="font-sans text-sm font-bold text-gray-800 dark:text-zinc-200">
          QUESTION PALETTE
        </span>
      </div>

      {/* Grid of numbers */}
      <div className="mt-6 grid grid-cols-5 gap-2">
        {Array.from({ length: totalQuestions }).map((_, idx) => {
          const qId = questionIds[idx];
          const hasAnswer = qId && !!answers[qId];
          const isMarked = markedForReview.has(idx);
          const isCurrent = idx === currentIndex;

          // Color calculation
          let bgClass = "bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800";
          
          if (hasAnswer) {
            bgClass = "bg-green-500 border-green-600 text-white hover:bg-green-600 dark:bg-green-600 dark:border-green-700 dark:hover:bg-green-500";
          }
          if (isMarked) {
            bgClass = "bg-amber-500 border-amber-600 text-white hover:bg-amber-600 dark:bg-amber-600 dark:border-amber-700 dark:hover:bg-amber-500";
          }
          if (isCurrent) {
            bgClass = "bg-indigo-600 border-indigo-700 text-white hover:bg-indigo-700 ring-2 ring-indigo-500/30 dark:bg-indigo-500 dark:border-indigo-600";
          }

          return (
            <button
              key={idx}
              id={`palette-btn-${idx}`}
              onClick={() => onJumpToQuestion(idx)}
              className={`flex h-10 w-10 items-center justify-center rounded-xl border text-xs font-mono font-bold transition duration-200 focus:outline-none ${bgClass}`}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>

      {/* Color legends */}
      <div className="mt-6 border-t border-gray-100 pt-5 space-y-2 dark:border-zinc-800">
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <span className="h-3.5 w-3.5 rounded-md bg-indigo-600 dark:bg-indigo-500 border border-indigo-700 inline-block" />
            <span className="font-sans font-semibold text-gray-500 dark:text-zinc-400">Current</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="h-3.5 w-3.5 rounded-md bg-green-500 dark:bg-green-600 border border-green-600 inline-block" />
            <span className="font-sans font-semibold text-gray-500 dark:text-zinc-400">Answered</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="h-3.5 w-3.5 rounded-md bg-amber-500 dark:bg-amber-600 border border-amber-600 inline-block" />
            <span className="font-sans font-semibold text-gray-500 dark:text-zinc-400">Review</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="h-3.5 w-3.5 rounded-md bg-gray-50 border border-gray-200 dark:bg-zinc-950 dark:border-zinc-800 inline-block" />
            <span className="font-sans font-semibold text-gray-500 dark:text-zinc-400">Unvisited</span>
          </div>
        </div>
      </div>
    </div>
  );
};
