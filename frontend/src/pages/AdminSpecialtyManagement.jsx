import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'

export default function AdminSpecialtyManagement(){
  const [specialties, setSpecialties] = useState([])
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const [mainName, setMainName] = useState('')
  const [parentId, setParentId] = useState('')
  const [subName, setSubName] = useState('')

  useEffect(() => { loadSpecialties() }, [])

  const sortedSpecialties = useMemo(() => {
    return [...specialties].sort((a, b) => (a.name || '').localeCompare(b.name || ''))
  }, [specialties])

  function extractApiError(err, fallback = 'Request failed'){
    const data = err?.response?.data
    if (data?.errors && typeof data.errors === 'object') {
      const firstField = Object.keys(data.errors)[0]
      const firstMessage = firstField && Array.isArray(data.errors[firstField]) ? data.errors[firstField][0] : null
      if (firstMessage) return firstMessage
    }
    return data?.message || data?.error || err?.message || fallback
  }

  async function loadSpecialties(){
    try {
      setLoading(true)
      const r = await api.get('/admin/specialties')
      const normalized = (r.data || []).map(s => ({
        ...s,
        children: s.children || []
      }))
      setSpecialties(normalized)
      if (!parentId && normalized.length) setParentId(String(normalized[0].id))
    } catch (err) {
      setMsg('Failed to load specialties: ' + extractApiError(err))
    } finally {
      setLoading(false)
    }
  }

  async function createMain(e){
    e.preventDefault()
    const name = mainName.trim()
    if (!name) {
      setMsg('Main specialty name is required')
      return
    }

    try {
      setLoading(true)
      await api.post('/admin/specialties', { name })
      setMainName('')
      setMsg('Main specialty created successfully')
      await loadSpecialties()
    } catch (err) {
      setMsg('Error: ' + extractApiError(err, 'Failed to create main specialty'))
    } finally {
      setLoading(false)
    }
  }

  async function createSub(e){
    e.preventDefault()
    const name = subName.trim()
    if (!parentId) {
      setMsg('Please select a parent specialty')
      return
    }
    if (!name) {
      setMsg('Subspecialty name is required')
      return
    }

    try {
      setLoading(true)
      await api.post(`/admin/specialties/${parentId}/subspecialties`, { name })
      setSubName('')
      setMsg('Subspecialty created successfully')
      await loadSpecialties()
    } catch (err) {
      setMsg('Error: ' + extractApiError(err, 'Failed to create subspecialty'))
    } finally {
      setLoading(false)
    }
  }

  async function deleteItem(item){
    const label = item.parent_id ? 'subspecialty' : 'main specialty'
    if (!window.confirm(`Delete ${label} \"${item.name}\"?`)) return

    try {
      setLoading(true)
      await api.delete(`/admin/specialties/${item.id}`)
      setMsg('Deleted successfully')
      await loadSpecialties()
    } catch (err) {
      setMsg('Delete failed: ' + extractApiError(err, 'Failed to delete specialty'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2>🧭 Specialty Management</h2>
        <Link to="/manage" className="btn btn-ghost">Back</Link>
      </div>

      {msg && (
        <div className={`msg ${msg.includes('Error') || msg.includes('Failed') || msg.includes('Delete failed') ? 'error' : 'success'}`} style={{ marginBottom: 12 }}>
          {msg}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
        <form onSubmit={createMain} style={{ padding: 14, border: '1px solid var(--border)', borderRadius: 8 }}>
          <h3 style={{ marginTop: 0 }}>Add Main Specialty</h3>
          <input
            value={mainName}
            onChange={(e) => setMainName(e.target.value)}
            placeholder="e.g. Cardiology"
            disabled={loading}
          />
          <div style={{ marginTop: 10 }}>
            <button className="btn btn-primary" type="submit" disabled={loading}>Create Main Specialty</button>
          </div>
        </form>

        <form onSubmit={createSub} style={{ padding: 14, border: '1px solid var(--border)', borderRadius: 8 }}>
          <h3 style={{ marginTop: 0 }}>Add Subspecialty</h3>
          <select value={parentId} onChange={(e) => setParentId(e.target.value)} disabled={loading}>
            <option value="">-- select parent specialty --</option>
            {sortedSpecialties.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <input
            value={subName}
            onChange={(e) => setSubName(e.target.value)}
            placeholder="e.g. Interventional Cardiology"
            disabled={loading}
            style={{ marginTop: 8 }}
          />
          <div style={{ marginTop: 10 }}>
            <button className="btn btn-primary" type="submit" disabled={loading}>Create Subspecialty</button>
          </div>
        </form>
      </div>

      <div>
        <h3>Current Taxonomy ({sortedSpecialties.length} main specialties)</h3>
        {loading && !sortedSpecialties.length && <div>Loading specialties...</div>}
        {!sortedSpecialties.length && !loading && <div className="panel">No specialties found.</div>}

        {sortedSpecialties.map(main => (
          <div key={main.id} style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 12, marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong>{main.name}</strong>
              <button className="btn btn-small" onClick={() => deleteItem(main)} style={{ background: 'rgba(220, 38, 38, 0.1)', color: '#dc2626' }}>
                Delete Main
              </button>
            </div>

            <div style={{ marginTop: 8 }} className="small">
              Subspecialties: {(main.children || []).length}
            </div>

            {(main.children || []).length > 0 && (
              <div style={{ marginTop: 8, display: 'grid', gap: 6 }}>
                {main.children
                  .slice()
                  .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
                  .map(sub => (
                    <div key={sub.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 8px', borderRadius: 6, background: 'var(--surface-2)' }}>
                      <span>{sub.name}</span>
                      <button className="btn btn-small" onClick={() => deleteItem(sub)} style={{ background: 'rgba(220, 38, 38, 0.1)', color: '#dc2626' }}>
                        Delete
                      </button>
                    </div>
                  ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
