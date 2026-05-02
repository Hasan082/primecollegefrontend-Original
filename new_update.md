# Frontend ↔ Backend Wiring Pass — Implementation Plan

## Context

Wire the frontend (this repo) to the latest backend (`../primecollegebackend/`) and bring it to a stable, production-ready stage with no breaking changes.

**Current state (verified by reading actual sources, not relying on stale audit docs):**
- The frontend is materially more integrated than the older `gapanalysis.md` (12 March 2026) suggests. Roughly 90% of backend endpoints are already wired with cookie-based JWT auth, CSRF protection, automatic 401 refresh, and presigned S3 uploads for qualification images and unit resources.
- Recent backend work (last ~3 weeks) introduced: the IQA sampling/checklist system, new sample statuses (`trainer_review`, `reassessed`), strict 2-option IQA decision policy, trainer-side IQA referral response endpoint, S3 presign endpoints for profile pictures and navbar/footer logos, forget-password flow, learner declaration + course evaluation endpoints, and 6 admin report-export endpoints.
- The frontend lags the backend in 8 specific places. Most are small, surgical fixes. Two are already wired and only need a smoke test.

**Outcome:** apply the 8 targeted updates below, none of which are breaking. After the pass, every recently-changed backend endpoint has a wired frontend consumer that respects the new validation rules.

---

## Gaps and Surgical Fixes

### Gap 1 — IQA decision options (compliance-critical)

**Verified state:** `src/pages/iqa/AssessmentReview.tsx:95-118` already exposes only `[approved, action_required]`. **However** `src/pages/iqa/SamplingQueue.tsx:88` types `bulkDecision` as `"approved" | "action_required" | "escalated"` and renders `<SelectItem value="escalated">Escalate to Admin</SelectItem>` at line 291. The backend serializer (per `NEW_UDPATE_REQUIRED.md` Step 5) now rejects anything except `approved` / `action_required`, so the third option will silently fail in bulk review.

**Change:** drop the Escalate option and tighten the union.

```diff
- const [bulkDecision, setBulkDecision] = useState<"approved"|"action_required"|"escalated">("approved");
+ const [bulkDecision, setBulkDecision] = useState<"approved"|"action_required">("approved");
...
   <SelectItem value="approved">Approve</SelectItem>
   <SelectItem value="action_required">Action Required</SelectItem>
-  <SelectItem value="escalated">Escalate to Admin</SelectItem>
```

**Files:** `src/pages/iqa/SamplingQueue.tsx`.
**Risk:** low. The `action_type` line at 170 already only fires for `action_required`; nothing else references the literal `"escalated"` in this component.

---

### Gap 2 — Status badges for `trainer_review` + `reassessed`

**Verified state:** `src/lib/iqaStatus.ts:62-83`.
- `getReviewStatusLabel` handles `trainer_review` but has **no `reassessed` case** (falls through to the underscore-replace default).
- `getReviewStatusBadgeVariant` returns `"secondary"` (grey) for `trainer_review` — wrong colour per the spec — and has no `reassessed` branch at all.
- `src/components/ui/badge.tsx` ships only 4 shadcn variants (`default`, `secondary`, `destructive`, `outline`); orange/purple aren't built-in, so we need a `className` override.

**Change:** add a unified `getReviewStatusBadgeProps` helper returning `{variant, className}`. Existing helpers stay (callers can migrate gradually).

```diff
+ export function getReviewStatusBadgeProps(reviewStatus?: string|null) {
+   switch (reviewStatus) {
+     case "approved":        return { variant: "default" as const,    className: "bg-green-600 hover:bg-green-600 text-white" };
+     case "action_required": return { variant: "secondary" as const,  className: "bg-amber-500 hover:bg-amber-500 text-white" };
+     case "trainer_review":  return { variant: "secondary" as const,  className: "bg-orange-500 hover:bg-orange-500 text-white" };
+     case "reassessed":      return { variant: "secondary" as const,  className: "bg-purple-600 hover:bg-purple-600 text-white" };
+     case "escalated":       return { variant: "destructive" as const,className: "" };
+     case "in_progress":     return { variant: "default" as const,    className: "bg-blue-600 hover:bg-blue-600 text-white" };
+     case "auto_cleared":    return { variant: "outline" as const,    className: "bg-gray-200 text-gray-700" };
+     case "pending":         return { variant: "outline" as const,    className: "bg-gray-100 text-gray-700" };
+     default: return { variant: "outline" as const, className: "" };
+   }
+ }
+
+ // also add label fallback:
+ // case "reassessed": return "Awaiting Re-IQA";
```

Update call sites: `<Badge variant={p.variant} className={p.className}>...</Badge>` in `SamplingQueue.tsx:391`, `AssessmentReview.tsx` review-status display, plus any trainer dashboard tile that shows `review_status`. Run `grep -rn "getReviewStatusBadgeVariant\|getIqaWorkflowBadgeVariant" src/` to find them.

**Files:** `src/lib/iqaStatus.ts` plus the three or four call sites.
**Risk:** Tailwind purge — orange-500/purple-600 are common enough to be safe.

---

### Gap 3 — Trainer Performance detail drill-down

**Verified state:** `src/pages/iqa/TrainerPerformance.tsx` only calls `useGetTrainerPerformanceQuery` (list). Backend exposes `GET /api/enrolments/iqa/trainer-performance/<uuid:trainer_id>/`. `src/redux/apis/iqa/iqaApi.ts` has no matching query.

**Change:** add the detail query plus an inline dialog.

```diff
+ getTrainerPerformanceDetail: builder.query<TrainerPerformanceDetailResponse, string>({
+   query: (trainerId) => ({
+     url: `/api/enrolments/iqa/trainer-performance/${trainerId}/`,
+     method: "GET",
+   }),
+   providesTags: (_r,_e,id) => [{ type: "Enrolments", id: `TRAINER_PERF_${id}` }],
+ }),
```

In `TrainerPerformance.tsx`, make table rows clickable and lazy-load the detail in a `<Dialog>`: `useGetTrainerPerformanceDetailQuery(openTrainerId, { skip: !openTrainerId })`.

**Files:** `src/redux/apis/iqa/iqaApi.ts`, `src/pages/iqa/TrainerPerformance.tsx`, `src/types/iqa.types.ts`.
**Risk:** additive; `skip` ensures no fetch until clicked.

---

### Gap 4 — Profile picture presign upload

**Verified state:** `src/pages/trainer/Profile.tsx:74-95` and `src/pages/iqa/Profile.tsx:60-92` (and learner/admin equivalents) build `formData.append("profile_picture", file)` and call `updateMe(formData)` directly. No `presign-profile-picture` URL exists anywhere in `src/`. Backend `POST /api/auth/me/presign-profile-picture/` is unwired.

**Change:** add the presign mutation; refactor each Profile page to use the qualification-image presign pattern.

```diff
+ presignProfilePicture: builder.mutation<
+   { upload_url: string; fields: Record<string,string>; key: string; public_url: string },
+   { file_name: string; content_type: string }
+ >({
+   query: (body) => ({ url: "/api/auth/me/presign-profile-picture/", method: "POST", body }),
+ }),
```

In each Profile page's save handler: presign → upload to S3 → PATCH `/api/auth/me/` with `{profile_picture_key: presign.key}`.

**Files:** `src/redux/apis/authApi.ts`; `src/pages/{trainer,iqa,learner,admin}/Profile.tsx`. Extract `uploadFileToS3` from `QualificationMain.tsx` into `src/lib/s3Upload.ts`.

---

### Gap 5 — Navbar & Footer logo presign (deferred)

**Verified state:** Direct multipart still works; presign endpoints are additive. Defer.

---

### Gap 6 — Report exports (verify only)

**Verified state:** `reportsApi.ts` already defines all 6 lazy queries; `Reports.tsx` already wires them. Smoke-test only.

---

### Gap 7 — Trainer referral endpoint path (no-op)

**Verified state:** Frontend already hits a valid path. No change.

---

### Gap 8 — Mock-data cleanup in checklist modals

**Verified state:** `CreateChecklistModal.tsx:2` and `EditChecklistModal.tsx:2` still import `adminQualifications` from `@/data/adminMockData`. Real qualification list available via `getChecklistQualificationOptions`.

**Change:** swap to API; remove fallback; delete `adminMockData.ts` if unused elsewhere.

---

## Implementation Order

**PR #1 — IQA portal compliance + cleanup**
1. Gap 1 — SamplingQueue 2-option.
2. Gap 2 — `iqaStatus.ts` badge helper + call sites.
3. Gap 8 — checklist modal mock cleanup.

**PR #2 — Drill-downs + S3 parity**
4. Gap 3 — Trainer Performance detail dialog.
5. Gap 4 — Profile picture presign + s3Upload helper.

**Out of scope:** Gap 5 (deferred), Gap 6 (already wired), Gap 7 (no-op).

---

## Verification Plan

**Static checks**
- `npm run build` — must succeed.
- `npm run lint` — if configured.
- `grep -rn "escalated" src/pages/iqa/SamplingQueue.tsx` — must return zero hits after Gap 1.
- `grep -rn adminMockData src/` — must return zero hits after Gap 8 (if file deleted).

**Manual QA — IQA**
- Bulk decision shows only Approve / Action Required.
- Status badges render correctly for all 8 statuses.
- TrainerPerformance row click opens detail dialog.
- Checklist modal qualification dropdown comes from API.
- Profile avatar upload works via presign.

**Manual QA — Trainer**
- IQA referral response transitions `trainer_review` → `reassessed` (badge orange → purple).
- Profile avatar upload works.

**Manual QA — Admin**
- Reports exports download files.
- Navbar/Footer logo upload still works (Gap 5 unchanged).

**Manual QA — Learner**
- Regression-only: progress badges, profile picture upload.

**Stop-ship criteria**
- TypeScript build error.
- Console errors during manual flows.
- Regression in: login, learner declaration, course evaluation, evidence upload, written assignment, quiz attempt, qualification listing, blog rendering, page builder.

---

## Critical Files

- `src/lib/iqaStatus.ts`
- `src/pages/iqa/SamplingQueue.tsx`
- `src/pages/iqa/AssessmentReview.tsx`
- `src/pages/iqa/TrainerPerformance.tsx`
- `src/redux/apis/iqa/iqaApi.ts`
- `src/redux/apis/authApi.ts`
- `src/components/iqa/checkLists/CreateChecklistModal.tsx`
- `src/components/iqa/checkLists/EditChecklistModal.tsx`
- `src/pages/{trainer,iqa,learner,admin}/Profile.tsx`
- New: `src/lib/s3Upload.ts`
- New entry in: `src/types/iqa.types.ts`
