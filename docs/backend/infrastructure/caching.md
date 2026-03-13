# Caching & Performance

---

## Redis Caching Strategy

| Cache Key | TTL | Purpose |
|-----------|-----|---------|
| `qualification_list` | 5 min | Public catalogue |
| `qualification_detail` | 5 min | Public detail page |
| `learner_dashboard` | 1 min | Personalised dashboard |
| `trainer_queue_count` | 30 sec | Pending assessment count |
| `progress_stats` | 2 min | Progress percentages |

---

## Database Optimisation

### Trainer Dashboard — Single query with prefetch

```python
Enrolment.objects.filter(
    assigned_trainer=request.user
).select_related(
    'learner', 'qualification'
).prefetch_related(
    Prefetch('submission_set', queryset=Submission.objects.filter(status='submitted'))
).annotate(
    pending_count=Count('submission', filter=Q(submission__status='submitted'))
)
```

### Progress Calculation — Annotated query

```python
Enrolment.objects.filter(id=enrolment_id).annotate(
    met_criteria=Count(
        'criteriastatus',
        filter=Q(criteriastatus__status='met')
    ),
    total_criteria=Count(
        'qualification__units__criteria'
    )
)
```
