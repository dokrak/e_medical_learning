import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'

export default function AdminUserManagement(){
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student'
  })

  useEffect(() => { loadUsers() }, [])

  async function loadUsers(){
    try {
      setLoading(true)
      const r = await api.get('/admin/users')
      setUsers(r.data)
    } catch(err) {
      setMsg('Failed to load users: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  function resetForm(){
    setFormData({ name: '', email: '', password: '', role: 'student' })
    setEditingId(null)
    setShowForm(false)
    setMsg('')
  }

  function handleEditClick(user){
    setEditingId(user.id)
    setFormData({ name: user.name, email: user.email, password: '', role: user.role })
    setShowForm(true)
  }

  async function handleSubmit(e){
    e.preventDefault()
    
    if (!formData.name || !formData.email || !formData.role) {
      setMsg('Name, email, and role are required')
      return
    }

    if (!editingId && !formData.password) {
      setMsg('Password is required for new users')
      return
    }

    try {
      setLoading(true)
      if (editingId) {
        // Edit existing user
        const payload = { name: formData.name, email: formData.email, role: formData.role }
        if (formData.password) payload.password = formData.password
        const r = await api.put(`/admin/users/${editingId}`, payload)
        setMsg('User updated successfully')
        setUsers(users.map(u => u.id === editingId ? r.data : u))
      } else {
        // Create new user
        const r = await api.post('/admin/users', formData)
        setMsg('User created successfully')
        setUsers([...users, r.data])
      }
      resetForm()
    } catch(err) {
      setMsg('Error: ' + (err.response?.data?.error || err.message))
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id){
    if (!confirm('Are you sure you want to delete this user?')) return
    try {
      setLoading(true)
      await api.delete(`/admin/users/${id}`)
      setMsg('User deleted successfully')
      setUsers(users.filter(u => u.id !== id))
    } catch(err) {
      setMsg('Delete failed: ' + (err.response?.data?.error || err.message))
    } finally {
      setLoading(false)
    }
  }

  const roles = [
    { value: 'student', label: 'Student' },
    { value: 'clinician', label: 'Clinician (Question Creator)' },
    { value: 'moderator', label: 'Moderator (Approver)' },
    { value: 'admin', label: 'Administrator' }
  ]

  return (
    <div className="card container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2>👥 Admin User Management</h2>
        <Link to="/manage" className="btn btn-ghost">Back</Link>
      </div>

      {msg && (
        <div className={`msg ${msg.includes('Error') || msg.includes('Failed') ? 'error' : 'success'}`} style={{ marginBottom: 12 }}>
          {msg}
        </div>
      )}

      {/* Create/Edit Form */}
      {showForm && (
        <div style={{ padding: 16, background: '#f0fdf7', border: '2px solid var(--brand-green)', borderRadius: 8, marginBottom: 20 }}>
          <h3>{editingId ? 'Edit User' : 'Create New User'}</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 12 }}>
              <label>Name *</label>
              <input 
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Full name"
                required
              />
            </div>

            <div style={{ marginBottom: 12 }}>
              <label>Email *</label>
              <input 
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="user@example.com"
                required
              />
            </div>

            <div style={{ marginBottom: 12 }}>
              <label>Password {editingId ? '(leave blank to keep current)' : '*'}</label>
              <input 
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                placeholder={editingId ? 'Password (optional)' : 'Password'}
                required={!editingId}
              />
            </div>

            <div style={{ marginBottom: 12 }}>
              <label>Role *</label>
              <select 
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                required
              >
                {roles.map(r => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {editingId ? 'Update User' : 'Create User'}
              </button>
              <button type="button" className="btn btn-ghost" onClick={resetForm}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Create Button */}
      {!showForm && (
        <div style={{ marginBottom: 20 }}>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            + Create New User
          </button>
        </div>
      )}

      {/* Users List */}
      <div>
        <h3 style={{ marginBottom: 16 }}>Existing Users ({users.length})</h3>
        
        {loading && !users.length && <div>Loading users...</div>}
        
        {users.length === 0 && !loading && (
          <div className="panel">No users yet. Create one to get started.</div>
        )}

        {users.length > 0 && (
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left' }}>Name</th>
                  <th style={{ textAlign: 'left' }}>Email</th>
                  <th style={{ textAlign: 'center' }}>Role</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '12px 0' }}>
                      <strong>{user.name}</strong>
                    </td>
                    <td style={{ padding: '12px 0', fontSize: 13 }}>
                      {user.email}
                    </td>
                    <td style={{ padding: '12px 0', textAlign: 'center' }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: 12,
                        fontSize: 12,
                        fontWeight: 600,
                        background: user.role === 'admin' ? 'rgba(139, 92, 246, 0.1)' : 
                                   user.role === 'moderator' ? 'rgba(59, 130, 246, 0.1)' :
                                   user.role === 'clinician' ? 'rgba(34, 197, 94, 0.1)' :
                                   'rgba(107, 114, 128, 0.1)',
                        color: user.role === 'admin' ? '#8b5cf6' :
                               user.role === 'moderator' ? '#3b82f6' :
                               user.role === 'clinician' ? '#22c55e' :
                               '#6b7280'
                      }}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    </td>
                    <td style={{ padding: '12px 0', textAlign: 'center' }}>
                      <button
                        className="btn btn-small"
                        onClick={() => handleEditClick(user)}
                        style={{ marginRight: 8 }}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        className="btn btn-small"
                        onClick={() => handleDelete(user.id)}
                        style={{ background: 'rgba(220, 38, 38, 0.1)', color: '#dc2626' }}
                      >
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Role Reference */}
      <div style={{ marginTop: 24, padding: 16, background: '#f0f9ff', border: '1px solid #bfdbfe', borderRadius: 8 }}>
        <h4>User Roles Guide</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginTop: 12 }}>
          <div>
            <strong>👤 Student</strong>
            <div className="small" style={{ marginTop: 4 }}>Can take exams and view personal statistics and reports</div>
          </div>
          <div>
            <strong>🏥 Clinician</strong>
            <div className="small" style={{ marginTop: 4 }}>Can create and upload exam questions for moderation</div>
          </div>
          <div>
            <strong>✅ Moderator</strong>
            <div className="small" style={{ marginTop: 4 }}>Can approve or reject questions submitted by clinicians</div>
          </div>
          <div>
            <strong>🔐 Administrator</strong>
            <div className="small" style={{ marginTop: 4 }}>Can manage all users, view analytics, and system settings</div>
          </div>
        </div>
      </div>
    </div>
  )
}
