import React, { useEffect, useState } from 'react';
import API from '../api';
import toast from 'react-hot-toast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './Keywords.css';

const emptyForm = { keyword: '', targetRank: 1, url: '', notes: '' };

function RankBadge({ rank }) {
  if (!rank && rank !== 0) return <span className="kw-rank-na">—</span>;
  const color = rank <= 3 ? '#16a34a' : rank <= 10 ? '#2563eb' : rank <= 30 ? '#f59e0b' : '#ef4444';
  const bg = rank <= 3 ? '#f0fdf4' : rank <= 10 ? '#eff6ff' : rank <= 30 ? '#fffbeb' : '#fef2f2';
  return <span className="kw-rank-badge" style={{ color, background: bg }}>#{rank}</span>;
}

function ChangeIndicator({ current, previous }) {
  if (!current || !previous) return null;
  const diff = previous - current; // positive = improved (rank went down in number)
  if (diff === 0) return <span className="kw-change neutral">—</span>;
  if (diff > 0) return <span className="kw-change up">▲ {diff}</span>;
  return <span className="kw-change down">▼ {Math.abs(diff)}</span>;
}

export default function Keywords() {
  const [keywords, setKeywords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [rankInputs, setRankInputs] = useState({});
  const [selectedKw, setSelectedKw] = useState(null);

  const load = () => {
    setLoading(true);
    API.get('/keywords').then(r => { setKeywords(r.data); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm(emptyForm); setEditId(null); setShowForm(true); };
  const openEdit = (kw) => { setForm({ keyword: kw.keyword, targetRank: kw.targetRank, url: kw.url, notes: kw.notes }); setEditId(kw._id); setShowForm(true); };
  const closeForm = () => { setShowForm(false); setEditId(null); setForm(emptyForm); };

  const handleSave = async () => {
    if (!form.keyword.trim()) { toast.error('Keyword required'); return; }
    setSaving(true);
    try {
      if (editId) { await API.put(`/keywords/${editId}`, form); toast.success('Updated!'); }
      else { await API.post('/keywords', form); toast.success('Keyword added!'); }
      closeForm(); load();
    } catch { toast.error('Error saving'); }
    setSaving(false);
  };

  const handleUpdateRank = async (id) => {
    const rank = parseInt(rankInputs[id]);
    if (!rank || rank < 1) { toast.error('Enter valid rank (1+)'); return; }
    try {
      await API.put(`/keywords/${id}/rank`, { rank });
      toast.success('Rank updated!');
      setRankInputs(r => ({ ...r, [id]: '' }));
      load();
    } catch { toast.error('Error updating rank'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this keyword?')) return;
    await API.delete(`/keywords/${id}`);
    toast.success('Deleted');
    if (selectedKw?._id === id) setSelectedKw(null);
    load();
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });

  const chartData = selectedKw?.history?.slice(-10).map(h => ({
    date: formatDate(h.date),
    rank: h.rank,
  })) || [];

  const top10 = keywords.filter(k => k.currentRank && k.currentRank <= 10).length;
  const top30 = keywords.filter(k => k.currentRank && k.currentRank <= 30).length;
  const improved = keywords.filter(k => k.currentRank && k.previousRank && k.currentRank < k.previousRank).length;

  return (
    <div className="kw-wrap">
      <div className="adm-page-header">
        <div>
          <h2 className="adm-page-title">Keyword Tracker</h2>
          <p className="adm-page-sub">Track Google ranking positions for your keywords</p>
        </div>
        <button className="adm-btn-primary" onClick={openAdd}>+ Add Keyword</button>
      </div>

      {/* Stats */}
      <div className="kw-stats">
        <div className="kw-stat" style={{ '--c': '#0d2240' }}>
          <div className="kw-stat-val">{keywords.length}</div>
          <div className="kw-stat-lbl">Total Keywords</div>
        </div>
        <div className="kw-stat" style={{ '--c': '#16a34a' }}>
          <div className="kw-stat-val">{top10}</div>
          <div className="kw-stat-lbl">Top 10</div>
        </div>
        <div className="kw-stat" style={{ '--c': '#2563eb' }}>
          <div className="kw-stat-val">{top30}</div>
          <div className="kw-stat-lbl">Top 30</div>
        </div>
        <div className="kw-stat" style={{ '--c': '#26b9db' }}>
          <div className="kw-stat-val">{improved}</div>
          <div className="kw-stat-lbl">Improved</div>
        </div>
      </div>

      <div className="kw-layout">
        {/* Keywords Table */}
        <div className="kw-table-card">
          {loading ? (
            <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8' }}>Loading...</div>
          ) : keywords.length === 0 ? (
            <div className="kw-empty">No keywords yet. Click "+ Add Keyword" to start tracking.</div>
          ) : (
            <table className="kw-table">
              <thead>
                <tr>
                  <th>Keyword</th>
                  <th>Rank</th>
                  <th>Change</th>
                  <th>Target</th>
                  <th>Update Rank</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {keywords.map(kw => (
                  <tr
                    key={kw._id}
                    className={selectedKw?._id === kw._id ? 'kw-row-selected' : ''}
                    onClick={() => setSelectedKw(kw)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td>
                      <div className="kw-name">{kw.keyword}</div>
                      {kw.url && <div className="kw-url">{kw.url}</div>}
                    </td>
                    <td><RankBadge rank={kw.currentRank} /></td>
                    <td><ChangeIndicator current={kw.currentRank} previous={kw.previousRank} /></td>
                    <td><span className="kw-target">#{kw.targetRank}</span></td>
                    <td onClick={e => e.stopPropagation()}>
                      <div className="kw-rank-update">
                        <input
                          type="number"
                          min="1"
                          placeholder="Rank"
                          value={rankInputs[kw._id] || ''}
                          onChange={e => setRankInputs(r => ({ ...r, [kw._id]: e.target.value }))}
                          onKeyDown={e => e.key === 'Enter' && handleUpdateRank(kw._id)}
                          className="kw-rank-input"
                        />
                        <button className="kw-update-btn" onClick={() => handleUpdateRank(kw._id)}>Set</button>
                      </div>
                    </td>
                    <td onClick={e => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="adm-icon-btn" onClick={() => openEdit(kw)} title="Edit">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="15" height="15"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        <button className="adm-icon-btn delete" onClick={() => handleDelete(kw._id)} title="Delete">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="15" height="15"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Rank History Chart */}
        {selectedKw && (
          <div className="kw-chart-card">
            <div className="kw-chart-header">
              <div>
                <div className="kw-chart-title">"{selectedKw.keyword}"</div>
                <div className="kw-chart-sub">Rank history — lower is better</div>
              </div>
              <button className="kw-close-chart" onClick={() => setSelectedKw(null)}>✕</button>
            </div>
            {chartData.length < 2 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8', fontSize: '0.85rem' }}>
                Update rank at least 2 times to see the trend chart.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData} margin={{ top: 8, right: 12, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis reversed allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(v) => [`#${v}`, 'Rank']} contentStyle={{ fontSize: '0.82rem', borderRadius: 8, border: '1.5px solid #e2e8f0' }} />
                  <Line type="monotone" dataKey="rank" stroke="#26b9db" strokeWidth={2.5} dot={{ fill: '#26b9db', r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
            {selectedKw.notes && (
              <div className="kw-notes"><strong>Notes:</strong> {selectedKw.notes}</div>
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="faqs-modal-overlay" onClick={closeForm}>
          <div className="faqs-modal" onClick={e => e.stopPropagation()}>
            <div className="faqs-modal-header">
              <h3>{editId ? 'Edit Keyword' : 'Add Keyword'}</h3>
              <button className="faqs-modal-close" onClick={closeForm}>✕</button>
            </div>
            <div className="faqs-modal-body">
              <div className="faqs-field">
                <label>Keyword *</label>
                <input type="text" placeholder="e.g. salary topup loan" value={form.keyword} onChange={e => setForm(f => ({ ...f, keyword: e.target.value }))} />
              </div>
              <div className="faqs-field">
                <label>Target URL</label>
                <input type="text" placeholder="e.g. /apply-now" value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} />
              </div>
              <div className="faqs-field">
                <label>Target Rank</label>
                <input type="number" min="1" value={form.targetRank} onChange={e => setForm(f => ({ ...f, targetRank: Number(e.target.value) }))} style={{ width: 100 }} />
              </div>
              <div className="faqs-field">
                <label>Notes</label>
                <textarea placeholder="Any notes about this keyword..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={3} />
              </div>
            </div>
            <div className="faqs-modal-footer">
              <button className="adm-btn-secondary" onClick={closeForm}>Cancel</button>
              <button className="adm-btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : editId ? 'Update' : 'Add Keyword'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}