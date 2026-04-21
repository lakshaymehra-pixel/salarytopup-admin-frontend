import React, { useEffect, useState } from 'react';
import API from '../api';
import toast from 'react-hot-toast';
import './Table.css';
import './Leads.css';

export default function NewsletterLeads() {
  const [subscribers, setSubscribers] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, unsubscribed: 0 });
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');

  const load = () => {
    API.get(`/newsletter?page=${page}&limit=20&status=${status}`)
      .then(r => {
        setSubscribers(r.data.subscribers);
        setStats({ total: r.data.total, active: r.data.active, unsubscribed: r.data.unsubscribed });
      }).catch(() => {});
  };

  useEffect(() => { load(); }, [page, status]);

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this subscriber?')) return;
    await API.delete(`/newsletter/${id}`);
    toast.success('Removed');
    load();
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="leads-wrap">
      <div className="adm-page-header">
        <div>
          <h2 className="adm-page-title">Newsletter Subscribers</h2>
          <p className="adm-page-sub">Email subscribers from website</p>
        </div>
      </div>

      {/* Stats */}
      <div className="leads-stats">
        <div className="leads-stat" style={{ '--c': '#7c3aed', '--bg': '#f5f3ff' }}>
          <div className="leads-stat-icon" style={{ background: '#f5f3ff' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="1.8" width="20" height="20"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
          </div>
          <div>
            <div className="leads-stat-val">{stats.total}</div>
            <div className="leads-stat-lbl">Total Subscribers</div>
          </div>
        </div>
        <div className="leads-stat" style={{ '--c': '#16a34a', '--bg': '#f0fdf4' }}>
          <div className="leads-stat-icon" style={{ background: '#f0fdf4' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="1.8" width="20" height="20"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <div>
            <div className="leads-stat-val">{stats.active}</div>
            <div className="leads-stat-lbl">Active</div>
          </div>
        </div>
        <div className="leads-stat" style={{ '--c': '#94a3b8', '--bg': '#f8fafc' }}>
          <div className="leads-stat-icon" style={{ background: '#f8fafc' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.8" width="20" height="20"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </div>
          <div>
            <div className="leads-stat-val">{stats.unsubscribed}</div>
            <div className="leads-stat-lbl">Unsubscribed</div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="adm-filters">
        <select className="adm-select" value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>
          <option value="">All</option>
          <option value="active">Active</option>
          <option value="unsubscribed">Unsubscribed</option>
        </select>
      </div>

      {/* Table */}
      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Email</th>
              <th>Subscribed On</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {subscribers.map((s, i) => (
              <tr key={s._id}>
                <td style={{ color: '#94a3b8', fontSize: '0.78rem' }}>{(page - 1) * 20 + i + 1}</td>
                <td><strong style={{ color: '#0d2240' }}>{s.email}</strong></td>
                <td style={{ fontSize: '0.82rem', color: '#64748b' }}>{formatDate(s.subscribedAt)}</td>
                <td><span className={`badge ${s.status === 'active' ? 'badge-published' : 'badge-draft'}`}>{s.status}</span></td>
                <td>
                  <button className="adm-icon-btn delete" onClick={() => handleDelete(s._id)} title="Remove">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="15" height="15"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                  </button>
                </td>
              </tr>
            ))}
            {subscribers.length === 0 && <tr><td colSpan="5" className="adm-empty">No subscribers yet</td></tr>}
          </tbody>
        </table>
        <div className="adm-pagination">
          <span>{stats.total} total subscribers</span>
          <div>
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
            <span>Page {page}</span>
            <button disabled={subscribers.length < 20} onClick={() => setPage(p => p + 1)}>Next →</button>
          </div>
        </div>
      </div>
    </div>
  );
}