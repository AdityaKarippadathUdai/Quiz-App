import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGetQuizQuery, useUpdateQuizMutation } from "../services/quizApiSlice.js";
import { QuizForm } from "../components/QuizForm.js";
import { AlertCircle, Loader2 } from "lucide-react";

export const EditQuizPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [updateQuiz, { isLoading: isUpdating }] = useUpdateQuizMutation();
  const { data: quizData, isLoading: isFetching, error: fetchError } = useGetQuizQuery(id || "");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const onSubmit = async (data: any) => {
    if (!id) return;
    setErrorMessage(null);

    // Minor validation safeguards
    if (!data.questions || data.questions.length === 0) {
      setErrorMessage("At least one question is required.");
      return;
    }

    for (let i = 0; i < data.questions.length; i++) {
      const q = data.questions[i];
      if (!q.options.includes(q.correctAnswer)) {
        setErrorMessage(
          `Question #${i + 1} correct answer "${q.correctAnswer}" must match one of its options: [${q.options.join(
            ", "
          )}]`
        );
        return;
      }
    }

    try {
      const result = await updateQuiz({ id, body: data }).unwrap();
      if (result.success) {
        navigate("/");
      } else {
        setErrorMessage(result.message || "An unexpected error occurred while saving the assessment.");
      }
    } catch (err: any) {
      setErrorMessage(
        err?.data?.message || "Failed to communicate with backend. Verify structure and try again."
      );
    }
  };

  if (isFetching) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-zinc-950">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
          <p className="font-mono text-xs tracking-widest text-gray-500 dark:text-zinc-400">
            FETCHING ASSESSMENT CONFIG...
          </p>
        </div>
      </div>
    );
  }

  if (fetchError || !quizData?.data?.quiz) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-6 text-center dark:bg-zinc-950">
        <div className="max-w-md space-y-4 rounded-2xl bg-white p-8 shadow-sm border border-gray-100 dark:bg-zinc-900 dark:border-zinc-800">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h2 className="font-sans text-xl font-bold text-gray-900 dark:text-white">
            Assessment Not Found
          </h2>
          <p className="text-sm text-gray-500 dark:text-zinc-400">
            The quiz configuration file you requested does not exist or has been removed.
          </p>
          <button
            onClick={() => navigate("/")}
            className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            Back to Workspace
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 transition-colors duration-300 dark:bg-zinc-950 dark:text-zinc-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {errorMessage && (
          <div className="mb-6 flex items-start space-x-2 rounded-xl bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-400 border border-red-100 dark:border-red-900/50">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="font-semibold">Update Error</p>
              <p className="text-xs opacity-90">{errorMessage}</p>
            </div>
          </div>
        )}

        <QuizForm
          title={`Edit Assessment: ${quizData.data.quiz.title}`}
          initialData={quizData.data.quiz}
          onSubmit={onSubmit}
          isLoading={isUpdating}
          onCancel={() => navigate("/")}
        />
      </div>
    </div>
  );
};
export default EditQuizPage;
