import React, { useEffect, useRef, useState } from 'react';
import API from '../api';
import toast from 'react-hot-toast';
import './MediaLibrary.css';

export default function MediaLibrary({ onSelect, onClose }) {
  const [tab, setTab] = useState('library'); // 'library' | 'upload'
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [meta, setMeta] = useState({ title: '', alt_text: '', caption: '' });
  const fileRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadPreview, setUploadPreview] = useState('');

  const load = (p = 1) => {
    setLoading(true);
    API.get(`/media?page=${p}&limit=24`)
      .then(r => { setItems(r.data.items); setTotal(r.data.total); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { load(page); }, [page]);

  const handleSelect = (item) => {
    setSelected(item);
    setMeta({ title: item.title || '', alt_text: item.alt_text || '', caption: item.caption || '' });
  };

  const handleMetaSave = async () => {
    if (!selected) return;
    try {
      await API.put(`/media/${selected._id}`, meta);
      setItems(items.map(i => i._id === selected._id ? { ...i, ...meta } : i));
      setSelected(s => ({ ...s, ...meta }));
      toast.success('Saved');
    } catch { toast.error('Error saving'); }
  };

  const handleInsert = () => {
    if (!selected) return;
    onSelect({ url: selected.url, alt: selected.alt_text || selected.title || '' });
    onClose();
  };

  const handleFilePick = (file) => {
    if (!file) return;
    setUploadFile(file);
    setUploadPreview(URL.createObjectURL(file));
    setMeta({ title: file.name.replace(/\.[^/.]+$/, ''), alt_text: '', caption: '' });
  };

  const handleUpload = async () => {
    if (!uploadFile) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', uploadFile);
      fd.append('title', meta.title);
      fd.append('alt_text', meta.alt_text);
      fd.append('caption', meta.caption);
      const r = await API.post('/media/upload', fd);
      toast.success('Image uploaded!');
      setUploadFile(null);
      setUploadPreview('');
      setTab('library');
      load(1);
      setSelected(r.data);
      setMeta({ title: r.data.title, alt_text: r.data.alt_text, caption: r.data.caption });
    } catch { toast.error('Upload failed'); }
    finally { setUploading(false); }
  };

  const formatSize = (bytes) => {
    if (!bytes) return '';
    if (bytes > 1024 * 1024) return (bytes / 1024 / 1024).toFixed(1) + ' MB';
    return (bytes / 1024).toFixed(0) + ' KB';
  };

  return (
    <div className="ml-overlay" onClick={onClose}>
      <div className="ml-modal" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="ml-header">
          <h2 className="ml-title">Insert Media</h2>
          <button className="ml-close" onClick={onClose}>✕</button>
        </div>

        {/* Tabs */}
        <div className="ml-tabs">
          <button className={`ml-tab ${tab === 'upload' ? 'active' : ''}`} onClick={() => setTab('upload')}>Upload Files</button>
          <button className={`ml-tab ${tab === 'library' ? 'active' : ''}`} onClick={() => { setTab('library'); load(page); }}>Media Library</button>
        </div>

        <div className="ml-body">

          {/* ── UPLOAD TAB ── */}
          {tab === 'upload' && (
            <div className="ml-upload-area">
              {!uploadPreview ? (
                <div
                  className={`ml-dropzone ${dragOver ? 'drag' : ''}`}
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={e => { e.preventDefault(); setDragOver(false); handleFilePick(e.dataTransfer.files[0]); }}
                  onClick={() => fileRef.current.click()}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="48" height="48"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  <p>Drop files here or <strong>click to upload</strong></p>
                  <p className="ml-dz-hint">Recommended: <strong>1200 × 630px</strong> (ratio 1.91:1) · Max 10MB</p>
                  <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleFilePick(e.target.files[0])} />
                </div>
              ) : (
                <div className="ml-upload-preview-wrap">
                  <div className="ml-upload-img-side">
                    <img src={uploadPreview} alt="preview" className="ml-upload-img" />
                    <button className="ml-remove-img" onClick={() => { setUploadFile(null); setUploadPreview(''); }}>✕ Remove</button>
                  </div>
                  <div className="ml-upload-meta-side">
                    <div className="ml-meta-field">
                      <label>Title</label>
                      <input value={meta.title} onChange={e => setMeta(m => ({ ...m, title: e.target.value }))} placeholder="Image title" />
                    </div>
                    <div className="ml-meta-field">
                      <label>Alt Text <span className="ml-seo-tag">SEO</span></label>
                      <input value={meta.alt_text} onChange={e => setMeta(m => ({ ...m, alt_text: e.target.value }))} placeholder="Describe the image for search engines" />
                    </div>
                    <div className="ml-meta-field">
                      <label>Caption</label>
                      <input value={meta.caption} onChange={e => setMeta(m => ({ ...m, caption: e.target.value }))} placeholder="Optional caption" />
                    </div>
                    <div className="ml-size-tip">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                      Best size: 1200 × 630px for SEO & social sharing
                    </div>
                    <button className="ml-upload-btn" onClick={handleUpload} disabled={uploading}>
                      {uploading ? 'Uploading...' : 'Upload Image'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── LIBRARY TAB ── */}
          {tab === 'library' && (
            <div className="ml-library">
              <div className="ml-grid-wrap">
                {loading && <div className="ml-loading">Loading...</div>}
                <div className="ml-grid">
                  {items.map(item => (
                    <div
                      key={item._id}
                      className={`ml-item ${selected?._id === item._id ? 'selected' : ''}`}
                      onClick={() => handleSelect(item)}
                    >
                      <img src={item.url} alt={item.alt_text || item.title} />
                      {selected?._id === item._id && <div className="ml-check">✓</div>}
                    </div>
                  ))}
                  {items.length === 0 && !loading && <div className="ml-empty">No images uploaded yet</div>}
                </div>
                {total > 24 && (
                  <div className="ml-pagination">
                    <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
                    <span>Page {page} of {Math.ceil(total / 24)}</span>
                    <button disabled={items.length < 24} onClick={() => setPage(p => p + 1)}>Next →</button>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              {selected && (
                <div className="ml-sidebar">
                  <div className="ml-sidebar-img">
                    <img src={selected.url} alt={selected.alt_text} />
                  </div>
                  <div className="ml-sidebar-info">
                    {selected.width && <span>{selected.width} × {selected.height}px</span>}
                    {selected.size && <span>{formatSize(selected.size)}</span>}
                  </div>
                  <div className="ml-meta-field">
                    <label>Title</label>
                    <input value={meta.title} onChange={e => setMeta(m => ({ ...m, title: e.target.value }))} />
                  </div>
                  <div className="ml-meta-field">
                    <label>Alt Text <span className="ml-seo-tag">SEO</span></label>
                    <input value={meta.alt_text} onChange={e => setMeta(m => ({ ...m, alt_text: e.target.value }))} />
                  </div>
                  <div className="ml-meta-field">
                    <label>Caption</label>
                    <input value={meta.caption} onChange={e => setMeta(m => ({ ...m, caption: e.target.value }))} />
                  </div>
                  <button className="ml-save-btn" onClick={handleMetaSave}>Save Details</button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="ml-footer">
          <button className="ml-cancel-btn" onClick={onClose}>Cancel</button>
          {selected && (
            <button className="ml-insert-btn" onClick={handleInsert}>
              Set Featured Image
            </button>
          )}
        </div>
      </div>
    </div>
  );
}