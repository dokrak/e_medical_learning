import React, { useEffect, useState } from 'react'
import api, { imgUrl } from '../api'
import { useLang } from '../LangContext'

export default function ModeratorQueue(){
  const [list, setList] = useState([])
  const [msg, setMsg] = useState('')
  const [specialties, setSpecialties] = useState([])
  const { t } = useLang()

  async function load(){
    try{
      const r = await api.get('/pending-questions')
      setList(r.data)
    }catch(err){
      setMsg('Load failed — ensure you are logged in as admin/moderator')
    }
  }

  async function loadSpecialties(){
    try{
      const r = await api.get('/specialties')
      setSpecialties(r.data || [])
    }catch(err){
      setSpecialties([])
    }
  }

  function resolveSpecialtyMeta(question){
    if (question.specialty?.name || question.subspecialty?.name) {
      return {
        specialtyName: question.specialty?.name || 'N/A',
        subspecialtyName: question.subspecialty?.name || ''
      }
    }

    const specialty = specialties.find(s => String(s.id) === String(question.specialtyId))
    const subspecialty = specialty?.subspecialties?.find(ss => typeof ss === 'object' ? String(ss.id) === String(question.subspecialtyId) : String(ss) === String(question.subspecialtyId))
    return {
      specialtyName: specialty?.name || 'N/A',
      subspecialtyName: typeof subspecialty === 'object' ? (subspecialty?.name || '') : (subspecialty || '')
    }
  }

  useEffect(()=>{ load(); loadSpecialties() }, [])

  async function approve(id){
    try{
      await api.post(`/questions/${id}/approve`)
      setMsg(t('modApproved'))
      load()
    }catch(err){ setMsg(t('modApproveFailed')) }
  }

  async function sendBack(id){
    const feedback = window.prompt(t('modFeedback'), '')
    if (feedback === null) return
    try{
      await api.post(`/questions/${id}/reject`, { feedback })
      setMsg(t('modSentBack'))
      load()
    }catch(err){ setMsg(t('modSendBackFailed')) }
  }

  return (
    <div className="card container">
      <h3>{t('modTitle')}</h3>
      {msg && <div>{msg}</div>}
      {list.length===0 ? <div>{t('modNoPending')}</div> : (
        list.map(q => {
          const { specialtyName, subspecialtyName } = resolveSpecialtyMeta(q)
          return (
          <div key={q.id} className="card" style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div style={{ flex: 1 }}>
                <div><strong style={{ fontSize: 16 }}>{q.title}</strong> <span className="small" style={{ color: '#666' }}>{t('modDifficulty')} {q.difficulty}/5</span></div>
                
                <div style={{ marginTop: 8, padding: 8, backgroundColor: '#f5f5f5', borderRadius: 4 }}>
                  <div className="small" style={{ fontWeight: 600, marginBottom: 4 }}>{t('modQuestion')}</div>
                  <div className="small">{q.stem}</div>
                </div>

                <div style={{ marginTop: 8, padding: 8, backgroundColor: '#f5f5f5', borderRadius: 4 }}>
                  <div className="small" style={{ fontWeight: 600, marginBottom: 4 }}>{t('modDetail')}</div>
                  <div className="small">{q.body}</div>
                </div>

                {q.images && q.images.length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    <div className="small" style={{ fontWeight: 600, marginBottom: 4 }}>{t('modImages')}</div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {q.images.map((img, i) => (
                        <img key={i} src={imgUrl(img)} alt={`q-img-${i}`} style={{ maxHeight: 150, maxWidth: 200, borderRadius: 4 }} />
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ marginTop: 8, padding: 8, backgroundColor: '#fffbea', borderRadius: 4, border: '1px solid #ffc107' }}>
                  <div className="small" style={{ fontWeight: 600, marginBottom: 6 }}>{t('modChoices')}</div>
                  {q.choices && q.choices.map((choice, i) => (
                    <div key={i} style={{ marginBottom: 8, display: 'grid', gridTemplateColumns: '24px 1fr auto', alignItems: 'start', columnGap: 10 }}>
                      <input type="radio" disabled checked={choice === q.answer} readOnly style={{ marginTop: 4 }} />
                      <span className="small" style={{ lineHeight: 1.45, wordBreak: 'break-word' }}>{i+1}. {choice}</span>
                      <span>{choice === q.answer && <span className="badge badge-success">✓ {t('mqCorrect')}</span>}</span>
                    </div>
                  ))}
                </div>

                {q.answerExplanation && (
                  <div style={{ marginTop: 8, padding: 8, backgroundColor: '#f0f9ff', borderRadius: 4, border: '1px solid #bae6fd' }}>
                    <div className="small" style={{ fontWeight: 600, marginBottom: 4 }}>{t('modAnswerExpl')}</div>
                    <div className="small">{q.answerExplanation}</div>
                  </div>
                )}

                {q.specialtyId && (
                  <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
                    📌 {t('modSpecialty')} {specialtyName} {subspecialtyName ? ` → ${subspecialtyName}` : ''}
                  </div>
                )}
              </div>

              <div style={{ marginLeft: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button className="btn btn-primary" onClick={()=>approve(q.id)} style={{ whiteSpace: 'nowrap' }}>{t('modApprove')}</button>
                <button className="btn btn-danger" onClick={()=>sendBack(q.id)} style={{ whiteSpace: 'nowrap' }}>{t('modSendBack')}</button>
              </div>
            </div>
          </div>
        )})
      )}
    </div>
  )
}
