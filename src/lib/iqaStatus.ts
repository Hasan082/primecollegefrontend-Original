import type { IQAReviewQueueItem } from "@/types/iqa.types";

export type LifecycleLabel =
  | "Not Started"
  | "In Progress"
  | "Submitted"
  | "Awaiting Assessment"
  | "Awaiting IQA"
  | "Trainer Review"
  | "Action Required"
  | "Signed Off"
  | "Completed"
  | "Escalated"
  | "Auto Cleared";

export type IqaWorkflowLabel =
  | "Awaiting IQA"
  | "Signed Off"
  | "Trainer Review"
  | "Action Required"
  | "Escalated"
  | "Auto Cleared";

export const IQA_WORKFLOW_LABELS: IqaWorkflowLabel[] = [
  "Awaiting IQA",
  "Signed Off",
  "Trainer Review",
  "Action Required",
  "Escalated",
  "Auto Cleared",
];

export function getIqaWorkflowLabel(iqaStatus?: string | null): IqaWorkflowLabel {
  if (iqaStatus === "Pending IQA Review" || iqaStatus === "In Progress") {
    return "Awaiting IQA";
  }
  if (iqaStatus === "IQA Approved") {
    return "Signed Off";
  }
  if (iqaStatus === "IQA Referred — Awaiting Trainer Response") {
    return "Trainer Review";
  }
  if (iqaStatus === "Auto-Cleared (Not Sampled)" || iqaStatus === "Not Sampled") {
    return "Auto Cleared";
  }
  if (iqaStatus === "Escalated to Admin") {
    return "Escalated";
  }
  return "Action Required";
}

export function getIqaWorkflowBadgeVariant(
  label: IqaWorkflowLabel,
): "default" | "secondary" | "destructive" | "outline" {
  if (label === "Signed Off") return "default";
  if (label === "Escalated") return "destructive";
  if (label === "Trainer Review" || label === "Action Required") return "secondary";
  if (label === "Auto Cleared") return "outline";
  return "outline";
}

export function getReviewStatusLabel(reviewStatus?: string | null): string {
  switch (reviewStatus) {
    case "pending": return "Pending IQA Review";
    case "in_progress": return "In Progress";
    case "approved": return "IQA Approved";
    case "action_required": return "Assessor Action Required";
    case "trainer_review": return "IQA Referred — Trainer Review";
    case "reassessed": return "Awaiting Re-IQA";
    case "escalated": return "Escalated to Admin";
    case "auto_cleared": return "Auto Cleared";
    default: return reviewStatus ? reviewStatus.replace(/_/g, " ") : "—";
  }
}

export function getReviewStatusBadgeVariant(
  reviewStatus?: string | null,
): "default" | "secondary" | "destructive" | "outline" {
  if (reviewStatus === "approved") return "default";
  if (reviewStatus === "escalated") return "destructive";
  if (
    reviewStatus === "trainer_review" ||
    reviewStatus === "action_required" ||
    reviewStatus === "reassessed"
  ) {
    return "secondary";
  }
  if (reviewStatus === "auto_cleared") return "outline";
  return "outline";
}

export type ReviewStatusBadgeProps = {
  variant: "default" | "secondary" | "destructive" | "outline";
  className: string;
};

export function getReviewStatusBadgeProps(
  reviewStatus?: string | null,
): ReviewStatusBadgeProps {
  switch (reviewStatus) {
    case "approved":
      return { variant: "default", className: "bg-green-600 hover:bg-green-600 text-white" };
    case "action_required":
      return { variant: "secondary", className: "bg-amber-500 hover:bg-amber-500 text-white" };
    case "trainer_review":
      return { variant: "secondary", className: "bg-orange-500 hover:bg-orange-500 text-white" };
    case "reassessed":
      return { variant: "secondary", className: "bg-purple-600 hover:bg-purple-600 text-white" };
    case "escalated":
      return { variant: "destructive", className: "" };
    case "in_progress":
      return { variant: "default", className: "bg-blue-600 hover:bg-blue-600 text-white" };
    case "auto_cleared":
      return { variant: "outline", className: "bg-gray-200 text-gray-700" };
    case "pending":
      return { variant: "outline", className: "bg-gray-100 text-gray-700" };
    default:
      return { variant: "outline", className: "" };
  }
}

export function getIqaWorkflowBadgeProps(
  label: IqaWorkflowLabel,
): ReviewStatusBadgeProps {
  switch (label) {
    case "Signed Off":
      return { variant: "default", className: "bg-green-600 hover:bg-green-600 text-white" };
    case "Action Required":
      return { variant: "secondary", className: "bg-amber-500 hover:bg-amber-500 text-white" };
    case "Trainer Review":
      return { variant: "secondary", className: "bg-orange-500 hover:bg-orange-500 text-white" };
    case "Escalated":
      return { variant: "destructive", className: "" };
    case "Awaiting IQA":
      return { variant: "outline", className: "bg-gray-100 text-gray-700" };
    case "Auto Cleared":
      return { variant: "outline", className: "bg-gray-200 text-gray-700" };
    default:
      return { variant: "outline", className: "" };
  }
}

export function getSubmissionOutcomeLabel(status?: string | null) {
  const normalized = (status || "").trim().toLowerCase();

  if (normalized === "submitted") {
    return "Submitted";
  }
  if (normalized === "pending" || normalized === "under_review") {
    return "Awaiting Assessment";
  }
  if (normalized === "competent" || normalized === "completed") {
    return "Completed";
  }
  if (
    normalized === "resubmit" ||
    normalized === "resubmission_required" ||
    normalized === "not_competent"
  ) {
    return "Action Required";
  }

  return (status || "unknown").replace(/_/g, " ");
}

export function getIqaDecisionLabel(decision?: string | null) {
  if (decision === "approved") {
    return "Signed Off";
  }
  if (decision === "changes_required" || decision === "referred_back") {
    return "Action Required";
  }
  return decision ? decision.replace(/_/g, " ") : "—";
}

export function getLifecycleLabel(value?: string | null): LifecycleLabel {
  const normalized = (value || "").trim().toLowerCase().replace(/\s+/g, "_");

  if (!normalized || normalized === "not_started") {
    return "Not Started";
  }
  if (normalized === "in_progress") {
    return "In Progress";
  }
  if (normalized === "submitted") {
    return "Submitted";
  }
  if (
    normalized === "pending" ||
    normalized === "under_review" ||
    normalized === "waiting_for_assessor_review" ||
    normalized === "awaiting_assessment"
  ) {
    return "Awaiting Assessment";
  }
  if (
    normalized === "iqa_review" ||
    normalized === "waiting_for_iqa_review" ||
    normalized === "pending_iqa_review" ||
    normalized === "awaiting_iqa_review" ||
    normalized === "awaiting_iqa_assessment" ||
    normalized === "in_progress"
  ) {
    return "Awaiting IQA";
  }
  if (normalized === "trainer_review") {
    return "Trainer Review";
  }
  if (
    normalized === "resubmit" ||
    normalized === "resubmission_required" ||
    normalized === "not_competent" ||
    normalized === "not_yet_competent" ||
    normalized === "referred_back" ||
    normalized === "assessor_action_required"
  ) {
    return "Action Required";
  }
  if (
    normalized === "iqa_approved" ||
    normalized === "approved" ||
    normalized === "signed_off"
  ) {
    return "Signed Off";
  }
  if (
    normalized === "competent" ||
    normalized === "completed" ||
    normalized === "trainer_approved"
  ) {
    return "Completed";
  }
  if (normalized === "escalated_to_admin" || normalized === "escalated") {
    return "Escalated";
  }
  if (normalized === "auto_cleared" || normalized === "not_sampled") {
    return "Auto Cleared";
  }

  return "Not Started";
}

export function getSubmissionTypeLabel(value?: string | null) {
  if (!value) {
    return "Unknown";
  }

  const normalized = value.trim().toLowerCase().replace(/\s+/g, "_");

  if (normalized === "written") {
    return "Written Assignment";
  }
  if (normalized === "evidence") {
    return "Evidence Portfolio";
  }

  return value.replace(/_/g, " ");
}

export function getQueueItemDisplayState(item: IQAReviewQueueItem) {
  return {
    workflowLabel: getIqaWorkflowLabel(item.iqa_status),
    outcomeLabel: getSubmissionOutcomeLabel(item.status),
  };
}
