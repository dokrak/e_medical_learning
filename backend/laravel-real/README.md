# med-km — Laravel backend (placeholder implementation)

This folder contains a full Laravel backend scaffold for the Medical Knowledge Management MVP.

Quick start (Docker recommended):

```powershell
# from workspace root
cd backend/laravel-real
# build and run app + db
docker-compose up -d --build
# create sqlite file and run migrations (inside container)
docker compose exec app php artisan key:generate
docker compose exec app php artisan migrate --seed
# run queue / scheduler if needed
```

Without Docker (requires PHP 8.1+, Composer, SQLite/MySQL):

```powershell
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve --host=0.0.0.0 --port=8000
```

Default seed users (for dev):
- admin@example.com / password (admin)
- clinician@example.com / password (clinician)
- student@example.com / password (student)

Notes:
- PHI detection is a simulated Artisan command `scan:phi {questionId}` (placeholder for Tesseract/Textract integration).
- Replace placeholders and integrate production OCR / storage (S3) before use with real patient data.
