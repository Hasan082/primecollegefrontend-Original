/* eslint-disable @typescript-eslint/no-explicit-any */
import { api } from "../../api";

export interface QualificationSessionRow {
  id: string;
  qualification: string;
  location: string | null;
  title: string;
  location_name: string;
  venue_address: string;
  date: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const footerApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createQualificationSessionLocation: builder.mutation({
      query: ({ id, payload }) => ({
        url: `/api/qualification/admin/${id}/session-locations/`,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["SessionLocations"],
    }),
    updateQualificationSessionLocation: builder.mutation({
      query: ({ id, payload }) => ({
        url: `/api/qualification/admin/session-locations/${id}/`,
        method: "PATCH",
        body: payload,
      }),
      invalidatesTags: ["SessionLocations"],
    }),
    deleteQualificationSessionLocation: builder.mutation({
      query: (id) => ({
        url: `/api/qualification/admin/session-locations/${id}/`,
        method: "DELETE",
      }),
      invalidatesTags: ["SessionLocations"],
    }),
    getQualificationSessionLocation: builder.query({
      query: (id) => ({
        url: `/api/qualification/admin/${id}/session-locations/`,
        method: "GET",
      }),
      providesTags: ["SessionLocations"],
    }),
    getQualificationSessions: builder.query<QualificationSessionRow[], string>({
      query: (id) => ({
        url: `/api/qualification/admin/${id}/sessions/`,
        method: "GET",
      }),
      transformResponse: (response: { data: any }) => 
        Array.isArray(response.data) ? response.data : (response?.data?.results || []),
      providesTags: ["SessionLocations"], // Using SessionLocations tag for simplicity, or could add Sessions
    }),
  }),
});

export const {
  useCreateQualificationSessionLocationMutation,
  useUpdateQualificationSessionLocationMutation,
  useDeleteQualificationSessionLocationMutation,
  useGetQualificationSessionLocationQuery,
  useGetQualificationSessionsQuery,
} = footerApi;
