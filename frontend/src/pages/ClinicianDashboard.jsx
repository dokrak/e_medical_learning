import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'

export default function ClinicianDashboard(){
  const [allResults, setAllResults] = useState([])
  const [students, setStudents] = useState([])
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [studentDetails, setStudentDetails] = useState(null)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const [viewMode, setViewMode] = useState('overview') // overview, student-detail, exam-analysis
  const [selectedExam, setSelectedExam] = useState(null)

  useEffect(() => { loadAllData() }, [])

  async function loadAllData(){
    try {
      setLoading(true)
      const r = await api.get('/all-student-exams')
      setAllResults(r.data)
      
      // Extract unique students
      const uniqueStudents = [...new Map(
        r.data.map(result => [result.studentId, result])
      ).values()].map(result => ({
        id: result.studentId,
        name: result.studentName,
        email: result.studentEmail
      }))
      setStudents(uniqueStudents)
    } catch(err) {
      setMsg('Failed to load exam results: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  async function loadStudentDetails(studentId){
    try {
      setLoading(true)
      const r = await api.get(`/student-stats/${studentId}`)
      setStudentDetails(r.data)
    } catch(err) {
      setMsg('Failed to load student details: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  // Calculate overall statistics
  const overallStats = (() => {
    const avgScore = allResults.length ? Math.round(allResults.reduce((s, r) => s + r.score, 0) / allResults.length) : 0
    const passedCount = allResults.filter(r => r.score >= 70).length
    const passRate = allResults.length ? Math.round((passedCount / allResults.length) * 100) : 0
    const highestScore = allResults.length ? Math.max(...allResults.map(r => r.score)) : 0
    const lowestScore = allResults.length ? Math.min(...allResults.map(r => r.score)) : 0
    return { avgScore, passedCount, passRate, highestScore, lowestScore, totalAttempts: allResults.length }
  })()

  // Get results for selected student
  const studentResults = selectedStudent 
    ? allResults.filter(r => r.studentId === selectedStudent.id).sort((a, b) => new Date(b.taken_at) - new Date(a.taken_at))
    : []

  // Group results by exam
  const resultsByExam = (() => {
    const grouped = {}
    allResults.forEach(r => {
      if (!grouped[r.examId]) grouped[r.examId] = { title: r.examTitle, results: [] }
      grouped[r.examId].results.push(r)
    })
    return grouped
  })()

  // Calculate exam statistics
  const examStats = selectedExam && resultsByExam[selectedExam]
    ? (() => {
        const results = resultsByExam[selectedExam].results
        const avgScore = Math.round(results.reduce((s, r) => s + r.score, 0) / results.length)
        const passedCount = results.filter(r => r.score >= 70).length
        const passRate = Math.round((passedCount / results.length) * 100)
        return { avgScore, passedCount, passRate, count: results.length, results }
      })()
    : null

  return (
    <div className="card container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2>📊 Clinician Dashboard — Exam Analytics</h2>
        <Link to="/manage" className="btn btn-ghost">Back to Manage</Link>
      </div>

      {msg && <div className="msg error" style={{ marginBottom: 12 }}>{msg}</div>}

      {/* View Mode Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, borderBottom: '2px solid var(--border)', paddingBottom: 8 }}>
        <button 
          className={`btn ${viewMode === 'overview' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => { setViewMode('overview'); setSelectedStudent(null); setSelectedExam(null) }}
        >
          Overall Stats
        </button>
        <button 
          className={`btn ${viewMode === 'student-detail' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setViewMode('student-detail')}
        >
          Student Performance
        </button>
        <button 
          className={`btn ${viewMode === 'exam-analysis' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setViewMode('exam-analysis')}
        >
          Exam Analysis
        </button>
      </div>

      {loading && <div style={{ marginBottom: 12 }}>Loading data...</div>}

      {/* OVERVIEW TAB */}
      {viewMode === 'overview' && (
        <div>
          <h3 style={{ marginBottom: 16 }}>Platform-Wide Statistics</h3>
          
          {/* Key Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 24 }}>
            <div style={{ padding: 16, background: 'rgba(21, 128, 61, 0.06)', borderRadius: 8, borderLeft: '4px solid var(--brand-green)' }}>
              <div className="small">Total Exam Attempts</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--brand-green)' }}>
                {overallStats.totalAttempts}
              </div>
            </div>
            <div style={{ padding: 16, background: 'rgba(21, 128, 61, 0.06)', borderRadius: 8, borderLeft: '4px solid var(--brand-green)' }}>
              <div className="small">Unique Students</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--brand-green)' }}>
                {students.length}
              </div>
            </div>
            <div style={{ padding: 16, background: 'rgba(21, 128, 61, 0.06)', borderRadius: 8, borderLeft: '4px solid var(--brand-green)' }}>
              <div className="small">Average Score</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--brand-green)' }}>
                {overallStats.avgScore}%
              </div>
            </div>
            <div style={{ padding: 16, background: 'rgba(21, 128, 61, 0.06)', borderRadius: 8, borderLeft: '4px solid var(--brand-green)' }}>
              <div className="small">Pass Rate (≥70%)</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--brand-green)' }}>
                {overallStats.passRate}%
              </div>
            </div>
            <div style={{ padding: 16, background: 'rgba(21, 128, 61, 0.06)', borderRadius: 8, borderLeft: '4px solid var(--brand-green)' }}>
              <div className="small">Highest Score</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--brand-green)' }}>
                {overallStats.highestScore}%
              </div>
            </div>
            <div style={{ padding: 16, background: 'rgba(21, 128, 61, 0.06)', borderRadius: 8, borderLeft: '4px solid var(--brand-green)' }}>
              <div className="small">Lowest Score</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--brand-green)' }}>
                {overallStats.lowestScore}%
              </div>
            </div>
          </div>

          {/* Score Distribution */}
          <div style={{ marginBottom: 24, padding: 16, background: '#f0fdf7', borderRadius: 8, border: '1px solid var(--border)' }}>
            <h4>Score Distribution</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12 }}>
              {[
                { range: '90-100%', color: '#15803d', count: allResults.filter(r => r.score >= 90).length },
                { range: '80-89%', color: '#16a34a', count: allResults.filter(r => r.score >= 80 && r.score < 90).length },
                { range: '70-79%', color: '#84cc16', count: allResults.filter(r => r.score >= 70 && r.score < 80).length },
                { range: '60-69%', color: '#f59e0b', count: allResults.filter(r => r.score >= 60 && r.score < 70).length },
                { range: '<60%', color: '#dc2626', count: allResults.filter(r => r.score < 60).length }
              ].map((band, idx) => (
                <div key={idx} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 32, fontWeight: 800, color: band.color, marginBottom: 4 }}>
                    {band.count}
                  </div>
                  <div className="small">{band.range}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Passing performance by grade */}
          <div style={{ padding: 16, background: '#f0fdf7', borderRadius: 8, border: '1px solid var(--border)' }}>
            <h4>Passing Performance</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12 }}>
              <div>
                <div><strong>Passed:</strong> {overallStats.passedCount} / {overallStats.totalAttempts}</div>
                <div><strong>Pass Rate:</strong> {overallStats.passRate}%</div>
              </div>
              <div style={{ height: 30, background: '#e5e7eb', borderRadius: 4, overflow: 'hidden' }}>
                <div 
                  style={{ 
                    height: '100%', 
                    width: `${overallStats.passRate}%`, 
                    background: 'var(--brand-green)',
                    transition: 'width 0.3s'
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STUDENT DETAIL TAB */}
      {viewMode === 'student-detail' && (
        <div>
          <h3 style={{ marginBottom: 16 }}>Student Performance Trends</h3>
          
          {/* Student selector */}
          <div style={{ marginBottom: 20 }}>
            <label>Select Student:</label>
            <select 
              value={selectedStudent?.id || ''}
              onChange={(e) => {
                const sid = e.target.value
                if (sid) {
                  const student = students.find(s => String(s.id) === String(sid))
                  setSelectedStudent(student || null)
                  loadStudentDetails(sid)
                } else {
                  setSelectedStudent(null)
                  setStudentDetails(null)
                }
              }}
              style={{ marginTop: 8 }}
            >
              <option value="">-- Choose a student --</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.email})</option>
              ))}
            </select>
          </div>

          {selectedStudent && studentDetails && (
            <div>
              {/* Student Info */}
              <div style={{ padding: 16, background: 'rgba(21, 128, 61, 0.08)', borderRadius: 8, marginBottom: 16 }}>
                <h4>{selectedStudent.name}</h4>
                <div style={{ fontSize: 13, color: '#666', marginTop: 4 }}>{selectedStudent.email}</div>
              </div>

              {/* Performance Summary */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 20 }}>
                <div style={{ padding: 12, background: '#fff', border: '1px solid var(--border)', borderRadius: 6 }}>
                  <div className="small">Exams Taken</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--brand-green)' }}>
                    {studentDetails.attempts.length}
                  </div>
                </div>
                <div style={{ padding: 12, background: '#fff', border: '1px solid var(--border)', borderRadius: 6 }}>
                  <div className="small">Average Score</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--brand-green)' }}>
                    {studentDetails.avgScore}%
                  </div>
                </div>
                <div style={{ padding: 12, background: '#fff', border: '1px solid var(--border)', borderRadius: 6 }}>
                  <div className="small">Best Score</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--brand-green)' }}>
                    {studentDetails.bestScore}%
                  </div>
                </div>
                <div style={{ padding: 12, background: '#fff', border: '1px solid var(--border)', borderRadius: 6 }}>
                  <div className="small">Trend</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: studentDetails.improvement > 0 ? '#16a34a' : '#dc2626' }}>
                    {studentDetails.improvement > 0 ? '+' : ''}{studentDetails.improvement}%
                  </div>
                </div>
              </div>

              {/* Score trend chart */}
              <div style={{ marginBottom: 20, padding: 16, background: '#f0fdf7', borderRadius: 8 }}>
                <h4>Score Progression</h4>
                <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 120, marginTop: 12 }}>
                  {studentDetails.attempts.slice(-12).map((attempt, idx) => (
                    <div 
                      key={idx}
                      style={{ 
                        flex: 1, 
                        height: `${Math.max(20, (attempt.score || 0) * 0.9)}px`,
                        background: attempt.score >= 70 ? 'var(--brand-green)' : 'rgba(220, 38, 38, 0.4)',
                        borderRadius: 4,
                        cursor: 'pointer',
                        transition: 'opacity 0.2s'
                      }}
                      title={`${new Date(attempt.taken_at).toLocaleDateString()} — ${attempt.score}%`}
                      onMouseEnter={(e) => e.target.style.opacity = '0.8'}
                      onMouseLeave={(e) => e.target.style.opacity = '1'}
                    />
                  ))}
                </div>
              </div>

              {/* Exam history */}
              <div>
                <h4>Exam History</h4>
                <table>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left' }}>Date</th>
                      <th style={{ textAlign: 'left' }}>Exam</th>
                      <th style={{ textAlign: 'center' }}>Score</th>
                      <th style={{ textAlign: 'center' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentResults.map(result => (
                      <tr key={result.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '10px 0', fontSize: 13 }}>
                          {new Date(result.taken_at).toLocaleString()}
                        </td>
                        <td>{result.examTitle}</td>
                        <td style={{ textAlign: 'center' }}>
                          <span className={result.score >= 70 ? 'badge badge-success' : 'badge badge-danger'}>
                            {result.score}%
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          {result.score >= 70 ? (
                            <span style={{ color: 'var(--brand-green)', fontWeight: 600 }}>✓ PASSED</span>
                          ) : (
                            <span style={{ color: '#dc2626', fontWeight: 600 }}>✗ FAILED</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* EXAM ANALYSIS TAB */}
      {viewMode === 'exam-analysis' && (
        <div>
          <h3 style={{ marginBottom: 16 }}>Exam Performance Analysis</h3>

          {/* Exam selector */}
          <div style={{ marginBottom: 20 }}>
            <label>Select Exam:</label>
            <select 
              value={selectedExam || ''}
              onChange={(e) => setSelectedExam(e.target.value || null)}
              style={{ marginTop: 8 }}
            >
              <option value="">-- Choose an exam --</option>
              {Object.entries(resultsByExam).map(([examId, data]) => (
                <option key={examId} value={examId}>{data.title}</option>
              ))}
            </select>
          </div>

          {selectedExam && examStats && (
            <div>
              {/* Exam stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 20 }}>
                <div style={{ padding: 14, background: 'rgba(21, 128, 61, 0.06)', borderRadius: 6, border: '1px solid var(--border)' }}>
                  <div className="small">Students Attempted</div>
                  <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--brand-green)' }}>
                    {examStats.count}
                  </div>
                </div>
                <div style={{ padding: 14, background: 'rgba(21, 128, 61, 0.06)', borderRadius: 6, border: '1px solid var(--border)' }}>
                  <div className="small">Average Score</div>
                  <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--brand-green)' }}>
                    {examStats.avgScore}%
                  </div>
                </div>
                <div style={{ padding: 14, background: 'rgba(21, 128, 61, 0.06)', borderRadius: 6, border: '1px solid var(--border)' }}>
                  <div className="small">Passed (≥70%)</div>
                  <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--brand-green)' }}>
                    {examStats.passedCount}/{examStats.count}
                  </div>
                </div>
                <div style={{ padding: 14, background: 'rgba(21, 128, 61, 0.06)', borderRadius: 6, border: '1px solid var(--border)' }}>
                  <div className="small">Pass Rate</div>
                  <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--brand-green)' }}>
                    {examStats.passRate}%
                  </div>
                </div>
              </div>

              {/* Score distribution for this exam */}
              <div style={{ marginBottom: 20, padding: 16, background: '#f0fdf7', borderRadius: 8 }}>
                <h4>Score Distribution</h4>
                <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 100, marginTop: 12 }}>
                  {[
                    { min: 90, max: 100, label: '90-100' },
                    { min: 80, max: 89, label: '80-89' },
                    { min: 70, max: 79, label: '70-79' },
                    { min: 60, max: 69, label: '60-69' },
                    { min: 0, max: 59, label: '<60' }
                  ].map((band, idx) => {
                    const count = examStats.results.filter(r => r.score >= band.min && r.score <= band.max).length
                    return (
                      <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div 
                          style={{ 
                            width: '100%',
                            height: `${Math.max(20, (count / examStats.count) * 80)}px`,
                            background: band.min >= 70 ? 'var(--brand-green)' : band.min >= 60 ? '#f59e0b' : '#dc2626',
                            borderRadius: 4
                          }}
                          title={`${band.label}: ${count} students`}
                        />
                        <div style={{ fontSize: 11, marginTop: 4, fontWeight: 600 }}>{count}</div>
                        <div style={{ fontSize: 10, color: '#666' }}>{band.label}%</div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Student results for this exam */}
              <div>
                <h4>Student Results</h4>
                <div style={{ overflowX: 'auto' }}>
                  <table>
                    <thead>
                      <tr>
                        <th style={{ textAlign: 'left' }}>Student Name</th>
                        <th style={{ textAlign: 'left' }}>Date Taken</th>
                        <th style={{ textAlign: 'center' }}>Score</th>
                        <th style={{ textAlign: 'center' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {examStats.results.sort((a, b) => b.score - a.score).map(result => (
                        <tr key={result.id} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '10px 0' }}>{result.studentName}</td>
                          <td style={{ padding: '10px 0', fontSize: 13 }}>
                            {new Date(result.taken_at).toLocaleString()}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <span className={result.score >= 70 ? 'badge badge-success' : 'badge badge-danger'}>
                              {result.score}%
                            </span>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            {result.score >= 70 ? (
                              <span style={{ color: 'var(--brand-green)', fontWeight: 600 }}>✓ PASSED</span>
                            ) : (
                              <span style={{ color: '#dc2626', fontWeight: 600 }}>✗ FAILED</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
