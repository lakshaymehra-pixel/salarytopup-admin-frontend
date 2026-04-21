import React, { useEffect, useState } from 'react';
import API from '../api';
import './Dashboard.css';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const StatIcons = {
  blogs: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  contacts: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  applications: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>,
  approved: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="20,6 9,17 4,12"/></svg>,
};

const StatCard = ({ label, value, sub, color, icon }) => (
  <div className="stat-card" style={{'--card-color': color}}>
    <div className="stat-icon" style={{ background: color + '18', color }}>{icon}</div>
    <div className="stat-body">
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 8, padding: '8px 14px', fontSize: '0.82rem', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
        <div style={{ fontWeight: 700, color: '#0d2240', marginBottom: 2 }}>{label}</div>
        <div style={{ color: '#26b9db' }}>{payload[0].value} post{payload[0].value !== 1 ? 's' : ''}</div>
      </div>
    );
  }
  return null;
};

const RANGES = [
  { label: '3M', months: 3 },
  { label: '6M', months: 6 },
  { label: '1Y', months: 12 },
  { label: 'All', months: 0 },
];

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(false);
  const [range, setRange] = useState(0);
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [isCustom, setIsCustom] = useState(false);

  useEffect(() => {
    API.get('/dashboard/stats')
      .then(r => setStats(r.data))
      .catch(() => setError(true));
  }, []);

  const applyCustom = () => {
    if (customFrom && customTo) setIsCustom(true);
  };

  const clearCustom = () => {
    setIsCustom(false);
    setCustomFrom('');
    setCustomTo('');
  };

  const filteredChartData = stats?.blogChartData ? (() => {
    if (isCustom && customFrom && customTo) {
      const from = new Date(customFrom);
      const to = new Date(customTo);
      to.setMonth(to.getMonth() + 1); // include the "to" month
      // blogChartData has month labels like "Jul 25", "Aug 25" etc
      // We need to filter based on actual dates
      const result = [];
      const allData = stats.blogChartData;
      allData.forEach(item => {
        const parts = item.month.split(' ');
        const mIdx = MONTHS.indexOf(parts[0]);
        const yr = parts[1] ? (parseInt(parts[1]) + 2000) : new Date().getFullYear();
        const d = new Date(yr, mIdx, 1);
        if (d >= from && d < to) result.push(item);
      });
      return result;
    }
    return range === 0 ? stats.blogChartData : stats.blogChartData.slice(-range);
  })() : [];

  const handleRangeClick = (months) => {
    setRange(months);
    clearCustom();
  };

  if (error) return (
    <div className="adm-loading">
      <span style={{color:'#e53e3e'}}>Failed to load dashboard. Check if backend is running on port 4500.</span>
    </div>
  );

  if (!stats) return (
    <div className="adm-loading">
      <svg viewBox="0 0 24 24" fill="none" stroke="#26b9db" strokeWidth="2" width="32" height="32"><circle cx="12" cy="12" r="10" strokeOpacity="0.3"/><path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"><animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite"/></path></svg>
      <span>Loading...</span>
    </div>
  );

  return (
    <div>
      <div className="adm-page-header">
        <div>
          <h2 className="adm-page-title">Dashboard</h2>
          <p className="adm-page-sub">Welcome back, Admin</p>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard label="Total Blogs" value={stats.blogs.total} sub={`${stats.blogs.published} Published · ${stats.blogs.draft} Draft`} color="#1a3d65" icon={StatIcons.blogs} />
        <StatCard label="Contact Submissions" value={stats.contacts.total} sub={`${stats.contacts.new} New unread`} color="#26b9db" icon={StatIcons.contacts} />
        <StatCard label="Loan Applications" value={stats.applications.total} sub={`${stats.applications.pending} Pending review`} color="#f59e0b" icon={StatIcons.applications} />
        <StatCard label="Approved Loans" value={stats.applications.approved} sub="Total approved" color="#22c55e" icon={StatIcons.approved} />
      </div>

      {/* Blog Posts Chart */}
      {stats.blogChartData && (
        <div className="adm-chart-card">
          <div className="adm-chart-header">
            <div>
              <h3 className="adm-chart-title">Blog Posts Overview</h3>
              <p className="adm-chart-sub">Monthly published posts · {filteredChartData.reduce((s, d) => s + d.posts, 0)} posts shown</p>
            </div>
            <div className="adm-chart-controls">
              {/* Quick range buttons */}
              <div className="adm-chart-range-btns">
                {RANGES.map(r => (
                  <button
                    key={r.label}
                    className={`adm-range-btn ${!isCustom && range === r.months ? 'active' : ''}`}
                    onClick={() => handleRangeClick(r.months)}
                  >{r.label}</button>
                ))}
              </div>

              {/* Custom date range */}
              <div className="adm-custom-range">
                <input
                  type="month"
                  className="adm-month-input"
                  value={customFrom}
                  onChange={e => { setCustomFrom(e.target.value); setIsCustom(false); }}
                  title="From"
                />
                <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>to</span>
                <input
                  type="month"
                  className="adm-month-input"
                  value={customTo}
                  onChange={e => { setCustomTo(e.target.value); setIsCustom(false); }}
                  title="To"
                />
                <button
                  className={`adm-apply-btn ${isCustom ? 'applied' : ''}`}
                  onClick={applyCustom}
                  disabled={!customFrom || !customTo}
                >
                  {isCustom ? '✓ Applied' : 'Apply'}
                </button>
                {isCustom && (
                  <button className="adm-clear-btn" onClick={clearCustom}>✕</button>
                )}
              </div>

              <div className="adm-chart-badge">{stats.blogs.total} Total</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={filteredChartData} barSize={36} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f1f5f9', radius: 6 }} />
              <Bar dataKey="posts" fill="#26b9db" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="adm-tables-row">
        <div className="adm-table-card">
          <div className="adm-table-card-header"><h3>Recent Applications</h3></div>
          <table className="adm-table">
            <thead><tr><th>Name</th><th>Mobile</th><th>Amount</th><th>Status</th></tr></thead>
            <tbody>
              {stats.recentApplications.length === 0 && <tr><td colSpan="4" className="adm-empty">No applications yet</td></tr>}
              {stats.recentApplications.map(a => (
                <tr key={a._id}>
                  <td><strong>{a.name}</strong></td>
                  <td>{a.mobile}</td>
                  <td>{a.loanAmount ? `₹${a.loanAmount.toLocaleString()}` : '—'}</td>
                  <td><span className={`badge badge-${a.status}`}>{a.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="adm-table-card">
          <div className="adm-table-card-header"><h3>Recent Contacts</h3></div>
          <table className="adm-table">
            <thead><tr><th>Name</th><th>Email</th><th>Type</th><th>Status</th></tr></thead>
            <tbody>
              {stats.recentContacts.length === 0 && <tr><td colSpan="4" className="adm-empty">No contacts yet</td></tr>}
              {stats.recentContacts.map(c => (
                <tr key={c._id}>
                  <td><strong>{c.name}</strong></td>
                  <td>{c.email}</td>
                  <td>{c.inquiryType || '—'}</td>
                  <td><span className={`badge badge-${c.status}`}>{c.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}