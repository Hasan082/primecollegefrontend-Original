# Deployment & Infrastructure

---

## AWS Architecture

```
┌──────────────────────────────────────────────────────────┐
│                     AWS Cloud                            │
│                                                          │
│  ┌─────────────┐   ┌──────────────┐   ┌──────────────┐  │
│  │ Route 53    │──▸│ CloudFront   │──▸│ S3 (Static)  │  │
│  │ (DNS)       │   │ (CDN)        │   │ React Build  │  │
│  └─────────────┘   └──────┬───────┘   └──────────────┘  │
│                           │                              │
│                    ┌──────▼───────┐                      │
│                    │ ALB (HTTPS)  │                      │
│                    └──────┬───────┘                      │
│                           │                              │
│                    ┌──────▼───────┐   ┌──────────────┐   │
│                    │ ECS Fargate  │──▸│ RDS Postgres │   │
│                    │ (DRF App)    │   │ (Primary +   │   │
│                    │ Auto-scaling │   │  Replica)    │   │
│                    └──────┬───────┘   └──────────────┘   │
│                           │                              │
│              ┌────────────┼────────────┐                 │
│              ▼            ▼            ▼                 │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐     │
│  │ ElastiCache  │ │ S3 Evidence  │ │ SES (Email)  │     │
│  │ (Redis)      │ │ Bucket       │ │              │     │
│  └──────────────┘ └──────────────┘ └──────────────┘     │
│                                                          │
│  ┌──────────────┐ ┌──────────────┐                      │
│  │ CloudWatch   │ │ Secrets      │                      │
│  │ (Monitoring) │ │ Manager      │                      │
│  └──────────────┘ └──────────────┘                      │
└──────────────────────────────────────────────────────────┘
```

---

## Environment Configuration

| Setting | Development | Staging | Production |
|---------|------------|---------|------------|
| DEBUG | True | False | False |
| Database | Local PostgreSQL | RDS (t3.small) | RDS (r6g.large) + read replica |
| Storage | Local MinIO (S3-compatible) | S3 staging bucket | S3 production bucket |
| Email | Console backend | SES sandbox | SES production |
| Domain | localhost:8000 | staging.primecollege.co.uk | app.primecollege.co.uk |

---

## CI/CD Pipeline

```yaml
name: Deploy
on:
  push:
    branches: [main, staging]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run tests
        run: |
          pip install -r requirements.txt
          python manage.py test --parallel

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Build Docker image
        run: docker build -t prime-college-api .
      - name: Push to ECR
        run: |
          aws ecr get-login-password | docker login --username AWS --password-stdin $ECR_URI
          docker tag prime-college-api:latest $ECR_URI:${{ github.sha }}
          docker push $ECR_URI:${{ github.sha }}
      - name: Deploy to ECS
        run: |
          aws ecs update-service --cluster prime-college --service api --force-new-deployment
```
