import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import './SeoDashboard.css';

const SEVERITY_COLOR = { critical: '#ef4444', warning: '#f59e0b', info: '#3b82f6' };
const SEVERITY_BG = { critical: '#fef2f2', warning: '#fffbeb', info: '#eff6ff' };

export default function SeoDashboard() {
  const [data, setData] = useState(null);
  const [gsc, setGsc] = useState(null);
  const [range, setRange] = useState(28);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    Promise.all([
      API.get('/seo/dashboard'),
      API.get(`/seo/gsc/summary?days=${range}`),
    ]).then(([d, g]) => {
      setData(d.data);
      setGsc(g.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [range]);

  if (loading) return <div className="seo-loading">Loading SEO Dashboard...</div>;

  const stats = data?.stats || {};

  return (
    <div className="seo-wrap">
      <div className="adm-page-header">
        <div>
          <h2 className="adm-page-title">SEO Dashboard</h2>
          <p className="adm-page-sub">Overview of your site's search performance</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {[7, 28, 90].map(d => (
            <button key={d} className={`seo-range-btn ${range === d ? 'active' : ''}`} onClick={() => setRange(d)}>
              {d === 7 ? '7D' : d === 28 ? '28D' : '90D'}
            </button>
          ))}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="seo-stats-row">
        <div className="seo-stat-card">
          <div className="seo-stat-icon" style={{ background: '#eff6ff' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" width="20" height="20"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          </div>
          <div>
            <div className="seo-stat-val">{stats.totalKeywords ?? '—'}</div>
            <div className="seo-stat-lbl">Keywords Tracked</div>
          </div>
        </div>
        <div className="seo-stat-card">
          <div className="seo-stat-icon" style={{ background: '#f0fdf4' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" width="20" height="20"><circle cx="12" cy="12" r="10"/><polyline points="8 12 11 15 16 9"/></svg>
          </div>
          <div>
            <div className="seo-stat-val">{stats.top10Keywords ?? '—'}</div>
            <div className="seo-stat-lbl">Top 10 Rankings</div>
          </div>
        </div>
        <div className="seo-stat-card">
          <div className="seo-stat-icon" style={{ background: '#fffbeb' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" width="20" height="20"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          </div>
          <div>
            <div className="seo-stat-val">{stats.missingMetaCount ?? '—'}</div>
            <div className="seo-stat-lbl">Missing Meta Tags</div>
          </div>
        </div>
        <div className="seo-stat-card">
          <div className="seo-stat-icon" style={{ background: '#fef2f2' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" width="20" height="20"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <div>
            <div className="seo-stat-val">{stats.unresolvedAlerts ?? '—'}</div>
            <div className="seo-stat-lbl">Open Alerts</div>
          </div>
        </div>
        <div className="seo-stat-card">
          <div className="seo-stat-icon" style={{ background: '#f5f3ff' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" width="20" height="20"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6M9 12h6M9 15h4"/></svg>
          </div>
          <div>
            <div className="seo-stat-val">{stats.auditScore != null ? `${stats.auditScore}/100` : '—'}</div>
            <div className="seo-stat-lbl">Site Health Score</div>
          </div>
        </div>
      </div>

      {/* GSC Summary if connected */}
      {gsc?.configured && (
        <div className="seo-gsc-row">
          {[
            { label: 'Total Clicks', val: gsc.totals?.clicks?.toLocaleString() },
            { label: 'Total Impressions', val: gsc.totals?.impressions?.toLocaleString() },
            { label: 'Avg CTR', val: `${gsc.totals?.ctr}%` },
            { label: 'Avg Position', val: gsc.totals?.position },
          ].map(s => (
            <div key={s.label} className="seo-gsc-card">
              <div className="seo-gsc-val">{s.val}</div>
              <div className="seo-gsc-lbl">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      <div className="seo-two-col">
        {/* GSC Chart or Setup CTA */}
        <div className="seo-card">
          <div className="seo-card-title">Search Console Performance</div>
          {gsc?.configured ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={(gsc.daily || []).map(r => ({ date: r.keys?.[0] || r.date, clicks: r.clicks, impressions: r.impressions }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={d => d?.slice(5)} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="clicks" stroke="#3b82f6" strokeWidth={2} dot={false} name="Clicks" />
                <Line type="monotone" dataKey="impressions" stroke="#94a3b8" strokeWidth={1.5} dot={false} name="Impressions" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="seo-setup-cta">
              <div className="seo-setup-icon"></div>
              <p>Google Search Console not connected</p>
              <button className="adm-btn-primary" onClick={() => navigate('/seo/settings')}>Connect GSC →</button>
            </div>
          )}
        </div>

        {/* Recent Alerts */}
        <div className="seo-card">
          <div className="seo-card-title" style={{ display: 'flex', justifyContent: 'space-between' }}>
            Recent Alerts
            <button className="seo-link-btn" onClick={() => navigate('/seo/alerts')}>View all →</button>
          </div>
          {(data?.recentAlerts || []).length === 0 ? (
            <div className="seo-empty">No open alerts. All good!</div>
          ) : (
            <div className="seo-alert-list">
              {(data?.recentAlerts || []).map(a => (
                <div key={a._id} className="seo-alert-item" style={{ borderLeft: `3px solid ${SEVERITY_COLOR[a.severity]}`, background: SEVERITY_BG[a.severity] }}>
                  <span className="seo-alert-badge" style={{ background: SEVERITY_COLOR[a.severity] }}>{a.severity}</span>
                  <span className="seo-alert-msg">{a.message}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="seo-two-col">
        {/* Top Keywords */}
        <div className="seo-card">
          <div className="seo-card-title" style={{ display: 'flex', justifyContent: 'space-between' }}>
            Top Keywords by Rank
            <button className="seo-link-btn" onClick={() => navigate('/seo/keyword-rankings')}>View all →</button>
          </div>
          {(data?.topKeywords || []).length === 0 ? (
            <div className="seo-empty">No keywords tracked yet.</div>
          ) : (
            <table className="seo-mini-table">
              <thead><tr><th>Keyword</th><th>Pos</th><th>Prev</th><th>Clicks</th></tr></thead>
              <tbody>
                {(data?.topKeywords || []).map(k => {
                  const diff = k.previousRank && k.currentRank ? k.previousRank - k.currentRank : 0;
                  return (
                    <tr key={k._id}>
                      <td>{k.keyword}</td>
                      <td><strong>{k.currentRank ?? '—'}</strong></td>
                      <td>
                        {diff > 0 ? <span className="seo-up">▲{diff}</span> : diff < 0 ? <span className="seo-down">▼{Math.abs(diff)}</span> : <span className="seo-neutral">—</span>}
                      </td>
                      <td>{k.gscClicks || 0}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Quick Actions */}
        <div className="seo-card">
          <div className="seo-card-title">Quick Actions</div>
          <div className="seo-quick-actions">
            {[
              { label: 'Run Site Audit', path: '/seo/site-health' },
              { label: 'Manage Meta Tags', path: '/seo/meta-tags' },
              { label: 'Generate Sitemap', path: '/seo/indexing-sitemap' },
              { label: 'Content Optimizer', path: '/seo/content-optimizer' },
              { label: 'Keyword Suggestions', path: '/seo/keyword-suggestions' },
              { label: 'SEO Settings', path: '/seo/settings' },
            ].map(a => (
              <button key={a.path} className="seo-quick-btn" onClick={() => navigate(a.path)}>{a.label}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}