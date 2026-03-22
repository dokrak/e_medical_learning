import React, { useState, useEffect } from 'react'
import api from '../api'
import { useNavigate } from 'react-router-dom'
import { useLang } from '../LangContext'

const CHOICE_LABELS = ['A', 'B', 'C', 'D', 'E']
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/heic', 'image/heif']
const COMPRESS_THRESHOLD = 2 * 1024 * 1024 // compress if > 2MB
const COMPRESS_MAX_WIDTH = 1920

function compressImage(file) {
  return new Promise((resolve) => {
    // Skip non-compressible formats or small files
    if (!file.type.match(/jpeg|jpg|png|webp/) || file.size <= COMPRESS_THRESHOLD) {
      return resolve(file)
    }
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      let { width, height } = img
      if (width > COMPRESS_MAX_WIDTH) {
        height = Math.round(height * (COMPRESS_MAX_WIDTH / width))
        width = COMPRESS_MAX_WIDTH
      }
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, width, height)
      canvas.toBlob((blob) => {
        if (!blob) return resolve(file)
        const compressed = new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' })
        resolve(compressed.size < file.size ? compressed : file)
      }, 'image/jpeg', 0.82)
    }
    img.onerror = () => { URL.revokeObjectURL(url); resolve(file) }
    img.src = url
  })
}

export default function UploadQuestion(){
  const navigate = useNavigate()
  const { t } = useLang()
  const [question, setQuestion] = useState('')
  const [detail, setDetail] = useState('')
  const [answerExplanation, setAnswerExplanation] = useState('')
  const [difficulty, setDifficulty] = useState(3)
  const [choices, setChoices] = useState(['','','','',''])
  const [correctIndex, setCorrectIndex] = useState(0)
  const [msg, setMsg] = useState('')
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = React.useRef(null)
  const [specialties, setSpecialties] = useState([])
  const [specialtyId, setSpecialtyId] = useState('')
  const [subspecialtyId, setSubspecialtyId] = useState('')

  useEffect(()=>{ loadSpecialties() }, [])
  async function loadSpecialties(){
    try{ const r = await api.get('/specialties'); setSpecialties(r.data); } catch(e){ /* ignore */ }
  }

  async function uploadFile(file){
    const compressed = await compressImage(file)
    const fd = new FormData()
    fd.append('file', compressed)
    const r = await api.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
    return r.data.url
  }

  function handleImageSelect(e) {
    const file = e.target.files[0]
    if (!file) { setImage(null); return }
    if (!ALLOWED_TYPES.includes(file.type) && !file.name.match(/\.(jpe?g|png|gif|webp|heic|heif)$/i)) {
      setMsg(t('uqImageFormatError'))
      e.target.value = ''
      return
    }
    if (file.size > MAX_FILE_SIZE) {
      setMsg(t('uqImageTooLarge').replace('{0}', (file.size/1024/1024).toFixed(1)))
      e.target.value = ''
      return
    }
    setImage(file)
    setImagePreview(URL.createObjectURL(file))
    if (msg.includes('Image') || msg.includes('image')) setMsg('')
  }

  function removeImage() {
    setImage(null)
    if (imagePreview) { URL.revokeObjectURL(imagePreview); setImagePreview(null) }
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function setChoice(i, val){
    setChoices(prev => {
      const copy = [...prev]
      copy[i] = val
      return copy
    })
  }

  async function submit(e){
    e.preventDefault()
    setMsg('')
    // ensure exactly 5 choices
    const normalizedChoices = choices.slice(0,5).map(c => c || '(no text)')
    const selectedAnswer = normalizedChoices[correctIndex]

    let images = []
    if (image) {
      setUploading(true)
      try { images = [await uploadFile(image)] } catch(err) {
        if (err?.response?.status === 401) {
          setMsg(t('uqSessionExpired'))
          setUploading(false)
          return
        }
        setMsg(t('uqImageUploadFailed') + ': ' + (err?.response?.data?.message || err.message) + ' — ' + t('uqRetryHint'))
        setUploading(false)
        return
      }
      setUploading(false)
    }
    try{
      // Split question on first newline: first line = title, rest = stem
      const lines = question.split('\n')
      const title = lines[0] || 'Question'
      const stem = lines.length > 1 ? lines.slice(1).join('\n') : lines[0]
      
      const payload = { title, stem, body: detail, answerExplanation, difficulty, answer: selectedAnswer, choices: normalizedChoices, references: [], images, specialtyId: specialtyId || null, subspecialtyId: subspecialtyId || null }
      await api.post('/questions', payload)
      setQuestion(''); setDetail(''); setAnswerExplanation(''); setImage(null); setImagePreview(null); setChoices(['','','','','']); setCorrectIndex(0); setSpecialtyId(''); setSubspecialtyId('')
      navigate('/manage', { state: { msg: 'Question submitted successfully.', tab: 'questions' } })
    }catch(err){
      if (err?.response?.status === 401) {
        setMsg(t('uqSessionExpired'))
        return
      }
      const detailMessage = err?.response?.data?.error || err?.response?.data?.message || err.message || 'Unknown error'
      setMsg(`${t('uqSubmitFailed')} ${detailMessage}`)
    }
  }

  return (
    <div className="card container" style={{ background: 'linear-gradient(145deg, rgba(15,81,50,0.10) 0%, rgba(15,118,110,0.10) 45%, rgba(22,78,99,0.10) 100%)', border: '1px solid rgba(15,118,110,0.30)' }}>
      <h3 style={{ color: '#0f5132', marginBottom: 14 }}>{t('uqTitle')}</h3>
      <form onSubmit={submit}>
        <div><input type="text" placeholder={t('uqQuestionPlaceholder')} value={question} onChange={e=>setQuestion(e.target.value)} style={{ width: '100%' }} /></div>
        <div style={{ marginTop: 8 }}><textarea placeholder={t('uqDetailPlaceholder')} value={detail} onChange={e=>setDetail(e.target.value)} rows={5} /></div>
        <div style={{ marginTop: 8 }}>
          <label><strong>{t('uqDifficulty')}</strong></label>
          <div style={{ display: 'flex', gap: 20, marginTop: 8, flexWrap: 'wrap' }}>
            {[1, 2, 3, 4, 5].map(level => (
              <label key={level} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer', padding: '6px 12px', borderRadius: 8, border: difficulty === level ? '2px solid var(--brand-green)' : '2px solid var(--border)', background: difficulty === level ? 'rgba(21, 128, 61, 0.08)' : 'transparent', transition: 'all 0.2s' }}>
                <input 
                  type="radio" 
                  name="difficulty" 
                  value={level} 
                  checked={difficulty === level} 
                  onChange={() => setDifficulty(level)}
                  style={{ cursor: 'pointer' }}
                />
                <span style={{ fontWeight: difficulty === level ? 700 : 400 }}>
                  {level === 1 ? t('uqVeryEasy') : level === 2 ? t('uqEasy') : level === 3 ? t('uqMedium') : level === 4 ? t('uqHard') : t('uqVeryHard')}
                </span>
                <span style={{ fontSize: 11, color: '#999' }}>({level})</span>
              </label>
            ))}
          </div>
        </div>
        <div style={{ marginTop: 8 }}>
          <label><strong>{t('uqChoices')}</strong></label>
          {choices.map((c, i) => (
            <div key={i} style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ minWidth: 18, fontWeight: 600 }}>{CHOICE_LABELS[i]}.</span>
              <input placeholder={`${t('uqChoicePlaceholder')} ${CHOICE_LABELS[i]}`} value={c} onChange={e=>setChoice(i, e.target.value)} style={{ width: '70%' }} />
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><input type="radio" name="correct" checked={correctIndex===i} onChange={()=>setCorrectIndex(i)} />{t('uqCorrect')}</label>
            </div>
          ))}
          <div style={{ marginTop: 8 }}>
            <label><strong>{t('uqExplanationLabel')}</strong></label>
            <textarea placeholder={t('uqExplanationPlaceholder')} value={answerExplanation} onChange={e=>setAnswerExplanation(e.target.value)} rows={5} />
          </div>
        </div>
        <div style={{ marginTop: 8 }}>
          <label>{t('uqSpecialty')}</label>
          <select value={specialtyId} onChange={e=>{ setSpecialtyId(e.target.value); setSubspecialtyId('') }}>
            <option value="">{t('uqSelectSpecialty')}</option>
            {specialties.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div style={{ marginTop: 8 }}>
          <label>{t('uqSubspecialty')}</label>
          <select value={subspecialtyId} onChange={e=>setSubspecialtyId(e.target.value)}>
            <option value="">{t('uqSelectSubspecialty')}</option>
            {(specialties.find(s=>s.id===specialtyId)?.subspecialties||[]).map((ss, i) => { const val = typeof ss === 'object' ? ss.id : ss; const label = typeof ss === 'object' ? ss.name : ss; return <option key={val || i} value={val}>{label}</option>; })}
          </select>
        </div>
        <div style={{ marginTop: 8 }}>
          <label><strong>{t('uqImageLabel')}</strong></label>
          <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp,.jpg,.jpeg,.png,.gif,.webp,.heic,.heif" onChange={handleImageSelect} />
          {image && (
            <div style={{ marginTop: 8, padding: 10, background: 'rgba(21,128,61,0.05)', borderRadius: 8, border: '1px solid rgba(21,128,61,0.15)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {imagePreview && <img src={imagePreview} alt="preview" style={{ maxHeight: 120, maxWidth: 180, borderRadius: 6, border: '1px solid #ddd', objectFit: 'contain' }} />}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: '#333', fontWeight: 500 }}>{image.name}</div>
                  <div style={{ fontSize: 12, color: '#777' }}>{(image.size/1024).toFixed(0)} KB{image.size > COMPRESS_THRESHOLD ? ` — ${t('uqAutoCompress')}` : ''}</div>
                </div>
                <button type="button" onClick={removeImage} style={{ background: '#dc2626', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', cursor: 'pointer', fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap' }}>{t('uqRemove')}</button>
              </div>
            </div>
          )}
        </div>
        <div style={{ marginTop: 8 }}><button className="btn btn-primary" disabled={uploading}>{uploading ? t('uqUploading') : t('uqSubmit')}</button></div>
      </form>
      {msg && (
        <div style={{ marginTop: 12, padding: '12px 16px', borderRadius: 8, fontWeight: 600, fontSize: 14, background: msg.toLowerCase().includes('failed') || msg.toLowerCase().includes('error') ? '#ffe6e6' : '#e6ffe6', color: msg.toLowerCase().includes('failed') || msg.toLowerCase().includes('error') ? '#991b1b' : '#166534', border: msg.toLowerCase().includes('failed') || msg.toLowerCase().includes('error') ? '2px solid #dc3545' : '2px solid #28a745', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>{msg.toLowerCase().includes('failed') || msg.toLowerCase().includes('error') ? '⚠️ ' : '✅ '}{msg}</span>
          <button onClick={() => setMsg('')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#666', padding: '0 4px' }}>✕</button>
        </div>
      )}
    </div>
  )
}
