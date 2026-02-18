import React, { useState, useEffect } from 'react'
import api from '../api'
import { useNavigate } from 'react-router-dom'

export default function ExamBuilder(){
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [num, setNum] = useState(5)
  const [passingScore, setPassingScore] = useState(50)
  const [msg, setMsg] = useState('')
  const [preview, setPreview] = useState([])
  const [specialties, setSpecialties] = useState([])
  const [specialtyId, setSpecialtyId] = useState('')
  const [subspecialtyId, setSubspecialtyId] = useState('')
  const [selectionMode, setSelectionMode] = useState('random')
  const [difficultyLevel, setDifficultyLevel] = useState('medium')
  const [useDistribution, setUseDistribution] = useState(false)
  const [dist13, setDist13] = useState(50)
  const [dist4, setDist4] = useState(25)
  const [dist5, setDist5] = useState(25)
  const [availableQuestions, setAvailableQuestions] = useState([])
  const [selectedQuestions, setSelectedQuestions] = useState([])
  const currentUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null

  useEffect(()=>{ loadSpecialties() }, [])
  
  useEffect(()=>{ 
    if (selectionMode === 'manual') loadAvailableQuestions()
  }, [selectionMode, specialtyId, subspecialtyId, difficultyLevel, useDistribution])

  useEffect(() => {
    if (selectionMode !== 'manual') return
    if (selectedQuestions.length <= num) return
    setSelectedQuestions(prev => prev.slice(0, num))
  }, [num, selectionMode, selectedQuestions.length])

  async function loadSpecialties(){
    try{ const r = await api.get('/specialties'); setSpecialties(r.data); } catch(e){ /* ignore */ }
  }

  function difficultyMatch(q){
    const d = Number(q.difficulty || 3)
    if (difficultyLevel === 'easy') return d <= 2
    if (difficultyLevel === 'medium') return d === 3
    if (difficultyLevel === 'difficult') return d === 4
    if (difficultyLevel === 'extreme') return d >= 5
    return true
  }

  async function loadAvailableQuestions(){
    try{
      const qs = (await api.get(`/questions?limit=200${specialtyId ? '&specialtyId='+specialtyId : ''}${subspecialtyId ? '&subspecialtyId='+subspecialtyId : ''}`)).data
      setAvailableQuestions(qs.filter(q => difficultyMatch(q)))
      setSelectedQuestions([])
    }catch(err){ setMsg('Failed to load questions') }
  }

  function toggleSelect(qid){
    setSelectedQuestions(prev => {
      const key = String(qid)
      const hasItem = prev.some(x => String(x) === key)
      if (hasItem) return prev.filter(x => String(x) !== key)
      if (prev.length >= num) {
        setMsg(`You can select up to ${num} questions.`)
        return prev
      }
      return [...prev, qid]
    })
  }

  function decrementNum(){
    setNum(prev => Math.max(1, Number(prev || 1) - 1))
  }

  function incrementNum(){
    setNum(prev => Math.min(50, Number(prev || 1) + 1))
  }

  async function generate(e){
    e.preventDefault()
    setMsg('')
    
    // Validation
    if (!title.trim()) {
      setMsg('Please enter exam name')
      return
    }
    if (!specialtyId) {
      setMsg('Please select specialty')
      return
    }
    if (!subspecialtyId) {
      setMsg('Please select subspecialty')
      return
    }
    if (num < 1) {
      setMsg('Please set number of questions to at least 1')
      return
    }
    if (selectionMode === 'manual' && selectedQuestions.length !== num) {
      setMsg(`Please select exactly ${num} questions (currently selected: ${selectedQuestions.length})`)
      return
    }

    try{
      let payload = { title, specialtyId, subspecialtyId, selectionMode, passingScore: Number(passingScore) }
      if (!useDistribution) payload.difficultyLevel = difficultyLevel
      else {
        // normalize distribution so it sums to 100
        const total = dist13 + dist4 + dist5
        const normalize = total > 0 ? (v => Math.round((v / total) * 100)) : (v => 0)
        payload.difficultyDistribution = {
          '1-3': normalize(dist13),
          '4': normalize(dist4),
          '5': normalize(dist5)
        }
      }

      if (selectionMode === 'random') payload.numQuestions = num
      else payload.selectedQuestionIds = selectedQuestions

      await api.post('/exams', payload)
      setTitle('')
      setSpecialtyId('')
      setSubspecialtyId('')
      setPassingScore(50)
      setPreview([])
      setAvailableQuestions([])
      setSelectedQuestions([])
      navigate('/manage', { state: { msg: 'Exam submitted successfully.', tab: 'exams' } })
    }catch(err){
      const detailMessage = err?.response?.data?.error || err?.response?.data?.message || err.message || 'Unknown error'
      setMsg(`Create exam failed: ${detailMessage}`)
    }
  }

  return (
    <div className="card container">
      <h3>Create Exam</h3>
      <form onSubmit={generate}>
        <div><input placeholder="Name of exam *" value={title} onChange={e=>setTitle(e.target.value)} required /></div>
        
        <div style={{ marginTop: 8 }}>
          <label>Specialty *</label>
          <select value={specialtyId} onChange={e=>{ setSpecialtyId(e.target.value); setSubspecialtyId('') }} required>
            <option value="">-- select major specialty --</option>
            {specialties.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        <div style={{ marginTop: 8 }}>
          <label>Subspecialty *</label>
          <select value={subspecialtyId} onChange={e=>setSubspecialtyId(e.target.value)} required>
            <option value="">-- select subspecialty --</option>
            {(specialties.find(s=>s.id===specialtyId)?.subspecialties||[]).map(ss => <option key={ss.id} value={ss.id}>{ss.name}</option>)}
          </select>
        </div>

        <div style={{ marginTop: 8 }}>
          <label>Passing Score (%) *</label>
          <input type="number" min={0} max={100} value={passingScore} onChange={e=>setPassingScore(Number(e.target.value))} required />
          <div className="small" style={{ marginTop: 4 }}>Students must score at least {passingScore}% to pass</div>
        </div>
        
        <div style={{ marginTop: 12, display: 'flex', gap: 12, alignItems: 'center' }}>
          <div>
            <label>Selection mode:</label>
            <div style={{ display: 'flex', gap: 12 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}><input type="radio" name="mode" value="random" checked={selectionMode==='random'} onChange={e=>setSelectionMode('random')} /> Random</label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}><input type="radio" name="mode" value="manual" checked={selectionMode==='manual'} onChange={e=>setSelectionMode('manual')} /> Manual</label>
            </div>
          </div>

          <div>
            <label>Difficulty:</label>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <select value={difficultyLevel} onChange={e=>setDifficultyLevel(e.target.value)} disabled={useDistribution}>
                <option value="easy">Easy (1-2)</option>
                <option value="medium">Medium (3)</option>
                <option value="difficult">Difficult (4)</option>
                <option value="extreme">Extreme difficult (5)</option>
              </select>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}><input type="checkbox" checked={useDistribution} onChange={e=>setUseDistribution(e.target.checked)} /> Use distribution</label>
            </div>
          </div>

          <div>
            <label>Number of questions:</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button type="button" className="btn" onClick={decrementNum}>-</button>
              <input type="number" min={1} max={50} value={num} onChange={e=>setNum(Number(e.target.value))} style={{ width: 90 }} />
              <button type="button" className="btn" onClick={incrementNum}>+</button>
            </div>
          </div>
        </div>

        {useDistribution && (
          <div style={{ marginTop: 8, padding: 8, border: '1px dashed var(--border)', borderRadius: 6 }}>
            <div className="small">Difficulty distribution (percentages must sum to ~100)</div>
            <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
              <div>
                <label>Levels 1–3</label>
                <input type="number" min={0} max={100} value={dist13} onChange={e=>setDist13(Number(e.target.value))} style={{ width: 80 }} />
              </div>
              <div>
                <label>Level 4</label>
                <input type="number" min={0} max={100} value={dist4} onChange={e=>setDist4(Number(e.target.value))} style={{ width: 80 }} />
              </div>
              <div>
                <label>Level 5</label>
                <input type="number" min={0} max={100} value={dist5} onChange={e=>setDist5(Number(e.target.value))} style={{ width: 80 }} />
              </div>
            </div>
            <div className="small" style={{ marginTop: 6 }}>Total: {dist13 + dist4 + dist5}%</div>
          </div>
        )}

        {selectionMode === 'manual' && (
          <div style={{ marginTop: 12 }}>
            <div style={{ marginBottom: 8 }}>
              <span className="small">Select questions to include in exam. Shows approved questions matching specialty + difficulty filters.</span>
            </div>
            <div style={{ maxHeight: 320, overflow: 'auto', border: '1px solid var(--border)', borderRadius: 8, padding: 8 }}>
              {availableQuestions.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: '84px 1fr 90px', gap: 8, padding: '6px 8px', borderBottom: '1px solid var(--border)', fontWeight: 700 }}>
                  <div>Select</div>
                  <div>Question</div>
                  <div>Difficulty</div>
                </div>
              )}
              {availableQuestions.length === 0 && <div className="small">No questions loaded. Click "Load questions".</div>}
              {[...availableQuestions]
                .sort((a, b) => Number(selectedQuestions.some(x => String(x) === String(b.id))) - Number(selectedQuestions.some(x => String(x) === String(a.id))))
                .map((q, index) => (
                (() => {
                  const isSelected = selectedQuestions.some(x => String(x) === String(q.id))
                  return (
                <div
                  key={q.id}
                  onClick={() => toggleSelect(q.id)}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '84px 1fr 90px',
                    gap: 8,
                    padding: 8,
                    borderBottom: '1px solid var(--border)',
                    borderLeft: isSelected ? '6px solid var(--brand-green)' : '4px solid transparent',
                    background: isSelected ? 'linear-gradient(90deg, var(--brand-light-green), var(--surface-2))' : 'transparent',
                    boxShadow: isSelected ? '0 8px 20px rgba(21,128,61,0.10)' : 'none',
                    cursor: 'pointer',
                    alignItems: 'center',
                    borderRadius: isSelected ? 8 : 0
                  }}
                >
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, margin: 0, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(q.id)}
                      onClick={e => e.stopPropagation()}
                    />
                    <span className="small">#{index + 1}</span>
                  </label>
                  <div>
                    <div style={{ fontWeight: 700 }}>{q.title} {isSelected && <span className="badge" style={{ marginLeft: 6, background: 'var(--brand-green)', color: '#fff', border: '1px solid var(--brand-green)' }}>Selected</span>}</div>
                    <div className="small">{q.stem}</div>
                  </div>
                  <div className="small" style={{ fontWeight: 700 }}>{q.difficulty}</div>
                </div>
                )})()
              ))}
            </div>
            <div className="small" style={{ marginTop: 8 }}>Selected: {selectedQuestions.length} / {num}</div>
          </div>
        )}

        <div style={{ marginTop: 12 }}><button className="btn btn-primary">Create Exam</button></div>
      </form>
      <div style={{ marginTop: 12 }}>{msg && <div style={{ padding: 8, backgroundColor: msg.includes('failed') || msg.includes('Please') ? '#ffebee' : '#e8f5e9', borderRadius: 4, color: msg.includes('failed') || msg.includes('Please') ? '#c62828' : '#2e7d32' }}>{msg}</div>}</div>
      <div style={{ marginTop: 12 }}>
        {preview.map(q => (
          <div key={q.id} className="card">
            <strong>{q.title}</strong>
            <div>{q.stem}</div>
            <div style={{ marginTop: 6 }}><em>Difficulty {q.difficulty}</em></div>
          </div>
        ))}
      </div>
    </div>
  )
}
