import { appConfig } from "@/app.config";
import {
  BaseQueryApi,
  BaseQueryFn,
  createApi,
  DefinitionType,
  FetchArgs,
  fetchBaseQuery,
} from "@reduxjs/toolkit/query/react";

const getCookie = (name: string) => {
  const match = document.cookie.match(new RegExp(`(^|;\\s*)${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : undefined;
};

const getCsrfToken = () => getCookie("csrftoken");
const getRefreshToken = () => getCookie("refresh");

const baseQuery = fetchBaseQuery({
  baseUrl: appConfig.API_BASE_URL,
  prepareHeaders: (headers) => {
    const csrfToken = getCsrfToken();
    if (csrfToken) {
      headers.set("X-CSRFToken", csrfToken);
    }
    return headers;
  },
  credentials: "include",
});

const baseQueryWithRefreshToken: BaseQueryFn<
  FetchArgs,
  BaseQueryApi,
  DefinitionType
> = async (args, api, extraOptions): Promise<any> => {
  const result = await baseQuery(args, api, extraOptions);

  if (result?.error?.status === 401) {
    const refreshCookie = getRefreshToken();
    if (!refreshCookie) {
      return result;
    }

    try {
      const refreshHeaders: HeadersInit = {
        "Content-Type": "application/json",
      };

      const csrfToken = getCsrfToken();
      if (csrfToken) {
        refreshHeaders["X-CSRFToken"] = csrfToken;
      }

      const res = await fetch(
        appConfig.API_BASE_URL + "/api/auth/token/refresh/cookie",
        {
          method: "POST",
          credentials: "include",
          headers: refreshHeaders,
        },
      );

      if (res.ok) {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          await res.json();
          return await baseQuery(args, api, extraOptions);
        }
      }
    } catch (refreshError) {
      console.error("Token refresh failed:", refreshError);
    }
  }

  return result;
};

export const api = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithRefreshToken,
  tagTypes: [],
  endpoints: () => ({}),
});
