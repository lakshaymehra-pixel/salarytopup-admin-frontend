import React, { useEffect, useRef, useState } from 'react';
import API from '../api';
import toast from 'react-hot-toast';
import './Table.css';
import './MediaPage.css';

export default function MediaPage() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const [meta, setMeta] = useState({ title: '', alt_text: '', caption: '' });
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef(null);

  const load = (p = 1) => {
    API.get(`/media?page=${p}&limit=30`).then(r => { setItems(r.data.items); setTotal(r.data.total); }).catch(() => {});
  };

  useEffect(() => { load(page); }, [page]);

  const handleSelect = (item) => {
    setSelected(item);
    setMeta({ title: item.title || '', alt_text: item.alt_text || '', caption: item.caption || '' });
  };

  const handleMetaSave = async () => {
    if (!selected) return;
    await API.put(`/media/${selected._id}`, meta);
    setItems(items.map(i => i._id === selected._id ? { ...i, ...meta } : i));
    setSelected(s => ({ ...s, ...meta }));
    toast.success('Saved');
  };

  const handleDelete = async () => {
    if (!selected || !window.confirm('Delete this image?')) return;
    await API.delete(`/media/${selected._id}`);
    setSelected(null);
    load(page);
    toast.success('Deleted');
  };

  const handleUpload = async (files) => {
    if (!files.length) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      try {
        const fd = new FormData();
        fd.append('image', file);
        fd.append('title', file.name.replace(/\.[^/.]+$/, ''));
        await API.post('/media/upload', fd);
        toast.success(`Uploaded: ${file.name}`);
      } catch { toast.error(`Failed: ${file.name}`); }
    }
    setUploading(false);
    load(1); setPage(1);
  };

  const formatSize = (b) => b > 1024 * 1024 ? (b / 1024 / 1024).toFixed(1) + ' MB' : Math.round(b / 1024) + ' KB';

  return (
    <div className="mp-wrap">
      <div className="adm-page-header">
        <div>
          <h2 className="adm-page-title">Media Library</h2>
          <p className="adm-page-sub">{total} files uploaded</p>
        </div>
        <button className="adm-btn-primary" onClick={() => fileRef.current.click()} disabled={uploading}>
          {uploading ? 'Uploading...' : '+ Upload Files'}
        </button>
        <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={e => handleUpload(e.target.files)} />
      </div>

      {/* Drop zone */}
      <div className={`mp-dropzone ${dragOver ? 'drag' : ''}`}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); handleUpload(e.dataTransfer.files); }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="28" height="28"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
        <span>Drop images here to upload · Recommended: <strong>1200×630px</strong></span>
      </div>

      <div className="mp-body">
        {/* Grid */}
        <div className="mp-grid-area">
          <div className="mp-grid">
            {items.map(item => (
              <div key={item._id} className={`mp-item ${selected?._id === item._id ? 'selected' : ''}`} onClick={() => handleSelect(item)}>
                <img src={item.url} alt={item.alt_text || item.title} />
                {selected?._id === item._id && <div className="mp-check">✓</div>}
              </div>
            ))}
            {items.length === 0 && <div className="mp-empty">No images yet. Upload your first image.</div>}
          </div>
          {total > 30 && (
            <div className="mp-pagination">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
              <span>Page {page} of {Math.ceil(total / 30)}</span>
              <button disabled={items.length < 30} onClick={() => setPage(p => p + 1)}>Next →</button>
            </div>
          )}
        </div>

        {/* Sidebar */}
        {selected && (
          <div className="mp-sidebar">
            <img src={selected.url} alt={selected.alt_text} className="mp-preview" />
            <div className="mp-info">
              {selected.width && <span>{selected.width} × {selected.height}px</span>}
              {selected.size && <span>{formatSize(selected.size)}</span>}
            </div>
            <div className="mp-field">
              <label>Title</label>
              <input value={meta.title} onChange={e => setMeta(m => ({ ...m, title: e.target.value }))} />
            </div>
            <div className="mp-field">
              <label>Alt Text <span className="mp-seo">SEO</span></label>
              <input value={meta.alt_text} onChange={e => setMeta(m => ({ ...m, alt_text: e.target.value }))} placeholder="Describe for search engines" />
            </div>
            <div className="mp-field">
              <label>Caption</label>
              <input value={meta.caption} onChange={e => setMeta(m => ({ ...m, caption: e.target.value }))} />
            </div>
            <div className="mp-field">
              <label>URL</label>
              <div className="mp-url-wrap">
                <input value={selected.url} readOnly />
                <button onClick={() => { navigator.clipboard.writeText(selected.url); toast.success('Copied!'); }}>Copy</button>
              </div>
            </div>
            <div className="mp-actions">
              <button className="adm-btn-primary" onClick={handleMetaSave}>Save</button>
              <button className="adm-btn-sm adm-btn-danger" onClick={handleDelete}>Delete</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}