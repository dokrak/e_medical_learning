# med-km — Medical knowledge-management (MVP)

This workspace contains:

- `backend/mock-api` — lightweight, runnable Node.js mock API for immediate frontend/dev testing
- `backend/laravel-placeholder` — scaffolding and migration stubs for a future Laravel implementation
- `frontend` — React + Vite demo UI that talks to the mock API

Quick start (dev/demo):

```powershell
# start mock API
cd backend\mock-api
npm ci
npm run dev

# in a second terminal, start frontend
cd frontend
npm ci
npm run dev
```

Login test accounts:
- admin@example.com / password
- clinician@example.com / password
- student@example.com / password

Notes:
- The mock API is for prototyping only. A full Laravel backend scaffold has been added at `backend/laravel-real` (migrations, models, controllers, Dockerfile, seeders, PHI scan command).
- To test the Laravel backend locally run it via Docker (see `backend/laravel-real/README.md`); then point the frontend to `http://localhost:8000/api` by updating `frontend/.env` or setting `VITE_API_BASE_URL`.
- CI/stubs and Laravel placeholders are included in the repo.

Next recommended step: run the mock API + frontend and try uploading a question as `clinician@example.com`.
