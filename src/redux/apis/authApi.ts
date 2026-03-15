import { api } from "../api";

const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    staffLogin: builder.mutation({
      query: (payload) => ({
        url: "",
        method: "POST",
        body: payload,
      }),
    }),
  }),
});

export const { useStaffLoginMutation } = authApi;
