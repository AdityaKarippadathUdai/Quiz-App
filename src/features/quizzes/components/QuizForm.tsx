import React from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { Plus, Trash2, HelpCircle, Save, ArrowLeft, Image as ImageIcon } from "lucide-react";
import { Quiz, QuizDifficulty, Question } from "../../../types.js";

interface QuizFormProps {
  initialData?: Quiz;
  onSubmit: (data: any) => void;
  isLoading: boolean;
  onCancel: () => void;
  title: string;
}

export const QuizForm: React.FC<QuizFormProps> = ({
  initialData,
  onSubmit,
  isLoading,
  onCancel,
  title,
}) => {
  // Setup React Hook Form with defaults
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      category: initialData?.category || "",
      difficulty: initialData?.difficulty || QuizDifficulty.MEDIUM,
      thumbnail: initialData?.thumbnail || "",
      timeLimit: initialData?.timeLimit || 15,
      negativeMarking: initialData?.negativeMarking || false,
      questions: initialData?.questions || [
        {
          question: "",
          options: ["", ""],
          correctAnswer: "",
          explanation: "",
          marks: 1,
        },
      ],
    },
  });

  // Dynamic Array for Questions list
  const { fields: questionFields, append: appendQuestion, remove: removeQuestion } = useFieldArray({
    control,
    name: "questions",
  });

  const watchQuestions = watch("questions");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 pb-12">
      {/* Upper Action/Header Panel */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 pb-5 dark:border-zinc-800">
        <div>
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center space-x-2 text-sm font-semibold text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </button>
          <h1 className="mt-2 font-sans text-2xl font-black tracking-tight text-gray-900 dark:text-white sm:text-3xl">
            {title}
          </h1>
        </div>
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center space-x-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/10 hover:bg-indigo-700 transition disabled:pointer-events-none disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            <span>{isLoading ? "Saving..." : "Save Quiz"}</span>
          </button>
        </div>
      </div>

      {/* Two-Column Form Layout */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Core Settings Column */}
        <div className="space-y-6 lg:col-span-1">
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100 dark:bg-zinc-900 dark:border-zinc-800">
            <h2 className="font-sans text-lg font-bold text-gray-900 dark:text-white mb-4">
              Quiz Metadata
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                  Quiz Title
                </label>
                <input
                  type="text"
                  {...register("title", { required: "Title is required" })}
                  className="mt-1 block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                  placeholder="e.g., JavaScript Fundamentals"
                />
                {errors.title && (
                  <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                  Description
                </label>
                <textarea
                  {...register("description", { required: "Description is required" })}
                  rows={3}
                  className="mt-1 block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                  placeholder="Provide context and summary of the quiz"
                />
                {errors.description && (
                  <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                  Category
                </label>
                <input
                  type="text"
                  {...register("category", { required: "Category is required" })}
                  className="mt-1 block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                  placeholder="e.g., Web Development"
                />
                {errors.category && (
                  <p className="mt-1 text-xs text-red-500">{errors.category.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                    Difficulty
                  </label>
                  <select
                    {...register("difficulty")}
                    className="mt-1 block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                  >
                    <option value={QuizDifficulty.EASY}>Easy</option>
                    <option value={QuizDifficulty.MEDIUM}>Medium</option>
                    <option value={QuizDifficulty.HARD}>Hard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                    Time Limit (Mins)
                  </label>
                  <input
                    type="number"
                    {...register("timeLimit", {
                      required: true,
                      valueAsNumber: true,
                      min: 1,
                    })}
                    className="mt-1 block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                  Cover Image URL
                </label>
                <div className="relative mt-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <ImageIcon className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    {...register("thumbnail")}
                    className="block w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-10 pr-3 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="relative flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    {...register("negativeMarking")}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-zinc-600 peer-checked:bg-indigo-600"></div>
                  <span className="ml-3 text-sm font-semibold text-gray-700 dark:text-zinc-300">
                    Enable Negative Marking
                  </span>
                </label>
                <p className="mt-1 text-xs text-gray-400">
                  Deducts 25% of marks for incorrect attempts.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Questions Builder Column */}
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100 dark:bg-zinc-900 dark:border-zinc-800">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-zinc-800 mb-6">
              <h2 className="font-sans text-lg font-bold text-gray-900 dark:text-white">
                Questions List ({questionFields.length})
              </h2>
              <button
                type="button"
                onClick={() =>
                  appendQuestion({
                    question: "",
                    options: ["", ""],
                    correctAnswer: "",
                    explanation: "",
                    marks: 1,
                  })
                }
                className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
              >
                <Plus className="h-4 w-4" />
                <span>Add Question</span>
              </button>
            </div>

            {errors.questions && !Array.isArray(errors.questions) && (
              <p className="mb-4 text-xs font-medium text-red-500">
                {errors.questions.message}
              </p>
            )}

            <div className="space-y-6">
              {questionFields.map((field, qIndex) => {
                const qError = errors.questions?.[qIndex];
                const optionsList = watchQuestions[qIndex]?.options || [];

                return (
                  <div
                    key={field.id}
                    className="relative rounded-xl border border-gray-100 p-5 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-950/30 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                        QUESTION #{qIndex + 1}
                      </span>
                      {questionFields.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeQuestion(qIndex)}
                          className="text-red-500 hover:text-red-600 transition"
                          title="Remove Question"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    {/* Question Prompt */}
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                        Question Text
                      </label>
                      <input
                        type="text"
                        {...register(`questions.${qIndex}.question` as const, {
                          required: "Question text is required",
                        })}
                        className="mt-1 block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
                        placeholder="e.g., What is the output of typeof null?"
                      />
                      {qError?.question && (
                        <p className="mt-1 text-xs text-red-500">{qError.question.message}</p>
                      )}
                    </div>

                    {/* Options List */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                          Options
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            const currentOptions = [...optionsList, ""];
                            setValue(`questions.${qIndex}.options` as const, currentOptions);
                          }}
                          className="flex items-center space-x-1 text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                        >
                          <Plus className="h-3 w-3" />
                          <span>Add Option</span>
                        </button>
                      </div>

                      <div className="grid gap-2 sm:grid-cols-2">
                        {optionsList.map((option, optIndex) => (
                          <div key={optIndex} className="flex items-center space-x-2">
                            <span className="font-sans text-xs font-bold text-gray-400">
                              {String.fromCharCode(65 + optIndex)}.
                            </span>
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => {
                                const newOpts = [...optionsList];
                                newOpts[optIndex] = e.target.value;
                                setValue(`questions.${qIndex}.options` as const, newOpts);
                              }}
                              required
                              className="block w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
                              placeholder={`Option ${optIndex + 1}`}
                            />
                            {optionsList.length > 2 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const newOpts = optionsList.filter((_, idx) => idx !== optIndex);
                                  setValue(`questions.${qIndex}.options` as const, newOpts);
                                }}
                                className="text-gray-400 hover:text-red-500"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Correct Answer and Marks */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                          Correct Answer
                        </label>
                        <select
                          value={watchQuestions[qIndex]?.correctAnswer || ""}
                          onChange={(e) =>
                            setValue(`questions.${qIndex}.correctAnswer` as const, e.target.value)
                          }
                          required
                          className="mt-1 block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
                        >
                          <option value="">-- Select Correct Choice --</option>
                          {optionsList.map((opt, oIdx) => (
                            <option key={oIdx} value={opt} disabled={!opt}>
                              {opt ? `${String.fromCharCode(65 + oIdx)}: ${opt}` : `Empty Choice ${oIdx + 1}`}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                          Marks
                        </label>
                        <input
                          type="number"
                          {...register(`questions.${qIndex}.marks` as const, {
                            required: true,
                            valueAsNumber: true,
                            min: 1,
                          })}
                          className="mt-1 block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
                        />
                      </div>
                    </div>

                    {/* Explanation */}
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                        Explanation (Optional)
                      </label>
                      <textarea
                        {...register(`questions.${qIndex}.explanation` as const)}
                        rows={2}
                        className="mt-1 block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
                        placeholder="Explain why this choice is correct..."
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={() =>
                  appendQuestion({
                    question: "",
                    options: ["", ""],
                    correctAnswer: "",
                    explanation: "",
                    marks: 1,
                  })
                }
                className="flex items-center space-x-2 rounded-xl border border-dashed border-gray-300 px-6 py-3 text-sm font-semibold text-gray-500 hover:border-indigo-500 hover:text-indigo-600 dark:border-zinc-800 dark:text-zinc-400 dark:hover:text-indigo-400 transition"
              >
                <Plus className="h-4 w-4" />
                <span>Add Question Block</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};
