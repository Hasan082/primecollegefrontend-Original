# Services Reference

Business logic lives in service classes, separated from views for testability.

---

## Quiz Scoring Service

**File:** `apps/quizzes/services/quiz_scoring_service.py`

Server-side quiz scoring — **NEVER trust client scores**. Questions are shuffled and snapshotted at attempt time.

```python
class QuizScoringService:

    @staticmethod
    def generate_quiz(unit: Unit, num_questions: int = 25) -> list[Question]:
        """Select and shuffle questions for a quiz attempt."""
        questions = list(
            Question.objects.filter(unit=unit, is_active=True)
            .order_by('?')[:num_questions]
        )
        if len(questions) < num_questions:
            raise ValidationError(
                f"Insufficient questions: {len(questions)}/{num_questions}"
            )
        return questions

    @staticmethod
    def score_attempt(
        enrolment: Enrolment,
        unit: Unit,
        answers: dict,
        violations: list,
        started_at: datetime,
        questions: list[Question]
    ) -> QuizAttempt:
        """Score a submitted quiz and create all records atomically."""

        with transaction.atomic():
            correct_count = 0
            quiz_answers = []

            for order, question in enumerate(questions):
                learner_answer = answers.get(str(question.id), [])
                is_correct = sorted(learner_answer) == sorted(question.correct_answers)
                if is_correct:
                    correct_count += 1

                quiz_answers.append(QuizAnswer(
                    question=question,
                    question_order=order + 1,
                    learner_answers=learner_answer,
                    correct_answers=question.correct_answers,
                    is_correct=is_correct,
                    question_text_snapshot=question.question_text,
                    options_snapshot=question.options,
                ))

            score_percent = round((correct_count / len(questions)) * 100)
            pass_mark = unit.quiz_pass_mark
            time_taken = int((timezone.now() - started_at).total_seconds())

            attempt = QuizAttempt.objects.create(
                enrolment=enrolment,
                unit=unit,
                score_percent=score_percent,
                correct_count=correct_count,
                total_questions=len(questions),
                pass_mark=pass_mark,
                passed=score_percent >= pass_mark,
                time_taken_seconds=time_taken,
                violation_count=len(violations),
                started_at=started_at,
            )

            for qa in quiz_answers:
                qa.attempt = attempt
            QuizAnswer.objects.bulk_create(quiz_answers)

            for v in violations:
                IntegrityViolation.objects.create(
                    attempt=attempt,
                    violation_type=v['type'],
                    detail=v['detail'],
                    occurred_at=v['occurred_at'],
                )

            AuditLog.objects.create(
                action='quiz_submitted',
                actor=enrolment.learner,
                actor_role='learner',
                target_type='quiz_attempt',
                target_id=attempt.id,
                metadata={
                    'score': score_percent,
                    'passed': attempt.passed,
                    'violations': len(violations),
                },
            )

            return attempt
```

---

## IQA Sampling Service

**File:** `apps/iqa/services/sampling_service.py`

```python
class SamplingService:

    @staticmethod
    def create_samples_for_period(period: str):
        """Run periodically to queue assessments for IQA review."""

        recent_assessments = AssessmentDecision.objects.filter(
            assessed_at__gte=timezone.now() - timedelta(days=7),
        ).exclude(
            id__in=IQASample.objects.values_list('assessment_decision_id', flat=True)
        ).select_related('submission__enrolment')

        for decision in recent_assessments:
            enrolment = decision.submission.enrolment
            trainer = decision.trainer
            qualification = enrolment.qualification

            setting = SamplingSetting.objects.filter(
                Q(trainer=trainer) | Q(qualification=qualification)
            ).first()

            sample_rate = 100 if (setting and setting.is_new_trainer) else (
                setting.sample_rate_percent if setting else 25
            )

            if random.randint(1, 100) <= sample_rate:
                iqa_user = enrolment.assigned_iqa
                if iqa_user:
                    IQASample.objects.create(
                        iqa_reviewer=iqa_user,
                        assessment_decision=decision,
                        sampling_reason='new_trainer' if (setting and setting.is_new_trainer) else 'random',
                        sampling_period=period,
                    )
```

---

## IQA Checklist Service

**File:** `apps/iqa/services/checklist_service.py`

```python
class ChecklistService:

    @staticmethod
    def get_templates_for_qualification(qualification_id: str, unit_code: str = None):
        """Get applicable templates for a qualification, optionally filtered by unit."""
        qs = ChecklistTemplate.objects.filter(
            qualification_id=qualification_id,
            is_active=True
        ).prefetch_related('items')

        if unit_code:
            qs = qs.filter(Q(unit__code=unit_code) | Q(unit__isnull=True))

        return qs

    @staticmethod
    def complete_checklist(
        template: ChecklistTemplate,
        enrolment: Enrolment,
        iqa_user,
        responses: dict,
        summary_comment: str
    ) -> CompletedChecklist:
        """Submit a completed verification checklist."""

        completed = CompletedChecklist.objects.create(
            template=template,
            enrolment=enrolment,
            iqa_reviewer=iqa_user,
            responses=responses,
            summary_comment=summary_comment,
        )

        AuditLog.objects.create(
            action='iqa_checklist_completed',
            actor=iqa_user,
            actor_role='iqa',
            target_type='completed_checklist',
            target_id=completed.id,
            metadata={
                'template_title': template.title,
                'qualification_id': str(template.qualification_id),
            },
        )

        return completed
```

---

## Assessment Views

**File:** `apps/assessments/views/assessment_views.py`

```python
class MarkCriteriaView(APIView):
    permission_classes = [IsAuthenticated, IsTrainer, IsAssignedTrainer]

    def patch(self, request, enrolment_id, criteria_id):
        criteria_status, created = CriteriaStatus.objects.get_or_create(
            enrolment_id=enrolment_id,
            criteria_id=criteria_id,
            defaults={'assessed_by': request.user}
        )

        new_status = request.data.get('status')
        criteria_status.status = new_status
        criteria_status.assessed_by = request.user
        criteria_status.met_at = timezone.now() if new_status == 'met' else None
        criteria_status.save()

        AuditLog.objects.create(
            action='criteria_marked',
            actor=request.user,
            actor_role='trainer',
            target_type='criteria_status',
            target_id=criteria_status.id,
            metadata={'criteria_code': criteria_status.criteria.code, 'status': new_status},
        )

        self._check_unit_completion(enrolment_id, criteria_status.criteria.unit)
        return Response({'status': new_status})
```

---

## Payment Service

**File:** `apps/payments/views/checkout_views.py`

```python
class CreateCheckoutSessionView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        qualification_id = request.data['qualification_id']
        qualification = Qualification.objects.get(id=qualification_id, status='active')

        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price_data': {
                    'currency': 'gbp',
                    'product_data': {
                        'name': qualification.title,
                        'description': f'{qualification.level} — {qualification.awarding_body}',
                    },
                    'unit_amount': int(qualification.price * 100),
                },
                'quantity': 1,
            }],
            mode='payment',
            success_url=f'{settings.FRONTEND_URL}/enrolment/success?session_id={{CHECKOUT_SESSION_ID}}',
            cancel_url=f'{settings.FRONTEND_URL}/qualifications/{qualification.slug}',
            metadata={
                'qualification_id': str(qualification.id),
                'buyer_email': request.data.get('email', ''),
            },
        )

        return Response({'checkout_url': session.url})


class StripeWebhookView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        payload = request.body
        sig = request.META.get('HTTP_STRIPE_SIGNATURE')
        event = stripe.Webhook.construct_event(
            payload, sig, settings.STRIPE_WEBHOOK_SECRET
        )

        if event['type'] == 'checkout.session.completed':
            session = event['data']['object']
            self._handle_successful_payment(session)

        return Response({'status': 'ok'})
```

---

## EQA Export Service

**File:** `apps/reports/services/eqa_export_service.py`

```python
class EQAExportService:

    @staticmethod
    def generate_portfolio(learner_id: str) -> bytes:
        """Generate complete EQA portfolio PDF for external verifier."""
        enrolment = Enrolment.objects.select_related(
            'learner', 'qualification'
        ).prefetch_related(
            'qualification__units__criteria',
            Prefetch('submission_set', queryset=Submission.objects.filter(
                status='assessed'
            ).prefetch_related('assessments', 'files'))
        ).get(learner_id=learner_id)

        # Build structured data for PDF
        # ... template rendering with ReportLab or WeasyPrint
```

---

## Notification Tasks

**File:** `apps/notifications/tasks/email_tasks.py`

```python
@shared_task
def send_assessment_email(learner_id, unit_title, outcome):
    learner = User.objects.get(id=learner_id)
    subject_map = {
        'competent': f'✅ Congratulations — {unit_title} marked as Competent',
        'resubmission': f'📝 Resubmission Required — {unit_title}',
        'not_competent': f'⚠️ {unit_title} — Not Yet Competent',
    }
    send_templated_email(
        to=learner.email,
        subject=subject_map[outcome],
        template='assessment_outcome',
        context={'learner': learner, 'unit': unit_title, 'outcome': outcome},
    )


@shared_task
def send_access_expiry_warning():
    """Daily task: Warn learners 30/7/1 days before access expires."""
    warning_days = [30, 7, 1]
    for days in warning_days:
        expiring = Enrolment.objects.filter(
            status='active',
            access_expires_at__date=timezone.now().date() + timedelta(days=days),
        ).select_related('learner', 'qualification')

        for enrolment in expiring:
            Notification.objects.create(
                recipient=enrolment.learner,
                notification_type='access_expiring',
                title=f'Access expires in {days} day(s)',
                message=f'Your access to {enrolment.qualification.title} expires in {days} day(s).',
                link=f'/learner/qualifications/{enrolment.id}',
            )
```
