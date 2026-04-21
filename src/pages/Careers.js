import React, { useEffect, useState } from 'react';
import API from '../api';
import toast from 'react-hot-toast';

const EMPTY = {
  title: '', department: '', location: '', type: 'Full-Time', experience: '',
  salary: '', openings: 1, short_desc: '', about_role: '',
  responsibilities: [''], requirements: [''], nice_to_have: [''], benefits: [''],
  status: 'active',
};

const TYPES = ['Full-Time', 'Part-Time', 'Remote', 'Internship', 'Contract'];
const DEPTS = ['Engineering', 'Sales', 'Marketing', 'Operations', 'Finance', 'HR', 'Customer Support', 'General'];

const TYPE_COLORS = {
  'Full-Time':  { bg: '#dbeafe', color: '#1d4ed8' },
  'Part-Time':  { bg: '#fef9c3', color: '#a16207' },
  'Remote':     { bg: '#dcfce7', color: '#15803d' },
  'Internship': { bg: '#fce7f3', color: '#be185d' },
  'Contract':   { bg: '#ede9fe', color: '#6d28d9' },
};

export default function Careers() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [viewJob, setViewJob] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDept, setFilterDept] = useState('all');

  const fetchJobs = () => {
    setLoading(true);
    API.get('/careers').then(r => setJobs(r.data.careers || [])).catch(() => toast.error('Failed to load')).finally(() => setLoading(false));
  };
  useEffect(() => { fetchJobs(); }, []);

  const openNew = () => { setForm(EMPTY); setEditId(null); setShowForm(true); };
  const openEdit = (job) => {
    setForm({ ...job, responsibilities: job.responsibilities?.length ? job.responsibilities : [''], requirements: job.requirements?.length ? job.requirements : [''], nice_to_have: job.nice_to_have?.length ? job.nice_to_have : [''], benefits: job.benefits?.length ? job.benefits : [''] });
    setEditId(job._id); setShowForm(true);
  };
  const handleDuplicate = (job) => {
    setForm({ ...job, title: job.title + ' (Copy)', responsibilities: job.responsibilities?.length ? job.responsibilities : [''], requirements: job.requirements?.length ? job.requirements : [''], nice_to_have: job.nice_to_have?.length ? job.nice_to_have : [''], benefits: job.benefits?.length ? job.benefits : [''] });
    setEditId(null); setShowForm(true);
    toast('Duplicated — edit and save', { icon: '📋' });
  };
  const handleListChange = (field, idx, val) => setForm(f => { const arr = [...f[field]]; arr[idx] = val; return { ...f, [field]: arr }; });
  const addListItem = (field) => setForm(f => ({ ...f, [field]: [...f[field], ''] }));
  const removeListItem = (field, idx) => setForm(f => ({ ...f, [field]: f[field].filter((_, i) => i !== idx) }));

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const payload = { ...form, responsibilities: form.responsibilities.filter(x => x.trim()), requirements: form.requirements.filter(x => x.trim()), nice_to_have: form.nice_to_have.filter(x => x.trim()), benefits: form.benefits.filter(x => x.trim()) };
      if (editId) await API.put(`/careers/${editId}`, payload);
      else await API.post('/careers', payload);
      toast.success(editId ? 'Job updated!' : 'Job created!');
      setShowForm(false); fetchJobs();
    } catch { toast.error('Save failed'); } finally { setSaving(false); }
  };

  const confirmDelete = async () => {
    try { await API.delete(`/careers/${deleteId}`); toast.success('Deleted'); fetchJobs(); }
    catch { toast.error('Delete failed'); } finally { setDeleteId(null); }
  };

  const toggleStatus = async (job) => {
    try { await API.put(`/careers/${job._id}`, { status: job.status === 'active' ? 'closed' : 'active' }); fetchJobs(); toast.success(job.status === 'active' ? 'Job closed' : 'Job activated'); }
    catch { toast.error('Failed'); }
  };

  const filtered = jobs.filter(j => {
    const q = search.toLowerCase();
    return (!search || j.title?.toLowerCase().includes(q) || j.department?.toLowerCase().includes(q) || j.location?.toLowerCase().includes(q))
      && (filterStatus === 'all' || j.status === filterStatus)
      && (filterDept === 'all' || j.department === filterDept);
  });

  const activeCount = jobs.filter(j => j.status === 'active').length;
  const depts = [...new Set(jobs.map(j => j.department).filter(Boolean))];

  return (
    <div style={{ paddingBottom: 60 }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontWeight: 800, color: '#0f172a', fontSize: '1.55rem', margin: 0, letterSpacing: '-0.3px' }}>Career Management</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.82rem', margin: '3px 0 0' }}>Post and manage job openings for your website</p>
        </div>
        <button onClick={openNew} style={{ background: 'linear-gradient(135deg,#0d2240 0%,#1e4d7b 100%)', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 20px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7, boxShadow: '0 4px 12px rgba(13,34,64,0.3)', letterSpacing: '0.2px' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="15" height="15"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Job Opening
        </button>
      </div>

      {/* ── Stats Row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Total Jobs', value: jobs.length, icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="20" height="20"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>, accent: '#3b82f6', light: '#eff6ff' },
          { label: 'Active Jobs', value: activeCount, icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="20" height="20"><polyline points="20 6 9 17 4 12"/></svg>, accent: '#22c55e', light: '#f0fdf4' },
          { label: 'Closed Jobs', value: jobs.length - activeCount, icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="20" height="20"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>, accent: '#f59e0b', light: '#fffbeb' },
          { label: 'Departments', value: depts.length, icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="20" height="20"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>, accent: '#8b5cf6', light: '#f5f3ff' },
        ].map((s, i) => (
          <div key={i} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div style={{ width: 42, height: 42, borderRadius: 10, background: s.light, color: s.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: '1.55rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600, marginTop: 3 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Search & Filter ── */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '14px 16px', display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
          <svg style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', opacity: 0.35 }} viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="2" width="15" height="15"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by title, department, location..." style={{ width: '100%', padding: '8px 12px 8px 32px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: '0.84rem', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', color: '#334155' }} />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={selStyle}>
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="closed">Closed</option>
        </select>
        <select value={filterDept} onChange={e => setFilterDept(e.target.value)} style={selStyle}>
          <option value="all">All Departments</option>
          {depts.map(d => <option key={d}>{d}</option>)}
        </select>
        {(search || filterStatus !== 'all' || filterDept !== 'all') && (
          <button onClick={() => { setSearch(''); setFilterStatus('all'); setFilterDept('all'); }} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 8, padding: '8px 14px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>✕ Clear</button>
        )}
      </div>

      {/* ── Job Cards ── */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 80, color: '#94a3b8', background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0' }}>
          <div style={{ width: 36, height: 36, border: '3px solid #e2e8f0', borderTopColor: '#0d2240', borderRadius: '50%', margin: '0 auto 14px', animation: 'spin 0.8s linear infinite' }}></div>
          Loading jobs...
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: 14, border: '1px dashed #cbd5e1' }}>
          <div style={{ width: 56, height: 56, background: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" width="26" height="26"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
          </div>
          <div style={{ fontWeight: 700, fontSize: '1rem', color: '#475569' }}>{jobs.length === 0 ? 'No jobs posted yet' : 'No matching jobs found'}</div>
          <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: 5 }}>{jobs.length === 0 ? 'Click "Add Job Opening" to get started.' : 'Try adjusting your search or filters.'}</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(job => (
            <div key={job._id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,0,0,0.05)', transition: 'box-shadow 0.2s, transform 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.09)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 6px rgba(0,0,0,0.05)'; e.currentTarget.style.transform = 'translateY(0)'; }}>

              {/* Status stripe */}
              <div style={{ height: 3, background: job.status === 'active' ? 'linear-gradient(90deg,#22c55e,#86efac)' : '#e2e8f0' }} />

              <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>

                {/* Icon Box */}
                <div style={{ width: 44, height: 44, borderRadius: 10, background: 'linear-gradient(135deg,#0d2240,#1e4d7b)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="1.8" width="20" height="20"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/></svg>
                </div>

                {/* Details */}
                <div style={{ flex: 1, minWidth: 160 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7, flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.97rem' }}>{job.title}</span>
                    <span style={{ fontSize: '0.62rem', fontWeight: 700, padding: '2px 9px', borderRadius: 20, background: job.status === 'active' ? '#dcfce7' : '#f1f5f9', color: job.status === 'active' ? '#15803d' : '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.6px', border: `1px solid ${job.status === 'active' ? '#bbf7d0' : '#e2e8f0'}` }}>{job.status}</span>
                    {job.openings > 1 && <span style={{ fontSize: '0.62rem', fontWeight: 700, padding: '2px 9px', borderRadius: 20, background: '#f5f3ff', color: '#6d28d9', border: '1px solid #ddd6fe' }}>{job.openings} Openings</span>}
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.71rem', padding: '2px 9px', borderRadius: 6, fontWeight: 600, background: TYPE_COLORS[job.type]?.bg || '#f3f4f6', color: TYPE_COLORS[job.type]?.color || '#6b7280' }}>{job.type}</span>
                    {job.location && <span style={{ fontSize: '0.71rem', padding: '2px 9px', borderRadius: 6, fontWeight: 600, background: '#f0fdf4', color: '#15803d', display: 'flex', alignItems: 'center', gap: 3 }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="10" height="10"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                      {job.location}</span>}
                    {job.department && <span style={{ fontSize: '0.71rem', padding: '2px 9px', borderRadius: 6, fontWeight: 600, background: '#fffbeb', color: '#b45309' }}>{job.department}</span>}
                    {job.experience && <span style={{ fontSize: '0.71rem', padding: '2px 9px', borderRadius: 6, fontWeight: 600, background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0' }}>{job.experience}</span>}
                    {job.salary && <span style={{ fontSize: '0.71rem', padding: '2px 9px', borderRadius: 6, fontWeight: 600, background: '#fdf4ff', color: '#9333ea' }}>{job.salary}</span>}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <button onClick={() => setViewJob(job)} style={btn('#f8fafc','#334155','#e2e8f0')}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    View
                  </button>
                  <button onClick={() => toggleStatus(job)} style={btn(job.status==='active'?'#fffbeb':'#f0fdf4', job.status==='active'?'#b45309':'#15803d', job.status==='active'?'#fde68a':'#bbf7d0')}>
                    {job.status==='active'
                      ? <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> Close</>
                      : <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13"><polyline points="20 6 9 17 4 12"/></svg> Activate</>}
                  </button>
                  <button onClick={() => openEdit(job)} style={btn('#eff6ff','#1d4ed8','#bfdbfe')}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    Edit
                  </button>
                  <button onClick={() => handleDuplicate(job)} style={btn('#f0fdf4','#15803d','#bbf7d0')}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                    Copy
                  </button>
                  <button onClick={() => setDeleteId(job._id)} style={btn('#fef2f2','#dc2626','#fecaca')}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── View Modal ── */}
      {viewJob && (
        <div style={overlay} onClick={() => setViewJob(null)}>
          <div style={{ background: '#fff', borderRadius: 18, maxWidth: 640, width: '100%', maxHeight: '88vh', overflowY: 'auto', boxShadow: '0 25px 60px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
            <div style={{ background: 'linear-gradient(135deg,#0d2240,#1e4d7b)', padding: '24px 28px', borderRadius: '18px 18px 0 0', position: 'relative' }}>
              <button onClick={() => setViewJob(null)} style={{ position: 'absolute', top: 14, right: 16, background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: 30, height: 30, color: '#fff', fontSize: '1.1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
              <h2 style={{ fontWeight: 800, color: '#fff', margin: '0 0 10px', fontSize: '1.25rem' }}>{viewJob.title}</h2>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {[viewJob.type, viewJob.location && `📍 ${viewJob.location}`, viewJob.department, viewJob.experience, viewJob.salary && `💰 ${viewJob.salary}`, viewJob.openings && `${viewJob.openings} Opening${viewJob.openings>1?'s':''}`].filter(Boolean).map((t, i) => (
                  <span key={i} style={{ fontSize: '0.71rem', background: 'rgba(255,255,255,0.18)', color: '#fff', padding: '3px 11px', borderRadius: 20, fontWeight: 600 }}>{t}</span>
                ))}
              </div>
            </div>
            <div style={{ padding: '24px 28px' }}>
              {viewJob.short_desc && <p style={{ color: '#475569', fontSize: '0.88rem', lineHeight: 1.7, marginBottom: 20, background: '#f8fafc', padding: '12px 16px', borderRadius: 10, borderLeft: '3px solid #0d2240' }}>{viewJob.short_desc}</p>}
              {[
                { key: 'about_role', label: '📖 About the Role', isText: true },
                { key: 'responsibilities', label: '✅ Responsibilities' },
                { key: 'requirements', label: '🎯 Requirements' },
                { key: 'nice_to_have', label: '⭐ Nice to Have' },
                { key: 'benefits', label: '🎁 Benefits & Perks' },
              ].map(({ key, label, isText }) => {
                const val = viewJob[key];
                if (!val || (Array.isArray(val) && val.length === 0)) return null;
                return (
                  <div key={key} style={{ marginBottom: 18 }}>
                    <h4 style={{ color: '#0f172a', fontWeight: 700, marginBottom: 8, fontSize: '0.9rem' }}>{label}</h4>
                    {isText
                      ? <p style={{ color: '#475569', fontSize: '0.87rem', lineHeight: 1.7, margin: 0 }}>{val}</p>
                      : <ul style={{ paddingLeft: 18, margin: 0 }}>{val.map((r, i) => <li key={i} style={{ color: '#475569', fontSize: '0.87rem', marginBottom: 5, lineHeight: 1.6 }}>{r}</li>)}</ul>}
                  </div>
                );
              })}
              <div style={{ display: 'flex', gap: 10, marginTop: 22, paddingTop: 18, borderTop: '1px solid #f1f5f9' }}>
                <button onClick={() => { setViewJob(null); openEdit(viewJob); }} style={{ flex: 1, background: 'linear-gradient(135deg,#0d2240,#1e4d7b)', color: '#fff', border: 'none', borderRadius: 10, padding: '11px', fontWeight: 700, cursor: 'pointer', fontSize: '0.86rem' }}>✏️ Edit This Job</button>
                <button onClick={() => setViewJob(null)} style={{ flex: 1, background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0', borderRadius: 10, padding: '11px', fontWeight: 600, cursor: 'pointer', fontSize: '0.86rem' }}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Modal ── */}
      {deleteId && (
        <div style={overlay}>
          <div style={{ background: '#fff', borderRadius: 16, padding: '32px 28px', maxWidth: 380, width: '100%', textAlign: 'center', boxShadow: '0 25px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ width: 56, height: 56, background: '#fef2f2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="1.8" width="26" height="26"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>
            </div>
            <h3 style={{ fontWeight: 800, color: '#0f172a', marginBottom: 8, fontSize: '1.1rem' }}>Delete Job Posting?</h3>
            <p style={{ color: '#64748b', fontSize: '0.86rem', marginBottom: 24, lineHeight: 1.6 }}>This action cannot be undone. The job listing will be permanently removed from the website.</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setDeleteId(null)} style={{ flex: 1, background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0', borderRadius: 10, padding: '11px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button onClick={confirmDelete} style={{ flex: 1, background: 'linear-gradient(135deg,#dc2626,#b91c1c)', color: '#fff', border: 'none', borderRadius: 10, padding: '11px', fontWeight: 700, cursor: 'pointer' }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add/Edit Form Modal ── */}
      {showForm && (
        <div style={overlay}>
          <div style={{ background: '#fff', borderRadius: 18, maxWidth: 700, width: '100%', maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 25px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ background: 'linear-gradient(135deg,#0d2240,#1e4d7b)', padding: '22px 28px', borderRadius: '18px 18px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontWeight: 800, color: '#fff', margin: 0, fontSize: '1.1rem' }}>{editId ? 'Edit Job Opening' : 'Add New Job Opening'}</h3>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.77rem', margin: '3px 0 0' }}>Fill in the job details below</p>
              </div>
              <button onClick={() => setShowForm(false)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: 32, height: 32, color: '#fff', fontSize: '1.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
            </div>

            <form onSubmit={handleSave} style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Basic Info */}
              <div>
                <div style={secHead}>📋 Basic Information</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div style={{ gridColumn: '1/-1' }}>
                    <label style={lbl}>Job Title *</label>
                    <input required style={inp} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Sales Executive" />
                  </div>
                  <div><label style={lbl}>Department</label><select style={inp} value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))}>{DEPTS.map(d => <option key={d}>{d}</option>)}</select></div>
                  <div><label style={lbl}>Job Type</label><select style={inp} value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>{TYPES.map(t => <option key={t}>{t}</option>)}</select></div>
                  <div><label style={lbl}>Location</label><input style={inp} value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="e.g. Delhi / Remote" /></div>
                  <div><label style={lbl}>Experience</label><input style={inp} value={form.experience} onChange={e => setForm(f => ({ ...f, experience: e.target.value }))} placeholder="e.g. 1–3 years" /></div>
                  <div><label style={lbl}>Salary / CTC</label><input style={inp} value={form.salary} onChange={e => setForm(f => ({ ...f, salary: e.target.value }))} placeholder="e.g. 3–5 LPA" /></div>
                  <div><label style={lbl}>No. of Openings</label><input type="number" min="1" style={inp} value={form.openings} onChange={e => setForm(f => ({ ...f, openings: e.target.value }))} /></div>
                  <div><label style={lbl}>Status</label><select style={inp} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}><option value="active">Active</option><option value="closed">Closed</option></select></div>
                </div>
              </div>

              {/* Description */}
              <div>
                <div style={secHead}>📝 Description</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div><label style={lbl}>Short Description <span style={{ color: '#94a3b8', fontWeight: 400 }}>(shown on listing card)</span></label><textarea style={{ ...inp, height: 72, resize: 'vertical' }} value={form.short_desc} onChange={e => setForm(f => ({ ...f, short_desc: e.target.value }))} placeholder="Brief job summary..." /></div>
                  <div><label style={lbl}>About the Role <span style={{ color: '#94a3b8', fontWeight: 400 }}>(detailed)</span></label><textarea style={{ ...inp, height: 88, resize: 'vertical' }} value={form.about_role} onChange={e => setForm(f => ({ ...f, about_role: e.target.value }))} placeholder="Detailed role description..." /></div>
                </div>
              </div>

              {/* Lists */}
              <div>
                <div style={secHead}>📌 Role Details</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {[
                    { key: 'responsibilities', label: 'Responsibilities', placeholder: 'e.g. Manage customer onboarding' },
                    { key: 'requirements', label: 'Requirements', placeholder: 'e.g. Graduate with 1+ year experience' },
                    { key: 'nice_to_have', label: 'Nice to Have', placeholder: 'e.g. Knowledge of fintech industry' },
                    { key: 'benefits', label: 'Benefits / Perks', placeholder: 'e.g. Health insurance, flexible hours' },
                  ].map(({ key, label, placeholder }) => (
                    <div key={key}>
                      <label style={lbl}>{label}</label>
                      {form[key].map((val, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: 7, marginBottom: 6 }}>
                          <input style={{ ...inp, flex: 1, margin: 0 }} value={val} onChange={e => handleListChange(key, idx, e.target.value)} placeholder={placeholder} />
                          {form[key].length > 1 && <button type="button" onClick={() => removeListItem(key, idx)} style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: 7, width: 34, cursor: 'pointer', fontWeight: 700, flexShrink: 0 }}>×</button>}
                        </div>
                      ))}
                      <button type="button" onClick={() => addListItem(key)} style={{ fontSize: '0.77rem', color: '#1d4ed8', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 7, padding: '4px 12px', cursor: 'pointer', fontWeight: 600 }}>+ Add {label}</button>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', paddingTop: 4 }}>
                <button type="button" onClick={() => setShowForm(false)} style={{ background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px 22px', fontWeight: 600, cursor: 'pointer', fontSize: '0.86rem' }}>Cancel</button>
                <button type="submit" disabled={saving} style={{ background: 'linear-gradient(135deg,#0d2240,#1e4d7b)', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 26px', fontWeight: 700, cursor: 'pointer', opacity: saving ? 0.7 : 1, fontSize: '0.86rem', boxShadow: '0 4px 12px rgba(13,34,64,0.25)' }}>
                  {saving ? 'Saving...' : editId ? '✓ Update Job' : '+ Create Job'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const btn = (bg, color, border) => ({ background: bg, color, border: `1px solid ${border}`, borderRadius: 7, padding: '6px 11px', fontSize: '0.76rem', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap' });
const selStyle = { padding: '8px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: '0.83rem', outline: 'none', fontFamily: 'inherit', background: '#fff', cursor: 'pointer', color: '#334155' };
const overlay = { position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, backdropFilter: 'blur(4px)' };
const inp = { width: '100%', padding: '9px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: '0.85rem', color: '#334155', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', background: '#fff' };
const lbl = { display: 'block', fontSize: '0.76rem', fontWeight: 600, color: '#475569', marginBottom: 5, letterSpacing: '0.2px' };
const secHead = { fontWeight: 700, color: '#0f172a', fontSize: '0.85rem', marginBottom: 14, paddingBottom: 10, borderBottom: '1.5px solid #f1f5f9', letterSpacing: '0.1px' };
