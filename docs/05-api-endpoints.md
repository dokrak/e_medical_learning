# 5. API Endpoints

---

## 5.1 ภาพรวม / Overview

API ทั้งหมดอยู่ภายใต้ base URL: `https://www.chomthonghosp.com/elearning/api`

All API endpoints are under base URL: `https://www.chomthonghosp.com/elearning/api`

### การยืนยันตัวตน / Authentication

- **Public routes**: ไม่ต้อง token / No token required
- **Protected routes**: ต้องส่ง header `Authorization: Bearer <token>` / Requires Sanctum token

---

## 5.2 Public Routes (ไม่ต้องเข้าสู่ระบบ)

### Authentication

| Method | Endpoint | คำอธิบาย / Description |
|---|---|---|
| POST | `/api/login` | เข้าสู่ระบบ รับ token / Login, returns auth token |
| POST | `/api/register` | ลงทะเบียนผู้ใช้ใหม่ / Register new user |

**POST /api/login**
```json
// Request
{ "email": "user@example.com", "password": "password123" }

// Response 200
{ "user": { "id": 1, "name": "...", "role": "clinician", ... }, "token": "1|abc..." }
```

**POST /api/register**
```json
// Request
{ "name": "Dr. Test", "email": "test@example.com", "password": "password123",
  "password_confirmation": "password123", "role": "student",
  "hospital": "Chomthong Hospital", "province": "Chiang Mai" }

// Response 201
{ "user": { ... }, "token": "2|xyz..." }
```

### Public Data

| Method | Endpoint | คำอธิบาย / Description |
|---|---|---|
| GET | `/api/specialties` | รายการสาขาวิชา (public) / Public specialty list |
| GET | `/api/questions` | ข้อสอบที่อนุมัติแล้ว / Approved questions |
| GET | `/api/platform-stats` | สถิติแพลตฟอร์ม / Platform statistics (counts, hospitals, team) |
| GET | `/api/files/{path}` | เข้าถึงไฟล์ (รูปภาพ) / Serve uploaded files (images) |

---

## 5.3 Protected Routes (ต้องเข้าสู่ระบบ)

### User Profile

| Method | Endpoint | คำอธิบาย / Description |
|---|---|---|
| GET | `/api/user` | ข้อมูลผู้ใช้ปัจจุบัน / Current authenticated user |
| GET | `/api/me` | ข้อมูลผู้ใช้ปัจจุบัน (wrapped) / Current user (wrapped in `{user:...}`) |

### Questions (ข้อสอบ)

| Method | Endpoint | สิทธิ์ / Auth | คำอธิบาย / Description |
|---|---|---|---|
| POST | `/api/questions` | Authenticated | สร้างข้อสอบใหม่ / Create new question |
| GET | `/api/my-questions` | Authenticated | ข้อสอบที่ตนเองสร้าง / Questions by current user |
| GET | `/api/all-questions` | Authenticated | ข้อสอบทั้งหมด / All questions (all statuses) |
| PUT | `/api/questions/{id}` | Authenticated | แก้ไขข้อสอบ / Update question |
| DELETE | `/api/questions/{id}` | Authenticated | ลบข้อสอบ / Delete question |

### Moderation (การตรวจสอบ — Admin/Moderator)

| Method | Endpoint | สิทธิ์ / Auth | คำอธิบาย / Description |
|---|---|---|---|
| GET | `/api/pending-questions` | Admin/Moderator | ข้อสอบรอตรวจ / Pending questions |
| POST | `/api/questions/{id}/approve` | Admin/Moderator | อนุมัติข้อสอบ / Approve question |
| POST | `/api/questions/{id}/reject` | Admin/Moderator | ปฏิเสธข้อสอบ + feedback / Reject with feedback |

**POST /api/questions/{id}/reject**
```json
// Request
{ "moderation_feedback": "Please add more detail to choice explanations" }
```

### Exams (ชุดข้อสอบ)

| Method | Endpoint | สิทธิ์ / Auth | คำอธิบาย / Description |
|---|---|---|---|
| GET | `/api/exams` | Authenticated | รายการชุดข้อสอบทั้งหมด / List all exams |
| GET | `/api/exams/{id}` | Authenticated | รายละเอียดชุดข้อสอบ / Exam details with questions |
| POST | `/api/exams` | Authenticated | สร้างชุดข้อสอบ / Create exam |
| PUT | `/api/exams/{id}` | Authenticated | แก้ไขชุดข้อสอบ / Update exam |
| DELETE | `/api/exams/{id}` | Authenticated | ลบชุดข้อสอบ / Delete exam |

**POST /api/exams**
```json
// Request
{
  "title": "Internal Medicine Final",
  "questions": ["uuid-1", "uuid-2", "uuid-3"],
  "specialty": ["Internal Medicine"],
  "subspecialty": ["Cardiology"],
  "difficulty_level": "3",
  "selection_mode": "manual",
  "passing_score": 60,
  "difficulty_distribution": null
}
```

### Student Exams (การสอบของนักศึกษา)

| Method | Endpoint | สิทธิ์ / Auth | คำอธิบาย / Description |
|---|---|---|---|
| POST | `/api/student-exams/{examId}/submit` | Authenticated | ส่งคำตอบ / Submit exam answers |
| GET | `/api/student-exams` | Authenticated | ผลสอบของตนเอง / Own exam results |
| GET | `/api/all-student-exams` | Authenticated | ผลสอบทั้งหมด / All student results |
| GET | `/api/exam-results/{examId}` | Authenticated | ผลสอบตามชุด / Results by exam |
| GET | `/api/my-stats` | Authenticated | สถิติของตนเอง / Own statistics |
| GET | `/api/student-stats/{studentId}` | Authenticated | สถิติของนักศึกษา / Student's statistics |
| GET | `/api/student-exams/{resultId}/pdf` | Authenticated | ดาวน์โหลด PDF / Download result PDF |

**POST /api/student-exams/{examId}/submit**
```json
// Request
{ "answers": { "uuid-q1": "a", "uuid-q2": "c", "uuid-q3": "b" } }

// Response 200
{
  "id": "uuid-result",
  "score": 66.67,
  "passed": true,
  "correct": 2,
  "total": 3,
  "passing_score": 60,
  "answers": { ... }
}
```

### File Upload (อัปโหลดไฟล์)

| Method | Endpoint | สิทธิ์ / Auth | คำอธิบาย / Description |
|---|---|---|---|
| POST | `/api/upload` | Authenticated | อัปโหลดรูปภาพ / Upload image file |

**POST /api/upload** (multipart/form-data)
```
file: <binary image>
directory: "question_images" | "profile_pictures"
```

### Admin — User Management (จัดการผู้ใช้)

| Method | Endpoint | สิทธิ์ / Auth | คำอธิบาย / Description |
|---|---|---|---|
| GET | `/api/admin/users` | Admin | รายการผู้ใช้ทั้งหมด / List all users |
| POST | `/api/admin/users` | Admin | สร้างผู้ใช้ใหม่ / Create user |
| PUT | `/api/admin/users/{id}` | Admin | แก้ไขผู้ใช้ / Update user |
| DELETE | `/api/admin/users/{id}` | Admin | ลบผู้ใช้ / Delete user |

### Admin — Specialty Management (จัดการสาขาวิชา)

| Method | Endpoint | สิทธิ์ / Auth | คำอธิบาย / Description |
|---|---|---|---|
| GET | `/api/admin/specialties` | Admin | รายการสาขาวิชา (with details) / Specialty list |
| POST | `/api/admin/specialties` | Admin | สร้างสาขาวิชา / Create specialty |
| PUT | `/api/admin/specialties/{id}` | Admin | แก้ไขสาขาวิชา / Update specialty |
| DELETE | `/api/admin/specialties/{id}` | Admin | ลบสาขาวิชา / Delete specialty |

---

## 5.4 HTTP Status Codes

| Code | ความหมาย / Meaning |
|---|---|
| 200 | สำเร็จ / OK |
| 201 | สร้างสำเร็จ / Created |
| 401 | ไม่ได้เข้าสู่ระบบ / Unauthenticated |
| 403 | ไม่มีสิทธิ์ / Forbidden |
| 404 | ไม่พบข้อมูล / Not Found |
| 422 | ข้อมูลไม่ถูกต้อง / Validation Error |
| 500 | ข้อผิดพลาดภายในเซิร์ฟเวอร์ / Server Error |
