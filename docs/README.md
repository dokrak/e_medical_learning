# 📋 Med-KM — คู่มือระบบ / System Manual (HAIT Standard)

## ระบบจัดการความรู้ทางการแพทย์ / Medical Knowledge Management System

**โรงพยาบาลจอมทอง / Chomthong Hospital**

---

> เอกสารนี้จัดทำตามมาตรฐาน HAIT (Healthcare Accreditation Institute of Thailand)  
> This manual is prepared according to HAIT standards.

| รหัส / ID | เวอร์ชัน / Ver | วันที่ / Date | ผู้จัดทำ / Author |
|---|---|---|---|
| MED-KM-MAN-001 | 1.0 | 2026-03-22 | Dr. Ekkawit Iamthongin |

---

## สารบัญ / Table of Contents

| # | หัวข้อ / Section | ไฟล์ / File |
|---|---|---|
| 1 | ภาพรวมระบบ / System Overview | [01-cover-and-overview.md](01-cover-and-overview.md) |
| 2 | สถาปัตยกรรมและบทบาทผู้ใช้ / Architecture & Roles | [02-architecture-and-roles.md](02-architecture-and-roles.md) |
| 3 | ฟีเจอร์และขั้นตอนการทำงาน / Features & Workflow | [03-features-and-workflow.md](03-features-and-workflow.md) |
| 4 | โครงสร้างฐานข้อมูล / Database Schema | [04-database-schema.md](04-database-schema.md) |
| 5 | API Endpoints | [05-api-endpoints.md](05-api-endpoints.md) |
| 6 | ความปลอดภัย / Security | [06-security.md](06-security.md) |
| 7 | การติดตั้งและตั้งค่า / Installation & Configuration | [07-installation-and-config.md](07-installation-and-config.md) |
| 8 | การบำรุงรักษาและแก้ไขปัญหา / Maintenance & Troubleshooting | [08-maintenance-and-troubleshooting.md](08-maintenance-and-troubleshooting.md) |

---

## Quick Start

```bash
# Clone
git clone https://github.com/dokrak/e_medical_learning.git
cd e_medical_learning

# Backend setup
cd backend/laravel-real
composer install
cp .env.example .env
php artisan key:generate
touch database/database.sqlite
php artisan migrate

# Frontend setup
cd ../../frontend
npm install
npm run build
cp -r dist/* ../backend/laravel-real/public/build/
```

For detailed instructions, see [07-installation-and-config.md](07-installation-and-config.md).

---

## Tech Stack

| Component | Technology |
|---|---|
| Frontend | React 18.2, Vite 4.4, Tailwind CSS |
| Backend | Laravel 12, PHP 8.2 |
| Auth | Laravel Sanctum |
| Database | SQLite / MySQL |
| Server | Apache 2.4, AlmaLinux |
| Languages | Thai / English (Bilingual) |

---

*Med-KM © 2026 Chomthong Hospital. All rights reserved.*
