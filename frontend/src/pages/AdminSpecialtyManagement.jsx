import React, { useEffect, useState } from 'react';
import api from '../api';
import { Link } from 'react-router-dom';
import { useLang } from '../LangContext';

export default function AdminSpecialtyManagement() {
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', subs: [] });
  const [subEditIdx, setSubEditIdx] = useState(null);
  const [subEditValue, setSubEditValue] = useState('');
  const [error, setError] = useState('');
  const { t } = useLang();

  useEffect(() => { loadSpecialties(); }, []);

  async function loadSpecialties() {
    setLoading(true);
    try {
      const r = await api.get('/admin/specialties');
      setSpecialties(r.data.map(s => ({
        ...s,
        subs: Array.isArray(s.subspecialties) ? s.subspecialties : (s.subspecialties ? s.subspecialties : [])
      })));
    } catch (err) {
      setMsg(t('asmLoadFailed'));
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      if (editing) {
        await api.put(`/admin/specialties/${editing.id}`, form);
        setMsg(t('asmUpdated'));
      } else {
        await api.post('/admin/specialties', form);
        setMsg(t('asmAdded'));
      }
      setForm({ name: '', subs: [] });
      setEditing(null);
      loadSpecialties();
    } catch (err) {
      setMsg(t('asmSaveFailed'));
    } finally {
      setLoading(false);
    }
  }

  function handleEdit(s) {
    setEditing(s);
    setForm({
      name: s.name,
      subs: (s.subs || []).map(sub =>
        typeof sub === 'object' && sub !== null ? (sub.name || JSON.stringify(sub)) : sub
      )
    });
    setSubEditIdx(null);
    setSubEditValue('');
  }

  function handleSubAdd() {
    if (!subEditValue.trim()) return;
    setForm({ ...form, subs: [...form.subs, subEditValue.trim()] });
    setSubEditValue('');
    setSubEditIdx(null);
  }

  function handleSubEdit(idx) {
    setSubEditIdx(idx);
    setSubEditValue(form.subs[idx]);
  }

  function handleSubSave() {
    if (subEditIdx === null || !subEditValue.trim()) return;
    const newSubs = [...form.subs];
    newSubs[subEditIdx] = subEditValue.trim();
    setForm({ ...form, subs: newSubs });
    setSubEditIdx(null);
    setSubEditValue('');
  }

  async function handleSubDelete(idx) {
    if (!window.confirm(t('asmDeleteSubConfirm'))) return;
    const newSubs = form.subs.filter((_, i) => i !== idx);
    setForm({ ...form, subs: newSubs });
    setSubEditIdx(null);
    setSubEditValue('');
    if (editing) {
      setLoading(true);
      try {
        await api.put(`/admin/specialties/${editing.id}`, { name: form.name, subs: newSubs });
        setMsg(t('asmSubDeleted'));
        loadSpecialties();
      } catch (err) {
        setMsg(t('asmSaveAfterDeleteFailed'));
      } finally {
        setLoading(false);
      }
    }
  }

  async function handleDelete(id) {
    if (!window.confirm(t('asmDeleteSpecConfirm'))) return;
    setLoading(true);
    try {
      await api.delete(`/admin/specialties/${id}`);
      setMsg(t('asmDeleted'));
      setEditing(null);
      setForm({ name: '', subs: [] });
      loadSpecialties();
    } catch (err) {
      setMsg(t('asmDeleteFailed'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: '40px auto', padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
        <Link to="/admin-users" style={{ color: '#2563eb', fontWeight: 600, fontSize: 16, marginRight: 16 }}>{t('asmBackToAdmin')}</Link>
        <h1 style={{ fontSize: 32, fontWeight: 700, color: '#1e293b', margin: 0 }}>{t('asmTitle')}</h1>
      </div>
      <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 16px #0001', padding: 32, marginBottom: 32 }}>
        <h2 style={{ fontSize: 22, fontWeight: 600, color: '#2563eb', marginBottom: 16 }}>{editing ? t('asmEditSpec') : t('asmAddSpec')}</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <input
            type="text"
            placeholder={t('asmSpecName')}
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            required
            style={{ fontSize: 18, padding: '10px 16px', borderRadius: 8, border: '1px solid #cbd5e1', background: '#f8fafc' }}
          />
          <div>
            <label style={{ fontWeight: 500, color: '#334155', marginBottom: 8 }}>{t('asmSubSpecs')}</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
              {form.subs.map((sub, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', background: '#e0e7ef', borderRadius: 16, padding: '4px 12px', fontSize: 15 }}>
                  {subEditIdx === idx ? (
                    <>
                      <input value={subEditValue} onChange={e => setSubEditValue(e.target.value)} style={{ fontSize: 15, borderRadius: 8, border: '1px solid #cbd5e1', marginRight: 8 }} />
                      <button type="button" onClick={handleSubSave} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '4px 10px', marginRight: 4 }}>{t('save')}</button>
                      <button type="button" onClick={() => { setSubEditIdx(null); setSubEditValue(''); }} style={{ background: '#f1f5f9', color: '#334155', border: 'none', borderRadius: 8, padding: '4px 10px' }}>{t('cancel')}</button>
                    </>
                  ) : (
                    <>
                      <span>{sub}</span>
                      <button type="button" onClick={() => handleSubEdit(idx)} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '4px 10px', marginLeft: 8 }}>{t('mqEdit')}</button>
                      <button type="button" onClick={() => handleSubDelete(idx)} style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 8, padding: '4px 10px', marginLeft: 4 }}>{t('delete')}</button>
                    </>
                  )}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                placeholder={t('asmAddSub')}
                value={subEditIdx === null ? subEditValue : ''}
                onChange={e => setSubEditValue(e.target.value)}
                disabled={subEditIdx !== null}
                style={{ fontSize: 15, borderRadius: 8, border: '1px solid #cbd5e1', background: '#f8fafc', flex: 1 }}
              />
              <button type="button" onClick={handleSubAdd} disabled={subEditIdx !== null || !subEditValue.trim()} style={{ background: '#10b981', color: '#fff', border: 'none', borderRadius: 8, padding: '4px 16px', fontWeight: 600 }}>{t('asmAdd')}</button>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button type="submit" disabled={loading} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', fontSize: 17, fontWeight: 600 }}>{editing ? t('asmUpdate') : t('asmAdd')}</button>
            {editing && <button type="button" onClick={() => { setEditing(null); setForm({ name: '', subs: [] }); setSubEditIdx(null); setSubEditValue(''); }} style={{ background: '#f1f5f9', color: '#334155', border: 'none', borderRadius: 8, padding: '10px 24px', fontSize: 17 }}>{t('cancel')}</button>}
          </div>
        </form>
        {msg && <div style={{ color: '#10b981', marginTop: 16, fontWeight: 500 }}>{msg}</div>}
      </div>
      <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 16px #0001', padding: 32 }}>
        <h2 style={{ fontSize: 22, fontWeight: 600, color: '#2563eb', marginBottom: 16 }}>{t('asmSpecList')}</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 16 }}>
          <thead style={{ background: '#f1f5f9' }}>
            <tr>
              <th style={{ padding: '12px 8px', textAlign: 'left', color: '#334155', fontWeight: 600 }}>{t('mqSpecialty')}</th>
              <th style={{ padding: '12px 8px', textAlign: 'left', color: '#334155', fontWeight: 600 }}>{t('asmSubSpecsCol')}</th>
              <th style={{ padding: '12px 8px', textAlign: 'center', color: '#334155', fontWeight: 600 }}>{t('asmActions')}</th>
            </tr>
          </thead>
          <tbody>
            {specialties.map(s => (
              <tr key={s.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '12px 8px', fontWeight: 500 }}>{s.name}</td>
                <td style={{ padding: '12px 8px' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {(s.subs || []).map((sub, idx) =>
                      <span key={idx} style={{ background: '#e0e7ef', color: '#334155', borderRadius: 16, padding: '4px 12px', fontSize: 15 }}>{typeof sub === 'object' && sub !== null ? (sub.name || JSON.stringify(sub)) : sub}</span>
                    )}
                  </div>
                </td>
                <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                  <button onClick={() => handleEdit(s)} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 18px', fontWeight: 600, marginRight: 8 }}>{t('mqEdit')}</button>
                  <button onClick={() => handleDelete(s.id)} style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 18px', fontWeight: 600 }}>{t('delete')}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
