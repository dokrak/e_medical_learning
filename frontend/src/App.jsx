import React from 'react'
import { Routes, Route, Link, Navigate, useLocation } from 'react-router-dom'
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

function Nav(){
  const token = localStorage.getItem('token')
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null
  const location = useLocation()
  
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
  const isStudent = user?.role === 'student'

  return (
    <nav className="navbar">
      <img src="/logo.png" alt="Chomthong Hospital" className="navbar-logo" />
      <Link to="/" className="brand">med‑km</Link>
      <Link to="/" className={isActive('/') ? 'active' : ''}>Home</Link>
      {isStaff && <Link to="/upload" className={isActive('/upload') ? 'active' : ''}>Create Question</Link>}
      <Link to="/exams" className={isActive('/exams') ? 'active' : ''}>Take Exam</Link>
      {isStaff && <Link to="/exambuilder" className={isActive('/exambuilder') ? 'active' : ''}>Create Exam</Link>}
      {isStudent && <Link to="/student" className={isActive('/student') ? 'active' : ''}>Student</Link>}
      {isStaff && <Link to="/manage" className={isActive('/manage') ? 'active' : ''}>Manage</Link>}
      {isStaff && <Link to="/results" className={isActive('/results') ? 'active' : ''}>Results</Link>}
      {isStaff && <Link to="/clinician-dashboard" className={isActive('/clinician-dashboard') ? 'active' : ''}>Analytics</Link>}
      {(isModerator || isAdmin) && <Link to="/moderator" className={isActive('/moderator') ? 'active' : ''}>Moderator</Link>}
      {isAdmin && <Link to="/admin-users" className={isActive('/admin-users') ? 'active' : ''}>Users</Link>}
      <div className="right">{token ? <><span>{user ? user.name : 'Signed in'}</span><button className="btn" onClick={logout} style={{ marginLeft: 12 }}>Logout</button></> : <Link to="/login">Login</Link>}</div>
    </nav>
  )
}

export default function App(){
  return (
    <div>
      <Nav />
      <div style={{ padding: 20 }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/upload" element={<UploadQuestion />} />
          <Route path="/moderator" element={<ModeratorQueue />} />
          <Route path="/manage" element={<ManageQuestionsExams />} />
          <Route path="/results" element={<ExamResultsDashboard />} />
          <Route path="/clinician-dashboard" element={<ClinicianDashboard />} />
          <Route path="/admin-users" element={<AdminUserManagement />} />
          <Route path="/student-stats" element={<StudentStats />} />
          <Route path="/student-stats/:id" element={<StudentStats />} />
          <Route path="/exams" element={<ExamsList />} />
          <Route path="/exams/:id/take" element={<ExamTake />} />
          <Route path="/exambuilder" element={<ExamBuilder />} />
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </div>
  )
}
