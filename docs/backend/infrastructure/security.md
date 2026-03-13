# Security Architecture

---

## Security Controls

| Control | Implementation |
|---------|---------------|
| Authentication | JWT with 30-min access tokens, 7-day refresh rotation |
| Authorisation | Role-based via `UserRole` table — never client-side |
| Password | Django PBKDF2 with SHA256, min 8 chars, complexity rules |
| File access | Pre-signed S3 URLs with 15-min expiry |
| API rate limiting | 20/min anonymous, 100/min authenticated |
| CORS | Whitelist frontend domain only |
| CSRF | Token-based for session endpoints |
| XSS | Django auto-escaping + Content-Security-Policy header |
| SQL Injection | Django ORM parameterised queries |
| Data encryption | TLS 1.3 in transit, AES-256 at rest (S3 + RDS) |
| Audit immutability | `save()` and `delete()` overrides on AuditLog |
| Secret management | AWS Secrets Manager for API keys |

---

## CORS Configuration

```python
CORS_ALLOWED_ORIGINS = [
    'https://primecollegefrontend.lovable.app',
    'https://www.primecollege.co.uk',
]
CORS_ALLOW_CREDENTIALS = True
```
