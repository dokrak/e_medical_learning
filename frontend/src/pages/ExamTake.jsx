import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../api'

export default function ExamTake(){
  const { id } = useParams()
  const [exam, setExam] = useState(null)
  const [answers, setAnswers] = useState({})
  const [result, setResult] = useState(null)
  const [msg, setMsg] = useState('')

  useEffect(()=>{ load() }, [id])

  async function load(){
    try{
      const r = await api.get('/exams/' + id)
      setExam(r.data)
    }catch(err){
      // fallback to listing exams and find locally
      try{ const r2 = await api.get('/exams'); const ex = r2.data.find(x=>x.id===id); setExam(ex) }catch(e){ setMsg('Failed to load exam') }
    }
  }

  function setAnswer(qid, val){
    setAnswers(prev=>({ ...prev, [qid]: val }))
  }

  async function submit(e){
    e.preventDefault()
    if (!exam) return
    const payload = { answers: exam.questions.map(q => ({ questionId: q.id, answer: (answers[q.id]||'').toString() })) }
    try{
      const r = await api.post(`/student-exams/${exam.id}/submit`, payload)
      setResult(r.data)
    }catch(err){ setMsg('Submit failed') }
  }

  if (!exam) return <div className="card container">Loading...</div>

  return (
    <div className="card container">
      <h3>{exam.title}</h3>
      {exam.specialty && <div style={{ color: '#666', marginBottom: 8 }}>{exam.specialty.name}{exam.subspecialty ? ' — ' + exam.subspecialty.name : ''}</div>}
      {exam.difficultyLevel && <div className="small" style={{ marginBottom: 6 }}>Difficulty: <strong>{exam.difficultyLevel}</strong></div>}
      {exam.selectionMode && <div className="small" style={{ marginBottom: 6 }}>Selection: <strong>{exam.selectionMode}</strong></div>}
      <div className="small" style={{ marginBottom: 12, padding: 8, background: 'rgba(21,128,61,0.08)', borderRadius: 6, border: '1px solid rgba(21,128,61,0.2)' }}>
        <strong>✓ Passing Score:</strong> {exam.passingScore || 50}%
      </div>
      <form onSubmit={submit}>
        {exam.questions.map(q => (
          <div key={q.id} style={{ marginBottom: 12 }}>
            <div><strong>{q.title}</strong></div>
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
                <input placeholder="Your answer" value={answers[q.id]||''} onChange={e=>setAnswer(q.id, e.target.value)} />
              )}
            </div>
          </div>
        ))}
        <div><button className="btn btn-primary">Submit exam</button></div>
      </form>
      {msg && <div>{msg}</div>}
      {result && (
        <div style={{ marginTop: 12, padding: 12, borderRadius: 8, background: result.passed ? 'rgba(16,185,129,0.08)' : 'rgba(220,38,38,0.08)', border: `2px solid ${result.passed ? '#10b981' : '#dc2626'}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: '24px' }}>{result.passed ? '✓' : '✗'}</span>
            <strong style={{ color: result.passed ? '#10b981' : '#dc2626', fontSize: '18px' }}>
              {result.passed ? 'PASSED' : 'FAILED'}
            </strong>
          </div>
          <div><strong>Score:</strong> {result.score}% ({result.correct}/{result.total} correct)</div>
          <div style={{ marginTop: 6 }}>Passing score: <strong>{result.passingScore}%</strong></div>
        </div>
      )}
    </div>
  )
}
