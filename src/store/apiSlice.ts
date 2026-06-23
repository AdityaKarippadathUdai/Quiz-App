import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/v1",
    prepareHeaders: (headers, { getState }) => {
      // Grab token from local state
      const token = (getState() as any).auth?.token;
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["User", "Quiz", "Attempt", "Leaderboard", "Analytics"],
  endpoints: () => ({}),
});
