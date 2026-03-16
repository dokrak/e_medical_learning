import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'
import { useLang } from '../LangContext'

export default function HomePage(){
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null
  const [stats, setStats] = useState(null)
  const [platformStats, setPlatformStats] = useState(null)
  const [expandedRole, setExpandedRole] = useState(null)
  const { t } = useLang()
  
  useEffect(() => {
    if (user?.role === 'student' || user?.role === 'resident' || user?.role === 'fellow') {
      loadStats()
    }
    loadPlatformStats()
  }, [])

  async function loadStats(){
    try {
      const r = await api.get('/my-stats')
      setStats(r.data)
    } catch(e) { /* ignore */ }
  }

  async function loadPlatformStats(){
    try {
      const r = await api.get('/platform-stats')
      setPlatformStats(r.data)
    } catch(e) {
      setPlatformStats({ questions: 0, exams: 0, users: 0, specialties: 0 })
    }
  }

  const isStudent = user?.role === 'student' || user?.role === 'resident' || user?.role === 'fellow'
  const isResident = user?.role === 'resident'
  const isFellow = user?.role === 'fellow'
  const isClinician = user?.role === 'clinician'
  const isAdmin = user?.role === 'admin'
  const isModerator = user?.role === 'moderator'

  const activeRole = isResident ? 'resident' : isFellow ? 'fellow' : isStudent ? 'student' : isClinician ? 'clinician' : isModerator ? 'moderator' : isAdmin ? 'admin' : null

  const rolePanels = {
    student: {
      titleKey: 'learnerPath', icon: '📚',
      bullets: ['studentBullet1', 'studentBullet2', 'studentBullet3'],
      actions: [
        { to: '/exams', labelKey: 'startExamBtn', primary: true },
        { to: '/student-stats', labelKey: 'viewStats', primary: false }
      ]
    },
    resident: {
      titleKey: 'residentPath', icon: '🩺',
      bullets: ['residentBullet1', 'residentBullet2', 'residentBullet3'],
      actions: [
        { to: '/exams', labelKey: 'startExamBtn', primary: true },
        { to: '/upload', labelKey: 'createQuestionBtn', primary: false }
      ]
    },
    fellow: {
      titleKey: 'fellowPath', icon: '🎓',
      bullets: ['fellowBullet1', 'fellowBullet2', 'fellowBullet3'],
      actions: [
        { to: '/exams', labelKey: 'startExamBtn', primary: true },
        { to: '/upload', labelKey: 'createQuestionBtn', primary: false }
      ]
    },
    clinician: {
      titleKey: 'clinicianWorkflow', icon: '🏥',
      bullets: ['clinicianBullet1', 'clinicianBullet2', 'clinicianBullet3'],
      actions: [
        { to: '/upload', labelKey: 'createQuestionBtn', primary: true },
        { to: '/manage', labelKey: 'manageItems', primary: false }
      ]
    },
    moderator: {
      titleKey: 'moderatorWorkflow', icon: '✅',
      bullets: ['moderatorBullet1', 'moderatorBullet2', 'moderatorBullet3'],
      actions: [
        { to: '/moderator', labelKey: 'reviewQueue', primary: true },
        { to: '/clinician-dashboard', labelKey: 'viewAnalytics', primary: false }
      ]
    },
    admin: {
      titleKey: 'adminControl', icon: '🔐',
      bullets: ['adminBullet1', 'adminBullet2', 'adminBullet3'],
      actions: [
        { to: '/admin-users', labelKey: 'manageUsersBtn', primary: true },
        { to: '/clinician-dashboard', labelKey: 'dashboard', primary: false }
      ]
    }
  }

  const rolePanel = activeRole ? rolePanels[activeRole] : null

  const whyCards = [
    { icon: '🔬', titleKey: 'whyEvidence', descKey: 'whyEvidenceDesc' },
    { icon: '📊', titleKey: 'whyAnalytics', descKey: 'whyAnalyticsDesc' },
    { icon: '🤝', titleKey: 'whyMultiRole', descKey: 'whyMultiRoleDesc' },
    { icon: '🌏', titleKey: 'whyBilingual', descKey: 'whyBilingualDesc' },
    { icon: '🔄', titleKey: 'whyContinuous', descKey: 'whyContinuousDesc' },
    { icon: '🛡️', titleKey: 'whySecure', descKey: 'whySecureDesc' },
  ]

  const kmSteps = [
    { num: '01', icon: '✏️', titleKey: 'kmStep1', descKey: 'kmStep1Desc', color: '#16a34a' },
    { num: '02', icon: '🔍', titleKey: 'kmStep2', descKey: 'kmStep2Desc', color: '#0f766e' },
    { num: '03', icon: '📝', titleKey: 'kmStep3', descKey: 'kmStep3Desc', color: '#0369a1' },
    { num: '04', icon: '📈', titleKey: 'kmStep4', descKey: 'kmStep4Desc', color: '#7c3aed' },
    { num: '05', icon: '🚀', titleKey: 'kmStep5', descKey: 'kmStep5Desc', color: '#db2777' },
  ]

  return (
    <div>
      {/* ========== HERO SECTION ========== */}
      <div style={{
        backgroundImage: 'linear-gradient(140deg, rgba(15,81,50,0.88) 0%, rgba(15,118,110,0.82) 40%, rgba(22,78,99,0.88) 100%), url(/hero-bg.jpg)',
        backgroundSize: 'cover', backgroundPosition: 'center',
        padding: '64px 32px 56px', borderRadius: 20, marginBottom: 32,
        color: '#fff', position: 'relative', overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.14)'
      }}>
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: -60, right: -60, width: 260, height: 260, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
        <div style={{ position: 'absolute', bottom: -40, left: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 900 }}>
          <div style={{
            display: 'inline-block', padding: '6px 16px', borderRadius: 20,
            background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(4px)',
            fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', marginBottom: 16,
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            {t('heroSubtitle')}
          </div>
          <h1 style={{ fontSize: 42, margin: '0 0 8px 0', fontWeight: 900, lineHeight: 1.2 }}>
            {user?.name && <span style={{ opacity: 0.9, fontSize: 28, display: 'block', marginBottom: 4 }}>{t('heroWelcome')}, {user.name}</span>}
            {t('heroTitle')}
          </h1>
          <p style={{ margin: '16px 0 0 0', lineHeight: 1.8, fontSize: 16, maxWidth: 760, opacity: 0.95 }}>
            {t('heroDesc')}
          </p>
          <div style={{ marginTop: 28, display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            {isStudent && <Link to="/exams" className="btn" style={{ background: '#fff', color: '#0f5132', fontWeight: 800, fontSize: 15, padding: '12px 24px' }}>{t('heroStartExam')}</Link>}
            {(isResident || isFellow || isClinician) && <Link to="/upload" className="btn" style={{ background: '#fff', color: '#0f5132', fontWeight: 800, fontSize: 15, padding: '12px 24px' }}>{t('heroCreateQ')}</Link>}
            {isModerator && <Link to="/moderator" className="btn" style={{ background: '#fff', color: '#0f5132', fontWeight: 800, fontSize: 15, padding: '12px 24px' }}>{t('heroReviewQueue')}</Link>}
            {isAdmin && <Link to="/admin-users" className="btn" style={{ background: '#fff', color: '#0f5132', fontWeight: 800, fontSize: 15, padding: '12px 24px' }}>{t('heroManageSystem')}</Link>}
            {!user && <Link to="/login" className="btn" style={{ background: '#fff', color: '#0f5132', fontWeight: 800, fontSize: 15, padding: '12px 24px' }}>{t('heroSignIn')}</Link>}
          </div>
        </div>
      </div>

      {/* ========== KM METRICS SECTION ========== */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 28, color: '#0f5132', margin: '0 0 6px 0' }}>{t('kmMetricsTitle')}</h2>
          <p style={{ color: '#475569', margin: 0, fontSize: 15 }}>{t('kmMetricsDesc')}</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
          {[
            { value: platformStats?.questions ?? '—', label: t('kmQuestionBank'), icon: '🧠', gradient: 'linear-gradient(135deg, #ecfdf5, #d1fae5)' },
            { value: platformStats?.exams ?? '—', label: t('kmExamsCreated'), icon: '📋', gradient: 'linear-gradient(135deg, #ecfeff, #cffafe)' },
            { value: platformStats?.users ?? '—', label: t('kmActiveUsers'), icon: '👥', gradient: 'linear-gradient(135deg, #eff6ff, #dbeafe)' },
            { value: platformStats?.specialties ?? '—', label: t('kmSpecialties'), icon: '🩺', gradient: 'linear-gradient(135deg, #fdf4ff, #f3e8ff)' },
          ].map((m, i) => (
            <div key={i} style={{
              background: m.gradient, borderRadius: 16, padding: '28px 20px', textAlign: 'center',
              border: '1px solid rgba(15,118,110,0.12)', transition: 'transform 0.2s',
              cursor: 'default'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ fontSize: 36, marginBottom: 8 }}>{m.icon}</div>
              <div style={{ fontSize: 36, fontWeight: 900, color: '#0f5132', lineHeight: 1 }}>{m.value}</div>
              <div style={{ fontSize: 13, color: '#475569', marginTop: 6, fontWeight: 600 }}>{m.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ========== PERSONAL STATS (Students only) ========== */}
      {isStudent && stats && (
        <div style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 24, marginBottom: 14, color: '#0f5132' }}>📊 {t('learningSnapshot')}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
            <div className="card" style={{ borderLeft: '5px solid #16a34a', textAlign: 'center' }}>
              <div style={{ fontSize: 34, fontWeight: 900, color: '#0f5132' }}>{stats.attempts.length}</div>
              <div className="small" style={{ fontWeight: 600 }}>{t('examsCompleted')}</div>
            </div>
            <div className="card" style={{ borderLeft: '5px solid #0f766e', textAlign: 'center' }}>
              <div style={{ fontSize: 34, fontWeight: 900, color: '#0f5132' }}>{stats.avgScore}%</div>
              <div className="small" style={{ fontWeight: 600 }}>{t('avgScore')}</div>
            </div>
            <div className="card" style={{ borderLeft: '5px solid #0369a1', textAlign: 'center' }}>
              <div style={{ fontSize: 34, fontWeight: 900, color: '#0f5132' }}>{stats.bestScore}%</div>
              <div className="small" style={{ fontWeight: 600 }}>{t('bestScore')}</div>
            </div>
            <div className="card" style={{ borderLeft: `5px solid ${stats.improvement > 0 ? '#16a34a' : '#dc2626'}`, textAlign: 'center' }}>
              <div style={{ fontSize: 34, fontWeight: 900, color: stats.improvement > 0 ? '#16a34a' : '#dc2626' }}>{stats.improvement > 0 ? '+' : ''}{stats.improvement}%</div>
              <div className="small" style={{ fontWeight: 600 }}>{t('improvement')}</div>
            </div>
          </div>
        </div>
      )}

      {/* ========== ROLE PANEL ========== */}
      {rolePanel && (
        <div style={{
          marginBottom: 36, borderRadius: 16, overflow: 'hidden',
          background: 'linear-gradient(145deg, #0f5132, #0f766e 60%, #164e63)',
          boxShadow: '0 12px 40px rgba(15,81,50,0.20)'
        }}>
          <div style={{ padding: '28px 28px 24px', color: '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <span style={{ fontSize: 32 }}>{rolePanel.icon}</span>
              <h2 style={{ margin: 0, fontSize: 24 }}>{t(rolePanel.titleKey)}</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 24, alignItems: 'center' }}>
              <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 2, fontSize: 15, opacity: 0.95 }}>
                {rolePanel.bullets.map((key, i) => <li key={i}>{t(key)}</li>)}
              </ul>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {rolePanel.actions.map((action, i) => (
                  <Link key={i} to={action.to} className="btn"
                    style={{
                      textAlign: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14,
                      minWidth: 160, padding: '10px 20px',
                      background: action.primary ? '#fff' : 'transparent',
                      color: action.primary ? '#0f5132' : '#fff',
                      border: action.primary ? 'none' : '1.5px solid rgba(255,255,255,0.45)'
                    }}
                  >
                    {t(action.labelKey)}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========== KM CYCLE SECTION ========== */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: 28, color: '#0f5132', margin: '0 0 6px 0' }}>{t('kmCycleTitle')}</h2>
          <p style={{ color: '#475569', margin: 0, fontSize: 15 }}>{t('kmCycleDesc')}</p>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 0, justifyContent: 'center', position: 'relative' }}>
          {kmSteps.map((step, i) => (
            <div key={i} style={{ flex: '1 1 180px', maxWidth: 220, position: 'relative', textAlign: 'center', padding: '0 10px' }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%', margin: '0 auto 12px',
                background: `linear-gradient(135deg, ${step.color}22, ${step.color}11)`,
                border: `3px solid ${step.color}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 28, position: 'relative'
              }}>
                {step.icon}
                <span style={{
                  position: 'absolute', top: -6, right: -6, width: 24, height: 24,
                  borderRadius: '50%', background: step.color, color: '#fff',
                  fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>{step.num}</span>
              </div>
              <div style={{ fontWeight: 800, color: step.color, fontSize: 16, marginBottom: 4 }}>{t(step.titleKey)}</div>
              <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.5 }}>{t(step.descKey)}</div>
              {i < kmSteps.length - 1 && (
                <div style={{
                  position: 'absolute', top: 32, right: -14,
                  fontSize: 20, color: '#b8d7d0', fontWeight: 900
                }}>→</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ========== WHY SECTION ========== */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 28, color: '#0f5132', margin: 0 }}>{t('whyTitle')}</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
          {whyCards.map((card, i) => (
            <div key={i} className="card" style={{
              background: 'linear-gradient(145deg, #ffffff, #f0fdf4)',
              border: '1px solid rgba(15,118,110,0.15)',
              padding: '24px', display: 'flex', gap: 16, alignItems: 'flex-start'
            }}>
              <div style={{
                fontSize: 28, width: 52, height: 52, borderRadius: 14, flexShrink: 0,
                background: 'linear-gradient(135deg, rgba(15,118,110,0.12), rgba(22,78,99,0.08))',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>{card.icon}</div>
              <div>
                <div style={{ fontWeight: 800, color: '#0f5132', fontSize: 15, marginBottom: 4 }}>{t(card.titleKey)}</div>
                <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.65 }}>{t(card.descKey)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========== COMMUNITY & HOSPITAL SUMMARY ========== */}
      {platformStats?.roleCounts && Object.keys(platformStats.roleCounts).length > 0 && (
        <div style={{ marginBottom: 36 }}>
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <h2 style={{ fontSize: 28, color: '#0f5132', margin: '0 0 6px 0' }}>🌐 {t('communityTitle')}</h2>
            <p style={{ color: '#475569', margin: 0, fontSize: 15 }}>{t('communityDesc')}</p>
          </div>

          {/* Role summary cards */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, justifyContent: 'center', marginBottom: 24 }}>
            {[
              { key: 'admin', icon: '🔐', color: '#8b5cf6', bg: '#f5f3ff' },
              { key: 'moderator', icon: '✅', color: '#3b82f6', bg: '#eff6ff' },
              { key: 'clinician', icon: '🏥', color: '#22c55e', bg: '#f0fdf4' },
              { key: 'fellow', icon: '🎓', color: '#ec4899', bg: '#fdf2f8' },
              { key: 'resident', icon: '🩺', color: '#f97316', bg: '#fff7ed' },
              { key: 'student', icon: '📚', color: '#6b7280', bg: '#f9fafb' },
            ].filter(r => platformStats.roleCounts[r.key]).map((r, i) => {
              const roleHospitals = (platformStats.roleHospitals || {})[r.key] || []
              return (
                <div key={i} style={{
                  background: r.bg, borderRadius: 16, padding: '24px 24px 18px', textAlign: 'center',
                  border: `2px solid ${r.color}20`, minWidth: 170, flex: '1 1 170px', maxWidth: 220,
                  transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                }}
                onClick={() => setExpandedRole(expandedRole === r.key ? null : r.key)}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)' }}
                >
                  <div style={{ fontSize: 32, marginBottom: 6 }}>{r.icon}</div>
                  <div style={{ fontSize: 36, fontWeight: 900, color: r.color, lineHeight: 1 }}>{platformStats.roleCounts[r.key]}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: r.color, marginTop: 4, marginBottom: 8 }}>
                    {t(`role${r.key.charAt(0).toUpperCase() + r.key.slice(1)}`)}
                  </div>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
                    {roleHospitals.length > 0 ? `🏥 ${roleHospitals.length} ${t('networkHospitals') || 'hospitals'}` : ''}
                  </div>
                  <div style={{ fontSize: 10, color: r.color, opacity: 0.6, marginTop: 6 }}>
                    ▼ {t('clickToView') || 'Click to view'}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Expanded role detail modal */}
          {expandedRole && (() => {
            const roleConfig = [
              { key: 'admin', icon: '🔐', color: '#8b5cf6', bg: '#f5f3ff' },
              { key: 'moderator', icon: '✅', color: '#3b82f6', bg: '#eff6ff' },
              { key: 'clinician', icon: '🏥', color: '#22c55e', bg: '#f0fdf4' },
              { key: 'fellow', icon: '🎓', color: '#ec4899', bg: '#fdf2f8' },
              { key: 'resident', icon: '🩺', color: '#f97316', bg: '#fff7ed' },
              { key: 'student', icon: '📚', color: '#6b7280', bg: '#f9fafb' },
            ]
            const rc = roleConfig.find(r => r.key === expandedRole)
            const roleHospitals = (platformStats.roleHospitals || {})[expandedRole] || []
            const roleName = t(`role${expandedRole.charAt(0).toUpperCase() + expandedRole.slice(1)}`)
            return (
              <div style={{
                background: rc?.bg || '#f9fafb', borderRadius: 16, padding: '24px 28px',
                border: `2px solid ${rc?.color || '#ccc'}30`, marginBottom: 24,
                animation: 'fadeIn 0.3s ease'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h3 style={{ margin: 0, fontSize: 20, color: rc?.color || '#333' }}>
                    {rc?.icon} {roleName} — {t('hospitalProvinceDetail') || 'Hospital & Province Detail'}
                  </h3>
                  <button
                    onClick={() => setExpandedRole(null)}
                    style={{
                      background: 'none', border: `1px solid ${rc?.color || '#ccc'}40`, borderRadius: 8,
                      padding: '4px 12px', cursor: 'pointer', fontSize: 14, color: rc?.color || '#666'
                    }}
                  >✕</button>
                </div>
                {roleHospitals.length === 0 ? (
                  <p style={{ color: '#94a3b8', fontStyle: 'italic', margin: 0 }}>
                    {t('noHospitalData') || 'No hospital data available'}
                  </p>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
                    {roleHospitals.map((rh, j) => (
                      <div key={j} style={{
                        background: '#fff', borderRadius: 12, padding: '14px 18px',
                        border: `1px solid ${rc?.color || '#ccc'}15`,
                        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                        display: 'flex', alignItems: 'center', gap: 12
                      }}>
                        <div style={{
                          width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: `${rc?.color || '#ccc'}15`, fontSize: 20, flexShrink: 0
                        }}>🏥</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: 14, color: '#1e293b' }}>{rh.hospital}</div>
                          {rh.province && <div style={{ fontSize: 12, color: '#64748b' }}>📍 {rh.province}</div>}
                          {rh.count > 0 && <div style={{ fontSize: 11, color: rc?.color, fontWeight: 600, marginTop: 2 }}>{rh.count} {t('networkMembers') || 'members'}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })()}

          {/* Hospital network summary */}
          {platformStats?.hospitals?.length > 0 && (
            <div style={{
              background: 'linear-gradient(145deg, #0f5132, #0f766e 60%, #164e63)',
              borderRadius: 16, padding: '28px 28px 24px', color: '#fff'
            }}>
              <h3 style={{ margin: '0 0 16px 0', textAlign: 'center', fontSize: 20 }}>🏥 {t('networkTitle')}</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, justifyContent: 'center' }}>
                {platformStats.hospitals.map((h, i) => (
                  <div key={i} style={{
                    background: 'rgba(255,255,255,0.12)', borderRadius: 14, padding: '16px 20px',
                    border: '1px solid rgba(255,255,255,0.15)', minWidth: 200, flex: '1 1 200px', maxWidth: 300,
                    backdropFilter: 'blur(4px)'
                  }}>
                    <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 4 }}>{h.hospital}</div>
                    {h.province && <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 8 }}>📍 {h.province}</div>}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 13 }}>
                        <strong style={{ fontSize: 22 }}>{h.count}</strong> {t('networkMembers')}
                      </span>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {h.roles?.map((r, j) => (
                          <span key={j} style={{
                            padding: '2px 8px', borderRadius: 10, fontSize: 10, fontWeight: 700,
                            background: 'rgba(255,255,255,0.2)', color: '#fff'
                          }}>
                            {t(`role${r.charAt(0).toUpperCase() + r.slice(1)}`)}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========== CTA SECTION ========== */}
      <div style={{
        background: 'linear-gradient(140deg, #0f5132, #0f766e 50%, #164e63)',
        color: '#fff', borderRadius: 18, padding: '40px 32px', textAlign: 'center',
        position: 'relative', overflow: 'hidden',
        boxShadow: '0 12px 40px rgba(15,81,50,0.20)'
      }}>
        <div style={{ position: 'absolute', top: -30, right: -30, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ margin: '0 0 10px 0', fontSize: 28 }}>{t('ctaTitle')}</h2>
          <p style={{ margin: '0 auto 24px', opacity: 0.92, maxWidth: 600, lineHeight: 1.6 }}>
            {t('ctaDesc')}
          </p>
          {!user && <Link to="/login" className="btn" style={{ background: '#fff', color: '#0f5132', fontWeight: 800, fontSize: 16, padding: '14px 32px' }}>{t('ctaGetStarted')}</Link>}
          {user && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
              {isStudent && <Link to="/exams" className="btn" style={{ background: '#fff', color: '#0f5132', fontWeight: 800, padding: '12px 28px' }}>{t('heroStartExam')}</Link>}
              {(isResident || isFellow || isClinician) && <Link to="/upload" className="btn" style={{ background: '#fff', color: '#0f5132', fontWeight: 800, padding: '12px 28px' }}>{t('heroCreateQ')}</Link>}
              {isModerator && <Link to="/moderator" className="btn" style={{ background: '#fff', color: '#0f5132', fontWeight: 800, padding: '12px 28px' }}>{t('heroReviewQueue')}</Link>}
              {isAdmin && <Link to="/clinician-dashboard" className="btn" style={{ background: '#fff', color: '#0f5132', fontWeight: 800, padding: '12px 28px' }}>{t('dashboard')}</Link>}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
