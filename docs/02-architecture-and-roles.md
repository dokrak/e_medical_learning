# 2. สถาปัตยกรรมระบบและบทบาทผู้ใช้ / System Architecture & User Roles

---

## 2.1 สถาปัตยกรรมระบบ / System Architecture

### แผนภาพระบบ / System Diagram

```
┌───────────────────────────────────────────────────────────┐
│                     Client (Browser)                      │
│              React 18.2 + Vite 4.4.9 SPA                 │
│         ภาษาไทย/English  •  Responsive Design             │
└─────────────────────────┬─────────────────────────────────┘
                          │ HTTPS (REST API)
                          │ Authorization: Bearer <token>
                          ▼
┌───────────────────────────────────────────────────────────┐
│                  Web Server (Apache 2.4.62)               │
│              AlmaLinux  •  SELinux Enforcing               │
│              IP: 10.0.0.7  •  Port 443/80                 │
├───────────────────────────────────────────────────────────┤
│                                                           │
│   /elearning/            → Static React build (SPA)       │
│   /elearning/api/*       → Laravel Backend (PHP 8.2)      │
│   /elearning/storage/*   → Uploaded files (images)        │
│                                                           │
└─────────────────────────┬─────────────────────────────────┘
                          │
                          ▼
┌───────────────────────────────────────────────────────────┐
│                Laravel 12 Backend                         │
│                                                           │
│   ┌─────────────┐  ┌──────────────┐  ┌───────────────┐  │
│   │  Sanctum     │  │  Controllers │  │  Eloquent     │  │
│   │  Auth        │  │  (API)       │  │  ORM          │  │
│   └─────────────┘  └──────────────┘  └───────┬───────┘  │
│                                               │          │
└───────────────────────────────────────────────┼──────────┘
                                                │
                                                ▼
┌───────────────────────────────────────────────────────────┐
│                     SQLite Database                       │
│              database/database.sqlite                     │
│    (รองรับ MySQL ผ่านการตั้งค่า .env / MySQL supported)    │
│                                                           │
│   8 Tables: users, specialties, questions, exams,         │
│   student_exams, audit_logs, personal_access_tokens,      │
│   sessions                                                │
└───────────────────────────────────────────────────────────┘
```

### เทคโนโลยีที่ใช้ / Technology Stack

| ชั้น / Layer | เทคโนโลยี / Technology | เวอร์ชัน / Version |
|---|---|---|
| Frontend Framework | React | 18.2.0 |
| Build Tool | Vite | 4.4.9 |
| CSS Framework | Tailwind CSS | 3.x |
| HTTP Client | Axios | 1.6.x |
| Backend Framework | Laravel | 12.x |
| Language | PHP | 8.2.30 |
| Authentication | Laravel Sanctum | 4.x |
| Database | SQLite / MySQL | 3.x / 8.x |
| Web Server | Apache | 2.4.62 |
| Operating System | AlmaLinux | 9.x |
| Security Module | SELinux | Enforcing |
| Version Control | Git / GitHub | — |

### โครงสร้างไฟล์ / File Structure

```
e_medical_learning/
├── frontend/                    # React SPA source
│   ├── src/
│   │   ├── App.jsx              # Router & layout (24 routes)
│   │   ├── api.js               # Axios API client
│   │   ├── LangContext.jsx      # Bilingual EN/TH translations
│   │   ├── main.jsx             # Entry point
│   │   ├── styles.css           # Global styles (Tailwind)
│   │   └── pages/               # 15 page components
│   ├── public/                  # Static assets
│   ├── vite.config.js           # Vite config (base: /elearning/)
│   └── package.json             # Dependencies
│
├── backend/
│   └── laravel-real/            # Laravel application
│       ├── app/
│       │   ├── Http/Controllers/Api/   # API controllers
│       │   ├── Models/                  # Eloquent models
│       │   └── Providers/               # Service providers
│       ├── config/              # Configuration files
│       ├── database/
│       │   ├── migrations/      # Schema definitions
│       │   └── seeders/         # Seed data
│       ├── routes/
│       │   ├── api.php          # API routes
│       │   └── web.php          # Web routes
│       ├── storage/             # Uploads & logs
│       ├── public/
│       │   └── build/           # Compiled frontend
│       └── .env                 # Environment config
│
└── docs/                        # This documentation
```

---

## 2.2 บทบาทผู้ใช้และสิทธิ์การเข้าถึง / User Roles & Permissions

### บทบาทในระบบ / System Roles

ระบบ Med-KM กำหนดบทบาทผู้ใช้ 6 ระดับ ดังนี้:

The Med-KM system defines 6 user roles:

| # | บทบาท / Role | คำอธิบาย / Description |
|---|---|---|
| 1 | **Admin** (ผู้ดูแลระบบ) | จัดการผู้ใช้ สาขาวิชา และการตั้งค่าทั้งหมด / Manage users, specialties, all settings |
| 2 | **Moderator** (ผู้ตรวจสอบ) | ตรวจสอบและอนุมัติข้อสอบ / Review and approve/reject questions |
| 3 | **Clinician** (แพทย์/อาจารย์) | สร้างข้อสอบ สร้างชุดข้อสอบ ดูผลสอบ / Create questions, build exams, view results |
| 4 | **Fellow** (แพทย์ fellow) | สร้างข้อสอบ ทำข้อสอบ / Create questions, take exams |
| 5 | **Resident** (แพทย์ประจำบ้าน) | สร้างข้อสอบ ทำข้อสอบ / Create questions, take exams |
| 6 | **Student** (นักศึกษาแพทย์) | ทำข้อสอบ ดูผลสอบตนเอง / Take exams, view own results |

### ตารางสิทธิ์การเข้าถึง / Permission Matrix

| ฟีเจอร์ / Feature | Admin | Moderator | Clinician | Fellow | Resident | Student |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| ดูหน้าหลัก / View Home | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| เข้าสู่ระบบ / Login | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| สร้างข้อสอบ / Upload Question | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| จัดการข้อสอบ / Manage Questions & Exams | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| ตรวจสอบข้อสอบ / Moderate Questions | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| สร้างชุดข้อสอบ / Build Exam | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| ดูรายการข้อสอบ / View Exams List | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| ทำข้อสอบ / Take Exam | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| ดูผลสอบ / View Exam Results | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Dashboard ผู้เรียน / Student Dashboard | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| สถิติผู้เรียน / Student Stats | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| Dashboard ผลสอบรวม / Exam Results Dashboard | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Dashboard แพทย์ / Clinician Dashboard | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| จัดการผู้ใช้ / Manage Users | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| จัดการสาขาวิชา / Manage Specialties | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

### การไหลของข้อมูลตามบทบาท / Role-based Data Flow

```
Admin ──────────┬── จัดการผู้ใช้ / Manage Users
                ├── จัดการสาขาวิชา / Manage Specialties
                ├── ดูผลสอบทั้งหมด / View All Results
                └── เข้าถึงทุกส่วน / Full Access

Moderator ──────┬── ตรวจสอบข้อสอบ / Review Questions
                ├── อนุมัติ/ปฏิเสธ / Approve/Reject
                └── จัดการข้อสอบ / Manage Questions

Clinician ──────┬── สร้างข้อสอบ / Create Questions
                ├── สร้างชุดข้อสอบ / Build Exams
                ├── ดูผลสอบของชุดตนเอง / View Exam Results
                └── Dashboard / Analytics

Fellow/Resident ┬── สร้างข้อสอบ / Create Questions
                └── ทำข้อสอบ / Take Exams

Student ────────┬── ทำข้อสอบ / Take Exams
                └── ดูผลสอบตนเอง / View Own Results
```
