import React, { createContext, useContext, useState } from 'react'

const LangContext = createContext()

const translations = {
  // Navbar
  home: { en: 'Home', th: 'หน้าแรก' },
  createQuestion: { en: 'Create Question', th: 'สร้างคำถาม' },
  takeExam: { en: 'Take Exam', th: 'ทำข้อสอบ' },
  createExam: { en: 'Create Exam', th: 'สร้างชุดข้อสอบ' },
  student: { en: 'Student', th: 'นักศึกษา' },
  manage: { en: 'Manage', th: 'จัดการ' },
  results: { en: 'Results', th: 'ผลสอบ' },
  analytics: { en: 'Analytics', th: 'วิเคราะห์' },
  moderator: { en: 'Moderator', th: 'ผู้ตรวจสอบ' },
  users: { en: 'Users', th: 'ผู้ใช้งาน' },
  logout: { en: 'Logout', th: 'ออกจากระบบ' },
  login: { en: 'Login', th: 'เข้าสู่ระบบ' },
  signedIn: { en: 'Signed in', th: 'เข้าสู่ระบบแล้ว' },

  // Login page
  loginTitle: { en: 'Chomthong Hospital Medical Learning Platform', th: 'ระบบการเรียนรู้ทางการแพทย์ โรงพยาบาลจอมทอง' },
  loginSubtitle: { en: 'Login', th: 'เข้าสู่ระบบ' },
  email: { en: 'Email', th: 'อีเมล' },
  password: { en: 'Password', th: 'รหัสผ่าน' },
  loginBtn: { en: 'Login', th: 'เข้าสู่ระบบ' },
  loginSuccess: { en: 'Logged in — token saved', th: 'เข้าสู่ระบบสำเร็จ' },
  loginFailed: { en: 'Login failed', th: 'เข้าสู่ระบบไม่สำเร็จ' },
  testAccounts: { en: 'Test Accounts', th: 'บัญชีทดสอบ' },

  // Admin User Management
  adminUserMgmt: { en: '👥 Admin User Management', th: '👥 จัดการผู้ใช้งาน' },
  back: { en: 'Back', th: 'กลับ' },
  createNewUser: { en: 'Create New User', th: 'สร้างผู้ใช้ใหม่' },
  editUser: { en: 'Edit User', th: 'แก้ไขผู้ใช้' },
  name: { en: 'Name', th: 'ชื่อ' },
  fullName: { en: 'Full name', th: 'ชื่อ-นามสกุล' },
  passwordOptional: { en: '(leave blank to keep current)', th: '(เว้นว่างไว้หากไม่เปลี่ยน)' },
  hospital: { en: 'Hospital', th: 'โรงพยาบาล' },
  province: { en: 'Province', th: 'จังหวัด' },
  lineId: { en: 'Line ID', th: 'ไลน์ไอดี' },
  role: { en: 'Role', th: 'บทบาท' },
  profilePicture: { en: 'Profile Picture', th: 'รูปโปรไฟล์' },
  maxFileSize: { en: 'Max 5MB. JPEG, PNG, GIF, or WebP.', th: 'สูงสุด 5MB รองรับ JPEG, PNG, GIF, WebP' },
  updateUser: { en: 'Update User', th: 'อัปเดตผู้ใช้' },
  createUser: { en: 'Create User', th: 'สร้างผู้ใช้' },
  cancel: { en: 'Cancel', th: 'ยกเลิก' },
  existingUsers: { en: 'Existing Users', th: 'ผู้ใช้ทั้งหมด' },
  picture: { en: 'Picture', th: 'รูป' },
  actions: { en: 'Actions', th: 'จัดการ' },
  edit: { en: 'Edit', th: 'แก้ไข' },
  delete: { en: 'Delete', th: 'ลบ' },
  confirmDelete: { en: 'Are you sure you want to delete this user?', th: 'คุณต้องการลบผู้ใช้นี้หรือไม่?' },
  userCreated: { en: 'User created successfully', th: 'สร้างผู้ใช้สำเร็จ' },
  userUpdated: { en: 'User updated successfully', th: 'อัปเดตผู้ใช้สำเร็จ' },
  userDeleted: { en: 'User deleted successfully', th: 'ลบผู้ใช้สำเร็จ' },
  userRolesGuide: { en: 'User Roles Guide', th: 'คู่มือบทบาทผู้ใช้' },
  loadingUsers: { en: 'Loading users...', th: 'กำลังโหลดผู้ใช้...' },
  noUsers: { en: 'No users yet. Create one to get started.', th: 'ยังไม่มีผู้ใช้ สร้างผู้ใช้เพื่อเริ่มต้น' },
  required: { en: 'required', th: 'จำเป็น' },
  nameEmailRoleRequired: { en: 'Name, email, and role are required', th: 'ชื่อ อีเมล และบทบาท จำเป็นต้องกรอก' },
  passwordRequired: { en: 'Password is required for new users', th: 'รหัสผ่านจำเป็นสำหรับผู้ใช้ใหม่' },

  // Role labels
  roleStudent: { en: 'Student', th: 'นักศึกษา' },
  roleResident: { en: 'Resident', th: 'แพทย์ประจำบ้าน' },
  roleFellow: { en: 'Fellow', th: 'แพทย์ต่อยอด' },
  roleClinician: { en: 'Clinician (Question Creator)', th: 'อาจารย์แพทย์ (ผู้ออกข้อสอบ)' },
  roleModerator: { en: 'Moderator (Approver)', th: 'ผู้ตรวจสอบ (ผู้อนุมัติ)' },
  roleAdmin: { en: 'Administrator', th: 'ผู้ดูแลระบบ' },

  // Role descriptions
  roleStudentDesc: { en: 'Can take exams and view personal statistics and reports', th: 'ทำข้อสอบและดูสถิติผลการเรียนรู้ส่วนบุคคล' },
  roleResidentDesc: { en: 'Can take exams, create questions, and track progress', th: 'ทำข้อสอบ สร้างคำถาม และติดตามความก้าวหน้า' },
  roleFellowDesc: { en: 'Can take exams, create questions and exams, and track progress', th: 'ทำข้อสอบ สร้างคำถามและชุดข้อสอบ ติดตามความก้าวหน้า' },
  roleClinicianDesc: { en: 'Can create and upload exam questions for moderation', th: 'สร้างและอัปโหลดคำถามเพื่อส่งตรวจสอบ' },
  roleModeratorDesc: { en: 'Can approve or reject questions submitted by clinicians', th: 'อนุมัติหรือส่งกลับคำถามที่ส่งมาจากอาจารย์แพทย์' },
  roleAdminDesc: { en: 'Can manage all users, view analytics, and system settings', th: 'จัดการผู้ใช้ทั้งหมด ดูวิเคราะห์ และตั้งค่าระบบ' },

  // Common
  clickToClose: { en: 'Click anywhere to close', th: 'คลิกที่ใดก็ได้เพื่อปิด' },
  error: { en: 'Error', th: 'ข้อผิดพลาด' },
  failed: { en: 'Failed', th: 'ล้มเหลว' },
  loading: { en: 'Loading...', th: 'กำลังโหลด...' },
  submit: { en: 'Submit', th: 'ส่ง' },
  save: { en: 'Save', th: 'บันทึก' },

  // HomePage - Hero
  heroSubtitle: { en: 'CHOMTHONG HOSPITAL · CENTER OF EXCELLENCE IN MEDICAL EDUCATION', th: 'โรงพยาบาลจอมทอง · ศูนย์ความเป็นเลิศด้านการศึกษาทางการแพทย์' },
  heroWelcome: { en: 'Welcome', th: 'ยินดีต้อนรับ' },
  heroTitle: { en: 'Knowledge Management for Medical Excellence', th: 'การจัดการความรู้เพื่อความเป็นเลิศทางการแพทย์' },
  heroDesc: { en: 'Empowering healthcare professionals through evidence-based learning, continuous assessment, and data-driven professional development — building a culture of excellence at Chomthong Hospital.', th: 'เสริมศักยภาพบุคลากรสุขภาพด้วยการเรียนรู้เชิงประจักษ์ การประเมินอย่างต่อเนื่อง และการพัฒนาวิชาชีพจากข้อมูล — สร้างวัฒนธรรมแห่งความเป็นเลิศ ณ โรงพยาบาลจอมทอง' },
  heroStartExam: { en: 'Start Exam', th: 'เริ่มทำข้อสอบ' },
  heroCreateQ: { en: 'Create Question', th: 'สร้างคำถาม' },
  heroReviewQueue: { en: 'Review Queue', th: 'ตรวจสอบคำถาม' },
  heroManageSystem: { en: 'Manage System', th: 'จัดการระบบ' },
  heroSignIn: { en: 'Sign In', th: 'เข้าสู่ระบบ' },

  // HomePage - KM Metrics
  kmMetricsTitle: { en: 'Knowledge Management Impact', th: 'ผลลัพธ์การจัดการความรู้' },
  kmMetricsDesc: { en: 'Real outcomes from our commitment to continuous medical education', th: 'ผลลัพธ์จริงจากความมุ่งมั่นในการศึกษาทางการแพทย์อย่างต่อเนื่อง' },
  kmQuestionBank: { en: 'Question Bank Items', th: 'คำถามในคลัง' },
  kmExamsCreated: { en: 'Exams Created', th: 'ชุดข้อสอบที่สร้าง' },
  kmActiveUsers: { en: 'Active Learners', th: 'ผู้เรียนที่ใช้งาน' },
  kmSpecialties: { en: 'Medical Specialties', th: 'สาขาเฉพาะทาง' },

  // HomePage - Why Section
  whyTitle: { en: 'Why Chomthong Hospital KM Platform?', th: 'ทำไมต้องเลือกระบบ KM โรงพยาบาลจอมทอง?' },
  whyEvidence: { en: 'Evidence-Based Content', th: 'เนื้อหาอิงหลักฐาน' },
  whyEvidenceDesc: { en: 'Every question undergoes rigorous peer review by experienced clinicians and moderators, ensuring the highest standard of medical accuracy.', th: 'ทุกคำถามผ่านการตรวจสอบอย่างเข้มงวดโดยแพทย์ผู้เชี่ยวชาญและผู้ตรวจสอบ เพื่อมาตรฐานความถูกต้องทางการแพทย์สูงสุด' },
  whyAnalytics: { en: 'Smart Learning Analytics', th: 'การวิเคราะห์การเรียนรู้อัจฉริยะ' },
  whyAnalyticsDesc: { en: 'Track individual progress, identify knowledge gaps, and receive personalized insights to guide your professional development journey.', th: 'ติดตามความก้าวหน้ารายบุคคล ระบุจุดที่ต้องพัฒนา และรับข้อมูลเชิงลึกเพื่อชี้นำเส้นทางการพัฒนาวิชาชีพ' },
  whyMultiRole: { en: 'Multi-Role Collaboration', th: 'ความร่วมมือหลายบทบาท' },
  whyMultiRoleDesc: { en: 'Students, residents, fellows, clinicians, moderators, and administrators work together in a seamless ecosystem of knowledge creation and validation.', th: 'นักศึกษา แพทย์ประจำบ้าน แพทย์ต่อยอด อาจารย์แพทย์ ผู้ตรวจสอบ และผู้ดูแลระบบ ร่วมกันสร้างระบบนิเวศการเรียนรู้อย่างไร้รอยต่อ' },
  whyBilingual: { en: 'Bilingual Thai-English', th: 'สองภาษา ไทย-อังกฤษ' },
  whyBilingualDesc: { en: 'Full Thai and English support throughout the platform, making medical education accessible and comfortable for all team members.', th: 'รองรับภาษาไทยและอังกฤษตลอดทั้งระบบ ทำให้การศึกษาทางการแพทย์เข้าถึงง่ายและสะดวกสบายสำหรับทุกคน' },
  whyContinuous: { en: 'Continuous Quality Improvement', th: 'พัฒนาคุณภาพอย่างต่อเนื่อง' },
  whyContinuousDesc: { en: 'Our KM cycle — Create, Review, Assess, Analyze, Improve — drives ongoing enhancement of both content quality and learner outcomes.', th: 'วงจร KM ของเรา — สร้าง ตรวจสอบ ประเมิน วิเคราะห์ ปรับปรุง — ขับเคลื่อนการพัฒนาคุณภาพเนื้อหาและผลลัพธ์ผู้เรียนอย่างต่อเนื่อง' },
  whySecure: { en: 'Secure & Professional', th: 'ปลอดภัยและเป็นมืออาชีพ' },
  whySecureDesc: { en: 'Enterprise-grade authentication, role-based access control, and audit logging to protect sensitive medical education data.', th: 'ระบบยืนยันตัวตนระดับองค์กร การควบคุมสิทธิ์ตามบทบาท และบันทึกตรวจสอบ เพื่อปกป้องข้อมูลการศึกษาทางการแพทย์' },

  // HomePage - KM Cycle
  kmCycleTitle: { en: 'Our Knowledge Management Cycle', th: 'วงจรการจัดการความรู้ของเรา' },
  kmCycleDesc: { en: 'A systematic approach to building and maintaining medical knowledge excellence', th: 'แนวทางเป็นระบบในการสร้างและรักษาความเป็นเลิศด้านความรู้ทางการแพทย์' },
  kmStep1: { en: 'Create', th: 'สร้าง' },
  kmStep1Desc: { en: 'Clinicians create evidence-based questions with detailed rationale', th: 'อาจารย์แพทย์สร้างคำถามอิงหลักฐานพร้อมเหตุผลโดยละเอียด' },
  kmStep2: { en: 'Review', th: 'ตรวจสอบ' },
  kmStep2Desc: { en: 'Moderators ensure quality, accuracy, and educational value', th: 'ผู้ตรวจสอบดูแลคุณภาพ ความถูกต้อง และคุณค่าทางการศึกษา' },
  kmStep3: { en: 'Assess', th: 'ประเมิน' },
  kmStep3Desc: { en: 'Learners take structured exams to measure competency', th: 'ผู้เรียนทำข้อสอบเชิงโครงสร้างเพื่อวัดสมรรถนะ' },
  kmStep4: { en: 'Analyze', th: 'วิเคราะห์' },
  kmStep4Desc: { en: 'Data-driven insights reveal trends and knowledge gaps', th: 'ข้อมูลเชิงลึกเผยแนวโน้มและจุดที่ต้องเสริมความรู้' },
  kmStep5: { en: 'Improve', th: 'ปรับปรุง' },
  kmStep5Desc: { en: 'Continuous refinement of content and learning strategies', th: 'ปรับปรุงเนื้อหาและกลยุทธ์การเรียนรู้อย่างต่อเนื่อง' },

  // HomePage - Learning Stats
  learningSnapshot: { en: 'Your Learning Dashboard', th: 'แดชบอร์ดการเรียนรู้ของคุณ' },
  examsCompleted: { en: 'Exams Taken', th: 'จำนวนครั้งที่สอบ' },
  avgScore: { en: 'Average Score', th: 'คะแนนเฉลี่ย' },
  bestScore: { en: 'Best Score', th: 'คะแนนสูงสุด' },
  improvement: { en: 'Improvement', th: 'พัฒนาการ' },

  // HomePage - Role Panels
  learnerPath: { en: 'Learner Path', th: 'เส้นทางผู้เรียน' },
  residentPath: { en: 'Resident Path', th: 'เส้นทางแพทย์ประจำบ้าน' },
  fellowPath: { en: 'Fellow Path', th: 'เส้นทางแพทย์ต่อยอด' },
  clinicianWorkflow: { en: 'Clinician Workflow', th: 'เส้นทางผู้ออกข้อสอบ' },
  moderatorWorkflow: { en: 'Moderator Workflow', th: 'เส้นทางผู้ตรวจ' },
  adminControl: { en: 'Admin Control', th: 'เส้นทางผู้ดูแลระบบ' },
  studentBullet1: { en: 'Take exams and track your progress', th: 'ทำข้อสอบและติดตามพัฒนาการของตนเอง' },
  studentBullet2: { en: 'Identify strengths and improvement areas', th: 'ดูจุดแข็ง-จุดที่ต้องพัฒนา' },
  studentBullet3: { en: 'Access detailed performance reports', th: 'เข้าถึงรายงานผลแบบละเอียด' },
  residentBullet1: { en: 'Take exams and track your progress', th: 'ทำข้อสอบและติดตามพัฒนาการ' },
  residentBullet2: { en: 'Create questions for moderation', th: 'สร้างคำถามเพื่อเสนออนุมัติ' },
  residentBullet3: { en: 'Manage your own question bank', th: 'จัดการคำถามของตนเอง' },
  fellowBullet1: { en: 'Take exams and track your progress', th: 'ทำข้อสอบและติดตามพัฒนาการ' },
  fellowBullet2: { en: 'Create questions and exams', th: 'สร้างคำถามและชุดข้อสอบ' },
  fellowBullet3: { en: 'Manage your items', th: 'จัดการคำถามและข้อสอบของตนเอง' },
  clinicianBullet1: { en: 'Create high-quality questions with rationale', th: 'สร้างคำถามคุณภาพสูงพร้อมเหตุผลทางวิชาการ' },
  clinicianBullet2: { en: 'Track moderation status', th: 'ติดตามสถานะการพิจารณาโดยผู้ตรวจ' },
  clinicianBullet3: { en: 'Manage your own question bank efficiently', th: 'จัดการคลังคำถามของตนเองได้สะดวก' },
  moderatorBullet1: { en: 'Review quality before publication', th: 'ตรวจคุณภาพคำถามก่อนเผยแพร่' },
  moderatorBullet2: { en: 'Approve or return with feedback', th: 'อนุมัติหรือส่งกลับพร้อมข้อเสนอแนะ' },
  moderatorBullet3: { en: 'Maintain content standards', th: 'ช่วยยกระดับมาตรฐานเนื้อหา' },
  adminBullet1: { en: 'Manage users and permissions', th: 'จัดการผู้ใช้งานและสิทธิ์' },
  adminBullet2: { en: 'Monitor platform usage', th: 'ติดตามภาพรวมการใช้งานระบบ' },
  adminBullet3: { en: 'Support learning ecosystem growth', th: 'สนับสนุนการเติบโตของชุมชนการเรียนรู้' },
  startExamBtn: { en: 'Start Exam', th: 'เริ่มทำข้อสอบ' },
  viewStats: { en: 'View Statistics', th: 'ดูสถิติ' },
  createQuestionBtn: { en: 'Create Question', th: 'สร้างคำถาม' },
  manageItems: { en: 'Manage Items', th: 'จัดการรายการ' },
  reviewQueue: { en: 'Review Queue', th: 'คิวตรวจสอบ' },
  viewAnalytics: { en: 'View Analytics', th: 'ดูภาพรวม' },
  manageUsersBtn: { en: 'Manage Users', th: 'จัดการผู้ใช้' },
  dashboard: { en: 'Dashboard', th: 'แดชบอร์ด' },

  // HomePage - CTA
  ctaTitle: { en: 'Ready to Elevate Your Medical Expertise?', th: 'พร้อมยกระดับความเชี่ยวชาญทางการแพทย์แล้วหรือยัง?' },
  ctaDesc: { en: 'Join Chomthong Hospital\'s knowledge management community and experience professional medical education at its finest.', th: 'ร่วมเป็นส่วนหนึ่งของชุมชนจัดการความรู้ โรงพยาบาลจอมทอง และสัมผัสการศึกษาทางการแพทย์ระดับมืออาชีพ' },
  ctaGetStarted: { en: 'Get Started', th: 'เริ่มต้นใช้งาน' },

  // HomePage - Network & Team Showcase
  networkTitle: { en: 'Our Hospital Network', th: 'เครือข่ายโรงพยาบาลของเรา' },
  networkDesc: { en: 'Healthcare institutions collaborating on our knowledge management platform', th: 'สถาบันสุขภาพที่ร่วมมือกันบนแพลตฟอร์มจัดการความรู้ของเรา' },
  networkMembers: { en: 'members', th: 'สมาชิก' },
  teamTitle: { en: 'Our Expert Team', th: 'ทีมผู้เชี่ยวชาญของเรา' },
  teamDesc: { en: 'Dedicated healthcare professionals driving knowledge management and medical education excellence', th: 'บุคลากรทางการแพทย์ผู้ทุ่มเทขับเคลื่อนการจัดการความรู้และความเป็นเลิศด้านการศึกษาทางการแพทย์' },
  teamRoleAdmin: { en: 'System Administrator', th: 'ผู้ดูแลระบบ' },
  teamRoleModerator: { en: 'Content Reviewer', th: 'ผู้ตรวจสอบเนื้อหา' },
  teamRoleClinician: { en: 'Question Creator', th: 'ผู้ออกข้อสอบ' },
  teamRoleFellow: { en: 'Fellow · Question Creator', th: 'แพทย์ต่อยอด · ผู้ออกข้อสอบ' },
  communityTitle: { en: 'Learning Community', th: 'ชุมชนการเรียนรู้' },
  communityDesc: { en: 'Our platform brings together learners and educators from multiple roles', th: 'แพลตฟอร์มของเรารวบรวมผู้เรียนและผู้สอนจากหลากหลายบทบาท' },
  networkHospitals: { en: 'hospitals', th: 'โรงพยาบาล' },
  clickToView: { en: 'Click to view details', th: 'คลิกเพื่อดูรายละเอียด' },
  hospitalProvinceDetail: { en: 'Hospital & Province Detail', th: 'รายละเอียดโรงพยาบาลและจังหวัด' },
  noHospitalData: { en: 'No hospital data available', th: 'ไม่มีข้อมูลโรงพยาบาล' },
}

export function LangProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'th')

  function toggleLang() {
    const next = lang === 'en' ? 'th' : 'en'
    setLang(next)
    localStorage.setItem('lang', next)
  }

  function t(key) {
    const entry = translations[key]
    if (!entry) return key
    return entry[lang] || entry['en'] || key
  }

  return (
    <LangContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LangContext.Provider>
  )
}

export function useLang() {
  return useContext(LangContext)
}
