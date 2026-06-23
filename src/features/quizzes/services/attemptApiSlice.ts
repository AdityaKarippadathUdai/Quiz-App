import { apiSlice } from "../../../store/apiSlice.js";
import { Attempt, Quiz } from "../../../types.js";

export const attemptApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    startAttempt: builder.mutation<{ success: boolean; message: string; data: { attempt: Attempt; quiz: Quiz } }, string>({
      query: (quizId) => ({
        url: `/attempts/start/${quizId}`,
        method: "POST",
      }),
      invalidatesTags: ["Attempt", "Analytics"],
    }),
    saveProgress: builder.mutation<{ success: boolean; data: { attempt: Attempt } }, { attemptId: string; answers: { questionId: string; selectedOption: string }[]; timeSpent: number }>({
      query: ({ attemptId, ...body }) => ({
        url: `/attempts/${attemptId}/progress`,
        method: "POST",
        body,
      }),
    }),
    submitAttempt: builder.mutation<{ success: boolean; message: string; data: { attempt: Attempt; quiz: Quiz } }, { attemptId: string; answers?: { questionId: string; selectedOption: string }[]; timeSpent?: number }>({
      query: ({ attemptId, ...body }) => ({
        url: `/attempts/${attemptId}/submit`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Attempt", "Quiz", "Analytics"],
    }),
    getAttemptResult: builder.query<{ success: boolean; data: { attempt: Attempt; quiz: Quiz } }, string>({
      query: (attemptId) => `/attempts/${attemptId}/result`,
      providesTags: (result, error, id) => [{ type: "Attempt", id }],
    }),
    getUserAttempts: builder.query<{ success: boolean; data: Attempt[] }, void>({
      query: () => "/attempts/history",
      providesTags: ["Attempt"],
    }),
  }),
});

export const {
  useStartAttemptMutation,
  useSaveProgressMutation,
  useSubmitAttemptMutation,
  useGetAttemptResultQuery,
  useGetUserAttemptsQuery,
} = attemptApiSlice;
