import React, { useEffect, useState } from 'react'
import api from '../api'
import { useNavigate } from 'react-router-dom'

export default function ExamsList(){
  const [exams, setExams] = useState([])
  const [search, setSearch] = useState('')
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

  const filteredExams = exams.filter(ex => {
    const keyword = search.trim().toLowerCase()
    if (!keyword) return true
    const titleText = (ex.title || '').toLowerCase()
    const specialtyText = (ex.specialty?.name || '').toLowerCase()
    const subspecialtyText = (ex.subspecialty?.name || '').toLowerCase()
    const difficultyText = (ex.difficultyLevel || '').toLowerCase()
    return [titleText, specialtyText, subspecialtyText, difficultyText].some(text => text.includes(keyword))
  })

  return (
    <div className="card container">
      <h3>Exams</h3>
      <div style={{ marginBottom: 12 }}>
        <input
          className="search-box"
          placeholder="Search exams by name, specialty, difficulty..."
          value={search}
          onChange={e=>setSearch(e.target.value)}
        />
      </div>
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
      {filteredExams.map(ex => (
        <div key={ex.id} className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <strong style={{ fontSize: 18, color: 'var(--brand-green)' }}>{ex.title}</strong>
              
              {/* Exam Details */}
              <div style={{ display: 'flex', gap: 16, marginTop: 8, flexWrap: 'wrap' }}>
                {/* Number of Questions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 20 }}>📝</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--brand-green)' }}>
                    {ex.questions?.length || 0} Questions
                  </span>
                </div>
                
                {/* Specialty */}
                {ex.specialty && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 20 }}>🏥</span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#666' }}>
                      {ex.specialty.name}{ex.subspecialty ? ` › ${ex.subspecialty.name}` : ''}
                    </span>
                  </div>
                )}
                
                {/* Difficulty Level */}
                {ex.difficultyLevel && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 20 }}>⚡</span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--muted)' }}>
                      {ex.difficultyLevel.charAt(0).toUpperCase() + ex.difficultyLevel.slice(1)}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Additional Details */}
              <div style={{ marginTop: 8, fontSize: 12, color: '#999' }}>
                {ex.created_at ? `Created: ${new Date(ex.created_at).toLocaleDateString()}` : ''}
              </div>
              
              {ex.difficultyDistribution && (
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
                  Distribution: <strong>{Object.entries(ex.difficultyDistribution).map(([k,v])=>`${k}:${v}%`).join(' • ')}</strong>
                </div>
              )}
              {(ex.totalDifficultyScore !== undefined || ex.averageDifficultyScore !== undefined) && (
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
                  Difficulty Score: <strong>Total {ex.totalDifficultyScore ?? 0}</strong> • <strong>Avg {ex.averageDifficultyScore ?? 0}</strong>
                  {ex.computedDifficultyLevel ? ` • ${ex.computedDifficultyLevel}` : ''}
                </div>
              )}
              {ex.selectionMode && <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>Selection: <strong>{ex.selectionMode}</strong> {ex.selectedQuestionIds?.length ? ` — ${ex.selectedQuestionIds.length} chosen` : ''}</div>}
            </div>
            <div>
              <button className="btn btn-primary" onClick={()=>nav(`/exams/${ex.id}/take`)}>Take Exam</button>
            </div>
          </div>
        </div>
      ))}
      {filteredExams.length === 0 && <div className="small">No exams found</div>}
    </div>
  )
}
