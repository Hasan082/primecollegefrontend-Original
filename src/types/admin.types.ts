export interface AdminLearner {
  id: string;
  learnerUserId?: string;
  name: string;
  email: string;
  phone: string;
  learnerId: string;
  qualification: string;
  qualificationId: string;
  assignedTrainer: string;
  enrolledDate: string;
  paymentMethod: "online" | "manual" | "employer";
  paymentStatus: "paid" | "pending" | "overdue";
  progress: number;
  status: "active" | "completed" | "suspended" | "on_hold";
  accessExpiry: string;
}
