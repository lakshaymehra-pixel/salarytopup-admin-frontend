import React, { useEffect, useState } from 'react';
import API from '../../api';
import toast from 'react-hot-toast';
import './MetaTagsManager.css';

const ROBOTS_OPTIONS = ['index,follow', 'noindex,nofollow', 'noindex,follow', 'index,nofollow'];

function lenColor(val, min, max) {
  if (!val) return '#ef4444';
  if (val.length >= min && val.length <= max) return '#16a34a';
  if (val.length < min) return '#f59e0b';
  return '#ef4444';
}

function SerpPreview({ title, description, url }) {
  return (
    <div className="mtm-serp">
      <div className="mtm-serp-url">{url || 'https://salarytopup.com/page'}</div>
      <div className="mtm-serp-title">{title || 'Page Title — Salary Topup'}</div>
      <div className="mtm-serp-desc">{description || 'Page meta description will appear here...'}</div>
    </div>
  );
}

export default function MetaTagsManager() {
  const [tags, setTags] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (typeFilter) params.set('type', typeFilter);
    API.get(`/seo/meta-tags?${params}`).then(r => {
      setTags(r.data.tags);
      setTotal(r.data.total);
    }).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [search, typeFilter]);

  const sync = async () => {
    setSyncing(true);
    try {
      const r = await API.post('/seo/meta-tags/sync');
      toast.success(r.data.message);
      load();
    } catch { toast.error('Sync failed'); }
    setSyncing(false);
  };

  const openEdit = (tag) => {
    setSelected(tag);
    setForm({
      metaTitle: tag.metaTitle || '',
      metaDescription: tag.metaDescription || '',
      ogTitle: tag.ogTitle || '',
      ogDescription: tag.ogDescription || '',
      ogImage: tag.ogImage || '',
      canonicalUrl: tag.canonicalUrl || '',
      robotsDirective: tag.robotsDirective || 'index,follow',
    });
  };

  const save = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await API.put(`/seo/meta-tags/${selected.slug}`, form);
      toast.success('Meta tags saved!');
      setTags(prev => prev.map(t => t.slug === selected.slug ? { ...t, ...form } : t));
      setSelected(null);
    } catch { toast.error('Save failed'); }
    setSaving(false);
  };

  const getStatus = (tag) => {
    if (!tag.metaTitle || !tag.metaDescription) return 'incomplete';
    if (tag.metaTitle.length < 30 || tag.metaTitle.length > 70) return 'warning';
    if (tag.metaDescription.length < 100 || tag.metaDescription.length > 165) return 'warning';
    return 'complete';
  };

  const STATUS = { complete: { label: 'Complete', color: '#16a34a', bg: '#f0fdf4' }, warning: { label: 'Review', color: '#f59e0b', bg: '#fffbeb' }, incomplete: { label: 'Incomplete', color: '#ef4444', bg: '#fef2f2' } };

  return (
    <div className="mtm-wrap">
      <div className="adm-page-header">
        <div>
          <h2 className="adm-page-title">Meta Tags Manager</h2>
          <p className="adm-page-sub">Manage SEO meta tags for all pages and blog posts</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="adm-btn-secondary" onClick={sync} disabled={syncing}>{syncing ? 'Syncing...' : '↻ Sync Pages'}</button>
        </div>
      </div>

      <div className="mtm-filters">
        <input className="kr-search" placeholder="Search pages..." value={search} onChange={e => setSearch(e.target.value)} />
        <select className="kr-select" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="">All Types</option>
          <option value="blog">Blog Posts</option>
          <option value="page">CMS Pages</option>
          <option value="custom">Custom</option>
        </select>
        <div className="mtm-total">{total} total pages</div>
      </div>

      {/* Summary Stats */}
      <div className="mtm-stats-row">
        {['complete', 'warning', 'incomplete'].map(s => (
          <div key={s} className="mtm-stat" style={{ borderColor: STATUS[s].color + '40', background: STATUS[s].bg }}>
            <span className="mtm-stat-val" style={{ color: STATUS[s].color }}>{tags.filter(t => getStatus(t) === s).length}</span>
            <span className="mtm-stat-lbl" style={{ color: STATUS[s].color }}>{STATUS[s].label}</span>
          </div>
        ))}
      </div>

      {loading ? <div className="seo-loading">Loading...</div> : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Page</th>
                <th>Type</th>
                <th>Meta Title</th>
                <th>Meta Description</th>
                <th>Robots</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {tags.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', color: '#94a3b8', padding: 40 }}>
                  No pages yet. Click "Sync Pages" to import all blogs and CMS pages.
                </td></tr>
              ) : tags.map(tag => {
                const st = getStatus(tag);
                return (
                  <tr key={tag._id}>
                    <td style={{ maxWidth: 180 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#0d2240' }}>{tag.pageTitle || tag.slug}</div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{tag.slug}</div>
                    </td>
                    <td><span className="mtm-type-badge">{tag.pageType}</span></td>
                    <td>
                      <div style={{ fontSize: '0.82rem', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {tag.metaTitle || <span style={{ color: '#ef4444' }}>Missing</span>}
                      </div>
                      {tag.metaTitle && <div style={{ fontSize: '0.7rem', color: lenColor(tag.metaTitle, 30, 70) }}>{tag.metaTitle.length} chars</div>}
                    </td>
                    <td>
                      <div style={{ fontSize: '0.82rem', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {tag.metaDescription || <span style={{ color: '#ef4444' }}>Missing</span>}
                      </div>
                      {tag.metaDescription && <div style={{ fontSize: '0.7rem', color: lenColor(tag.metaDescription, 100, 165) }}>{tag.metaDescription.length} chars</div>}
                    </td>
                    <td style={{ fontSize: '0.78rem', color: '#64748b' }}>{tag.robotsDirective}</td>
                    <td>
                      <span className="mtm-status-badge" style={{ background: STATUS[st].bg, color: STATUS[st].color }}>
                        {STATUS[st].label}
                      </span>
                    </td>
                    <td>
                      <button className="adm-btn-xs" onClick={() => openEdit(tag)}>Edit</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Drawer */}
      {selected && (
        <div className="kr-drawer-overlay" onClick={() => setSelected(null)}>
          <div className="kr-drawer" style={{ width: 500 }} onClick={e => e.stopPropagation()}>
            <div className="kr-drawer-header">
              <span>Edit Meta Tags</span>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}>×</button>
            </div>
            <div style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: 16 }}>{selected.pageTitle || selected.slug}</div>

            {/* SERP Preview */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#374151', marginBottom: 6 }}>Google Preview</div>
              <SerpPreview title={form.metaTitle} description={form.metaDescription} url={form.canonicalUrl || `https://salarytopup.com/${selected.slug}`} />
            </div>

            <div className="kr-drawer-body">
              <div className="kr-field">
                <label>Meta Title <span style={{ color: lenColor(form.metaTitle, 30, 70) }}>({form.metaTitle?.length || 0}/60)</span></label>
                <input value={form.metaTitle} onChange={e => setForm(p => ({ ...p, metaTitle: e.target.value }))} placeholder="Page title for Google..." />
              </div>
              <div className="kr-field">
                <label>Meta Description <span style={{ color: lenColor(form.metaDescription, 100, 165) }}>({form.metaDescription?.length || 0}/160)</span></label>
                <textarea value={form.metaDescription} onChange={e => setForm(p => ({ ...p, metaDescription: e.target.value }))} placeholder="Short description for Google..." rows={3} style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8, resize: 'vertical', fontFamily: 'inherit', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div className="kr-field">
                <label>OG Title</label>
                <input value={form.ogTitle} onChange={e => setForm(p => ({ ...p, ogTitle: e.target.value }))} placeholder="Open Graph title (social sharing)" />
              </div>
              <div className="kr-field">
                <label>OG Description</label>
                <input value={form.ogDescription} onChange={e => setForm(p => ({ ...p, ogDescription: e.target.value }))} placeholder="Open Graph description" />
              </div>
              <div className="kr-field">
                <label>OG Image URL</label>
                <input value={form.ogImage} onChange={e => setForm(p => ({ ...p, ogImage: e.target.value }))} placeholder="https://..." />
              </div>
              <div className="kr-field">
                <label>Canonical URL</label>
                <input value={form.canonicalUrl} onChange={e => setForm(p => ({ ...p, canonicalUrl: e.target.value }))} placeholder="https://salarytopup.com/page" />
              </div>
              <div className="kr-field">
                <label>Robots Directive</label>
                <select value={form.robotsDirective} onChange={e => setForm(p => ({ ...p, robotsDirective: e.target.value }))}>
                  {ROBOTS_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <button className="adm-btn-primary" style={{ width: '100%' }} onClick={save} disabled={saving}>
                {saving ? 'Saving...' : 'Save Meta Tags'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}