import React, { useEffect, useState } from 'react';
import API from '../api';
import toast from 'react-hot-toast';
import './Faqs.css';

const GROUPS = ['General', 'Eligibility & Amount', 'Repayment', 'Documents & Security'];

const emptyForm = { question: '', answer: '', group: 'General', order: 0, active: true, showOnHome: false };

export default function Faqs() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [filterGroup, setFilterGroup] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'home'

  const load = () => {
    setLoading(true);
    API.get('/faqs').then(r => { setFaqs(r.data); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm(emptyForm); setEditId(null); setShowForm(true); };
  const openEdit = (faq) => { setForm({ question: faq.question, answer: faq.answer, group: faq.group, order: faq.order, active: faq.active, showOnHome: faq.showOnHome || false }); setEditId(faq._id); setShowForm(true); };
  const closeForm = () => { setShowForm(false); setEditId(null); setForm(emptyForm); };

  const handleSave = async () => {
    if (!form.question.trim() || !form.answer.trim()) { toast.error('Question and Answer required'); return; }
    setSaving(true);
    try {
      if (editId) { await API.put(`/faqs/${editId}`, form); toast.success('FAQ updated!'); }
      else { await API.post('/faqs', form); toast.success('FAQ added!'); }
      closeForm(); load();
    } catch { toast.error('Error saving'); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this FAQ?')) return;
    await API.delete(`/faqs/${id}`);
    toast.success('Deleted');
    load();
  };

  const handleSeed = async () => {
    try {
      const r = await API.post('/faqs/seed');
      toast.success(r.data.message);
      load();
    } catch { toast.error('Seed failed'); }
  };

  const handleToggle = async (faq) => {
    await API.put(`/faqs/${faq._id}`, { ...faq, active: !faq.active });
    load();
  };

  const handleHomeToggle = async (faq) => {
    await API.put(`/faqs/${faq._id}`, { ...faq, showOnHome: !faq.showOnHome });
    load();
  };

  const handleEnableAllHome = async () => {
    const notOnHome = faqs.filter(f => !f.showOnHome);
    if (notOnHome.length === 0) { toast('All FAQs already on homepage!'); return; }
    await Promise.all(notOnHome.map(f => API.put(`/faqs/${f._id}`, { ...f, showOnHome: true })));
    toast.success(`${notOnHome.length} FAQs added to homepage!`);
    load();
  };

  const handleDisableAllHome = async () => {
    const onHome = faqs.filter(f => f.showOnHome);
    if (onHome.length === 0) { toast('No FAQs on homepage!'); return; }
    await Promise.all(onHome.map(f => API.put(`/faqs/${f._id}`, { ...f, showOnHome: false })));
    toast.success('All removed from homepage');
    load();
  };

  const tabFaqs = activeTab === 'home' ? faqs.filter(f => f.showOnHome) : faqs;
  const filtered = filterGroup ? tabFaqs.filter(f => f.group === filterGroup) : tabFaqs;

  // Group faqs for display
  const grouped = filtered.reduce((acc, faq) => {
    if (!acc[faq.group]) acc[faq.group] = [];
    acc[faq.group].push(faq);
    return acc;
  }, {});

  return (
    <div className="faqs-wrap">
      <div className="adm-page-header">
        <div>
          <h2 className="adm-page-title">FAQs</h2>
          <p className="adm-page-sub">Manage frequently asked questions shown on website</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {faqs.length === 0 && (
            <button className="adm-btn-secondary" onClick={handleSeed}>↓ Load Default FAQs</button>
          )}
          <button className="adm-btn-primary" onClick={openAdd}>+ Add FAQ</button>
        </div>
      </div>

      {/* Stats */}
      <div className="faqs-stats">
        <div className="faqs-stat">
          <div className="faqs-stat-val">{faqs.length}</div>
          <div className="faqs-stat-lbl">Total FAQs</div>
        </div>
        <div className="faqs-stat">
          <div className="faqs-stat-val">{faqs.filter(f => f.active).length}</div>
          <div className="faqs-stat-lbl">Active</div>
        </div>
        <div className="faqs-stat">
          <div className="faqs-stat-val">{[...new Set(faqs.map(f => f.group))].length}</div>
          <div className="faqs-stat-lbl">Groups</div>
        </div>
        <div className="faqs-stat faqs-stat-home">
          <div className="faqs-stat-val">{faqs.filter(f => f.showOnHome).length}</div>
          <div className="faqs-stat-lbl">On Homepage</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="faqs-tabs">
        <button
          className={`faqs-tab ${activeTab === 'all' ? 'faqs-tab-active' : ''}`}
          onClick={() => { setActiveTab('all'); setFilterGroup(''); }}
        >
          All FAQs
          <span className="faqs-tab-count">{faqs.length}</span>
        </button>
        <button
          className={`faqs-tab ${activeTab === 'home' ? 'faqs-tab-active' : ''}`}
          onClick={() => { setActiveTab('home'); setFilterGroup(''); }}
        >
          Home Page FAQs
          <span className="faqs-tab-count faqs-tab-count-home">{faqs.filter(f => f.showOnHome).length}</span>
        </button>

        {/* Home tab bulk actions */}
        {activeTab === 'home' && (
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <button className="adm-btn-secondary" style={{ fontSize: '0.78rem', padding: '6px 14px' }} onClick={handleDisableAllHome}>Remove All</button>
            <button className="adm-btn-primary" style={{ fontSize: '0.78rem', padding: '6px 14px' }} onClick={handleEnableAllHome}>Add All</button>
          </div>
        )}
      </div>

      {/* Filter */}
      <div className="adm-filters" style={{ marginBottom: 20 }}>
        <select className="adm-select" value={filterGroup} onChange={e => setFilterGroup(e.target.value)}>
          <option value="">All Groups</option>
          {GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
        </select>
      </div>

      {/* FAQ List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8' }}>Loading...</div>
      ) : (
        <div className="faqs-list">
          {Object.keys(grouped).length === 0 && (
            <div className="faqs-empty">
              {activeTab === 'home' ? (
                <>
                  <p>No FAQs added to Home Page yet.</p>
                  <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: '6px 0 16px' }}>
                    Go to "All FAQs" tab and click <strong>"Add to Home"</strong> on any FAQ.
                  </p>
                  <button className="adm-btn-secondary" onClick={() => setActiveTab('all')}>← Go to All FAQs</button>
                </>
              ) : (
                <>
                  <p>No FAQs yet.</p>
                  <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 16 }}>
                    <button className="adm-btn-primary" onClick={openAdd}>+ Add FAQ</button>
                    <button className="adm-btn-secondary" onClick={handleSeed}>↓ Load Default FAQs</button>
                  </div>
                </>
              )}
            </div>
          )}
          {Object.entries(grouped).map(([group, items]) => (
            <div key={group} className="faqs-group">
              <div className="faqs-group-header">{group}</div>
              {items.map(faq => (
                <div key={faq._id} className={`faqs-item ${!faq.active ? 'faqs-inactive' : ''}`}>
                  <div className="faqs-item-left">
                    <div className="faqs-q">{faq.question}</div>
                    <div className="faqs-a">{faq.answer}</div>
                  </div>
                  <div className="faqs-item-actions">
                    <button
                      className={`faqs-home-toggle ${faq.showOnHome ? 'on' : ''}`}
                      onClick={() => handleHomeToggle(faq)}
                      title={faq.showOnHome ? 'Remove from Homepage' : 'Show on Homepage'}
                    >
                      {faq.showOnHome ? 'On Home' : 'Add to Home'}
                    </button>
                    <button
                      className={`faqs-toggle ${faq.active ? 'active' : ''}`}
                      onClick={() => handleToggle(faq)}
                      title={faq.active ? 'Deactivate' : 'Activate'}
                    >
                      {faq.active ? 'Active' : 'Hidden'}
                    </button>
                    <button className="adm-icon-btn" onClick={() => openEdit(faq)} title="Edit">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="15" height="15"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button className="adm-icon-btn delete" onClick={() => handleDelete(faq._id)} title="Delete">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="15" height="15"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <div className="faqs-modal-overlay" onClick={closeForm}>
          <div className="faqs-modal" onClick={e => e.stopPropagation()}>
            <div className="faqs-modal-header">
              <h3>{editId ? 'Edit FAQ' : 'Add New FAQ'}</h3>
              <button className="faqs-modal-close" onClick={closeForm}>✕</button>
            </div>
            <div className="faqs-modal-body">
              <div className="faqs-field">
                <label>Group</label>
                <select value={form.group} onChange={e => setForm(f => ({ ...f, group: e.target.value }))}>
                  {GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div className="faqs-field">
                <label>Question</label>
                <input
                  type="text"
                  placeholder="Enter question..."
                  value={form.question}
                  onChange={e => setForm(f => ({ ...f, question: e.target.value }))}
                />
              </div>
              <div className="faqs-field">
                <label>Answer</label>
                <textarea
                  placeholder="Enter answer..."
                  value={form.answer}
                  onChange={e => setForm(f => ({ ...f, answer: e.target.value }))}
                  rows={5}
                />
              </div>
              <div className="faqs-field faqs-field-row">
                <div>
                  <label>Order</label>
                  <input
                    type="number"
                    value={form.order}
                    onChange={e => setForm(f => ({ ...f, order: Number(e.target.value) }))}
                    style={{ width: 80 }}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 20 }}>
                  <input
                    type="checkbox"
                    id="faq-active"
                    checked={form.active}
                    onChange={e => setForm(f => ({ ...f, active: e.target.checked }))}
                  />
                  <label htmlFor="faq-active" style={{ marginBottom: 0 }}>Active (show on website)</label>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
                  <input
                    type="checkbox"
                    id="faq-home"
                    checked={form.showOnHome}
                    onChange={e => setForm(f => ({ ...f, showOnHome: e.target.checked }))}
                  />
                  <label htmlFor="faq-home" style={{ marginBottom: 0 }}>Show on Homepage</label>
                </div>
              </div>
            </div>
            <div className="faqs-modal-footer">
              <button className="adm-btn-secondary" onClick={closeForm}>Cancel</button>
              <button className="adm-btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : editId ? 'Update FAQ' : 'Add FAQ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}