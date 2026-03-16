import React from 'react'
import { Routes, Route, Link, Navigate, useLocation } from 'react-router-dom'
import { useLang } from './LangContext'
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
    window.location.href = '/'
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
      <img src="/logo.png" alt="Chomthong Hospital" className="navbar-logo" />
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

export default function App(){
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Nav />
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
