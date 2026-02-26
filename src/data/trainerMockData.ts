export interface TrainerLearner {
  id: string;
  name: string;
  email: string;
  learnerId: string;
  qualification: string;
  qualificationCategory: string;
  enrolledDate: string;
  progress: number;
  unitsCompleted: number;
  totalUnits: number;
}

export interface PendingSubmission {
  id: string;
  learnerId: string;
  learnerName: string;
  qualification: string;
  qualificationCategory: string;
  unitCode: string;
  unitTitle: string;
  submittedDate: string;
  daysWaiting: number;
  files: { name: string; type: string; size: string }[];
  criteria: string[];
}

export interface RecentAssessment {
  id: string;
  learnerName: string;
  unitTitle: string;
  assessedDate: string;
  outcome: "Competent" | "Resubmission Required" | "Not Yet Competent";
}

export const trainerLearners: TrainerLearner[] = [
  { id: "l1", name: "John Smith", email: "john.smith@example.com", learnerId: "L-2024-001", qualification: "Level 4 Diploma in Adult Care", qualificationCategory: "Care", enrolledDate: "2024-09-15", progress: 45, unitsCompleted: 3, totalUnits: 8 },
  { id: "l2", name: "Emma Johnson", email: "emma.j@example.com", learnerId: "L-2024-002", qualification: "Level 2 Certificate in Mental Health Awareness", qualificationCategory: "Care", enrolledDate: "2024-10-01", progress: 30, unitsCompleted: 2, totalUnits: 6 },
  { id: "l3", name: "Michael Brown", email: "m.brown@example.com", learnerId: "L-2024-003", qualification: "Level 4 Diploma in Adult Care", qualificationCategory: "Care", enrolledDate: "2024-08-20", progress: 70, unitsCompleted: 5, totalUnits: 8 },
  { id: "l4", name: "Sophie Williams", email: "s.williams@example.com", learnerId: "L-2024-004", qualification: "Level 3 Diploma in Business Administration", qualificationCategory: "Business", enrolledDate: "2024-11-05", progress: 15, unitsCompleted: 1, totalUnits: 7 },
];

export const pendingSubmissions: PendingSubmission[] = [
  {
    id: "s1", learnerId: "L-2024-001", learnerName: "John Smith",
    qualification: "Level 4 Diploma in Adult Care", qualificationCategory: "Care",
    unitCode: "VTCT303", unitTitle: "Health and Safety in Care Settings",
    submittedDate: "08/02/25", daysWaiting: 2,
    files: [
      { name: "Business_Planning_Portfolio.pdf", type: "PDF", size: "2.4 MB" },
      { name: "Project_Plan_Example.xlsx", type: "XLSX", size: "856 KB" },
    ],
    criteria: ["Define project scope and objectives", "Create detailed project plans with timelines", "Identify and allocate resources appropriately", "Assess and mitigate project risks", "Monitor and report on project progress"],
  },
  {
    id: "s2", learnerId: "L-2024-002", learnerName: "Emma Johnson",
    qualification: "Level 2 Certificate in Mental Health Awareness", qualificationCategory: "Care",
    unitCode: "VTCT201", unitTitle: "Understanding Mental Health",
    submittedDate: "07/02/25", daysWaiting: 3,
    files: [{ name: "Mental_Health_Essay.pdf", type: "PDF", size: "1.8 MB" }],
    criteria: ["Define key concepts of mental health", "Identify common mental health conditions", "Explain impact of mental health on individuals"],
  },
  {
    id: "s3", learnerId: "L-2024-003", learnerName: "Michael Brown",
    qualification: "Level 4 Diploma in Adult Care", qualificationCategory: "Care",
    unitCode: "VTCT306", unitTitle: "Safeguarding and Protection",
    submittedDate: "06/02/25", daysWaiting: 4,
    files: [{ name: "Safeguarding_Portfolio.pdf", type: "PDF", size: "3.1 MB" }],
    criteria: ["Understand safeguarding legislation", "Identify signs of abuse", "Explain reporting procedures"],
  },
];

export const recentAssessments: RecentAssessment[] = [
  { id: "a1", learnerName: "Sophie Williams", unitTitle: "Business Communication", assessedDate: "05/02/25", outcome: "Competent" },
  { id: "a2", learnerName: "John Smith", unitTitle: "Duty of Care", assessedDate: "04/02/25", outcome: "Competent" },
  { id: "a3", learnerName: "Emma Johnson", unitTitle: "Equality and Diversity", assessedDate: "03/02/25", outcome: "Resubmission Required" },
  { id: "a4", learnerName: "Michael Brown", unitTitle: "Person-Centred Care", assessedDate: "02/02/25", outcome: "Competent" },
];
