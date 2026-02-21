import React, { useState, useEffect } from 'react'
import api from '../api'
import { useLocation, useNavigate } from 'react-router-dom'

export default function ManageQuestionsExams(){
  const location = useLocation()
  const navigate = useNavigate()
  const [tab, setTab] = useState('questions')
  const [items, setItems] = useState([])
  const [editId, setEditId] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [editImages, setEditImages] = useState([])
  const [newImageFile, setNewImageFile] = useState(null)
  const [msg, setMsg] = useState('')
  const [search, setSearch] = useState('')
  const [specialties, setSpecialties] = useState([])
  const [questionCount, setQuestionCount] = useState(0)
  const [examCount, setExamCount] = useState(0)
  const [pendingEditTarget, setPendingEditTarget] = useState(null)
  const [examQuestionsPreview, setExamQuestionsPreview] = useState([])
  const [examDifficultyMean, setExamDifficultyMean] = useState(null)
  const currentUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null
  const CHOICE_LABELS = ['A', 'B', 'C', 'D', 'E']

  function canEditItem(item){
    if (!currentUser) return false
    if (currentUser.role === 'admin') return true
    const ownerId = item.createdBy ?? item.created_by ?? item.author_id ?? item.user_id ?? null
    return ownerId != null && String(ownerId) === String(currentUser.id)
  }

  useEffect(()=>{ loadSpecialties() }, [])
  useEffect(()=>{ loadItems() }, [tab])
  useEffect(()=>{ setSearch('') }, [tab])

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const editIdParam = params.get('editId')
    const tabParam = params.get('tab')
    if (!editIdParam || (tabParam !== 'questions' && tabParam !== 'exams')) return

    setPendingEditTarget({ id: editIdParam, tab: tabParam })
    if (tabParam !== tab) setTab(tabParam)
  }, [location.search, tab])

  useEffect(() => {
    if (!pendingEditTarget) return
    if (pendingEditTarget.tab !== tab) return

    const targetItem = items.find(item => String(item.id) === String(pendingEditTarget.id))
    if (!targetItem) return

    startEdit(targetItem, { skipRefresh: true })
    setPendingEditTarget(null)
    navigate(location.pathname, { replace: true })
  }, [items, pendingEditTarget, tab])

  useEffect(() => {
    if (!location.state) return
    if (location.state.msg) setMsg(location.state.msg)
    if (location.state.tab === 'questions' || location.state.tab === 'exams') setTab(location.state.tab)
    navigate(location.pathname, { replace: true, state: null })
  }, [location, navigate])

  async function loadSpecialties(){
    try{
      const r = await api.get('/specialties')
      const normalized = (r.data || []).map(s => ({
        ...s,
        subspecialties: s.subspecialties || s.children || []
      }))
      setSpecialties(normalized)
    } catch(e){ }
  }

  async function loadItems(){
    try{
      const [questionsRes, examsRes] = await Promise.all([
        api.get('/my-questions'),
        api.get('/exams')
      ])

      const sortedQuestions = (questionsRes.data || []).sort((a, b) => {
        if (a.status === 'rejected' && b.status !== 'rejected') return -1
        if (a.status !== 'rejected' && b.status === 'rejected') return 1
        return 0
      })
      const exams = examsRes.data || []

      setQuestionCount(sortedQuestions.length)
      setExamCount(exams.length)
      setItems(tab === 'questions' ? sortedQuestions : exams)
    } catch(err){ setMsg('Failed to load: ' + err.message) }
  }

  function toDataUrl(file){
    return new Promise((res,rej)=>{
      const reader = new FileReader()
      reader.onload = e => res(e.target.result)
      reader.onerror = rej
      reader.readAsDataURL(file)
    })
  }

  async function startEdit(item, options = {}){
    if (!options.skipRefresh) {
      window.location.href = `${location.pathname}?tab=${tab}&editId=${item.id}`
      return
    }

    setEditId(item.id);
    if (tab === 'questions'){
      const normalizedChoices = Array.isArray(item.choices)
        ? [...item.choices.slice(0, 5), ...Array(Math.max(0, 5 - item.choices.length)).fill('')]
        : ['', '', '', '', '']

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
        choices: normalizedChoices,
        specialtyId: (item.specialtyId ?? item.specialty_id ?? item.specialty?.id) != null ? String(item.specialtyId ?? item.specialty_id ?? item.specialty?.id) : '',
        subspecialtyId: (item.subspecialtyId ?? item.subspecialty_id ?? item.subspecialty?.id) != null ? String(item.subspecialtyId ?? item.subspecialty_id ?? item.subspecialty?.id) : ''
      });
    } else {
      let examSource = item
      try {
        const detail = await api.get(`/exams/${item.id}`)
        examSource = { ...item, ...(detail.data || {}) }
      } catch (e) {
      }

      const sourceQuestions = Array.isArray(examSource.questions) ? examSource.questions : []
      const difficultyValues = sourceQuestions
        .map(q => Number(q?.difficulty || 0))
        .filter(v => Number.isFinite(v) && v > 0)
      const computedMean = difficultyValues.length > 0
        ? Number((difficultyValues.reduce((sum, v) => sum + v, 0) / difficultyValues.length).toFixed(2))
        : null
      const fallbackMean = examSource.averageDifficultyScore ?? examSource.config?.averageDifficultyScore ?? null
      setExamQuestionsPreview(sourceQuestions)
      setExamDifficultyMean(computedMean ?? fallbackMean)

      const config = examSource.config || {}
      const prefillSelectionMode = examSource.selectionMode ?? config.selectionMode ?? 'random'
      const prefillDifficultyLevel = examSource.difficultyLevel ?? config.difficultyLevel ?? examSource.computedDifficultyLevel ?? 'medium'
      const prefillDifficultyDistribution = examSource.difficultyDistribution ?? config.difficultyDistribution ?? config.difficulty_dist ?? null
      const existingExamQuestionIds = Array.isArray(examSource.questions) ? examSource.questions.map(q => q.id) : []
      const prefillSelectedQuestionIds = existingExamQuestionIds.length > 0
        ? existingExamQuestionIds
        : (examSource.selectedQuestionIds ?? config.selectedQuestionIds ?? [])
      const fallbackNumQuestions =
        examSource.numQuestions ??
        examSource.num_questions ??
        examSource.questions_count ??
        (Array.isArray(examSource.questions) ? examSource.questions.length : 10)

      setEditForm({
        title: examSource.title,
        numQuestions: Number(fallbackNumQuestions) || 10,
        specialtyId: examSource.specialty?.id ?? examSource.specialty_id ?? '',
        subspecialtyId: examSource.subspecialty?.id ?? examSource.subspecialty_id ?? '',
        selectionMode: prefillSelectionMode,
        difficultyLevel: prefillDifficultyLevel,
        difficultyDistribution: prefillDifficultyDistribution,
        selectedQuestionIds: prefillSelectedQuestionIds
      });
      setEditSelectedQuestions(prefillSelectedQuestionIds)
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
    }catch(err){ setMsg('Failed to load questions') }
  }

  useEffect(() => {
    if (tab !== 'exams' || !editId) return
    if ((editForm.selectionMode || 'random') !== 'manual') return
    loadQuestionsForEdit()
  }, [tab, editId, editForm.selectionMode, editForm.specialtyId, editForm.subspecialtyId, editForm.difficultyLevel])

  function toggleEditSelect(qid){
    setEditSelectedQuestions(prev => {
      const key = String(qid)
      const hasItem = prev.some(x => String(x) === key)
      const next = hasItem ? prev.filter(x => String(x) !== key) : [...prev, qid]
      setEditForm(current => ({
        ...current,
        selectionMode: 'manual',
        selectedQuestionIds: next
      }))
      return next
    })
  }

  function setEditChoice(index, value){
    setEditForm(prev => {
      const current = Array.isArray(prev.choices) ? [...prev.choices] : ['', '', '', '', '']
      while (current.length < 5) current.push('')
      current[index] = value
      return { ...prev, choices: current }
    })
  }

  async function saveEdit(){
    try{
      let images = editImages;
      if (newImageFile){
        const dataUrl = await toDataUrl(newImageFile);
        images = [...editImages, dataUrl];
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
      setExamQuestionsPreview([])
      setExamDifficultyMean(null)
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
    setExamQuestionsPreview([])
    setExamDifficultyMean(null)
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
          return [titleText, stemText, statusText].some(text => text.includes(keyword))
        }
        const titleText = (item.title || '').toLowerCase()
        const specialtyText = (item.specialty?.name || '').toLowerCase()
        const subspecialtyText = (item.subspecialty?.name || '').toLowerCase()
        const modeText = (item.selectionMode || '').toLowerCase()
        return [titleText, specialtyText, subspecialtyText, modeText].some(text => text.includes(keyword))
      })

  return (
    <div className="card container">
      <h3>Manage questions & exams</h3>
      <div style={{ marginBottom: 12 }}>
        <button onClick={()=>setTab('questions')} style={{ fontWeight: tab==='questions'?'bold':'normal' }}>Questions ({questionCount})</button>
        <button onClick={()=>setTab('exams')} style={{ marginLeft: 8, fontWeight: tab==='exams'?'bold':'normal' }}>Exams ({examCount})</button>
      </div>
      {!editId && (
        <div style={{ marginBottom: 12 }}>
          <input
            className="search-box"
            placeholder={tab === 'questions' ? 'Search questions by title, content, status...' : 'Search exams by title, specialty, mode...'}
            value={search}
            onChange={e=>setSearch(e.target.value)}
          />
        </div>
      )}
      {msg && <div className={msg.includes('failed') ? 'msg error' : 'msg success'} style={{ marginBottom: 8 }}>{msg}</div>}
      <div>
        {visibleItems.map(item => (
          <div key={item.id} className="card" style={{ padding: 12, marginBottom: 12, borderLeft: item.status === 'rejected' ? '6px solid #dc3545' : 'none', background: item.status === 'rejected' ? '#fff8f8' : 'white', boxShadow: editId === item.id ? '0 12px 30px rgba(21,128,61,0.14)' : undefined }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <strong>{item.title}</strong>
                {tab==='questions' && <span className="small">(Difficulty: {item.difficulty})</span>}
                {tab==='questions' && item.status === 'rejected' && <span className="badge" style={{ background: '#dc3545', color: 'white', padding: '4px 8px', fontSize: '11px', fontWeight: 600 }}>REJECTED</span>}
                {tab==='questions' && item.status === 'pending' && <span className="badge" style={{ background: '#ffc107', color: '#333', padding: '4px 8px', fontSize: '11px', fontWeight: 600 }}>PENDING</span>}
                {tab==='questions' && item.status === 'approved' && <span className="badge" style={{ background: '#28a745', color: 'white', padding: '4px 8px', fontSize: '11px', fontWeight: 600 }}>APPROVED</span>}
              </div>
              {tab==='questions' && item.status !== 'rejected' && !editId && (
                <div className="small" style={{ marginTop: 6, color: '#555', lineHeight: 1.5 }}>
                  <strong>Stem:</strong> {item.stem || '(no stem)'}
                  {item.body ? <><br /><strong>Details:</strong> {item.body}</> : null}
                </div>
              )}
              {tab==='exams' && !editId && (
                <div className="small" style={{ marginTop: 6, color: '#555', lineHeight: 1.6 }}>
                  <strong>Exam Details:</strong><br />
                  Questions: <strong>{item.questions_count ?? item.numQuestions ?? item.num_questions ?? item.questions?.length ?? 0}</strong>
                  {' • '}Selection: <strong>{item.selectionMode ?? item.config?.selectionMode ?? 'random'}</strong>
                  {' • '}Difficulty: <strong>{item.computedDifficultyLevel ?? item.difficultyLevel ?? item.config?.difficultyLevel ?? '-'}</strong>
                  {item.averageDifficultyScore != null || item.config?.averageDifficultyScore != null ? (
                    <>
                      {' • '}Avg score: <strong>{item.averageDifficultyScore ?? item.config?.averageDifficultyScore}</strong>
                    </>
                  ) : null}
                  <br />
                  Specialty: <strong>{item.specialty?.name || '-'}</strong>
                  {item.subspecialty?.name ? <>{' › '}<strong>{item.subspecialty.name}</strong></> : null}
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
                <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid #ddd', display: 'flex', gap: 8 }}>
                  <button className="btn btn-primary" onClick={()=>startEdit(item)} style={{ flex: 1, filter: 'brightness(0.9)' }}>✏ Edit & Resubmit</button>
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
                    {(Array.isArray(editForm.choices) ? editForm.choices : ['', '', '', '', ''])
                      .slice(0, 5)
                      .map((choice, index) => (
                        <div key={index} style={{ display: 'grid', gridTemplateColumns: '30px 1fr', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                          <strong>{CHOICE_LABELS[index]}.</strong>
                          <input
                            placeholder={`Choice ${CHOICE_LABELS[index]}`}
                            value={choice || ''}
                            onChange={e => setEditChoice(index, e.target.value)}
                            style={{ width: '100%' }}
                          />
                        </div>
                      ))}

                    <label><strong>Correct Answer</strong></label>
                    <select value={editForm.answer||''} onChange={e=>setEditForm({...editForm, answer: e.target.value})} style={{ width: '100%', marginBottom: 6 }}>
                      <option value="">-- select correct answer --</option>
                      {(Array.isArray(editForm.choices) ? editForm.choices : [])
                        .slice(0, 5)
                        .map((choice, index) => (
                          <option key={index} value={choice || ''} disabled={!choice}>
                            {CHOICE_LABELS[index]}. {choice || '(empty)'}
                          </option>
                        ))}
                    </select>

                    <label><strong>Specialty</strong></label>
                    <select value={editForm.specialtyId||''} onChange={e=>{ setEditForm({...editForm, specialtyId: e.target.value}); }} style={{ width: '100%', marginBottom: 6 }}>
                      <option value="">-- select specialty --</option>
                      {specialties.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                    <label><strong>Subspecialty</strong></label>
                    <select value={editForm.subspecialtyId||''} onChange={e=>setEditForm({...editForm, subspecialtyId: e.target.value})} style={{ width: '100%', marginBottom: 6 }}>
                      <option value="">-- select subspecialty --</option>
                      {(specialties.find(s=>String(s.id)===String(editForm.specialtyId))?.subspecialties||[]).map(ss => <option key={ss.id} value={ss.id}>{ss.name}</option>)}
                    </select>
                    <div style={{ marginBottom: 6, padding: 8 }} className="panel">
                      <label><strong>Images</strong></label>
                      {editImages.length > 0 && (
                        <div style={{ marginTop: 8 }}>
                          {editImages.map((img, i) => (
                            <div key={i} style={{ marginBottom: 8 }}>
                              <img src={img} alt={`edit-img-${i}`} className="q-image" style={{ maxHeight: 150 }} />
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
                    <div style={{ marginBottom: 8, padding: 10, border: '1px solid var(--border)', borderRadius: 8, background: 'var(--surface-2)' }}>
                      <div style={{ fontWeight: 700, marginBottom: 4 }}>Mean Difficulty of This Exam</div>
                      <div className="small">
                        {examDifficultyMean != null ? (
                          <>
                            <strong>{examDifficultyMean}</strong> / 5
                            {Array.isArray(examQuestionsPreview) && examQuestionsPreview.length > 0 ? ` (from ${examQuestionsPreview.length} questions)` : ''}
                          </>
                        ) : 'No difficulty data available yet'}
                      </div>
                    </div>

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
                        <select value={editForm.difficultyLevel||'all'} onChange={e=>setEditForm({...editForm, difficultyLevel: e.target.value})} style={{ width: '70%' }} disabled={!!editForm.difficultyDistribution}>
                          <option value="all">All levels (1-5)</option>
                          <option value="easy">Easy (1-2)</option>
                          <option value="medium">Medium (3)</option>
                          <option value="difficult">Difficult (4)</option>
                          <option value="extreme">Extreme difficult (5)</option>
                        </select>
                        <label style={{ display: 'flex', alignItems: 'center' }}>
                          <input type="checkbox" checked={!!editForm.difficultyDistribution} onChange={e=>setEditForm({...editForm, difficultyDistribution: e.target.checked ? (editForm.difficultyDistribution || { '1-3':50, '4':25, '5':25 }) : null })} />
                          <span style={{ marginLeft: 6 }}>Use distribution</span>
                        </label>
                      </div>
                    </div>

                    <label><strong>Number of Questions</strong></label>
                    <input type="number" placeholder="Num questions" value={editForm.numQuestions||10} onChange={e=>setEditForm({...editForm, numQuestions: Number(e.target.value)})} style={{ width: '100%', marginBottom: 6 }} />
                    <label><strong>Specialty</strong></label>
                    <select value={editForm.specialtyId||''} onChange={e=>setEditForm({...editForm, specialtyId: e.target.value})} style={{ width: '100%', marginBottom: 6 }}>
                      <option value="">-- select specialty --</option>
                      {specialties.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                    <label><strong>Subspecialty</strong></label>
                    <select value={editForm.subspecialtyId||''} onChange={e=>setEditForm({...editForm, subspecialtyId: e.target.value})} style={{ width: '100%', marginBottom: 6 }}>
                      <option value="">-- select subspecialty --</option>
                      {(specialties.find(s=>String(s.id)===String(editForm.specialtyId))?.subspecialties||[]).map(ss => <option key={ss.id} value={ss.id}>{ss.name}</option>)}
                    </select>

                    { editForm.difficultyDistribution && (
                      <div style={{ marginTop: 8, padding: 8, border: '1px dashed var(--border)', borderRadius: 6 }}>
                        <div className="small">Distribution</div>
                        <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                          <div>
                            <label>Levels 1–3</label>
                            <input type="number" min={0} max={100} value={editForm.difficultyDistribution['1-3']||0} onChange={e=>setEditForm({...editForm, difficultyDistribution: {...editForm.difficultyDistribution, '1-3': Number(e.target.value)}})} style={{ width: 80 }} />
                          </div>
                          <div>
                            <label>Level 4</label>
                            <input type="number" min={0} max={100} value={editForm.difficultyDistribution['4']||0} onChange={e=>setEditForm({...editForm, difficultyDistribution: {...editForm.difficultyDistribution, '4': Number(e.target.value)}})} style={{ width: 80 }} />
                          </div>
                          <div>
                            <label>Level 5</label>
                            <input type="number" min={0} max={100} value={editForm.difficultyDistribution['5']||0} onChange={e=>setEditForm({...editForm, difficultyDistribution: {...editForm.difficultyDistribution, '5': Number(e.target.value)}})} style={{ width: 80 }} />
                          </div>
                        </div>
                        <div className="small" style={{ marginTop: 6 }}>Total: {( (editForm.difficultyDistribution['1-3']||0) + (editForm.difficultyDistribution['4']||0) + (editForm.difficultyDistribution['5']||0) )}%</div>
                      </div>
                    )}

                    { (editForm.selectionMode || 'random') === 'manual' && (
                      <div style={{ marginTop: 8, padding: 8, border: '1px dashed var(--border)', borderRadius: 6 }}>
                        <div style={{ marginBottom: 6 }}>
                          <button type="button" className="btn" onClick={loadQuestionsForEdit}>Load questions</button>
                          <span className="small" style={{ marginLeft: 8 }}>Choose questions to include in this exam</span>
                        </div>
                        <div style={{ maxHeight: 220, overflow: 'auto' }}>
                          {availableQuestionsForEdit.map(q => {
                              const isSelected = editSelectedQuestions.some(x => String(x) === String(q.id))
                              return (
                            <div key={q.id} style={{ display: 'flex', gap: 8, padding: 6, borderBottom: '1px solid var(--border)', borderLeft: isSelected ? '6px solid var(--brand-green)' : '4px solid transparent', background: isSelected ? 'linear-gradient(90deg, var(--brand-light-green), var(--surface-2))' : 'transparent', boxShadow: isSelected ? '0 8px 20px rgba(21,128,61,0.10)' : 'none', borderRadius: isSelected ? 8 : 0 }}>
                              <input type="checkbox" checked={isSelected} onChange={()=>toggleEditSelect(q.id)} />
                              <div>
                                <div style={{ fontWeight: 700 }}>{q.title} <span className="small">(diff {q.difficulty})</span> {isSelected && <span className="badge" style={{ marginLeft: 6, background: 'var(--brand-green)', color: '#fff', border: '1px solid var(--brand-green)' }}>Selected</span>}</div>
                                <div className="small">{q.stem}</div>
                              </div>
                            </div>
                          )})}
                        </div>
                        <div className="small" style={{ marginTop: 6 }}>Selected: {editSelectedQuestions.length}</div>
                      </div>
                    )}

                    <div style={{ marginTop: 10, padding: 10, border: '1px solid var(--border)', borderRadius: 8 }}>
                      <div style={{ fontWeight: 700, marginBottom: 8 }}>Questions in This Exam (Topic/Detail)</div>
                      <div className="small" style={{ marginBottom: 8 }}>
                        Use checkbox to keep/remove each question in this exam. To add new questions, choose from the manual list above.
                      </div>
                      {examQuestionsPreview.length === 0 ? (
                        <div className="small">No question details available for this exam.</div>
                      ) : (
                        <div style={{ maxHeight: 260, overflow: 'auto' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '42px minmax(220px, 1fr) 110px minmax(260px, 1.4fr)', gap: 8, padding: '6px 0', borderBottom: '2px solid var(--border)', fontWeight: 700, fontSize: 12 }}>
                            <div>Select</div>
                            <div>Topic</div>
                            <div>Difficulty</div>
                            <div>Detail</div>
                          </div>
                          {examQuestionsPreview.map((q, index) => (
                            <div key={q.id || index} style={{ display: 'grid', gridTemplateColumns: '42px minmax(220px, 1fr) 110px minmax(260px, 1.4fr)', gap: 8, alignItems: 'start', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                              <div>
                                <input
                                  type="checkbox"
                                  checked={editSelectedQuestions.some(x => String(x) === String(q.id))}
                                  onChange={()=>toggleEditSelect(q.id)}
                                  style={{ marginTop: 2 }}
                                />
                              </div>
                              <div style={{ fontWeight: 600 }}>
                                {index + 1}. {q.title || q.topic || '(untitled question)'}
                              </div>
                              <div className="small" style={{ fontWeight: 600 }}>
                                {q.difficulty ? `Level ${q.difficulty}` : '-'}
                              </div>
                              <div className="small" style={{ lineHeight: 1.45 }}>
                                {q.body || q.stem || q.detail || '(no detail)'}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}
                <button className="btn btn-primary" onClick={saveEdit} style={{ marginRight: 6 }}>Save</button>
                <button className="btn btn-ghost" onClick={cancelEdit}>Cancel</button>
              </div>
            ) : (
              <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                {canEditItem(item) ? (
                  <>
                    {!(tab==='questions' && item.status === 'rejected') && (
                      <>
                        <button className="btn btn-primary" onClick={()=>startEdit(item)} style={{ flex: 1, fontWeight: item.status === 'rejected' ? 600 : 'normal', background: item.status === 'rejected' ? '#ffc107' : undefined, color: item.status === 'rejected' ? '#222' : undefined, filter: item.status === 'rejected' ? undefined : 'brightness(0.9)' }}>
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
        ))}
        {!editId && visibleItems.length === 0 && <div className="small">No items found</div>}
      </div>
    </div>
  )
}
