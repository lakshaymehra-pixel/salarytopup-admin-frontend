import React, { useEffect, useState } from 'react';
import API from '../api';
import toast from 'react-hot-toast';
import MediaLibrary from '../components/MediaLibrary';
import './Table.css';
import './TaxPage.css';

export default function Authors() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ name: '', bio: '', avatar_url: '' });
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showMedia, setShowMedia] = useState(false);

  const load = () => API.get('/authors').then(r => setItems(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Name is required');
    setSaving(true);
    try {
      if (editing) {
        await API.put(`/authors/${editing}`, form);
        toast.success('Author updated');
      } else {
        await API.post('/authors', form);
        toast.success('Author created');
      }
      setForm({ name: '', bio: '', avatar_url: '' });
      setEditing(null);
      setShowForm(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving');
    }
    setSaving(false);
  };

  const handleEdit = (item) => {
    setEditing(item._id);
    setForm({ name: item.name, bio: item.bio || '', avatar_url: item.avatar_url || '' });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete author "${name}"?`)) return;
    await API.delete(`/authors/${id}`);
    toast.success('Deleted');
    load();
  };

  const handleCancel = () => {
    setForm({ name: '', bio: '', avatar_url: '' });
    setEditing(null);
    setShowForm(false);
  };

  const totalPosts = items.reduce((sum, i) => sum + (i.postCount || 0), 0);

  return (
    <div className="tax-wrap">
      {/* Header */}
      <div className="adm-page-header">
        <div>
          <h2 className="adm-page-title">Authors</h2>
          <p className="adm-page-sub">Manage blog authors</p>
        </div>
        {!showForm && (
          <button className="adm-btn-primary" onClick={() => setShowForm(true)}>+ Add Author</button>
        )}
      </div>

      {/* Analytics Cards */}
      <div className="tax-stats-row">
        <div className="tax-stat-card" style={{ '--c': '#7c3aed' }}>
          <div className="tax-stat-icon" style={{ background: '#f5f3ff' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="1.8" width="22" height="22"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
          <div>
            <div className="tax-stat-value">{items.length}</div>
            <div className="tax-stat-label">Total Authors</div>
          </div>
        </div>
        <div className="tax-stat-card" style={{ '--c': '#0891b2' }}>
          <div className="tax-stat-icon" style={{ background: '#ecfeff' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#0891b2" strokeWidth="1.8" width="22" height="22"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>
          </div>
          <div>
            <div className="tax-stat-value">{totalPosts}</div>
            <div className="tax-stat-label">Total Posts</div>
          </div>
        </div>
        <div className="tax-stat-card" style={{ '--c': '#d97706' }}>
          <div className="tax-stat-icon" style={{ background: '#fffbeb' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="1.8" width="22" height="22"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          </div>
          <div>
            <div className="tax-stat-value">{items.length > 0 ? Math.round(totalPosts / items.length) : 0}</div>
            <div className="tax-stat-label">Avg Posts / Author</div>
          </div>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="tax-form-card">
          <h3 className="tax-form-title">{editing ? 'Edit Author' : 'Add New Author'}</h3>
          <form onSubmit={handleSubmit} className="tax-form">
            <div className="tax-form-row">
              <div className="tax-field">
                <label>Name *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Author full name" />
              </div>
              <div className="tax-field tax-avatar-field">
                <label>Profile Image</label>
                <div className="tax-avatar-row">
                  {form.avatar_url
                    ? <img src={form.avatar_url} alt="avatar" className="tax-avatar-preview" />
                    : <div className="tax-avatar-placeholder">?</div>
                  }
                  <div className="tax-avatar-actions">
                    <button type="button" className="adm-btn-sm" onClick={() => setShowMedia(true)}>
                      Select from Media
                    </button>
                    {form.avatar_url && (
                      <button type="button" className="adm-btn-sm adm-btn-danger" onClick={() => setForm(f => ({ ...f, avatar_url: '' }))}>Remove</button>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="tax-field">
              <label>Bio</label>
              <textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} placeholder="Short author bio..." rows={3} />
            </div>
            <div className="tax-form-actions">
              <button type="submit" className="adm-btn-primary" disabled={saving}>{saving ? 'Saving...' : editing ? 'Update Author' : 'Add Author'}</button>
              <button type="button" className="adm-btn-sm" onClick={handleCancel}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {showMedia && (
        <MediaLibrary
          onSelect={(img) => { setForm(f => ({ ...f, avatar_url: img.url })); setShowMedia(false); }}
          onClose={() => setShowMedia(false)}
        />
      )}

      {/* Author Cards Grid */}
      <div className="author-grid">
        {items.map(item => (
          <div key={item._id} className="author-card">
            <div className="author-card-top">
              {item.avatar_url
                ? <img src={item.avatar_url} alt={item.name} className="author-avatar" />
                : <div className="author-avatar-placeholder">{item.name.charAt(0).toUpperCase()}</div>
              }
              <div className="author-card-info">
                <h4 className="author-name">{item.name}</h4>
                <span className="tax-count">{item.postCount || 0} posts</span>
              </div>
            </div>
            {item.bio && <p className="author-bio">{item.bio}</p>}
            <div className="author-card-actions">
              <button className="adm-icon-btn edit" onClick={() => handleEdit(item)} title="Edit">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="15" height="15"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
              <button className="adm-icon-btn delete" onClick={() => handleDelete(item._id, item.name)} title="Delete">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="15" height="15"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
              </button>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="tax-empty-state">No authors yet. Add your first one.</div>
        )}
      </div>
    </div>
  );
}