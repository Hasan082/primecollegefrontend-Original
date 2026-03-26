import { api } from "../../api";

const qualificationMainApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createQualificationMain: builder.mutation({
      query: (payload) => ({
        url: "/api/qualification/admin/",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["Qualifications"],
    }),
    updateQualificationMain: builder.mutation({
      query: ({ id, payload }) => ({
        url: "/api/qualification/admin/" + id,
        method: "PATCH",
        body: payload,
      }),
      invalidatesTags: ["Qualifications"],
    }),
    getQualificationMain: builder.query({
      query: (id) => ({
        url: "/api/qualification/admin/" + id,
        method: "GET",
      }),
      providesTags: ["Qualifications"],
    }),
  }),
});

export const {
  useCreateQualificationMainMutation,
  useUpdateQualificationMainMutation,
  useGetQualificationMainQuery,
} = qualificationMainApi;
