import React, { useEffect, useState } from 'react';
import API from '../api';
import toast from 'react-hot-toast';
import './Testimonials.css';

const emptyForm = { name: '', location: '', message: '', rating: 5, order: 0, active: true };

function Stars({ rating, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {[1,2,3,4,5].map(s => (
        <span key={s} onClick={() => onChange && onChange(s)}
          style={{ fontSize: '1.4rem', cursor: onChange ? 'pointer' : 'default', color: s <= rating ? '#f59e0b' : '#e2e8f0' }}>★</span>
      ))}
    </div>
  );
}

export default function Testimonials() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    API.get('/testimonials').then(r => { setList(r.data); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm(emptyForm); setEditId(null); setShowForm(true); };
  const openEdit = (t) => { setForm({ name: t.name, location: t.location, message: t.message, rating: t.rating, order: t.order, active: t.active }); setEditId(t._id); setShowForm(true); };
  const closeForm = () => { setShowForm(false); setEditId(null); setForm(emptyForm); };

  const handleSave = async () => {
    if (!form.name.trim() || !form.message.trim()) { toast.error('Name and message required'); return; }
    setSaving(true);
    try {
      if (editId) { await API.put(`/testimonials/${editId}`, form); toast.success('Updated!'); }
      else { await API.post('/testimonials', form); toast.success('Testimonial added!'); }
      closeForm(); load();
    } catch { toast.error('Error saving'); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this testimonial?')) return;
    await API.delete(`/testimonials/${id}`);
    toast.success('Deleted'); load();
  };

  const handleToggle = async (t) => {
    await API.put(`/testimonials/${t._id}`, { ...t, active: !t.active });
    load();
  };

  return (
    <div className="tm-wrap">
      <div className="adm-page-header">
        <div>
          <h2 className="adm-page-title">Testimonials</h2>
          <p className="adm-page-sub">Manage customer reviews shown on website</p>
        </div>
        <button className="adm-btn-primary" onClick={openAdd}>+ Add Testimonial</button>
      </div>

      {/* Stats */}
      <div className="tm-stats">
        <div className="tm-stat"><div className="tm-stat-val">{list.length}</div><div className="tm-stat-lbl">Total</div></div>
        <div className="tm-stat"><div className="tm-stat-val">{list.filter(t => t.active).length}</div><div className="tm-stat-lbl">Active</div></div>
        <div className="tm-stat"><div className="tm-stat-val">{list.filter(t => !t.active).length}</div><div className="tm-stat-lbl">Hidden</div></div>
      </div>

      {/* Cards Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8' }}>Loading...</div>
      ) : (
        <div className="tm-grid">
          {list.length === 0 && <div className="tm-empty">No testimonials yet. Click "+ Add Testimonial".</div>}
          {list.map(t => (
            <div key={t._id} className={`tm-card ${!t.active ? 'tm-hidden' : ''}`}>
              <div className="tm-card-top">
                <div className="tm-avatar">{t.name.charAt(0).toUpperCase()}</div>
                <div>
                  <div className="tm-name">{t.name}</div>
                  <div className="tm-location">{t.location}</div>
                </div>
                <div className="tm-card-actions">
                  <button className={`tm-toggle ${t.active ? 'active' : ''}`} onClick={() => handleToggle(t)}>
                    {t.active ? 'Active' : 'Hidden'}
                  </button>
                </div>
              </div>
              <div className="tm-message">"{t.message}"</div>
              <div className="tm-card-footer">
                <Stars rating={t.rating} />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="adm-icon-btn" onClick={() => openEdit(t)} title="Edit">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="15" height="15"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                  <button className="adm-icon-btn delete" onClick={() => handleDelete(t._id)} title="Delete">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="15" height="15"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <div className="faqs-modal-overlay" onClick={closeForm}>
          <div className="faqs-modal" onClick={e => e.stopPropagation()}>
            <div className="faqs-modal-header">
              <h3>{editId ? 'Edit Testimonial' : 'Add Testimonial'}</h3>
              <button className="faqs-modal-close" onClick={closeForm}>✕</button>
            </div>
            <div className="faqs-modal-body">
              <div className="faqs-field">
                <label>Customer Name *</label>
                <input type="text" placeholder="e.g. Sneha Gupta" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="faqs-field">
                <label>Location</label>
                <input type="text" placeholder="e.g. Hyderabad" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
              </div>
              <div className="faqs-field">
                <label>Message *</label>
                <textarea placeholder="Customer review..." value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} rows={4} />
              </div>
              <div className="faqs-field">
                <label>Rating</label>
                <Stars rating={form.rating} onChange={r => setForm(f => ({ ...f, rating: r }))} />
              </div>
              <div className="faqs-field">
                <label>Display Order</label>
                <input type="number" min="0" value={form.order} onChange={e => setForm(f => ({ ...f, order: Number(e.target.value) }))} style={{ width: 80 }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="checkbox" id="tm-active" checked={form.active} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} />
                <label htmlFor="tm-active" style={{ fontSize: '0.85rem', color: '#374151' }}>Show on website</label>
              </div>
            </div>
            <div className="faqs-modal-footer">
              <button className="adm-btn-secondary" onClick={closeForm}>Cancel</button>
              <button className="adm-btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : editId ? 'Update' : 'Add'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}