import React, { useEffect, useState } from 'react'
import { Routes, Route, Link, Navigate, useLocation } from 'react-router-dom'
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
import AdminSpecialtyManagement from './pages/AdminSpecialtyManagement'

function Nav(){
  const token = localStorage.getItem('token')
  const [user, setUser] = useState(() => {
    try {
      return localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null
    } catch {
      return null
    }
  })
  const location = useLocation()

  useEffect(() => {
    let cancelled = false
    async function hydrateUser() {
      if (!token) return
      const hasRole = typeof user?.role === 'string' && user.role.trim() !== ''
      if (hasRole) return
      try {
        const me = await api.get('/me')
        if (cancelled) return
        const refreshedUser = me?.data?.user || null
        if (refreshedUser) {
          setUser(refreshedUser)
          localStorage.setItem('user', JSON.stringify(refreshedUser))
        }
      } catch {
      }
    }
    hydrateUser()
    return () => {
      cancelled = true
    }
  }, [token, user?.role])
  
  function logout(){
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/'
  }

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  const role = typeof user?.role === 'string' ? user.role.toLowerCase() : ''
  const isAdmin = role === 'admin'
  const isModerator = role === 'moderator'
  const isStaff = role === 'clinician' || role === 'moderator' || role === 'admin'
  const isStudent = role === 'student'
  const canViewStudent = isStudent || isAdmin

  return (
    <nav className="navbar">
      <img src="/logo.png" alt="Chomthong Hospital" className="navbar-logo" />
      <Link to="/" className={isActive('/') ? 'active' : ''}>Home</Link>
      {isStaff && <Link to="/upload" className={isActive('/upload') ? 'active' : ''}>Create Question</Link>}
      <Link to="/exams" className={isActive('/exams') ? 'active' : ''}>Take Exam</Link>
      {isStaff && <Link to="/exambuilder" className={isActive('/exambuilder') ? 'active' : ''}>Create Exam</Link>}
      {canViewStudent && <Link to="/student" className={isActive('/student') ? 'active' : ''}>Student</Link>}
      {isStaff && <Link to="/manage" className={isActive('/manage') ? 'active' : ''}>Manage</Link>}
      {isStaff && <Link to="/results" className={isActive('/results') ? 'active' : ''}>Results</Link>}
      {isStaff && <Link to="/clinician-dashboard" className={isActive('/clinician-dashboard') ? 'active' : ''}>Analytics</Link>}
      {(isModerator || isAdmin) && <Link to="/moderator" className={isActive('/moderator') ? 'active' : ''}>Moderator</Link>}
      {isAdmin && <Link to="/admin-users" className={isActive('/admin-users') ? 'active' : ''}>Users</Link>}
      {isAdmin && <Link to="/admin-specialties" className={isActive('/admin-specialties') ? 'active' : ''}>Specialties</Link>}
      <div className="right">{token ? <><span className="navbar-username">{user ? user.name : 'Signed in'}</span><button className="btn" onClick={logout} style={{ marginLeft: 12 }}>Logout</button></> : <Link to="/login">Login</Link>}</div>
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
