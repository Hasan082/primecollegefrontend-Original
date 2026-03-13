# API Endpoints Reference

All endpoints are namespaced by role for clarity and security.

---

## URL Structure

```python
urlpatterns = [
    # Public
    path('api/auth/', include('users.urls.auth')),
    path('api/qualifications/', include('qualifications.urls.public')),
    path('api/checkout/', include('payments.urls')),

    # Learner
    path('api/learner/', include('learner_api.urls')),

    # Trainer
    path('api/trainer/', include('trainer_api.urls')),

    # IQA
    path('api/iqa/', include('iqa_api.urls')),

    # Admin
    path('api/admin/', include('admin_api.urls')),
]
```

---

## Auth Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register/` | No | Learner registration (post-payment) |
| POST | `/api/auth/login/` | No | JWT token obtain |
| POST | `/api/auth/refresh/` | No | JWT refresh |
| POST | `/api/auth/password/reset/` | No | Password reset request |
| POST | `/api/auth/password/reset/confirm/` | No | Password reset confirm |
| POST | `/api/auth/password/change/` | Yes | Authenticated password change |
| GET | `/api/auth/me/` | Yes | Current user profile |

---

## Learner Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/learner/dashboard/` | Dashboard stats |
| GET | `/api/learner/enrolments/` | My enrolments |
| GET | `/api/learner/enrolments/{id}/` | Enrolment detail |
| GET | `/api/learner/enrolments/{id}/units/` | Units list |
| GET | `/api/learner/enrolments/{id}/units/{code}/` | Unit detail + resources |
| GET | `/api/learner/enrolments/{id}/units/{code}/resources/` | Download resource |
| POST | `/api/learner/enrolments/{id}/units/{code}/submit/` | Submit evidence |
| POST | `/api/learner/enrolments/{id}/units/{code}/upload/` | Upload file (pre-signed URL) |
| GET | `/api/learner/enrolments/{id}/units/{code}/feedback/` | Assessment feedback |
| POST | `/api/learner/enrolments/{id}/units/{code}/quiz/` | Submit quiz |
| GET | `/api/learner/enrolments/{id}/progress/` | Progress overview |
| GET | `/api/learner/notifications/` | Notifications |
| PATCH | `/api/learner/notifications/{id}/read/` | Mark as read |
| POST | `/api/learner/extensions/` | Request extension |

---

## Trainer Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/trainer/dashboard/` | Dashboard stats |
| GET | `/api/trainer/learners/` | Assigned learners |
| GET | `/api/trainer/learners/{id}/` | Learner detail |
| GET | `/api/trainer/learners/{id}/units/{code}/` | Unit submissions |
| GET | `/api/trainer/learners/{id}/units/{code}/submissions/` | Submission list |
| GET | `/api/trainer/submissions/{id}/` | Submission detail |
| POST | `/api/trainer/submissions/{id}/assess/` | Submit assessment |
| GET | `/api/trainer/quiz-attempts/{id}/` | Quiz result detail |
| GET | `/api/trainer/queue/` | Pending assessments queue |
| GET | `/api/trainer/history/` | Assessment history |
| PATCH | `/api/trainer/learners/{id}/units/{code}/criteria/{cid}/` | Mark criteria met/not met |
| GET | `/api/trainer/question-bank/{unit_id}/` | Questions for unit |
| POST | `/api/trainer/question-bank/{unit_id}/` | Add question |
| PUT | `/api/trainer/question-bank/{unit_id}/{qid}/` | Edit question |
| DELETE | `/api/trainer/question-bank/{unit_id}/{qid}/` | Deactivate question |

---

## IQA Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/iqa/dashboard/` | IQA dashboard |
| GET | `/api/iqa/sampling-queue/` | Pending samples |
| GET | `/api/iqa/samples/{id}/` | Sample detail (evidence + assessment) |
| POST | `/api/iqa/samples/{id}/review/` | Submit IQA review |
| GET | `/api/iqa/trainer-performance/` | Trainer stats |
| GET | `/api/iqa/reports/` | Compliance reports |
| GET | `/api/iqa/settings/` | Sampling settings |
| PUT | `/api/iqa/settings/` | Update sampling config |
| GET | `/api/iqa/checklists/templates/` | Available checklist templates |
| POST | `/api/iqa/checklists/` | Complete a verification checklist |
| GET | `/api/iqa/checklists/` | Completed checklists list |
| GET | `/api/iqa/checklists/{id}/` | Completed checklist detail |

---

## Admin Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/qualifications/` | List all |
| POST | `/api/admin/qualifications/` | Create |
| PUT | `/api/admin/qualifications/{id}/` | Update |
| PATCH | `/api/admin/qualifications/{id}/archive/` | Archive/unarchive |
| POST | `/api/admin/qualifications/{id}/units/` | Add unit |
| PUT | `/api/admin/qualifications/{id}/units/{code}/` | Update unit |
| POST | `/api/admin/qualifications/{id}/units/{code}/criteria/` | Add criteria |
| POST | `/api/admin/qualifications/{id}/units/{code}/resources/` | Upload resource |
| GET | `/api/admin/learners/` | List all |
| POST | `/api/admin/learners/` | Manual enrol |
| PUT | `/api/admin/learners/{id}/` | Update |
| PATCH | `/api/admin/learners/{id}/suspend/` | Suspend |
| PATCH | `/api/admin/learners/{id}/assign-trainer/` | Assign trainer |
| PATCH | `/api/admin/learners/{id}/assign-iqa/` | Assign IQA |
| GET | `/api/admin/trainers/` | List all |
| POST | `/api/admin/trainers/` | Create trainer account |
| PUT | `/api/admin/trainers/{id}/` | Update |
| GET | `/api/admin/reports/progress/` | Progress report |
| GET | `/api/admin/reports/assessments/` | Assessment stats |
| GET | `/api/admin/reports/compliance/` | Compliance report |
| GET | `/api/admin/audit-log/` | Full audit log (paginated) |
| GET | `/api/admin/eqa-export/{learner_id}/` | EQA portfolio export (PDF) |
| GET | `/api/admin/question-bank/` | All questions |
| POST | `/api/admin/question-bank/bulk-import/` | CSV/JSON import |
| GET | `/api/admin/checklists/templates/` | All checklist templates |
| POST | `/api/admin/checklists/templates/` | Create checklist template |
| PUT | `/api/admin/checklists/templates/{id}/` | Update template |
| DELETE | `/api/admin/checklists/templates/{id}/` | Deactivate template |

---

## Access Control Matrix

| Resource | Learner | Trainer | IQA | Admin |
|----------|---------|---------|-----|-------|
| Own enrolment | R | — | — | RW |
| Assigned enrolments | — | R | R | RW |
| Resources (paid) | R | R | R | CRUD |
| Submit evidence | CRU | — | — | — |
| Review evidence | — | R | R | R |
| Assess submission | — | CRU | — | R |
| IQA sample | — | — | CRUD | R |
| Verification checklists | — | — | CRUD | R |
| Checklist templates | — | — | R | CRUD |
| Question bank | — | CRUD | — | CRUD |
| Qualifications | — | — | — | CRUD |
| Audit logs | — | — | R | R |
| User management | — | — | — | CRUD |
