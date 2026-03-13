# File Storage & Evidence Management

---

## Architecture

```
┌──────────────┐     ┌─────────────────┐     ┌──────────────┐
│   Frontend   │────▸│  DRF Backend    │────▸│   AWS S3     │
│  (Upload UI) │     │  (Pre-signed    │     │  (Storage)   │
│              │◀────│   URL Generator)│     │              │
│  Direct S3   │─────────────────────────────▸│  Bucket      │
│  Upload      │     │                 │     │              │
└──────────────┘     └─────────────────┘     └──────┬───────┘
                                                     │
                                              ┌──────▼───────┐
                                              │  CloudFront  │
                                              │  (CDN +      │
                                              │   Signed URLs│
                                              │   for access)│
                                              └──────────────┘
```

---

## Upload Flow

1. Frontend requests pre-signed upload URL from DRF
2. DRF validates user permissions and generates S3 pre-signed PUT URL (5 min expiry)
3. Frontend uploads directly to S3 (avoids passing through server)
4. Frontend confirms upload to DRF with file metadata
5. DRF creates `SubmissionFile` record with S3 key and SHA-256 checksum
6. Audit log entry created

---

## Download Flow

1. Frontend requests file access from DRF
2. DRF validates permission (learner owns it, or assigned trainer/IQA/admin)
3. DRF generates CloudFront signed URL (15 min expiry)
4. Frontend redirects to signed URL

---

## S3 Bucket Structure

```
prime-college-evidence/
├── submissions/{year}/{month}/{submission_id}/{filename}
├── resources/{qualification_id}/{unit_code}/{filename}
├── feedback/{year}/{month}/{assessment_id}/{filename}
├── profiles/{user_id}/{filename}
└── exports/{year}/{month}/{export_id}.pdf
```

---

## File Policies

| Policy | Value |
|--------|-------|
| Max file size | 50MB per file |
| Max files per submission | 10 |
| Allowed types | PDF, DOCX, DOC, XLSX, XLS, PPTX, JPG, PNG, MP4, ZIP |
| Retention | Minimum 7 years (regulatory) |
| Encryption | AES-256 at rest, TLS in transit |
| Versioning | S3 versioning enabled for evidence buckets |
| Deletion | Soft-delete only; S3 objects retained with lifecycle policy |
