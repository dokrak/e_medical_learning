# Production Migration Guide (med-km)

This guide prepares current components for production deployment.

## 1) Frontend preparation

1. Create environment file from template:
   - Copy `frontend/.env.example` to `frontend/.env`
2. Set production API URL:
   - `VITE_API_BASE_URL=https://<your-domain>/api`
3. Install and build:
   - `cd frontend`
   - `npm ci`
   - `npm run build`
4. Deploy static output from:
   - `frontend/dist`

## 2) Laravel backend preparation

1. Configure runtime env:
   - `cd backend/laravel-real`
   - Copy `.env.example` to `.env`
   - Set database, app URL, CORS, mail, and storage config
2. Install dependencies:
   - `composer install --no-dev --optimize-autoloader`
3. Generate app key and migrate:
   - `php artisan key:generate`
   - `php artisan migrate --force`
4. Cache optimization:
   - `php artisan config:cache`
   - `php artisan route:cache`
   - `php artisan view:cache`
5. Storage link:
   - `php artisan storage:link`

## 3) Data/schema checklist

- Ensure all migrations are applied, including:
  - `2026_02_18_000011_add_answer_explanation_to_questions_table.php`
- Validate seed data only in non-production environments.

## 4) Security checklist

- Disable debug mode in production (`APP_DEBUG=false`).
- Use HTTPS for frontend and API.
- Set secure CORS origin list.
- Rotate default credentials and remove dev accounts.

## 5) Smoke test checklist

1. Login (all expected roles)
2. Create/Edit question
3. Moderator approve/reject flow
4. Build exam (random/manual)
5. Take exam + submit + PDF download
6. Search on Take Exam and Manage pages

## 6) Rollback basics

- Frontend: redeploy previous artifact from CI/CD.
- Backend: deploy previous release and restore DB backup if needed.
