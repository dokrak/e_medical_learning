import React, { useState, useEffect } from 'react'
import api from '../api'
import { useNavigate } from 'react-router-dom'
import { useLang } from '../LangContext'

export default function ExamBuilder(){
  const navigate = useNavigate()
  const { t } = useLang()
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
  const [dist12, setDist12] = useState(25)
  const [dist3, setDist3] = useState(25)
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
      const qs = (await api.get(`/questions?limit=200${specialtyId && specialtyId !== 'all' ? '&specialtyId='+specialtyId : ''}${subspecialtyId && subspecialtyId !== 'all' ? '&subspecialtyId='+subspecialtyId : ''}`)).data
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
        setMsg(t('ebMaxSelect').replace('{0}', num))
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
      setMsg(t('ebEnterName'))
      return
    }
    if (!specialtyId) {
      setMsg(t('ebSelectSpec'))
      return
    }
    if (!subspecialtyId && specialtyId !== 'all') {
      setMsg(t('ebSelectSubspec'))
      return
    }
    if (num < 1) {
      setMsg(t('ebMinQuestions'))
      return
    }
    if (selectionMode === 'manual' && selectedQuestions.length !== num) {
      setMsg(t('ebSelectExact').replace('{0}', num).replace('{1}', selectedQuestions.length))
      return
    }

    try{
      let payload = { title, specialtyId: specialtyId === 'all' ? null : specialtyId, subspecialtyId: (subspecialtyId === 'all' || specialtyId === 'all') ? null : subspecialtyId, selectionMode, passingScore: Number(passingScore) }
      if (!useDistribution) payload.difficultyLevel = difficultyLevel
      else {
        // normalize distribution so it sums to 100
        const total = dist12 + dist3 + dist4 + dist5
        const normalize = total > 0 ? (v => Math.round((v / total) * 100)) : (v => 0)
        payload.difficultyDistribution = {
          '1-2': normalize(dist12),
          '3': normalize(dist3),
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
      navigate('/manage', { state: { msg: t('elExamCreated'), tab: 'exams' } })
    }catch(err){
      if (err?.response?.status === 401) {
        setMsg(t('ebCreateFailed') + ' Session expired — please log in again using the overlay, then retry.')
        return
      }
      const detailMessage = err?.response?.data?.error || err?.response?.data?.message || err.message || 'Unknown error'
      setMsg(`${t('ebCreateFailed')} ${detailMessage}`)
    }
  }

  return (
    <div className="card container">
      <h3>{t('ebCreateExam')}</h3>
      <form onSubmit={generate}>
        <div><input placeholder={t('ebExamName')} value={title} onChange={e=>setTitle(e.target.value)} required /></div>
        
        <div style={{ marginTop: 8 }}>
          <label>{t('ebSpecialty')}</label>
          <select value={specialtyId} onChange={e=>{ setSpecialtyId(e.target.value); setSubspecialtyId(e.target.value === 'all' ? 'all' : '') }} required>
            <option value="">{t('ebSelectSpecialty')}</option>
            <option value="all">{t('ebAllSpecialties')}</option>
            {specialties.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        <div style={{ marginTop: 8 }}>
          <label>{t('ebSubspecialty')}</label>
          <select value={subspecialtyId} onChange={e=>setSubspecialtyId(e.target.value)} required disabled={specialtyId === 'all'}>
            <option value="">{t('ebSelectSubspecialty')}</option>
            {specialtyId === 'all'
              ? <option value="all" selected>{t('ebAllSubspecialties')}</option>
              : (specialties.find(s=>s.id===specialtyId)?.subspecialties||[]).map((ss, i) => { const val = typeof ss === 'object' ? ss.id : ss; const label = typeof ss === 'object' ? ss.name : ss; return <option key={val || i} value={val}>{label}</option>; })}
            {specialtyId !== 'all' && <option value="all">{t('ebAllSubspecialties')}</option>}
          </select>
        </div>

        <div style={{ marginTop: 8 }}>
          <label>{t('ebPassingScore')}</label>
          <input type="number" min={0} max={100} value={passingScore} onChange={e=>setPassingScore(Number(e.target.value))} required />
          <div className="small" style={{ marginTop: 4 }}>{t('ebPassingScoreHint').replace('{0}', passingScore)}</div>
        </div>
        
        <div className="exam-controls-row">
          <div>
            <label>{t('ebSelectionMode')}</label>
            <div style={{ display: 'flex', gap: 12 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}><input type="radio" name="mode" value="random" checked={selectionMode==='random'} onChange={e=>setSelectionMode('random')} /> {t('ebRandom')}</label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}><input type="radio" name="mode" value="manual" checked={selectionMode==='manual'} onChange={e=>setSelectionMode('manual')} /> {t('ebManual')}</label>
            </div>
          </div>

          <div>
            <label>{t('ebDifficulty')}</label>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <select value={difficultyLevel} onChange={e=>setDifficultyLevel(e.target.value)} disabled={useDistribution} style={{ flex: 1, minWidth: 140 }}>
                <option value="easy">{t('ebEasy')}</option>
                <option value="medium">{t('ebMedium')}</option>
                <option value="difficult">{t('ebDifficult')}</option>
                <option value="extreme">{t('ebExtreme')}</option>
              </select>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}><input type="checkbox" checked={useDistribution} onChange={e=>setUseDistribution(e.target.checked)} style={{ width: 'auto' }} /> {t('ebUseDistribution')}</label>
            </div>
          </div>

          <div>
            <label>{t('ebNumQuestions')}</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button type="button" className="btn" onClick={decrementNum}>-</button>
              <input type="number" min={1} max={50} value={num} onChange={e=>setNum(Number(e.target.value))} style={{ width: 90, minWidth: 60 }} />
              <button type="button" className="btn" onClick={incrementNum}>+</button>
            </div>
          </div>
        </div>

        {useDistribution && (
          <div style={{ marginTop: 8, padding: 12, border: '1px dashed var(--border)', borderRadius: 6 }}>
            <div className="small" style={{ marginBottom: 8 }}>{t('ebDistHint')}</div>
            <div className="exam-dist-row">
              {[
                { label: t('ebLevel12'), val: dist12, set: setDist12, idx: 0 },
                { label: t('ebLevel3'), val: dist3, set: setDist3, idx: 1 },
                { label: t('ebLevel4'), val: dist4, set: setDist4, idx: 2 },
                { label: t('ebLevel5'), val: dist5, set: setDist5, idx: 3 },
              ].map(({ label, val, set, idx }) => {
                const allSetters = [setDist12, setDist3, setDist4, setDist5]
                const allVals = [dist12, dist3, dist4, dist5]
                return (
                  <div key={label}>
                    <label>{label}</label>
                    <select value={val} onChange={e => {
                      const newVal = Number(e.target.value)
                      const remainder = 100 - newVal
                      const otherIdxs = [0,1,2,3].filter(i => i !== idx)
                      const otherSum = otherIdxs.reduce((s, i) => s + allVals[i], 0)
                      set(newVal)
                      if (otherSum === 0) {
                        const each = Math.floor(remainder / otherIdxs.length)
                        otherIdxs.forEach((i, j) => allSetters[i](j === otherIdxs.length - 1 ? remainder - each * (otherIdxs.length - 1) : each))
                      } else {
                        let assigned = 0
                        otherIdxs.forEach((i, j) => {
                          if (j === otherIdxs.length - 1) { allSetters[i](remainder - assigned) }
                          else { const v = Math.round((allVals[i] / otherSum) * remainder); allSetters[i](v); assigned += v }
                        })
                      }
                    }}>
                      <option value={0}>0%</option>
                      <option value={25}>25%</option>
                      <option value={50}>50%</option>
                      <option value={75}>75%</option>
                      <option value={100}>100%</option>
                    </select>
                  </div>
                )
              })}
            </div>
            <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="small" style={{ fontWeight: 700 }}>{t('ebTotal')} {dist12 + dist3 + dist4 + dist5}%</span>
              {dist12 + dist3 + dist4 + dist5 === 100
                ? <span className="badge badge-success" style={{ fontSize: '0.78em' }}>✓</span>
                : <span className="badge badge-danger" style={{ fontSize: '0.78em' }}>≠ 100%</span>}
            </div>
          </div>
        )}

        {selectionMode === 'manual' && (
          <div style={{ marginTop: 12 }}>
            <div style={{ marginBottom: 8 }}>
              <span className="small">{t('ebSelectQHint')}</span>
            </div>
            <div style={{ maxHeight: 320, overflow: 'auto', border: '1px solid var(--border)', borderRadius: 8, padding: 8 }}>
              {availableQuestions.length > 0 && (
                <div className="exam-q-grid" style={{ borderBottom: '1px solid var(--border)', fontWeight: 700 }}>
                  <div>{t('ebSelect')}</div>
                  <div>{t('ebQuestion')}</div>
                  <div className="exam-q-diff-col">{t('ebDifficulty')}</div>
                </div>
              )}
              {availableQuestions.length === 0 && <div className="small">{t('ebNoQuestions')}</div>}
              {[...availableQuestions]
                .sort((a, b) => Number(selectedQuestions.some(x => String(x) === String(b.id))) - Number(selectedQuestions.some(x => String(x) === String(a.id))))
                .map((q, index) => (
                (() => {
                  const isSelected = selectedQuestions.some(x => String(x) === String(q.id))
                  return (
                <div
                  key={q.id}
                  onClick={() => toggleSelect(q.id)}
                  className="exam-q-grid"
                  style={{
                    borderBottom: '1px solid var(--border)',
                    borderLeft: isSelected ? '6px solid var(--brand-green)' : '4px solid transparent',
                    background: isSelected ? 'linear-gradient(90deg, var(--brand-light-green), var(--surface-2))' : 'transparent',
                    boxShadow: isSelected ? '0 8px 20px rgba(21,128,61,0.10)' : 'none',
                    cursor: 'pointer',
                    borderRadius: isSelected ? 8 : 0
                  }}
                >
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, margin: 0, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(q.id)}
                      onClick={e => e.stopPropagation()}
                      style={{ width: 'auto' }}
                    />
                    <span className="small">#{index + 1}</span>
                  </label>
                  <div>
                    <div style={{ fontWeight: 700 }}>{q.title} {isSelected && <span className="badge" style={{ marginLeft: 6, background: 'var(--brand-green)', color: '#fff', border: '1px solid var(--brand-green)' }}>{t('ebSelected')}</span>}</div>
                    <div className="small">{q.stem}</div>
                  </div>
                  <div className="exam-q-diff-col small" style={{ fontWeight: 700 }}>{q.difficulty}</div>
                </div>
                )})()
              ))}
            </div>
            <div className="small" style={{ marginTop: 8 }}>{t('ebSelected')}: {selectedQuestions.length} / {num}</div>
          </div>
        )}

        <div style={{ marginTop: 12 }}><button className="btn btn-primary">{t('ebCreateExamBtn')}</button></div>
      </form>
      <div style={{ marginTop: 12 }}>{msg && <div style={{ padding: 8, backgroundColor: msg.includes('failed') || msg.includes('Please') ? '#ffebee' : '#e8f5e9', borderRadius: 4, color: msg.includes('failed') || msg.includes('Please') ? '#c62828' : '#2e7d32' }}>{msg}</div>}</div>
      <div style={{ marginTop: 12 }}>
        {preview.map(q => (
          <div key={q.id} className="card">
            <strong>{q.title}</strong>
            <div>{q.stem}</div>
            <div style={{ marginTop: 6 }}><em>{t('ebDifficulty')} {q.difficulty}</em></div>
          </div>
        ))}
      </div>
    </div>
  )
}
