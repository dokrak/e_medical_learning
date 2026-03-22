# 4. โครงสร้างฐานข้อมูล / Database Schema

---

## 4.1 ภาพรวม / Overview

ระบบใช้ SQLite เป็นฐานข้อมูลหลัก (รองรับ MySQL ผ่านการตั้งค่า `.env`) ประกอบด้วย 8 ตาราง:

The system uses SQLite (MySQL supported via `.env` config) with 8 tables:

```
┌──────────┐     ┌──────────────┐     ┌──────────┐
│  users   │────▶│  questions   │────▶│  exams   │
└──────────┘     └──────────────┘     └────┬─────┘
     │                  │                   │
     │           ┌──────┴──────┐           │
     │           │ specialties │           │
     │           └─────────────┘           │
     │                                     │
     └─────────────┐               ┌──────┘
                    ▼               ▼
              ┌─────────────────────────┐
              │     student_exams       │
              └─────────────────────────┘
              
     ┌────────────────┐  ┌─────────────────────────┐  ┌──────────┐
     │  audit_logs    │  │ personal_access_tokens   │  │ sessions │
     └────────────────┘  └─────────────────────────┘  └──────────┘
```

---

## 4.2 รายละเอียดตาราง / Table Details

### ตาราง users (ผู้ใช้)

จัดเก็บข้อมูลผู้ใช้ทั้งหมดในระบบ / Stores all system users.

| คอลัมน์ / Column | ชนิด / Type | คำอธิบาย / Description |
|---|---|---|
| id | BIGINT (PK, AI) | รหัสผู้ใช้ / User ID |
| name | VARCHAR(255) | ชื่อ-นามสกุล / Full name |
| email | VARCHAR(255), UNIQUE | อีเมล (ใช้ login) / Email (used for login) |
| password | VARCHAR(255) | รหัสผ่าน (bcrypt hashed) / Password |
| role | VARCHAR(255) | บทบาท: admin, moderator, clinician, fellow, resident, student |
| profile_picture | VARCHAR(255), NULL | เส้นทางรูปโปรไฟล์ / Profile picture path |
| hospital | VARCHAR(255), NULL | โรงพยาบาล / Hospital name |
| province | VARCHAR(255), NULL | จังหวัด / Province |
| line_id | VARCHAR(255), NULL | LINE ID สำหรับติดต่อ / LINE messaging ID |
| email_verified_at | TIMESTAMP, NULL | วันที่ยืนยันอีเมล / Email verified date |
| remember_token | VARCHAR(100), NULL | Token สำหรับ remember me |
| created_at | TIMESTAMP | วันที่สร้าง / Created date |
| updated_at | TIMESTAMP | วันที่แก้ไข / Updated date |

---

### ตาราง specialties (สาขาวิชา)

จัดเก็บสาขาวิชาและสาขาย่อย / Stores specialties with subspecialties.

| คอลัมน์ / Column | ชนิด / Type | คำอธิบาย / Description |
|---|---|---|
| id | UUID (PK) | รหัสสาขา / Specialty ID |
| name | VARCHAR(255) | ชื่อสาขา / Specialty name |
| subspecialties | JSON, NULL | รายการสาขาย่อย / List of subspecialties (JSON array) |
| created_at | TIMESTAMP | วันที่สร้าง / Created date |
| updated_at | TIMESTAMP | วันที่แก้ไข / Updated date |

**ตัวอย่างข้อมูล subspecialties / Example:**
```json
["Cardiology", "Pulmonology", "Nephrology", "Gastroenterology"]
```

---

### ตาราง questions (ข้อสอบ)

จัดเก็บข้อสอบปรนัย / Stores MCQ questions.

| คอลัมน์ / Column | ชนิด / Type | คำอธิบาย / Description |
|---|---|---|
| id | UUID (PK) | รหัสข้อสอบ / Question ID |
| title | VARCHAR(255) | หัวข้อข้อสอบ / Question title |
| stem | TEXT | โจทย์ / Question stem |
| body | TEXT, NULL | เนื้อหาเพิ่มเติม / Additional body/scenario |
| answer_explanation | TEXT, NULL | คำอธิบายคำตอบ / Answer explanation |
| difficulty | INTEGER | ระดับความยาก 1-5 / Difficulty level 1-5 |
| answer | VARCHAR(255) | คำตอบที่ถูก (a-e) / Correct answer |
| choices | JSON | 5 ตัวเลือก / 5 answer choices |
| images | JSON, NULL | เส้นทางรูปภาพ / Image file paths |
| specialty_id | UUID (FK) | รหัสสาขาวิชา → specialties.id |
| subspecialty | VARCHAR(255), NULL | ชื่อสาขาย่อย / Subspecialty name |
| status | VARCHAR(255) | สถานะ: pending, approved, rejected |
| moderation_feedback | TEXT, NULL | ความคิดเห็นผู้ตรวจ / Moderator feedback |
| author_id | BIGINT (FK) | ผู้สร้าง → users.id |
| created_at | TIMESTAMP | วันที่สร้าง / Created date |
| updated_at | TIMESTAMP | วันที่แก้ไข / Updated date |

**ตัวอย่างข้อมูล choices / Example:**
```json
{
  "a": "Acetaminophen",
  "b": "Ibuprofen",
  "c": "Aspirin",
  "d": "Naproxen",
  "e": "Celecoxib"
}
```

**ตัวอย่างข้อมูล images / Example:**
```json
["question_images/abc123_1.jpg", "question_images/abc123_2.png"]
```

---

### ตาราง exams (ชุดข้อสอบ)

จัดเก็บชุดข้อสอบที่สร้าง / Stores created exam sets.

| คอลัมน์ / Column | ชนิด / Type | คำอธิบาย / Description |
|---|---|---|
| id | UUID (PK) | รหัสชุดข้อสอบ / Exam ID |
| title | VARCHAR(255) | ชื่อชุดข้อสอบ / Exam title |
| created_by | BIGINT (FK) | ผู้สร้าง → users.id |
| questions | JSON | รายการ question IDs / Array of question IDs |
| specialty | JSON, NULL | สาขาวิชาที่ใช้กรอง / Filter specialties |
| subspecialty | JSON, NULL | สาขาย่อยที่ใช้กรอง / Filter subspecialties |
| difficulty_level | VARCHAR(255), NULL | ระดับความยากที่กรอง / Difficulty filter |
| difficulty_distribution | JSON, NULL | การกระจายระดับ / Distribution config |
| selection_mode | VARCHAR(255) | โหมดเลือก: random, manual, distribution |
| passing_score | INTEGER | เปอร์เซ็นต์คะแนนผ่าน / Passing percentage |
| created_at | TIMESTAMP | วันที่สร้าง / Created date |
| updated_at | TIMESTAMP | วันที่แก้ไข / Updated date |

**ตัวอย่าง difficulty_distribution / Example:**
```json
{
  "easy": 5,
  "medium": 10,
  "hard": 3,
  "expert": 2
}
```

---

### ตาราง student_exams (ผลสอบนักศึกษา)

จัดเก็บผลการสอบ / Stores exam attempt results.

| คอลัมน์ / Column | ชนิด / Type | คำอธิบาย / Description |
|---|---|---|
| id | UUID (PK) | รหัสการสอบ / Attempt ID |
| exam_id | UUID (FK) | ชุดข้อสอบ → exams.id |
| student_id | BIGINT (FK) | ผู้สอบ → users.id |
| answers | JSON | คำตอบที่เลือก / Selected answers |
| score | DECIMAL | คะแนนเปอร์เซ็นต์ / Score percentage |
| passed | BOOLEAN | ผ่าน/ไม่ผ่าน / Pass/Fail |
| total | INTEGER | จำนวนข้อทั้งหมด / Total questions |
| correct | INTEGER | จำนวนข้อถูก / Correct count |
| passing_score | INTEGER | เกณฑ์ผ่าน / Passing threshold |
| taken_at | TIMESTAMP | วันเวลาที่สอบ / Exam timestamp |
| created_at | TIMESTAMP | วันที่สร้าง / Created date |
| updated_at | TIMESTAMP | วันที่แก้ไข / Updated date |

---

### ตาราง audit_logs (บันทึกการใช้งาน)

จัดเก็บ log การดำเนินการสำคัญ / Stores audit trail of actions.

| คอลัมน์ / Column | ชนิด / Type | คำอธิบาย / Description |
|---|---|---|
| id | UUID (PK) | รหัส log / Log ID |
| entity | VARCHAR(255) | ประเภท entity (question, exam, user) |
| entity_id | VARCHAR(255) | รหัส entity ที่เกี่ยวข้อง / Related entity ID |
| action | VARCHAR(255) | การดำเนินการ (create, update, delete, approve, reject) |
| user_id | BIGINT (FK) | ผู้ดำเนินการ → users.id |
| detail | TEXT, NULL | รายละเอียดเพิ่มเติม / Additional details |
| created_at | TIMESTAMP | วันเวลา / Timestamp |
| updated_at | TIMESTAMP | วันที่แก้ไข / Updated date |

---

### ตาราง personal_access_tokens (Sanctum Tokens)

ตาราง Laravel Sanctum สำหรับ API authentication / Sanctum auth tokens.

| คอลัมน์ / Column | ชนิด / Type | คำอธิบาย / Description |
|---|---|---|
| id | BIGINT (PK, AI) | Token ID |
| tokenable_type | VARCHAR(255) | Model class (App\Models\User) |
| tokenable_id | BIGINT | User ID |
| name | VARCHAR(255) | Token name |
| token | VARCHAR(64), UNIQUE | Hashed token value |
| abilities | TEXT, NULL | Token abilities |
| last_used_at | TIMESTAMP, NULL | Last used timestamp |
| expires_at | TIMESTAMP, NULL | Expiration timestamp |
| created_at | TIMESTAMP | Created date |
| updated_at | TIMESTAMP | Updated date |

---

### ตาราง sessions

ตาราง Laravel session / Laravel session storage.

| คอลัมน์ / Column | ชนิด / Type | คำอธิบาย / Description |
|---|---|---|
| id | VARCHAR(255) (PK) | Session ID |
| user_id | BIGINT, NULL | Associated user ID |
| ip_address | VARCHAR(45), NULL | Client IP |
| user_agent | TEXT, NULL | Browser user agent |
| payload | LONGTEXT | Session data (encrypted) |
| last_activity | INTEGER | Last activity timestamp |

---

## 4.3 ความสัมพันธ์ / Relationships

```
users (1) ──────── (N) questions        [author_id → users.id]
users (1) ──────── (N) exams            [created_by → users.id]
users (1) ──────── (N) student_exams    [student_id → users.id]
users (1) ──────── (N) audit_logs       [user_id → users.id]
specialties (1) ── (N) questions        [specialty_id → specialties.id]
exams (1) ─────── (N) student_exams    [exam_id → exams.id]
```
