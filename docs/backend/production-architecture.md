# Prime College — Production Backend Architecture

**Version:** 1.1  
**Date:** 13 March 2026  
**Status:** Architecture Specification  
**Stack:** Django REST Framework (DRF) + PostgreSQL + AWS S3 + Redis + Celery

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Technology Stack](#2-technology-stack)
3. [Database Schema Overview](#3-database-schema-overview)
4. [Authentication & Authorisation](#4-authentication--authorisation)
5. [API Architecture](#5-api-architecture)
6. [File Storage & Evidence Management](#6-file-storage--evidence-management)
7. [Assessment & Grading Engine](#7-assessment--grading-engine)
8. [Audit Trail & Compliance](#8-audit-trail--compliance)
9. [Notification System](#9-notification-system)
10. [Payment Integration](#10-payment-integration)
11. [IQA & Quality Assurance](#11-iqa--quality-assurance)
12. [Caching & Performance](#12-caching--performance)
13. [Security Architecture](#13-security-architecture)
14. [Deployment & Infrastructure](#14-deployment--infrastructure)
15. [Monitoring & Observability](#15-monitoring--observability)
16. [Data Migration & Seeding](#16-data-migration--seeding)
17. [Documentation Index](#17-documentation-index)

---

## 1. System Overview

### 1.1 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React + Vite)                  │
│   Learner Portal │ Trainer Portal │ IQA Portal │ Admin Portal   │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTPS / JWT
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                     LOAD BALANCER (AWS ALB)                      │
└──────────────────────────┬──────────────────────────────────────┘
                           │
          ┌────────────────┼────────────────┐
          ▼                ▼                ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  DRF App     │  │  DRF App     │  │  DRF App     │
│  Instance 1  │  │  Instance 2  │  │  Instance N  │
│  (Gunicorn)  │  │  (Gunicorn)  │  │  (Gunicorn)  │
└──────┬───────┘  └──────┬───────┘  └──────┬───────┘
       │                 │                 │
       └────────┬────────┘────────┬────────┘
                │                 │
       ┌────────▼──────┐  ┌──────▼────────┐
       │  PostgreSQL   │  │    Redis       │
       │  (RDS)        │  │  (ElastiCache) │
       │  Primary +    │  │  Sessions +    │
       │  Read Replica │  │  Cache + Queue │
       └───────────────┘  └───────────────┘
                │
       ┌────────▼──────┐  ┌───────────────┐
       │  AWS S3       │  │  Celery        │
       │  Evidence     │  │  Workers       │
       │  Storage      │  │  (Background)  │
       └───────────────┘  └───────────────┘
```

### 1.2 Design Principles

1. **Append-Only Audit** — No hard deletes on assessment data; all changes logged
2. **Server-Side Scoring** — Quiz answers scored on backend; never trust client
3. **Role-Based Access** — Every endpoint enforced via permissions, never client-side checks
4. **Evidence Immutability** — Submitted evidence cannot be modified, only versioned
5. **Compliance-First** — All data structures designed for Ofsted/DfE audit export

---

## 2. Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| API Framework | Django 5.x + DRF 3.15 | REST API, ORM, admin |
| Database | PostgreSQL 16 (AWS RDS) | Primary data store |
| Cache / Queue | Redis 7 (AWS ElastiCache) | Caching, sessions, Celery broker |
| Task Queue | Celery 5.x | Async tasks (email, PDF, notifications) |
| File Storage | AWS S3 + CloudFront CDN | Evidence files, resources, exports |
| Authentication | Django SimpleJWT | JWT access + refresh tokens |
| Email | AWS SES | Transactional emails |
| Payments | Stripe API | Qualification purchases |
| Search | PostgreSQL Full-Text Search | Learner/qualification search |
| Monitoring | Sentry + CloudWatch | Error tracking, metrics |
| CI/CD | GitHub Actions | Automated testing + deployment |
| Container | Docker + AWS ECS Fargate | Serverless container deployment |

---

## 3. Database Schema Overview

### 3.1 Entity Relationship Diagram

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│    User      │────▸│    UserRole       │     │  Qualification  │
│  (auth)      │     │  (learner/trainer │     │                 │
│              │     │   /admin/iqa)     │     │                 │
└──────┬───────┘     └──────────────────┘     └────────┬────────┘
       │                                               │
       ▼                                               ▼
┌──────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Profile     │     │   Enrolment      │────▸│     Unit        │
│   (extends    │     │   (learner +     │     │  (belongs to    │
│    user)      │     │    qualification) │     │   qualification)│
└──────────────┘     └────────┬─────────┘     └────────┬────────┘
                              │                        │
                              ▼                        ▼
                     ┌──────────────────┐     ┌─────────────────┐
                     │  TrainerAssign   │     │ AssessmentCrit  │
                     │  (trainer ↔      │     │  (criteria per  │
                     │   enrolment)     │     │   unit)         │
                     └──────────────────┘     └────────┬────────┘
                                                       │
                     ┌──────────────────┐              │
                     │   Submission     │◀─────────────┘
                     │  (evidence per   │
                     │   unit/criteria) │
                     └────────┬─────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
     ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
     │ SubmissionFile│ │ Assessment   │ │ QuizAttempt  │
     │ (versioned   │ │ Decision     │ │ (auto-scored │
     │  evidence)   │ │ (trainer     │ │  quiz result)│
     └──────────────┘ │  feedback)   │ └──────────────┘
                      └──────────────┘
```

### 3.2 App → Model Mapping

| App | Models | Details |
|-----|--------|---------|
| `users` | UserProfile, UserRole | → [models/users.md](models/users.md) |
| `qualifications` | Qualification, Unit, AssessmentCriteria, UnitResource | → [models/qualifications.md](models/qualifications.md) |
| `enrolments` | Enrolment | → [models/enrolments.md](models/enrolments.md) |
| `assessments` | Submission, SubmissionFile, AssessmentDecision, CriteriaStatus | → [models/assessments.md](models/assessments.md) |
| `quizzes` | Question, QuizAttempt, QuizAnswer, IntegrityViolation | → [models/quizzes.md](models/quizzes.md) |
| `iqa` | IQASample, IQAReview, SamplingSetting, ChecklistTemplate, ChecklistItem, CompletedChecklist | → [models/iqa.md](models/iqa.md) |
| `notifications` | Notification | → [models/notifications.md](models/notifications.md) |
| `audit` | AuditLog | → [models/audit.md](models/audit.md) |

### 3.3 Migration Order

```
1. users (UserProfile, UserRole)
2. qualifications (Qualification, Unit, AssessmentCriteria, UnitResource)
3. enrolments (Enrolment)
4. quizzes (Question)
5. assessments (Submission, SubmissionFile, AssessmentDecision, CriteriaStatus)
6. quizzes (QuizAttempt, QuizAnswer, IntegrityViolation)
7. iqa (IQASample, IQAReview, SamplingSetting, ChecklistTemplate, ChecklistItem, CompletedChecklist)
8. notifications (Notification)
9. audit (AuditLog)
```

---

## 4. Authentication & Authorisation

- **JWT** with 30-minute access tokens and 7-day rotating refresh tokens
- **Role-based permissions** enforced via `UserRole` table — roles are NEVER stored on the user model
- Separate permission classes: `IsLearner`, `IsTrainer`, `IsIQA`, `IsAdmin`, `IsAssignedTrainer`, `IsEnrolmentOwner`
- Rate limiting: 20/min anonymous, 100/min authenticated

→ Full implementation: [api/permissions.md](api/permissions.md)

---

## 5. API Architecture

- Endpoints namespaced by role: `/api/learner/`, `/api/trainer/`, `/api/iqa/`, `/api/admin/`
- Public endpoints for qualification catalogue and checkout
- All assessment-related endpoints require role + assignment verification

→ Full endpoint reference: [api/endpoints.md](api/endpoints.md)  
→ Serializers: [api/serializers.md](api/serializers.md)  
→ Services & views: [api/services.md](api/services.md)

---

## 6. File Storage & Evidence Management

- Direct S3 upload via pre-signed PUT URLs (5 min expiry)
- Downloads via CloudFront signed URLs (15 min expiry)
- SHA-256 checksums for integrity verification
- Soft-delete only — evidence retained for minimum 7 years (regulatory requirement)
- Max 50MB per file, 10 files per submission

→ Full details: [infrastructure/file-storage.md](infrastructure/file-storage.md)

---

## 7. Assessment & Grading Engine

### 7.1 Quiz Scoring

- All quiz scoring is **server-side only** — frontend sends raw answers, backend computes scores
- Questions are shuffled and snapshotted at attempt time for audit integrity
- Anti-cheat violation logging (tab switches, copy/paste, devtools, etc.)

### 7.2 Assessment Workflow

```
Learner uploads evidence → Trainer reviews & marks → IQA samples & verifies → Admin audits
                                    │
                           AssessmentDecision
                           (immutable record)
                                    │
                              Audit Log
                           (append-only)
```

### 7.3 Per-Criteria Marking

Trainers mark individual assessment criteria (UK standard: 1.1, 1.2, 2.1, etc.). When all criteria for a unit are marked as "met", the unit auto-completes.

→ Service implementation: [api/services.md](api/services.md)

---

## 8. Audit Trail & Compliance

### What Gets Logged

| Event Category | Examples |
|---------------|----------|
| Evidence | Upload, submission, resubmission, soft-delete |
| Assessment | Started, completed, criteria marked, unit completed, qualification completed |
| Quiz | Started, submitted, integrity violations |
| IQA | Sample created, review completed, escalation, checklist completed |
| Admin | Enrolment, suspension, trainer assignment, qualification management |
| Access | Login, password change, access grant/expiry |

### Compliance Requirements

- `AuditLog` records are **immutable** — `save()` and `delete()` are overridden to prevent modification
- Compliance middleware ensures all assessment-modifying endpoints create audit entries
- EQA portfolio PDF export available for external verifiers

---

## 9. Notification System

### Notification Types

| Type | Trigger | Recipient |
|------|---------|-----------|
| `submission_received` | Learner submits evidence | Assigned trainer |
| `assessment_completed` | Trainer completes assessment | Learner |
| `resubmission_required` | Trainer marks resubmission | Learner |
| `iqa_flagged` | IQA flags an issue | Trainer + admin |
| `access_expiring` | 30/7/1 days before expiry | Learner |
| `new_resource` | Admin uploads resource | Enrolled learners |
| `extension_approved` | Admin approves extension | Learner |
| `extension_denied` | Admin denies extension | Learner |

### Delivery Channels

- **In-app** — Real-time via notification bell
- **Email** — Celery async tasks via AWS SES (assessment outcomes, welcome, access expiry warnings)

→ Task implementation: [api/services.md](api/services.md)

---

## 10. Payment Integration

- **Stripe Checkout** for qualification purchases
- Webhook-based payment confirmation → automatic user creation + enrolment
- Admin manual enrolment for employer-funded learners
- Access is **only granted after payment confirmation**

→ Service implementation: [api/services.md](api/services.md)

---

## 11. IQA & Quality Assurance

### Automated Sampling

- Configurable sampling rates per qualification or trainer (default 25%)
- 100% sampling for new trainers
- Automatic sample queue generation (weekly Celery task)

### Verification Checklists

- Admin creates dynamic checklist templates per qualification or unit
- Each item has a configurable response type: Yes/No, Yes/No/N/A, or Met/Not Met/N/A
- IQA completes checklists for specific learners with a summary comment
- All completions are audit-logged

→ Models: [models/iqa.md](models/iqa.md)  
→ Service: [api/services.md](api/services.md)

---

## 12. Caching & Performance

- Redis caching with TTLs ranging from 30 seconds (real-time counts) to 5 minutes (public catalogue)
- Database query optimisation via `select_related`, `prefetch_related`, and annotated queries
- Denormalised progress fields on Enrolment for dashboard performance

→ Full details: [infrastructure/caching.md](infrastructure/caching.md)

---

## 13. Security Architecture

- JWT with short-lived access tokens + rotating refresh tokens
- Role-based access via database-backed `UserRole` table
- Pre-signed URLs for all file access (never expose S3 paths)
- CORS whitelist for frontend domains only
- TLS 1.3 in transit, AES-256 at rest
- API rate limiting + brute-force protection
- AWS Secrets Manager for all API keys

→ Full details: [infrastructure/security.md](infrastructure/security.md)

---

## 14. Deployment & Infrastructure

- **AWS ECS Fargate** — Serverless container deployment with auto-scaling
- **RDS PostgreSQL** — Primary + read replica
- **ElastiCache Redis** — Sessions, cache, Celery broker
- **S3 + CloudFront** — Static frontend + evidence storage
- **GitHub Actions** CI/CD with automated testing

→ Full details: [infrastructure/deployment.md](infrastructure/deployment.md)

---

## 15. Monitoring & Observability

- **Sentry** for error tracking and performance monitoring
- **CloudWatch** for infrastructure metrics and structured JSON logs
- Alerts on 5xx rate, latency, DB connections, failed logins, queue depth

→ Full details: [infrastructure/monitoring.md](infrastructure/monitoring.md)

---

## 16. Data Migration & Seeding

### Seed Data Strategy

Demo data matching frontend mock data for testing. Creates:
- Admin, trainer, IQA, and learner accounts
- Qualifications with units, criteria, and resources
- Enrolments with trainer/IQA assignments
- Sample submissions and assessment decisions

---

## 17. Documentation Index

### Models (Database Schema)

| File | Contents |
|------|----------|
| [models/users.md](models/users.md) | UserProfile, UserRole |
| [models/qualifications.md](models/qualifications.md) | Qualification, Unit, AssessmentCriteria, UnitResource |
| [models/enrolments.md](models/enrolments.md) | Enrolment |
| [models/assessments.md](models/assessments.md) | Submission, SubmissionFile, AssessmentDecision, CriteriaStatus |
| [models/quizzes.md](models/quizzes.md) | Question, QuizAttempt, QuizAnswer, IntegrityViolation |
| [models/iqa.md](models/iqa.md) | IQASample, IQAReview, SamplingSetting, ChecklistTemplate, ChecklistItem, CompletedChecklist |
| [models/notifications.md](models/notifications.md) | Notification |
| [models/audit.md](models/audit.md) | AuditLog |

### API Reference

| File | Contents |
|------|----------|
| [api/endpoints.md](api/endpoints.md) | Complete endpoint reference with access control matrix |
| [api/permissions.md](api/permissions.md) | JWT config, role-based permissions |
| [api/serializers.md](api/serializers.md) | DRF serializers for all apps |
| [api/services.md](api/services.md) | Business logic services, views, Celery tasks |

### Infrastructure

| File | Contents |
|------|----------|
| [infrastructure/file-storage.md](infrastructure/file-storage.md) | S3 upload/download flows, bucket structure, policies |
| [infrastructure/deployment.md](infrastructure/deployment.md) | AWS architecture, environments, CI/CD |
| [infrastructure/caching.md](infrastructure/caching.md) | Redis strategy, database optimisation |
| [infrastructure/security.md](infrastructure/security.md) | Security controls, CORS |
| [infrastructure/monitoring.md](infrastructure/monitoring.md) | Monitoring stack, alerts |

---

## Appendix A: Project Structure

```
prime-college-backend/
├── manage.py
├── config/
│   ├── settings/
│   │   ├── base.py
│   │   ├── development.py
│   │   ├── staging.py
│   │   └── production.py
│   ├── urls.py
│   └── wsgi.py
│
├── core/
│   ├── mixins/
│   │   ├── response_mixin.py
│   │   ├── audit_mixin.py
│   │   └── pagination_mixin.py
│   ├── utils/
│   │   ├── response_utils.py
│   │   ├── email_utils.py
│   │   ├── s3_utils.py
│   │   └── ref_utils.py
│   ├── permissions.py
│   └── middleware.py
│
├── apps/
│   ├── users/
│   │   ├── models.py
│   │   ├── views/
│   │   │   ├── auth_views.py
│   │   │   └── profile_views.py
│   │   ├── services/
│   │   │   └── user_service.py
│   │   ├── serializers/
│   │   │   ├── auth_serializers.py
│   │   │   └── profile_serializers.py
│   │   └── urls/
│   │       └── auth.py
│   │
│   ├── qualifications/
│   │   ├── models.py
│   │   ├── views/
│   │   │   ├── public_views.py
│   │   │   └── admin_views.py
│   │   ├── services/
│   │   │   └── qualification_service.py
│   │   ├── serializers/
│   │   │   ├── public_serializers.py
│   │   │   └── admin_serializers.py
│   │   └── urls/
│   │       ├── public.py
│   │       └── admin.py
│   │
│   ├── enrolments/
│   │   ├── models.py
│   │   ├── views/
│   │   │   ├── learner_views.py
│   │   │   └── admin_views.py
│   │   ├── services/
│   │   │   ├── enrolment_service.py
│   │   │   └── progress_service.py
│   │   ├── signals/
│   │   │   └── enrolment_signals.py
│   │   ├── serializers/
│   │   │   ├── learner_serializers.py
│   │   │   └── admin_serializers.py
│   │   └── urls/
│   │       ├── learner.py
│   │       └── admin.py
│   │
│   ├── assessments/
│   │   ├── models.py
│   │   ├── views/
│   │   │   ├── submission_views.py
│   │   │   ├── assessment_views.py
│   │   │   └── admin_views.py
│   │   ├── services/
│   │   │   ├── submission_service.py
│   │   │   ├── assessment_service.py
│   │   │   └── file_service.py
│   │   ├── signals/
│   │   │   └── assessment_signals.py
│   │   ├── serializers/
│   │   │   ├── submission_serializers.py
│   │   │   └── assessment_serializers.py
│   │   └── urls/
│   │       ├── learner.py
│   │       └── trainer.py
│   │
│   ├── quizzes/
│   │   ├── models.py
│   │   ├── views/
│   │   │   ├── quiz_views.py
│   │   │   ├── result_views.py
│   │   │   └── question_bank_views.py
│   │   ├── services/
│   │   │   ├── quiz_scoring_service.py
│   │   │   └── question_bank_service.py
│   │   ├── signals/
│   │   │   └── quiz_signals.py
│   │   ├── serializers/
│   │   │   ├── quiz_serializers.py
│   │   │   └── question_serializers.py
│   │   └── urls/
│   │       ├── learner.py
│   │       └── trainer.py
│   │
│   ├── iqa/
│   │   ├── models.py
│   │   ├── views/
│   │   │   ├── sampling_views.py
│   │   │   ├── review_views.py
│   │   │   ├── checklist_views.py
│   │   │   ├── report_views.py
│   │   │   └── settings_views.py
│   │   ├── services/
│   │   │   ├── sampling_service.py
│   │   │   ├── checklist_service.py
│   │   │   └── report_service.py
│   │   ├── signals/
│   │   │   └── iqa_signals.py
│   │   ├── serializers/
│   │   │   ├── sample_serializers.py
│   │   │   ├── review_serializers.py
│   │   │   └── checklist_serializers.py
│   │   └── urls/
│   │       └── iqa.py
│   │
│   ├── payments/
│   │   ├── views/
│   │   │   ├── checkout_views.py
│   │   │   └── webhook_views.py
│   │   ├── services/
│   │   │   └── payment_service.py
│   │   ├── signals/
│   │   │   └── payment_signals.py
│   │   └── urls.py
│   │
│   ├── notifications/
│   │   ├── models.py
│   │   ├── views/
│   │   │   └── notification_views.py
│   │   ├── services/
│   │   │   └── notification_service.py
│   │   ├── signals/
│   │   │   └── notification_signals.py
│   │   ├── tasks/
│   │   │   ├── email_tasks.py
│   │   │   └── reminder_tasks.py
│   │   ├── serializers/
│   │   └── urls/
│   │
│   ├── audit/
│   │   ├── models.py
│   │   ├── views/
│   │   │   └── audit_views.py
│   │   ├── services/
│   │   │   └── audit_service.py
│   │   ├── mixins/
│   │   │   └── auditable_mixin.py
│   │   ├── serializers/
│   │   └── urls/
│   │
│   └── reports/
│       ├── views/
│       │   ├── progress_report_views.py
│       │   ├── assessment_report_views.py
│       │   └── compliance_report_views.py
│       ├── services/
│       │   ├── eqa_export_service.py
│       │   └── report_generator_service.py
│       └── urls/
│
├── requirements/
│   ├── base.txt
│   ├── development.txt
│   └── production.txt
├── Dockerfile
├── docker-compose.yml
└── .github/workflows/deploy.yml
```

### App Structure Convention

Every app follows this consistent pattern:

| Folder | Purpose |
|--------|---------|
| `views/` | API endpoint handlers, one file per domain concern |
| `services/` | Business logic, separated from views for testability |
| `signals/` | Django signals for cross-app event handling |
| `serializers/` | DRF serializers, split by role or domain |
| `mixins/` | Reusable view/model mixins |
| `utils/` | Pure utility functions |
| `tasks/` | Celery async tasks |
| `urls/` | URL routing, split by role namespace |

**Rules:**
- Views call services; views should NOT contain business logic
- Services are the single source of truth for business rules
- Signals handle cross-app side effects (notifications, audit logging, progress recalculation)
- Shared utilities live in `core/` — app-specific utilities stay in the app's `utils/`

---

*This architecture document serves as the engineering blueprint for the Prime College backend. All code implementations are in the referenced sub-documents.*
