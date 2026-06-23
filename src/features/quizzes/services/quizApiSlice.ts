import { apiSlice } from "../../../store/apiSlice.js";
import { Quiz } from "../../../types.js";

export const quizApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getQuizzes: builder.query<{ success: boolean; data: Quiz[]; meta: { page: number; limit: number; total: number } }, { page?: number; limit?: number; category?: string; difficulty?: string; search?: string } | void>({
      query: (params) => ({
        url: "/quizzes",
        method: "GET",
        params: params || {},
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ _id }) => ({ type: "Quiz" as const, id: _id })),
              { type: "Quiz", id: "LIST" },
            ]
          : [{ type: "Quiz", id: "LIST" }],
    }),
    getQuiz: builder.query<{ success: boolean; data: { quiz: Quiz } }, string>({
      query: (id) => `/quizzes/${id}`,
      providesTags: (result, error, id) => [{ type: "Quiz", id }],
    }),
    createQuiz: builder.mutation<{ success: boolean; message: string; data: { quiz: Quiz } }, Partial<Quiz>>({
      query: (body) => ({
        url: "/quizzes",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Quiz", id: "LIST" }],
    }),
    updateQuiz: builder.mutation<{ success: boolean; message: string; data: { quiz: Quiz } }, { id: string; body: Partial<Quiz> }>({
      query: ({ id, body }) => ({
        url: `/quizzes/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Quiz", id: "LIST" },
        { type: "Quiz", id },
      ],
    }),
    togglePublishQuiz: builder.mutation<{ success: boolean; message: string; data: { quiz: Quiz } }, { id: string; isPublished: boolean }>({
      query: ({ id, isPublished }) => ({
        url: `/quizzes/${id}/publish`,
        method: "PATCH",
        body: { isPublished },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Quiz", id: "LIST" },
        { type: "Quiz", id },
      ],
    }),
    deleteQuiz: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/quizzes/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Quiz", id: "LIST" }],
    }),
  }),
});

export const {
  useGetQuizzesQuery,
  useGetQuizQuery,
  useCreateQuizMutation,
  useUpdateQuizMutation,
  useTogglePublishQuizMutation,
  useDeleteQuizMutation,
} = quizApiSlice;
