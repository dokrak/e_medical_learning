import React, { useEffect, useState } from 'react'
import api from '../api'
import { useNavigate } from 'react-router-dom'

export default function ExamsList(){
  const [exams, setExams] = useState([])
  const [title, setTitle] = useState('New exam')
  const [num, setNum] = useState(5)
  const [msg, setMsg] = useState('')
  const nav = useNavigate()
  const currentUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null
  const isStaff = currentUser?.role !== 'student'

  async function load(){
    try{ const r = await api.get('/exams'); setExams(r.data.value || r.data) }catch(e){ setMsg('Failed to load exams') }
  }
  useEffect(()=>{ load() }, [])

  async function create(e){
    e.preventDefault()
    try{
      const r = await api.post('/exams', { title, num_questions: num })
      setMsg('Exam created')
      load()
    }catch(err){ setMsg('Create failed — ensure you are authenticated') }
  }

  return (
    <div className="card container">
      <h3>Exams</h3>
      <form onSubmit={create} style={{ marginBottom: 12, padding: 12, backgroundColor: '#f0f4ff', borderRadius: 6 }}>
        <div className="small" style={{ marginBottom: 8, fontWeight: 600 }}>กำหนดการสอบด้วยตัวเอง</div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <label>Exam name:</label>
            <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="My practice exam" style={{ width: '100%' }} />
          </div>
          <div>
            <label>Questions:</label>
            <input type="number" value={num} onChange={e=>setNum(Number(e.target.value))} min={1} max={50} style={{ width: 80 }} />
          </div>
          <button className="btn btn-primary" style={{ marginLeft: 8 }}>Create</button>
        </div>
      </form>
      {msg && <div>{msg}</div>}
      {exams.map(ex => (
        <div key={ex.id} className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <strong>{ex.title}</strong>
              <div style={{ fontSize: 12 }}>{ex.created_at ? new Date(ex.created_at).toLocaleString() : ''}</div>
              {ex.specialty && <div style={{ fontSize: 12, color: '#666' }}>{ex.specialty.name}{ex.subspecialty ? ' — ' + ex.subspecialty.name : ''}</div>}
              {ex.difficultyLevel && <div style={{ fontSize: 12, color: 'var(--muted)' }}>Difficulty: <strong>{ex.difficultyLevel}</strong></div>}
              {ex.difficultyDistribution && (
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                  Distribution: <strong>{Object.entries(ex.difficultyDistribution).map(([k,v])=>`${k}:${v}%`).join(' • ')}</strong>
                </div>
              )}
              {ex.selectionMode && <div style={{ fontSize: 12, color: 'var(--muted)' }}>Selection: <strong>{ex.selectionMode}</strong> {ex.selectedQuestionIds?.length ? ` — ${ex.selectedQuestionIds.length} chosen` : ''}</div>}
            </div>
            <div>
              <button className="btn" onClick={()=>nav(`/exams/${ex.id}/take`)}>Take exam</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
