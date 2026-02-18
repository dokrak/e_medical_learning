import React, { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../api'

export default function ExamTake(){
  const { id } = useParams()
  const [exam, setExam] = useState(null)
  const [answers, setAnswers] = useState({})
  const [result, setResult] = useState(null)
  const [msg, setMsg] = useState('')
  const questionRefs = useRef({})

  useEffect(()=>{ load() }, [id])

  function shuffleQuestions(items){
    const arr = Array.isArray(items) ? [...items] : []
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      const temp = arr[i]
      arr[i] = arr[j]
      arr[j] = temp
    }
    return arr
  }

  function prepareExamSession(examData){
    if (!examData) return examData
    return {
      ...examData,
      questions: shuffleQuestions(examData.questions)
    }
  }

  async function load(){
    try{
      const r = await api.get('/exams/' + id)
      setExam(prepareExamSession(r.data))
    }catch(err){
      // fallback to listing exams and find locally
      try{ const r2 = await api.get('/exams'); const ex = r2.data.find(x=>x.id===id); setExam(prepareExamSession(ex)) }catch(e){ setMsg('โหลดข้อสอบไม่สำเร็จ') }
    }
  }

  function setAnswer(qid, val){
    setAnswers(prev=>({ ...prev, [qid]: val }))
  }

  function scrollToQuestion(questionId){
    const el = questionRefs.current[questionId]
    if (el && typeof el.scrollIntoView === 'function') {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  async function submit(e){
    e.preventDefault()
    if (!exam) return

    const unansweredNumbers = exam.questions
      .map((q, index) => {
        const value = (answers[q.id] || '').toString().trim()
        return value ? null : index + 1
      })
      .filter(Boolean)

    if (unansweredNumbers.length > 0) {
      const preview = unansweredNumbers.slice(0, 12).join(', ')
      const moreCount = unansweredNumbers.length > 12 ? ` and ${unansweredNumbers.length - 12} more` : ''
      const proceed = window.confirm(
        `คุณยังตอบไม่ครบ ${unansweredNumbers.length} ข้อ: ${preview}${moreCount ? ` และอีก ${unansweredNumbers.length - 12} ข้อ` : ''}\n\nกด ตกลง เพื่อส่งคำตอบตอนนี้ หรือกด ยกเลิก เพื่อกลับไปตอบให้ครบ`
      )
      if (!proceed) {
        setMsg('ยกเลิกการส่งคำตอบ กรุณากลับไปตอบข้อที่ยังไม่ครบ')
        const firstUnansweredIndex = unansweredNumbers[0] - 1
        const firstUnansweredQuestion = exam.questions[firstUnansweredIndex]
        if (firstUnansweredQuestion?.id) scrollToQuestion(firstUnansweredQuestion.id)
        return
      }
    }

    const payload = { answers: exam.questions.map(q => ({ questionId: q.id, answer: (answers[q.id]||'').toString() })) }
    try{
      const r = await api.post(`/student-exams/${exam.id}/submit`, payload)
      setResult(r.data)
    }catch(err){ setMsg('ส่งข้อสอบไม่สำเร็จ') }
  }

  async function downloadPDF(){
    if (!result || !result.resultId) {
      setMsg('ไม่สามารถดาวน์โหลด PDF ได้ กรุณาติดต่อผู้ดูแลระบบ')
      return
    }
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setMsg('ยังไม่ได้เข้าสู่ระบบ กรุณาเข้าสู่ระบบอีกครั้ง')
        return
      }
      const response = await api.get(`/student-exams/${result.resultId}/pdf`, { responseType: 'blob' })
      
      if (!response.data || response.data.size === 0) {
        setMsg('สร้างไฟล์ PDF ไม่สำเร็จ: ไม่พบข้อมูล')
        return
      }
      
      const url = window.URL.createObjectURL(response.data)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `exam-report-${result.resultId}.pdf`)
      document.body.appendChild(link)
      link.click()
      
      setTimeout(() => {
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      }, 100)
    } catch(err) {
      console.error('PDF download error:', err)
      const errMsg = err.response?.data?.error || err.message || 'ไม่ทราบสาเหตุ'
      setMsg('ดาวน์โหลด PDF ไม่สำเร็จ: ' + errMsg)
    }
  }

  if (!exam) return <div className="card container">กำลังโหลด...</div>

  return (
    <div className="card container">
      <h3>{exam.title}</h3>
      {exam.specialty && <div style={{ color: '#666', marginBottom: 8 }}>{exam.specialty.name}</div>}
      {exam.difficultyLevel && <div className="small" style={{ marginBottom: 6 }}>ระดับความยาก: <strong>{exam.difficultyLevel}</strong></div>}
      {exam.selectionMode && <div className="small" style={{ marginBottom: 6 }}>รูปแบบการเลือกข้อสอบ: <strong>{exam.selectionMode}</strong></div>}
      <div className="small" style={{ marginBottom: 12, padding: 8, background: 'rgba(21,128,61,0.08)', borderRadius: 6, border: '1px solid rgba(21,128,61,0.2)' }}>
        <strong>✓ คะแนนผ่านขั้นต่ำ:</strong> {exam.passingScore || 50}%
      </div>
      <form onSubmit={submit}>
        {exam.questions.map((q, index) => (
          <div key={q.id} ref={el => { questionRefs.current[q.id] = el }} style={{ marginBottom: 12 }}>
            <div><span className="question-order-badge">ข้อที่ {index + 1}</span></div>
            <div style={{ marginTop: 2 }}><strong>{q.title}</strong></div>
            <div>{q.stem}</div>
            {q.images && q.images.length > 0 && (
              <div style={{ marginTop: 8 }}>
                {q.images.map((img, i) => (
                  <div key={i} style={{ marginTop: 6 }}>
                    <img src={img} alt={`question-${q.id}-img-${i}`} className="q-image" />
                  </div>
                ))}
              </div>
            )}
            <div style={{ marginTop: 6 }}>
              {q.choices && q.choices.length>0 ? (
                <div>
                  {q.choices.map((opt, idx) => (
                    <div key={idx}>
                      <label>
                        <input type="radio" name={`opt-${q.id}`} value={opt} checked={(answers[q.id]||'')===opt} onChange={e=>setAnswer(q.id, e.target.value)} /> {opt}
                      </label>
                    </div>
                  ))}
                </div>
              ) : (
                <input placeholder="คำตอบของคุณ" value={answers[q.id]||''} onChange={e=>setAnswer(q.id, e.target.value)} />
              )}
            </div>
          </div>
        ))}
        <div><button className="btn btn-primary">ส่งข้อสอบ</button></div>
      </form>
      {msg && <div>{msg}</div>}
      {result && (
        <div style={{ marginTop: 12, padding: 12, borderRadius: 8, background: result.passed ? 'rgba(16,185,129,0.08)' : 'rgba(220,38,38,0.08)', border: `2px solid ${result.passed ? '#10b981' : '#dc2626'}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: '24px' }}>{result.passed ? '✓' : '✗'}</span>
            <strong style={{ color: result.passed ? '#10b981' : '#dc2626', fontSize: '18px' }}>
              {result.passed ? 'ผ่าน' : 'ไม่ผ่าน'}
            </strong>
          </div>
          <div><strong>คะแนน:</strong> {result.score}% (ตอบถูก {result.correct}/{result.total} ข้อ)</div>
          <div style={{ marginTop: 6 }}>คะแนนผ่านขั้นต่ำ: <strong>{result.passingScore}%</strong></div>
          <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
            <button className="btn btn-primary" onClick={downloadPDF} style={{ flex: 1 }}>📥 ดาวน์โหลดรายงาน PDF</button>
          </div>
        </div>
      )}
    </div>
  )
}
