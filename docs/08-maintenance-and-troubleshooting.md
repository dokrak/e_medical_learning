# 8. การบำรุงรักษาและแก้ไขปัญหา / Maintenance & Troubleshooting

---

## 8.1 การสำรองข้อมูล / Backup

### ฐานข้อมูล SQLite / SQLite Database Backup

```bash
# สำรองฐานข้อมูล
cp /var/www/e_medical_learning/backend/laravel-real/database/database.sqlite \
   /backup/medkm_$(date +%Y%m%d_%H%M%S).sqlite

# ตั้ง cron job สำรองรายวัน
# crontab -e
0 2 * * * cp /var/www/e_medical_learning/backend/laravel-real/database/database.sqlite /backup/medkm_$(date +\%Y\%m\%d).sqlite
```

### ฐานข้อมูล MySQL (ถ้าใช้)

```bash
mysqldump -u medkm_user -p med_km > /backup/medkm_$(date +%Y%m%d_%H%M%S).sql
```

### ไฟล์อัปโหลด / Uploaded Files Backup

```bash
# สำรอง storage
tar -czf /backup/medkm_storage_$(date +%Y%m%d).tar.gz \
  /var/www/e_medical_learning/backend/laravel-real/storage/app/
```

### สำรองทั้งระบบ / Full System Backup

```bash
# สำรองทั้ง project (ไม่รวม vendor, node_modules)
tar -czf /backup/medkm_full_$(date +%Y%m%d).tar.gz \
  --exclude='vendor' \
  --exclude='node_modules' \
  --exclude='storage/logs' \
  /var/www/e_medical_learning/
```

---

## 8.2 การบำรุงรักษาปกติ / Routine Maintenance

### รายวัน / Daily

| งาน / Task | คำสั่ง / Command |
|---|---|
| สำรองฐานข้อมูล / Backup DB | ดูหัวข้อ 8.1 |
| ตรวจสอบ disk space | `df -h` |
| ตรวจดู error log | `tail -50 storage/logs/laravel.log` |

### รายสัปดาห์ / Weekly

| งาน / Task | คำสั่ง / Command |
|---|---|
| ล้าง cache | `php artisan cache:clear` |
| ล้าง expired sessions | `php artisan session:gc` |
| ตรวจ audit logs | ตรวจดูผ่าน database |
| ตรวจ server updates | `dnf check-update` |

### รายเดือน / Monthly

| งาน / Task | คำสั่ง / Command |
|---|---|
| อัปเดต OS | `dnf update -y` |
| อัปเดต Composer | `composer update --no-dev` |
| ทดสอบ restore จาก backup | ทดสอบ restore บน test server |
| ทบทวน user accounts | ตรวจดู inactive accounts |

---

## 8.3 การอัปเดตระบบ / System Updates

### อัปเดตจาก Git / Update from Git

```bash
cd /var/www/e_medical_learning

# ดึงโค้ดใหม่
git pull origin main

# อัปเดต Backend
cd backend/laravel-real
composer install --no-dev --optimize-autoloader
php artisan migrate
php artisan cache:clear
php artisan config:clear
php artisan route:clear

# อัปเดต Frontend
cd ../../frontend
npm install
npm run build
cp -r dist/* ../backend/laravel-real/public/build/

# Restart Apache
sudo systemctl restart httpd
```

### Rollback (ย้อนกลับ)

```bash
# ย้อนกลับ Git
git log --oneline -5        # ดู commit history
git checkout <commit-hash>  # ย้อนกลับ

# ย้อนกลับ migration
php artisan migrate:rollback --step=1

# Restore จาก backup
cp /backup/medkm_20260322.sqlite database/database.sqlite
```

---

## 8.4 การแก้ไขปัญหา / Troubleshooting

### ปัญหาที่พบบ่อย / Common Issues

#### 1. หน้าเว็บแสดง 500 Internal Server Error

```bash
# ตรวจ Apache error log
tail -50 /var/log/httpd/error_log

# ตรวจ Laravel error log
tail -50 /var/www/e_medical_learning/backend/laravel-real/storage/logs/laravel.log

# แก้ไขที่พบบ่อย:
# - ตรวจ file permissions
chmod -R 775 storage bootstrap/cache
chown -R apache:apache storage bootstrap/cache

# - ล้าง cache
php artisan cache:clear
php artisan config:clear
```

#### 2. API ส่ง 401 Unauthenticated

```
สาเหตุ: Token หมดอายุหรือไม่ถูกต้อง
แก้ไข: ให้ user login ใหม่เพื่อรับ token ใหม่

Cause: Token expired or invalid
Fix: Have user log in again to get a new token
```

#### 3. ไม่สามารถอัปโหลดรูปภาพ / Cannot Upload Images

```bash
# ตรวจ storage permissions
ls -la storage/app/

# ตรวจ SELinux context
ls -Z storage/app/

# แก้ SELinux
semanage fcontext -a -t httpd_sys_rw_content_t \
  "/var/www/e_medical_learning/backend/laravel-real/storage(/.*)?"
restorecon -Rv storage/

# ตรวจ PHP upload settings
php -i | grep -E "upload_max|post_max"
```

#### 4. รูปภาพไม่แสดง / Images Not Displaying

```bash
# ตรวจว่าไฟล์มีอยู่จริง
ls -la storage/app/question_images/

# ตรวจ storage:link
php artisan storage:link

# ตรวจ SELinux read permission
ls -Z storage/app/question_images/
```

#### 5. Database locked (SQLite)

```
สาเหตุ: หลาย process เขียนพร้อมกัน
แก้ไข: 
1. ตรวจว่าไม่มี process ค้าง: fuser database/database.sqlite
2. พิจารณาเปลี่ยนเป็น MySQL ถ้ามี concurrent users มาก

Cause: Multiple processes writing simultaneously
Fix:
1. Check for stuck processes: fuser database/database.sqlite
2. Consider switching to MySQL for high concurrency
```

#### 6. Frontend build ล้มเหลว / Frontend Build Fails

```bash
# ลบ node_modules และ install ใหม่
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run build

# ตรวจ Node.js version
node -v  # ต้องเป็น 18+
```

#### 7. หน้าเว็บ blank / White screen

```bash
# ตรวจว่า build files อยู่ถูกที่
ls -la backend/laravel-real/public/build/

# ตรวจ vite.config.js base path
grep "base:" frontend/vite.config.js
# ควรเป็น base: '/elearning/'

# ตรวจ browser console
# เปิด Developer Tools → Console ดู error
```

---

## 8.5 Log Files / ไฟล์ Log

| Log | ตำแหน่ง / Location | เนื้อหา / Content |
|---|---|---|
| Laravel App | `storage/logs/laravel.log` | Application errors & debug |
| Apache Error | `/var/log/httpd/error_log` | Web server errors |
| Apache Access | `/var/log/httpd/access_log` | HTTP request log |
| SELinux Audit | `/var/log/audit/audit.log` | SELinux denials |
| System | `/var/log/messages` | General system log |

### การดู Log / View Logs

```bash
# ดู Laravel log สดๆ
tail -f storage/logs/laravel.log

# ค้นหา error ใน Apache log
grep -i error /var/log/httpd/error_log | tail -20

# ค้นหา SELinux denial
ausearch -m avc -ts recent
```

---

## 8.6 ข้อมูลติดต่อ / Contact Information

| รายการ / Item | รายละเอียด / Details |
|---|---|
| ผู้พัฒนา / Developer | นพ. เอกวิทย์ เอี่ยมทองอินทร์ / Dr. Ekkawit Iamthongin |
| หน่วยงาน / Organization | โรงพยาบาลจอมทอง / Chomthong Hospital |
| GitHub | https://github.com/dokrak/e_medical_learning |
