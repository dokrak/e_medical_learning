import React, { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api, { imgUrl } from '../api'
import { useLang } from '../LangContext'

export default function ExamTake(){
  const { id } = useParams()
  const navigate = useNavigate()
  const [exam, setExam] = useState(null)
  const [answers, setAnswers] = useState({})
  const [msg, setMsg] = useState('')
  const [unansweredIds, setUnansweredIds] = useState([])
  const questionRefs = useRef({})
  const { t } = useLang()

  useEffect(()=>{ load() }, [id])

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

  function prepareExamSession(examData){
    if (!examData) return examData
    return {
      ...examData,
      questions: shuffleQuestions(examData.questions)
    }
  }

  async function load(){
    try{
      const r = await api.get('/exams/' + id)
      setExam(prepareExamSession(r.data))
    }catch(err){
      // fallback to listing exams and find locally
      try{ const r2 = await api.get('/exams'); const ex = r2.data.find(x=>x.id===id); setExam(prepareExamSession(ex)) }catch(e){ setMsg(t('etLoadFailed')) }
    }
  }

  function setAnswer(qid, val){
    setAnswers(prev=>({ ...prev, [qid]: val }))
    setUnansweredIds(prev => prev.filter(id => id !== qid))
    setMsg('')
  }

  function scrollToQuestion(questionId){
    const el = questionRefs.current[questionId]
    if (el && typeof el.scrollIntoView === 'function') {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  async function submit(e){
    e.preventDefault()
    if (!exam) return

    const unanswered = exam.questions.filter(q => answers[q.id] == null)

    if (unanswered.length > 0) {
      setUnansweredIds(unanswered.map(q => q.id))
      const nums = unanswered.map(q => exam.questions.indexOf(q) + 1)
      const preview = nums.slice(0, 12).join(', ')
      const more = nums.length > 12 ? t('etAndMore').replace('{0}', nums.length - 12) : ''
      setMsg(t('etUnanswered').replace('{0}', unanswered.length).replace('{1}', preview) + more)
      scrollToQuestion(unanswered[0].id)
      return
    }
    setUnansweredIds([])

    const payload = { answers: exam.questions.map(q => {
      const idx = answers[q.id]
      return { questionId: q.id, answer: idx != null && q.choices && q.choices[idx] != null ? q.choices[idx] : (answers[q.id]||'').toString(), answerIndex: idx != null ? idx : -1 }
    }) }
    try{
      const r = await api.post(`/student-exams/${exam.id}/submit`, payload)
      navigate(`/exam-result/${r.data.resultId}`)
    }catch(err){ setMsg(t('etSubmitFailed')) }
  }

  if (!exam) return <div className="card container">{t('etLoading')}</div>

  return (
    <div className="card container">
      <h3>{exam.title}</h3>
      {exam.specialty && <div style={{ color: '#666', marginBottom: 8 }}>{exam.specialty.name}</div>}
      {exam.difficultyLevel && <div className="small" style={{ marginBottom: 6 }}>{t('etDifficulty')} <strong>{exam.difficultyLevel}</strong></div>}
      {exam.selectionMode && <div className="small" style={{ marginBottom: 6 }}>{t('etSelectionMode')} <strong>{exam.selectionMode}</strong></div>}
      <div className="small" style={{ marginBottom: 12, padding: 8, background: 'rgba(21,128,61,0.08)', borderRadius: 6, border: '1px solid rgba(21,128,61,0.2)' }}>
        <strong>{t('etPassingScore')}</strong> {exam.passingScore || 50}%
      </div>
      {exam.questions.length === 0 && (
        <div style={{ padding: 16, background: '#fef3cd', border: '1px solid #ffc107', borderRadius: 8, marginBottom: 12 }}>
          <strong>{t('etNoQuestions')}</strong>
        </div>
      )}
      <form onSubmit={submit}>
        {exam.questions.map((q, index) => (
          <div key={q.id} ref={el => { questionRefs.current[q.id] = el }} style={{ marginBottom: 12, padding: 12, borderRadius: 8, border: unansweredIds.includes(q.id) ? '2px solid #dc2626' : '2px solid transparent', background: unansweredIds.includes(q.id) ? 'rgba(220,38,38,0.04)' : 'transparent', transition: 'all 0.3s' }}>
            <div><span className="question-order-badge">{t('etQuestionNum').replace('{0}', index + 1)}</span></div>
            <div style={{ marginTop: 2 }}><strong>{q.title}</strong></div>
            {q.stem && q.stem !== q.title && <div style={{ marginTop: 4 }}>{q.stem}</div>}
            {q.body && <div style={{ marginTop: 4, whiteSpace: 'pre-wrap' }}>{q.body}</div>}
            {q.images && q.images.length > 0 && (
              <div style={{ marginTop: 8 }}>
                {q.images.map((img, i) => (
                  <div key={i} style={{ marginTop: 6 }}>
                    <img src={imgUrl(img)} alt={`question-${q.id}-img-${i}`} className="q-image" />
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
                        <input type="radio" name={`opt-${q.id}`} value={idx} checked={answers[q.id]===idx} onChange={()=>setAnswer(q.id, idx)} /> {opt}
                      </label>
                    </div>
                  ))}
                </div>
              ) : (
                <input placeholder={t('etYourAnswer')} value={answers[q.id]||''} onChange={e=>setAnswer(q.id, e.target.value)} />
              )}
            </div>
          </div>
        ))}
        <div><button className="btn btn-primary">{t('etSubmit')}</button></div>
      </form>
      {msg && <div style={{ padding: 12, marginBottom: 12, borderRadius: 8, background: 'rgba(220,38,38,0.08)', border: '1px solid #dc2626', color: '#dc2626', fontWeight: 600 }}>{msg}</div>}
    </div>
  )
}
