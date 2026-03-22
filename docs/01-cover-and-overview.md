# คู่มือระบบสารสนเทศ — Med-KM (Medical Knowledge Management)

# System Manual — Med-KM (Medical Knowledge Management)

---

## ข้อมูลเอกสาร / Document Information

| รายการ / Item | รายละเอียด / Details |
|---|---|
| ชื่อระบบ / System Name | Med-KM — ระบบจัดการความรู้ทางการแพทย์ / Medical Knowledge Management System |
| รหัสเอกสาร / Document ID | MED-KM-MAN-001 |
| เวอร์ชัน / Version | 1.0 |
| วันที่จัดทำ / Date | 22 มีนาคม 2569 / March 22, 2026 |
| ผู้จัดทำ / Author | นพ. เอกวิทย์ เอี่ยมทองอินทร์ / Dr. Ekkawit Iamthongin |
| หน่วยงาน / Organization | โรงพยาบาลจอมทอง / Chomthong Hospital |
| มาตรฐาน / Standard | HAIT (Healthcare Accreditation Institute of Thailand) |
| ระดับความลับ / Classification | เอกสารภายใน / Internal Document |
| สถานะ / Status | อนุมัติใช้งาน / Approved |

---

## ประวัติการเปลี่ยนแปลง / Revision History

| เวอร์ชัน / Ver | วันที่ / Date | ผู้แก้ไข / Modified By | รายละเอียด / Description |
|---|---|---|---|
| 1.0 | 2026-03-22 | Dr. Ekkawit I. | เอกสารฉบับแรก / Initial release |

---

## สารบัญ / Table of Contents

1. [ภาพรวมระบบ / System Overview](#1-ภาพรวมระบบ--system-overview)
2. [สถาปัตยกรรมระบบ / System Architecture](02-architecture-and-roles.md)
3. [บทบาทและสิทธิ์ผู้ใช้ / User Roles & Permissions](02-architecture-and-roles.md)
4. [ฟีเจอร์และขั้นตอนการทำงาน / Features & Workflow](03-features-and-workflow.md)
5. [โครงสร้างฐานข้อมูล / Database Schema](04-database-schema.md)
6. [API Endpoints](05-api-endpoints.md)
7. [ความปลอดภัย / Security](06-security.md)
8. [การติดตั้งและตั้งค่า / Installation & Configuration](07-installation-and-config.md)
9. [การบำรุงรักษาและแก้ไขปัญหา / Maintenance & Troubleshooting](08-maintenance-and-troubleshooting.md)

---

## 1. ภาพรวมระบบ / System Overview

### 1.1 วัตถุประสงค์ / Objectives

ระบบ Med-KM เป็นแพลตฟอร์มการเรียนรู้ทางการแพทย์แบบออนไลน์ ออกแบบมาเพื่อ:

The Med-KM system is an online medical learning platform designed to:

1. **จัดการคลังข้อสอบ / Question Bank Management** — สร้าง ตรวจสอบ และจัดเก็บข้อสอบปรนัยทางการแพทย์อย่างมีระบบ / Create, review, and store medical MCQ questions systematically
2. **สร้างข้อสอบอัตโนมัติ / Automated Exam Generation** — สร้างชุดข้อสอบด้วยระบบสุ่ม กำหนดเอง หรือกระจายตามระดับความยาก / Generate exams via random, manual, or difficulty-distribution modes
3. **ประเมินผลผู้เรียน / Student Assessment** — ให้นักศึกษาแพทย์ทำข้อสอบออนไลน์พร้อมให้คะแนนอัตโนมัติ / Enable students to take exams online with auto-scoring
4. **วิเคราะห์ผลการเรียนรู้ / Learning Analytics** — ติดตามและวิเคราะห์ผลสอบเพื่อพัฒนาการเรียนการสอน / Track and analyze exam results for educational improvement
5. **ตรวจสอบคุณภาพ / Quality Assurance** — ระบบ moderation ตรวจสอบข้อสอบก่อนเผยแพร่ / Moderation workflow ensures question quality before publication
6. **รองรับสองภาษา / Bilingual Support** — รองรับภาษาไทยและอังกฤษ / Full Thai/English interface

### 1.2 ขอบเขตระบบ / System Scope

| ด้าน / Aspect | รายละเอียด / Details |
|---|---|
| กลุ่มผู้ใช้ / Target Users | แพทย์ อาจารย์แพทย์ นักศึกษาแพทย์ แพทย์ประจำบ้าน แพทย์ fellow ผู้ดูแลระบบ / Clinicians, Fellows, Residents, Students, Moderators, Admins |
| ประเภทเนื้อหา / Content Type | ข้อสอบปรนัย (MCQ) 5 ตัวเลือก พร้อมรูปภาพและคำอธิบาย / 5-choice MCQ with images and explanations |
| สาขาวิชา / Specialties | กำหนดได้ตามต้องการ พร้อมสาขาย่อย / Configurable specialties with subspecialties |
| การเข้าถึง / Access | Web application ผ่าน browser (responsive) |
| URL | https://www.chomthonghosp.com/elearning/ |

### 1.3 ข้อมูลทั่วไปของระบบ / General System Information

| รายการ / Item | รายละเอียด / Details |
|---|---|
| ชื่อระบบ / System Name | Med-KM |
| เวอร์ชัน / Version | 1.0 |
| เซิร์ฟเวอร์ / Server | AlmaLinux, Apache 2.4.62 |
| IP Address | 10.0.0.7 (Internal) |
| Domain | www.chomthonghosp.com |
| Base Path | /elearning/ |
| Frontend | React 18.2, Vite 4.4.9 |
| Backend | Laravel 12, PHP 8.2 |
| Database | SQLite (รองรับ MySQL) |
| Authentication | Laravel Sanctum (Token-based) |
| ภาษา / Languages | ไทย (TH), English (EN) |
| Repository | https://github.com/dokrak/e_medical_learning.git |
