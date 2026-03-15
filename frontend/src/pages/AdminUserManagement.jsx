import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'
import { useLang } from '../LangContext'

export default function AdminUserManagement(){
  const { t } = useLang()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const [msgType, setMsgType] = useState('success')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    hospital: '',
    province: '',
    line_id: ''
  })
  const [pictureFile, setPictureFile] = useState(null)
  const [picturePreview, setPicturePreview] = useState(null)
  const [lightbox, setLightbox] = useState(null)

  useEffect(() => { loadUsers() }, [])

  async function loadUsers(){
    try {
      setLoading(true)
      const r = await api.get('/admin/users')
      setUsers(r.data)
    } catch(err) {
      setMsgType('error'); setMsg(t('failed') + ': ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  function resetForm(){
    setFormData({ name: '', email: '', password: '', role: 'student', hospital: '', province: '', line_id: '' })
    setPictureFile(null)
    setPicturePreview(null)
    setEditingId(null)
    setShowForm(false)
    setMsg('')
  }

  function handleEditClick(user){
    setEditingId(user.id)
    setFormData({ name: user.name, email: user.email, password: '', role: user.role, hospital: user.hospital || '', province: user.province || '', line_id: user.line_id || '' })
    setPictureFile(null)
    setPicturePreview(user.profile_picture ? `http://localhost:8000${user.profile_picture}` : null)
    setShowForm(true)
  }

  async function handleSubmit(e){
    e.preventDefault()
    
    if (!formData.name || !formData.email || !formData.role) {
      setMsgType('error'); setMsg(t('nameEmailRoleRequired'))
      return
    }

    if (!editingId && !formData.password) {
      setMsgType('error'); setMsg(t('passwordRequired'))
      return
    }

    try {
      setLoading(true)
      const fd = new FormData()
      fd.append('name', formData.name)
      fd.append('email', formData.email)
      fd.append('role', formData.role)
      if (formData.hospital) fd.append('hospital', formData.hospital)
      if (formData.province) fd.append('province', formData.province)
      if (formData.line_id) fd.append('line_id', formData.line_id)

      if (editingId) {
        if (formData.password) fd.append('password', formData.password)
        if (pictureFile) fd.append('profile_picture', pictureFile)
        fd.append('_method', 'PUT')
        const r = await api.post(`/admin/users/${editingId}`, fd)
        setMsg(t('userUpdated'))
        setUsers(users.map(u => u.id === editingId ? r.data : u))
      } else {
        fd.append('password', formData.password)
        if (pictureFile) fd.append('profile_picture', pictureFile)
        const r = await api.post('/admin/users', fd)
        setMsg(t('userCreated'))
        setUsers([...users, r.data])
      }
      resetForm()
    } catch(err) {
      setMsgType('error'); setMsg(t('error') + ': ' + (err.response?.data?.error || err.response?.data?.message || err.message))
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id){
    if (!confirm(t('confirmDelete'))) return
    try {
      setLoading(true)
      await api.delete(`/admin/users/${id}`)
      setMsg(t('userDeleted'))
      setUsers(users.filter(u => u.id !== id))
    } catch(err) {
      setMsgType('error'); setMsg(t('failed') + ': ' + (err.response?.data?.error || err.message))
    } finally {
      setLoading(false)
    }
  }

  const roles = [
    { value: 'student', label: t('roleStudent') },
    { value: 'resident', label: t('roleResident') },
    { value: 'fellow', label: t('roleFellow') },
    { value: 'clinician', label: t('roleClinician') },
    { value: 'moderator', label: t('roleModerator') },
    { value: 'admin', label: t('roleAdmin') }
  ]

  return (
    <div className="card container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2>{t('adminUserMgmt')}</h2>
        <Link to="/manage" className="btn btn-ghost">{t('back')}</Link>
      </div>

      {msg && (
        <div className={`msg ${msgType}`} style={{ marginBottom: 12 }}>
          {msg}
        </div>
      )}

      {/* Create/Edit Form */}
      {showForm && (
        <div style={{ padding: 16, background: '#f0fdf7', border: '2px solid var(--brand-green)', borderRadius: 8, marginBottom: 20 }}>
          <h3>{editingId ? t('editUser') : t('createNewUser')}</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 12 }}>
              <label>{t('name')} *</label>
              <input 
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder={t('fullName')}
                required
              />
            </div>

            <div style={{ marginBottom: 12 }}>
              <label>{t('email')} *</label>
              <input 
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="user@example.com"
                required
              />
            </div>

            <div style={{ marginBottom: 12 }}>
              <label>{t('password')} {editingId ? t('passwordOptional') : '*'}</label>
              <input 
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                placeholder={t('password')}
                required={!editingId}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label>{t('hospital')}</label>
                <input 
                  type="text"
                  value={formData.hospital}
                  onChange={(e) => setFormData({...formData, hospital: e.target.value})}
                  placeholder={t('hospital')}
                />
              </div>
              <div>
                <label>{t('province')}</label>
                <input 
                  type="text"
                  value={formData.province}
                  onChange={(e) => setFormData({...formData, province: e.target.value})}
                  placeholder={t('province')}
                />
              </div>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label>{t('lineId')}</label>
              <input 
                type="text"
                value={formData.line_id}
                onChange={(e) => setFormData({...formData, line_id: e.target.value})}
                placeholder={t('lineId')}
              />
            </div>

            <div style={{ marginBottom: 12 }}>
              <label>{t('role')} *</label>
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

            <div style={{ marginBottom: 12 }}>
              <label>{t('profilePicture')}</label>
              {picturePreview && (
                <div style={{ marginBottom: 8 }}>
                  <img src={picturePreview} alt="Preview" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border)' }} />
                </div>
              )}
              <input 
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                onChange={(e) => {
                  const file = e.target.files[0]
                  if (file) {
                    setPictureFile(file)
                    setPicturePreview(URL.createObjectURL(file))
                  }
                }}
              />
              <div className="small" style={{ marginTop: 4, color: '#6b7280' }}>{t('maxFileSize')}</div>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {editingId ? t('updateUser') : t('createUser')}
              </button>
              <button type="button" className="btn btn-ghost" onClick={resetForm}>
                {t('cancel')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Create Button */}
      {!showForm && (
        <div style={{ marginBottom: 20 }}>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            + {t('createNewUser')}
          </button>
        </div>
      )}

      {/* Users List */}
      <div>
        <h3 style={{ marginBottom: 16 }}>{t('existingUsers')} ({users.length})</h3>
        
        {loading && !users.length && <div>{t('loadingUsers')}</div>}
        
        {users.length === 0 && !loading && (
          <div className="panel">{t('noUsers')}</div>
        )}

        {users.length > 0 && (
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th style={{ textAlign: 'center', width: 60 }}>{t('picture')}</th>
                  <th style={{ textAlign: 'left' }}>{t('name')}</th>
                  <th style={{ textAlign: 'left' }}>{t('email')}</th>
                  <th style={{ textAlign: 'left' }}>{t('hospital')}</th>
                  <th style={{ textAlign: 'center' }}>{t('role')}</th>
                  <th style={{ textAlign: 'center' }}>{t('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '12px 0', textAlign: 'center' }}>
                      {user.profile_picture ? (
                        <img src={`http://localhost:8000${user.profile_picture}`} alt={user.name}
                          onClick={() => setLightbox({ src: `http://localhost:8000${user.profile_picture}`, name: user.name })}
                          style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', cursor: 'pointer' }} />
                      ) : (
                        <span style={{ display: 'inline-flex', width: 40, height: 40, borderRadius: '50%', background: '#e5e7eb', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '12px 0' }}>
                      <strong>{user.name}</strong>
                    </td>
                    <td style={{ padding: '12px 0', fontSize: 13 }}>
                      {user.email}
                    </td>
                    <td style={{ padding: '12px 0', fontSize: 13 }}>
                      {user.hospital && <div>{user.hospital}</div>}
                      {user.province && <div style={{ color: '#6b7280', fontSize: 12 }}>{user.province}</div>}
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
                                   user.role === 'resident' ? 'rgba(249, 115, 22, 0.1)' :
                                   user.role === 'fellow' ? 'rgba(236, 72, 153, 0.1)' :
                                   'rgba(107, 114, 128, 0.1)',
                        color: user.role === 'admin' ? '#8b5cf6' :
                               user.role === 'moderator' ? '#3b82f6' :
                               user.role === 'clinician' ? '#22c55e' :
                               user.role === 'resident' ? '#f97316' :
                               user.role === 'fellow' ? '#ec4899' :
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
                        ✏️ {t('edit')}
                      </button>
                      <button
                        className="btn btn-small"
                        onClick={() => handleDelete(user.id)}
                        style={{ background: 'rgba(220, 38, 38, 0.1)', color: '#dc2626' }}
                      >
                        🗑️ {t('delete')}
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
        <h4>{t('userRolesGuide')}</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginTop: 12 }}>
          <div>
            <strong>👤 {t('roleStudent')}</strong>
            <div className="small" style={{ marginTop: 4 }}>{t('roleStudentDesc')}</div>
          </div>
          <div>
            <strong>🩺 {t('roleResident')}</strong>
            <div className="small" style={{ marginTop: 4 }}>{t('roleResidentDesc')}</div>
          </div>
          <div>
            <strong>🎓 {t('roleFellow')}</strong>
            <div className="small" style={{ marginTop: 4 }}>{t('roleFellowDesc')}</div>
          </div>
          <div>
            <strong>🏥 {t('roleClinician')}</strong>
            <div className="small" style={{ marginTop: 4 }}>{t('roleClinicianDesc')}</div>
          </div>
          <div>
            <strong>✅ {t('roleModerator')}</strong>
            <div className="small" style={{ marginTop: 4 }}>{t('roleModeratorDesc')}</div>
          </div>
          <div>
            <strong>🔐 {t('roleAdmin')}</strong>
            <div className="small" style={{ marginTop: 4 }}>{t('roleAdminDesc')}</div>
          </div>
        </div>
      </div>

      {/* Lightbox overlay */}
      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.8)', zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexDirection: 'column', cursor: 'pointer'
          }}
        >
          <img
            src={lightbox.src}
            alt={lightbox.name}
            style={{ maxWidth: '90vw', maxHeight: '80vh', borderRadius: 8, objectFit: 'contain', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}
          />
          <div style={{ color: '#fff', marginTop: 12, fontSize: 16, fontWeight: 600 }}>{lightbox.name}</div>
          <div style={{ color: '#ccc', marginTop: 4, fontSize: 13 }}>{t('clickToClose')}</div>
        </div>
      )}
    </div>
  )
}
