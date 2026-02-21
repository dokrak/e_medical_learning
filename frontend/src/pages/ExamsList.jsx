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

  function formatSelectionMode(mode){
    if (!mode) return 'random'
    return mode === 'manual' ? 'manual' : 'random'
  }

  function formatDifficulty(level){
    if (!level) return 'N/A'
    return level.charAt(0).toUpperCase() + level.slice(1)
  }

  function difficultyBadgeStyle(level){
    const key = (level || '').toLowerCase()
    if (key === 'easy') {
      return { background: 'rgba(34,197,94,0.14)', color: '#166534', border: '1px solid rgba(34,197,94,0.35)' }
    }
    if (key === 'medium') {
      return { background: 'rgba(245,158,11,0.16)', color: '#92400e', border: '1px solid rgba(245,158,11,0.35)' }
    }
    if (key === 'difficult') {
      return { background: 'rgba(249,115,22,0.16)', color: '#9a3412', border: '1px solid rgba(249,115,22,0.35)' }
    }
    if (key === 'extreme') {
      return { background: 'rgba(220,38,38,0.14)', color: '#991b1b', border: '1px solid rgba(220,38,38,0.35)' }
    }
    return { background: 'rgba(107,114,128,0.12)', color: '#374151', border: '1px solid rgba(107,114,128,0.35)' }
  }

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
          {(() => {
            const questionCount = ex.questions_count ?? ex.questions?.length ?? ex.numQuestions ?? ex.num_questions ?? 0
            const passingScore = ex.passingScore ?? 50
            const selectionMode = formatSelectionMode(ex.selectionMode)
            const displayDifficulty = ex.computedDifficultyLevel || ex.difficultyLevel
            return (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <strong style={{ fontSize: 18, color: 'var(--brand-green)' }}>{ex.title}</strong>
              
              <div style={{ display: 'flex', gap: 16, marginTop: 8, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 20 }}>📝</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--brand-green)' }}>
                    {questionCount} Questions
                  </span>
                </div>

                {ex.specialty && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 20 }}>🏥</span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#666' }}>
                      {ex.specialty.name}{ex.subspecialty ? ` › ${ex.subspecialty.name}` : ''}
                    </span>
                  </div>
                )}

                {displayDifficulty && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 20 }}>⚡</span>
                    <span style={{ fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 999, letterSpacing: '0.02em', ...difficultyBadgeStyle(displayDifficulty) }}>
                      {formatDifficulty(displayDifficulty)}
                    </span>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: 14, marginTop: 8, flexWrap: 'wrap', fontSize: 12, color: 'var(--muted)' }}>
                <span>Passing score: <strong>{passingScore}%</strong></span>
                <span>Selection: <strong>{selectionMode}</strong></span>
                {(ex.selectedQuestionIds?.length || 0) > 0 && <span>Manual selected: <strong>{ex.selectedQuestionIds.length}</strong></span>}
              </div>

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
            )
          })()}
        </div>
      ))}
      {filteredExams.length === 0 && <div className="small">No exams found</div>}
    </div>
  )
}
