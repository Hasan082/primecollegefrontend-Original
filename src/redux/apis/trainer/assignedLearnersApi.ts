import { api } from "../../api";
import type { EnrolmentListResponse } from "../enrolmentApi";

export const assignedLearnersApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getTrainerEnrolments: builder.query<EnrolmentListResponse, void>({
      query: () => ({
        url: "/api/enrolments/trainer/my-enrolments/",
        method: "GET",
      }),
      providesTags: ["Enrolments"],
    }),
  }),
});

export const { useGetTrainerEnrolmentsQuery } = assignedLearnersApi;
