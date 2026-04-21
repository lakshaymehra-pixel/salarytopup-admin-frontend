import React, { useEffect, useState } from 'react';
import API from '../api';
import toast from 'react-hot-toast';
import './Table.css';
import './Leads.css';

export default function FormLeads() {
  const [contacts, setContacts] = useState([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState({ new: 0, read: 0, resolved: 0 });
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [expanded, setExpanded] = useState(null);

  const load = () => {
    API.get(`/contacts?page=${page}&limit=10&status=${status}`)
      .then(r => { setContacts(r.data.contacts); setTotal(r.data.total); }).catch(() => {});
    API.get('/contacts?limit=1000').then(r => {
      const all = r.data.contacts || [];
      setStats({
        new: all.filter(c => c.status === 'new').length,
        read: all.filter(c => c.status === 'read').length,
        resolved: all.filter(c => c.status === 'resolved').length,
      });
    }).catch(() => {});
  };

  useEffect(() => { load(); }, [page, status]);

  const updateStatus = async (id, s) => {
    await API.put(`/contacts/${id}`, { status: s });
    toast.success('Status updated');
    load();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this lead?')) return;
    await API.delete(`/contacts/${id}`);
    toast.success('Deleted');
    load();
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  const statusColors = {
    new: { bg: '#fef3c7', color: '#d97706', dot: '#f59e0b' },
    read: { bg: '#dbeafe', color: '#2563eb', dot: '#3b82f6' },
    resolved: { bg: '#dcfce7', color: '#16a34a', dot: '#22c55e' },
  };

  return (
    <div className="leads-wrap">
      <div className="adm-page-header">
        <div>
          <h2 className="adm-page-title">Form Leads</h2>
          <p className="adm-page-sub">Contact form submissions from website</p>
        </div>
      </div>

      {/* Stats */}
      <div className="leads-stats">
        <div className="leads-stat" style={{ '--c': '#f59e0b', '--bg': '#fffbeb' }} onClick={() => { setStatus(''); setPage(1); }}>
          <div className="leads-stat-icon" style={{ background: '#fffbeb' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.8" width="20" height="20"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
          <div><div className="leads-stat-val">{total}</div><div className="leads-stat-lbl">Total Leads</div></div>
        </div>
        <div className="leads-stat" style={{ '--c': '#ef4444', '--bg': '#fef2f2' }} onClick={() => { setStatus('new'); setPage(1); }}>
          <div className="leads-stat-icon" style={{ background: '#fef2f2' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.8" width="20" height="20"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <div><div className="leads-stat-val">{stats.new}</div><div className="leads-stat-lbl">New</div></div>
        </div>
        <div className="leads-stat" style={{ '--c': '#2563eb', '--bg': '#eff6ff' }} onClick={() => { setStatus('read'); setPage(1); }}>
          <div className="leads-stat-icon" style={{ background: '#eff6ff' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.8" width="20" height="20"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          </div>
          <div><div className="leads-stat-val">{stats.read}</div><div className="leads-stat-lbl">Read</div></div>
        </div>
        <div className="leads-stat" style={{ '--c': '#16a34a', '--bg': '#f0fdf4' }} onClick={() => { setStatus('resolved'); setPage(1); }}>
          <div className="leads-stat-icon" style={{ background: '#f0fdf4' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="1.8" width="20" height="20"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <div><div className="leads-stat-val">{stats.resolved}</div><div className="leads-stat-lbl">Resolved</div></div>
        </div>
      </div>

      {/* Filter */}
      <div className="adm-filters">
        <select className="adm-select" value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>
          <option value="">All Status</option>
          <option value="new">New</option>
          <option value="read">Read</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      {/* Cards */}
      <div className="fl-cards">
        {contacts.map((c, i) => {
          const sc = statusColors[c.status] || statusColors.new;
          const isOpen = expanded === c._id;
          return (
            <div key={c._id} className="fl-card">
              <div className="fl-card-top" onClick={() => setExpanded(isOpen ? null : c._id)}>
                <div className="fl-card-left">
                  <div className="fl-avatar">{c.name.charAt(0).toUpperCase()}</div>
                  <div className="fl-card-info">
                    <div className="fl-card-name">{c.name}</div>
                    <div className="fl-card-email">{c.email} · {c.mobile}</div>
                  </div>
                </div>
                <div className="fl-card-right">
                  <span className="leads-tag">{c.inquiryType || '—'}</span>
                  <span className="fl-status-dot" style={{ background: sc.bg, color: sc.color }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: sc.dot, display: 'inline-block', marginRight: 5 }}></span>
                    {c.status}
                  </span>
                  <span className="fl-date">{formatDate(c.createdAt)}</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" width="16" height="16" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: '0.2s', flexShrink: 0 }}><polyline points="6 9 12 15 18 9"/></svg>
                </div>
              </div>
              {isOpen && (
                <div className="fl-card-body">
                  <div className="fl-msg-box">
                    <div className="fl-msg-label">Message</div>
                    <div className="fl-msg-text">{c.message}</div>
                  </div>
                  <div className="fl-card-actions">
                    <select className="adm-select" value={c.status} onChange={e => updateStatus(c._id, e.target.value)} style={{ fontSize: '0.82rem', padding: '6px 12px' }}>
                      <option value="new">New</option>
                      <option value="read">Read</option>
                      <option value="resolved">Resolved</option>
                    </select>
                    <button className="adm-icon-btn delete" onClick={() => handleDelete(c._id)} title="Delete">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="15" height="15"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {contacts.length === 0 && <div style={{ textAlign: 'center', padding: '48px', color: '#94a3b8', fontSize: '0.88rem' }}>No leads found</div>}
      </div>

      {/* Pagination */}
      <div className="adm-pagination" style={{ background: '#fff', borderRadius: 12, padding: '14px 20px', border: '1px solid #f1f5f9' }}>
        <span>{total} total leads</span>
        <div>
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
          <span>Page {page}</span>
          <button disabled={contacts.length < 10} onClick={() => setPage(p => p + 1)}>Next →</button>
        </div>
      </div>
    </div>
  );
}