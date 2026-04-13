import { cleanObject } from "@/utils/cleanObject";
import { api } from "../../api";

const iqaEvidencApi = api.injectEndpoints({
    endpoints: (builder) => ({
        submitEvidenceConcerns: builder.mutation({
            query: ({ submission_id, payload }) => ({
                url: `/api/enrolments/iqa/evidence-submissions/${submission_id}/concerns/`,
                method: "POST",
                body: payload,
            }),
            invalidatesTags: ["Enrolments"],
        }),
        submitEvidenceReview: builder.mutation({
            query: ({ submission_id, payload }) => ({
                url: `/api/enrolments/iqa/evidence-submissions/${submission_id}/review/`,
                method: "PATCH",
                body: payload,
            }),
            invalidatesTags: ["Enrolments"],
        }),
    }),
});

export const {
    useSubmitEvidenceConcernsMutation,
    useSubmitEvidenceReviewMutation
} = iqaEvidencApi;


export default iqaEvidencApi;
