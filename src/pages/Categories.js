import React, { useEffect, useState } from 'react';
import API from '../api';
import toast from 'react-hot-toast';
import './Table.css';
import './TaxPage.css';

export default function Categories() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ name: '', slug: '', description: '' });
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = () => API.get('/categories').then(r => setItems(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const handleNameChange = (val) => {
    setForm(f => ({ ...f, name: val, slug: editing ? f.slug : slugify(val) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Name is required');
    setSaving(true);
    try {
      if (editing) {
        await API.put(`/categories/${editing}`, form);
        toast.success('Category updated');
      } else {
        await API.post('/categories', form);
        toast.success('Category created');
      }
      setForm({ name: '', slug: '', description: '' });
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
    setForm({ name: item.name, slug: item.slug || '', description: item.description || '' });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete category "${name}"?`)) return;
    await API.delete(`/categories/${id}`);
    toast.success('Deleted');
    load();
  };

  const handleCancel = () => {
    setForm({ name: '', slug: '', description: '' });
    setEditing(null);
    setShowForm(false);
  };

  const totalPosts = items.reduce((sum, i) => sum + (i.postCount || 0), 0);

  return (
    <div className="tax-wrap">
      {/* Header */}
      <div className="adm-page-header">
        <div>
          <h2 className="adm-page-title">Categories</h2>
          <p className="adm-page-sub">Manage blog categories</p>
        </div>
        {!showForm && (
          <button className="adm-btn-primary" onClick={() => setShowForm(true)}>+ Add Category</button>
        )}
      </div>

      {/* Analytics Cards */}
      <div className="tax-stats-row">
        <div className="tax-stat-card" style={{ '--c': '#2563eb' }}>
          <div className="tax-stat-icon" style={{ background: '#eff6ff' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.8" width="22" height="22"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
          </div>
          <div>
            <div className="tax-stat-value">{items.length}</div>
            <div className="tax-stat-label">Total Categories</div>
          </div>
        </div>
        <div className="tax-stat-card" style={{ '--c': '#16a34a' }}>
          <div className="tax-stat-icon" style={{ background: '#f0fdf4' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="1.8" width="22" height="22"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>
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
            <div className="tax-stat-label">Avg Posts / Category</div>
          </div>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="tax-form-card">
          <h3 className="tax-form-title">{editing ? 'Edit Category' : 'Add New Category'}</h3>
          <form onSubmit={handleSubmit} className="tax-form">
            <div className="tax-form-row">
              <div className="tax-field">
                <label>Name *</label>
                <input value={form.name} onChange={e => handleNameChange(e.target.value)} placeholder="e.g. Personal Finance" />
              </div>
              <div className="tax-field">
                <label>Slug</label>
                <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="auto-generated from name" />
              </div>
            </div>
            <div className="tax-field">
              <label>Description</label>
              <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Optional short description" />
            </div>
            <div className="tax-form-actions">
              <button type="submit" className="adm-btn-primary" disabled={saving}>{saving ? 'Saving...' : editing ? 'Update Category' : 'Add Category'}</button>
              <button type="button" className="adm-btn-sm" onClick={handleCancel}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Slug</th>
              <th>Description</th>
              <th>Posts</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={item._id}>
                <td style={{ color: '#94a3b8', fontSize: '0.78rem' }}>{idx + 1}</td>
                <td><strong style={{ color: '#0d2240' }}>{item.name}</strong></td>
                <td><code className="tax-slug">{item.slug}</code></td>
                <td style={{ color: '#6b7280', fontSize: '0.82rem' }}>{item.description || <span style={{ color: '#d1d5db' }}>—</span>}</td>
                <td>
                  <span className="tax-count">{item.postCount || 0} posts</span>
                </td>
                <td>
                  <div className="adm-table-actions">
                    <button className="adm-icon-btn edit" onClick={() => handleEdit(item)} title="Edit">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="15" height="15"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button className="adm-icon-btn delete" onClick={() => handleDelete(item._id, item.name)} title="Delete">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="15" height="15"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan="6" className="adm-empty">No categories yet. Add your first one.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}