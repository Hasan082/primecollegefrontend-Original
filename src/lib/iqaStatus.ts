import type { IQAReviewQueueItem } from "@/types/iqa.types";

export type IqaWorkflowLabel =
  | "Awaiting IQA"
  | "Signed Off"
  | "Action Required"
  | "Escalated";

export const IQA_WORKFLOW_LABELS: IqaWorkflowLabel[] = [
  "Awaiting IQA",
  "Signed Off",
  "Action Required",
  "Escalated",
];

export function getIqaWorkflowLabel(iqaStatus?: string | null): IqaWorkflowLabel {
  if (iqaStatus === "Pending IQA Review") {
    return "Awaiting IQA";
  }
  if (iqaStatus === "IQA Approved") {
    return "Signed Off";
  }
  if (iqaStatus === "Escalated to Admin") {
    return "Escalated";
  }
  return "Action Required";
}

export function getIqaWorkflowBadgeVariant(
  label: IqaWorkflowLabel,
): "default" | "secondary" | "destructive" | "outline" {
  if (label === "Signed Off") {
    return "default";
  }
  if (label === "Escalated") {
    return "destructive";
  }
  if (label === "Action Required") {
    return "secondary";
  }
  return "outline";
}

export function getSubmissionOutcomeLabel(status?: string | null) {
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

export function getQueueItemDisplayState(item: IQAReviewQueueItem) {
  return {
    workflowLabel: getIqaWorkflowLabel(item.iqa_status),
    outcomeLabel: getSubmissionOutcomeLabel(item.status),
  };
}
