import React, { useEffect, useState } from 'react';
import API from '../../api';
import toast from 'react-hot-toast';
import './SeoAlerts.css';

const SEV = {
  critical: { color: '#ef4444', bg: '#fef2f2', border: '#fecaca' },
  warning: { color: '#f59e0b', bg: '#fffbeb', border: '#fde68a' },
  info: { color: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe' },
};

const TYPE_ICON = {
  rank_drop: '↓', rank_rise: '↑', missing_meta: '!', no_meta_title: '!',
  no_meta_desc: '!', page_not_indexed: '?', sitemap_error: '!', keyword_opportunity: '+',
};

export default function SeoAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [unresolved, setUnresolved] = useState(0);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [filter, setFilter] = useState('unresolved');
  const [severity, setSeverity] = useState('');

  const load = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filter === 'unresolved') params.set('resolved', 'false');
    if (filter === 'resolved') params.set('resolved', 'true');
    if (severity) params.set('severity', severity);
    API.get(`/seo/alerts?${params}`).then(r => {
      setAlerts(r.data.alerts);
      setUnresolved(r.data.unresolved);
    }).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filter, severity]);

  const runChecks = async () => {
    setRunning(true);
    try {
      const r = await API.post('/seo/alerts/run-checks');
      toast.success(`Check complete. ${r.data.newAlerts} new alerts found.`);
      load();
    } catch { toast.error('Check failed'); }
    setRunning(false);
  };

  const resolve = async (id) => {
    await API.put(`/seo/alerts/${id}/resolve`);
    setAlerts(prev => prev.map(a => a._id === id ? { ...a, resolved: true } : a));
    setUnresolved(u => Math.max(0, u - 1));
    toast.success('Resolved');
  };

  const del = async (id) => {
    await API.delete(`/seo/alerts/${id}`);
    setAlerts(prev => prev.filter(a => a._id !== id));
  };

  const clearResolved = async () => {
    if (!window.confirm('Delete all resolved alerts?')) return;
    await API.delete('/seo/alerts/bulk/resolved');
    toast.success('Cleared resolved alerts');
    load();
  };

  return (
    <div className="sa-wrap">
      <div className="adm-page-header">
        <div>
          <h2 className="adm-page-title">SEO Alerts</h2>
          <p className="adm-page-sub">{unresolved} unresolved issues need attention</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="adm-btn-secondary" onClick={clearResolved}>Clear Resolved</button>
          <button className="adm-btn-primary" onClick={runChecks} disabled={running}>
            {running ? 'Running...' : 'Run Alert Checks'}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="sa-filters">
        {['unresolved', 'resolved', 'all'].map(f => (
          <button key={f} className={`sa-filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
        <div style={{ borderLeft: '1.5px solid #e2e8f0', margin: '0 8px' }} />
        {['', 'critical', 'warning', 'info'].map(s => (
          <button key={s} className={`sa-filter-btn ${severity === s ? 'active' : ''}`} onClick={() => setSeverity(s)}>
            {s || 'All Severity'}
          </button>
        ))}
      </div>

      {loading ? <div className="seo-loading">Loading alerts...</div> : (
        <div className="sa-list">
          {alerts.length === 0 ? (
            <div className="sa-empty">
              <div style={{ fontSize: '2.5rem', marginBottom: 12 }}></div>
              <div>{filter === 'unresolved' ? 'No open alerts! Click "Run Alert Checks" to scan for new issues.' : 'No alerts found.'}</div>
            </div>
          ) : alerts.map(a => {
            const s = SEV[a.severity] || SEV.info;
            return (
              <div key={a._id} className={`sa-card ${a.resolved ? 'sa-resolved' : ''}`} style={{ borderLeft: `4px solid ${s.color}`, background: a.resolved ? '#f8fafc' : s.bg }}>
                <div className="sa-card-left">
                  <span className="sa-icon">{TYPE_ICON[a.type] || '!'}</span>
                  <div>
                    <div className="sa-message">{a.message}</div>
                    <div className="sa-meta">
                      <span className="sa-badge" style={{ background: s.color }}>{a.severity}</span>
                      <span className="sa-type">{a.type.replace(/_/g, ' ')}</span>
                      <span className="sa-time">{new Date(a.createdAt).toLocaleDateString()}</span>
                      {a.resolved && <span className="sa-resolved-badge">✓ Resolved</span>}
                    </div>
                  </div>
                </div>
                <div className="sa-actions">
                  {!a.resolved && (
                    <button className="adm-btn-xs" onClick={() => resolve(a._id)} style={{ background: '#f0fdf4', borderColor: '#86efac', color: '#16a34a' }}>
                      ✓ Resolve
                    </button>
                  )}
                  <button className="adm-btn-xs adm-btn-danger-xs" onClick={() => del(a._id)}>Del</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}