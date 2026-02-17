import React, { useState, useEffect } from 'react'
import api from '../api'

const CHOICE_LABELS = ['A', 'B', 'C', 'D', 'E']

export default function UploadQuestion(){
  const [question, setQuestion] = useState('')
  const [detail, setDetail] = useState('')
  const [difficulty, setDifficulty] = useState(3)
  const [choices, setChoices] = useState(['','','','',''])
  const [correctIndex, setCorrectIndex] = useState(0)
  const [answer, setAnswer] = useState('')
  const [msg, setMsg] = useState('')
  const [image, setImage] = useState(null)
  const [specialties, setSpecialties] = useState([])
  const [specialtyId, setSpecialtyId] = useState('')
  const [subspecialtyId, setSubspecialtyId] = useState('')

  useEffect(()=>{ loadSpecialties() }, [])
  async function loadSpecialties(){
    try{ const r = await api.get('/specialties'); setSpecialties(r.data); } catch(e){ /* ignore */ }
  }

  function toDataUrl(file){
    return new Promise((res,rej)=>{
      const reader = new FileReader()
      reader.onload = e => res(e.target.result)
      reader.onerror = rej
      reader.readAsDataURL(file)
    })
  }

  function setChoice(i, val){
    setChoices(prev => { const copy = [...prev]; copy[i] = val; return copy })
  }

  async function submit(e){
    e.preventDefault()
    // ensure exactly 5 choices
    const normalizedChoices = choices.slice(0,5).map(c => c || '(no text)')
    const selectedAnswer = normalizedChoices[correctIndex]

    let images = []
    if (image) images = [await toDataUrl(image)]
    try{
      // Split question on first newline: first line = title, rest = stem
      const lines = question.split('\n')
      const title = lines[0] || 'Question'
      const stem = lines.length > 1 ? lines.slice(1).join('\n') : lines[0]
      
      const payload = { title, stem, body: detail, difficulty, answer: selectedAnswer, choices: normalizedChoices, references: [], images, specialtyId: specialtyId || null, subspecialtyId: subspecialtyId || null }
      const r = await api.post('/questions', payload)
      setMsg('Submitted (pending moderator approval)')
      setQuestion(''); setDetail(''); setAnswer(''); setImage(null); setChoices(['','','','','']); setCorrectIndex(0); setSpecialtyId(''); setSubspecialtyId('')
    }catch(err){
      setMsg('Upload failed — ensure you are logged in as clinician')
    }
  }

  return (
    <div className="card container">
      <h3>Upload question (clinician)</h3>
      <form onSubmit={submit}>
        <div><textarea placeholder="Question (first line = title, rest = question details)" value={question} onChange={e=>setQuestion(e.target.value)} rows={3} /></div>
        <div style={{ marginTop: 8 }}><textarea placeholder="Detail (clinical information, findings, vital signs, etc.)" value={detail} onChange={e=>setDetail(e.target.value)} rows={4} /></div>
        <div style={{ marginTop: 8 }}>
          <label>Difficulty (1-5):</label>
          <input type="number" min={1} max={5} value={difficulty} onChange={e=>setDifficulty(Number(e.target.value))} />
        </div>
        <div style={{ marginTop: 8 }}>
          <label><strong>Choices (5)</strong></label>
          {choices.map((c, i) => (
            <div key={i} style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ minWidth: 18, fontWeight: 600 }}>{CHOICE_LABELS[i]}.</span>
              <input placeholder={`Choice ${CHOICE_LABELS[i]}`} value={c} onChange={e=>setChoice(i, e.target.value)} style={{ width: '70%' }} />
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><input type="radio" name="correct" checked={correctIndex===i} onChange={()=>setCorrectIndex(i)} />correct</label>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 8 }}>
          <label>Specialty:</label>
          <select value={specialtyId} onChange={e=>{ setSpecialtyId(e.target.value); setSubspecialtyId('') }}>
            <option value="">-- select major specialty --</option>
            {specialties.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div style={{ marginTop: 8 }}>
          <label>Subspecialty:</label>
          <select value={subspecialtyId} onChange={e=>setSubspecialtyId(e.target.value)}>
            <option value="">-- select subspecialty --</option>
            {(specialties.find(s=>s.id===specialtyId)?.subspecialties||[]).map(ss => <option key={ss.id} value={ss.id}>{ss.name}</option>)}
          </select>
        </div>
        <div style={{ marginTop: 8 }}>
          <input type="file" accept="image/*" onChange={e=>setImage(e.target.files[0])} />
        </div>
        <div style={{ marginTop: 8 }}><button className="btn btn-primary">Submit question</button></div>
      </form>
      <div style={{ marginTop: 8 }}>{msg}</div>
    </div>
  )
}
