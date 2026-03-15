# ๐ฅ Chomthong Hospital Medical Learning Platform (med-km)
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

### ๐ฏ Purpose

The **Chomthong Hospital Medical Learning Platform (med-km)** is a modern, comprehensive digital learning system designed to facilitate continuous medical education and professional development for healthcare professionals and medical students. The platform bridges traditional medical knowledge with cutting-edge digital innovation to create an engaging, interactive learning environment.

### ๐“ Key Objectives

- **Medical Excellence**: Provide comprehensive, high-quality medical exams curated by healthcare professionals
- **Smart Learning**: Deliver AI-powered analytics to track progress and identify learning gaps
- **Collaborative Community**: Foster knowledge sharing among clinicians, moderators, and students
- **Real-time Feedback**: Provide immediate exam evaluation with detailed explanations
- **Data-Driven Insights**: Visualize learning trends and performance metrics
- **Secure & Trustworthy**: Protect medical data with enterprise-grade security

### โจ Core Features

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

### ๐—๏ธ Technology Stack

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

### ๐“ Project Structure

```
med-km/
โ”โ”€โ”€ frontend/                          # React frontend application
โ”   โ”โ”€โ”€ src/
โ”   โ”   โ”โ”€โ”€ App.jsx                   # Main app router and navigation
โ”   โ”   โ”โ”€โ”€ api.js                    # Axios API client
โ”   โ”   โ”โ”€โ”€ main.jsx                  # React entry point
โ”   โ”   โ”โ”€โ”€ pages/                    # Page components
โ”   โ”   โ”   โ”โ”€โ”€ HomePage.jsx          # Welcome dashboard
โ”   โ”   โ”   โ”โ”€โ”€ Login.jsx             # Authentication
โ”   โ”   โ”   โ”โ”€โ”€ ExamsList.jsx         # Browse exams
โ”   โ”   โ”   โ”โ”€โ”€ ExamTake.jsx          # Take exam
โ”   โ”   โ”   โ”โ”€โ”€ ExamBuilder.jsx       # Create exam (staff only)
โ”   โ”   โ”   โ”โ”€โ”€ UploadQuestion.jsx    # Upload question (clinician)
โ”   โ”   โ”   โ”โ”€โ”€ ManageQuestionsExams.jsx  # Manage content
โ”   โ”   โ”   โ”โ”€โ”€ ModeratorQueue.jsx    # Review queue (moderator)
โ”   โ”   โ”   โ”โ”€โ”€ StudentStats.jsx      # Student analytics
โ”   โ”   โ”   โ”โ”€โ”€ ClinicianDashboard.jsx# Clinician analytics
โ”   โ”   โ”   โ””โ”€โ”€ AdminUserManagement.jsx # User management
โ”   โ”   โ””โ”€โ”€ styles.css                # Global styling
โ”   โ”โ”€โ”€ public/                       # Static assets
โ”   โ”   โ””โ”€โ”€ logo.png                  # Chomthong Hospital logo
โ”   โ”โ”€โ”€ package.json
โ”   โ””โ”€โ”€ vite.config.js
โ”
โ”โ”€โ”€ backend/
โ”   โ”โ”€โ”€ mock-api/                     # Express backend
โ”   โ”   โ”โ”€โ”€ index.js                  # Main server file
โ”   โ”   โ”โ”€โ”€ package.json
โ”   โ”   โ””โ”€โ”€ data/                     # JSON data files
โ”   โ”       โ”โ”€โ”€ users.json
โ”   โ”       โ”โ”€โ”€ questions.json
โ”   โ”       โ”โ”€โ”€ exams.json
โ”   โ”       โ”โ”€โ”€ student_exams.json
โ”   โ”       โ”โ”€โ”€ specialties.json
โ”   โ”       โ”โ”€โ”€ audit_logs.json
โ”   โ”       โ””โ”€โ”€ question_images/
โ”   โ”
โ”   โ””โ”€โ”€ laravel-real/                 # (Optional) Production backend
โ”       โ”โ”€โ”€ app/Models/               # Database models
โ”       โ”โ”€โ”€ app/Http/Controllers/     # API controllers
โ”       โ”โ”€โ”€ database/migrations/      # Database schema
โ”       โ”โ”€โ”€ routes/api.php            # API routes
โ”       โ””โ”€โ”€ composer.json
โ”
โ”โ”€โ”€ README.md                         # Project overview
โ””โ”€โ”€ PROJECT_MANUAL.md                 # This file

```

### ๐” Authentication Flow

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

### โ… Prerequisites

- **Node.js**: v14.0 or higher ([Download](https://nodejs.org/))
- **npm**: v6.0 or higher (included with Node.js)
- **Git**: For version control ([Download](https://git-scm.com/))
- **Terminal/CMD**: PowerShell, CMD, or Bash
- **Disk Space**: 500MB minimum (excluding node_modules)

### ๐“ฅ Installation Steps

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

### ๐€ Running Development Environment

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

### ๐”ง Configuration

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

> **๐“– For the complete step-by-step deployment guide, see [PRODUCTION_MIGRATION.md](PRODUCTION_MIGRATION.md)**

### Quick Summary

#### Requirements
- Ubuntu 22.04+ / Debian 12+
- PHP 8.2+ with extensions (mysql, xml, curl, gd, mbstring, zip, bcmath)
- MySQL 8.0+ or PostgreSQL 15+
- Nginx
- Composer 2.x
- Node.js 18+ (for frontend build only)

#### Deploy in 5 Steps

```bash
# 1. Clone
git clone https://github.com/dokrak/e_medical_learning.git /var/www/medkm
cd /var/www/medkm

# 2. Backend
cd backend/laravel-real
composer install --optimize-autoloader --no-dev
cp .env.example .env
# Edit .env: set APP_URL, DB credentials, APP_ENV=production, APP_DEBUG=false
php artisan key:generate
php artisan migrate --force
php artisan db:seed --force
php artisan storage:link
php artisan config:cache && php artisan route:cache && php artisan view:cache

# 3. Frontend
cd ../../frontend
echo "VITE_API_BASE_URL=https://yourdomain.com/api" > .env
npm ci && npm run build

# 4. Permissions
cd ../backend/laravel-real
sudo chown -R www-data:www-data storage bootstrap/cache
sudo chmod -R 775 storage bootstrap/cache

# 5. Configure Nginx (see PRODUCTION_MIGRATION.md for full config) + SSL
sudo certbot --nginx -d yourdomain.com
```

#### Default Accounts (all password: `password`)

| Email | Role |
|-------|------|
| admin@example.com | Admin |
| clinician@example.com | Clinician |
| student@example.com | Student |
| moderator@example.com | Moderator |

> โ ๏ธ Change all default passwords immediately after first login!

---

## User Roles & Responsibilities

### ๐‘จโ€โ•๏ธ **1. STUDENT**

**Purpose:** Medical professionals and healthcare students learning through exams

**Permissions:**
- โ… Take exams (unlimited attempts)
- โ… View personal statistics and progress trends
- โ… Download exam result PDFs
- โ… View correct/incorrect answers with explanations
- โ Cannot create questions
- โ Cannot manage users
- โ Cannot approve content

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

### ๐’ **2. CLINICIAN (Question Creator)**

**Purpose:** Healthcare professionals creating and validating medical questions

**Permissions:**
- โ… Create medical questions with images
- โ… Upload question images
- โ… Submit questions for review
- โ… Manage own questions
- โ… View approval status
- โ… Take exams
- โ… View analytics dashboard
- โ Cannot approve questions
- โ Cannot manage users

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

### โ… **3. MODERATOR (QA/Content Reviewer)**

**Purpose:** Ensure quality and accuracy of medical content

**Permissions:**
- โ… Review pending questions
- โ… Approve/Reject questions
- โ… Send feedback to clinicians
- โ… View analytics and statistics
- โ… Take exams
- โ… Manage questions
- โ… View clinician dashboard
- โ Cannot manage users
- โ Cannot modify approved questions

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

### ๐‘จโ€๐’ผ **4. ADMIN (System Administrator)**

**Purpose:** Overall system management and user administration

**Permissions:**
- โ… Create/Edit/Delete user accounts
- โ… Assign user roles
- โ… View comprehensive analytics
- โ… Monitor system activity
- โ… Access all features
- โ… Configure system settings
- โ… Review audit logs
- โ… Manage database

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

### ๐’ป **5. IT ADMINISTRATOR (System & Infrastructure)**

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

### ๐“ STUDENT GUIDE

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
- **Passing Score**: 70% or above = PASS โ…
- **Failing Score**: Below 70% = FAIL โ
- **Score Color Coding**:
  - Green: 70-100% (Excellent)
  - Orange: 60-69% (Borderline)
  - Red: Below 60% (Failed)

---

### ๐ฅ CLINICIAN GUIDE

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

### โ… MODERATOR GUIDE

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
- โ… Medical accuracy
- โ… Evidence-based content
- โ… Clear language
- โ… Professional formatting
- โ… Appropriate images
- โ… No bias/discrimination
- โ… Complete explanation

---

### ๐‘จโ€๐’ผ ADMIN GUIDE

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

### ๐’ป IT ADMINISTRATOR GUIDE

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

### ๐”‘ Authentication

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

### ๐“ Exams API

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

### ๐“ Student Stats API

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

### โ“ Questions API

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

### ๐‘ฅ User Management API (Admin Only)

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

### ๐“ PDF Reports API

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

### ๐”’ Best Practices

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

### ๐จ Security Checklist

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

### ๐“… Maintenance Schedule

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

### ๐“ Support Resources

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

### ๐“ Reporting Issues

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

### ๐” Update Process

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

### ๐’พ Backup & Disaster Recovery

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
