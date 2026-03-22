# 7. การติดตั้งและตั้งค่า / Installation & Configuration

---

## 7.1 ความต้องการของระบบ / System Requirements

### เซิร์ฟเวอร์ / Server Requirements

| รายการ / Component | ข้อกำหนดขั้นต่ำ / Minimum | แนะนำ / Recommended |
|---|---|---|
| OS | Linux (RHEL/AlmaLinux/Ubuntu) | AlmaLinux 9.x |
| PHP | 8.2+ | 8.2.30 |
| Web Server | Apache 2.4+ หรือ Nginx | Apache 2.4.62 |
| Node.js | 18+ | 20.x LTS |
| npm | 9+ | 10.x |
| Composer | 2.x | 2.7+ |
| Database | SQLite 3 หรือ MySQL 8 | SQLite 3 |
| RAM | 1 GB | 2 GB+ |
| Disk | 5 GB | 10 GB+ |

### PHP Extensions ที่ต้องการ / Required PHP Extensions

```
php-mbstring
php-xml
php-tokenizer
php-json
php-pdo
php-pdo_sqlite   (สำหรับ SQLite)
php-pdo_mysql    (สำหรับ MySQL)
php-curl
php-openssl
php-fileinfo
php-gd           (สำหรับจัดการรูปภาพ)
```

---

## 7.2 ขั้นตอนการติดตั้ง / Installation Steps

### ขั้นตอนที่ 1: Clone Repository

```bash
cd /var/www
git clone https://github.com/dokrak/e_medical_learning.git
cd e_medical_learning
```

### ขั้นตอนที่ 2: ติดตั้ง Backend

```bash
cd backend/laravel-real

# ติดตั้ง PHP dependencies
composer install --no-dev --optimize-autoloader

# คัดลอกไฟล์ .env
cp .env.example .env

# สร้าง application key
php artisan key:generate

# สร้างฐานข้อมูล SQLite
touch database/database.sqlite

# รัน migrations
php artisan migrate

# สร้าง storage link
php artisan storage:link

# ตั้งค่า permissions
chmod -R 775 storage bootstrap/cache
chown -R apache:apache storage bootstrap/cache
```

### ขั้นตอนที่ 3: ตั้งค่า Backend .env

```env
APP_NAME="Med-KM"
APP_ENV=production
APP_KEY=base64:xxxxxxxxxxxxx    # (สร้างจาก php artisan key:generate)
APP_DEBUG=false
APP_URL=https://www.chomthonghosp.com/elearning

# ฐานข้อมูล (SQLite)
DB_CONNECTION=sqlite
DB_DATABASE=/var/www/e_medical_learning/backend/laravel-real/database/database.sqlite

# หรือใช้ MySQL
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=med_km
# DB_USERNAME=medkm_user
# DB_PASSWORD=secure_password

# Sanctum
SANCTUM_STATEFUL_DOMAINS=www.chomthonghosp.com

# Session
SESSION_DRIVER=database
SESSION_LIFETIME=120

# Logging
LOG_CHANNEL=stack
LOG_LEVEL=error

# File Storage
FILESYSTEM_DISK=local
```

### ขั้นตอนที่ 4: ติดตั้ง Frontend

```bash
cd /var/www/e_medical_learning/frontend

# ติดตั้ง Node.js dependencies
npm install

# ตั้งค่า .env
cp .env.example .env
```

### ขั้นตอนที่ 5: ตั้งค่า Frontend .env

```env
VITE_API_URL=https://www.chomthonghosp.com/elearning/api
```

### ขั้นตอนที่ 6: Build Frontend

```bash
cd /var/www/e_medical_learning/frontend

# Build production
npm run build

# คัดลอกไฟล์ build ไปยัง Laravel public
cp -r dist/* ../backend/laravel-real/public/build/
```

### ขั้นตอนที่ 7: SELinux (ถ้าใช้ AlmaLinux/RHEL)

```bash
# อนุญาต Apache เขียน storage
semanage fcontext -a -t httpd_sys_rw_content_t \
  "/var/www/e_medical_learning/backend/laravel-real/storage(/.*)?"
semanage fcontext -a -t httpd_sys_rw_content_t \
  "/var/www/e_medical_learning/backend/laravel-real/bootstrap/cache(/.*)?"
semanage fcontext -a -t httpd_sys_rw_content_t \
  "/var/www/e_medical_learning/backend/laravel-real/database(/.*)?"
restorecon -Rv /var/www/e_medical_learning/

# อนุญาต Apache เชื่อมต่อ network (ถ้าต้องการ)
setsebool -P httpd_can_network_connect 1
```

---

## 7.3 ตั้งค่า Apache / Apache Configuration

### Virtual Host Configuration

```apache
<VirtualHost *:443>
    ServerName www.chomthonghosp.com
    DocumentRoot /var/www/html

    # Med-KM Laravel App
    Alias /elearning /var/www/e_medical_learning/backend/laravel-real/public

    <Directory /var/www/e_medical_learning/backend/laravel-real/public>
        AllowOverride All
        Require all granted
        Options -Indexes

        # React SPA - route all non-file requests to index.html
        FallbackResource /elearning/index.html
    </Directory>

    # API routes - send to Laravel
    <LocationMatch "^/elearning/api">
        FallbackResource /elearning/index.php
    </LocationMatch>

    # SSL Configuration
    SSLEngine on
    SSLCertificateFile /path/to/cert.pem
    SSLCertificateKeyFile /path/to/key.pem
</VirtualHost>
```

### .htaccess (Laravel public/)

```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteRule ^ index.php [L]
</IfModule>
```

### เปิด Apache modules ที่จำเป็น

```bash
# ตรวจสอบ modules
httpd -M | grep -E "rewrite|ssl|headers"

# เปิด modules (ถ้ายังไม่เปิด)
# แก้ไข /etc/httpd/conf/httpd.conf หรือ /etc/httpd/conf.modules.d/
LoadModule rewrite_module modules/mod_rewrite.so
LoadModule ssl_module modules/mod_ssl.so
LoadModule headers_module modules/mod_headers.so

# Restart Apache
systemctl restart httpd
```

---

## 7.4 สร้างผู้ใช้ Admin เริ่มต้น / Create Initial Admin User

```bash
cd /var/www/e_medical_learning/backend/laravel-real

# ใช้ Laravel Tinker
php artisan tinker
```

```php
// สร้าง Admin user
$user = new \App\Models\User();
$user->name = 'Admin';
$user->email = 'admin@chomthonghosp.com';
$user->password = bcrypt('SecurePassword123!');
$user->role = 'admin';
$user->hospital = 'Chomthong Hospital';
$user->province = 'Chiang Mai';
$user->save();
```

---

## 7.5 การตรวจสอบการติดตั้ง / Installation Verification

หลังติดตั้ง ตรวจสอบดังนี้:

| # | การตรวจสอบ / Check | คำสั่ง / Command | ผลที่คาดหวัง / Expected |
|---|---|---|---|
| 1 | PHP version | `php -v` | 8.2.x |
| 2 | Laravel status | `php artisan about` | แสดงข้อมูลระบบ |
| 3 | Database connection | `php artisan migrate:status` | แสดง migrations ทั้งหมด |
| 4 | Storage permissions | `ls -la storage/` | apache:apache, 775 |
| 5 | Frontend build | `ls public/build/` | มีไฟล์ assets |
| 6 | Web access | เปิด browser ไป URL | แสดงหน้า Home |
| 7 | API health | `curl https://domain/elearning/api/specialties` | JSON response |
| 8 | Login | ทดสอบ login ด้วย admin account | เข้าสู่ระบบสำเร็จ |
