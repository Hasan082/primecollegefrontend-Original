import { api, setCsrfToken } from "../api";

const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (payload) => ({
        url: "/api/auth/login/",
        method: "POST",
        body: payload,
      }),
    }),
    logout: builder.mutation({
      query: () => ({
        url: "/api/auth/logout/",
        method: "POST",
      }),
    }),
    getMe: builder.query({
      query: () => ({
        url: "/api/auth/me/",
        method: "GET",
      }),
    }),
    getCsrfToken: builder.query({
      query: () => ({
        url: "/api/auth/csrf/",
        method: "GET",
      }),
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const token = data?.data?.token ?? null;
          setCsrfToken(token);
        } catch {
          setCsrfToken(null);
        }
      },
    }),
    confirmPasswordSetup: builder.mutation({
      query: (payload) => ({
        url: "/api/auth/password-setup/confirm/",
        method: "POST",
        body: payload,
      }),
    }),
    changePassword: builder.mutation({
      query: (payload) => ({
        url: "/api/auth/change-password/",
        method: "POST",
        body: payload,
      }),
    }),
    forgotPassword: builder.mutation({
      query: (payload) => ({
        url: "/api/auth/forgot-password/",
        method: "POST",
        body: payload,
      }),
    }),
    forgotPasswordConfirm: builder.mutation({
      query: (payload) => ({
        url: "/api/auth/forgot-password/confirm/",
        method: "POST",
        body: payload,
      }),
    }),
    setPassword: builder.mutation({
      query: (payload) => ({
        url: "/api/auth/set-password/",
        method: "POST",
        body: payload,
      }),
    }),
    updateMe: builder.mutation({
      query: (payload) => ({
        url: "/api/auth/me/",
        method: "PATCH",
        body: payload,
      }),
      // Invalidate getMe query after a successful update to refetch fresh data
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(authApi.util.invalidateTags(['User']));
        } catch {}
      }
    }),
    presignProfilePicture: builder.mutation<
      {
        upload_url: string;
        fields: Record<string, string>;
        key: string;
        public_url?: string;
      },
      { file_name: string; content_type: string }
    >({
      query: (body) => ({
        url: "/api/auth/me/presign-profile-picture/",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useGetMeQuery,
  useGetCsrfTokenQuery,
  useConfirmPasswordSetupMutation,
  useChangePasswordMutation,
  useForgotPasswordMutation,
  useForgotPasswordConfirmMutation,
  useSetPasswordMutation,
  useUpdateMeMutation,
  usePresignProfilePictureMutation,
} = authApi;
