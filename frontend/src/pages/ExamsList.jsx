import React, { useEffect, useState } from 'react'
import api from '../api'
import { useNavigate } from 'react-router-dom'
import { useLang } from '../LangContext'

export default function ExamsList(){
  const [exams, setExams] = useState([])
  const [search, setSearch] = useState('')
  const [title, setTitle] = useState('New exam')
  const [num, setNum] = useState(5)
  const [msg, setMsg] = useState('')
  const nav = useNavigate()
  const { t } = useLang()
  const currentUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null
  const isStaff = currentUser?.role === 'clinician' || currentUser?.role === 'moderator' || currentUser?.role === 'admin' || currentUser?.role === 'fellow'

  async function load(){
    try{ const r = await api.get('/exams'); setExams(r.data.value || r.data) }catch(e){ setMsg(t('elLoadFailed')) }
  }
  useEffect(()=>{ load() }, [])

  async function create(e){
    e.preventDefault()
    try{
      const r = await api.post('/exams', { title, num_questions: num })
      setMsg(t('elExamCreated'))
      load()
    }catch(err){ setMsg(t('elCreateFailed')) }
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
      <h3>{t('elExams')}</h3>
      <div style={{ marginBottom: 12 }}>
        <input
          className="search-box"
          placeholder={t('elSearch')}
          value={search}
          onChange={e=>setSearch(e.target.value)}
        />
      </div>
      <form onSubmit={create} style={{ marginBottom: 12, padding: 12, backgroundColor: '#f0f4ff', borderRadius: 6 }}>
        <div className="small" style={{ marginBottom: 8, fontWeight: 600 }}>{t('elSelfPractice')}</div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <label>{t('elExamName')}</label>
            <input value={title} onChange={e=>setTitle(e.target.value)} placeholder={t('elMyPractice')} style={{ width: '100%' }} />
          </div>
          <div>
            <label>{t('elQuestions')}</label>
            <input type="number" value={num} onChange={e=>setNum(Number(e.target.value))} min={1} max={50} style={{ width: 80 }} />
          </div>
          <button className="btn btn-primary" style={{ marginLeft: 8 }}>{t('elCreate')}</button>
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
                    {ex.questions?.length || 0} {t('elNQuestions')}
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
                {ex.created_at ? `${t('elCreated')} ${new Date(ex.created_at).toLocaleDateString()}` : ''}
              </div>
              
              {ex.difficultyDistribution && (
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
                  {t('elDistribution')} <strong>{Object.entries(ex.difficultyDistribution).map(([k,v])=>`${k}:${v}%`).join(' • ')}</strong>
                </div>
              )}
              {(ex.totalDifficultyScore !== undefined || ex.averageDifficultyScore !== undefined) && (
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
                  {t('elDiffScore')} <strong>{t('elTotal')} {ex.totalDifficultyScore ?? 0}</strong> • <strong>{t('elAvg')} {ex.averageDifficultyScore ?? 0}</strong>
                  {ex.computedDifficultyLevel ? ` • ${ex.computedDifficultyLevel}` : ''}
                </div>
              )}
              {ex.selectionMode && <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>{t('elSelection')} <strong>{ex.selectionMode}</strong> {ex.selectedQuestionIds?.length ? ` — ${ex.selectedQuestionIds.length} ${t('elChosen')}` : ''}</div>}
            </div>
            <div>
              <button className="btn btn-primary" onClick={()=>nav(`/exams/${ex.id}/take`)}>{t('elTakeExam')}</button>
            </div>
          </div>
        </div>
      ))}
      {filteredExams.length === 0 && <div className="small">{t('elNoExams')}</div>}
    </div>
  )
}
