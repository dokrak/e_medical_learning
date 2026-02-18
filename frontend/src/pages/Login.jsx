import React, { useState } from 'react'
import api from '../api'

export default function Login(){
  const [email, setEmail] = useState('admin@example.com')
  const [password, setPassword] = useState('password')
  const [msg, setMsg] = useState('')

  async function submit(e){
    e.preventDefault()
    try{
      const r = await api.post('/login', { email, password })
      localStorage.setItem('token', r.data.token)
      // request full user info to include role (consistent with Laravel)
      try{
        const me = await api.get('/me')
        localStorage.setItem('user', JSON.stringify(me.data.user))
      }catch(e){
        if (r.data.user) localStorage.setItem('user', JSON.stringify(r.data.user))
      }
      setMsg('Logged in — token saved')
      window.location.href = '/'
    }catch(err){
      setMsg('Login failed')
    }
  }

  return (
    <div className="card container">
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <img src="/logo.png" alt="Chomthong Hospital" className="login-logo" />
      </div>
      <h3 style={{ textAlign: 'center' }}>Chomthong Hospital Medical Learning Platform</h3>
      <h4 style={{ textAlign: 'center', marginBottom: 20 }}>Login</h4>
      <form onSubmit={submit}>
        <div><input value={email} onChange={e=>setEmail(e.target.value)} placeholder="email"/></div>
        <div style={{ marginTop: 8 }}><input value={password} onChange={e=>setPassword(e.target.value)} placeholder="password" type="password"/></div>
        <div style={{ marginTop: 8 }}><button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Login</button></div>
      </form>
      <div style={{ marginTop: 8 }}>{msg}</div>
      <div style={{ marginTop: 12, padding: 12, background: '#f0fdf7', borderRadius: 8, border: '1px solid var(--border)' }}>
        <strong>Test Accounts:</strong>
        <div style={{ marginTop: 8, fontSize: 13 }}>
          <div>admin@example.com / password</div>
          <div>clinician@example.com / password</div>
          <div>student@example.com / password</div>
          <div>moderator@example.com / password</div>
        </div>
      </div>
    </div>
  )
}
