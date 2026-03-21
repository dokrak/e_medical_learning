import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'

export default function StudentDashboard(){
  const [num, setNum] = useState(3)
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [result, setResult] = useState(null)
  const [stats, setStats] = useState(null)

  useEffect(()=>{ loadStats() }, [])
  async function loadStats(){
    try{ const r = await api.get('/my-stats'); setStats(r.data); } catch(e){ /* ignore */ }
  }

  async function start(){
    const r = await api.get('/questions?limit=' + num)
    setQuestions(r.data)
    setAnswers({})
    setResult(null)
  }

  function setAnswer(qid, val){
    setAnswers(prev => ({ ...prev, [qid]: val }))
  }

  function submit(){
    let correct = 0
    questions.forEach(q => { if ((answers[q.id] || '').trim().toLowerCase() === (q.answer || '').trim().toLowerCase()) correct += 1 })
    setResult({ correct, total: questions.length, score: Math.round((correct/questions.length)*100) })
  }

  return (
    <div className="card container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>Self practice / Student</h3>
        <div>
          <Link to="/student-stats" className="btn btn-ghost" style={{ marginRight: 8 }}>My progress</Link>
          <Link to="/student-stats" className="btn btn-primary">Full stats</Link>
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

      <div>Number of questions: <input type="number" min={1} max={20} value={num} onChange={e=>setNum(Number(e.target.value))} /></div>
      <div style={{ marginTop: 8 }}><button className="btn btn-primary" onClick={start}>Start self-exam</button></div>
      <div style={{ marginTop: 12 }}>
        {questions.map(q => (
          <div key={q.id} className="card">
            <div><strong>{q.title}</strong> — difficulty {q.difficulty}</div>
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
                <input placeholder="Your answer" value={answers[q.id]||''} onChange={e=>setAnswer(q.id, e.target.value)} />
              )}
            </div>
          </div>
        ))}
      </div>
      {questions.length>0 && <div style={{ marginTop: 8 }}><button className="btn btn-primary" onClick={submit}>Submit</button></div>}
      {result && <div style={{ marginTop: 12 }}>Score: {result.score}% ({result.correct}/{result.total})</div>}
    </div>
  )
}
