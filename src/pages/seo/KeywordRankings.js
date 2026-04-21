import React, { useEffect, useState } from 'react';
import API from '../../api';
import toast from 'react-hot-toast';
import './KeywordRankings.css';

const INTENT_COLORS = { informational: '#3b82f6', transactional: '#16a34a', navigational: '#f59e0b', commercial: '#7c3aed', '': '#94a3b8' };

export default function KeywordRankings() {
  const [keywords, setKeywords] = useState([]);
  const [gscData, setGscData] = useState(null);
  const [tab, setTab] = useState('manual');
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [search, setSearch] = useState('');
  const [intentFilter, setIntentFilter] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ keyword: '', currentRank: '', targetRank: '1', url: '', intent: '', volume: '', notes: '' });
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    API.get('/keywords').then(r => setKeywords(r.data)).catch(() => {}).finally(() => setLoading(false));
  };

  const loadGsc = () => {
    API.get('/seo/gsc/keywords?days=28').then(r => setGscData(r.data)).catch(() => setGscData({ configured: false }));
  };

  useEffect(() => { load(); loadGsc(); }, []);

  const syncGsc = async () => {
    setSyncing(true);
    try {
      await API.get('/seo/gsc/keywords?days=28');
      toast.success('Synced from Google Search Console');
      load();
      loadGsc();
    } catch { toast.error('Sync failed'); }
    setSyncing(false);
  };

  const save = async () => {
    if (!form.keyword.trim()) return toast.error('Keyword required');
    setSaving(true);
    try {
      const payload = {
        keyword: form.keyword.trim(),
        currentRank: form.currentRank ? Number(form.currentRank) : null,
        targetRank: Number(form.targetRank) || 1,
        url: form.url,
        intent: form.intent,
        volume: form.volume,
        notes: form.notes,
      };
      if (editId) await API.put(`/keywords/${editId}`, payload);
      else await API.post('/keywords', payload);
      toast.success(editId ? 'Keyword updated' : 'Keyword added');
      setShowAdd(false); setEditId(null); setForm({ keyword: '', currentRank: '', targetRank: '1', url: '', intent: '', volume: '', notes: '' });
      load();
    } catch (e) { toast.error(e.response?.data?.message || 'Error'); }
    setSaving(false);
  };

  const del = async (id) => {
    if (!window.confirm('Delete this keyword?')) return;
    await API.delete(`/keywords/${id}`);
    toast.success('Deleted'); load();
  };

  const startEdit = (kw) => {
    setEditId(kw._id);
    setForm({ keyword: kw.keyword, currentRank: kw.currentRank ?? '', targetRank: kw.targetRank ?? '1', url: kw.url || '', intent: kw.intent || '', volume: kw.volume || '', notes: kw.notes || '' });
    setShowAdd(true);
  };

  const updateRank = async (kw) => {
    const rank = window.prompt(`Enter new rank for "${kw.keyword}":`, kw.currentRank || '');
    if (rank === null) return;
    const r = parseInt(rank);
    if (isNaN(r) || r < 1) return toast.error('Enter a valid rank number');
    await API.put(`/keywords/${kw._id}/rank`, { rank: r });
    toast.success('Rank updated'); load();
  };

  const filtered = keywords.filter(k => {
    const matchSearch = !search || k.keyword.toLowerCase().includes(search.toLowerCase());
    const matchIntent = !intentFilter || k.intent === intentFilter;
    return matchSearch && matchIntent;
  });

  const getRankChange = (kw) => {
    if (!kw.currentRank || !kw.previousRank) return null;
    return kw.previousRank - kw.currentRank;
  };

  return (
    <div className="kr-wrap">
      <div className="adm-page-header">
        <div>
          <h2 className="adm-page-title">Keyword Rankings</h2>
          <p className="adm-page-sub">Track and manage your keyword positions</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {gscData?.configured !== false && (
            <button className="adm-btn-secondary" onClick={syncGsc} disabled={syncing}>
              {syncing ? 'Syncing...' : '↻ Sync GSC'}
            </button>
          )}
          <button className="adm-btn-primary" onClick={() => { setShowAdd(true); setEditId(null); setForm({ keyword: '', currentRank: '', targetRank: '1', url: '', intent: '', volume: '', notes: '' }); }}>
            + Add Keyword
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="kr-tabs">
        <button className={`kr-tab ${tab === 'manual' ? 'active' : ''}`} onClick={() => setTab('manual')}>Manual Tracking ({keywords.length})</button>
        <button className={`kr-tab ${tab === 'gsc' ? 'active' : ''}`} onClick={() => setTab('gsc')}>Search Console Data</button>
      </div>

      {tab === 'manual' && (
        <>
          {/* Filters */}
          <div className="kr-filters">
            <input className="kr-search" placeholder="Search keywords..." value={search} onChange={e => setSearch(e.target.value)} />
            <select className="kr-select" value={intentFilter} onChange={e => setIntentFilter(e.target.value)}>
              <option value="">All Intents</option>
              <option value="informational">Informational</option>
              <option value="transactional">Transactional</option>
              <option value="navigational">Navigational</option>
              <option value="commercial">Commercial</option>
            </select>
          </div>

          {loading ? <div className="seo-loading">Loading...</div> : (
            <div className="adm-table-wrap">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>Keyword</th>
                    <th>Intent</th>
                    <th>Current Rank</th>
                    <th>Change</th>
                    <th>Target</th>
                    <th>Volume</th>
                    <th>GSC Clicks</th>
                    <th>GSC Impr.</th>
                    <th>Page URL</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={10} style={{ textAlign: 'center', color: '#94a3b8', padding: 40 }}>No keywords yet. Add your first keyword!</td></tr>
                  ) : filtered.map(kw => {
                    const change = getRankChange(kw);
                    return (
                      <tr key={kw._id} className={change > 0 ? 'kr-row-up' : change < 0 ? 'kr-row-down' : ''}>
                        <td><strong>{kw.keyword}</strong></td>
                        <td>
                          {kw.intent && <span className="kr-intent-badge" style={{ background: INTENT_COLORS[kw.intent] + '20', color: INTENT_COLORS[kw.intent] }}>{kw.intent}</span>}
                        </td>
                        <td>
                          <span className={`kr-rank ${kw.currentRank <= 3 ? 'kr-rank-gold' : kw.currentRank <= 10 ? 'kr-rank-green' : ''}`}>
                            {kw.currentRank ?? '—'}
                          </span>
                        </td>
                        <td>
                          {change > 0 ? <span className="kr-change up">▲{change}</span>
                            : change < 0 ? <span className="kr-change down">▼{Math.abs(change)}</span>
                            : <span className="kr-change neutral">—</span>}
                        </td>
                        <td style={{ color: '#64748b' }}>{kw.targetRank}</td>
                        <td style={{ color: '#64748b' }}>{kw.volume || '—'}</td>
                        <td>{kw.gscClicks || 0}</td>
                        <td>{kw.gscImpressions ? kw.gscImpressions.toLocaleString() : 0}</td>
                        <td style={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {kw.url ? <a href={kw.url} target="_blank" rel="noreferrer" style={{ color: '#3b82f6', fontSize: '0.8rem' }}>{kw.url}</a> : '—'}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button className="adm-btn-xs" onClick={() => updateRank(kw)}>Update Rank</button>
                            <button className="adm-btn-xs" onClick={() => startEdit(kw)}>Edit</button>
                            <button className="adm-btn-xs adm-btn-danger-xs" onClick={() => del(kw._id)}>Del</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {tab === 'gsc' && (
        <div>
          {!gscData || gscData.configured === false ? (
            <div className="kr-gsc-setup">
              <div style={{ fontSize: '2rem', marginBottom: 12 }}></div>
              <h3>Google Search Console Not Connected</h3>
              <p>Connect GSC to see real-time keyword rankings, impressions, clicks and CTR directly from Google.</p>
              <a href="/seo/settings" className="adm-btn-primary" style={{ display: 'inline-block', marginTop: 12 }}>Connect in SEO Settings →</a>
            </div>
          ) : (
            <>
              <div className="kr-gsc-info">Showing data synced from Google Search Console. Last sync: {gscData.rows?.length || 0} keywords found.</div>
              <div className="adm-table-wrap">
                <table className="adm-table">
                  <thead>
                    <tr><th>Query</th><th>Impressions</th><th>Clicks</th><th>CTR</th><th>Avg Position</th></tr>
                  </thead>
                  <tbody>
                    {(gscData.rows || []).slice(0, 100).map((r, i) => (
                      <tr key={i}>
                        <td>{r.keys?.[0] || r.keyword}</td>
                        <td>{Math.round(r.impressions || 0).toLocaleString()}</td>
                        <td>{Math.round(r.clicks || 0)}</td>
                        <td>{((r.ctr || 0) * 100).toFixed(2)}%</td>
                        <td>{(r.position || 0).toFixed(1)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {/* Add/Edit Drawer */}
      {showAdd && (
        <div className="kr-drawer-overlay" onClick={() => setShowAdd(false)}>
          <div className="kr-drawer" onClick={e => e.stopPropagation()}>
            <div className="kr-drawer-header">
              <span>{editId ? 'Edit Keyword' : 'Add Keyword'}</span>
              <button onClick={() => setShowAdd(false)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}>×</button>
            </div>
            <div className="kr-drawer-body">
              {[
                { label: 'Keyword *', key: 'keyword', placeholder: 'e.g. salary loan india' },
                { label: 'Current Rank', key: 'currentRank', placeholder: 'e.g. 15', type: 'number' },
                { label: 'Target Rank', key: 'targetRank', placeholder: 'e.g. 1', type: 'number' },
                { label: 'Volume (est.)', key: 'volume', placeholder: 'e.g. 1K-10K' },
                { label: 'Target URL', key: 'url', placeholder: 'https://...' },
                { label: 'Notes', key: 'notes', placeholder: 'Optional notes...' },
              ].map(f => (
                <div key={f.key} className="kr-field">
                  <label>{f.label}</label>
                  <input type={f.type || 'text'} value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder} />
                </div>
              ))}
              <div className="kr-field">
                <label>Intent</label>
                <select value={form.intent} onChange={e => setForm(p => ({ ...p, intent: e.target.value }))}>
                  <option value="">— Select —</option>
                  <option value="informational">Informational</option>
                  <option value="transactional">Transactional</option>
                  <option value="navigational">Navigational</option>
                  <option value="commercial">Commercial</option>
                </select>
              </div>
              <button className="adm-btn-primary" style={{ width: '100%', marginTop: 8 }} onClick={save} disabled={saving}>
                {saving ? 'Saving...' : editId ? 'Update Keyword' : 'Add Keyword'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}