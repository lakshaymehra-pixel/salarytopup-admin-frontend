import React, { useEffect, useState } from 'react';
import API from '../../api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import './SiteHealth.css';

const TYPE_LABELS = {
  missing_meta_title: 'Missing Meta Title',
  missing_meta_desc: 'Missing Meta Description',
  missing_alt_text: 'Missing Image Alt Text',
  duplicate_meta_title: 'Duplicate Meta Title',
  duplicate_meta_desc: 'Duplicate Meta Description',
};
const SEV_COLOR = { critical: '#ef4444', warning: '#f59e0b', info: '#3b82f6' };
const SEV_BG = { critical: '#fef2f2', warning: '#fffbeb', info: '#eff6ff' };

export default function SiteHealth() {
  const [audit, setAudit] = useState(null);
  const [history, setHistory] = useState([]);
  const [running, setRunning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      API.get('/seo/audit/latest'),
      API.get('/seo/audit/history'),
    ]).then(([a, h]) => {
      setAudit(a.data);
      setHistory(h.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const runAudit = async () => {
    setRunning(true);
    try {
      const r = await API.post('/seo/audit/run');
      setAudit(r.data);
      toast.success(`Audit complete. Score: ${r.data.score}/100`);
      const h = await API.get('/seo/audit/history');
      setHistory(h.data);
    } catch { toast.error('Audit failed'); }
    setRunning(false);
  };

  const scoreColor = s => s >= 80 ? '#16a34a' : s >= 50 ? '#f59e0b' : '#ef4444';

  const TABS = [
    { key: 'all', label: 'All Issues' },
    { key: 'missing_meta_title', label: `Missing Title (${audit?.issuesSummary?.missingMetaTitle || 0})` },
    { key: 'missing_meta_desc', label: `Missing Desc (${audit?.issuesSummary?.missingMetaDesc || 0})` },
    { key: 'missing_alt_text', label: `Alt Text (${audit?.issuesSummary?.missingAltText || 0})` },
    { key: 'duplicate', label: `Duplicates (${audit?.issuesSummary?.duplicateMeta || 0})` },
  ];

  const filteredIssues = (audit?.issues || []).filter(i => {
    if (tab === 'all') return true;
    if (tab === 'duplicate') return i.type.startsWith('duplicate');
    return i.type === tab;
  });

  return (
    <div className="sh-wrap">
      <div className="adm-page-header">
        <div>
          <h2 className="adm-page-title">Site Health</h2>
          <p className="adm-page-sub">Technical SEO audit of all your pages and blog posts</p>
        </div>
        <button className="adm-btn-primary" onClick={runAudit} disabled={running}>
          {running ? 'Running Audit...' : 'Run Full Audit'}
        </button>
      </div>

      {loading ? <div className="seo-loading">Loading...</div> : !audit ? (
        <div className="sh-no-audit">
          <div style={{ fontSize: '3rem', marginBottom: 16 }}></div>
          <h3>No Audit Run Yet</h3>
          <p>Run your first site audit to see SEO issues across all pages and blog posts.</p>
          <button className="adm-btn-primary" onClick={runAudit} disabled={running} style={{ marginTop: 16 }}>
            {running ? 'Running...' : 'Run First Audit'}
          </button>
        </div>
      ) : (
        <>
          {/* Score + Summary */}
          <div className="sh-score-row">
            <div className="sh-score-card">
              <div className="sh-score-circle" style={{ borderColor: scoreColor(audit.score), background: scoreColor(audit.score) + '15' }}>
                <span style={{ color: scoreColor(audit.score) }}>{audit.score}</span>
                <small>/100</small>
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: '#0d2240' }}>Site Health Score</div>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Last run: {new Date(audit.runAt).toLocaleString()}</div>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{audit.totalPages} pages scanned</div>
              </div>
            </div>
            <div className="sh-summary-cards">
              {[
                { label: 'Total Issues', val: audit.issuesSummary.total, color: '#ef4444' },
                { label: 'Missing Meta Title', val: audit.issuesSummary.missingMetaTitle, color: '#ef4444' },
                { label: 'Missing Meta Desc', val: audit.issuesSummary.missingMetaDesc, color: '#ef4444' },
                { label: 'Missing Alt Text', val: audit.issuesSummary.missingAltText, color: '#f59e0b' },
                { label: 'Duplicate Meta', val: audit.issuesSummary.duplicateMeta, color: '#f59e0b' },
              ].map(s => (
                <div key={s.label} className="sh-sum-card" style={{ borderColor: s.color + '40' }}>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: s.color }}>{s.val}</div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Audit History */}
          {history.length > 1 && (
            <div className="sh-history">
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: 8 }}>Audit History</div>
              <div className="sh-history-row">
                {history.slice(0, 8).map((h, i) => (
                  <div key={i} className="sh-history-item" style={{ borderColor: scoreColor(h.score) + '60' }}>
                    <div style={{ fontWeight: 700, color: scoreColor(h.score) }}>{h.score}</div>
                    <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>{new Date(h.runAt).toLocaleDateString()}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Issue Tabs */}
          <div className="kr-tabs" style={{ marginTop: 20 }}>
            {TABS.map(t => (
              <button key={t.key} className={`kr-tab ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>
                {t.label}
              </button>
            ))}
          </div>

          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr><th>Page</th><th>Type</th><th>Severity</th><th>Detail</th><th>Fix</th></tr>
              </thead>
              <tbody>
                {filteredIssues.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign: 'center', color: '#16a34a', padding: 30 }}>No issues in this category!</td></tr>
                ) : filteredIssues.map((issue, i) => (
                  <tr key={i}>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{issue.pageTitle}</div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{issue.url}</div>
                    </td>
                    <td style={{ fontSize: '0.8rem' }}>{TYPE_LABELS[issue.type] || issue.type}</td>
                    <td>
                      <span style={{ background: SEV_BG[issue.severity], color: SEV_COLOR[issue.severity], fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>
                        {issue.severity}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.82rem', color: '#64748b' }}>{issue.detail}</td>
                    <td>
                      {issue.pageType === 'blog' && issue.pageId ? (
                        <button className="adm-btn-xs" onClick={() => navigate(`/blogs/edit/${issue.pageId}`)}>Fix Blog</button>
                      ) : (
                        <button className="adm-btn-xs" onClick={() => navigate('/seo/meta-tags')}>Fix Meta</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}