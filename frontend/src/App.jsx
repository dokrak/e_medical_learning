import React, { useState, useEffect } from 'react'
import { Routes, Route, Link, Navigate, useLocation } from 'react-router-dom'
import { useLang } from './LangContext'
import api from './api'
import Login from './pages/Login'
import HomePage from './pages/HomePage'
import UploadQuestion from './pages/UploadQuestion'
import ModeratorQueue from './pages/ModeratorQueue'
import ExamBuilder from './pages/ExamBuilder'
import StudentDashboard from './pages/StudentDashboard'
import ExamsList from './pages/ExamsList'
import ExamTake from './pages/ExamTake'
import ManageQuestionsExams from './pages/ManageQuestionsExams'
import ExamResultsDashboard from './pages/ExamResultsDashboard'
import StudentStats from './pages/StudentStats'
import ClinicianDashboard from './pages/ClinicianDashboard'
import AdminUserManagement from './pages/AdminUserManagement'
import ExamResult from './pages/ExamResult'
import AdminSpecialtyManagement from './pages/AdminSpecialtyManagement'

function Nav(){
  const token = localStorage.getItem('token')
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null
  const location = useLocation()
  const { lang, toggleLang, t } = useLang()
  
  function logout(){
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/elearning'
  }

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  const isAdmin = user?.role === 'admin'
  const isModerator = user?.role === 'moderator'
  const isStaff = user?.role === 'clinician' || user?.role === 'moderator' || user?.role === 'admin'
  const isStudent = user?.role === 'student' || user?.role === 'resident' || user?.role === 'fellow'
  const canCreateQuestion = isStaff || user?.role === 'resident' || user?.role === 'fellow'
  const canCreateExam = isStaff || user?.role === 'fellow'

  return (
    <nav className="navbar">
      <img src="/elearning/logo.png" alt="Chomthong Hospital" className="navbar-logo" />
      <Link to="/" className="brand">med‑km</Link>
      <Link to="/" className={isActive('/') ? 'active' : ''}>{t('home')}</Link>
      {canCreateQuestion && <Link to="/upload" className={isActive('/upload') ? 'active' : ''}>{t('createQuestion')}</Link>}
      <Link to="/exams" className={isActive('/exams') ? 'active' : ''}>{t('takeExam')}</Link>
      {canCreateExam && <Link to="/exambuilder" className={isActive('/exambuilder') ? 'active' : ''}>{t('createExam')}</Link>}
      {isStudent && <Link to="/student" className={isActive('/student') ? 'active' : ''}>{t('student')}</Link>}
      {(isStaff || user?.role === 'resident' || user?.role === 'fellow') && <Link to="/manage" className={isActive('/manage') ? 'active' : ''}>{t('manage')}</Link>}
      {isStaff && <Link to="/results" className={isActive('/results') ? 'active' : ''}>{t('results')}</Link>}
      {isStaff && <Link to="/clinician-dashboard" className={isActive('/clinician-dashboard') ? 'active' : ''}>{t('analytics')}</Link>}
      {(isModerator || isAdmin) && <Link to="/moderator" className={isActive('/moderator') ? 'active' : ''}>{t('moderator')}</Link>}
      {isAdmin && <Link to="/admin-users" className={isActive('/admin-users') ? 'active' : ''}>{t('users')}</Link>}
      {isAdmin && <Link to="/admin-specialties" className={isActive('/admin-specialties') ? 'active' : ''}>Specialties</Link>}
      <div className="right">
        {token && <span style={{ color: '#fef08a', fontWeight: 600, border: '1px solid rgba(255,255,255,0.4)', borderRadius: 4, padding: '2px 8px' }}>{user ? user.name : t('signedIn')}</span>}
        <button className="btn btn-ghost" onClick={toggleLang} style={{
          padding: '4px 12px', fontSize: 13, minWidth: 0, fontWeight: 700,
          border: '2px solid #fff', borderRadius: 6,
          background: 'rgba(255,255,255,0.2)', color: '#fff', letterSpacing: 1,
          marginLeft: 8
        }}>
          {lang === 'en' ? 'TH ไทย' : 'EN Eng'}
        </button>
        {token ? <button className="btn" onClick={logout} style={{ marginLeft: 8 }}>{t('logout')}</button> : <Link to="/login">{t('login')}</Link>}
      </div>
    </nav>
  )
}

function SessionExpiredOverlay({ onClose }) {
  const { t } = useLang()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleReLogin(e) {
    e.preventDefault()
    setMsg('')
    setLoading(true)
    try {
      const r = await api.post('/login', { email, password })
      localStorage.setItem('token', r.data.token)
      try {
        const me = await api.get('/user')
        localStorage.setItem('user', JSON.stringify(me.data))
      } catch (_) {
        if (r.data.user) localStorage.setItem('user', JSON.stringify(r.data.user))
      }
      onClose(true)
    } catch (_) {
      setMsg(t('loginFailed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', borderRadius: 12, padding: '28px 32px', maxWidth: 400, width: '90%', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
        <h3 style={{ color: '#dc3545', marginBottom: 8 }}>⚠️ {t('sessionExpired')}</h3>
        <p style={{ color: '#555', fontSize: 14, marginBottom: 16 }}>{t('sessionExpiredMsg')}</p>
        <form onSubmit={handleReLogin}>
          <div><input value={email} onChange={e => setEmail(e.target.value)} placeholder={t('email')} style={{ width: '100%' }} required /></div>
          <div style={{ marginTop: 8 }}><input value={password} onChange={e => setPassword(e.target.value)} placeholder={t('password')} type="password" style={{ width: '100%' }} required /></div>
          <div style={{ marginTop: 12 }}><button className="btn btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>{loading ? '...' : t('reLogin')}</button></div>
        </form>
        {msg && <div style={{ marginTop: 8, color: '#dc3545', fontWeight: 600 }}>{msg}</div>}
      </div>
    </div>
  )
}

export default function App(){
  const [sessionExpired, setSessionExpired] = useState(false)
  const { t } = useLang()
  const [restoredMsg, setRestoredMsg] = useState('')

  useEffect(() => {
    function onExpired() { setSessionExpired(true) }
    window.addEventListener('session-expired', onExpired)
    return () => window.removeEventListener('session-expired', onExpired)
  }, [])

  function handleOverlayClose(success) {
    setSessionExpired(false)
    if (success) {
      setRestoredMsg(t('sessionRestored'))
      setTimeout(() => setRestoredMsg(''), 4000)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Nav />
      {sessionExpired && <SessionExpiredOverlay onClose={handleOverlayClose} />}
      {restoredMsg && (
        <div style={{ position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 9998, background: '#166534', color: '#fff', padding: '10px 24px', borderRadius: 8, fontWeight: 600, boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>
          ✅ {restoredMsg}
        </div>
      )}
      <div style={{ padding: 20, flex: 1 }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/upload" element={<UploadQuestion />} />
          <Route path="/moderator" element={<ModeratorQueue />} />
          <Route path="/manage" element={<ManageQuestionsExams />} />
          <Route path="/results" element={<ExamResultsDashboard />} />
          <Route path="/clinician-dashboard" element={<ClinicianDashboard />} />
          <Route path="/admin-users" element={<AdminUserManagement />} />
          <Route path="/admin-specialties" element={<AdminSpecialtyManagement />} />
          <Route path="/student-stats" element={<StudentStats />} />
          <Route path="/student-stats/:id" element={<StudentStats />} />
          <Route path="/exams" element={<ExamsList />} />
          <Route path="/exams/:id/take" element={<ExamTake />} />
          <Route path="/exam-result/:resultId" element={<ExamResult />} />
          <Route path="/exambuilder" element={<ExamBuilder />} />
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
      <footer style={{ borderTop: '1px solid var(--border)', padding: '14px 20px', textAlign: 'center', color: 'var(--muted)', background: 'var(--surface-1)' }}>
        © {new Date().getFullYear()} Dr. Ekkawit Iamthongin. All rights reserved.
      </footer>
    </div>
  )
}
