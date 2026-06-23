import { apiSlice } from "../../../store/apiSlice.js";
import { User } from "../../../types.js";

export const authApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<{ success: boolean; message: string; data: { user: User; accessToken: string } }, any>({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
    }),
    register: builder.mutation<{ success: boolean; message: string; data: { user: User; accessToken: string } }, any>({
      query: (userData) => ({
        url: "/auth/register",
        method: "POST",
        body: userData,
      }),
    }),
    refresh: builder.mutation<{ success: boolean; message: string; data: { user: User; accessToken: string } }, void>({
      query: () => ({
        url: "/auth/refresh",
        method: "POST",
      }),
    }),
    logout: builder.mutation<{ success: boolean; message: string }, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
    }),
    getProfile: builder.query<{ success: boolean; data: { user: User } }, void>({
      query: () => "/auth/profile",
      providesTags: ["User"],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useRefreshMutation,
  useLogoutMutation,
  useGetProfileQuery,
} = authApiSlice;
