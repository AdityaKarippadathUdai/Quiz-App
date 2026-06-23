import React from "react";
import { HelpCircle, Award } from "lucide-react";
import { Question } from "../../../types.js";

interface QuestionCardProps {
  question: Question;
  currentIndex: number;
  totalQuestions: number;
  selectedOption?: string;
  onSelectOption: (option: string) => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  currentIndex,
  totalQuestions,
  selectedOption,
  onSelectOption,
}) => {
  return (
    <div
      id={`question-card-${currentIndex}`}
      className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition dark:border-zinc-800 dark:bg-zinc-900"
    >
      {/* Question Header Status */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-zinc-800">
        <div className="flex items-center space-x-2">
          <HelpCircle className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          <span className="font-sans text-sm font-bold text-gray-500 dark:text-zinc-400">
            QUESTION {currentIndex + 1} OF {totalQuestions}
          </span>
        </div>
        <div className="flex items-center space-x-1 rounded-full bg-indigo-50 px-3 py-1 font-mono text-[11px] font-bold text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400">
          <Award className="h-3.5 w-3.5" />
          <span>{question.marks} MARKS</span>
        </div>
      </div>

      {/* Question Body */}
      <div className="mt-6">
        <h2 className="font-sans text-lg font-bold leading-relaxed text-gray-900 dark:text-zinc-50">
          {question.question}
        </h2>

        {/* Options List */}
        <div className="mt-6 space-y-3">
          {question.options.map((option, optIdx) => {
            const isSelected = selectedOption === option;
            const letterLabel = String.fromCharCode(65 + optIdx); // A, B, C, D

            return (
              <button
                key={optIdx}
                onClick={() => onSelectOption(option)}
                id={`option-btn-${optIdx}`}
                className={`flex w-full items-center rounded-2xl border p-4 text-left transition duration-200 focus:outline-none ${
                  isSelected
                    ? "border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-600/20 dark:border-indigo-500 dark:bg-indigo-950/20"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50 dark:border-zinc-800 dark:hover:border-zinc-700 dark:hover:bg-zinc-800/50"
                }`}
              >
                {/* Visual Label (A, B, C, D) */}
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-mono text-xs font-bold transition-colors ${
                    isSelected
                      ? "bg-indigo-600 text-white dark:bg-indigo-500"
                      : "bg-gray-100 text-gray-500 dark:bg-zinc-800 dark:text-zinc-400"
                  }`}
                >
                  {letterLabel}
                </div>

                {/* Option Text */}
                <span className="ml-4 font-sans text-sm font-semibold text-gray-700 dark:text-zinc-300">
                  {option}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
