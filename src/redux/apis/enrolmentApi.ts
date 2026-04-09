import { EnrollmentAdminProgressResponse, EnrolmentContentResponse, EnrolmentListResponse, EvidenceSubmissionResponse } from "@/types/enrollment.types";
import { api } from "../api";
import { cleanObject } from "@/utils/cleanObject";

export interface LearnerDashboardSummary {
  enrolled: number;
  awaiting_assessment: number;
  awaiting_iqa: number;
  competent: number;
  resubmission_required: number;
}

export interface LearnerDashboardExpiredQualification {
  enrolment_id: string;
  qualification_id: string;
  qualification_title: string;
  access_expires_at: string;
  days_overdue: number;
}

export interface LearnerDashboardUpcomingDeadline {
  enrolment_id: string;
  qualification_id: string;
  qualification_title: string;
  unit_id: string;
  unit_code: string;
  unit_title: string;
  due_at: string;
  days_remaining: number;
  severity: "warning" | "urgent";
}

export interface LearnerDashboardRecentActivity {
  type: string;
  label: string;
  detail: string;
  date: string;
  enrolment_id?: string | null;
  qualification_id?: string | null;
  unit_id?: string | null;
}

export interface LearnerDashboardResponse {
  success: boolean;
  message: string;
  data: {
    summary: LearnerDashboardSummary;
    expired_qualifications: LearnerDashboardExpiredQualification[];
    upcoming_unit_deadlines: LearnerDashboardUpcomingDeadline[];
    recent_activity: LearnerDashboardRecentActivity[];
  };
}

const enrolmentApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getLearnerDashboard: builder.query<LearnerDashboardResponse, void>({
      query: () => ({
        url: "/api/enrolments/me/dashboard/",
        method: "GET",
      }),
      providesTags: ["Enrolments"],
    }),
    getEnrolments: builder.query<EnrolmentListResponse, void>({
      query: () => ({
        url: "/api/enrolments/me/",
        method: "GET",
      }),
      providesTags: ["Enrolments"],
    }),
    getEnrolmentContent: builder.query<EnrolmentContentResponse, string>({
      query: (enrolmentId) => ({
        url: `/api/enrolments/me/${enrolmentId}/content/`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Enrolments", id }],
    }),
    submitEvidence: builder.mutation<EvidenceSubmissionResponse, { enrolmentId: string; unitId: string; body: FormData }>({
      query: ({ enrolmentId, unitId, body }) => ({
        url: `/api/enrolments/me/${enrolmentId}/units/${unitId}/evidence-submissions/`,
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, { enrolmentId, unitId }) => [
        { type: "Enrolments", id: enrolmentId },
        { type: "Enrolments", id: `UNIT_${unitId}` },
      ],
    }),
    getEnrollmentAdminProgress: builder.query({
      query: (args) => {
        const filteredParams = cleanObject(args);
        return {
          url: "/api/enrolments/admin/progress-monitoring/",
          method: "GET",
          params: filteredParams,
        };
      },
      transformResponse: (response: any) => response.data,
      // providesTags: ["AdminEnrolmentProgress"],
    }),
  }),
});

export const {
  useGetLearnerDashboardQuery,
  useGetEnrolmentsQuery,
  useGetEnrolmentContentQuery,
  useSubmitEvidenceMutation,
  useGetEnrollmentAdminProgressQuery,
} = enrolmentApi;
