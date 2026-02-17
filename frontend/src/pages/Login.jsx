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
      <h3>Login</h3>
      <form onSubmit={submit}>
        <div><input value={email} onChange={e=>setEmail(e.target.value)} placeholder="email"/></div>
        <div style={{ marginTop: 8 }}><input value={password} onChange={e=>setPassword(e.target.value)} placeholder="password" type="password"/></div>
        <div style={{ marginTop: 8 }}><button className="btn btn-primary">Login</button></div>
      </form>
      <div style={{ marginTop: 8 }}>{msg}</div>
      <div style={{ marginTop: 8 }}><strong>Test accounts:</strong> admin/clinician/student — password `password`</div>
    </div>
  )
}
