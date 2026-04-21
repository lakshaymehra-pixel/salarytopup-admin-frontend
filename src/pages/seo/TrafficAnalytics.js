import React, { useEffect, useState } from 'react';
import API from '../../api';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar } from 'recharts';
import './TrafficAnalytics.css';

export default function TrafficAnalytics() {
  const [traffic, setTraffic] = useState(null);
  const [topPages, setTopPages] = useState(null);
  const [countries, setCountries] = useState(null);
  const [days, setDays] = useState(28);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      API.get(`/seo/ga/traffic?days=${days}`),
      API.get(`/seo/ga/top-pages?days=${days}`),
      API.get(`/seo/ga/countries?days=${days}`),
    ]).then(([t, p, c]) => {
      setTraffic(t.data);
      setTopPages(p.data);
      setCountries(c.data);
    }).catch(() => setTraffic({ configured: false })).finally(() => setLoading(false));
  }, [days]);

  if (loading) return <div className="seo-loading">Loading Traffic Analytics...</div>;

  if (!traffic || traffic.configured === false) {
    return (
      <div className="ta-wrap">
        <div className="adm-page-header">
          <div><h2 className="adm-page-title">Traffic Analytics</h2></div>
        </div>
        <div className="ta-setup">
          <div style={{ fontSize: '2.5rem', marginBottom: 16 }}></div>
          <h3>Connect Google Analytics 4</h3>
          <p>See sessions, users, pageviews, bounce rate, top pages and countries from your GA4 property.</p>
          <div className="pp-steps">
            {[
              'Go to Google Cloud Console → Enable Google Analytics Data API',
              'Go to IAM & Admin → Service Accounts → Create Service Account',
              'Grant role: Viewer. Create & download JSON key file.',
              'In GA4: Admin → Property Access Management → Add the service account email with Viewer role',
              'Copy the GA4 Property ID (looks like: 123456789)',
              'Paste the service account email, private_key from JSON, and Property ID in SEO Settings',
            ].map((s, i) => (
              <div key={i} className="pp-step"><span className="pp-step-num">{i + 1}</span><span>{s}</span></div>
            ))}
          </div>
          <a href="/seo/settings" className="adm-btn-primary" style={{ display: 'inline-block', marginTop: 16 }}>Open SEO Settings →</a>
        </div>
      </div>
    );
  }

  const rows = traffic.rows || [];

  return (
    <div className="ta-wrap">
      <div className="adm-page-header">
        <div>
          <h2 className="adm-page-title">Traffic Analytics</h2>
          <p className="adm-page-sub">Real data from Google Analytics 4</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {[7, 28, 90].map(d => (
            <button key={d} className={`seo-range-btn ${days === d ? 'active' : ''}`} onClick={() => setDays(d)}>{d}D</button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="seo-stats-row">
        {[
          { label: 'Sessions', val: (traffic.totals?.sessions || 0).toLocaleString() },
          { label: 'Users', val: (traffic.totals?.users || 0).toLocaleString() },
          { label: 'Pageviews', val: (traffic.totals?.pageviews || 0).toLocaleString() },
          { label: 'Avg Session', val: rows.length > 0 ? `${Math.round(rows.reduce((a, r) => a + Number(r.bounceRate || 0), 0) / rows.length * 100)}% bounce` : '—' },
        ].map(s => (
          <div key={s.label} className="seo-stat-card">
            <div><div className="seo-stat-val">{s.val}</div><div className="seo-stat-lbl">{s.label}</div></div>
          </div>
        ))}
      </div>

      {/* Sessions Over Time Chart */}
      <div className="seo-card" style={{ marginBottom: 16 }}>
        <div className="seo-card-title">Sessions Over Time</div>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={rows.map(r => ({ date: r.date?.slice(4), sessions: r.sessions, users: r.users }))}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Line type="monotone" dataKey="sessions" stroke="#3b82f6" strokeWidth={2} dot={false} name="Sessions" />
            <Line type="monotone" dataKey="users" stroke="#10b981" strokeWidth={2} dot={false} name="Users" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="seo-two-col">
        {/* Top Pages */}
        <div className="seo-card">
          <div className="seo-card-title">Top Pages by Sessions</div>
          {!topPages?.configured ? (
            <div className="seo-empty">No data available</div>
          ) : (
            <table className="seo-mini-table">
              <thead><tr><th>Page</th><th>Sessions</th><th>Views</th></tr></thead>
              <tbody>
                {(topPages.rows || []).map((r, i) => (
                  <tr key={i}>
                    <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.8rem', color: '#3b82f6' }}>{r.path}</td>
                    <td>{r.sessions.toLocaleString()}</td>
                    <td>{r.pageviews.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Top Countries */}
        <div className="seo-card">
          <div className="seo-card-title">Top Countries</div>
          {!countries?.configured ? (
            <div className="seo-empty">No data available</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={(countries.rows || []).slice(0, 7)} layout="vertical">
                  <XAxis type="number" tick={{ fontSize: 10 }} />
                  <YAxis dataKey="country" type="category" tick={{ fontSize: 11 }} width={80} />
                  <Tooltip />
                  <Bar dataKey="sessions" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </>
          )}
        </div>
      </div>
    </div>
  );
}