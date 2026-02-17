import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../api'

export default function StudentStats(){
  const { id } = useParams()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

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

  if (loading) return <div className="card container">Loading...</div>
  if (!stats) return <div className="card container">{msg || 'No stats available'}</div>

  const { attempts, avgScore, bestScore, lastScore, improvement } = stats

  return (
    <div className="card container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>Progress — {stats.studentId}</h3>
        <Link to="/student" className="btn btn-ghost">Back</Link>
      </div>

      <div className="panel" style={{ display: 'flex', gap: 18, marginBottom: 12 }}>
        <div>
          <div className="small">Average score</div>
          <div style={{ fontSize: 24, fontWeight: 800 }}>{avgScore}%</div>
        </div>
        <div>
          <div className="small">Best score</div>
          <div style={{ fontSize: 24, fontWeight: 800 }}>{bestScore}%</div>
        </div>
        <div>
          <div className="small">Last score</div>
          <div style={{ fontSize: 24, fontWeight: 800 }}>{lastScore ?? '-'}</div>
        </div>
        <div>
          <div className="small">Improvement</div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>{improvement > 0 ? `+${improvement}` : improvement}%</div>
        </div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <h4>Recent attempts</h4>
        {attempts.length === 0 && <div className="small">No attempts yet.</div>}
        {attempts.length > 0 && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
            {attempts.slice(-12).map(a => (
              <div key={a.id} style={{ width: 28, height: Math.max(18, (a.score||0) * 0.7), background: a.score >= 70 ? 'var(--brand-green)' : 'rgba(212,175,55,0.18)', borderRadius: 6, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 10 }} title={`${a.taken_at} — ${a.score}%`}>
                <div style={{ paddingBottom: 4 }}>{a.score}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h4>Attempt history</h4>
        <table>
          <thead>
            <tr><th>Date</th><th>Exam</th><th style={{ textAlign: 'center' }}>Score</th></tr>
          </thead>
          <tbody>
            {attempts.map(a => (
              <tr key={a.id}><td style={{ width: 220 }}>{new Date(a.taken_at).toLocaleString()}</td><td>{a.examTitle}</td><td style={{ textAlign: 'center' }}><span className={a.score>=70 ? 'badge badge-success' : 'badge badge-danger'}>{a.score}%</span></td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
