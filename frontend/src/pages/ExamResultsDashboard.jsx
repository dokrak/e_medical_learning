import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'

export default function ExamResultsDashboard(){
  const [allResults, setAllResults] = useState([])
  const [selectedExam, setSelectedExam] = useState(null)
  const [examResults, setExamResults] = useState([])
  const [selectedResult, setSelectedResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(()=>{ loadAllResults() }, [])

  async function loadAllResults(){
    try{
      setLoading(true)
      const r = await api.get('/all-student-exams')
      setAllResults(r.data)
    } catch(err){
      setMsg('Failed to load results')
    } finally {
      setLoading(false)
    }
  }

  async function loadExamResults(examId){
    try{
      setLoading(true)
      const r = await api.get(`/exam-results/${examId}`)
      setExamResults(r.data)
      setSelectedResult(null)
    } catch(err){
      setMsg('Failed to load exam results')
    } finally {
      setLoading(false)
    }
  }

  function handleSelectExam(examId){
    setSelectedExam(examId)
    loadExamResults(examId)
  }

  const exams = [...new Map(allResults.map(r => [r.examId, r.examTitle])).entries()]
  const stats = allResults.reduce((acc, r) => {
    acc.total += 1
    acc.avgScore = (acc.avgScore * (acc.total - 1) + r.score) / acc.total
    if (r.score >= 70) acc.passed += 1
    return acc
  }, { total: 0, avgScore: 0, passed: 0 })

  const examStats = selectedExam ? (() => {
    const results = examResults
    const avg = results.length > 0 ? Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length) : 0
    const passed = results.filter(r => r.score >= 70).length
    return { count: results.length, avg, passed }
  })() : null

  return (
    <div className="card container">
      <h3>Exam Results Dashboard</h3>
      {msg && <div className="msg error" style={{ marginBottom: 12 }}>{msg}</div>}
      {loading && <div style={{ marginBottom: 12 }}>Loading...</div>}

      <div className="panel" style={{ marginBottom: 20 }}>
        <h4>Overall Statistics</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          <div><strong>Total Exams Taken:</strong> {stats.total}</div>
          <div><strong>Average Score:</strong> {Math.round(stats.avgScore)}%</div>
          <div><strong>Pass Rate (≥70%):</strong> {stats.total > 0 ? Math.round((stats.passed / stats.total) * 100) : 0}%</div>
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <h4>Select Exam to View Details</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
          {exams.map(([examId, examTitle]) => (
            <button 
              key={examId} 
              onClick={()=>handleSelectExam(examId)}
              className={`btn ${selectedExam === examId ? 'btn-primary' : ''}`}
              style={{ minWidth: 140, justifyContent: 'center' }}
            >
              {examTitle}
            </button>
          ))}
        </div>
      </div>

      {selectedExam && examStats && (
        <div style={{ marginBottom: 20, padding: 12, background: '#f0f9ff', borderRadius: 6 }}>
          <h4>Exam Statistics</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div><strong>Students:</strong> {examStats.count}</div>
            <div><strong>Average Score:</strong> {examStats.avg}%</div>
            <div><strong>Passed (≥70%):</strong> {examStats.passed}/{examStats.count}</div>
          </div>
        </div>
      )}

      {selectedExam && (
        <div style={{ marginBottom: 20 }}>
          <h4>Student Results</h4>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ padding: 8, textAlign: 'left' }}>Student</th>
                  <th style={{ padding: 8, textAlign: 'center' }}>Score</th>
                  <th style={{ padding: 8, textAlign: 'center' }}>Correct</th>
                  <th style={{ padding: 8, textAlign: 'left' }}>Date</th>
                  <th style={{ padding: 8, textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {examResults.map(result => (
                  <tr key={result.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: 8 }}>
                      <div><strong>{result.studentName}</strong></div>
                      <div style={{ fontSize: '0.85em', color: '#666' }}>{result.studentEmail}</div>
                    </td>
                    <td style={{ padding: 8, textAlign: 'center', fontWeight: 'bold' }}>
                      <span className={result.score >= 70 ? 'badge badge-success' : 'badge badge-danger'}>{result.score}%</span>
                    </td>
                    <td style={{ padding: 8, textAlign: 'center' }}>{result.correct}/{result.total}</td>
                    <td style={{ padding: 8, fontSize: '0.85em' }}>{new Date(result.taken_at).toLocaleDateString()} {new Date(result.taken_at).toLocaleTimeString()}</td>
                    <td style={{ padding: 8, textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                        <button className="btn btn-primary" onClick={()=>setSelectedResult(result)}>View</button>
                        <Link to={`/student-stats/${result.studentId}`} className="btn btn-ghost">History</Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedResult && (
        <div className="panel panel-warning" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h4>{selectedResult.studentName}'s Detailed Answers</h4>
            <button className="btn btn-ghost" onClick={()=>setSelectedResult(null)}>×</button>
          </div>
          <div className="panel" style={{ marginBottom: 12 }}>
            <strong>Score: {selectedResult.score}% ({selectedResult.correct}/{selectedResult.total} correct)</strong>
          </div>
          {selectedResult.questions.map((q, i) => {
            const studentAnswer = selectedResult.answers.find(a => a.questionId === q.id)?.answer
            const isCorrect = (studentAnswer || '').trim().toLowerCase() === (q.answer || '').trim().toLowerCase()
            return (
              <div key={q.id} className={`panel ${isCorrect ? 'panel-correct' : 'panel-incorrect'}`}>
                <div><strong>{i+1}. {q.title}</strong> {isCorrect ? <span className="badge badge-success">✓</span> : <span className="badge badge-danger">✗</span>}</div>
                <div style={{ fontSize: '0.9em', color: '#666', marginTop: 4 }}>{q.stem}</div>
                {q.choices && q.choices.length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    <div><strong>Student answered:</strong> {studentAnswer || '(blank)'}</div>
                    <div><strong>Correct answer:</strong> {q.answer}</div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
