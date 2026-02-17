import React, { useEffect, useState } from 'react'
import api from '../api'

export default function ModeratorQueue(){
  const [list, setList] = useState([])
  const [msg, setMsg] = useState('')

  async function load(){
    try{
      const r = await api.get('/pending-questions')
      setList(r.data)
    }catch(err){
      setMsg('Load failed — ensure you are logged in as admin/moderator')
    }
  }

  useEffect(()=>{ load() }, [])

  async function approve(id){
    try{
      await api.post(`/questions/${id}/approve`)
      setMsg('Approved')
      load()
    }catch(err){ setMsg('Approve failed') }
  }

  async function sendBack(id){
    const feedback = window.prompt('Feedback to creator (optional):', '')
    if (feedback === null) return
    try{
      await api.post(`/questions/${id}/reject`, { feedback })
      setMsg('Sent back to creator')
      load()
    }catch(err){ setMsg('Send back failed') }
  }

  return (
    <div className="card container">
      <h3>Moderator queue</h3>
      {msg && <div>{msg}</div>}
      {list.length===0 ? <div>No pending items</div> : (
        list.map(q => (
          <div key={q.id} className="card" style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div style={{ flex: 1 }}>
                <div><strong style={{ fontSize: 16 }}>{q.title}</strong> <span className="small" style={{ color: '#666' }}>Difficulty: {q.difficulty}/5</span></div>
                
                <div style={{ marginTop: 8, padding: 8, backgroundColor: '#f5f5f5', borderRadius: 4 }}>
                  <div className="small" style={{ fontWeight: 600, marginBottom: 4 }}>Question:</div>
                  <div className="small">{q.stem}</div>
                </div>

                <div style={{ marginTop: 8, padding: 8, backgroundColor: '#f5f5f5', borderRadius: 4 }}>
                  <div className="small" style={{ fontWeight: 600, marginBottom: 4 }}>Detail:</div>
                  <div className="small">{q.body}</div>
                </div>

                {q.images && q.images.length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    <div className="small" style={{ fontWeight: 600, marginBottom: 4 }}>Images:</div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {q.images.map((img, i) => (
                        <img key={i} src={img} alt={`q-img-${i}`} style={{ maxHeight: 150, maxWidth: 200, borderRadius: 4 }} />
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ marginTop: 8, padding: 8, backgroundColor: '#fffbea', borderRadius: 4, border: '1px solid #ffc107' }}>
                  <div className="small" style={{ fontWeight: 600, marginBottom: 6 }}>Choices:</div>
                  {q.choices && q.choices.map((choice, i) => (
                    <div key={i} style={{ marginBottom: 8, display: 'grid', gridTemplateColumns: '24px 1fr auto', alignItems: 'start', columnGap: 10 }}>
                      <input type="radio" disabled checked={choice === q.answer} readOnly style={{ marginTop: 4 }} />
                      <span className="small" style={{ lineHeight: 1.45, wordBreak: 'break-word' }}>{i+1}. {choice}</span>
                      <span>{choice === q.answer && <span className="badge badge-success">✓ Correct</span>}</span>
                    </div>
                  ))}
                </div>

                {q.specialtyId && (
                  <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
                    📌 Specialty: {q.specialty?.name || 'N/A'} {q.subspecialty?.name ? ` → ${q.subspecialty.name}` : ''}
                  </div>
                )}
              </div>

              <div style={{ marginLeft: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button className="btn btn-primary" onClick={()=>approve(q.id)} style={{ whiteSpace: 'nowrap' }}>✓ Approve</button>
                <button className="btn btn-danger" onClick={()=>sendBack(q.id)} style={{ whiteSpace: 'nowrap' }}>↩ Send back</button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
