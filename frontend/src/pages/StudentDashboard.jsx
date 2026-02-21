import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'

export default function StudentDashboard(){
  const [num, setNum] = useState(10)
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [result, setResult] = useState(null)
  const [stats, setStats] = useState(null)
  const [specialties, setSpecialties] = useState([])
  const [specialtyId, setSpecialtyId] = useState('all')
  const [subspecialtyId, setSubspecialtyId] = useState('all')
  const questionRefs = useRef({})

  useEffect(()=>{ loadStats(); loadSpecialties() }, [])
  async function loadStats(){
    try{ const r = await api.get('/my-stats'); setStats(r.data); } catch(e){ /* ignore */ }
  }

  async function loadSpecialties(){
    try{
      const r = await api.get('/specialties')
      const normalized = (r.data || []).map(s => ({
        ...s,
        subspecialties: s.subspecialties || s.children || []
      }))
      setSpecialties(normalized)
    }catch(e){ /* ignore */ }
  }

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

  async function start(){
    const params = new URLSearchParams()
    if (specialtyId !== 'all') {
      params.set('specialtyId', specialtyId)
    }
    if (specialtyId !== 'all' && subspecialtyId !== 'all') {
      params.set('subspecialtyId', subspecialtyId)
    }

    const query = params.toString()
    const endpoint = query ? `/questions?${query}` : '/questions'
    const r = await api.get(endpoint)
    const randomized = shuffleQuestions(r.data || [])
    const desiredCount = Math.max(1, Number(num) || 1)
    setQuestions(randomized.slice(0, desiredCount))
    setAnswers({})
    setResult(null)
  }

  function setAnswer(qid, val){
    setAnswers(prev => ({ ...prev, [qid]: val }))
  }

  function submit(){
    if (!questions.length) return

    const unansweredIndexes = questions
      .map((q, index) => ((answers[q.id] || '').toString().trim() ? null : index))
      .filter(index => index !== null)

    if (unansweredIndexes.length > 0) {
      const preview = unansweredIndexes.slice(0, 12).map(i => i + 1).join(', ')
      const more = unansweredIndexes.length > 12 ? ` and ${unansweredIndexes.length - 12} more` : ''
      const warning = `Please complete all answers before submit. Missing questions: ${preview}${more}.`
      window.alert(warning)

      const firstUnanswered = questions[unansweredIndexes[0]]
      const container = firstUnanswered ? questionRefs.current[firstUnanswered.id] : null
      if (container && typeof container.scrollIntoView === 'function') {
        container.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
      const firstInput = container?.querySelector('input[type="radio"], input[type="text"], textarea')
      if (firstInput && typeof firstInput.focus === 'function') {
        firstInput.focus({ preventScroll: true })
      }
      return
    }

    const confirmSubmit = window.confirm('All questions are answered. Submit now?')
    if (!confirmSubmit) return

    let correct = 0
    questions.forEach(q => { if ((answers[q.id] || '').trim().toLowerCase() === (q.answer || '').trim().toLowerCase()) correct += 1 })
    setResult({ correct, total: questions.length, score: Math.round((correct/questions.length)*100) })
  }

  return (
    <div className="card container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>แบบฝึกหัดด้วยตนเอง / Self practice</h3>
        <div>
          <Link to="/student-stats" className="btn btn-ghost" style={{ marginRight: 8 }}>ความก้าวหน้า / My progress</Link>
          <Link to="/student-stats" className="btn btn-primary">สถิติทั้งหมด / Full stats</Link>
        </div>
      </div>

      {stats && (
        <div className="panel" style={{ marginBottom: 12, display: 'flex', gap: 12 }}>
          <div>
            <div className="small">Average score</div>
            <div style={{ fontWeight: 800 }}>{stats.avgScore}%</div>
          </div>
          <div>
            <div className="small">Last score</div>
            <div style={{ fontWeight: 800 }}>{stats.lastScore ?? '-'}</div>
          </div>
          <div>
            <div className="small">Improvement</div>
            <div style={{ fontWeight: 800 }}>{stats.improvement > 0 ? `+${stats.improvement}%` : `${stats.improvement}%`}</div>
          </div>
        </div>
      )}

      <div style={{ margin: '10px 0 10px 0', width: '100%', background: 'linear-gradient(90deg, #0f5132 0%, #0f766e 45%, #164e63 100%)', color: '#fff', padding: '10px 14px', borderRadius: 10, fontWeight: 800, letterSpacing: '0.02em', boxShadow: '0 10px 24px rgba(15,118,110,0.18)' }}>
        แบบทดสอบตนเอง (Self Exam)
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
        <div>
          <label>สาขาหลัก (Specialty)</label>
          <select
            value={specialtyId}
            onChange={e=>{
              setSpecialtyId(e.target.value)
              setSubspecialtyId('all')
            }}
            style={{ width: '100%' }}
          >
            <option value="all">ครอบคลุมทั้งหมด (Comprehensive: ทุกสาขา)</option>
            {specialties.map(s => (
              <option key={s.id} value={String(s.id)}>{s.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label>สาขาย่อย (Subspecialty)</label>
          <select
            value={subspecialtyId}
            onChange={e=>setSubspecialtyId(e.target.value)}
            style={{ width: '100%' }}
            disabled={specialtyId === 'all'}
          >
            <option value="all">ครอบคลุมในสาขาหลัก (Comprehensive)</option>
            {(specialties.find(s => String(s.id) === String(specialtyId))?.subspecialties || []).map(ss => (
              <option key={ss.id} value={String(ss.id)}>{ss.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="small" style={{ marginBottom: 8, color: 'var(--muted)' }}>
        รูปแบบ: สาขาหลัก/สาขาย่อย = ใช้ทุกข้อในสาขาย่อยนั้น; สาขาหลัก/ครอบคลุม = ใช้ทุกข้อในสาขาหลักนั้น; ครอบคลุม/ครอบคลุม = ใช้ทุกข้อทุกสาขา (เรียงแบบสุ่ม)
      </div>

      <div style={{ marginBottom: 8 }}>
        <label>จำนวนข้อสอบ (Number of questions)</label>
        <input
          type="number"
          min={1}
          max={200}
          value={num}
          onChange={e=>setNum(Number(e.target.value))}
          style={{ marginLeft: 8, width: 90 }}
        />
      </div>

      <div style={{ marginTop: 8 }}><button className="btn btn-primary" onClick={start}>เริ่มแบบทดสอบ (Start self-exam)</button></div>
      <div style={{ marginTop: 12 }}>
        {questions.map(q => (
          <div key={q.id} ref={el => { questionRefs.current[q.id] = el }} className="card">
            <div><strong>{q.title}</strong> — ระดับความยาก {q.difficulty}</div>
            <div style={{ marginTop: 6 }}>{q.stem}</div>
            <div style={{ marginTop: 6 }}>
              {q.choices && q.choices.length>0 ? (
                q.choices.map((opt, idx) => (
                  <div key={idx}>
                    <label>
                      <input type="radio" name={`self-${q.id}`} value={opt} checked={(answers[q.id]||'')===opt} onChange={e=>setAnswer(q.id, e.target.value)} /> {opt}
                    </label>
                  </div>
                ))
              ) : (
                <input placeholder="คำตอบของคุณ (Your answer)" value={answers[q.id]||''} onChange={e=>setAnswer(q.id, e.target.value)} />
              )}
            </div>
          </div>
        ))}
      </div>
      {questions.length>0 && <div style={{ marginTop: 8 }}><button className="btn btn-primary" onClick={submit}>ส่งคำตอบ (Submit)</button></div>}
      {result && <div style={{ marginTop: 12 }}>คะแนน (Score): {result.score}% ({result.correct}/{result.total})</div>}
    </div>
  )
}
