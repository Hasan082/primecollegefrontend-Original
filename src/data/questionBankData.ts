/* ── Question Bank Data (Mock) ── */

export interface BankQuestion {
  id: string;
  question: string;
  type: "single" | "multiple";
  options: string[];
  correctAnswers: number[];
  tags?: string[];
}

export interface QuizConfig {
  questionsPerQuiz: number;      // e.g. 20 out of 50
  timeLimit: number;             // minutes, 0 = unlimited
  passScore: number;             // percentage
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  maxAttempts: number;           // 0 = unlimited
  strictMode: boolean;           // fullscreen, anti-cheat
}

export interface WrittenAssignmentConfig {
  id: string;
  title: string;
  description: string;
  wordLimit: number;
  status: "draft" | "published";
}

export interface UnitQuestionBank {
  unitCode: string;
  unitName: string;
  qualificationId: string;
  questions: BankQuestion[];
  quizConfig: QuizConfig;
  writtenAssignments: WrittenAssignmentConfig[];
}

export interface QualificationBank {
  id: string;
  title: string;
  category: string;
  units: { code: string; name: string; questionCount: number; assignmentCount: number; published: boolean }[];
}

/* ── Default quiz config ── */
export const defaultQuizConfig: QuizConfig = {
  questionsPerQuiz: 25,
  timeLimit: 45,
  passScore: 80,
  shuffleQuestions: true,
  shuffleOptions: true,
  maxAttempts: 3,
  strictMode: true,
};

/* ── Mock Question Banks ── */
export const qualificationBanks: QualificationBank[] = [
  {
    id: "adult-care-l4",
    title: "Level 4 Diploma in Adult Care",
    category: "Care",
    units: [
      { code: "VTCT301", name: "Duty of Care", questionCount: 42, assignmentCount: 2, published: true },
      { code: "VTCT302", name: "Equality, Diversity and Inclusion", questionCount: 38, assignmentCount: 1, published: true },
      { code: "VTCT303", name: "Health and Safety in Care Settings", questionCount: 55, assignmentCount: 2, published: true },
      { code: "VTCT304", name: "Safeguarding and Protection", questionCount: 48, assignmentCount: 2, published: false },
      { code: "VTCT305", name: "Person-Centred Approaches", questionCount: 30, assignmentCount: 1, published: false },
      { code: "VTCT306", name: "Communication in Care Settings", questionCount: 0, assignmentCount: 0, published: false },
      { code: "VTCT307", name: "Handling Information", questionCount: 0, assignmentCount: 0, published: false },
      { code: "VTCT308", name: "Infection Prevention and Control", questionCount: 0, assignmentCount: 0, published: false },
      { code: "VTCT309", name: "Mental Health Awareness", questionCount: 0, assignmentCount: 0, published: false },
      { code: "VTCT310", name: "Professional Practice", questionCount: 0, assignmentCount: 0, published: false },
    ],
  },
  {
    id: "business-l3",
    title: "Level 3 Diploma in Business Administration",
    category: "Business",
    units: [
      { code: "BUS301", name: "Principles of Business", questionCount: 50, assignmentCount: 2, published: true },
      { code: "BUS302", name: "Communication in Business", questionCount: 45, assignmentCount: 1, published: true },
      { code: "BUS303", name: "Managing Business Information", questionCount: 35, assignmentCount: 1, published: false },
      { code: "BUS304", name: "Resource Management", questionCount: 0, assignmentCount: 0, published: false },
      { code: "BUS305", name: "Business Project Planning", questionCount: 0, assignmentCount: 0, published: false },
      { code: "BUS306", name: "Team Dynamics", questionCount: 0, assignmentCount: 0, published: false },
    ],
  },
  {
    id: "management-l4",
    title: "Level 4 Diploma in Management and Leadership",
    category: "Management",
    units: [
      { code: "ML401", name: "Leadership Principles", questionCount: 60, assignmentCount: 2, published: true },
      { code: "ML402", name: "Strategic Management", questionCount: 40, assignmentCount: 1, published: true },
      { code: "ML403", name: "Managing Teams", questionCount: 0, assignmentCount: 0, published: false },
      { code: "ML404", name: "Decision Making", questionCount: 0, assignmentCount: 0, published: false },
    ],
  },
];

/* ── Mock questions for VTCT301 (Duty of Care) ── */
export const sampleBankQuestions: BankQuestion[] = [
  { id: "bq1", question: "What is meant by 'duty of care' in adult care?", type: "single", options: ["A legal obligation to safeguard individuals from harm", "A voluntary commitment to care for others", "A contractual requirement from your employer", "A guideline that can be ignored when busy"], correctAnswers: [0], tags: ["duty-of-care", "legislation"] },
  { id: "bq2", question: "Which legislation underpins duty of care in England?", type: "single", options: ["Health and Social Care Act 2008", "Care Act 2014", "Mental Capacity Act 2005", "All of the above"], correctAnswers: [3], tags: ["legislation"] },
  { id: "bq3", question: "What should you do if a service user refuses care? (Select all that apply)", type: "multiple", options: ["Respect their decision", "Document the refusal", "Force them to comply", "Inform your supervisor", "Ignore the situation"], correctAnswers: [0, 1, 3], tags: ["rights", "duty-of-care"] },
  { id: "bq4", question: "A dilemma between duty of care and individual rights occurs when:", type: "single", options: ["A person wants to take risks you consider unsafe", "A person agrees with all care plans", "A person has no preferences", "A person is fully compliant"], correctAnswers: [0], tags: ["dilemmas"] },
  { id: "bq5", question: "Which of the following are examples of harm? (Select all that apply)", type: "multiple", options: ["Physical abuse", "Financial exploitation", "Emotional neglect", "Providing good quality care", "Institutional abuse"], correctAnswers: [0, 1, 2, 4], tags: ["safeguarding"] },
  { id: "bq6", question: "What is the first step when you suspect abuse?", type: "single", options: ["Report to your line manager or safeguarding lead", "Confront the alleged perpetrator", "Wait and gather more evidence yourself", "Discuss with colleagues informally"], correctAnswers: [0], tags: ["safeguarding", "reporting"] },
  { id: "bq7", question: "Duty of care requires you to:", type: "multiple", options: ["Act in the best interest of individuals", "Follow all organisational policies", "Provide competent care within your role", "Make medical decisions independently"], correctAnswers: [0, 1, 2], tags: ["duty-of-care"] },
  { id: "bq8", question: "What does 'informed consent' mean?", type: "single", options: ["Agreement given with full understanding of what is involved", "Any verbal agreement", "Consent given by a family member", "Automatic consent when someone enters a care setting"], correctAnswers: [0], tags: ["consent", "rights"] },
  { id: "bq9", question: "Under the Mental Capacity Act 2005, a person is assumed to have capacity unless:", type: "single", options: ["It is established that they lack capacity", "They are over 65 years old", "They have a learning disability", "A doctor says otherwise"], correctAnswers: [0], tags: ["legislation", "capacity"] },
  { id: "bq10", question: "Which professionals might be involved in a safeguarding investigation? (Select all that apply)", type: "multiple", options: ["Social workers", "Police", "CQC inspectors", "The individual's family (where appropriate)", "All of the above"], correctAnswers: [0, 1, 2, 3], tags: ["safeguarding", "multi-agency"] },
  { id: "bq11", question: "What is whistleblowing?", type: "single", options: ["Reporting concerns about unsafe or illegal practices in your workplace", "Complaining about your workload", "Gossiping about colleagues", "Filing a grievance about pay"], correctAnswers: [0], tags: ["whistleblowing"] },
  { id: "bq12", question: "Which Act protects whistleblowers in the UK?", type: "single", options: ["Public Interest Disclosure Act 1998", "Data Protection Act 2018", "Employment Rights Act 1996", "Equality Act 2010"], correctAnswers: [0], tags: ["legislation", "whistleblowing"] },
  { id: "bq13", question: "A risk assessment should:", type: "multiple", options: ["Identify potential hazards", "Evaluate the likelihood and severity of harm", "Propose control measures", "Eliminate all risks completely"], correctAnswers: [0, 1, 2], tags: ["risk-assessment"] },
  { id: "bq14", question: "Person-centred care means:", type: "single", options: ["Tailoring care to the individual's needs and preferences", "Following the same routine for all service users", "Letting individuals do whatever they want", "Doing everything for the service user"], correctAnswers: [0], tags: ["person-centred"] },
  { id: "bq15", question: "What is the purpose of a complaints procedure?", type: "single", options: ["To provide a structured process for addressing concerns", "To punish staff who make mistakes", "To discourage complaints", "To satisfy CQC requirements only"], correctAnswers: [0], tags: ["complaints"] },
  { id: "bq16", question: "Confidentiality can be breached when:", type: "multiple", options: ["There is a safeguarding concern", "Required by law", "The individual gives consent", "You want to discuss it with friends"], correctAnswers: [0, 1, 2], tags: ["confidentiality"] },
  { id: "bq17", question: "What are the 6 Cs of care?", type: "multiple", options: ["Care", "Compassion", "Competence", "Communication", "Courage", "Commitment"], correctAnswers: [0, 1, 2, 3, 4, 5], tags: ["values"] },
  { id: "bq18", question: "Negligence in a care setting occurs when:", type: "single", options: ["A care worker fails in their duty causing harm", "A service user has an accident", "Equipment breaks down", "Staffing levels are low"], correctAnswers: [0], tags: ["duty-of-care", "negligence"] },
  { id: "bq19", question: "What should be included in accurate record keeping? (Select all that apply)", type: "multiple", options: ["Date and time", "Facts not opinions", "Signature of the recorder", "Personal judgements about the individual"], correctAnswers: [0, 1, 2], tags: ["record-keeping"] },
  { id: "bq20", question: "The Care Quality Commission (CQC) is responsible for:", type: "single", options: ["Inspecting and regulating health and social care services", "Training care workers", "Setting pay rates for care staff", "Providing care directly to individuals"], correctAnswers: [0], tags: ["regulation"] },
  // Additional questions to reach 42
  { id: "bq21", question: "What is the purpose of supervision in care settings?", type: "single", options: ["To support professional development and ensure quality care", "To monitor staff for disciplinary purposes", "To reduce staffing costs", "To fulfil administrative requirements only"], correctAnswers: [0], tags: ["supervision"] },
  { id: "bq22", question: "Active listening involves:", type: "multiple", options: ["Making eye contact", "Nodding to show understanding", "Interrupting to share your views", "Reflecting back what you've heard", "Using open body language"], correctAnswers: [0, 1, 3, 4], tags: ["communication"] },
  { id: "bq23", question: "Under GDPR, personal data must be:", type: "multiple", options: ["Processed lawfully and fairly", "Kept accurate and up to date", "Stored indefinitely", "Kept secure"], correctAnswers: [0, 1, 3], tags: ["data-protection"] },
  { id: "bq24", question: "What is meant by 'proportionate response'?", type: "single", options: ["Using the minimum intervention necessary to manage a situation", "Always calling the police", "Using physical restraint", "Ignoring minor concerns"], correctAnswers: [0], tags: ["duty-of-care"] },
  { id: "bq25", question: "Empowerment in care means:", type: "single", options: ["Enabling individuals to make their own choices and take control", "Making all decisions for the individual", "Giving individuals unlimited freedom", "Removing all support structures"], correctAnswers: [0], tags: ["empowerment", "person-centred"] },
  { id: "bq26", question: "Which of the following is NOT a type of abuse?", type: "single", options: ["Providing person-centred care", "Psychological abuse", "Financial abuse", "Organisational abuse"], correctAnswers: [0], tags: ["safeguarding"] },
  { id: "bq27", question: "What does 'advocacy' mean in care?", type: "single", options: ["Speaking on behalf of someone who cannot represent themselves", "Making decisions for someone", "Legal representation in court", "Writing care plans"], correctAnswers: [0], tags: ["advocacy"] },
  { id: "bq28", question: "A care plan should be reviewed:", type: "single", options: ["Regularly and when circumstances change", "Only annually", "Only when requested by the individual", "Never once it is set"], correctAnswers: [0], tags: ["care-planning"] },
  { id: "bq29", question: "What is institutional abuse?", type: "single", options: ["Abuse arising from poor practices within an organisation", "Abuse by one individual", "Abuse that happens only in hospitals", "Abuse related to finances"], correctAnswers: [0], tags: ["safeguarding"] },
  { id: "bq30", question: "Reflective practice helps care workers to:", type: "multiple", options: ["Learn from experiences", "Identify areas for improvement", "Avoid all mistakes", "Develop professional skills"], correctAnswers: [0, 1, 3], tags: ["reflection"] },
  { id: "bq31", question: "The Deprivation of Liberty Safeguards (DoLS) apply when:", type: "single", options: ["Someone lacks capacity and needs restrictions for their safety", "Any person is admitted to hospital", "A person requests to leave a care home", "Staff want to control a resident"], correctAnswers: [0], tags: ["legislation", "dols"] },
  { id: "bq32", question: "What is a 'best interests' decision?", type: "single", options: ["A decision made on behalf of someone who lacks capacity, considering their wishes", "A decision made by the most senior staff member", "A decision based on cost-effectiveness", "A decision that benefits the organisation"], correctAnswers: [0], tags: ["capacity", "best-interests"] },
  { id: "bq33", question: "Which of the following are signs of neglect? (Select all that apply)", type: "multiple", options: ["Poor hygiene", "Unexplained weight loss", "Untreated medical conditions", "Well-maintained living conditions", "Isolation from social contact"], correctAnswers: [0, 1, 2, 4], tags: ["safeguarding", "neglect"] },
  { id: "bq34", question: "What is the role of the designated safeguarding lead?", type: "single", options: ["To coordinate safeguarding concerns and liaise with external agencies", "To investigate abuse personally", "To discipline staff", "To provide medical treatment"], correctAnswers: [0], tags: ["safeguarding"] },
  { id: "bq35", question: "Positive risk-taking means:", type: "single", options: ["Supporting individuals to take calculated risks that enhance their quality of life", "Allowing dangerous activities without assessment", "Avoiding all risk", "Taking risks on behalf of individuals"], correctAnswers: [0], tags: ["risk-assessment", "person-centred"] },
  { id: "bq36", question: "What is a 'near miss' in care settings?", type: "single", options: ["An incident that could have caused harm but didn't", "An actual injury to a service user", "A complaint from a family member", "A planned risk in a care plan"], correctAnswers: [0], tags: ["incident-reporting"] },
  { id: "bq37", question: "Multi-agency working is important because:", type: "multiple", options: ["It ensures comprehensive support for individuals", "Different professionals bring different expertise", "It reduces the workload for individual agencies", "It improves communication about complex needs"], correctAnswers: [0, 1, 3], tags: ["multi-agency"] },
  { id: "bq38", question: "The Equality Act 2010 protects against discrimination based on:", type: "multiple", options: ["Age", "Disability", "Political opinion", "Race", "Religion or belief", "Social class"], correctAnswers: [0, 1, 3, 4], tags: ["legislation", "equality"] },
  { id: "bq39", question: "What is professional boundaries in care?", type: "single", options: ["The limits that protect the space between a worker's professional role and the individual", "Rules that prevent any personal interaction", "Guidelines that only apply to new staff", "Restrictions on working hours"], correctAnswers: [0], tags: ["professionalism"] },
  { id: "bq40", question: "Conflict of interest in care arises when:", type: "single", options: ["A worker's personal interests could influence their professional judgement", "Two colleagues disagree about a care plan", "A service user complains", "There is a shortage of resources"], correctAnswers: [0], tags: ["professionalism"] },
  { id: "bq41", question: "What is the purpose of an Individual Risk Assessment?", type: "single", options: ["To identify specific risks to an individual and plan mitigation strategies", "To prevent all activities", "To restrict the individual's freedom", "To satisfy paperwork requirements"], correctAnswers: [0], tags: ["risk-assessment"] },
  { id: "bq42", question: "Continuing Professional Development (CPD) is important because:", type: "multiple", options: ["It keeps knowledge and skills up to date", "It improves the quality of care delivered", "It is a regulatory requirement", "It guarantees promotion"], correctAnswers: [0, 1, 2], tags: ["cpd", "professionalism"] },
];
