import React, { useState, useEffect } from 'react'
import api, { imgUrl } from '../api'
import { useLocation, useNavigate } from 'react-router-dom'

export default function ManageQuestionsExams(){
  const location = useLocation()
  const navigate = useNavigate()
  const [tab, setTab] = useState('questions')
  const [items, setItems] = useState([])
  const [questionCount, setQuestionCount] = useState(0)
  const [examCount, setExamCount] = useState(0)
  const [editId, setEditId] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [editImages, setEditImages] = useState([])
  const [newImageFile, setNewImageFile] = useState(null)
  const [expandedGroups, setExpandedGroups] = useState({})
  const [msg, setMsg] = useState('')
  const [search, setSearch] = useState('')
  const [specialties, setSpecialties] = useState([])
  const currentUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null

  useEffect(()=>{ loadSpecialties() }, [])
  useEffect(()=>{ loadItems() }, [tab])
  useEffect(()=>{ setSearch('') }, [tab])
  useEffect(()=>{
    async function loadCounts(){
      try{
        const [qr, er] = await Promise.all([api.get('/all-questions'), api.get('/exams')])
        setQuestionCount(qr.data.length)
        setExamCount(er.data.length)
      } catch(e){}
    }
    loadCounts()
  }, [])

  useEffect(() => {
    if (!location.state) return
    if (location.state.msg) setMsg(location.state.msg)
    if (location.state.tab === 'questions' || location.state.tab === 'exams') setTab(location.state.tab)
    navigate(location.pathname, { replace: true, state: null })
  }, [location, navigate])

  async function loadSpecialties(){
    try{ const r = await api.get('/specialties'); setSpecialties(r.data); } catch(e){ }
  }

  async function loadItems(){
    try{
      if (tab === 'questions'){
        const r = await api.get('/all-questions');
        const sorted = r.data.sort((a, b) => {
          if (a.status === 'rejected' && b.status !== 'rejected') return -1;
          if (a.status !== 'rejected' && b.status === 'rejected') return 1;
          return 0;
        });
        setItems(sorted);
        setQuestionCount(sorted.length);
      } else {
        const r = await api.get('/exams');
        setItems(r.data);
        setExamCount(r.data.length);
      }
    } catch(err){ setMsg('Failed to load: ' + err.message) }
  }

  async function uploadFile(file){
    const fd = new FormData()
    fd.append('file', file)
    const r = await api.post('/upload', fd)
    return r.data.url
  }

  async function startEdit(item){
    setEditId(item.id);
    if (tab === 'questions'){
      setEditImages(item.images || []);
      setNewImageFile(null);
      setEditForm({
        title: item.title,
        stem: item.stem,
        body: item.body,
        answerExplanation: item.answerExplanation,
        difficulty: item.difficulty,
        answer: item.answer,
        references: item.references,
        choices: item.choices || [],
        specialtyId: item.specialtyId,
        subspecialtyId: item.subspecialtyId
      });
    } else {
      setEditForm({
        title: item.title,
        numQuestions: item.questions.length,
        specialtyId: item.specialty?.id,
        subspecialtyId: item.subspecialty?.id,
        selectionMode: item.selectionMode || 'random',
        difficultyLevel: item.difficultyLevel || 'medium',
        difficultyDistribution: item.difficultyDistribution || null,
        selectedQuestionIds: item.selectedQuestionIds || []
      });
    }
  }

  const [availableQuestionsForEdit, setAvailableQuestionsForEdit] = useState([])
  const [editSelectedQuestions, setEditSelectedQuestions] = useState([])

  function difficultyMatchForEdit(q){
    const level = editForm.difficultyLevel || 'medium'
    const d = Number(q.difficulty || 3)
    if (level === 'easy') return d <= 2
    if (level === 'medium') return d === 3
    if (level === 'difficult') return d === 4
    if (level === 'extreme') return d >= 5
    return true
  }

  async function loadQuestionsForEdit(){
    try{
      const qs = (await api.get(`/questions?limit=200${editForm.specialtyId ? '&specialtyId='+editForm.specialtyId : ''}${editForm.subspecialtyId ? '&subspecialtyId='+editForm.subspecialtyId : ''}`)).data
      const filtered = qs.filter(q => difficultyMatchForEdit(q))
      setAvailableQuestionsForEdit(filtered)
      setEditSelectedQuestions(editForm.selectedQuestionIds || [])
    }catch(err){ setMsg('Failed to load questions') }
  }

  function toggleEditSelect(qid){
    setEditSelectedQuestions(prev => {
      const key = String(qid)
      const hasItem = prev.some(x => String(x) === key)
      return hasItem ? prev.filter(x => String(x) !== key) : [...prev, qid]
    })
  }

  async function saveEdit(){
    try{
      let images = editImages;
      if (newImageFile){
        try {
          const url = await uploadFile(newImageFile);
          images = [...editImages, url];
        } catch(err) {
          setMsg('Image upload failed: ' + (err?.response?.data?.message || err.message) + ' — Please try selecting a new image.');
          return;
        }
      }
      if (tab === 'questions'){
        await api.put(`/questions/${editId}`, { ...editForm, images });
      } else {
        const payload = { ...editForm }
        if (payload.selectionMode === 'manual') payload.selectedQuestionIds = editSelectedQuestions
        await api.put(`/exams/${editId}`, payload);
      }
      setMsg('Saved successfully');
      setEditId(null);
      setNewImageFile(null);
      setAvailableQuestionsForEdit([])
      setEditSelectedQuestions([])
      loadItems();
    } catch(err){ setMsg('Save failed: ' + (err.response?.data?.error || err.message)) }
  }

  function deleteImage(idx){
    setEditImages(editImages.filter((_, i) => i !== idx));
  }

  async function deleteItem(id){
    if (!window.confirm('Confirm delete?')) return;
    try{
      if (tab === 'questions'){
        await api.delete(`/questions/${id}`);
      } else {
        await api.delete(`/exams/${id}`);
      }
      setMsg('Deleted');
      loadItems();
    } catch(err){ setMsg('Delete failed: ' + (err.response?.data?.error || err.message)) }
  }

  function cancelEdit(){
    setEditId(null)
    setNewImageFile(null)
    setAvailableQuestionsForEdit([])
    setEditSelectedQuestions([])
  }

  function getSpecName(specId) {
    const s = specialties.find(s => s.id === specId)
    return s ? s.name : 'Unspecified'
  }
  function getSubspecName(specId, subId) {
    const s = specialties.find(s => s.id === specId)
    if (!s) return 'Unspecified'
    const sub = (s.subspecialties || []).find(ss => (typeof ss === 'object' ? ss.id : ss) === subId)
    return sub ? (typeof sub === 'object' ? sub.name : sub) : 'Unspecified'
  }

  const visibleItems = editId
    ? items.filter(item => String(item.id) === String(editId))
    : items.filter(item => {
        const keyword = search.trim().toLowerCase()
        if (!keyword) return true
        if (tab === 'questions') {
          const titleText = (item.title || '').toLowerCase()
          const stemText = (item.stem || '').toLowerCase()
          const statusText = (item.status || '').toLowerCase()
          const authorText = (item.authorName || '').toLowerCase()
          const specText = getSpecName(item.specialtyId).toLowerCase()
          const subText = getSubspecName(item.specialtyId, item.subspecialtyId).toLowerCase()
          return [titleText, stemText, statusText, authorText, specText, subText].some(text => text.includes(keyword))
        }
        const titleText = (item.title || '').toLowerCase()
        const specialtyText = (item.specialty?.name || '').toLowerCase()
        const subspecialtyText = (item.subspecialty?.name || '').toLowerCase()
        const modeText = (item.selectionMode || '').toLowerCase()
        return [titleText, specialtyText, subspecialtyText, modeText].some(text => text.includes(keyword))
      })

  // Group questions by specialty → subspecialty
  const groupedQuestions = (() => {
    if (tab !== 'questions' || editId) return null
    const groups = {}
    visibleItems.forEach(item => {
      const specKey = item.specialtyId || '_none'
      const specName = getSpecName(item.specialtyId)
      const subKey = item.subspecialtyId || '_none'
      const subName = getSubspecName(item.specialtyId, item.subspecialtyId)
      if (!groups[specKey]) groups[specKey] = { name: specName, subs: {} }
      if (!groups[specKey].subs[subKey]) groups[specKey].subs[subKey] = { name: subName, items: [] }
      groups[specKey].subs[subKey].items.push(item)
    })
    return groups
  })()

  function toggleGroup(key) {
    setExpandedGroups(prev => ({ ...prev, [key]: !prev[key] }))
  }

  function renderItemCard(item) {
    return (
          <div key={item.id} className="card" style={{ padding: 12, marginBottom: 12, borderLeft: item.status === 'rejected' ? '6px solid #dc3545' : 'none', background: item.status === 'rejected' ? '#fff8f8' : 'white', boxShadow: editId === item.id ? '0 12px 30px rgba(21,128,61,0.14)' : undefined }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <strong>{item.title}</strong>
                {tab==='questions' && <span className="small">(Difficulty: {item.difficulty})</span>}
                {tab==='questions' && item.authorName && <span className="small" style={{ color: '#666' }}>by {item.authorName}</span>}
                {tab==='questions' && currentUser && item.createdBy === currentUser.id && <span className="badge" style={{ background: 'var(--brand-green)', color: '#fff', padding: '3px 7px', fontSize: '10px' }}>MINE</span>}
                {tab==='questions' && item.status === 'rejected' && <span className="badge" style={{ background: '#dc3545', color: 'white', padding: '4px 8px', fontSize: '11px', fontWeight: 600 }}>REJECTED</span>}
                {tab==='questions' && item.status === 'pending' && <span className="badge" style={{ background: '#ffc107', color: '#333', padding: '4px 8px', fontSize: '11px', fontWeight: 600 }}>PENDING</span>}
                {tab==='questions' && item.status === 'approved' && <span className="badge" style={{ background: '#28a745', color: 'white', padding: '4px 8px', fontSize: '11px', fontWeight: 600 }}>APPROVED</span>}
              </div>
              {tab==='questions' && item.images && item.images.length > 0 && !editId && (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
                  {item.images.map((img, i) => (
                    <img key={i} src={imgUrl(img)} alt={`q-img-${i}`} style={{ maxHeight: 80, maxWidth: 120, borderRadius: 4, border: '1px solid #ddd' }} />
                  ))}
                </div>
              )}
            </div>
            {tab==='questions' && item.status === 'rejected' && item.moderationFeedback && (
              <div style={{ marginTop: 8, padding: 10, background: '#ffe6e6', border: '2px solid #dc3545', borderRadius: 6 }}>
                <div style={{ fontWeight: 600, color: '#721c24', marginBottom: 6 }}>⚠ Moderator Feedback:</div>
                <div className="small" style={{ color: '#721c24', lineHeight: 1.5 }}>{item.moderationFeedback}</div>
              </div>
            )}
            {tab==='questions' && item.status === 'rejected' && !editId && (
              <div style={{ marginTop: 8, padding: 10, background: '#f0f0f0', borderRadius: 6 }}>
                <div className="small" style={{ fontWeight: 600, marginBottom: 8 }}>📋 Question Preview:</div>
                <div className="small" style={{ marginBottom: 6 }}><strong>Stem:</strong> {item.stem || '(no stem)'}</div>
                <div className="small" style={{ marginBottom: 6 }}><strong>Details:</strong> {item.body || '(no details)'}</div>
                <div className="small" style={{ marginBottom: 6 }}><strong>Answer explanation:</strong> {item.answerExplanation || '(no explanation)'}</div>
                {item.choices && item.choices.length > 0 && (
                  <div className="small" style={{ marginBottom: 6 }}>
                    <strong>Choices:</strong>
                    {item.choices.map((c, i) => (
                      <div key={i} style={{ marginLeft: 12, marginTop: 2, fontSize: '12px' }}>
                        {String.fromCharCode(65+i)}. {c} {c === item.answer && <span style={{ color: '#28a745', fontWeight: 600 }}>✓ Correct</span>}
                      </div>
                    ))}
                  </div>
                )}
                {item.images && item.images.length > 0 && (
                  <div className="small" style={{ marginBottom: 6 }}>
                    <strong>Images:</strong>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
                      {item.images.map((img, i) => (
                        <img key={i} src={imgUrl(img)} alt={`preview-img-${i}`} style={{ maxHeight: 100, maxWidth: 150, borderRadius: 4, border: '1px solid #ddd' }} />
                      ))}
                    </div>
                  </div>
                )}
                <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid #ddd', display: 'flex', gap: 8 }}>
                  <button className="btn btn-primary" onClick={()=>startEdit(item)} style={{ flex: 1 }}>✏ Edit & Resubmit</button>
                  <button className="btn btn-danger" onClick={()=>deleteItem(item.id)} style={{ flex: 1 }}>Delete</button>
                </div>
              </div>
            )}
            {editId === item.id ? (
              <div style={{ marginTop: 8 }}>
                <label><strong>Title</strong></label>
                <input placeholder="Title" value={editForm.title||''} onChange={e=>setEditForm({...editForm, title: e.target.value})} style={{ width: '100%', marginBottom: 6 }} />
                {tab === 'questions' ? (
                  <>
                    <label><strong>Question (Stem)</strong></label>
                    <textarea placeholder="Stem" value={editForm.stem||''} onChange={e=>setEditForm({...editForm, stem: e.target.value})} style={{ width: '100%', marginBottom: 6 }} rows={2} />
                    <label><strong>Detail</strong></label>
                    <textarea placeholder="Body" value={editForm.body||''} onChange={e=>setEditForm({...editForm, body: e.target.value})} style={{ width: '100%', marginBottom: 6 }} rows={2} />
                    <label><strong>Correct Answer & Explanation</strong></label>
                    <textarea placeholder="Answer explanation" value={editForm.answerExplanation||''} onChange={e=>setEditForm({...editForm, answerExplanation: e.target.value})} style={{ width: '100%', marginBottom: 6 }} rows={3} />
                    <label><strong>Difficulty (1-5)</strong></label>
                    <input type="number" min={1} max={5} placeholder="Difficulty" value={editForm.difficulty||3} onChange={e=>setEditForm({...editForm, difficulty: Number(e.target.value)})} style={{ width: '100%', marginBottom: 6 }} />
                    <label><strong>Choices (A–E)</strong></label>
                    {['A','B','C','D','E'].map((label, i) => {
                      const choicesList = editForm.choices || []
                      const isCorrect = choicesList[i] && choicesList[i] === editForm.answer
                      return (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <span style={{ fontWeight: 600, minWidth: 20 }}>{label}.</span>
                          <input
                            value={choicesList[i] || ''}
                            onChange={e => {
                              const updated = [...choicesList]
                              const oldVal = updated[i]
                              updated[i] = e.target.value
                              while (updated.length < 5) updated.push('')
                              const newForm = { ...editForm, choices: updated }
                              if (oldVal === editForm.answer) newForm.answer = e.target.value
                              setEditForm(newForm)
                            }}
                            placeholder={`Choice ${label}`}
                            style={{ flex: 1 }}
                          />
                          <label style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                            <input
                              type="radio"
                              name="edit-correct-answer"
                              checked={isCorrect}
                              onChange={() => setEditForm({ ...editForm, answer: choicesList[i] || '' })}
                            />
                            <span style={{ fontSize: 12, color: isCorrect ? '#28a745' : '#888' }}>
                              {isCorrect ? '✓ Correct' : 'Correct'}
                            </span>
                          </label>
                        </div>
                      )
                    })}
                    <label><strong>Correct Answer</strong></label>
                    <input placeholder="Answer" value={editForm.answer||''} onChange={e=>setEditForm({...editForm, answer: e.target.value})} style={{ width: '100%', marginBottom: 6 }} />
                    <label><strong>Specialty</strong></label>
                    <select value={editForm.specialtyId||''} onChange={e=>{ setEditForm({...editForm, specialtyId: e.target.value}); }} style={{ width: '100%', marginBottom: 6 }}>
                      <option value="">-- select specialty --</option>
                      {specialties.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                    <label><strong>Subspecialty</strong></label>
                    <select value={editForm.subspecialtyId||''} onChange={e=>setEditForm({...editForm, subspecialtyId: e.target.value})} style={{ width: '100%', marginBottom: 6 }}>
                      <option value="">-- select subspecialty --</option>
                      {(specialties.find(s=>s.id===editForm.specialtyId)?.subspecialties||[]).map((ss, i) => { const val = typeof ss === 'object' ? ss.id : ss; const label = typeof ss === 'object' ? ss.name : ss; return <option key={val || i} value={val}>{label}</option>; })}
                    </select>
                    <div style={{ marginBottom: 6, padding: 8 }} className="panel">
                      <label><strong>Images</strong></label>
                      {editImages.length > 0 && (
                        <div style={{ marginTop: 8 }}>
                          {editImages.map((img, i) => (
                            <div key={i} style={{ marginBottom: 8 }}>
                              <img src={imgUrl(img)} alt={`edit-img-${i}`} className="q-image" style={{ maxHeight: 150 }} />
                              <div style={{ marginTop: 4 }}>
                                <button className="btn btn-danger small" onClick={()=>deleteImage(i)}>Delete image</button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      <div style={{ marginTop: 8 }}>
                        <input type="file" accept="image/*" onChange={e=>setNewImageFile(e.target.files[0])} />
                        {newImageFile && <div style={{ marginTop: 4 }} className="small"><span className="badge badge-success">✓</span> New image selected: {newImageFile.name}</div>}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ marginBottom: 8 }}>
                      <label>Selection mode:</label>
                      <div style={{ display: 'flex', gap: 12 }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}><input type="radio" name="edit-mode" value="random" checked={(editForm.selectionMode||'random')==='random'} onChange={e=>setEditForm({...editForm, selectionMode: 'random'})} /> Random</label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}><input type="radio" name="edit-mode" value="manual" checked={(editForm.selectionMode||'random')==='manual'} onChange={e=>setEditForm({...editForm, selectionMode: 'manual'})} /> Manual</label>
                      </div>
                    </div>

                    <div style={{ marginBottom: 8 }}>
                      <label>Difficulty:</label>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <select value={editForm.difficultyLevel||'medium'} onChange={e=>setEditForm({...editForm, difficultyLevel: e.target.value})} style={{ width: '70%' }} disabled={!!editForm.difficultyDistribution}>
                          <option value="easy">Easy (1-2)</option>
                          <option value="medium">Medium (3)</option>
                          <option value="difficult">Difficult (4)</option>
                          <option value="extreme">Extreme difficult (5)</option>
                        </select>
                        <label style={{ display: 'flex', alignItems: 'center' }}>
                          <input type="checkbox" checked={!!editForm.difficultyDistribution} onChange={e=>setEditForm({...editForm, difficultyDistribution: e.target.checked ? (editForm.difficultyDistribution || { '1-2':25, '3':25, '4':25, '5':25 }) : null })} />
                          <span style={{ marginLeft: 6 }}>Use distribution</span>
                        </label>
                      </div>
                    </div>

                    <input type="number" placeholder="Num questions" value={editForm.numQuestions||10} onChange={e=>setEditForm({...editForm, numQuestions: Number(e.target.value)})} style={{ width: '100%', marginBottom: 6 }} />
                    <select value={editForm.specialtyId||''} onChange={e=>setEditForm({...editForm, specialtyId: e.target.value})} style={{ width: '100%', marginBottom: 6 }}>
                      <option value="">-- select specialty --</option>
                      {specialties.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                    <select value={editForm.subspecialtyId||''} onChange={e=>setEditForm({...editForm, subspecialtyId: e.target.value})} style={{ width: '100%', marginBottom: 6 }}>
                      <option value="">-- select subspecialty --</option>
                      {(specialties.find(s=>s.id===editForm.specialtyId)?.subspecialties||[]).map((ss, i) => { const val = typeof ss === 'object' ? ss.id : ss; const label = typeof ss === 'object' ? ss.name : ss; return <option key={val || i} value={val}>{label}</option>; })}
                    </select>

                    { editForm.difficultyDistribution && (() => {
                      const d = editForm.difficultyDistribution
                      const boxes = [
                        { label: 'Level 1–2', key: '1-2', fallbackKey: '1-3' },
                        { label: 'Level 3', key: '3', fallbackKey: null },
                        { label: 'Level 4', key: '4', fallbackKey: null },
                        { label: 'Level 5', key: '5', fallbackKey: null },
                      ]
                      const getVal = (b) => d[b.key] ?? (b.fallbackKey ? d[b.fallbackKey] : null) ?? 0
                      const total = boxes.reduce((s, b) => s + getVal(b), 0)
                      return (
                      <div style={{ marginTop: 8, padding: 12, border: '1px dashed var(--border)', borderRadius: 6 }}>
                        <div className="small" style={{ marginBottom: 8 }}>Distribution (auto-adjusts to sum to 100%)</div>
                        <div className="exam-dist-row">
                          {boxes.map((b, idx) => {
                            const val = getVal(b)
                            return (
                              <div key={b.key}>
                                <label>{b.label}</label>
                                <select value={val} onChange={e => {
                                  const newVal = Number(e.target.value)
                                  const remainder = 100 - newVal
                                  const otherBoxes = boxes.filter((_, i) => i !== idx)
                                  const otherSum = otherBoxes.reduce((s, ob) => s + getVal(ob), 0)
                                  const newDist = {}
                                  newDist[b.key] = newVal
                                  if (otherSum === 0) {
                                    const each = Math.floor(remainder / otherBoxes.length)
                                    otherBoxes.forEach((ob, j) => { newDist[ob.key] = j === otherBoxes.length - 1 ? remainder - each * (otherBoxes.length - 1) : each })
                                  } else {
                                    let assigned = 0
                                    otherBoxes.forEach((ob, j) => {
                                      if (j === otherBoxes.length - 1) { newDist[ob.key] = remainder - assigned }
                                      else { const v = Math.round((getVal(ob) / otherSum) * remainder); newDist[ob.key] = v; assigned += v }
                                    })
                                  }
                                  setEditForm({...editForm, difficultyDistribution: newDist})
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
                          <span className="small" style={{ fontWeight: 700 }}>Total: {total}%</span>
                          {total === 100
                            ? <span className="badge badge-success" style={{ fontSize: '0.78em' }}>✓</span>
                            : <span className="badge badge-danger" style={{ fontSize: '0.78em' }}>≠ 100%</span>}
                        </div>
                      </div>
                      )
                    })()}

                    { (editForm.selectionMode || 'random') === 'manual' && (
                      <div style={{ marginTop: 8, padding: 8, border: '1px dashed var(--border)', borderRadius: 6 }}>
                        <div style={{ marginBottom: 6 }}>
                          <button type="button" className="btn" onClick={loadQuestionsForEdit}>Load questions</button>
                          <span className="small" style={{ marginLeft: 8 }}>Choose questions to include in this exam</span>
                        </div>
                        <div style={{ maxHeight: 220, overflow: 'auto' }}>
                          {[...availableQuestionsForEdit]
                            .sort((a, b) => Number(editSelectedQuestions.some(x => String(x) === String(b.id))) - Number(editSelectedQuestions.some(x => String(x) === String(a.id))))
                            .map(q => {
                              const isSelected = editSelectedQuestions.some(x => String(x) === String(q.id))
                              return (
                            <div key={q.id} style={{ display: 'flex', gap: 8, padding: 6, borderBottom: '1px solid var(--border)', borderLeft: isSelected ? '6px solid var(--brand-green)' : '4px solid transparent', background: isSelected ? 'linear-gradient(90deg, var(--brand-light-green), var(--surface-2))' : 'transparent', boxShadow: isSelected ? '0 8px 20px rgba(21,128,61,0.10)' : 'none', borderRadius: isSelected ? 8 : 0 }}>
                              <input type="checkbox" checked={isSelected} onChange={()=>toggleEditSelect(q.id)} />
                              <div>
                                <div style={{ fontWeight: 700 }}>{q.title} <span className="small">(diff {q.difficulty})</span> {isSelected && <span className="badge" style={{ marginLeft: 6, background: 'var(--brand-green)', color: '#fff', border: '1px solid var(--brand-green)' }}>Selected</span>}</div>
                                <div className="small">{q.stem}</div>
                                {q.images && q.images.length > 0 && (
                                  <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                                    {q.images.map((img, idx) => (
                                      <img key={idx} src={imgUrl(img)} alt={`q-${q.id}-img-${idx}`} style={{ maxHeight: 60, maxWidth: 80, borderRadius: 4, border: '1px solid #ddd' }} />
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          )})}
                        </div>
                        <div className="small" style={{ marginTop: 6 }}>Selected: {editSelectedQuestions.length}</div>
                      </div>
                    )}
                  </>
                )}
                <button className="btn btn-primary" onClick={saveEdit} style={{ marginRight: 6 }}>Save</button>
                <button className="btn btn-ghost" onClick={cancelEdit}>Cancel</button>
              </div>
            ) : (
              <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                {currentUser && (item.createdBy === currentUser.id || currentUser.role === 'admin') ? (
                  <>
                    {!(tab==='questions' && item.status === 'rejected') && (
                      <>
                        <button className="btn" onClick={()=>startEdit(item)} style={{ flex: 1, fontWeight: item.status === 'rejected' ? 600 : 'normal', background: item.status === 'rejected' ? '#ffc107' : undefined, color: item.status === 'rejected' ? '#222' : undefined }}>
                          {item.status === 'rejected' ? '✏ Edit & Resubmit' : 'Edit'}
                        </button>
                        <button className="btn btn-danger" onClick={()=>deleteItem(item.id)} style={{ flex: 1 }}>Delete</button>
                      </>
                    )}
                  </>
                ) : (
                  <div className="small" style={{ color: '#999', fontStyle: 'italic' }}>You can only edit/delete your own items</div>
                )}
              </div>
            )}
          </div>
    )
  }

  return (
    <div className="card container">
      <h3>Manage questions & exams</h3>
      <div style={{ marginBottom: 12 }}>
        <button onClick={()=>setTab('questions')} style={{ fontWeight: tab==='questions'?'bold':'normal' }}>Questions ({tab === 'questions' ? items.length : questionCount})</button>
        <button onClick={()=>setTab('exams')} style={{ marginLeft: 8, fontWeight: tab==='exams'?'bold':'normal' }}>Exams ({tab === 'exams' ? items.length : examCount})</button>
      </div>
      {!editId && (
        <div style={{ marginBottom: 12 }}>
          <input
            className="search-box"
            placeholder={tab === 'questions' ? 'Search questions by title, content, author, specialty...' : 'Search exams by title, specialty, mode...'}
            value={search}
            onChange={e=>setSearch(e.target.value)}
          />
        </div>
      )}
      {msg && (
        <div style={{ marginBottom: 12, padding: '12px 16px', borderRadius: 8, fontWeight: 600, fontSize: 14, background: msg.toLowerCase().includes('failed') || msg.toLowerCase().includes('error') ? '#ffe6e6' : '#e6ffe6', color: msg.toLowerCase().includes('failed') || msg.toLowerCase().includes('error') ? '#991b1b' : '#166534', border: msg.toLowerCase().includes('failed') || msg.toLowerCase().includes('error') ? '2px solid #dc3545' : '2px solid #28a745', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>{msg.toLowerCase().includes('failed') || msg.toLowerCase().includes('error') ? '\u26a0\ufe0f ' : '\u2705 '}{msg}</span>
          <button onClick={() => setMsg('')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#666', padding: '0 4px' }}>\u2715</button>
        </div>
      )}
      <div>
        {tab === 'questions' && !editId && groupedQuestions ? (
          <>
            {Object.entries(groupedQuestions).map(([specKey, specGroup]) => (
              <div key={specKey} style={{ marginBottom: 12 }}>
                <div
                  onClick={() => toggleGroup(specKey)}
                  style={{ cursor: 'pointer', padding: '10px 14px', background: 'linear-gradient(90deg, rgba(21,128,61,0.08), rgba(16,185,129,0.04))', borderRadius: 8, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: 700 }}
                >
                  <span>{expandedGroups[specKey] ? '▼' : '▶'} {specGroup.name}</span>
                  <span className="badge badge-success" style={{ fontSize: '0.8em' }}>{Object.values(specGroup.subs).reduce((s, sub) => s + sub.items.length, 0)}</span>
                </div>
                {expandedGroups[specKey] && (
                  <div style={{ marginLeft: 12, marginTop: 6 }}>
                    {Object.entries(specGroup.subs).map(([subKey, subGroup]) => (
                      <div key={subKey} style={{ marginBottom: 8 }}>
                        <div
                          onClick={() => toggleGroup(specKey + '/' + subKey)}
                          style={{ cursor: 'pointer', padding: '8px 12px', background: 'var(--surface-2)', borderRadius: 6, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: 600, fontSize: '0.92em' }}
                        >
                          <span>{expandedGroups[specKey + '/' + subKey] ? '▼' : '▶'} {subGroup.name}</span>
                          <span className="small">({subGroup.items.length})</span>
                        </div>
                        {expandedGroups[specKey + '/' + subKey] && (
                          <div style={{ marginLeft: 8, marginTop: 6 }}>
                            {subGroup.items.map(item => renderItemCard(item))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {visibleItems.length === 0 && <div className="small">No items found</div>}
          </>
        ) : (
          <>
            {visibleItems.map(item => renderItemCard(item))}
            {visibleItems.length === 0 && <div className="small">No items found</div>}
          </>
        )}
      </div>
    </div>
  )
}
