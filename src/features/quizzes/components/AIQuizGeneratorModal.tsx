import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, X, Brain, Wand2, Loader2, AlertCircle, HelpCircle } from "lucide-react";
import { useGenerateQuestionsMutation } from "../services/aiApiSlice.js";
import { QuizDifficulty } from "../../../types.js";

interface AIQuizGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIQuizGeneratorModal: React.FC<AIQuizGeneratorModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [generateQuestions, { isLoading }] = useGenerateQuestionsMutation();

  // Form State
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState<QuizDifficulty>(QuizDifficulty.MEDIUM);
  const [numQuestions, setNumQuestions] = useState(5);
  const [error, setError] = useState<string | null>(null);

  // Status/Tip cycle for the loader
  const [loadingTip, setLoadingTip] = useState("Analyzing topic and structuring core concepts...");

  React.useEffect(() => {
    if (!isLoading) return;

    const tips = [
      "Analyzing topic and structuring core concepts...",
      "Generating multiple choice options with plausible distractors...",
      "Formulating detailed educational explanations...",
      "Validating answer mappings for accuracy...",
      "Polishing output schema and prepping preview stage..."
    ];

    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % tips.length;
      setLoadingTip(tips[index]);
    }, 2500);

    return () => clearInterval(interval);
  }, [isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!topic.trim()) {
      setError("Please enter a topic to guide the AI generator.");
      return;
    }

    try {
      const response = await generateQuestions({
        topic: topic.trim(),
        difficulty,
        numQuestions,
      }).unwrap();

      if (response.success && response.data.questions) {
        onClose();
        // Redirect to the preview page with questions, topic and difficulty passed in router state
        navigate("/quizzes/preview", {
          state: {
            questions: response.data.questions,
            topic: topic.trim(),
            difficulty,
          },
        });
      } else {
        setError("Failed to generate questions. Please try again.");
      }
    } catch (err: any) {
      console.error(err);
      setError(
        err?.data?.message ||
          "An error occurred while generating questions with Gemini. Please try a different topic or try again later."
      );
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={isLoading ? undefined : onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-xs"
          />

          {/* Modal content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-2xl transition-colors dark:border-zinc-800 dark:bg-zinc-900"
          >
            {/* Header Banner */}
            <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-6 py-4.5 dark:border-zinc-800 dark:bg-zinc-900/50">
              <div className="flex items-center space-x-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600/10 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400">
                  <Sparkles className="h-4.5 w-4.5 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-sans text-base font-black text-gray-900 dark:text-white">AI Assessment Generator</h3>
                  <p className="text-[10px] text-gray-400 font-mono">POWERED BY GEMINI 3.5 FLASH</p>
                </div>
              </div>
              {!isLoading && (
                <button
                  onClick={onClose}
                  className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Inner Content */}
            <div className="p-6">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="relative flex h-20 w-20 items-center justify-center">
                    <div className="absolute inset-0 animate-ping rounded-full bg-indigo-600/10 dark:bg-indigo-500/10" />
                    <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-white shadow-md shadow-indigo-600/20">
                      <Wand2 className="h-6 w-6 animate-pulse" />
                    </div>
                  </div>

                  <h4 className="mt-6 font-sans text-base font-black text-gray-900 dark:text-white">
                    Generating Assessment...
                  </h4>
                  <p className="mt-2 text-xs text-gray-500 dark:text-zinc-400 max-w-xs leading-relaxed">
                    Gemini AI is crafting specialized questions tailored to your requirements.
                  </p>

                  <div className="mt-8 w-full max-w-sm rounded-2xl bg-gray-50 p-4 border border-gray-100 dark:bg-zinc-950/40 dark:border-zinc-800/80">
                    <div className="flex space-x-2">
                      <Loader2 className="h-4 w-4 shrink-0 animate-spin text-indigo-600 dark:text-indigo-400" />
                      <p className="font-mono text-[10px] text-left text-indigo-600 dark:text-indigo-400 font-medium leading-normal tracking-wide">
                        {loadingTip}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {error && (
                    <div className="flex items-start space-x-2 rounded-2xl bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/25 dark:text-red-400 border border-red-100 dark:border-red-900/30">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                      <div>
                        <p className="font-bold text-xs">Generation Failed</p>
                        <p className="text-[11px] opacity-90 leading-relaxed mt-0.5">{error}</p>
                      </div>
                    </div>
                  )}

                  {/* Topic Input */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                      Topic or Subject
                    </label>
                    <input
                      type="text"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="e.g., Quantum Mechanics, React Hook Patterns, World War II History"
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-hidden transition dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                      required
                    />
                  </div>

                  {/* Difficulty Selector */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                        Difficulty Level
                      </label>
                      <select
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value as QuizDifficulty)}
                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-hidden transition dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                      >
                        <option value={QuizDifficulty.EASY}>Easy</option>
                        <option value={QuizDifficulty.MEDIUM}>Medium</option>
                        <option value={QuizDifficulty.HARD}>Hard</option>
                      </select>
                    </div>

                    {/* Question Count Selector */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                        Questions Count
                      </label>
                      <select
                        value={numQuestions}
                        onChange={(e) => setNumQuestions(Number(e.target.value))}
                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-hidden transition dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                      >
                        <option value="3">3 Questions</option>
                        <option value="5">5 Questions</option>
                        <option value="10">10 Questions</option>
                        <option value="15">15 Questions</option>
                        <option value="20">20 Questions</option>
                      </select>
                    </div>
                  </div>

                  {/* Suggestion prompt helper cards */}
                  <div className="rounded-2xl bg-indigo-50/50 p-4 border border-indigo-100/40 dark:bg-zinc-950/20 dark:border-zinc-800/60">
                    <div className="flex space-x-2.5">
                      <Brain className="h-4 w-4 text-indigo-500 mt-0.5 shrink-0" />
                      <div>
                        <h5 className="text-[11px] font-bold text-indigo-700 dark:text-indigo-400">Pro Tip</h5>
                        <p className="text-[10px] text-gray-500 dark:text-zinc-400 mt-0.5 leading-normal">
                          For best results, provide a descriptive topic. For instance, instead of just "Math", use "Linear Algebra and Vector Matrices".
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Submit buttons */}
                  <div className="mt-4 flex items-center justify-end space-x-3 border-t border-gray-100 pt-4 dark:border-zinc-800">
                    <button
                      type="button"
                      onClick={onClose}
                      className="rounded-xl border border-gray-200 bg-white px-4.5 py-2.5 text-xs font-bold text-gray-500 hover:bg-gray-50 transition dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex items-center space-x-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-5 py-2.5 text-xs font-bold text-white transition shadow-sm hover:shadow-md dark:bg-indigo-600 dark:hover:bg-indigo-500"
                    >
                      <Wand2 className="h-3.5 w-3.5" />
                      <span>Generate Assessment</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
export default AIQuizGeneratorModal;
