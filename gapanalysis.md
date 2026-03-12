# Prime College Qualification Platform — Full System Audit & Gap Analysis

**Audit Date:** 12 March 2026  
**Auditor:** System Diagnostic (AI-Assisted)  
**Platform URL:** https://primecollegefrontend.lovable.app  
**Benchmark:** UK e-portfolio systems (Ecordia, OneFile, Smart Assessor)  
**Scope:** Functional verification — no code modifications made  

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Learner Journey Audit](#2-learner-journey-audit)
3. [Trainer / Assessor Workflow Audit](#3-trainer--assessor-workflow-audit)
4. [IQA Workflow Audit](#4-iqa-workflow-audit)
5. [Admin Controls Audit](#5-admin-controls-audit)
6. [Compliance & Audit Trail](#6-compliance--audit-trail)
7. [Evidence Storage](#7-evidence-storage)
8. [UI/UX Review](#8-uiux-review)
9. [Final Gap Summary](#9-final-gap-summary)
10. [Recommendations](#10-recommendations)

---

## 1. Executive Summary

The Prime College platform has a **well-structured frontend** covering all four user roles (Learner, Trainer, IQA, Admin) with comprehensive UI for the core qualification workflow. However, the system is currently a **frontend-only prototype** using mock data and `sessionStorage` authentication. There is **no backend, no database, and no real file storage**. This means all features are demonstrative — data does not persist, files are not actually uploaded, and there is no real authentication.

### Overall Readiness Score

| Area | Score | Status |
|------|-------|--------|
| Learner Journey (UI) | 85% | ✅ Strong |
| Trainer Workflow (UI) | 80% | ✅ Good |
| IQA Workflow (UI) | 75% | ⚠️ Partial |
| Admin Controls (UI) | 80% | ✅ Good |
| Backend / Database | 0% | ❌ Missing |
| Authentication | 5% | ❌ Demo only |
| File Storage | 0% | ❌ Not implemented |
| Audit Trail | 0% | ❌ Not implemented |
| Compliance (Ofsted/DfE) | 10% | ❌ Not ready |

---

## 2. Learner Journey Audit

### 2.1 Purchase / Enrolment

| Feature | Status | Notes |
|---------|--------|-------|
| Select qualification | ✅ Working | Public qualifications page with category/level filters |
| Add to cart | ✅ Working | Cart context with add/remove functionality |
| Checkout form | ✅ Working | Personal details, billing address, payment fields |
| Payment processing | ❌ Mock only | No real payment gateway (Stripe not integrated) |
| Auto account creation on purchase | ❌ Missing | No backend to create user accounts |
| Order confirmation | ✅ Working | Confirmation page with order ID shown |
| Admin manual enrolment | ✅ UI exists | Enrol Learner dialog in admin — demo only, no persistence |

**Gaps:**
- No real payment integration (Stripe recommended)
- Account creation is not linked to purchase — learner must use demo login separately
- No payment receipt/email confirmation
- No employer-funded enrolment flow beyond UI mockup

### 2.2 Access to Resources

| Feature | Status | Notes |
|---------|--------|-------|
| Resource library per unit | ✅ Working | PDFs, DOCX, templates displayed per unit |
| Download resources | ⚠️ UI only | Download buttons exist but no real files served |
| Access restricted before payment | ❌ Not enforced | No backend gating — anyone with URL can access |
| Access duration / expiry | ✅ UI exists | Expiry dates shown, extension modal works |

**Gaps:**
- Resources are hardcoded mock data, not uploaded by Admin
- No real file serving — download buttons are non-functional
- Access control is not enforced (no authentication gating)

### 2.3 Evidence Submission

| Feature | Status | Notes |
|---------|--------|-------|
| View unit requirements | ✅ Working | Overview, assessment criteria, credit values displayed |
| Upload evidence files | ⚠️ UI exists | File input and drag-drop UI present, but files are not actually stored |
| Submit for assessment | ✅ UI works | "Submit Evidence" button with toast confirmation |
| File type restrictions | ✅ Implemented | Accepts PDF, DOCX, XLSX only |
| File size display | ✅ Working | Shows file size on selection |
| Timestamp on submission | ⚠️ Partial | Dates shown in mock data, not dynamically generated |
| Version control | ❌ Missing | No version history for resubmitted evidence |
| File preview | ❌ Missing | No in-browser preview of uploaded documents |

**Gaps:**
- **CRITICAL:** Files are not actually uploaded anywhere — `FileList` is captured in component state only
- No version control for evidence — when learner resubmits, previous version is not retained
- No file preview/viewer for PDFs or documents
- Submitted date is hardcoded, not dynamically timestamped

### 2.4 View Feedback

| Feature | Status | Notes |
|---------|--------|-------|
| See assessment outcome | ✅ Working | Status badges: Competent, Awaiting, Resubmission |
| Read trainer feedback | ✅ Working | Feedback text displayed on qualification view |
| Resubmission guidance | ✅ Working | Specific criteria to address shown in feedback |
| Notification on feedback | ⚠️ UI exists | NotificationBell component exists but uses mock data |

**Gaps:**
- Notifications are mock — no real push/email notifications
- No notification settings or preferences

### 2.5 Resubmission

| Feature | Status | Notes |
|---------|--------|-------|
| Resubmission status indicator | ✅ Working | Orange badge "Resubmission Required" |
| Re-upload evidence | ✅ UI exists | Same upload interface available on unit detail |
| Track resubmission count | ❌ Missing | No counter showing how many times evidence has been resubmitted |
| View previous submission | ❌ Missing | Previous submission not viewable after resubmission |

### 2.6 Progress Tracking

| Feature | Status | Notes |
|---------|--------|-------|
| Overall qualification progress (%) | ✅ Working | Progress bar with percentage on dashboard and qualification views |
| Units completed count | ✅ Working | "X of Y units complete" shown |
| Units awaiting assessment | ✅ Working | Counter on dashboard |
| Units requiring resubmission | ✅ Working | Counter on dashboard |
| Recent activity feed | ✅ Working | Last 5 activities with timestamps |
| Deadline warnings | ✅ Working | Unit-level deadline alerts with urgency indicators |
| Expired qualification alerts | ✅ Working | Extension payment flow with pricing tiers |

---

## 3. Trainer / Assessor Workflow Audit

### 3.1 Assigned Learners

| Feature | Status | Notes |
|---------|--------|-------|
| View assigned learners | ✅ Working | Table with name, ID, qualification, progress, pending count |
| Filter/search learners | ❌ Missing | No search/filter on assigned learners page |
| View learner detail | ✅ Working | Full profile with contact info, qualification progress, unit table |
| Set unit deadlines | ✅ Working | Dropdown with preset deadline options |
| Extension request handling | ✅ Working | Approve/reject extension requests on learner detail |

### 3.2 Assessment Queue

| Feature | Status | Notes |
|---------|--------|-------|
| Pending submissions queue | ✅ Working | Dashboard tab with learner, unit, submitted date, wait time |
| Wait time indicators | ✅ Working | Color-coded badges (green/amber/red based on days) |
| Link to review from queue | ✅ Working | "Review" button links to unit management page |
| Overdue alerts | ✅ Working | "Overdue 7+ days" stat on dashboard |

### 3.3 Evidence Review

| Feature | Status | Notes |
|---------|--------|-------|
| Open learner submissions | ✅ Working | Expandable submission cards on unit management page |
| View submitted files | ✅ Working | File names and types displayed |
| Download files | ⚠️ UI only | Download buttons present but non-functional |
| Preview files in browser | ❌ Missing | No in-browser file preview |
| View quiz results | ✅ Working | QuizResultsPanel with score, time, violation log, per-question analysis |
| View written submissions | ✅ Working | Written content preview with word count and download option |

### 3.4 Assessment Decision

| Feature | Status | Notes |
|---------|--------|-------|
| Select outcome | ✅ Working | Three options: Competent, Resubmission Required, Not Yet Competent |
| Write feedback | ✅ Working | Textarea with placeholder guidance |
| Submit assessment | ✅ Working | Toast confirmation, local state update |
| Persist decision | ❌ Missing | Assessment decision is component-level state only — lost on refresh |
| Upload feedback file | ❌ Missing | No option for trainer to attach a feedback document |

**Gaps:**
- **CRITICAL:** Assessment decisions are not persisted — they exist only in React component state
- No option to upload a feedback file (PDF/document) alongside written feedback
- No "Save as draft" for partial assessments

### 3.5 Criteria Tick-off / Sign-off

| Feature | Status | Notes |
|---------|--------|-------|
| Tick/check individual criteria | ❌ Missing | Criteria are listed but not individually tickable |
| Unit sign-off | ❌ Missing | No explicit "Sign off unit as complete" button |
| Qualification completion sign-off | ❌ Missing | No qualification-level completion workflow |

**Gap (UK IQA requirement):** In systems like Ecordia and OneFile, trainers can **tick each criterion individually** as met/not met during assessment, and then sign off the entire unit. This granular criteria tracking is **missing** from the current implementation. The assessment review only captures a single overall outcome.

### 3.6 Resubmission Tracking

| Feature | Status | Notes |
|---------|--------|-------|
| See which learners need resubmission | ⚠️ Partial | Visible in unit status but not filtered separately |
| Track resubmission history | ❌ Missing | No record of previous submissions and outcomes |
| Dedicated resubmission queue | ❌ Missing | No filtered view for resubmissions only |

### 3.7 Question Bank

| Feature | Status | Notes |
|---------|--------|-------|
| View question pools by qualification/unit | ✅ Working | Question Bank page with qualification → unit navigation |
| Create questions | ✅ Working | Question Bank Editor with question types |
| Configure quiz settings | ✅ Working | Randomisation, time limit, pass score, strict mode |
| Written assignment templates | ✅ Working | Template creation with word limits |

---

## 4. IQA Workflow Audit

### 4.1 Sampling

| Feature | Status | Notes |
|---------|--------|-------|
| Sampling queue | ✅ Working | Table with learner, unit, trainer, outcome, status, sample reason |
| Filter by trainer/qualification/outcome/status | ✅ Working | Four dropdown filters |
| Sampling configuration | ✅ Working | Random percentage, auto-resub, new trainer probation settings |
| Automatic sampling trigger | ❌ Missing | Sampling queue is manually populated mock data |

**Gap:** In production, assessments should **automatically enter the IQA queue** based on sampling rules. Currently, the queue is static mock data.

### 4.2 Assessment Review

| Feature | Status | Notes |
|---------|--------|-------|
| View submission details | ✅ Working | Learner, qualification, unit, submission date |
| View assessment criteria | ✅ Working | Criteria list displayed |
| View learner evidence files | ✅ Working | File names with "View" button |
| View trainer feedback | ✅ Working | Trainer name, date, outcome, feedback text |
| IQA decision (3 options) | ✅ Working | Approve / Assessor Action Required / Escalate to Admin |
| IQA comments (hidden from learner) | ✅ Working | Textarea with visibility note |
| Submit IQA review | ✅ Working | Toast confirmation with navigation |
| Audit information panel | ✅ Working | Sample ID, dates displayed |

### 4.3 Trainer Performance Monitoring

| Feature | Status | Notes |
|---------|--------|-------|
| Approval rate per trainer | ✅ Working | Percentage with progress bar |
| Total assessments per trainer | ✅ Working | Displayed in cards and table |
| IQA flags per trainer | ✅ Working | Badge with colour coding for high counts |
| Resubmission rate | ✅ Working | Percentage shown |
| Average turnaround time | ✅ Working | Days displayed |
| Comparison table | ✅ Working | Side-by-side trainer metrics |

### 4.4 IQA Reports

| Feature | Status | Notes |
|---------|--------|-------|
| Trainer quality report | ✅ UI exists | Export buttons (CSV/PDF) — demo only |
| IQA activity summary | ✅ UI exists | Export buttons — demo only |
| Compliance audit trail | ✅ UI exists | Export buttons — demo only |
| Resubmission analysis | ✅ UI exists | Export buttons — demo only |

### 4.5 Qualification-Level Verification

| Feature | Status | Notes |
|---------|--------|-------|
| Qualification completion tick-off by IQA | ❌ Missing | No IQA sign-off at qualification level |
| Cross-unit verification | ❌ Missing | IQA can only review individual unit assessments |

**Gap (UK requirement):** IQA should be able to perform **qualification-level verification**, confirming that the overall qualification is complete and all units meet standards. This is a sign-off separate from individual unit sampling.

---

## 5. Admin Controls Audit

### 5.1 Qualification Management

| Feature | Status | Notes |
|---------|--------|-------|
| Create qualifications | ✅ Working | Dialog with title, code, level, category, price, awarding body |
| Edit qualifications | ✅ Working | Edit dialog with same fields |
| Archive qualifications | ✅ Working | Toggle archive/restore with soft delete |
| View qualification details | ✅ Working | Detail dialog with all metadata |
| Create units within qualification | ❌ Missing | No unit creation UI within qualification management |
| Upload resources per unit | ❌ Missing | No resource upload functionality |
| Manage unit structure | ❌ Missing | No drag-drop or ordering of units |

**Gap:** Admin can create the qualification shell but **cannot add units, upload resources, or define assessment criteria** from the admin panel. This is a critical gap — the qualification structure is entirely hardcoded in mock data.

### 5.2 Learner Management

| Feature | Status | Notes |
|---------|--------|-------|
| View all learners | ✅ Working | Table with search, status filter, pagination |
| Enrol learner manually | ✅ UI exists | Dialog with name, email, qualification, trainer assignment |
| View learner detail modal | ✅ Working | Tabs: Personal Info, Unit Progress, Payment |
| Edit learner details | ✅ Working | Name, phone, status, trainer assignment editable |
| Suspend learner | ✅ Working | Status dropdown with Active/Suspended/Completed |
| Email field read-only | ✅ Working | Correctly non-editable |
| Payment status tracking | ✅ Working | Paid/Pending/Overdue badges |

### 5.3 Trainer Management

| Feature | Status | Notes |
|---------|--------|-------|
| View all trainers | ✅ Working | Card layout with search |
| Add trainer | ✅ UI exists | Dialog with name, email, specialism |
| View trainer detail | ✅ Working | Modal with stats, assigned learners, specialisms |
| Edit trainer | ✅ Working | Name, status, specialisms editable |
| Activate/deactivate trainer | ✅ Working | Toggle with auto-exclusion from assignment dropdowns |
| Reassign learner from one trainer to another | ✅ UI exists | Reassign dialog within expanded learner list |
| View trainer workload | ✅ Working | Learner count and pending reviews visible |

### 5.4 IQA Management

| Feature | Status | Notes |
|---------|--------|-------|
| Create IQA accounts | ❌ Missing | No IQA management in admin panel |
| Assign IQA to qualifications | ❌ Missing | No IQA assignment functionality |
| Monitor IQA activity from admin | ⚠️ Partial | Escalation alert on admin dashboard only |

**Gap:** Admin has no dedicated IQA management module. IQA users cannot be created, assigned, or managed from the admin panel.

### 5.5 Progress Monitoring

| Feature | Status | Notes |
|---------|--------|-------|
| System-wide progress overview | ✅ Working | Average progress, at-risk, on-track, completing stats |
| Filter by risk level | ✅ Working | At Risk / On Track / Completing filters |
| Learner progress table | ✅ Working | With progress bars, risk badges |
| Search learners | ✅ Working | Name search |

### 5.6 Assessment History (Admin View)

| Feature | Status | Notes |
|---------|--------|-------|
| Admin view of all assessments | ❌ Missing | No admin-level assessment history page |
| Admin can open any learner's profile | ✅ Working | Via learner management detail modal |
| Admin can view trainer dashboards | ❌ Missing | No admin impersonation or cross-role viewing |

### 5.7 Intervention

| Feature | Status | Notes |
|---------|--------|-------|
| Override assessment decision | ❌ Missing | Admin cannot override trainer assessment |
| Suspend trainer | ✅ Working | Deactivate trainer functionality |
| Review disputed assessments | ❌ Missing | No dispute resolution workflow |
| Reassign learners in bulk | ❌ Missing | Only individual reassignment available |

### 5.8 Question Bank (Admin)

| Feature | Status | Notes |
|---------|--------|-------|
| View question pools | ✅ Working | AdminQuestionBank page |
| Create/edit questions | ✅ Working | AdminQuestionBankEditor |
| Final assessment configuration | ✅ Working | FinalAssessments page with config display |
| Assign final assessment to learner | ✅ Working | Dialog with qualification and learner selection |

### 5.9 EQA Export

| Feature | Status | Notes |
|---------|--------|-------|
| Export full learner portfolio | ✅ UI exists | "Full Portfolio" and "Evidence Only" buttons — demo toast only |
| Bulk export | ✅ UI exists | Bulk export button — demo toast only |
| Filter by qualification | ✅ Working | Qualification dropdown filter |
| Search learners | ✅ Working | Name/ID search |

**Gap:** Export is entirely mock — no actual ZIP/file generation. In production, this needs to compile evidence files, trainer feedback, IQA reviews, and audit logs into downloadable packages.

---

## 6. Compliance & Audit Trail

### Assessment: ❌ NOT COMPLIANT

| Requirement | Status | Notes |
|-------------|--------|-------|
| Evidence upload timestamps | ❌ Missing | Dates are hardcoded mock data |
| Assessment decision log | ❌ Missing | Decisions are component state only |
| Feedback history | ❌ Missing | Only latest feedback shown, no history |
| Resubmission tracking | ❌ Missing | No record of previous submissions |
| File version control | ❌ Missing | No versioning of uploaded evidence |
| Who performed each action | ❌ Missing | No user attribution on actions |
| Append-only audit log | ❌ Missing | No audit log exists |
| Evidence deletion prevention | ❌ N/A | No backend to enforce |
| Data export for Ofsted/DfE | ⚠️ UI only | Export buttons exist but generate no real data |

**CRITICAL COMPLIANCE RISK:** The platform has **zero audit trail infrastructure**. For Ofsted/DfE compliance, every submission, assessment, feedback, and file version must be immutably logged with timestamps and user attribution. This is the single biggest gap in the system.

---

## 7. Evidence Storage

### Assessment: ❌ NOT READY

| Requirement | Status | Notes |
|-------------|--------|-------|
| File upload to storage | ❌ Missing | Files captured in React state only |
| File metadata storage | ❌ Missing | No database for file records |
| Version control | ❌ Missing | No versioning system |
| Secure access permissions | ❌ Missing | No role-based file access control |
| Scalable storage (S3) | ❌ Missing | No cloud storage integration |
| File preview | ❌ Missing | No in-browser document viewer |
| File download | ⚠️ UI only | Buttons exist, no real file serving |
| Maximum file size enforcement | ⚠️ Partial | Accept attribute limits types but no size validation |
| File type validation | ⚠️ Client only | HTML accept attribute only — no server-side validation |

**Storage Architecture Needed:**
- AWS S3 or equivalent for file storage
- Database table linking files to learners, units, and submissions
- Presigned URLs for secure file access
- Version tracking with metadata (who uploaded, when, which submission)
- Anti-virus scanning on upload
- File size limits enforced server-side

---

## 8. UI/UX Review

### 8.1 Learner Portal

| Area | Assessment |
|------|------------|
| Dashboard layout | ✅ Clean, clear stats and activity feed |
| Qualification navigation | ✅ Good flow: Dashboard → Qualifications → Units |
| Unit detail page | ✅ Well-structured with resources, assignments, uploads |
| Progress indicators | ✅ Clear progress bars and status badges |
| Mobile responsiveness | ⚠️ Needs testing — grid layouts may break on small screens |
| Deadline visibility | ✅ Good urgency indicators with colour coding |

**UX Issues:**
- Some units (u6–u10) have no `detail` object — clicking "View Unit" shows only the header with no content
- No breadcrumb navigation within the learner portal
- "Submit for Review" button is not prominently placed — could be missed

### 8.2 Trainer Portal

| Area | Assessment |
|------|------------|
| Dashboard clarity | ✅ Good tabs: Pending / Learners / Recent |
| Pending submissions priority | ✅ Wait time badges help prioritise |
| Assessment review flow | ⚠️ Confusing — two different review paths exist |
| Unit management page | ✅ Good expandable submission cards |
| Quiz results review | ✅ Excellent per-question analysis |

**UX Issues:**
- **Two assessment review paths:** The dashboard "Review" button for pending submissions links to `/trainer/learner/:id/unit/:unitCode` (UnitManagement), but there's also a separate `/trainer/review/:id` (AssessmentReview) page. These serve similar purposes but have different UI. This is confusing — a trainer may not know which to use.
- The AssessmentReview page (`/trainer/review/:id`) finds submissions by ID from `pendingSubmissions` mock data, while UnitManagement generates mock submissions dynamically. These are **disconnected data sources**.
- No search/filter on the Assigned Learners page
- Assessment outcomes are not visually distinct enough — "Competent" and "Resubmission Required" buttons look similar until selected

### 8.3 IQA Portal

| Area | Assessment |
|------|------------|
| Dashboard | ✅ Clear stats with pending queue preview |
| Sampling queue | ✅ Good filtering and table layout |
| Assessment review | ✅ Comprehensive with evidence, criteria, trainer feedback, IQA decision |
| Trainer monitoring | ✅ Useful quality metrics |

**UX Issues:**
- No way to navigate directly from IQA review to the original submission or evidence
- IQA comments are stated to be hidden from learners but this is enforced by UI label only — no backend access control
- No pagination on sampling queue

### 8.4 Admin Portal

| Area | Assessment |
|------|------------|
| Dashboard | ✅ Good system overview with charts and quick actions |
| Sidebar collapsed by default | ✅ All features accessible via dashboard quick actions |
| Qualification management | ✅ CRUD with search and filters |
| Learner management | ✅ Detail modal with tabs |

**UX Issues:**
- Admin dashboard has a lot of quick action links — could benefit from grouping or priority ordering
- No global search across all entities (learners, trainers, qualifications)
- Charts use hardcoded mock data — not reflective of actual system state

---

## 9. Final Gap Summary

### ✅ Features Working Correctly (Frontend)

1. Learner dashboard with stats, activity feed, deadline alerts
2. Qualification progress tracking with progress bars
3. Unit detail view with resources, assignments, evidence upload UI
4. Quiz system with strict mode (fullscreen, anti-cheat, timer)
5. Written assignment submission with word counting
6. Trainer dashboard with pending/learners/recent tabs
7. Trainer assessment review with outcome selection and feedback
8. Trainer question bank management with quiz configuration
9. IQA sampling queue with multi-filter support
10. IQA assessment review with Approve/Flag/Escalate decisions
11. IQA trainer performance monitoring with quality metrics
12. IQA sampling configuration (random %, auto-resub, probation)
13. Admin dashboard with system-wide monitoring and charts
14. Admin qualification CRUD (create, view, edit, archive)
15. Admin learner management with detail modal and editing
16. Admin trainer management with activate/deactivate
17. Admin question bank (mirrors trainer capability)
18. Admin final assessment configuration and assignment
19. Admin EQA export UI
20. Admin reports and data export UI
21. Login/authentication UI (learner + staff portals)
22. Checkout flow with order summary
23. Qualification extension/renewal payment flow

### ⚠️ Features Partially Implemented

1. **File uploads** — UI exists but files are not stored
2. **Notifications** — Bell component exists with mock data
3. **Assessment decisions** — UI works but no persistence
4. **Manual enrolment** — Form works but no actual account creation
5. **Report exports** — Buttons exist but generate no files
6. **EQA portfolio export** — UI complete but no file generation
7. **Resource downloads** — Buttons present but no real files
8. **Search on some pages** — Admin has search, trainer assigned learners does not

### ❌ Missing Features (Compared to UK e-Portfolio Systems)

#### Critical (Must have for production)

| # | Feature | Priority | Notes |
|---|---------|----------|-------|
| 1 | **Backend / Database** | 🔴 Critical | No data persistence at all |
| 2 | **Real authentication** | 🔴 Critical | SessionStorage demo auth only |
| 3 | **File storage (S3/equivalent)** | 🔴 Critical | No actual file upload/storage |
| 4 | **Audit trail / activity log** | 🔴 Critical | Required for Ofsted/DfE |
| 5 | **Evidence version control** | 🔴 Critical | Previous submissions not retained |
| 6 | **Payment integration (Stripe)** | 🔴 Critical | No real payment processing |
| 7 | **Per-criteria tick-off for trainers** | 🔴 Critical | UK assessor requirement — not unit-level, criteria-level |
| 8 | **Unit/criteria creation in Admin** | 🔴 Critical | Cannot build qualification structure from admin |
| 9 | **Resource upload in Admin** | 🔴 Critical | Cannot upload learning materials |
| 10 | **Real-time notifications** | 🟠 High | Push/email notifications for feedback, deadlines |

#### High Priority

| # | Feature | Priority | Notes |
|---|---------|----------|-------|
| 11 | **Qualification-level IQA sign-off** | 🟠 High | IQA must verify overall qualification |
| 12 | **Trainer unit sign-off** | 🟠 High | Explicit "Sign off unit" button |
| 13 | **IQA management in Admin** | 🟠 High | Create/assign/manage IQA users |
| 14 | **Admin assessment history view** | 🟠 High | Admin must see all assessments |
| 15 | **Assessment override by Admin** | 🟠 High | Admin must intervene on disputes |
| 16 | **Feedback file upload (Trainer)** | 🟠 High | Trainers need to attach documents |
| 17 | **Resubmission history/counter** | 🟠 High | Track how many times evidence resubmitted |
| 18 | **Automatic IQA sampling trigger** | 🟠 High | Assessments should auto-enter IQA queue |
| 19 | **File preview in browser** | 🟠 High | View PDFs/images without download |
| 20 | **Search on Assigned Learners (Trainer)** | 🟠 High | Trainer needs to search/filter learners |

#### Medium Priority

| # | Feature | Priority | Notes |
|---|---------|----------|-------|
| 21 | **Dispute resolution workflow** | 🟡 Medium | Learner disputes assessment → admin reviews |
| 22 | **Bulk learner reassignment** | 🟡 Medium | Reassign multiple learners at once |
| 23 | **Learner-to-learner isolation** | 🟡 Medium | Ensure learners can only see own data |
| 24 | **Password reset (functional)** | 🟡 Medium | ForgotPassword page exists but non-functional |
| 25 | **Final assessment on learner portal** | 🟡 Medium | Assigned finals should appear in learner view |
| 26 | **Mobile-responsive testing** | 🟡 Medium | Responsive layouts not verified |
| 27 | **Email templates (enrolment, feedback)** | 🟡 Medium | No email system |
| 28 | **Certificate generation** | 🟡 Medium | No qualification completion certificate |
| 29 | **Admin dashboard — real-time data** | 🟡 Medium | Charts use hardcoded mock data |
| 30 | **Session timeout / security** | 🟡 Medium | No session management |

### UX Improvements Needed

1. **Unify trainer assessment paths** — Currently two different review interfaces (`/trainer/review/:id` and `/trainer/learner/:id/unit/:unitCode`). Should be a single, consistent workflow.
2. **Add breadcrumb navigation** across all portals for orientation
3. **Make "Submit for Assessment" more prominent** on learner unit pages — add a sticky footer CTA
4. **Add loading states** for all async operations (currently only toast feedback)
5. **Empty states for units without detail** — Several units (u6–u10) show blank pages when accessed
6. **Add global search** in admin portal
7. **Colour-code assessment outcomes more distinctly** in trainer review
8. **Add confirmation dialogs** for destructive actions (archive, suspend, deactivate)
9. **Improve mobile navigation** — sidebar-based layouts need responsive handling

### Compliance Risks

| Risk | Severity | Detail |
|------|----------|--------|
| No audit trail | 🔴 Critical | Ofsted requires timestamped evidence of all assessment activities |
| No data persistence | 🔴 Critical | All data lost on page refresh |
| No access control | 🔴 Critical | Any user can access any route without authentication |
| No file integrity | 🔴 Critical | Evidence files not stored, cannot prove authenticity |
| Demo authentication | 🔴 Critical | SessionStorage auth trivially bypassed |
| No GDPR compliance | 🟠 High | No data protection measures, consent flows, or data retention policies |
| No backup/recovery | 🟠 High | No database = no backup |
| No encryption at rest | 🟠 High | Files and data not encrypted |

---

## 10. Recommendations

### Phase 1: Backend Foundation (Immediate)
1. Enable Lovable Cloud (Supabase) for database, auth, and storage
2. Create database schema: qualifications, units, enrolments, submissions, assessments, audit_log
3. Implement real authentication with role-based access control
4. Set up file storage (Supabase Storage → S3 compatible)
5. Implement audit trail logging on all write operations

### Phase 2: Core Workflow (1-2 weeks)
1. Connect learner evidence upload to real file storage
2. Persist assessment decisions with trainer attribution and timestamps
3. Implement per-criteria tick-off for trainers
4. Build unit/resource management in Admin qualification editor
5. Connect IQA sampling to real assessment data

### Phase 3: Compliance & Integration (2-4 weeks)
1. Integrate Stripe for payment processing
2. Implement email notifications (enrolment, feedback, deadline reminders)
3. Build real export functionality (CSV, PDF, ZIP portfolios)
4. Add qualification-level sign-off workflow (Trainer → IQA → Admin)
5. Implement dispute resolution workflow

### Phase 4: Polish (4-6 weeks)
1. File preview (PDF viewer)
2. Certificate generation
3. Mobile responsiveness testing and fixes
4. GDPR compliance (consent, data retention, right to erasure)
5. Performance optimisation and security hardening

---

## Conclusion

The platform has an **excellent frontend foundation** covering all major user journeys and roles. The UI quality is high and the workflow logic is sound. However, it is currently a **demonstration prototype** — no data persists, no files are stored, and no authentication is enforced. 

**The #1 priority is enabling a backend** (database, auth, storage) to transform this from a demo into a functional system. Without this, the platform cannot be used for real learners, cannot comply with Ofsted/DfE requirements, and cannot be considered a production-grade e-portfolio system.

The gap between current state and a UK-compliant e-portfolio system (like Ecordia/OneFile) is primarily **infrastructure**, not design. The frontend architecture and user flows are well-designed and can serve as the blueprint for the full implementation.

---

*End of Audit Report*
