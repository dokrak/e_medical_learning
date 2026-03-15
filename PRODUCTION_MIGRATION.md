# Production Deployment Guide — Chomthong Hospital Medical Learning Platform (med-km)

**Last Updated:** March 15, 2026  
**Stack:** React + Vite (Frontend) / Laravel 12 + Sanctum (Backend API)

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Server Setup (Ubuntu/Debian)](#2-server-setup)
3. [Clone & Install](#3-clone--install)
4. [Configure Laravel Backend](#4-configure-laravel-backend)
5. [Build Frontend](#5-build-frontend)
6. [Configure Nginx](#6-configure-nginx)
7. [SSL / HTTPS](#7-ssl--https)
8. [File Permissions](#8-file-permissions)
9. [Default Login Credentials](#9-default-login-credentials)
10. [Smoke Test Checklist](#10-smoke-test-checklist)
11. [Maintenance & Backup](#11-maintenance--backup)
12. [Troubleshooting](#12-troubleshooting)

---

## 1. Prerequisites

### Server Requirements

| Requirement | Minimum |
|-------------|---------|
| OS | Ubuntu 22.04 LTS / Debian 12 |
| RAM | 2 GB |
| CPU | 2 cores |
| Disk | 20 GB |
| PHP | 8.2+ |
| Node.js | 18+ (for building frontend only) |
| MySQL / PostgreSQL | 8.0+ / 15+ |
| Nginx | Latest |
| Composer | 2.x |
| Git | Latest |
| Domain (optional) | Recommended for HTTPS |

### What This Project Uses

- **Backend:** Laravel 12 with Sanctum 4.x (token-based API auth)
- **Frontend:** React + Vite (SPA, talks to API via Axios)
- **Database:** MySQL or PostgreSQL (SQLite for dev only)
- **File Uploads:** Laravel Storage (`storage/app/public/uploads/`)

---

## 2. Server Setup

### 2.1 Update System

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git vim ufw unzip
```

### 2.2 Configure Firewall

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 2.3 Install PHP 8.2

```bash
sudo apt install -y software-properties-common
sudo add-apt-repository ppa:ondrej/php -y
sudo apt update
sudo apt install -y php8.2 php8.2-fpm php8.2-cli php8.2-common \
    php8.2-mysql php8.2-pgsql php8.2-xml php8.2-curl php8.2-gd \
    php8.2-mbstring php8.2-zip php8.2-bcmath php8.2-intl php8.2-sqlite3

php -v  # Verify PHP 8.2+
```

### 2.4 Install Composer

```bash
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer
composer --version
```

### 2.5 Install MySQL

```bash
sudo apt install -y mysql-server
sudo mysql_secure_installation
```

Create database and user:

```bash
sudo mysql
```

```sql
CREATE DATABASE medkm CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'medkm_user'@'localhost' IDENTIFIED BY 'YOUR_SECURE_PASSWORD';
GRANT ALL PRIVILEGES ON medkm.* TO 'medkm_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 2.6 Install Nginx

```bash
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

### 2.7 Install Node.js (for building frontend)

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
node -v && npm -v
```

---

## 3. Clone & Install

### 3.1 Clone Repository

```bash
cd /var/www
sudo mkdir -p medkm
sudo chown $USER:$USER medkm
git clone https://github.com/dokrak/e_medical_learning.git medkm
cd medkm
```

### 3.2 Install Laravel Dependencies

```bash
cd /var/www/medkm/backend/laravel-real
composer install --optimize-autoloader --no-dev
```

### 3.3 Install Frontend Dependencies

```bash
cd /var/www/medkm/frontend
npm ci
```

---

## 4. Configure Laravel Backend

### 4.1 Environment File

```bash
cd /var/www/medkm/backend/laravel-real
cp .env.example .env
nano .env
```

**Edit these values:**

```env
APP_NAME="Chomthong Medical Learning"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://yourdomain.com

BCRYPT_ROUNDS=12

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=medkm
DB_USERNAME=medkm_user
DB_PASSWORD=YOUR_SECURE_PASSWORD

SESSION_DRIVER=database
CACHE_STORE=database
QUEUE_CONNECTION=database
```

### 4.2 Generate App Key

```bash
php artisan key:generate
```

### 4.3 Run Migrations & Seed

```bash
php artisan migrate --force
php artisan db:seed --force
```

This creates:
- 6 default users (admin, clinician, student, etc.) — all with password: `password`
- 20 medical specialties

### 4.4 Storage Link & Upload Folder

```bash
php artisan storage:link
mkdir -p storage/app/public/uploads
```

### 4.5 Cache Configuration

```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

---

## 5. Build Frontend

### 5.1 Configure API URL

```bash
cd /var/www/medkm/frontend
nano .env
```

Set the production API URL:

```env
VITE_API_BASE_URL=https://yourdomain.com/api
```

### 5.2 Build

```bash
npm run build
```

This creates `frontend/dist/` — the static files that Nginx will serve.

---

## 6. Configure Nginx

### 6.1 Create Site Config

```bash
sudo nano /etc/nginx/sites-available/medkm
```

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Max upload size (match Laravel's 5MB image limit)
    client_max_body_size 10M;

    # ─── Frontend (React SPA) ───
    root /var/www/medkm/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "public, max-age=3600";
    }

    # ─── Backend API (Laravel) ───
    location /api {
        alias /var/www/medkm/backend/laravel-real/public;
        try_files $uri $uri/ @laravel;

        location ~ \.php$ {
            include fastcgi_params;
            fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
            fastcgi_param SCRIPT_FILENAME /var/www/medkm/backend/laravel-real/public/index.php;
            fastcgi_param PATH_INFO $fastcgi_path_info;
        }
    }

    location @laravel {
        rewrite /api/(.*)$ /api/index.php?/$1 last;
    }

    # ─── Uploaded Files (storage) ───
    location /storage {
        alias /var/www/medkm/backend/laravel-real/storage/app/public;
        add_header Cache-Control "public, max-age=86400";
    }

    # ─── Block sensitive files ───
    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

### 6.2 Enable Site

```bash
sudo ln -s /etc/nginx/sites-available/medkm /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

---

## 7. SSL / HTTPS

### Using Let's Encrypt (Free)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

Follow prompts — choose to redirect HTTP to HTTPS.

Auto-renewal is set up automatically. Verify:

```bash
sudo certbot renew --dry-run
```

---

## 8. File Permissions

```bash
cd /var/www/medkm/backend/laravel-real

sudo chown -R www-data:www-data storage bootstrap/cache
sudo chmod -R 775 storage bootstrap/cache

# Ensure uploads folder is writable
sudo chown -R www-data:www-data storage/app/public/uploads
```

---

## 9. Default Login Credentials

After seeding, these accounts are available:

| Email | Password | Role |
|-------|----------|------|
| admin@example.com | password | Admin |
| clinician@example.com | password | Clinician |
| student@example.com | password | Student |
| clinician1@example.com | password | Clinician |
| clinician2@example.com | password | Clinician |
| moderator@example.com | password | Moderator |

> **⚠️ IMPORTANT:** Change all default passwords immediately after first login in production!

---

## 10. Smoke Test Checklist

After deployment, verify all features:

- [ ] **Login** — all 4 roles (admin, clinician, student, moderator)
- [ ] **Create Question** — with image upload, 5 choices, specialty
- [ ] **Moderator Queue** — approve / reject with feedback
- [ ] **Edit Question** — edit choices, change image, resubmit rejected
- [ ] **Create Exam** — random mode + manual selection mode
- [ ] **Take Exam** — submit answers, view score
- [ ] **PDF Report** — download exam result PDF
- [ ] **Student Stats** — view analytics dashboard
- [ ] **Admin Panel** — create/edit/delete users
- [ ] **Image Upload** — verify images display after upload
- [ ] **Search** — search on Take Exam and Manage pages
- [ ] **Logout** — token cleared, redirected to login

---

## 11. Maintenance & Backup

### Database Backup (Cron)

```bash
sudo crontab -e
```

Add daily backup at 2 AM:

```bash
0 2 * * * mysqldump -u medkm_user -p'YOUR_SECURE_PASSWORD' medkm > /var/backups/medkm_$(date +\%Y\%m\%d).sql
```

### Uploaded Files Backup

```bash
# Add to cron or run manually
rsync -av /var/www/medkm/backend/laravel-real/storage/app/public/uploads/ /var/backups/medkm-uploads/
```

### Updating the Application

```bash
cd /var/www/medkm

# Pull latest code
git pull origin master

# Backend updates
cd backend/laravel-real
composer install --optimize-autoloader --no-dev
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Frontend updates
cd ../../frontend
npm ci
npm run build

# Restart PHP-FPM
sudo systemctl restart php8.2-fpm
```

### Queue Worker (Optional)

If using background jobs:

```bash
sudo nano /etc/systemd/system/medkm-queue.service
```

```ini
[Unit]
Description=med-km Queue Worker
After=network.target mysql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/medkm/backend/laravel-real
ExecStart=/usr/bin/php artisan queue:work --sleep=3 --tries=3 --max-time=3600
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable medkm-queue
sudo systemctl start medkm-queue
```

### Laravel Scheduler (Optional)

```bash
sudo crontab -e -u www-data
```

Add:

```bash
* * * * * cd /var/www/medkm/backend/laravel-real && php artisan schedule:run >> /dev/null 2>&1
```

---

## 12. Troubleshooting

### Common Issues

| Problem | Solution |
|---------|----------|
| 500 Internal Server Error | Check `storage/logs/laravel.log`, ensure permissions |
| 401 Unauthorized on API | Token expired — log out and log in again |
| Image upload fails | Check `client_max_body_size` in Nginx, check storage permissions |
| CORS errors | Update `config/cors.php` with your production domain |
| CSS/JS not loading | Run `npm run build` again, clear browser cache |
| Database connection error | Verify `.env` DB credentials, check MySQL is running |
| `php artisan` errors | Run `composer install`, check PHP extensions |

### Useful Commands

```bash
# View Laravel logs
tail -f /var/www/medkm/backend/laravel-real/storage/logs/laravel.log

# Clear all Laravel caches
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Check PHP-FPM status
sudo systemctl status php8.2-fpm

# Check disk usage
df -h

# Check upload folder size
du -sh /var/www/medkm/backend/laravel-real/storage/app/public/uploads/
```

### Security Checklist

- [ ] `APP_DEBUG=false` in production `.env`
- [ ] `APP_ENV=production` in `.env`
- [ ] HTTPS enabled with valid SSL certificate
- [ ] Default passwords changed for all seeded accounts
- [ ] CORS configured to allow only your production domain
- [ ] Firewall allows only ports 22, 80, 443
- [ ] Database user has limited privileges (no GRANT, no DROP)
- [ ] `.env` file is NOT accessible via web (Nginx blocks dotfiles)
- [ ] Regular backups configured and tested

---

## Quick Reference — File Locations

| Item | Path on Server |
|------|---------------|
| Project root | `/var/www/medkm/` |
| Laravel backend | `/var/www/medkm/backend/laravel-real/` |
| Laravel .env | `/var/www/medkm/backend/laravel-real/.env` |
| Laravel logs | `/var/www/medkm/backend/laravel-real/storage/logs/` |
| Uploaded images | `/var/www/medkm/backend/laravel-real/storage/app/public/uploads/` |
| Frontend build | `/var/www/medkm/frontend/dist/` |
| Frontend .env | `/var/www/medkm/frontend/.env` |
| Nginx config | `/etc/nginx/sites-available/medkm` |
| PHP-FPM config | `/etc/php/8.2/fpm/pool.d/www.conf` |
| SSL certs | `/etc/letsencrypt/live/yourdomain.com/` |
| DB backups | `/var/backups/medkm_*.sql` |
