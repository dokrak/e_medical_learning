import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'

export default function HomePage(){
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null
  const [stats, setStats] = useState(null)
  
  useEffect(() => {
    if (user?.role === 'student') {
      loadStats()
    }
  }, [user])

  async function loadStats(){
    try {
      const r = await api.get('/my-stats')
      setStats(r.data)
    } catch(e) { /* ignore */ }
  }

  const isStudent = user?.role === 'student'
  const isClinician = user?.role === 'clinician'
  const isAdmin = user?.role === 'admin'
  const isModerator = user?.role === 'moderator'

  const featureCards = [
    {
      icon: '🧠',
      th: 'คลังข้อสอบทางการแพทย์คุณภาพ',
      en: 'High-quality Medical Question Bank'
    },
    {
      icon: '📈',
      th: 'วิเคราะห์ผลการเรียนแบบเรียลไทม์',
      en: 'Real-time Learning Analytics'
    },
    {
      icon: '🩺',
      th: 'เชื่อมโยงการเรียนรู้กับบริบททางคลินิก',
      en: 'Clinically Contextualized Learning'
    },
    {
      icon: '🔒',
      th: 'แพลตฟอร์มปลอดภัยระดับมืออาชีพ',
      en: 'Professional-grade Secure Platform'
    }
  ]

  const rolePanels = {
    student: {
      title: 'เส้นทางผู้เรียน | Learner Path',
      bullets: [
        'ทำข้อสอบและติดตามพัฒนาการของตนเอง | Take exams and track your progress',
        'ดูจุดแข็ง-จุดที่ต้องพัฒนา | Identify strengths and improvement areas',
        'เข้าถึงรายงานผลแบบละเอียด | Access detailed performance reports'
      ],
      actions: [
        { to: '/exams', label: 'เริ่มทำข้อสอบ | Start Exam', primary: true },
        { to: '/student-stats', label: 'ดูสถิติ | View Statistics', primary: false }
      ]
    },
    clinician: {
      title: 'เส้นทางผู้ออกข้อสอบ | Clinician Workflow',
      bullets: [
        'สร้างคำถามคุณภาพสูงพร้อมเหตุผลทางวิชาการ | Create high-quality questions with rationale',
        'ติดตามสถานะการพิจารณาโดยผู้ตรวจ | Track moderation status',
        'จัดการคลังคำถามของตนเองได้สะดวก | Manage your own question bank efficiently'
      ],
      actions: [
        { to: '/upload', label: 'สร้างคำถาม | Create Question', primary: true },
        { to: '/manage', label: 'จัดการรายการ | Manage Items', primary: false }
      ]
    },
    moderator: {
      title: 'เส้นทางผู้ตรวจ | Moderator Workflow',
      bullets: [
        'ตรวจคุณภาพคำถามก่อนเผยแพร่ | Review quality before publication',
        'อนุมัติหรือส่งกลับพร้อมข้อเสนอแนะ | Approve or return with feedback',
        'ช่วยยกระดับมาตรฐานเนื้อหา | Maintain content standards'
      ],
      actions: [
        { to: '/moderator', label: 'คิวตรวจสอบ | Review Queue', primary: true },
        { to: '/clinician-dashboard', label: 'ดูภาพรวม | View Analytics', primary: false }
      ]
    },
    admin: {
      title: 'เส้นทางผู้ดูแลระบบ | Admin Control',
      bullets: [
        'จัดการผู้ใช้งานและสิทธิ์ | Manage users and permissions',
        'ติดตามภาพรวมการใช้งานระบบ | Monitor platform usage',
        'สนับสนุนการเติบโตของชุมชนการเรียนรู้ | Support learning ecosystem growth'
      ],
      actions: [
        { to: '/admin-users', label: 'จัดการผู้ใช้ | Manage Users', primary: true },
        { to: '/clinician-dashboard', label: 'แดชบอร์ด | Dashboard', primary: false }
      ]
    }
  }

  const activeRole = isStudent ? 'student' : isClinician ? 'clinician' : isModerator ? 'moderator' : isAdmin ? 'admin' : null
  const rolePanel = activeRole ? rolePanels[activeRole] : null

  return (
    <div>
      <div
        style={{
          background: 'linear-gradient(140deg, #0f5132 0%, #0f766e 45%, #164e63 100%)',
          padding: '56px 24px',
          borderRadius: 18,
          marginBottom: 28,
          color: '#ffffff',
          position: 'relative',
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.14)'
        }}
      >
        <div style={{ position: 'absolute', top: -26, right: -24, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
        <div style={{ position: 'absolute', bottom: -44, left: -22, width: 190, height: 190, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 900 }}>
          <div style={{ fontSize: 13, fontWeight: 700, opacity: 0.9, letterSpacing: '0.04em', marginBottom: 10 }}>
            CHOMTHONG HOSPITAL · MEDICAL LEARNING PLATFORM
          </div>
          <h1 style={{ fontSize: 40, margin: '0 0 12px 0', fontWeight: 900 }}>
            ยินดีต้อนรับ {user?.name ? `${user.name}` : ''}
            <span style={{ display: 'block', fontSize: 26, fontWeight: 700, opacity: 0.95, marginTop: 6 }}>
              Welcome to Professional Medical Learning
            </span>
          </h1>
          <p style={{ margin: 0, lineHeight: 1.7, fontSize: 16, maxWidth: 760, opacity: 0.96 }}>
            ระบบการเรียนรู้ทางการแพทย์ที่ผสานเทคโนโลยีสมัยใหม่กับมาตรฐานวิชาชีพ เพื่อพัฒนาศักยภาพบุคลากรสุขภาพอย่างต่อเนื่อง
            <br />
            A modern bilingual platform combining medical excellence and technology for continuous professional development.
          </p>
          <div style={{ marginTop: 24, display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {isStudent && <Link to="/exams" className="btn" style={{ background: '#ffffff', color: '#0f5132', fontWeight: 800 }}>เริ่มทำข้อสอบ | Start Exam</Link>}
            {isClinician && <Link to="/upload" className="btn" style={{ background: '#ffffff', color: '#0f5132', fontWeight: 800 }}>สร้างคำถาม | Create Question</Link>}
            {isModerator && <Link to="/moderator" className="btn" style={{ background: '#ffffff', color: '#0f5132', fontWeight: 800 }}>ตรวจสอบคำถาม | Review Queue</Link>}
            {isAdmin && <Link to="/admin-users" className="btn" style={{ background: '#ffffff', color: '#0f5132', fontWeight: 800 }}>จัดการระบบ | Manage System</Link>}
            {!user && <Link to="/login" className="btn" style={{ background: '#ffffff', color: '#0f5132', fontWeight: 800 }}>เข้าสู่ระบบ | Sign In</Link>}
          </div>
        </div>
      </div>

      {isStudent && stats && (
        <div style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 24, marginBottom: 14, color: '#0f5132' }}>ภาพรวมการเรียนรู้ | Learning Snapshot</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
            <div className="card" style={{ borderTop: '5px solid #0f766e', textAlign: 'center' }}>
              <div style={{ fontSize: 30, fontWeight: 900, color: '#0f5132' }}>{stats.attempts.length}</div>
              <div className="small">จำนวนครั้งที่ทำข้อสอบ | Exams Completed</div>
            </div>
            <div className="card" style={{ borderTop: '5px solid #0f766e', textAlign: 'center' }}>
              <div style={{ fontSize: 30, fontWeight: 900, color: '#0f5132' }}>{stats.avgScore}%</div>
              <div className="small">คะแนนเฉลี่ย | Average Score</div>
            </div>
            <div className="card" style={{ borderTop: '5px solid #0f766e', textAlign: 'center' }}>
              <div style={{ fontSize: 30, fontWeight: 900, color: '#0f5132' }}>{stats.bestScore}%</div>
              <div className="small">คะแนนสูงสุด | Best Score</div>
            </div>
            <div className="card" style={{ borderTop: '5px solid #0f766e', textAlign: 'center' }}>
              <div style={{ fontSize: 30, fontWeight: 900, color: stats.improvement > 0 ? 'var(--success)' : 'var(--danger)' }}>{stats.improvement > 0 ? '+' : ''}{stats.improvement}%</div>
              <div className="small">พัฒนาการ | Improvement</div>
            </div>
          </div>
        </div>
      )}

      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 24, marginBottom: 14, color: '#0f5132' }}>จุดเด่นของแพลตฟอร์ม | Platform Highlights</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
          {featureCards.map((feature, index) => (
            <div key={index} className="card" style={{ background: 'linear-gradient(145deg, rgba(15,118,110,0.10), rgba(22,78,99,0.10))', border: '1px solid rgba(15,118,110,0.24)' }}>
              <div style={{ fontSize: 34, marginBottom: 8 }}>{feature.icon}</div>
              <div style={{ fontWeight: 800, color: '#0f5132', marginBottom: 4 }}>{feature.th}</div>
              <div className="small" style={{ color: '#0f766e' }}>{feature.en}</div>
            </div>
          ))}
        </div>
      </div>

      {rolePanel && (
        <div style={{ marginBottom: 28, background: 'linear-gradient(145deg, rgba(15,81,50,0.96), rgba(22,78,99,0.95))', color: '#fff', padding: 24, borderRadius: 14 }}>
          <h2 style={{ margin: '0 0 12px 0', fontSize: 24 }}>{rolePanel.title}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
            <div>
              <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.85 }}>
                {rolePanel.bullets.map((item, index) => <li key={index}>{item}</li>)}
              </ul>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {rolePanel.actions.map((action, index) => (
                <Link
                  key={index}
                  to={action.to}
                  className={`btn ${action.primary ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ textAlign: 'center', justifyContent: 'center', background: action.primary ? '#ffffff' : 'transparent', color: action.primary ? '#0f5132' : '#ffffff', borderColor: action.primary ? '#ffffff' : 'rgba(255,255,255,0.45)' }}
                >
                  {action.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      <div style={{ background: 'linear-gradient(140deg, #0f766e, #164e63)', color: '#fff', borderRadius: 14, padding: 28, textAlign: 'center' }}>
        <h2 style={{ margin: '0 0 8px 0', fontSize: 26 }}>พร้อมพัฒนาทักษะทางการแพทย์ของคุณแล้วหรือยัง?</h2>
        <p style={{ margin: '0 0 18px 0', opacity: 0.95 }}>
          Ready to elevate your medical expertise with a professional bilingual learning experience?
        </p>
        {!user && <Link to="/login" className="btn" style={{ background: '#ffffff', color: '#0f5132', fontWeight: 800 }}>เริ่มต้นใช้งาน | Get Started</Link>}
      </div>
    </div>
  )
}
