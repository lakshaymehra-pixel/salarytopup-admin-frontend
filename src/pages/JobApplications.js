import React, { useEffect, useState } from 'react';
import API from '../api';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  new: { bg: '#eff6ff', color: '#2563eb' },
  reviewed: { bg: '#fef3c7', color: '#d97706' },
  shortlisted: { bg: '#dcfce7', color: '#16a34a' },
  rejected: { bg: '#fee2e2', color: '#dc2626' },
};

export default function JobApplications() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState(null);

  const fetchApps = () => {
    setLoading(true);
    API.get('/job-applications').then(r => setApps(r.data.applications || [])).catch(() => toast.error('Failed to load')).finally(() => setLoading(false));
  };

  useEffect(() => { fetchApps(); }, []);

  const updateStatus = async (id, status) => {
    try { await API.put(`/job-applications/${id}`, { status }); fetchApps(); toast.success('Status updated'); }
    catch { toast.error('Failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this application?')) return;
    try { await API.delete(`/job-applications/${id}`); toast.success('Deleted'); fetchApps(); }
    catch { toast.error('Failed'); }
  };

  return (
    <div style={{ paddingBottom: 40 }}>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontWeight: 800, color: '#0d2240', fontSize: '1.5rem', margin: 0 }}>Job Applications</h2>
        <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '4px 0 0' }}>All applications submitted via Career page</p>
      </div>

      {loading ? <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8' }}>Loading...</div> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {apps.length === 0 && <div style={{ textAlign: 'center', padding: 60, background: '#f8fafc', borderRadius: 12, color: '#94a3b8' }}>No applications yet.</div>}
          {apps.map(app => (
            <div key={app._id} style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 14, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  <h4 style={{ fontWeight: 700, color: '#0d2240', fontSize: '0.95rem', margin: 0 }}>{app.name}</h4>
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '2px 10px', borderRadius: 20, background: STATUS_COLORS[app.status]?.bg, color: STATUS_COLORS[app.status]?.color }}>{app.status}</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: 4 }}>{app.job_title} · {app.email} · {app.phone}</div>
                {app.experience && <span style={{ fontSize: '0.72rem', background: '#f3f4f6', color: '#6b7280', padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>Exp: {app.experience}</span>}
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', flexShrink: 0 }}>
                <button onClick={() => setView(app)} style={{ background: '#f1f5f9', color: '#334155', border: 'none', borderRadius: 8, padding: '7px 14px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>View</button>
                {app.cv_url && <a href={`http://localhost:4500/api/job-applications/download-cv/${app._id}?token=${localStorage.getItem('token')}`} target="_blank" rel="noopener noreferrer" style={{ background: '#eff6ff', color: '#2563eb', border: 'none', borderRadius: 8, padding: '7px 14px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', textDecoration: 'none' }}>Download CV</a>}
                <select value={app.status} onChange={e => updateStatus(app._id, e.target.value)} style={{ fontSize: '0.78rem', border: '1.5px solid #e2e8f0', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', fontFamily: 'inherit' }}>
                  <option value="new">New</option>
                  <option value="reviewed">Reviewed</option>
                  <option value="shortlisted">Shortlisted</option>
                  <option value="rejected">Rejected</option>
                </select>
                <button onClick={() => handleDelete(app._id)} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 8, padding: '7px 12px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Modal */}
      {view && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => setView(null)}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, maxWidth: 560, width: '100%', maxHeight: '85vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3 style={{ fontWeight: 800, color: '#0d2240', margin: 0 }}>{view.name}</h3>
              <button onClick={() => setView(null)} style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, width: 32, height: 32, fontSize: '1.1rem', cursor: 'pointer' }}>×</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.88rem', color: '#475569' }}>
              <div><strong>Applied For:</strong> {view.job_title}</div>
              <div><strong>Email:</strong> {view.email}</div>
              <div><strong>Phone:</strong> {view.phone}</div>
              {view.experience && <div><strong>Experience:</strong> {view.experience}</div>}
              {view.current_company && <div><strong>Current Company:</strong> {view.current_company}</div>}
              {view.cover_letter && <div><strong>Cover Letter:</strong><p style={{ marginTop: 6, lineHeight: 1.7, color: '#64748b' }}>{view.cover_letter}</p></div>}
              {view.cv_url && <a href={`http://localhost:4500/api/job-applications/download-cv/${view._id}?token=${localStorage.getItem('token')}`} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', background: '#eff6ff', color: '#2563eb', padding: '10px 18px', borderRadius: 10, fontWeight: 700, textDecoration: 'none', width: 'fit-content' }}>Download CV / Resume</a>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}