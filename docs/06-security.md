# 6. ความปลอดภัย / Security

---

## 6.1 การยืนยันตัวตน / Authentication

### Laravel Sanctum (Token-based API Authentication)

ระบบใช้ Laravel Sanctum สำหรับ API authentication:

- ผู้ใช้เข้าสู่ระบบด้วย email + password ผ่าน `POST /api/login`
- Server สร้าง Personal Access Token และส่งกลับ
- Client เก็บ token ใน `localStorage` และส่ง header `Authorization: Bearer <token>` ทุก request
- Token ถูกเก็บในตาราง `personal_access_tokens` (hashed ด้วย SHA-256)
- ออกจากระบบโดยลบ token ฝั่ง client

### Password Security

- รหัสผ่านถูก hash ด้วย **bcrypt** (Laravel default) ก่อนเก็บในฐานข้อมูล
- ไม่มีการเก็บรหัสผ่าน plain text ในระบบ

---

## 6.2 การควบคุมสิทธิ์การเข้าถึง / Access Control (RBAC)

### Role-Based Access Control

ระบบใช้ RBAC 6 ระดับ (admin, moderator, clinician, fellow, resident, student):

- **Route-level protection**: Routes ที่ต้อง auth อยู่ใน `auth:sanctum` middleware group
- **Controller-level checks**: Controllers ตรวจ role ของ user ก่อนดำเนินการ
- **Frontend guards**: React App.jsx ตรวจ role ก่อนแสดง routes

```php
// ตัวอย่างการตรวจ role ใน Controller
Route::middleware('auth:sanctum')->group(function () {
    // Only authenticated users can access these routes
    Route::get('/admin/users', [AdminUserController::class, 'index']);
});
```

### สิทธิ์ตามหน้าที่ / Permission by Function

| การดำเนินการ / Operation | สิทธิ์ที่ต้องมี / Required Role |
|---|---|
| สร้างข้อสอบ / Create question | admin, moderator, clinician, fellow, resident |
| อนุมัติ/ปฏิเสธข้อสอบ / Approve/reject | admin, moderator |
| สร้างชุดข้อสอบ / Create exam | admin, moderator, clinician |
| จัดการผู้ใช้ / Manage users | admin |
| จัดการสาขาวิชา / Manage specialties | admin |
| ทำข้อสอบ / Take exam | ทุก role / all roles |
| ดูสถิติรวม / View all statistics | admin, moderator, clinician |

---

## 6.3 การป้องกันภัยคุกคาม / Threat Protection

### CSRF Protection

- Laravel มี CSRF middleware ในตัวสำหรับ web routes
- API routes ใช้ token-based auth แทน CSRF

### CORS (Cross-Origin Resource Sharing)

- กำหนดค่าใน `config/cors.php`
- อนุญาต origins, methods, headers ที่กำหนดเท่านั้น

### SQL Injection Prevention

- ใช้ Eloquent ORM ซึ่งใช้ parameterized queries โดยอัตโนมัติ
- ไม่มีการใช้ raw SQL queries โดยตรง

### XSS Prevention

- React escape HTML output โดยอัตโนมัติ
- ไม่ใช้ `dangerouslySetInnerHTML` ในระบบ

### Directory Traversal Prevention

- UploadController ตรวจสอบ path ป้องกันการเข้าถึงไฟล์นอก storage:

```php
// UploadController::serve()
// ตรวจสอบว่า path ไม่มี '..' หรือ absolute path
// จำกัดการเข้าถึงเฉพาะ storage/app/ directory
```

---

## 6.4 การจัดการไฟล์อัปโหลด / File Upload Security

### การตรวจสอบไฟล์ / File Validation

| มาตรการ / Measure | รายละเอียด / Details |
|---|---|
| ประเภทไฟล์ / File types | จำกัดเฉพาะรูปภาพ (jpeg, jpg, png, gif, webp) |
| ขนาดไฟล์ / File size | จำกัดตามค่า PHP `upload_max_filesize` |
| การตั้งชื่อ / Naming | ใช้ชื่อไฟล์ที่สร้างโดยระบบ ป้องกัน path injection |
| การเก็บ / Storage | เก็บใน `storage/app/` ไม่ใช่ public directory โดยตรง |
| การเข้าถึง / Access | เข้าถึงผ่าน `GET /api/files/{path}` ที่ตรวจสอบ path |

### โฟลเดอร์ที่อนุญาต / Allowed Directories

- `question_images/` — รูปภาพประกอบข้อสอบ
- `profile_pictures/` — รูปโปรไฟล์ผู้ใช้

---

## 6.5 ความปลอดภัยระดับเซิร์ฟเวอร์ / Server-Level Security

### SELinux

- SELinux ทำงานในโหมด **Enforcing** บนเซิร์ฟเวอร์ AlmaLinux
- จำกัดการเข้าถึงไฟล์และ process ของ Apache

### Apache Configuration

- ปิดการแสดง directory listing
- จำกัด HTTP methods
- กำหนด headers สำหรับ security

### HTTPS

- ระบบเข้าถึงผ่าน HTTPS เท่านั้น
- SSL/TLS certificate installed

---

## 6.6 การบันทึกและตรวจสอบ / Logging & Auditing

### Audit Log

ระบบบันทึก audit log สำหรับการดำเนินการสำคัญ:

| การดำเนินการ / Action | บันทึก / Logged |
|---|---|
| สร้างข้อสอบ / Create question | ✅ entity=question, action=create |
| แก้ไขข้อสอบ / Update question | ✅ entity=question, action=update |
| ลบข้อสอบ / Delete question | ✅ entity=question, action=delete |
| อนุมัติข้อสอบ / Approve question | ✅ entity=question, action=approve |
| ปฏิเสธข้อสอบ / Reject question | ✅ entity=question, action=reject |
| สร้างชุดข้อสอบ / Create exam | ✅ entity=exam, action=create |
| จัดการผู้ใช้ / Manage users | ✅ entity=user, action=create/update/delete |

### Laravel Logging

- Application log เก็บที่ `storage/logs/laravel.log`
- บันทึก errors, warnings, debug info
- ตั้งค่าระดับ log ใน `.env` (`LOG_LEVEL=debug`)

---

## 6.7 แนวทางปฏิบัติด้านความปลอดภัย / Security Best Practices

1. **เปลี่ยนรหัสผ่านเริ่มต้น** / Change default passwords after installation
2. **อัปเดต dependencies** / Keep Laravel, PHP, and npm packages updated
3. **สำรองข้อมูล** / Regular database backups
4. **ตรวจสอบ audit logs** / Review audit logs periodically
5. **จำกัดการเข้าถึง** / Restrict server access to authorized personnel
6. **ใช้ HTTPS เท่านั้น** / Enforce HTTPS-only access
7. **ตรวจสอบ .env** / Ensure `.env` file is not publicly accessible
8. **ไม่เปิด APP_DEBUG ใน production** / Set `APP_DEBUG=false` in production
