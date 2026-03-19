/* eslint-disable @typescript-eslint/no-explicit-any */
import { appConfig } from "@/app.config";
import {
  BaseQueryFn,
  createApi,
  FetchArgs,
  fetchBaseQuery,
} from "@reduxjs/toolkit/query/react";

// Base query
const baseQuery = fetchBaseQuery({
  baseUrl: appConfig.API_BASE_URL,
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const state = getState() as any;
    const token = state.auth?.csrfToken;

    if (token) {
      headers.set("X-CSRFToken", token);
    }

    return headers;
  },
});

// Wrapper for refresh logic
const baseQueryWithRefreshToken: BaseQueryFn<
  FetchArgs,
  unknown,
  unknown
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  //  If unauthorized → try refresh
  if (result?.error && (result.error as any).status === 401) {
    try {
      const refreshRes = await fetch(
        `${appConfig.API_BASE_URL}/api/auth/token/refresh/cookie`,
        {
          method: "POST",
          credentials: "include",
        },
      );

      if (refreshRes.ok) {
        // Retry original request
        result = await baseQuery(args, api, extraOptions);
      } else {
        console.error("Refresh failed");
      }
    } catch (err) {
      console.error("Token refresh error:", err);
    }
  }

  return result;
};

//  API setup
export const api = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithRefreshToken,
  tagTypes: [],
  endpoints: () => ({}),
});
