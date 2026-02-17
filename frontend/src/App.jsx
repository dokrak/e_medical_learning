import React from 'react'
import { Routes, Route, Link, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import UploadQuestion from './pages/UploadQuestion'
import ModeratorQueue from './pages/ModeratorQueue'
import ExamBuilder from './pages/ExamBuilder'
import StudentDashboard from './pages/StudentDashboard'
import ExamsList from './pages/ExamsList'
import ExamTake from './pages/ExamTake'
import ManageQuestionsExams from './pages/ManageQuestionsExams'
import ExamResultsDashboard from './pages/ExamResultsDashboard'
import StudentStats from './pages/StudentStats'

function Nav(){
  const token = localStorage.getItem('token')
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null
  
  function logout(){
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/'
  }

  const isAdmin = user?.role === 'admin'
  const isStaff = user?.role === 'clinician' || user?.role === 'moderator' || user?.role === 'admin'
  const isStudent = user?.role === 'student'

  return (
    <nav className="navbar">
      <Link to="/" className="brand">med‑km</Link>
      <Link to="/">Home</Link>
      {isStaff && <Link to="/upload">Create Question</Link>}
      <Link to="/exams">Take Exam</Link>
      <Link to="/exambuilder">Create Exam</Link>
      {isStudent && <Link to="/student">Student</Link>}
      {isStaff && <Link to="/manage">Manage</Link>}
      {isStaff && <Link to="/results">Results</Link>}
      {isAdmin && <Link to="/moderator">Moderator</Link>}
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
          <Route path="/" element={<h2>med-km demo — use the nav to test flows</h2>} />
          <Route path="/login" element={<Login />} />
          <Route path="/upload" element={<UploadQuestion />} />
          <Route path="/moderator" element={<ModeratorQueue />} />
          <Route path="/manage" element={<ManageQuestionsExams />} />
          <Route path="/results" element={<ExamResultsDashboard />} />
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
