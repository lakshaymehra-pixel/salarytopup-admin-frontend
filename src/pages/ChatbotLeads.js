import React, { useEffect, useState } from 'react';
import API from '../api';

const STATUS_COLORS = {
  new: { bg: '#eff6ff', color: '#2563eb', label: 'New' },
  contacted: { bg: '#fef3c7', color: '#d97706', label: 'Contacted' },
  approved: { bg: '#f0fdf4', color: '#16a34a', label: 'Approved' },
  rejected: { bg: '#fef2f2', color: '#dc2626', label: 'Rejected' },
};

export default function ChatbotLeads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selected, setSelected] = useState(null);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [total, setTotal] = useState(0);

  useEffect(() => { fetchLeads(); }, [search, filterStatus]);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const params = { limit: 50 };
      if (filterStatus !== 'all') params.status = filterStatus;
      if (search) params.search = search;
      const res = await API.get('/chatbot-leads', { params });
      if (res.data.Status === 1) {
        setLeads(res.data.data);
        setTotal(res.data.total);
      }
    } catch (e) {}
    setLoading(false);
  };

  const updateStatus = async (id, status) => {
    try {
      await API.patch(`/chatbot-leads/${id}`, { status });
      setLeads(prev => prev.map(l => l._id === id ? { ...l, status } : l));
      if (selected?._id === id) setSelected(prev => ({ ...prev, status }));
    } catch (e) {}
  };

  const saveNotes = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await API.patch(`/chatbot-leads/${selected._id}`, { notes });
      setLeads(prev => prev.map(l => l._id === selected._id ? { ...l, notes } : l));
      setSelected(prev => ({ ...prev, notes }));
    } catch (e) {}
    setSaving(false);
  };

  const deleteLead = async (id) => {
    if (!window.confirm('Delete this lead?')) return;
    try {
      await API.delete(`/chatbot-leads/${id}`);
      setLeads(prev => prev.filter(l => l._id !== id));
      if (selected?._id === id) setSelected(null);
    } catch (e) {}
  };

  const openDetail = (lead) => {
    setSelected(lead);
    setNotes(lead.notes || '');
  };

  const fmt = (n) => n ? `₹${Number(n).toLocaleString('en-IN')}` : '—';
  const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const stats = {
    total,
    new: leads.filter(l => l.status === 'new').length,
    contacted: leads.filter(l => l.status === 'contacted').length,
    approved: leads.filter(l => l.status === 'approved').length,
  };

  return (
    <div style={{ padding: '28px 24px', maxWidth: 1100, margin: '0 auto' }}>
      {/* Title */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0d2240', marginBottom: 4 }}>Chatbot Loan Leads</h1>
        <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Customers who applied via the AI loan chatbot</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Leads', value: total, color: '#2563eb', bg: '#eff6ff' },
          { label: 'New', value: stats.new, color: '#7c3aed', bg: '#ede9fe' },
          { label: 'Contacted', value: stats.contacted, color: '#d97706', bg: '#fef3c7' },
          { label: 'Approved', value: stats.approved, color: '#16a34a', bg: '#f0fdf4' },
        ].map((s, i) => (
          <div key={i} style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 14, padding: '18px 20px' }}>
            <div style={{ fontSize: '1.7rem', fontWeight: 900, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600, marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <input
          placeholder="Search name, phone, email, ref..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 200, padding: '9px 14px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: '0.85rem', outline: 'none' }}
        />
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          style={{ padding: '9px 14px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: '0.85rem', outline: 'none', background: '#fff' }}>
          <option value="all">All Status</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 380px' : '1fr', gap: 20 }}>
        {/* Table */}
        <div style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 16, overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>Loading...</div>
          ) : leads.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>No leads found</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0' }}>
                  {['Ref', 'Name', 'Mobile', 'Loan Amount', 'Purpose', 'Status', 'Date', ''].map(h => (
                    <th key={h} style={{ padding: '11px 14px', fontSize: '0.73rem', fontWeight: 700, color: '#64748b', textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {leads.map(lead => {
                  const sc = STATUS_COLORS[lead.status] || STATUS_COLORS.new;
                  const isActive = selected?._id === lead._id;
                  return (
                    <tr key={lead._id}
                      onClick={() => openDetail(lead)}
                      style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer', background: isActive ? '#f0f9ff' : 'transparent', transition: 'background 0.15s' }}
                      onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#f8fafc'; }}
                      onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                    >
                      <td style={{ padding: '12px 14px', fontSize: '0.75rem', color: '#64748b', fontFamily: 'monospace' }}>{lead.ref_no || '—'}</td>
                      <td style={{ padding: '12px 14px', fontSize: '0.85rem', fontWeight: 600, color: '#0d2240' }}>{lead.full_name}</td>
                      <td style={{ padding: '12px 14px', fontSize: '0.83rem', color: '#475569' }}>{lead.mobile}</td>
                      <td style={{ padding: '12px 14px', fontSize: '0.83rem', fontWeight: 700, color: '#0d2240' }}>{fmt(lead.loan_amount)}</td>
                      <td style={{ padding: '12px 14px', fontSize: '0.78rem', color: '#64748b' }}>{lead.loan_purpose || '—'}</td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ background: sc.bg, color: sc.color, fontSize: '0.7rem', fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>{sc.label}</span>
                      </td>
                      <td style={{ padding: '12px 14px', fontSize: '0.75rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>{fmtDate(lead.createdAt)}</td>
                      <td style={{ padding: '12px 14px' }}>
                        <button onClick={e => { e.stopPropagation(); deleteLead(lead._id); }}
                          style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem', padding: '4px 8px', borderRadius: 6, transition: 'background 0.15s' }}
                          onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
                          onMouseLeave={e => e.currentTarget.style.background = 'none'}
                        >Delete</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Detail Panel */}
        {selected && (
          <div style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 16, padding: '22px', height: 'fit-content', position: 'sticky', top: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontWeight: 800, color: '#0d2240', fontSize: '1rem' }}>{selected.full_name}</h3>
              <button onClick={() => setSelected(null)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', fontSize: '1rem', color: '#64748b' }}>×</button>
            </div>

            {/* Info rows */}
            {[
              ['Ref No', selected.ref_no],
              ['Mobile', selected.mobile],
              ['Email', selected.email],
              ['Employment', selected.employment_type],
              ['Company', selected.company_name],
              ['Monthly Salary', fmt(selected.monthly_salary)],
              ['Loan Amount', fmt(selected.loan_amount)],
              ['Tenure', selected.tenure ? `${selected.tenure} months` : '—'],
              ['Purpose', selected.loan_purpose],
              ['PAN', selected.pan_number],
              ['City', selected.city],
            ].map(([label, val]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #f1f5f9', fontSize: '0.83rem' }}>
                <span style={{ color: '#94a3b8', fontWeight: 600 }}>{label}</span>
                <span style={{ color: '#1e293b', fontWeight: 600, textAlign: 'right', maxWidth: '60%' }}>{val || '—'}</span>
              </div>
            ))}

            {/* Status update */}
            <div style={{ marginTop: 18 }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 6 }}>UPDATE STATUS</label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {Object.entries(STATUS_COLORS).map(([key, val]) => (
                  <button key={key} onClick={() => updateStatus(selected._id, key)}
                    style={{ background: selected.status === key ? val.bg : '#f8fafc', color: selected.status === key ? val.color : '#64748b', border: `1.5px solid ${selected.status === key ? val.color : '#e2e8f0'}`, borderRadius: 8, padding: '5px 12px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>
                    {val.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div style={{ marginTop: 16 }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 6 }}>NOTES</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)}
                placeholder="Add notes about this lead..."
                style={{ width: '100%', border: '1.5px solid #e2e8f0', borderRadius: 10, padding: '9px 12px', fontSize: '0.83rem', resize: 'vertical', minHeight: 80, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
              <button onClick={saveNotes} disabled={saving}
                style={{ marginTop: 8, width: '100%', background: 'linear-gradient(135deg, #0d2240, #2C6275)', color: '#fff', border: 'none', borderRadius: 10, padding: '10px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', opacity: saving ? 0.65 : 1 }}>
                {saving ? 'Saving...' : 'Save Notes'}
              </button>
            </div>

            <div style={{ marginTop: 12, fontSize: '0.72rem', color: '#94a3b8', textAlign: 'right' }}>
              Applied: {fmtDate(selected.createdAt)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
