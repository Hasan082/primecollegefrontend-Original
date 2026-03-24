/* eslint-disable @typescript-eslint/no-explicit-any */
import { api } from "../../api";

const footerApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createQualificationSessionLocation: builder.mutation({
      query: ({ id, payload }) => ({
        url: `/api/qualification/admin/${id}/session-locations/`,
        method: "POST",
        body: payload,
      }),
    }),
    updateQualificationSessionLocation: builder.mutation({
      query: ({ id, payload }) => ({
        url: `/api/qualification/admin/${id}/session-locations//`,
        method: "PATCH",
        body: payload,
      }),
    }),
    getQualificationSessionLocation: builder.query({
      query: (id) => ({
        url: `/api/qualification/admin/${id}/session-locations//`,
        method: "GET",
      }),
    }),
    createQualificationSessionLocationDate: builder.mutation({
      query: ({
        locationId,
        payload,
      }: {
        locationId: string;
        payload: any;
      }) => ({
        url: `/api/qualification/admin/session-locations/${locationId}/dates/`,
        method: "POST",
        body: payload,
      }),
    }),
    updateQualificationSessionLocationDate: builder.mutation({
      query: ({ id, payload }) => ({
        url: `/api/qualification/admin/${id}/session-locations//`,
        method: "PATCH",
        body: payload,
      }),
    }),
    getQualificationSessionLocationDate: builder.query({
      query: (id) => ({
        url: `/api/qualification/admin/${id}/session-locations//`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useCreateQualificationSessionLocationMutation,
  useUpdateQualificationSessionLocationMutation,
  useGetQualificationSessionLocationQuery,
  useCreateQualificationSessionLocationDateMutation,
  useUpdateQualificationSessionLocationDateMutation,
  useGetQualificationSessionLocationDateQuery,
} = footerApi;
