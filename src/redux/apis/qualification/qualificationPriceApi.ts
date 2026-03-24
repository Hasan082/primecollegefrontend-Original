import { api } from "../../api";

const qualificationPriceApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createQualificationPrice: builder.mutation({
      query: ({ id, payload }) => ({
        url: `/api/qualification/admin/${id}/prices/`,
        method: "POST",
        body: payload,
      }),
    }),
    updateQualificationPrice: builder.mutation({
      query: ({ id, payload }) => ({
        url: `/api/qualification/admin/${id}/prices/`,
        method: "PATCH",
        body: payload,
      }),
    }),
    getQualificationPrice: builder.query({
      query: (id) => ({
        url: `/api/qualification/admin/${id}/prices/`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useCreateQualificationPriceMutation,
  useUpdateQualificationPriceMutation,
  useGetQualificationPriceQuery,
} = qualificationPriceApi;
