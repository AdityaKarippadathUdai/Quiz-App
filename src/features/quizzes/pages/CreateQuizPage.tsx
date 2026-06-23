import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateQuizMutation } from "../services/quizApiSlice.js";
import { QuizForm } from "../components/QuizForm.js";
import { AlertCircle } from "lucide-react";

export const CreateQuizPage: React.FC = () => {
  const navigate = useNavigate();
  const [createQuiz, { isLoading }] = useCreateQuizMutation();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const onSubmit = async (data: any) => {
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
      const result = await createQuiz(data).unwrap();
      if (result.success) {
        navigate("/");
      } else {
        setErrorMessage(result.message || "An unexpected error occurred while creating quiz.");
      }
    } catch (err: any) {
      setErrorMessage(
        err?.data?.message || "Failed to communicate with backend. Verify structure and try again."
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 transition-colors duration-300 dark:bg-zinc-950 dark:text-zinc-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {errorMessage && (
          <div className="mb-6 flex items-start space-x-2 rounded-xl bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-400 border border-red-100 dark:border-red-900/50">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="font-semibold">Creation Error</p>
              <p className="text-xs opacity-90">{errorMessage}</p>
            </div>
          </div>
        )}

        <QuizForm
          title="Create New Assessment"
          onSubmit={onSubmit}
          isLoading={isLoading}
          onCancel={() => navigate("/")}
        />
      </div>
    </div>
  );
};
export default CreateQuizPage;
