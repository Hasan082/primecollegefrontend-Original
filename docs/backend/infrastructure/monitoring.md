# Monitoring & Observability

---

## Monitoring Stack

| Tool | Purpose |
|------|---------|
| Sentry | Error tracking + performance monitoring |
| CloudWatch | Infrastructure metrics, alarms |
| CloudWatch Logs | Application logs (structured JSON) |
| Custom dashboard | Business metrics (enrolments, assessments/day) |

---

## Key Metrics & Alerts

| Alert | Threshold | Window |
|-------|-----------|--------|
| API error rate (5xx) | > 1% | 5 min |
| API latency (P99) | > 2s | 5 min |
| DB connections | > 80% | 1 min |
| Disk space | > 85% | 15 min |
| Failed logins | > 10/min | 5 min |
| Celery queue depth | > 100 | 5 min |
