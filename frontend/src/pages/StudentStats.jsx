import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../api'

export default function StudentStats(){
  const { id } = useParams()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const [downloadingPdf, setDownloadingPdf] = useState(null)

  useEffect(()=>{ load() }, [id])

  async function load(){
    try{
      setLoading(true)
      const url = id ? `/student-stats/${id}` : '/my-stats'
      const r = await api.get(url)
      setStats(r.data)
    }catch(err){ setMsg('Failed to load stats') }
    finally{ setLoading(false) }
  }

  async function downloadPDF(resultId, examTitle){
    setDownloadingPdf(resultId)
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setMsg('Not authenticated. Please login again.')
        setDownloadingPdf(null)
        return
      }
      const response = await api.get(`/student-exams/${resultId}/pdf`, { responseType: 'blob' })
      
      if (!response.data || response.data.size === 0) {
        setMsg('PDF generation failed: Empty response')
        setDownloadingPdf(null)
        return
      }
      
      const url = window.URL.createObjectURL(response.data)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `exam-report-${resultId}.pdf`)
      document.body.appendChild(link)
      link.click()
      
      setTimeout(() => {
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      }, 100)
    } catch(err) {
      console.error('PDF download error:', err)
      const errMsg = err.response?.data?.error || err.message || 'Unknown error'
      setMsg('PDF download failed: ' + errMsg)
    } finally {
      setDownloadingPdf(null)
    }
  }

  if (loading) return <div className="card container">Loading...</div>
  if (!stats) return <div className="card container">{msg || 'No stats available'}</div>

  const { attempts, avgScore, bestScore, lastScore, improvement, perExam } = stats

  // Calculate pass rate
  const passRate = attempts.length > 0 ? Math.round((attempts.filter(a => a.score >= 70).length / attempts.length) * 100) : 0

  return (
    <div className="card container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>📊 Performance Report — {stats.studentId}</h3>
        <Link to="/student" className="btn btn-ghost">Back</Link>
      </div>

      <div className="panel" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 12 }}>
        <div style={{ padding: 12, background: 'rgba(21, 128, 61, 0.06)', borderRadius: 6, borderLeft: '4px solid var(--brand-green)' }}>
          <div className="small">Total Exams Taken</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--brand-green)' }}>{attempts.length}</div>
        </div>
        <div style={{ padding: 12, background: 'rgba(21, 128, 61, 0.06)', borderRadius: 6, borderLeft: '4px solid var(--brand-green)' }}>
          <div className="small">Average Score</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--brand-green)' }}>{avgScore}%</div>
        </div>
        <div style={{ padding: 12, background: 'rgba(21, 128, 61, 0.06)', borderRadius: 6, borderLeft: '4px solid var(--brand-green)' }}>
          <div className="small">Best Score</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--brand-green)' }}>{bestScore}%</div>
        </div>
        <div style={{ padding: 12, background: 'rgba(21, 128, 61, 0.06)', borderRadius: 6, borderLeft: '4px solid var(--brand-green)' }}>
          <div className="small">Pass Rate (≥70%)</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--brand-green)' }}>{passRate}%</div>
        </div>
      </div>

      {improvement !== undefined && (
        <div style={{ marginBottom: 12, padding: 12, background: improvement > 0 ? 'rgba(16, 185, 129, 0.08)' : 'rgba(212, 175, 55, 0.08)', borderRadius: 6, border: `2px solid ${improvement > 0 ? '#10b981' : '#fbbf24'}` }}>
          <strong>Trend:</strong> {improvement > 0 ? `✓ Improving by +${improvement}%` : `Declining by ${improvement}%`} (comparing first half to second half of attempts)
        </div>
      )}

      <div style={{ marginBottom: 16 }}>
        <h4>Score Trend Visualization (Last 12 Attempts)</h4>
        {attempts.length === 0 && <div className="small">No attempts yet.</div>}
        {attempts.length > 0 && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', height: 100, marginBottom: 8 }}>
            {attempts.slice(-12).map(a => (
              <div 
                key={a.id} 
                style={{ 
                  flex: 1, 
                  height: Math.max(18, (a.score||0) * 0.9),
                  background: a.score >= 70 ? 'var(--brand-green)' : 'rgba(220, 38, 38, 0.3)',
                  borderRadius: 4,
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'center',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: 11
                }}
                title={`${new Date(a.taken_at).toLocaleDateString()} — ${a.score}%`}
              >
                <div style={{ paddingBottom: 4 }}>{a.score}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {perExam && perExam.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <h4>Performance by Exam Type</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
            {perExam.map((e, idx) => (
              <div key={idx} style={{ padding: 12, background: '#f0fdf7', border: '1px solid var(--brand-green)', borderRadius: 6 }}>
                <div style={{ fontWeight: 600, marginBottom: 8 }}>{e.title}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                  <div>
                    <div className="small">Attempts</div>
                    <div style={{ fontSize: 18, fontWeight: 700 }}>{e.attempts}</div>
                  </div>
                  <div>
                    <div className="small">Avg Score</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: e.avg >= 70 ? 'var(--brand-green)' : '#dc2626' }}>{e.avg}%</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h4>📋 Detailed Exam History</h4>
        {attempts.length === 0 && <div className="small">No attempts yet.</div>}
        {attempts.length > 0 && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left' }}>Date</th>
                  <th style={{ textAlign: 'left' }}>Exam</th>
                  <th style={{ textAlign: 'center', width: 80 }}>Score</th>
                  <th style={{ textAlign: 'center', width: 100 }}>Status</th>
                  <th style={{ textAlign: 'center', width: 120 }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {attempts.map(a => (
                  <tr key={a.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '10px 0', fontSize: 13 }}>{new Date(a.taken_at).toLocaleString()}</td>
                    <td style={{ padding: '10px 0' }}>{a.examTitle}</td>
                    <td style={{ padding: '10px 0', textAlign: 'center' }}>
                      <span className={a.score >= 70 ? 'badge badge-success' : 'badge badge-danger'} style={{ fontSize: 12 }}>
                        {a.score}%
                      </span>
                    </td>
                    <td style={{ padding: '10px 0', textAlign: 'center' }}>
                      {a.score >= 70 ? (
                        <span style={{ color: 'var(--brand-green)', fontWeight: 600 }}>✓ PASSED</span>
                      ) : (
                        <span style={{ color: '#dc2626', fontWeight: 600 }}>✗ FAILED</span>
                      )}
                    </td>
                    <td style={{ padding: '10px 0', textAlign: 'center' }}>
                      <button
                        className="btn btn-small"
                        onClick={() => downloadPDF(a.id, a.examTitle)}
                        disabled={downloadingPdf === a.id}
                        style={{ padding: '6px 12px', fontSize: 12 }}
                      >
                        {downloadingPdf === a.id ? '⏳' : '📥'} PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
