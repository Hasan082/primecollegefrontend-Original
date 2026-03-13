# Serializers Reference

---

## Quiz Serializers

**File:** `apps/quizzes/serializers/quiz_serializers.py`

```python
class QuizAttemptDetailSerializer(serializers.ModelSerializer):
    violations = IntegrityViolationSerializer(many=True, read_only=True)
    answers = QuizAnswerSerializer(many=True, read_only=True)
    time_taken = serializers.SerializerMethodField()

    class Meta:
        model = QuizAttempt
        fields = [
            'id', 'score_percent', 'correct_count', 'total_questions',
            'pass_mark', 'passed', 'time_taken', 'violation_count',
            'violations', 'answers', 'submitted_at'
        ]

    def get_time_taken(self, obj):
        mins, secs = divmod(obj.time_taken_seconds, 60)
        return f"{mins}:{secs:02d}"
```

---

## Assessment Serializers

**File:** `apps/assessments/serializers/submission_serializers.py`

```python
class SubmissionListSerializer(serializers.ModelSerializer):
    files = SubmissionFileSerializer(many=True, read_only=True)

    class Meta:
        model = Submission
        fields = ['id', 'submission_type', 'title', 'status', 'submitted_at',
                  'quiz_attempt', 'word_count', 'files']
```

**File:** `apps/assessments/serializers/assessment_serializers.py`

```python
class AssessmentDecisionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssessmentDecision
        fields = ['outcome', 'feedback', 'feedback_file']

    def validate_outcome(self, value):
        if value not in ['competent', 'resubmission', 'not_competent']:
            raise serializers.ValidationError("Invalid outcome")
        return value
```

---

## IQA Checklist Serializers

**File:** `apps/iqa/serializers/checklist_serializers.py`

```python
class ChecklistItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChecklistItem
        fields = ['id', 'label', 'response_type', 'order']


class ChecklistTemplateSerializer(serializers.ModelSerializer):
    items = ChecklistItemSerializer(many=True)

    class Meta:
        model = ChecklistTemplate
        fields = ['id', 'qualification', 'unit', 'title', 'is_active', 'items',
                  'created_at', 'updated_at']

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        template = ChecklistTemplate.objects.create(**validated_data)
        for item in items_data:
            ChecklistItem.objects.create(template=template, **item)
        return template


class CompletedChecklistSerializer(serializers.ModelSerializer):
    template_title = serializers.CharField(source='template.title', read_only=True)
    iqa_name = serializers.CharField(source='iqa_reviewer.get_full_name', read_only=True)

    class Meta:
        model = CompletedChecklist
        fields = ['id', 'template', 'template_title', 'enrolment', 'iqa_name',
                  'responses', 'summary_comment', 'completed_at']
```
