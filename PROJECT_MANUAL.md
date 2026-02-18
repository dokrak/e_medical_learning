# 🏥 Chomthong Hospital Medical Learning Platform (med-km)
## Comprehensive Project Manual & User Guide

**Version:** 1.0  
**Last Updated:** February 18, 2026  
**Project Code:** med-km

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [Installation & Setup](#installation--setup)
4. [Production Deployment](#production-deployment)
5. [User Roles & Responsibilities](#user-roles--responsibilities)
6. [User Guides by Role](#user-guides-by-role)
7. [API Documentation](#api-documentation)
8. [Troubleshooting](#troubleshooting)
9. [Security Guidelines](#security-guidelines)
10. [Maintenance & Support](#maintenance--support)

---

## Project Overview

### 🎯 Purpose

The **Chomthong Hospital Medical Learning Platform (med-km)** is a modern, comprehensive digital learning system designed to facilitate continuous medical education and professional development for healthcare professionals and medical students. The platform bridges traditional medical knowledge with cutting-edge digital innovation to create an engaging, interactive learning environment.

### 📋 Key Objectives

- **Medical Excellence**: Provide comprehensive, high-quality medical exams curated by healthcare professionals
- **Smart Learning**: Deliver AI-powered analytics to track progress and identify learning gaps
- **Collaborative Community**: Foster knowledge sharing among clinicians, moderators, and students
- **Real-time Feedback**: Provide immediate exam evaluation with detailed explanations
- **Data-Driven Insights**: Visualize learning trends and performance metrics
- **Secure & Trustworthy**: Protect medical data with enterprise-grade security

### ✨ Core Features

| Feature | Description |
|---------|-------------|
| **Exam Management** | Create, take, and analyze medical exams |
| **Question Bank** | Comprehensive repository of medical questions with images |
| **Student Analytics** | Track progress, trends, and performance metrics |
| **Clinician Dashboard** | Create questions and monitor student performance |
| **Moderator Queue** | Review and approve questions for quality assurance |
| **Admin Panel** | User management and system administration |
| **PDF Reports** | Generate printable exam reports and certificates |
| **Role-Based Access** | Granular permission system for different user types |
| **Active Navigation** | Visual highlighting of current page in navigation menu |

---

## System Architecture

### 🏗️ Technology Stack

**Frontend:**
- Framework: React 18 with Vite
- Routing: React Router DOM
- HTTP Client: Axios
- Styling: Custom CSS with Green Theme (#15803d)
- Responsive Design: Mobile, Tablet, Desktop compatible

**Backend:**
- Runtime: Node.js
- Framework: Express.js
- Database: JSON file storage (development)
- PDF Generation: PDFKit
- Authentication: Bearer Token (JWT-compatible)
- Port: 3001 (default)

**Infrastructure:**
- Frontend Port: 5173 (development)
- Backend Port: 3001 (development)
- Docker Support: Dockerfile and docker-compose.yml available
- Version Control: Git

### 📁 Project Structure

```
med-km/
├── frontend/                          # React frontend application
│   ├── src/
│   │   ├── App.jsx                   # Main app router and navigation
│   │   ├── api.js                    # Axios API client
│   │   ├── main.jsx                  # React entry point
│   │   ├── pages/                    # Page components
│   │   │   ├── HomePage.jsx          # Welcome dashboard
│   │   │   ├── Login.jsx             # Authentication
│   │   │   ├── ExamsList.jsx         # Browse exams
│   │   │   ├── ExamTake.jsx          # Take exam
│   │   │   ├── ExamBuilder.jsx       # Create exam (staff only)
│   │   │   ├── UploadQuestion.jsx    # Upload question (clinician)
│   │   │   ├── ManageQuestionsExams.jsx  # Manage content
│   │   │   ├── ModeratorQueue.jsx    # Review queue (moderator)
│   │   │   ├── StudentStats.jsx      # Student analytics
│   │   │   ├── ClinicianDashboard.jsx# Clinician analytics
│   │   │   └── AdminUserManagement.jsx # User management
│   │   └── styles.css                # Global styling
│   ├── public/                       # Static assets
│   │   └── logo.png                  # Chomthong Hospital logo
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── mock-api/                     # Express backend
│   │   ├── index.js                  # Main server file
│   │   ├── package.json
│   │   └── data/                     # JSON data files
│   │       ├── users.json
│   │       ├── questions.json
│   │       ├── exams.json
│   │       ├── student_exams.json
│   │       ├── specialties.json
│   │       ├── audit_logs.json
│   │       └── question_images/
│   │
│   └── laravel-real/                 # (Optional) Production backend
│       ├── app/Models/               # Database models
│       ├── app/Http/Controllers/     # API controllers
│       ├── database/migrations/      # Database schema
│       ├── routes/api.php            # API routes
│       └── composer.json
│
├── README.md                         # Project overview
└── PROJECT_MANUAL.md                 # This file

```

### 🔐 Authentication Flow

```
1. User enters Thai ID / Email + Password
2. Backend validates credentials
3. On success: Generate Bearer Token (JWT)
4. Token stored in localStorage (frontend)
5. All API requests include Authorization: Bearer {token}
6. Token expires after session ends or manual logout
```

---

## Installation & Setup

### ✅ Prerequisites

- **Node.js**: v14.0 or higher ([Download](https://nodejs.org/))
- **npm**: v6.0 or higher (included with Node.js)
- **Git**: For version control ([Download](https://git-scm.com/))
- **Terminal/CMD**: PowerShell, CMD, or Bash
- **Disk Space**: 500MB minimum (excluding node_modules)

### 📥 Installation Steps

#### Step 1: Clone Repository
```bash
git clone <repository-url>
cd vscode_project
```

#### Step 2: Install Backend Dependencies
```bash
cd backend/mock-api
npm install
```

#### Step 3: Install Frontend Dependencies
```bash
cd ../../frontend
npm install
```

#### Step 4: Verify Installation
Backend check:
```bash
cd ../backend/mock-api
node --check index.js
```

Frontend build:
```bash
cd ../../frontend
npm run build
```

### 🚀 Running Development Environment

#### Option 1: Run Both Frontend & Backend

**Terminal 1 - Backend:**
```bash
cd backend/mock-api
npm run start
```
Backend runs on: `http://localhost:3001`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend runs on: `http://localhost:5173`

#### Option 2: Run Frontend Only (Backend Already Deployed)
```bash
cd frontend
npm run dev
```
Update `frontend/src/api.js` to point to production backend URL.

### 🔧 Configuration

#### Backend Configuration (`backend/mock-api/index.js`)
```javascript
// CORS Settings
app.use(cors({
  origin: '*',
  credentials: true
}));

// Server Port
const PORT = process.env.PORT || 3001;

// Authentication
const authMiddleware = (req, res, next) => { ... };
```

#### Frontend API Configuration (`frontend/src/api.js`)
```javascript
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  timeout: 10000
})

// Add token to requests
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
```

---

## Production Deployment

### 🐳 Docker Deployment (Recommended)

#### Prerequisites
- Docker installed ([Download](https://www.docker.com/products/docker-desktop))
- Docker Compose installed (included with Docker Desktop)

#### Step 1: Build Docker Images
```bash
cd backend/laravel-real
docker-compose build
```

#### Step 2: Start Services
```bash
docker-compose up -d
```

#### Step 3: Run Migrations (First Time)
```bash
docker-compose exec app php artisan migrate
docker-compose exec app php artisan seed
```

#### Step 4: Access Application
- Frontend: `http://localhost`
- Backend API: `http://localhost/api`

### 📦 Traditional Server Deployment

#### Frontend Deployment (Nginx/Apache)

**Step 1: Build for Production**
```bash
cd frontend
npm run build
```
This creates optimized files in `dist/` folder.

**Step 2: Deploy to Web Server**

**Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        root /var/www/med-km/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend-server:3001;
        proxy_set_header Authorization $http_authorization;
    }
}
```

**Apache Configuration:**
```apache
<VirtualHost *:80>
    ServerName your-domain.com
    DocumentRoot /var/www/med-km/frontend/dist
    
    <Directory /var/www/med-km/frontend/dist>
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>

    ProxyPreserveHost On
    ProxyPass /api http://backend-server:3001/api
    ProxyPassReverse /api http://backend-server:3001/api
</VirtualHost>
```

#### Backend Deployment (Node.js)

**Option A: Using PM2 (Recommended)**
```bash
npm install -g pm2

cd backend/mock-api
npm install --production
pm2 start index.js --name "med-km-api"
pm2 save
pm2 startup
```

**Option B: Using systemd (Linux)**
Create `/etc/systemd/system/med-km-api.service`:
```ini
[Unit]
Description=Chomthong Medical Learning Platform API
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/med-km/backend/mock-api
ExecStart=/usr/bin/node index.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Then:
```bash
sudo systemctl daemon-reload
sudo systemctl enable med-km-api
sudo systemctl start med-km-api
```

#### Environment Variables (.env)
```bash
# Frontend (.env)
VITE_API_URL=https://your-domain.com/api
VITE_APP_NAME=med-km

# Backend (.env)
NODE_ENV=production
PORT=3001
CORS_ORIGIN=https://your-domain.com
JWT_SECRET=your-secure-secret-key-here
```

### 🔒 SSL/HTTPS Setup

**Using Let's Encrypt (Free):**
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot certonly --nginx -d your-domain.com
```

**Nginx SSL Configuration:**
```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    # ... rest of configuration
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

### 📊 Database Setup (Production)

For production, migrate from JSON to a proper database:

**PostgreSQL Migration:**
```bash
cd backend/laravel-real
php artisan config:cache
php artisan migrate --force
php artisan db:seed
```

**MySQL Migration:**
```bash
# Update .env with MySQL credentials
DB_CONNECTION=mysql
DB_HOST=mysql-server
DB_DATABASE=med_km
DB_USERNAME=med_km_user
DB_PASSWORD=secure-password

# Run migrations
php artisan migrate --force
```

---

## 🏗️ Backend Architecture Options & Linux Production Deployment

### Understanding the Dual Backend Architecture

This project provides **TWO backend implementations** that serve identical REST API endpoints:

#### 1. **Mock API (Node.js + Express)** 
- **Purpose:** Development, prototyping, and testing
- **Technology:** Node.js, Express.js
- **Storage:** JSON files (no database required)
- **Port:** 3001 (default)
- **Use Case:** Rapid development, frontend testing, demos

#### 2. **Laravel Backend (PHP)**
- **Purpose:** Production deployment
- **Technology:** PHP 8.1+, Laravel 10, MySQL/PostgreSQL
- **Storage:** Relational database with ORM
- **Port:** 8000 (default)
- **Use Case:** Enterprise production environment

### Backend Comparison Table

| Feature | Mock API (Node.js) | Laravel (PHP) |
|---------|-------------------|---------------|
| **Setup Time** | ⚡ 2-5 minutes | 🕐 15-30 minutes |
| **Database Required** | ❌ No (JSON files) | ✅ Yes (MySQL/PostgreSQL) |
| **Production Ready** | ❌ Not recommended | ✅ Recommended |
| **Development Speed** | ✅ Very fast | ⚠️ Moderate |
| **Scalability** | ❌ Limited (single instance) | ✅ High (horizontal scaling) |
| **Performance** | ⚠️ Good for < 100 users | ✅ Excellent for 1000+ users |
| **Features** | 📦 Basic CRUD | 🎁 Full framework (queues, cache, jobs) |
| **Data Persistence** | ⚠️ File-based | ✅ ACID-compliant database |
| **Concurrent Users** | ⚠️ < 50 | ✅ 500+ |
| **Security** | ⚠️ Basic token auth | ✅ Laravel Sanctum, CSRF protection |
| **Backup & Recovery** | ⚠️ Manual file copy | ✅ Database dump & replication |
| **API Endpoints** | ✅ Same as Laravel | ✅ Same as Mock API |
| **Monitoring** | ⚠️ Basic logging | ✅ Laravel Telescope, logs |
| **Maintenance** | ✅ Minimal | ⚠️ Regular updates needed |

### When to Use Each Backend

**Use Mock API (Node.js) when:**
- 🚀 Rapid prototyping and development
- 🧪 Frontend testing without database setup
- 📊 Demo presentations and proof-of-concept
- 👨‍💻 Local development environment
- 📝 Small team collaboration (< 10 users)

**Use Laravel (PHP) when:**
- 🏥 Production deployment for hospital/clinic
- 👥 Multi-user environment (50+ users)
- 🔒 Security and compliance requirements (HIPAA, PHI protection)
- 📈 Scalability and performance critical
- 💾 Data integrity and backup essential
- 🔄 Integration with existing PHP infrastructure

---

## 🐧 Complete Linux Production Deployment Guide

This guide covers deploying the Medical Learning Platform on an Ubuntu/Debian Linux server.

### Prerequisites

- Ubuntu 20.04+ or Debian 11+ server
- Root or sudo access
- Domain name configured (optional but recommended)
- Minimum 2GB RAM, 2 CPU cores, 20GB disk space

---

### PART 1: Initial Server Setup

#### Step 1: Update System
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git vim ufw
```

#### Step 2: Create Application User
```bash
sudo adduser medkm
sudo usermod -aG sudo medkm
sudo su - medkm
```

#### Step 3: Configure Firewall
```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
sudo ufw status
```

#### Step 4: Install Node.js (Required for both backends)
```bash
# Install Node.js 18.x LTS
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should show v18.x.x
npm --version   # Should show 9.x.x
```

#### Step 5: Install Nginx Web Server
```bash
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
sudo systemctl status nginx
```

#### Step 6: Clone Repository
```bash
cd /var/www
sudo mkdir -p medkm
sudo chown medkm:medkm medkm
cd medkm
git clone https://github.com/your-org/med-km.git .
```

---

### PART 2A: Deploy with Mock API (Node.js Backend)

**Use this option for development/testing or small deployments**

#### Step 1: Install Backend Dependencies
```bash
cd /var/www/medkm/backend/mock-api
npm install --production
```

#### Step 2: Create Backend Environment File
```bash
nano .env
```
Add:
```bash
NODE_ENV=production
PORT=3001
CORS_ORIGIN=https://your-domain.com
```

#### Step 3: Test Backend
```bash
node index.js
# Should see: Server listening on port 3001
# Press Ctrl+C to stop
```

#### Step 4: Install PM2 Process Manager
```bash
sudo npm install -g pm2
```

#### Step 5: Start Backend with PM2
```bash
cd /var/www/medkm/backend/mock-api
pm2 start index.js --name medkm-api
pm2 save
pm2 startup
# Copy and run the command PM2 outputs
```

#### Step 6: Verify Backend Status
```bash
pm2 status
pm2 logs medkm-api
```

#### Step 7: Build Frontend
```bash
cd /var/www/medkm/frontend

# Create production environment file
nano .env
```
Add:
```bash
VITE_API_BASE_URL=https://your-domain.com/api
```

Build:
```bash
npm install
npm run build
# Creates dist/ folder with optimized files
```

#### Step 8: Configure Nginx for Node.js Backend
```bash
sudo nano /etc/nginx/sites-available/medkm
```
Add:
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    # Frontend (React build)
    location / {
        root /var/www/medkm/frontend/dist;
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "public, max-age=3600";
    }
    
    # Backend API (Node.js)
    location /api {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
    
    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/medkm /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### Step 9: Install SSL Certificate (Let's Encrypt)
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
# Follow prompts, choose redirect HTTP to HTTPS
```

#### Step 10: Verify Deployment
```bash
# Check backend
curl http://localhost:3001/api/health

# Check full stack
curl https://your-domain.com
curl https://your-domain.com/api/health
```

---

### PART 2B: Deploy with Laravel Backend (Recommended for Production)

**Use this option for production deployment with database**

#### Step 1: Install PHP and Dependencies
```bash
sudo apt install -y php8.1 php8.1-fpm php8.1-cli php8.1-common \
    php8.1-mysql php8.1-xml php8.1-curl php8.1-gd php8.1-mbstring \
    php8.1-zip php8.1-bcmath php8.1-intl php8.1-sqlite3

# Verify PHP version
php -v  # Should show PHP 8.1.x
```

#### Step 2: Install Composer
```bash
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer
composer --version
```

#### Step 3: Install Database (MySQL)
```bash
sudo apt install -y mysql-server
sudo mysql_secure_installation
# Follow prompts: set root password, remove anonymous users, etc.
```

Create database:
```bash
sudo mysql
```
In MySQL:
```sql
CREATE DATABASE medkm CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'medkm_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON medkm.* TO 'medkm_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

#### Step 4: Install Laravel Dependencies
```bash
cd /var/www/medkm/backend/laravel-real
composer install --optimize-autoloader --no-dev
```

#### Step 5: Configure Laravel Environment
```bash
cp .env.example .env
nano .env
```
Configure:
```bash
APP_NAME="Medical Learning Platform"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-domain.com

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=medkm
DB_USERNAME=medkm_user
DB_PASSWORD=your_secure_password

CACHE_DRIVER=file
QUEUE_CONNECTION=database
SESSION_DRIVER=file
SESSION_LIFETIME=120

# Generate this in next step
APP_KEY=
```

#### Step 6: Generate Application Key
```bash
php artisan key:generate
php artisan config:cache
```

#### Step 7: Run Database Migrations
```bash
php artisan migrate --force
php artisan db:seed --force
```

#### Step 8: Set Permissions
```bash
sudo chown -R www-data:www-data /var/www/medkm/backend/laravel-real/storage
sudo chown -R www-data:www-data /var/www/medkm/backend/laravel-real/bootstrap/cache
sudo chmod -R 775 /var/www/medkm/backend/laravel-real/storage
sudo chmod -R 775 /var/www/medkm/backend/laravel-real/bootstrap/cache
```

#### Step 9: Configure Nginx for Laravel
```bash
sudo nano /etc/nginx/sites-available/medkm
```
Add:
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/medkm/frontend/dist;
    index index.html;
    
    # Frontend
    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "public, max-age=3600";
    }
    
    # Backend API (Laravel)
    location /api {
        alias /var/www/medkm/backend/laravel-real/public;
        try_files $uri $uri/ @laravel;
        
        location ~ \.php$ {
            include snippets/fastcgi-php.conf;
            fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
            fastcgi_param SCRIPT_FILENAME /var/www/medkm/backend/laravel-real/public/index.php;
            include fastcgi_params;
        }
    }
    
    location @laravel {
        rewrite /api/(.*)$ /api/index.php?/$1 last;
    }
    
    # Deny access to sensitive files
    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

Enable and reload:
```bash
sudo ln -s /etc/nginx/sites-available/medkm /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### Step 10: Build Frontend for Laravel
```bash
cd /var/www/medkm/frontend
nano .env
```
Update API URL:
```bash
VITE_API_BASE_URL=https://your-domain.com/api
```

Build:
```bash
npm install
npm run build
```

#### Step 11: Install SSL
```bash
sudo certbot --nginx -d your-domain.com
```

#### Step 12: Setup Queue Worker (Optional but Recommended)
```bash
sudo nano /etc/systemd/system/medkm-queue.service
```
Add:
```ini
[Unit]
Description=Medical Learning Platform Queue Worker
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

Enable and start:
```bash
sudo systemctl daemon-reload
sudo systemctl enable medkm-queue
sudo systemctl start medkm-queue
sudo systemctl status medkm-queue
```

#### Step 13: Setup Scheduler (Cron Job)
```bash
sudo crontab -e -u www-data
```
Add:
```cron
* * * * * cd /var/www/medkm/backend/laravel-real && php artisan schedule:run >> /dev/null 2>&1
```

---

### PART 3: Switching Between Backends

#### From Mock API to Laravel

1. **Prepare data migration** (if needed):
```bash
# Export data from Mock API JSON files
cd /var/www/medkm/backend/mock-api/data
cp users.json users_backup.json
cp questions.json questions_backup.json
cp exams.json exams_backup.json
```

2. **Update frontend configuration**:
```bash
cd /var/www/medkm/frontend
nano .env
```
Change:
```bash
# From:
VITE_API_BASE_URL=https://your-domain.com/api

# To (if Laravel on different port):
VITE_API_BASE_URL=https://your-domain.com/api
```

3. **Rebuild frontend**:
```bash
npm run build
```

4. **Stop Mock API**:
```bash
pm2 stop medkm-api
pm2 delete medkm-api
```

5. **Update Nginx configuration** (change proxy_pass from 3001 to Laravel)

6. **Reload Nginx**:
```bash
sudo systemctl reload nginx
```

7. **Migrate data to Laravel database** (manual or script):
```bash
# Write custom migration script or manually insert data
php artisan tinker
# Use Eloquent to insert data from JSON
```

#### From Laravel to Mock API

1. **Export database data**:
```bash
cd /var/www/medkm/backend/laravel-real
php artisan db:seed --class=DataExportSeeder  # If you create this
```

2. **Update frontend .env** to point to port 3001

3. **Start Mock API**:
```bash
cd /var/www/medkm/backend/mock-api
pm2 start index.js --name medkm-api
```

4. **Update and reload Nginx**

---

### PART 4: Monitoring & Maintenance

#### System Monitoring

**Check service status**:
```bash
# Backend (Node.js)
pm2 status
pm2 logs medkm-api

# Backend (Laravel)
sudo systemctl status php8.1-fpm
sudo systemctl status medkm-queue
tail -f /var/www/medkm/backend/laravel-real/storage/logs/laravel.log

# Web server
sudo systemctl status nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Database
sudo systemctl status mysql
```

#### Performance Monitoring

**Install monitoring tools**:
```bash
# htop for system resources
sudo apt install -y htop
htop

# netstat for network connections
sudo apt install -y net-tools
netstat -tulpn | grep LISTEN
```

#### Backup Strategy

**Database backup (Laravel)**:
```bash
# Create backup script
sudo nano /usr/local/bin/backup-medkm-db.sh
```
Add:
```bash
#!/bin/bash
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/var/backups/medkm"
mkdir -p $BACKUP_DIR

mysqldump -u medkm_user -p'your_password' medkm > $BACKUP_DIR/medkm_$TIMESTAMP.sql
gzip $BACKUP_DIR/medkm_$TIMESTAMP.sql

# Keep only last 7 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete
```

Make executable:
```bash
sudo chmod +x /usr/local/bin/backup-medkm-db.sh
```

Schedule daily backup:
```bash
sudo crontab -e
```
Add:
```cron
0 2 * * * /usr/local/bin/backup-medkm-db.sh
```

**JSON files backup (Mock API)**:
```bash
# Backup script
sudo nano /usr/local/bin/backup-medkm-json.sh
```
Add:
```bash
#!/bin/bash
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/var/backups/medkm"
mkdir -p $BACKUP_DIR

tar -czf $BACKUP_DIR/medkm_data_$TIMESTAMP.tar.gz /var/www/medkm/backend/mock-api/data

# Keep only last 7 days
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
```

#### Log Rotation

```bash
sudo nano /etc/logrotate.d/medkm
```
Add:
```
/var/www/medkm/backend/*/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
    postrotate
        systemctl reload nginx > /dev/null 2>&1 || true
    endscript
}
```

#### Security Updates

```bash
# Weekly security updates
sudo apt update
sudo apt list --upgradable
sudo apt upgrade -y

# Update Node.js packages
cd /var/www/medkm/backend/mock-api
npm audit
npm audit fix

# Update Laravel packages
cd /var/www/medkm/backend/laravel-real
composer update --with-dependencies
php artisan migrate --force
```

---

### PART 5: Troubleshooting

#### Backend Not Responding

**Node.js**:
```bash
pm2 logs medkm-api --lines 100
pm2 restart medkm-api
```

**Laravel**:
```bash
tail -f /var/www/medkm/backend/laravel-real/storage/logs/laravel.log
sudo systemctl restart php8.1-fpm
```

#### Database Connection Failed

```bash
# Test MySQL connection
mysql -u medkm_user -p medkm

# Check MySQL status
sudo systemctl status mysql
sudo systemctl restart mysql

# Laravel specific
cd /var/www/medkm/backend/laravel-real
php artisan config:clear
php artisan cache:clear
```

#### Nginx Errors

```bash
# Check syntax
sudo nginx -t

# View error logs
sudo tail -f /var/log/nginx/error.log

# Restart Nginx
sudo systemctl restart nginx
```

#### Permission Issues

```bash
# Fix Laravel permissions
cd /var/www/medkm/backend/laravel-real
sudo chown -R www-data:www-data storage bootstrap/cache
sudo chmod -R 775 storage bootstrap/cache

# Fix Node.js permissions
sudo chown -R medkm:medkm /var/www/medkm/backend/mock-api
```

#### SSL Certificate Renewal

```bash
# Test renewal
sudo certbot renew --dry-run

# Force renewal
sudo certbot renew --force-renewal
```

---

### PART 6: Performance Optimization

#### Nginx Optimization

```bash
sudo nano /etc/nginx/nginx.conf
```
Add/modify:
```nginx
worker_processes auto;
worker_rlimit_nofile 65535;

events {
    worker_connections 4096;
    use epoll;
    multi_accept on;
}

http {
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_comp_level 6;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
    
    # Client body size
    client_max_body_size 10M;
    
    # Timeouts
    client_body_timeout 12;
    client_header_timeout 12;
    keepalive_timeout 15;
    send_timeout 10;
    
    # Caching
    open_file_cache max=2000 inactive=20s;
    open_file_cache_valid 60s;
    open_file_cache_min_uses 2;
    open_file_cache_errors on;
}
```

#### Laravel Optimization

```bash
cd /var/www/medkm/backend/laravel-real

# Cache configuration, routes, views
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Optimize autoloader
composer install --optimize-autoloader --no-dev

# Enable OPcache
sudo nano /etc/php/8.1/fpm/php.ini
```
Enable:
```ini
opcache.enable=1
opcache.memory_consumption=128
opcache.max_accelerated_files=4000
opcache.revalidate_freq=60
```

Restart PHP-FPM:
```bash
sudo systemctl restart php8.1-fpm
```

#### MySQL Optimization

```bash
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf
```
Add:
```ini
[mysqld]
innodb_buffer_pool_size = 256M
innodb_log_file_size = 64M
max_connections = 200
query_cache_size = 32M
query_cache_limit = 2M
```

Restart MySQL:
```bash
sudo systemctl restart mysql
```

---

### PART 7: Production Checklist

Before going live, verify:

- [ ] SSL certificate installed and auto-renewal configured
- [ ] Firewall configured (UFW enabled, only necessary ports open)
- [ ] Database backups scheduled (daily cron job)
- [ ] Application logs rotating (logrotate configured)
- [ ] Monitoring tools installed (htop, netstat, etc.)
- [ ] PM2/systemd services set to auto-start on boot
- [ ] Nginx configured with proper security headers
- [ ] File permissions correctly set (www-data for Laravel)
- [ ] Environment variables secured (.env files not publicly accessible)
- [ ] Database credentials strong and unique
- [ ] Test user accounts created with correct roles
- [ ] API endpoints responding correctly
- [ ] Frontend loads and connects to backend
- [ ] Login/logout functionality working
- [ ] Exam creation and taking working
- [ ] PDF generation tested
- [ ] Image upload working
- [ ] Performance tested under load
- [ ] Error handling working properly
- [ ] Backup restoration tested

---

## User Roles & Responsibilities

### 👨‍⚕️ **1. STUDENT**

**Purpose:** Medical professionals and healthcare students learning through exams

**Permissions:**
- ✅ Take exams (unlimited attempts)
- ✅ View personal statistics and progress trends
- ✅ Download exam result PDFs
- ✅ View correct/incorrect answers with explanations
- ❌ Cannot create questions
- ❌ Cannot manage users
- ❌ Cannot approve content

**Key Metrics:**
- Exams completed count
- Average score percentage
- Best score achieved
- Improvement percentage
- Exam history with dates and scores

**Menu Items:**
- Home (Dashboard)
- Take Exam
- Student (Profile/Statistics)
- Personal Stats Page

---

### 💉 **2. CLINICIAN (Question Creator)**

**Purpose:** Healthcare professionals creating and validating medical questions

**Permissions:**
- ✅ Create medical questions with images
- ✅ Upload question images
- ✅ Submit questions for review
- ✅ Manage own questions
- ✅ View approval status
- ✅ Take exams
- ✅ View analytics dashboard
- ❌ Cannot approve questions
- ❌ Cannot manage users

**Key Responsibilities:**
- Write high-quality, medically accurate questions
- Provide clear, evidence-based answer explanations
- Tag questions with appropriate specialties
- Ensure images are relevant and clear
- Maintain question formatting standards
- Receive feedback from moderators

**Menu Items:**
- Create Question
- Manage (Question management)
- Results (View submissions)
- Analytics (Dashboard)

**Question Format:**
```
Title: Question title
Specialization: [Cardiology, Neurology, etc.]
Difficulty: [Easy, Medium, Hard]
Question Type: [Multiple Choice, True/False]
Body: Question text with medical terminology
Options: 4-5 possible answers
Correct Answer: Clearly marked
Explanation: Detailed explanation of correct answer
Images: High-resolution, labeled images if applicable
```

---

### ✅ **3. MODERATOR (QA/Content Reviewer)**

**Purpose:** Ensure quality and accuracy of medical content

**Permissions:**
- ✅ Review pending questions
- ✅ Approve/Reject questions
- ✅ Send feedback to clinicians
- ✅ View analytics and statistics
- ✅ Take exams
- ✅ Manage questions
- ✅ View clinician dashboard
- ❌ Cannot manage users
- ❌ Cannot modify approved questions

**Key Responsibilities:**
- Review submitted questions for medical accuracy
- Verify evidence-based content
- Check formatting and language clarity
- Ensure image quality and relevance
- Provide constructive feedback
- Maintain curriculum standards
- Reject non-compliant questions with explanations

**Review Checklist:**
- [ ] Medical accuracy verified
- [ ] Language is clear and professional
- [ ] No bias or offensive content
- [ ] Images are appropriate and labeled
- [ ] Answer explanation is comprehensive
- [ ] References cited if applicable
- [ ] Format matches standards

**Menu Items:**
- Moderator (Review queue)
- Analytics (Performance data)
- Manage (Content management)

---

### 👨‍💼 **4. ADMIN (System Administrator)**

**Purpose:** Overall system management and user administration

**Permissions:**
- ✅ Create/Edit/Delete user accounts
- ✅ Assign user roles
- ✅ View comprehensive analytics
- ✅ Monitor system activity
- ✅ Access all features
- ✅ Configure system settings
- ✅ Review audit logs
- ✅ Manage database

**Key Responsibilities:**
- Create new user accounts
- Assign appropriate roles
- Reset user passwords
- Monitor system health
- Backup data regularly
- Update system software
- Review security logs
- Support other administrators

**User Management:**
- Create accounts for students, clinicians, moderators
- Assign roles with proper permissions
- Reset forgotten passwords
- Deactivate inactive accounts
- Maintain user database integrity

**Menu Items:**
- Users (User management)
- Analytics (System dashboard)
- All features accessible

---

### 💻 **5. IT ADMINISTRATOR (System & Infrastructure)**

**Purpose:** Technical infrastructure and system maintenance

**Responsibilities:**
- Install and configure servers
- Manage SSL/HTTPS certificates
- Configure web servers (Nginx/Apache)
- Database administration
- Backup and disaster recovery
- Performance monitoring
- Security patching and updates
- Log analysis and monitoring
- Network configuration
- Docker/Container management

**Key Tasks:**
1. **Server Setup**
   - Install OS packages: Node.js, Nginx, PostgreSQL/MySQL
   - Configure firewall rules
   - Set up SSH access
   - Configure system monitoring

2. **Application Deployment**
   - Clone repository
   - Install dependencies
   - Configure environment variables
   - Start services
   - Monitor logs

3. **Database Management**
   - Set up database server
   - Run migrations
   - Create backups
   - Monitor performance
   - Handle replication/clustering

4. **Security**
   - Generate SSL certificates
   - Configure authentication
   - Implement rate limiting
   - Set up Web Application Firewall (WAF)
   - Regular security audits

5. **Monitoring & Maintenance**
   - CPU/Memory/Disk usage
   - API response times
   - Error logs analysis
   - Automatic restart on failure
   - Scheduled maintenance windows

---

## User Guides by Role

### 🎓 STUDENT GUIDE

#### Login
1. Navigate to login page
2. Enter Email and Password
3. Click "Sign In"
4. Redirected to HomePage

#### Taking an Exam
1. Click "Take Exam" in navbar
2. Select exam from list
3. Click "Start" button
4. Answer all questions
5. Click "Submit Exam"
6. View instant results and score
7. Click "Download PDF" to print results

#### Viewing Statistics
1. Click "Student" in navbar
2. View performance metrics:
   - Total exams completed
   - Average score
   - Best score achieved
   - Improvement percentage
3. See score trends in chart
4. View per-exam breakdown
5. Download specific exam PDFs

#### Understanding Scores
- **Passing Score**: 70% or above = PASS ✅
- **Failing Score**: Below 70% = FAIL ❌
- **Score Color Coding**:
  - Green: 70-100% (Excellent)
  - Orange: 60-69% (Borderline)
  - Red: Below 60% (Failed)

---

### 🏥 CLINICIAN GUIDE

#### Create a New Question
1. Click "Create Question" in navbar
2. Fill form with:
   - **Title**: Clear, specific question
   - **Specialization**: Select from dropdown
   - **Difficult Level**: Easy/Medium/Hard
   - **Question Type**: Multiple Choice
   - **Question Body**: Clear text
   - **Options**: Provide 4-5 answers
   - **Correct Answer**: Select correct option
   - **Explanation**: Detailed explanation
   - **Images**: Upload if applicable

3. Click "Upload"
4. Question enters review queue

#### Upload Question with Image
1. Click "Create Question"
2. Fill all required fields
3. Click "Upload Image"
4. Select high-quality, labeled image
5. Image appears in preview
6. Submit form

#### Track Question Status
1. Click "Manage" in navbar
2. View table of your questions:
   - Status: Pending/Approved/Rejected
   - Created date
   - Moderator feedback
3. Edit pending questions if needed
4. Resubmit rejected questions
5. View all approved questions

#### View Analytics
1. Click "Analytics" in navbar
2. See student performance on your questions
3. View student pass rates
4. Track question difficulty

---

### ✅ MODERATOR GUIDE

#### Review Questions
1. Click "Moderator" in navbar
2. View queue of pending questions
3. Click question to view details:
   - Question text
   - All answer options
   - Explanation
   - Any images
   - Clinician name

#### Approve/Reject Question
1. Read question thoroughly
2. Check medical accuracy
3. Verify formatting
4. Review images if present
5. Click "Approve" or "Reject"
6. If rejecting, add feedback:
   - Reason for rejection
   - Specific improvements needed
7. Submit

#### View Analytics
1. Click "Analytics" in navbar
2. See three dashboards:
   - **Overview**: Platform statistics
   - **Student Performance**: Track individuals
   - **Exam Analysis**: Detailed breakdowns

#### Quality Standards to Check
- ✅ Medical accuracy
- ✅ Evidence-based content
- ✅ Clear language
- ✅ Professional formatting
- ✅ Appropriate images
- ✅ No bias/discrimination
- ✅ Complete explanation

---

### 👨‍💼 ADMIN GUIDE

#### Create New User
1. Click "Users" in navbar
2. Click "Add New User"
3. Fill form:
   - **Name**: Full name
   - **Email**: Valid email address
   - **Password**: Strong password
   - **Role**: Select from dropdown:
     - Student
     - Clinician
     - Moderator
     - Admin
4. Click "Create User"
5. User added to system
6. User can login with email/password

#### Edit User
1. Click "Users" in navbar
2. Find user in table
3. Click "Edit" button
4. Update information:
   - Name
   - Email
   - Role
   - Password (optional)
5. Click "Save"

#### Delete User
1. Click "Users" in navbar
2. Find user in table
3. Click "Delete" button
4. Confirm deletion
5. User account removed

#### View User List
1. Click "Users" in navbar
2. See table of all users:
   - Name
   - Email
   - Role (color-coded)
   - Creation date
   - Actions (Edit/Delete)

#### View Analytics
1. Click "Analytics" in navbar
2. See comprehensive dashboards:
   - Platform statistics
   - Student progress
   - Exam performance
   - Clinician contributions

#### Test Account Access
Admins can use test accounts to verify system:
- **Student**: student@test.com / password
- **Clinician**: clinician@test.com / password
- **Moderator**: moderator@test.com / password
- **Admin**: admin@test.com / password

---

### 💻 IT ADMINISTRATOR GUIDE

#### Server Installation

**Ubuntu/Debian:**
```bash
# Update system
sudo apt-get update && sudo apt-get upgrade -y

# Install Node.js
curl -sL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Nginx
sudo apt-get install -y nginx

# Install PostgreSQL (optional)
sudo apt-get install -y postgresql postgresql-contrib

# Clone application
git clone <repo-url> /var/www/med-km
cd /var/www/med-km

# Install dependencies
cd backend/mock-api && npm install
cd ../../frontend && npm install
```

#### Configure Nginx
Create `/etc/nginx/sites-available/med-km`:
```nginx
upstream med_km_backend {
    server 127.0.0.1:3001;
}

server {
    listen 80;
    server_name your-domain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # Frontend
    location / {
        root /var/www/med-km/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://med_km_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header Authorization $http_authorization;
        
        # CORS headers
        add_header Access-Control-Allow-Origin * always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Content-Type, Authorization" always;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/med-km /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### Start Application

**Backend (PM2):**
```bash
sudo npm install -g pm2
cd /var/www/med-km/backend/mock-api
pm2 start index.js --name "med-km-api" --env production
pm2 save
pm2 startup
```

**Frontend:**
```bash
cd /var/www/med-km/frontend
npm run build
# Served by Nginx from dist/ folder
```

#### Monitor System
```bash
# Check services
pm2 status
pm2 logs med-km-api

# Monitor resources
htop

# Check Nginx
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# Database
sudo -u postgres psql
```

#### Regular Maintenance
```bash
# Weekly backups
0 2 * * 0 /usr/local/bin/backup.sh

# Log rotation
sudo logrotate -f /etc/logrotate.d/med-km

# Update system
sudo apt-get update && sudo apt-get upgrade -y

# Renew SSL (auto via certbot)
sudo certbot renew --quiet
```

---

## API Documentation

### 🔑 Authentication

**Login Endpoint:**
```
POST /api/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response (200 OK):
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user-123",
    "name": "John Doe",
    "email": "user@example.com",
    "role": "student"
  }
}
```

**All API requests require token:**
```
Authorization: Bearer {token}
```

### 📚 Exams API

**Get All Exams:**
```
GET /api/exams
Authorization: Bearer {token}

Response:
[
  {
    "id": "exam-1",
    "title": "Cardiology Basics",
    "description": "Introduction to cardiology",
    "totalQuestions": 10,
    "createdBy": "clinician-123",
    "createdAt": "2026-02-18"
  }
]
```

**Get Exam Details:**
```
GET /api/exams/{examId}
Authorization: Bearer {token}

Response:
{
  "id": "exam-1",
  "title": "Cardiology Basics",
  "questions": [
    {
      "id": "q-1",
      "title": "What is...",
      "options": ["A", "B", "C", "D"],
      "explanation": "..."
    }
  ]
}
```

**Submit Exam:**
```
POST /api/student-exams
Authorization: Bearer {token}
Content-Type: application/json

{
  "examId": "exam-1",
  "answers": {
    "q-1": 0,
    "q-2": 2,
    "q-3": 1
  }
}

Response:
{
  "resultId": "result-123",
  "score": 85,
  "passed": true,
  "totalQuestions": 10,
  "correctAnswers": 8
}
```

### 📊 Student Stats API

**Get Personal Stats:**
```
GET /api/my-stats
Authorization: Bearer {token}

Response:
{
  "attempts": [
    {
      "id": "result-1",
      "examTitle": "Cardiology Basics",
      "score": 85,
      "passed": true,
      "date": "2026-02-18",
      "correct": 8,
      "total": 10,
      "passingScore": 70
    }
  ],
  "avgScore": 82,
  "bestScore": 95,
  "improvement": 12
}
```

**Get Specific Student Stats (Clinician):**
```
GET /api/student-stats/{studentId}
Authorization: Bearer {token}

Response: Same as above
```

### ❓ Questions API

**Upload Question:**
```
POST /api/questions
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Question title",
  "specialty": "Cardiology",
  "difficulty": "Medium",
  "questionType": "Multiple Choice",
  "body": "Question text...",
  "options": ["A", "B", "C", "D"],
  "correctAnswer": 0,
  "explanation": "Detailed explanation...",
  "image": "base64-image-data (optional)"
}

Response:
{
  "id": "q-123",
  "status": "pending",
  "createdAt": "2026-02-18"
}
```

**Get Pending Questions (Moderator):**
```
GET /api/moderator/pending
Authorization: Bearer {token}

Response:
[
  {
    "id": "q-123",
    "title": "Question",
    "body": "Question text",
    "createdBy": "clinician-123",
    "status": "pending"
  }
]
```

**Review Question:**
```
PUT /api/moderator/questions/{questionId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "approved",
  "feedback": "Great question!"
}

Response: { success: true }
```

### 👥 User Management API (Admin Only)

**Create User:**
```
POST /api/admin/users
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "role": "student"
}

Response:
{
  "id": "user-123",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "student"
}
```

**Update User:**
```
PUT /api/admin/users/{userId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "John Updated",
  "role": "clinician"
}

Response: { success: true }
```

**Delete User:**
```
DELETE /api/admin/users/{userId}
Authorization: Bearer {token}

Response: { success: true }
```

### 📄 PDF Reports API

**Generate Exam Report:**
```
GET /api/student-exams/{resultId}/pdf
Authorization: Bearer {token}

Response: PDF file (application/pdf)
```

---

## Troubleshooting

### Common Issues & Solutions

#### 1. Cannot Start Backend
**Problem:** `npm start` fails with error

**Solutions:**
```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install

# Check Node version
node --version  # Should be v14+

# Check port availability
lsof -i :3001  # Linux/Mac
netstat -ano | findstr :3001  # Windows

# Kill process on port
kill -9 <PID>  # Linux/Mac
taskkill /PID <PID> /F  # Windows
```

#### 2. Frontend Won't Load
**Problem:** Blank page or 502 error

**Solutions:**
```bash
# Rebuild frontend
npm run build

# Clear browser cache
# Ctrl+Shift+Delete

# Check API connection
# In browser console: fetch('http://localhost:3001/api').then(r => r.json())

# Check CORS
# Verify cors() is enabled in backend
```

#### 3. Login Fails
**Problem:** "Invalid credentials" error

**Solutions:**
- Verify user exists in users.json
- Check email is exact match (case-sensitive)
- Password correct
- Backend server is running
- Token stored in localStorage

#### 4. Database Not Connecting
**Problem:** Cannot connect to PostgreSQL/MySQL

**Solutions:**
```bash
# Test connection
psql -U username -d database_name  # PostgreSQL
mysql -u username -p database_name  # MySQL

# Check credentials in .env
cat .env

# Start database service
sudo service postgresql start
sudo service mysql start
```

#### 5. High Memory Usage
**Problem:** App using too much RAM

**Solutions:**
```bash
# Monitor process
pm2 monit

# Restart service
pm2 restart med-km-api

# Check for memory leaks
node --expose-gc index.js
```

#### 6. Slow Performance
**Problem:** Pages load slowly

**Solutions:**
```bash
# Enable compression in Nginx
gzip on;
gzip_types text/plain application/json;

# Cache static files
expires 30d;

# Use CDN for images

# Optimize database queries
# Add indexes to frequently queried fields
```

#### 7. SSL/TLS Certificate Error
**Problem:** HTTPS not working or certificate expired

**Solutions:**
```bash
# Check certificate
openssl x509 -in cert.pem -text -noout

# Renew Let's Encrypt
sudo certbot renew

# Force renewal
sudo certbot renew --force-renewal
```

---

## Security Guidelines

### 🔒 Best Practices

#### Authentication Security
1. **Strong Passwords**
   - Minimum 8 characters
   - Mix of uppercase, lowercase, numbers, symbols
   - Change regularly (every 90 days)

2. **Token Management**
   - Tokens expire after session
   - Never share tokens
   - Store only in localStorage (not cookies exposed to JS)
   - Clear on logout

3. **Two-Factor Authentication (Future)**
   - SMS/Email verification for sensitive accounts
   - Particularly for admin users

#### Data Protection
1. **Encryption**
   - All passwords hashed with bcrypt
   - HTTPS/TLS for all transmissions
   - Database encryption at rest

2. **Backup & Recovery**
   - Daily automated backups
   - Store backups in secure location
   - Test recovery process monthly
   - Backup retention: 30 days minimum

3. **Access Control**
   - Role-based permissions enforced
   - Admin approval for sensitive operations
   - IP whitelisting for admin panel (optional)

#### Audit & Monitoring
1. **Logging**
   - Log all admin actions
   - Log failed login attempts
   - Log data modifications
   - Maintain logs for 90 days minimum

2. **Monitoring**
   - Monitor CPU/Memory/Disk
   - Alert on unusual activity
   - Regular security audits
   - Penetration testing (quarterly)

### 🚨 Security Checklist

- [ ] HTTPS/SSL enabled on all pages
- [ ] Database password strong and unique
- [ ] Admin accounts have 2FA enabled
- [ ] Regular backups configured
- [ ] Error messages don't expose sensitive info
- [ ] API endpoints authenticated
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] SQL injection prevention active
- [ ] XSS protection enabled
- [ ] CSRF tokens on forms
- [ ] Dependency vulnerabilities checked (`npm audit`)
- [ ] Access logs reviewed weekly
- [ ] Penetration test conducted
- [ ] Disaster recovery plan tested

---

## Maintenance & Support

### 📅 Maintenance Schedule

#### Daily
- [ ] Monitor system logs
- [ ] Check error logs
- [ ] Verify services are running
- [ ] Check disk space usage

#### Weekly
- [ ] Review access logs
- [ ] Update security patches
- [ ] Check backup completion
- [ ] Performance review

#### Monthly
- [ ] Full system backup
- [ ] Database optimization
- [ ] User access review
- [ ] Capacity planning
- [ ] Security audit

#### Quarterly
- [ ] Penetration testing
- [ ] Disaster recovery drill
- [ ] Update dependencies
- [ ] Compliance review

### 📞 Support Resources

**Documentation:**
- Project Manual (this file)
- API Documentation
- User Guides
- Troubleshooting Guide

**Contact Support:**
- Email: it-admin@chomthong-hospital.com
- Phone: +66-XX-XXX-XXXX ext. XXXX
- Help Desk: support@hospital.com
- Hours: Monday-Friday, 8AM-5PM

**Escalation:**
1. Level 1: Help Desk / IT Support
2. Level 2: Senior IT Administrator
3. Level 3: CIO / IT Director

### 📝 Reporting Issues

**When reporting issues, include:**
1. User role and account name
2. Date and time of issue
3. Exact error message
4. Steps to reproduce
5. Screenshots/logs if available
6. Browser/OS information
7. Network environment (office/remote)

**Submit via:**
- Help desk ticket system
- Email with [med-km] tag
- In-person at IT office

### 🔄 Update Process

**Regular Updates:**
```bash
# Backup current system
cp -r /var/www/med-km /var/www/med-km.backup

# Pull latest code
cd /var/www/med-km
git pull origin main

# Install dependencies
cd backend/mock-api && npm install
cd ../../frontend && npm install

# Build frontend
npm run build

# Restart services
pm2 restart med-km-api

# Verify functionality
curl http://localhost:3001/api
```

**Major Version Updates:**
1. Schedule maintenance window
2. Notify all users
3. Backup database
4. Update code
5. Run migrations
6. Test thoroughly
7. Restore from backup if issues
8. Monitor closely for 24 hours

### 💾 Backup & Disaster Recovery

**Automated Backup:**
```bash
#!/bin/bash
# /usr/local/bin/backup.sh

BACKUP_DIR="/backups/med-km"
DATE=$(date +%Y%m%d_%H%M%S)

# Backup database
pg_dump med_km > $BACKUP_DIR/database_$DATE.sql

# Backup files
tar -czf $BACKUP_DIR/files_$DATE.tar.gz /var/www/med-km

# Upload to cloud storage (optional)
aws s3 cp $BACKUP_DIR/database_$DATE.sql s3://med-km-backups/

# Cleanup old backups (keep 30 days)
find $BACKUP_DIR -mtime +30 -delete
```

**Recovery Process:**
```bash
# Restore database
psql med_km < database_2026-02-18.sql

# Restore files
tar -xzf files_2026-02-18.tar.gz -C /var/www/

# Restart services
pm2 restart med-km-api
sudo systemctl restart nginx

# Verify
curl http://localhost/api
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-02-18 | Initial release with core features |
| 1.1 | TBD | Thai ID authentication |
| 1.2 | TBD | Advanced analytics |
| 2.0 | TBD | Mobile app release |

---

## Appendices

### Appendix A: User Account Template

```
User Creation Form:
Name: _________________________
Email: _________________________
Assigned Role: [ ] Student [ ] Clinician [ ] Moderator [ ] Admin
Initial Password: _________________________
Department/Specialty: _________________________
Date Created: _________________________
Created By: _________________________
```

### Appendix B: Installation Checklist

- [ ] Prerequisites verified (Node.js v14+, Git)
- [ ] Repository cloned
- [ ] Backend dependencies installed
- [ ] Frontend dependencies installed
- [ ] Backend syntax checked
- [ ] Frontend builds successfully
- [ ] Backend server starts
- [ ] Frontend dev server starts
- [ ] API responds to requests
- [ ] Can login with test account
- [ ] Can view pages for each role
- [ ] Database connectivity verified
- [ ] Logging working
- [ ] Backup configured

### Appendix C: Glossary

- **JWT**: JSON Web Token for authentication
- **CORS**: Cross-Origin Resource Sharing
- **API**: Application Programming Interface
- **CLI**: Command Line Interface
- **SSH**: Secure Shell for remote access
- **SSL/TLS**: Secure communication protocol
- **PM2**: Process manager for Node.js
- **PDFKit**: Library for PDF generation

---

## Document Information

**Document Title:** Chomthong Hospital Medical Learning Platform - Comprehensive Manual  
**Version:** 1.0  
**Last Updated:** February 18, 2026  
**Author:** IT Department - Chomthong Hospital  
**Classification:** Internal Use Only  
**Distribution:** All Stakeholders (Students, Clinicians, Moderators, Admins, IT Staff)

---

**For questions or feedback about this manual, contact:**
- IT Department: it-admin@chomthong-hospital.com
- Document Owner: [IT Director Name]

**Next Review Date:** August 18, 2026

---

*This manual is a living document and will be updated as the system evolves. All users are encouraged to provide feedback for improvements.*
