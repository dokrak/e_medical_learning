# med-km — Mock API

This is a small mock HTTP API used for local frontend development/demo.

Quick start:

```powershell
cd backend/mock-api
npm ci
npm run dev
```

Default users:
- admin@example.com / password (role: admin)
- clinician@example.com / password (role: clinician)
- student@example.com / password (role: student)

Notes:
- This mock stores data in `backend/mock-api/data/*.json` (file-based, for dev only).
- Images can be sent as base64 strings inside `images` array when creating questions.
- This mock is intentionally simple — production backend should be Laravel with proper auth, PHI redaction and DB.
