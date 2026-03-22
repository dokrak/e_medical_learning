# 3. ฟีเจอร์ระบบและขั้นตอนการทำงาน / System Features & Workflow

---

## 3.1 การจัดการข้อสอบ / Question Management

### วงจรชีวิตข้อสอบ / Question Lifecycle

```
┌──────────┐     ┌─────────┐     ┌────────────┐     ┌──────────┐
│  สร้าง    │────▶│ รอตรวจ   │────▶│  ตรวจสอบ    │────▶│ อนุมัติ   │
│  Create   │     │ Pending │     │  Moderate  │     │ Approved │
└──────────┘     └─────────┘     └─────┬──────┘     └──────────┘
                                       │
                                       ▼
                                ┌────────────┐     ┌──────────┐
                                │  ปฏิเสธ     │────▶│  แก้ไข    │──┐
                                │  Rejected  │     │ Revision │  │
                                └────────────┘     └──────────┘  │
                                       ▲                         │
                                       └─────────────────────────┘
```

### การสร้างข้อสอบ / Creating a Question

ผู้ใช้ที่มีสิทธิ์ (Admin, Moderator, Clinician, Fellow, Resident) สามารถสร้างข้อสอบผ่านหน้า **Upload Question** โดยกรอกข้อมูล:

Users with permission can create questions via the **Upload Question** page:

| ฟิลด์ / Field | รายละเอียด / Description | ต้องกรอก / Required |
|---|---|---|
| ชื่อข้อสอบ / Title | หัวข้อสั้น ๆ ของข้อสอบ / Short question title | ✅ |
| โจทย์ / Stem | คำถามหลัก / Main question text | ✅ |
| เนื้อหาเพิ่มเติม / Body | ข้อมูลเสริม, case scenario | ❌ |
| สาขาวิชา / Specialty | เลือกจาก dropdown | ✅ |
| สาขาย่อย / Subspecialty | เลือกจาก dropdown (ถ้ามี) | ❌ |
| ระดับความยาก / Difficulty | 1-5 (ง่าย-ยาก / Easy-Hard) | ✅ |
| ตัวเลือก / Choices | 5 ตัวเลือก (a-e) / 5 choices | ✅ |
| คำตอบที่ถูก / Correct Answer | เลือก a-e | ✅ |
| คำอธิบาย / Explanation | อธิบายคำตอบที่ถูก / Answer explanation | ❌ |
| รูปภาพ / Images | อัปโหลดรูปประกอบ (สูงสุด 5 รูป) / Up to 5 images | ❌ |

### การตรวจสอบข้อสอบ / Question Moderation

Moderator และ Admin สามารถ:
- ดูข้อสอบที่รอตรวจ (status = pending)
- **อนุมัติ (Approve)** — ข้อสอบพร้อมใช้ในชุดข้อสอบ
- **ปฏิเสธ (Reject)** — พร้อมความคิดเห็น (moderation_feedback) ส่งกลับผู้สร้าง
- ผู้สร้างแก้ไขและส่งกลับเพื่อตรวจใหม่

### หน้าจัดการข้อสอบ / Manage Questions & Exams Page

หน้า ManageQuestionsExams แสดงข้อมูลในรูปแบบ Accordion 4 กลุ่ม:

1. **คลังข้อสอบ / Question Bank** — ข้อสอบทั้งหมดตามสถานะ (Approved/Pending/Rejected)
2. **ชุดข้อสอบ / Exam Sets** — ชุดข้อสอบที่สร้างแล้ว
3. **สถิติ / Statistics** — จำนวนข้อสอบและชุดข้อสอบ
4. **เครื่องมือ / Tools** — ลิงก์ไปหน้าสร้างข้อสอบ/ชุดข้อสอบ

---

## 3.2 การสร้างชุดข้อสอบ / Exam Builder

### โหมดการสร้าง / Exam Creation Modes

ระบบรองรับ 3 โหมดในการสร้างชุดข้อสอบ:

| โหมด / Mode | คำอธิบาย / Description |
|---|---|
| **สุ่ม / Random** | ระบบสุ่มข้อสอบตามสาขาและจำนวนที่กำหนด / System randomly selects questions by specialty and count |
| **เลือกเอง / Manual** | ผู้สร้างเลือกข้อสอบเองจากคลัง / Creator manually picks questions from the bank |
| **กระจายตามความยาก / Distribution** | กำหนดสัดส่วนความยากในแต่ละระดับ (4 กล่อง: Easy/Medium/Hard/Expert) / Set difficulty distribution across 4 boxes |

### ข้อมูลชุดข้อสอบ / Exam Configuration

| ฟิลด์ / Field | รายละเอียด / Description |
|---|---|
| ชื่อชุดข้อสอบ / Title | ชื่อที่แสดงให้ผู้สอบเห็น |
| สาขาวิชา / Specialty | กรองข้อสอบตามสาขา |
| สาขาย่อย / Subspecialty | กรองเพิ่มเติม (ถ้ามี) |
| ระดับความยาก / Difficulty | กรองตามระดับ |
| จำนวนข้อ / Question Count | จำนวนข้อในชุดข้อสอบ |
| คะแนนผ่าน / Passing Score | เปอร์เซ็นต์ที่ต้องได้ (default 60%) |
| โหมดการเลือก / Selection Mode | random / manual / distribution |

### ขั้นตอนการสร้าง / Exam Building Flow

```
เลือกโหมด ──▶ กำหนดตัวกรอง ──▶ เลือก/สุ่มข้อสอบ ──▶ ตั้งคะแนนผ่าน ──▶ บันทึก
Select Mode    Set Filters       Select/Random        Set Passing       Save
                                 Questions            Score
```

---

## 3.3 การทำข้อสอบ / Exam Taking

### ขั้นตอนการทำข้อสอบ / Exam Flow

```
เลือกข้อสอบ ──▶ เริ่มทำ ──▶ ตอบทีละข้อ ──▶ ส่งคำตอบ ──▶ ดูผล
Select Exam    Start      Answer Each      Submit       View
                          Question         Answers      Results
```

### ฟีเจอร์ขณะทำข้อสอบ / During Exam Features

- แสดงข้อสอบทีละข้อ / One question at a time
- ปุ่ม Previous / Next สำหรับนำทาง / Navigation buttons
- แสดงตัวเลือก 5 ข้อ (radio button) / 5 multiple choices
- แสดงรูปภาพประกอบ (ถ้ามี) / Display images if available
- แสดงความคืบหน้า (ข้อที่ x จาก y) / Progress indicator
- สรุปและยืนยันก่อนส่ง / Summary and confirmation before submit

### การให้คะแนน / Scoring

- ระบบตรวจคำตอบอัตโนมัติเทียบกับเฉลย / Auto-grading against answer key
- คำนวณคะแนน: correct / total × 100 = เปอร์เซ็นต์
- เปรียบเทียบกับคะแนนผ่าน / Compare with passing score
- แสดงผล: ผ่าน (Pass) / ไม่ผ่าน (Fail) พร้อมคะแนนกราฟิก

---

## 3.4 ผลสอบและการวิเคราะห์ / Results & Analytics

### หน้าผลสอบ / Exam Result Page

หลังส่งข้อสอบ แสดงผลทันที:
- คะแนนรวม (เช่น 8/10 = 80%)
- สถานะ ผ่าน/ไม่ผ่าน (Pass/Fail)
- รีวิวทุกข้อ: คำตอบที่เลือก, คำตอบที่ถูก, คำอธิบาย
- รูปภาพประกอบแต่ละข้อ (ถ้ามี)

### Dashboard นักศึกษา / Student Dashboard

- ประวัติการสอบทั้งหมด / All exam history
- คะแนนแต่ละครั้ง / Scores per attempt
- สถิติผ่าน/ไม่ผ่าน / Pass/Fail statistics
- กราฟแนวโน้ม / Trend charts

### Dashboard ผลสอบรวม / Exam Results Dashboard (Admin/Moderator/Clinician)

- ผลสอบของนักศึกษาทุกคน / All students' results
- กรองตามชุดข้อสอบ สาขา / Filter by exam, specialty
- สถิติเฉลี่ย / Average statistics
- อัตราผ่าน/ไม่ผ่าน / Pass/Fail rate

### Dashboard แพทย์ / Clinician Dashboard

- จำนวนข้อสอบที่สร้าง / Questions created count
- จำนวนชุดข้อสอบ / Exams built count
- สถิติข้อสอบตามสถานะ / Question status breakdown
- ข้อสอบที่รอตรวจ / Pending questions

---

## 3.5 ระบบสองภาษา / Bilingual System

### การเปลี่ยนภาษา / Language Switching

- ปุ่ม **EN / TH** บน navigation bar
- เปลี่ยนภาษาทันทีโดยไม่ต้อง reload / Instant switch without reload
- ภาษาจะจำไว้ตลอด session / Language preference persisted in session

### การจัดเก็บคำแปล / Translation Storage

- ใช้ **LangContext.jsx** เก็บคำแปล ~450+ keys
- ครอบคลุมทุก 15 หน้า / Covers all 15 pages
- ใช้ `useLang()` hook และ `t()` function

```jsx
// ตัวอย่างการใช้งาน / Usage example
const { t } = useLang();
<h1>{t('pageTitle')}</h1>
```

---

## 3.6 แผนภาพการไหลของข้อมูล / Data Flow Diagram

### ภาพรวม / Overview Data Flow

```
                    ┌─────────────┐
                    │   ผู้ใช้      │
                    │   User      │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │  React SPA  │
                    │  (Browser)  │
                    └──────┬──────┘
                           │ Axios HTTP
                    ┌──────▼──────┐
                    │  Laravel    │
                    │  API        │
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
       ┌──────────┐ ┌──────────┐ ┌──────────┐
       │ Sanctum  │ │ Eloquent │ │ Storage  │
       │ Auth     │ │ Models   │ │ Files    │
       └──────────┘ └────┬─────┘ └──────────┘
                         │
                  ┌──────▼──────┐
                  │   SQLite    │
                  │   Database  │
                  └─────────────┘
```

### การไหลของข้อสอบ / Question Data Flow

```
ผู้สร้าง (Author)
  │
  ├── POST /api/questions (สร้างข้อสอบใหม่)
  │   └── status = 'pending'
  │
  ▼
ผู้ตรวจ (Moderator)
  │
  ├── GET /api/questions?status=pending (ดูข้อสอบรอตรวจ)
  ├── PUT /api/questions/{id} (อนุมัติ: status='approved')
  └── PUT /api/questions/{id} (ปฏิเสธ: status='rejected' + feedback)
  │
  ▼
ผู้สร้างชุด (Exam Builder)
  │
  ├── GET /api/questions?status=approved (ดูข้อสอบที่อนุมัติ)
  └── POST /api/exams (สร้างชุดข้อสอบพร้อม question IDs)
  │
  ▼
ผู้สอบ (Student)
  │
  ├── GET /api/exams (ดูรายการชุดข้อสอบ)
  ├── GET /api/exams/{id} (ดูรายละเอียดชุดข้อสอบ)
  └── POST /api/student-exams (ส่งคำตอบ รับคะแนน)
```
