import React, { useState, useEffect } from 'react'
import api from '../api'

export default function ManageQuestionsExams(){
  const [tab, setTab] = useState('questions')
  const [items, setItems] = useState([])
  const [editId, setEditId] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [editImages, setEditImages] = useState([])
  const [newImageFile, setNewImageFile] = useState(null)
  const [msg, setMsg] = useState('')
  const [specialties, setSpecialties] = useState([])
  const currentUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null

  useEffect(()=>{ loadSpecialties() }, [])
  useEffect(()=>{ loadItems() }, [tab])

  async function loadSpecialties(){
    try{ const r = await api.get('/specialties'); setSpecialties(r.data); } catch(e){ }
  }

  async function loadItems(){
    try{
      if (tab === 'questions'){
        const r = await api.get('/my-questions');
        setItems(r.data);
      } else {
        const r = await api.get('/exams');
        setItems(r.data);
      }
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

  async function startEdit(item){
    setEditId(item.id);
    if (tab === 'questions'){
      setEditImages(item.images || []);
      setNewImageFile(null);
      setEditForm({
        title: item.title,
        stem: item.stem,
        body: item.body,
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
    setEditSelectedQuestions(prev => prev.includes(qid) ? prev.filter(x=>x!==qid) : [...prev, qid])
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

  return (
    <div className="card container">
      <h3>Manage questions & exams</h3>
      <div style={{ marginBottom: 12 }}>
        <button onClick={()=>setTab('questions')} style={{ fontWeight: tab==='questions'?'bold':'normal' }}>Questions ({items.length})</button>
        <button onClick={()=>setTab('exams')} style={{ marginLeft: 8, fontWeight: tab==='exams'?'bold':'normal' }}>Exams ({items.length})</button>
      </div>
      {msg && <div className={msg.includes('failed') ? 'msg error' : 'msg success'} style={{ marginBottom: 8 }}>{msg}</div>}
      <div>
        {items.map(item => (
          <div key={item.id} className="card" style={{ padding: 12, marginBottom: 12 }}>
            <div>
              <strong>{item.title}</strong> {tab==='questions' && <span className="small">(Difficulty: {item.difficulty})</span>}
              {tab==='questions' && (
                <span className="small" style={{ marginLeft: 8 }}>
                  Status: <strong>{item.status || 'pending'}</strong>
                </span>
              )}
            </div>
            {tab==='questions' && item.status === 'rejected' && item.moderationFeedback && (
              <div className="small" style={{ marginTop: 6, padding: 8, background: '#fff5f5', border: '1px solid #f5c2c7', borderRadius: 6 }}>
                <strong>Moderator feedback:</strong> {item.moderationFeedback}
              </div>
            )}
            {editId === item.id ? (
              <div style={{ marginTop: 8 }}>
                <input placeholder="Title" value={editForm.title||''} onChange={e=>setEditForm({...editForm, title: e.target.value})} style={{ width: '100%', marginBottom: 6 }} />
                {tab === 'questions' ? (
                  <>
                    <textarea placeholder="Stem" value={editForm.stem||''} onChange={e=>setEditForm({...editForm, stem: e.target.value})} style={{ width: '100%', marginBottom: 6 }} rows={2} />
                    <textarea placeholder="Body" value={editForm.body||''} onChange={e=>setEditForm({...editForm, body: e.target.value})} style={{ width: '100%', marginBottom: 6 }} rows={2} />
                    <input type="number" min={1} max={5} placeholder="Difficulty" value={editForm.difficulty||3} onChange={e=>setEditForm({...editForm, difficulty: Number(e.target.value)})} style={{ width: '100%', marginBottom: 6 }} />
                    <input placeholder="Answer" value={editForm.answer||''} onChange={e=>setEditForm({...editForm, answer: e.target.value})} style={{ width: '100%', marginBottom: 6 }} />
                    <select value={editForm.specialtyId||''} onChange={e=>{ setEditForm({...editForm, specialtyId: e.target.value}); }} style={{ width: '100%', marginBottom: 6 }}>
                      <option value="">-- select specialty --</option>
                      {specialties.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                    <select value={editForm.subspecialtyId||''} onChange={e=>setEditForm({...editForm, subspecialtyId: e.target.value})} style={{ width: '100%', marginBottom: 6 }}>
                      <option value="">-- select subspecialty --</option>
                      {(specialties.find(s=>s.id===editForm.specialtyId)?.subspecialties||[]).map(ss => <option key={ss.id} value={ss.id}>{ss.name}</option>)}
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
                          <input type="checkbox" checked={!!editForm.difficultyDistribution} onChange={e=>setEditForm({...editForm, difficultyDistribution: e.target.checked ? (editForm.difficultyDistribution || { '1-3':50, '4':25, '5':25 }) : null })} />
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
                      {(specialties.find(s=>s.id===editForm.specialtyId)?.subspecialties||[]).map(ss => <option key={ss.id} value={ss.id}>{ss.name}</option>)}
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
                          {availableQuestionsForEdit.map(q => (
                            <div key={q.id} style={{ display: 'flex', gap: 8, padding: 6, borderBottom: '1px solid var(--border)' }}>
                              <input type="checkbox" checked={editSelectedQuestions.includes(q.id)} onChange={()=>toggleEditSelect(q.id)} />
                              <div>
                                <div style={{ fontWeight: 700 }}>{q.title} <span className="small">(diff {q.difficulty})</span></div>
                                <div className="small">{q.stem}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="small" style={{ marginTop: 6 }}>Selected: {editSelectedQuestions.length}</div>
                      </div>
                    )}
                  </>
                )}
                <button className="btn btn-primary" onClick={saveEdit} style={{ marginRight: 6 }}>Save</button>
                <button className="btn btn-ghost" onClick={()=>setEditId(null)}>Cancel</button>
              </div>
            ) : (
              <div style={{ marginTop: 8 }}>
                {currentUser && (item.createdBy === currentUser.id || currentUser.role === 'admin') ? (
                  <>
                    <button className="btn" onClick={()=>startEdit(item)} style={{ marginRight: 6 }}>Edit</button>
                    <button className="btn btn-danger" onClick={()=>deleteItem(item.id)}>Delete</button>
                  </>
                ) : (
                  <div className="small" style={{ color: '#999', fontStyle: 'italic' }}>You can only edit/delete your own items</div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
