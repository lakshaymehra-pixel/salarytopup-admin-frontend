import React, { useEffect, useState } from 'react';
import API from '../../api';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import './PagePerformance.css';

export default function PagePerformance() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(28);
  const [selected, setSelected] = useState(null);
  const [sort, setSort] = useState('clicks');

  useEffect(() => {
    setLoading(true);
    API.get(`/seo/gsc/pages?days=${days}`).then(r => setData(r.data)).catch(() => setData({ configured: false })).finally(() => setLoading(false));
  }, [days]);

  if (loading) return <div className="seo-loading">Loading Page Performance...</div>;

  if (!data || data.configured === false) {
    return (
      <div className="pp-wrap">
        <div className="adm-page-header">
          <div><h2 className="adm-page-title">Page Performance</h2></div>
        </div>
        <div className="pp-setup">
          <div style={{ fontSize: '2.5rem', marginBottom: 16 }}></div>
          <h3>Connect Google Search Console</h3>
          <p>Page Performance shows real clicks, impressions, CTR and average position for each page — pulled directly from Google.</p>
          <div className="pp-steps">
            {['Go to Google Cloud Console → Create a project', 'Enable Google Search Console API', 'Create OAuth 2.0 credentials (Web application)', 'Add authorized redirect URI: http://localhost:5000/api/seo/settings/gsc-callback', 'Copy Client ID and Client Secret', 'Go to SEO Settings → Google Search Console → paste credentials → Connect'].map((s, i) => (
              <div key={i} className="pp-step"><span className="pp-step-num">{i + 1}</span><span>{s}</span></div>
            ))}
          </div>
          <a href="/seo/settings" className="adm-btn-primary" style={{ display: 'inline-block', marginTop: 16 }}>Open SEO Settings →</a>
        </div>
      </div>
    );
  }

  const rows = (data.rows || []).sort((a, b) => (b[sort] || 0) - (a[sort] || 0));

  return (
    <div className="pp-wrap">
      <div className="adm-page-header">
        <div>
          <h2 className="adm-page-title">Page Performance</h2>
          <p className="adm-page-sub">Real data from Google Search Console</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {[7, 28, 90].map(d => (
            <button key={d} className={`seo-range-btn ${days === d ? 'active' : ''}`} onClick={() => setDays(d)}>
              {d}D
            </button>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="seo-stats-row" style={{ marginBottom: 20 }}>
        {[
          { label: 'Total Pages', val: rows.length },
          { label: 'Total Clicks', val: rows.reduce((a, r) => a + (r.clicks || 0), 0).toLocaleString() },
          { label: 'Total Impressions', val: rows.reduce((a, r) => a + (r.impressions || 0), 0).toLocaleString() },
          { label: 'Avg CTR', val: rows.length > 0 ? `${(rows.reduce((a, r) => a + (r.ctr || 0), 0) / rows.length * 100).toFixed(2)}%` : '—' },
        ].map(s => (
          <div key={s.label} className="seo-stat-card">
            <div>
              <div className="seo-stat-val">{s.val}</div>
              <div className="seo-stat-lbl">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead>
            <tr>
              <th>Page URL</th>
              <th style={{ cursor: 'pointer' }} onClick={() => setSort('clicks')}>Clicks {sort === 'clicks' ? '↓' : ''}</th>
              <th style={{ cursor: 'pointer' }} onClick={() => setSort('impressions')}>Impressions {sort === 'impressions' ? '↓' : ''}</th>
              <th>CTR</th>
              <th style={{ cursor: 'pointer' }} onClick={() => setSort('position')}>Avg Position {sort === 'position' ? '↓' : ''}</th>
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, 100).map((r, i) => (
              <tr key={i} style={{ cursor: 'pointer' }} onClick={() => setSelected(r)} className={selected?.keys?.[0] === r.keys?.[0] ? 'pp-selected' : ''}>
                <td style={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  <span style={{ color: '#3b82f6', fontSize: '0.85rem' }}>{r.keys?.[0] || r.page}</span>
                </td>
                <td><strong>{Math.round(r.clicks || 0)}</strong></td>
                <td>{Math.round(r.impressions || 0).toLocaleString()}</td>
                <td>{((r.ctr || 0) * 100).toFixed(2)}%</td>
                <td>
                  <span className={`pp-pos ${(r.position || 99) <= 3 ? 'pp-pos-gold' : (r.position || 99) <= 10 ? 'pp-pos-green' : ''}`}>
                    {(r.position || 0).toFixed(1)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}