import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'

export default function HomePage(){
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null
  const [stats, setStats] = useState(null)
  
  useEffect(() => {
    if (user?.role === 'student') {
      loadStats()
    }
  }, [user])

  async function loadStats(){
    try {
      const r = await api.get('/my-stats')
      setStats(r.data)
    } catch(e) { /* ignore */ }
  }

  const isStudent = user?.role === 'student'
  const isClinician = user?.role === 'clinician'
  const isAdmin = user?.role === 'admin'
  const isModerator = user?.role === 'moderator'

  return (
    <div>
      {/* Hero Section */}
      <div style={{
        background: 'linear-gradient(135deg, var(--brand-green) 0%, #0f766e 100%)',
        padding: '60px 20px',
        borderRadius: '16px',
        marginBottom: 40,
        color: '#ffffff',
        minHeight: '300px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background Symbols */}
        <div style={{
          position: 'absolute',
          top: 20,
          right: 40,
          fontSize: 80,
          opacity: 0.1,
          animation: 'float 6s ease-in-out infinite'
        }}>🏥</div>
        <div style={{
          position: 'absolute',
          bottom: 30,
          left: 40,
          fontSize: 60,
          opacity: 0.1,
          animation: 'float 8s ease-in-out infinite 1s'
        }}>💻</div>

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 600 }}>
          <h1 style={{ fontSize: 48, fontWeight: 900, margin: '0 0 16px 0', letterSpacing: '-0.5px' }}>
            Welcome, {user?.name || 'User'}! 👋
          </h1>
          <p style={{ fontSize: 20, margin: 0, fontWeight: 300, lineHeight: 1.6, opacity: 0.95 }}>
            Bridging Medical Knowledge with Digital Innovation
          </p>
          <div style={{ marginTop: 32, display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            {isStudent && <Link to="/exams" className="btn" style={{ background: '#ffffff', color: 'var(--brand-green)', fontWeight: 800 }}>Start Exam</Link>}
            {isClinician && <Link to="/upload" className="btn" style={{ background: '#ffffff', color: 'var(--brand-green)', fontWeight: 800 }}>Create Question</Link>}
            {isAdmin && <Link to="/admin-users" className="btn" style={{ background: '#ffffff', color: 'var(--brand-green)', fontWeight: 800 }}>Manage System</Link>}
            {isModerator && <Link to="/moderator" className="btn" style={{ background: '#ffffff', color: 'var(--brand-green)', fontWeight: 800 }}>Review Queue</Link>}
          </div>
        </div>
      </div>

      {/* Student Dashboard */}
      {isStudent && stats && (
        <div style={{ marginBottom: 40 }}>
          <h2 style={{ marginBottom: 20, fontSize: 28, fontWeight: 700 }}>📊 Your Learning Journey</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 16
          }}>
            <div className="card" style={{ borderTop: '4px solid var(--brand-green)', padding: 24, textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>📚</div>
              <div style={{ fontSize: 32, fontWeight: 900, color: 'var(--brand-green)' }}>{stats.attempts.length}</div>
              <div style={{ fontSize: 14, color: '#666', marginTop: 4 }}>Exams Completed</div>
            </div>
            <div className="card" style={{ borderTop: '4px solid var(--brand-green)', padding: 24, textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>🎯</div>
              <div style={{ fontSize: 32, fontWeight: 900, color: 'var(--brand-green)' }}>{stats.avgScore}%</div>
              <div style={{ fontSize: 14, color: '#666', marginTop: 4 }}>Average Score</div>
            </div>
            <div className="card" style={{ borderTop: '4px solid var(--brand-green)', padding: 24, textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>⭐</div>
              <div style={{ fontSize: 32, fontWeight: 900, color: 'var(--brand-green)' }}>{stats.bestScore}%</div>
              <div style={{ fontSize: 14, color: '#666', marginTop: 4 }}>Best Score</div>
            </div>
            <div className="card" style={{ borderTop: '4px solid var(--brand-green)', padding: 24, textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>📈</div>
              <div style={{ fontSize: 32, fontWeight: 900, color: stats.improvement > 0 ? '#16a34a' : '#dc2626' }}>
                {stats.improvement > 0 ? '+' : ''}{stats.improvement}%
              </div>
              <div style={{ fontSize: 14, color: '#666', marginTop: 4 }}>Improvement</div>
            </div>
          </div>
        </div>
      )}

      {/* Feature Cards */}
      <div style={{ marginBottom: 40 }}>
        <h2 style={{ marginBottom: 24, fontSize: 28, fontWeight: 700 }}>✨ Platform Features</h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 20
        }}>
          {/* Medical Knowledge */}
          <div className="card" style={{ padding: 28, background: 'linear-gradient(135deg, rgba(21,128,61,0.05) 0%, rgba(16,185,129,0.08) 100%)' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🏥</div>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, color: 'var(--brand-green)' }}>
              Medical Excellence
            </h3>
            <p style={{ fontSize: 14, color: '#666', lineHeight: 1.6, margin: 0 }}>
              Comprehensive medical exams curated by healthcare professionals covering diverse specialties and subspecialties
            </p>
          </div>

          {/* Technology Innovation */}
          <div className="card" style={{ padding: 28, background: 'linear-gradient(135deg, rgba(21,128,61,0.05) 0%, rgba(16,185,129,0.08) 100%)' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>💡</div>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, color: 'var(--brand-green)' }}>
              Smart Learning
            </h3>
            <p style={{ fontSize: 14, color: '#666', lineHeight: 1.6, margin: 0 }}>
              AI-powered analytics track your progress, identify weak areas, and provide personalized learning recommendations
            </p>
          </div>

          {/* Community */}
          <div className="card" style={{ padding: 28, background: 'linear-gradient(135deg, rgba(21,128,61,0.05) 0%, rgba(16,185,129,0.08) 100%)' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>👥</div>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, color: 'var(--brand-green)' }}>
              Collaborative Network
            </h3>
            <p style={{ fontSize: 14, color: '#666', lineHeight: 1.6, margin: 0 }}>
              Connect with clinicians, moderators, and fellow learners in a supportive community dedicated to medical education
            </p>
          </div>

          {/* Real-time Feedback */}
          <div className="card" style={{ padding: 28, background: 'linear-gradient(135deg, rgba(21,128,61,0.05) 0%, rgba(16,185,129,0.08) 100%)' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>⚡</div>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, color: 'var(--brand-green)' }}>
              Instant Feedback
            </h3>
            <p style={{ fontSize: 14, color: '#666', lineHeight: 1.6, margin: 0 }}>
              Immediate evaluation of exam responses with detailed explanations to reinforce learning outcomes
            </p>
          </div>

          {/* Analytics Dashboard */}
          <div className="card" style={{ padding: 28, background: 'linear-gradient(135deg, rgba(21,128,61,0.05) 0%, rgba(16,185,129,0.08) 100%)' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>📊</div>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, color: 'var(--brand-green)' }}>
              Visual Analytics
            </h3>
            <p style={{ fontSize: 14, color: '#666', lineHeight: 1.6, margin: 0 }}>
              Comprehensive dashboards visualize learning trends, performance metrics, and achieve your personal benchmarks
            </p>
          </div>

          {/* Secure Platform */}
          <div className="card" style={{ padding: 28, background: 'linear-gradient(135deg, rgba(21,128,61,0.05) 0%, rgba(16,185,129,0.08) 100%)' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🔐</div>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, color: 'var(--brand-green)' }}>
              Secure & Trustworthy
            </h3>
            <p style={{ fontSize: 14, color: '#666', lineHeight: 1.6, margin: 0 }}>
              Enterprise-grade security ensures your medical data and learning records are protected with highest standards
            </p>
          </div>
        </div>
      </div>

      {/* Role-Specific Section */}
      <div style={{
        background: '#f0fdf7',
        padding: 32,
        borderRadius: 12,
        border: '2px solid var(--brand-green)',
        marginBottom: 40
      }}>
        <h2 style={{ marginBottom: 24, fontSize: 28, fontWeight: 700, color: 'var(--brand-green)' }}>🎓 Your Role & Responsibilities</h2>
        
        {isStudent && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>📚 Learning Path</h3>
              <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.8 }}>
                <li>Take diverse medical exams</li>
                <li>Track your progress over time</li>
                <li>Review detailed exam reports</li>
                <li>Identify improvement areas</li>
                <li>Download official certificates</li>
              </ul>
            </div>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>🚀 Quick Start</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <Link to="/exams" className="btn btn-primary" style={{ textAlign: 'center' }}>Browse Exams</Link>
                <Link to="/student-stats" className="btn btn-ghost" style={{ textAlign: 'center' }}>View Statistics</Link>
              </div>
            </div>
          </div>
        )}

        {isClinician && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>🏥 Your Contribution</h3>
              <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.8 }}>
                <li>Create high-quality questions</li>
                <li>Submit for expert review</li>
                <li>Manage your question bank</li>
                <li>View approval status</li>
                <li>Receive feedback from moderators</li>
              </ul>
            </div>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>📝 Quick Actions</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <Link to="/upload" className="btn btn-primary" style={{ textAlign: 'center' }}>Create Question</Link>
                <Link to="/manage" className="btn btn-ghost" style={{ textAlign: 'center' }}>Manage Questions</Link>
              </div>
            </div>
          </div>
        )}

        {isModerator && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>✅ Quality Assurance</h3>
              <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.8 }}>
                <li>Review submitted questions</li>
                <li>Approve quality content</li>
                <li>Send feedback to clinicians</li>
                <li>Maintain standards</li>
                <li>Support curriculum enhancement</li>
              </ul>
            </div>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>🔍 Quick Actions</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <Link to="/moderator" className="btn btn-primary" style={{ textAlign: 'center' }}>Review Queue</Link>
                <Link to="/clinician-dashboard" className="btn btn-ghost" style={{ textAlign: 'center' }}>View Analytics</Link>
              </div>
            </div>
          </div>
        )}

        {isAdmin && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>🔐 System Administration</h3>
              <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.8 }}>
                <li>Manage all users</li>
                <li>Create user accounts</li>
                <li>Monitor system activity</li>
                <li>View comprehensive analytics</li>
                <li>Maintain platform integrity</li>
              </ul>
            </div>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>⚙️ Quick Actions</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <Link to="/admin-users" className="btn btn-primary" style={{ textAlign: 'center' }}>Manage Users</Link>
                <Link to="/clinician-dashboard" className="btn btn-ghost" style={{ textAlign: 'center' }}>View Analytics</Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* About Section */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 32,
        alignItems: 'center',
        marginBottom: 40,
        padding: 32,
        background: 'linear-gradient(135deg, rgba(21,128,61,0.06) 0%, rgba(16,185,129,0.06) 100%)',
        borderRadius: 12
      }}>
        <div>
          <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 16, color: 'var(--brand-green)' }}>
            🌱 Technology Meets Healthcare
          </h2>
          <p style={{ fontSize: 16, lineHeight: 1.8, color: '#555', marginBottom: 12 }}>
            The Chomthong Hospital Medical Learning Platform represents a modern approach to continuous medical education. By combining natural healthcare expertise with cutting-edge technology, we create an environment where clinicians and students can thrive.
          </p>
          <p style={{ fontSize: 16, lineHeight: 1.8, color: '#555', margin: 0 }}>
            Together, we're building a community dedicated to advancing medical knowledge and improving patient outcomes through expert-led learning.
          </p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 120, animation: 'pulse 3s ease-in-out infinite' }}>
            🌿💻
          </div>
          <p style={{ marginTop: 12, fontSize: 14, fontWeight: 600, color: 'var(--brand-green)' }}>
            Natural Knowledge + Digital Innovation
          </p>
        </div>
      </div>

      {/* Footer CTA */}
      <div style={{
        background: 'var(--brand-green)',
        color: '#ffffff',
        padding: 40,
        borderRadius: 12,
        textAlign: 'center'
      }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 16px 0' }}>Ready to Begin Your Journey?</h2>
        <p style={{ fontSize: 16, margin: '0 0 24px 0', opacity: 0.95 }}>
          Start learning, contributing, and growing with Chomthong Hospital's Medical Learning Platform
        </p>
        {!isStudent && !isClinician && !isModerator && !isAdmin && (
          <Link to="/login" className="btn" style={{ background: '#ffffff', color: 'var(--brand-green)', fontWeight: 800 }}>
            Get Started Now
          </Link>
        )}
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </div>
  )
}
