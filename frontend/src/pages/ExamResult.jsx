import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../api'

export default function ExamResult(){
  const { resultId } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(()=>{ loadResult() }, [resultId])

  async function loadResult(){
    try {
      setLoading(true)
      const r = await api.get(`/student-exams/${resultId}/pdf`)
      setData(r.data)
    } catch(err) {
      setError('ไม่สามารถโหลดผลสอบได้: ' + (err.response?.data?.error || err.message))
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="card container">กำลังโหลดผลสอบ...</div>
  if (error) return <div className="card container"><div style={{ color: '#dc2626' }}>{error}</div><Link to="/exams" className="btn btn-primary" style={{ marginTop: 12 }}>กลับหน้ารายการข้อสอบ</Link></div>
  if (!data) return null

  const { student, exam, result, breakdown } = data
  const passed = result.passed

  return (
    <div className="card container" id="exam-result-report">
      {/* Print styles */}
      <style>{`
        @media print {
          .navbar, footer, .no-print { display: none !important; }
          body { background: white !important; }
          .card { box-shadow: none !important; border: none !important; }
          #exam-result-report { padding: 0 !important; }
        }
      `}</style>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <h2 style={{ margin: 0, color: '#0f5132' }}>รายงานผลการสอบ</h2>
        <div style={{ color: '#666', marginTop: 4 }}>Exam Result Report</div>
      </div>

      {/* Exam & Student Info */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        <div style={{ padding: 14, background: 'rgba(21,128,61,0.06)', borderRadius: 8, border: '1px solid var(--border)' }}>
          <div className="small" style={{ fontWeight: 600, marginBottom: 6, color: '#666' }}>ข้อมูลข้อสอบ</div>
          <div><strong>{exam.title}</strong></div>
          {exam.specialty && <div style={{ fontSize: 13, color: '#666' }}>{exam.specialty.name}</div>}
          {exam.subspecialty && <div style={{ fontSize: 13, color: '#666' }}>{exam.subspecialty.name}</div>}
        </div>
        <div style={{ padding: 14, background: 'rgba(21,128,61,0.06)', borderRadius: 8, border: '1px solid var(--border)' }}>
          <div className="small" style={{ fontWeight: 600, marginBottom: 6, color: '#666' }}>ข้อมูลผู้สอบ</div>
          <div><strong>{student.name}</strong></div>
          <div style={{ fontSize: 13, color: '#666' }}>{student.email}</div>
          <div style={{ fontSize: 13, color: '#666', marginTop: 4 }}>วันที่สอบ: {new Date(result.taken_at).toLocaleString('th-TH')}</div>
        </div>
      </div>

      {/* Score Summary */}
      <div style={{ padding: 20, borderRadius: 12, marginBottom: 24, textAlign: 'center', background: passed ? 'rgba(16,185,129,0.08)' : 'rgba(220,38,38,0.08)', border: `2px solid ${passed ? '#10b981' : '#dc2626'}` }}>
        <div style={{ fontSize: 48, fontWeight: 800, color: passed ? '#10b981' : '#dc2626' }}>
          {result.score}%
        </div>
        <div style={{ fontSize: 20, fontWeight: 700, color: passed ? '#10b981' : '#dc2626', marginTop: 4 }}>
          {passed ? '✓ ผ่าน (PASSED)' : '✗ ไม่ผ่าน (FAILED)'}
        </div>
        <div style={{ marginTop: 8, color: '#666' }}>
          ตอบถูก {result.correct} จาก {result.total} ข้อ &nbsp;|&nbsp; คะแนนผ่านขั้นต่ำ {result.passingScore}%
        </div>

        {/* Score bar */}
        <div style={{ marginTop: 12, maxWidth: 400, margin: '12px auto 0' }}>
          <div style={{ height: 12, background: '#e5e7eb', borderRadius: 6, overflow: 'hidden', position: 'relative' }}>
            <div style={{ height: '100%', width: `${result.score}%`, background: passed ? '#10b981' : '#dc2626', borderRadius: 6, transition: 'width 0.5s' }} />
            <div style={{ position: 'absolute', top: 0, left: `${result.passingScore}%`, width: 2, height: '100%', background: '#333' }} title={`เกณฑ์ผ่าน ${result.passingScore}%`} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#999', marginTop: 2 }}>
            <span>0%</span>
            <span style={{ position: 'relative', left: `${result.passingScore - 50}%` }}>เกณฑ์ผ่าน {result.passingScore}%</span>
            <span>100%</span>
          </div>
        </div>
      </div>

      {/* Per-question breakdown */}
      <h3 style={{ marginBottom: 12 }}>รายละเอียดคำตอบ</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid var(--border)' }}>
            <th style={{ padding: '10px 8px', textAlign: 'center', width: 50 }}>ข้อ</th>
            <th style={{ padding: '10px 8px', textAlign: 'left' }}>คำถาม</th>
            <th style={{ padding: '10px 8px', textAlign: 'left' }}>คำตอบของคุณ</th>
            <th style={{ padding: '10px 8px', textAlign: 'left' }}>เฉลย</th>
            <th style={{ padding: '10px 8px', textAlign: 'center', width: 60 }}>ผลลัพธ์</th>
          </tr>
        </thead>
        <tbody>
          {breakdown.map(item => (
            <tr key={item.number} style={{ borderBottom: '1px solid var(--border)', background: item.correct ? 'rgba(16,185,129,0.04)' : 'rgba(220,38,38,0.04)' }}>
              <td style={{ padding: '10px 8px', textAlign: 'center', fontWeight: 600 }}>{item.number}</td>
              <td style={{ padding: '10px 8px' }}>{item.title}</td>
              <td style={{ padding: '10px 8px', color: item.correct ? '#10b981' : '#dc2626', fontWeight: 500 }}>{item.yourAnswer || '(ไม่ได้ตอบ)'}</td>
              <td style={{ padding: '10px 8px', fontWeight: 500 }}>{item.correctAnswer}</td>
              <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                {item.correct
                  ? <span style={{ color: '#10b981', fontWeight: 700, fontSize: 18 }}>✓</span>
                  : <span style={{ color: '#dc2626', fontWeight: 700, fontSize: 18 }}>✗</span>
                }
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Summary footer */}
      <div style={{ marginTop: 20, padding: 12, background: '#f8fafc', borderRadius: 8, border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ color: '#10b981', fontWeight: 600 }}>✓ ถูก {result.correct} ข้อ</span>
          &nbsp;&nbsp;
          <span style={{ color: '#dc2626', fontWeight: 600 }}>✗ ผิด {result.total - result.correct} ข้อ</span>
        </div>
        <div style={{ fontWeight: 700, fontSize: 18, color: passed ? '#10b981' : '#dc2626' }}>
          {result.score}%
        </div>
      </div>

      {/* Actions (hidden in print) */}
      <div className="no-print" style={{ marginTop: 20, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button className="btn btn-primary" onClick={() => window.print()} style={{ flex: 1 }}>
          🖨️ พิมพ์รายงาน / Print
        </button>
        <Link to="/exams" className="btn btn-ghost" style={{ flex: 1, textAlign: 'center' }}>
          กลับหน้ารายการข้อสอบ
        </Link>
        <Link to="/student" className="btn btn-ghost" style={{ flex: 1, textAlign: 'center' }}>
          หน้าหลักนักศึกษา
        </Link>
      </div>
    </div>
  )
}
