// IQA → Assessor notification system
// When IQA disagrees, a notification is created for the assessor

export interface IQANotification {
  id: string;
  type: "iqa_action_required" | "iqa_approved" | "iqa_not_sampled";
  learnerId: string;
  learnerName: string;
  qualification: string;
  unitCode: string;
  unitName: string;
  iqaName: string;
  iqaDecision: string;
  iqaComments: string;
  actionRequired?: string; // "reassess" | "revise_feedback" | "additional_evidence" | "assessor_training"
  actionLabel?: string;
  affectedCriteria?: string[];
  reason?: string;
  createdDate: string;
  read: boolean;
  resolved: boolean;
}

const NOTIFICATIONS_KEY = "iqa_assessor_notifications";

export function loadIQANotifications(): IQANotification[] {
  try {
    return JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveIQANotifications(notifications: IQANotification[]) {
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
}

export function addIQANotification(notification: IQANotification) {
  const all = loadIQANotifications();
  all.unshift(notification);
  saveIQANotifications(all);
}

export function markNotificationRead(id: string) {
  const all = loadIQANotifications();
  const idx = all.findIndex(n => n.id === id);
  if (idx !== -1) {
    all[idx].read = true;
    saveIQANotifications(all);
  }
}

export function markNotificationResolved(id: string) {
  const all = loadIQANotifications();
  const idx = all.findIndex(n => n.id === id);
  if (idx !== -1) {
    all[idx].resolved = true;
    all[idx].read = true;
    saveIQANotifications(all);
  }
}

export function getUnreadCount(): number {
  return loadIQANotifications().filter(n => !n.read).length;
}

export function getActionRequiredCount(): number {
  return loadIQANotifications().filter(n => n.type === "iqa_action_required" && !n.resolved).length;
}

const ACTION_LABELS: Record<string, string> = {
  reassess: "Re-assess Unit",
  revise_feedback: "Revise Feedback",
  additional_evidence: "Request Additional Evidence",
  assessor_training: "CPD / Training Required",
};

export function createDisagreeNotification(params: {
  learnerId: string;
  learnerName: string;
  qualification: string;
  unitCode: string;
  unitName: string;
  action: string;
  reason: string;
  affectedCriteria: string[];
  iqaComments: string;
}): IQANotification {
  return {
    id: `iqa-notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    type: "iqa_action_required",
    learnerId: params.learnerId,
    learnerName: params.learnerName,
    qualification: params.qualification,
    unitCode: params.unitCode,
    unitName: params.unitName,
    iqaName: "Catherine (IQA)",
    iqaDecision: "Disagree",
    iqaComments: params.iqaComments,
    actionRequired: params.action,
    actionLabel: ACTION_LABELS[params.action] || params.action,
    affectedCriteria: params.affectedCriteria,
    reason: params.reason,
    createdDate: new Date().toLocaleDateString("en-GB"),
    read: false,
    resolved: false,
  };
}

export function createApprovalNotification(params: {
  learnerId: string;
  learnerName: string;
  qualification: string;
  unitCode: string;
  unitName: string;
  iqaComments: string;
}): IQANotification {
  return {
    id: `iqa-notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    type: "iqa_approved",
    learnerId: params.learnerId,
    learnerName: params.learnerName,
    qualification: params.qualification,
    unitCode: params.unitCode,
    unitName: params.unitName,
    iqaName: "Catherine (IQA)",
    iqaDecision: "Approved",
    iqaComments: params.iqaComments,
    createdDate: new Date().toLocaleDateString("en-GB"),
    read: false,
    resolved: false,
  };
}
