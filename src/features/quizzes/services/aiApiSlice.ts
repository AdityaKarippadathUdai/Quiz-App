import { apiSlice } from "../../../store/apiSlice.js";
import { Quiz } from "../../../types.js";

export interface IGeneratedQuestion {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
}

export interface IGenerateQuestionsParams {
  topic: string;
  difficulty: string;
  numQuestions: number;
}

export interface ISaveGeneratedQuizParams {
  title: string;
  description: string;
  category: string;
  difficulty: string;
  timeLimit: number;
  negativeMarking: boolean;
  questions: IGeneratedQuestion[];
  isPublished: boolean;
}

export const aiApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    generateQuestions: builder.mutation<{ success: boolean; data: { questions: IGeneratedQuestion[] } }, IGenerateQuestionsParams>({
      query: (body) => ({
        url: "/ai/generate",
        method: "POST",
        body,
      }),
    }),
    saveGeneratedQuiz: builder.mutation<{ success: boolean; message: string; data: Quiz }, ISaveGeneratedQuizParams>({
      query: (body) => ({
        url: "/ai/save",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Quiz", id: "LIST" }],
    }),
  }),
});

export const {
  useGenerateQuestionsMutation,
  useSaveGeneratedQuizMutation,
} = aiApiSlice;
