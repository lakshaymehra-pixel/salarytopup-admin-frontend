import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../api';
import toast from 'react-hot-toast';
import MediaLibrary from '../components/MediaLibrary';
import './BlogForm.css';

// ─── Rich Text Editor ────────────────────────────────────────────────────────
function RichEditor({ value, onChange, resetKey }) {
  const ref = useRef(null);
  const loaded = useRef(false);

  useEffect(() => {
    loaded.current = false;
  }, [resetKey]);

  useEffect(() => {
    if (ref.current && value && !loaded.current) {
      ref.current.innerHTML = value;
      loaded.current = true;
    }
  }, [value, resetKey]);

  const exec = (cmd, arg) => { document.execCommand(cmd, false, arg || null); ref.current.focus(); onChange(ref.current.innerHTML); };
  const block = (tag) => { document.execCommand('formatBlock', false, tag); ref.current.focus(); onChange(ref.current.innerHTML); };

  const insertLink = () => {
    const url = prompt('Enter URL (https://...):');
    if (url) exec('createLink', url);
  };

  const insertImage = () => {
    const url = prompt('Enter image URL:');
    if (url) exec('insertImage', url);
  };

  const TOOLS = [
    { label: 'H1', action: () => block('h1') },
    { label: 'H2', action: () => block('h2') },
    { label: 'H3', action: () => block('h3') },
    { label: 'H4', action: () => block('h4') },
    { label: '|' },
    { label: <b>B</b>, action: () => exec('bold') },
    { label: <i>I</i>, action: () => exec('italic') },
    { label: <u>U</u>, action: () => exec('underline') },
    { label: <s>S</s>, action: () => exec('strikeThrough') },
    { label: '|' },
    { label: '• List', action: () => exec('insertUnorderedList') },
    { label: '1. List', action: () => exec('insertOrderedList') },
    { label: '|' },
    { label: 'Link', action: insertLink },
    { label: 'Image', action: insertImage },
    { label: '|' },
    { label: 'Quote', action: () => block('blockquote') },
    { label: 'Code', action: () => block('pre') },
    { label: '|' },
    { label: 'Clear', action: () => exec('removeFormat') },
  ];

  const wordCount = (html) => {
    const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    return text ? text.split(' ').length : 0;
  };

  const readingTime = (html) => {
    const words = wordCount(html);
    return Math.max(1, Math.ceil(words / 200));
  };

  const current = ref.current ? ref.current.innerHTML : value || '';

  return (
    <div className="re-wrap">
      <div className="re-toolbar">
        {TOOLS.map((t, i) =>
          t.label === '|'
            ? <span key={i} className="re-sep" />
            : <button key={i} type="button" className="re-btn" onMouseDown={e => { e.preventDefault(); t.action(); }}>{t.label}</button>
        )}
      </div>
      <div
        ref={ref}
        className="re-body"
        contentEditable
        suppressContentEditableWarning
        onInput={() => onChange(ref.current.innerHTML)}
      />
      <div className="re-footer">
        <span>{wordCount(value || '')} words</span>
        <span>~{readingTime(value || '')} min read</span>
      </div>
    </div>
  );
}

// ─── HTML Paste Modal ─────────────────────────────────────────────────────────
function HtmlModal({ onClose, onApply, currentHtml }) {
  const [html, setHtml] = useState(currentHtml || '');
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Edit HTML Code</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <textarea className="modal-textarea" value={html} onChange={e => setHtml(e.target.value)} placeholder="Paste your HTML here..." />
        <div className="modal-actions">
          <button className="adm-btn-secondary" onClick={onClose}>Cancel</button>
          <button className="adm-btn-primary" onClick={() => { onApply(html); onClose(); }}>Apply HTML</button>
        </div>
      </div>
    </div>
  );
}

// ─── Main BlogForm ─────────────────────────────────────────────────────────────
export default function BlogForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [authors, setAuthors] = useState([]);

  useEffect(() => {
    API.get('/categories').then(r => setCategories(r.data.map(c => c.name))).catch(() => {});
    API.get('/authors').then(r => setAuthors(r.data.map(a => a.name))).catch(() => {});
  }, []);

  const [form, setForm] = useState({
    title: '', slug: '', category: 'Finance', author: 'SalaryTopUp Team',
    short_description: '', long_description: '', status: 'draft',
    meta_title: '', meta_description: '', focus_keyword: '', tags: '',
    image_alt: '',
  });
  const [faqs, setFaqs] = useState([]);
  const [scheduledAt, setScheduledAt] = useState('');
  const minDateTime = React.useRef(new Date().toISOString().slice(0,16)).current;
  const [imagePreview, setImagePreview] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const [loading, setLoading] = useState(false);
  const [showHtml, setShowHtml] = useState(false);
  const [showMedia, setShowMedia] = useState(false);
  const [editorKey, setEditorKey] = useState(0);

  useEffect(() => {
    if (id) {
      API.get(`/blogs/${id}`).then(r => {
        const d = r.data;
        setForm({
          title: d.title || '',
          slug: d.slug || '',
          category: d.category || 'Finance',
          author: d.author || 'SalaryTopUp Team',
          short_description: d.short_description || '',
          long_description: d.long_description || '',
          status: d.status || 'draft',
          meta_title: d.meta_title || '',
          meta_description: d.meta_description || '',
          focus_keyword: d.focus_keyword || '',
          tags: Array.isArray(d.tags) ? d.tags.join(', ') : (d.tags || ''),
          image_alt: d.image_alt || '',
        });
        setImagePreview(d.banner_image_url || '');
        setImageAlt(d.image_alt || '');
        setFaqs(Array.isArray(d.faqs) ? d.faqs : []);
        if (d.scheduled_at) {
          const dt = new Date(d.scheduled_at);
          const local = new Date(dt.getTime() - dt.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
          setScheduledAt(local);
        } else {
          setScheduledAt('');
        }
      }).catch(() => {});
    }
  }, [id]);

  const stopWords = new Set(['a','an','the','and','or','in','on','at','to','for','of','with','is','are','was','were','be','by','from','get','how','why','what','this','that','these','those','can','will','do','did','has','have','had','but','not','its','your','our']);
  const autoSlug = (title) => title.toLowerCase().split(/\s+/).filter(w => w.length > 1 && !stopWords.has(w)).join('-').replace(/[^a-z0-9-]+/g, '').replace(/(^-|-$)/g, '');

  const handleTitle = (val) => {
    setForm(f => ({
      ...f,
      title: val,
      slug: f.slug || autoSlug(val),
      meta_title: f.meta_title || val.substring(0, 60),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.long_description || form.long_description === '<br>') {
      return toast.error('Content is required');
    }
    setLoading(true);
    try {
      let payload = {
        ...form,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        banner_image_url: imagePreview,
        thumb_image_url: imagePreview,
        image_alt: imageAlt,
        faqs: faqs.filter(f => f.question.trim() && f.answer.trim()),
        scheduled_at: form.status === 'scheduled' && scheduledAt ? new Date(scheduledAt).toISOString() : null,
        // scheduledAt is local time from datetime-local input, new Date() converts correctly
      };
      if (id) { await API.put(`/blogs/${id}`, payload); toast.success('Blog updated!'); }
      else { await API.post('/blogs', payload); toast.success('Blog published!'); }
      navigate('/blogs');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving blog');
    } finally { setLoading(false); }
  };

  const autoGenerateSEO = () => {
    const title = form.title || '';
    const plainText = (form.long_description || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    const shortDesc = form.short_description || '';

    // Meta title: title + brand, max 60 chars
    const metaTitle = (title + ' | SalaryTopUp').substring(0, 60);

    // Meta description: first 155 chars of short_desc or content
    const descSource = shortDesc || plainText;
    const metaDesc = descSource.substring(0, 155).trim() + (descSource.length > 155 ? '...' : '');

    // Focus keyword: first 3 words of title
    const focusKeyword = title.toLowerCase().split(' ').slice(0, 3).join(' ');

    // Tags: extract key words from title
    const stopWords = ['a','an','the','and','or','in','on','at','to','for','of','with','how','why','what','is','are','was','were','be','been','by','from','get','your','our','you'];
    const tags = title.toLowerCase().split(/\s+/).filter(w => w.length > 3 && !stopWords.includes(w)).slice(0, 6).join(', ');

    setForm(f => ({
      ...f,
      meta_title: metaTitle,
      meta_description: metaDesc,
      focus_keyword: f.focus_keyword || focusKeyword,
      tags: f.tags || tags,
    }));
    toast.success('SEO fields auto-generated!');
  };

  const metaTitleLen = form.meta_title.length;
  const metaDescLen = form.meta_description.length;

  return (
    <div>
      {showMedia && (
        <MediaLibrary
          onClose={() => setShowMedia(false)}
          onSelect={({ url, alt }) => { setImagePreview(url); setImageAlt(alt); }}
        />
      )}

      {showHtml && (
        <HtmlModal
          onClose={() => setShowHtml(false)}
          onApply={(html) => { setForm(f => ({ ...f, long_description: html })); setEditorKey(k => k + 1); }}
          currentHtml={form.long_description}
        />
      )}

      <div className="adm-page-header">
        <div>
          <h2 className="adm-page-title">{id ? 'Edit Blog' : 'New Blog'}</h2>
          <p className="adm-page-sub">{id ? 'Update and republish your blog post' : 'Create a new blog post'}</p>
        </div>
        <button className="adm-btn-secondary" onClick={() => navigate('/blogs')}>← Back</button>
      </div>

      <form onSubmit={handleSubmit} className="bf-grid">

        {/* ── LEFT COLUMN ── */}
        <div className="bf-main">

          {/* Basic Info */}
          <div className="adm-card bf-section">
            <div className="bf-section-title">Basic Information</div>
            <div className="adm-field">
              <label>Title *</label>
              <input value={form.title} onChange={e => handleTitle(e.target.value)} required placeholder="Enter blog title..." />
            </div>
            <div className="adm-field">
              <label>URL Slug</label>
              <div className="bf-slug-wrap">
                <span className="bf-slug-prefix">/blog/</span>
                <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="url-slug-here" />
              </div>
            </div>
          </div>

          {/* Content Editor */}
          <div className="adm-card bf-section">
            <div className="bf-section-header">
              <span className="bf-section-title">Content *</span>
              <button type="button" className="adm-btn-secondary bf-html-btn" onClick={() => setShowHtml(true)}>
                &lt;/&gt; Paste HTML
              </button>
            </div>
            <RichEditor value={form.long_description} onChange={val => setForm(f => ({ ...f, long_description: val }))} resetKey={editorKey} />
          </div>

          {/* SEO */}
          <div className="adm-card bf-section">
            <div className="bf-section-header">
              <span className="bf-section-title">SEO Settings</span>
              <button type="button" className="adm-btn-primary bf-html-btn" onClick={autoGenerateSEO}>
                Auto Generate SEO
              </button>
            </div>

            <div className="adm-field">
              <label>
                Meta Title
                <span className={`bf-char ${metaTitleLen > 60 ? 'bf-char-over' : metaTitleLen > 50 ? 'bf-char-ok' : 'bf-char-low'}`}>
                  {metaTitleLen}/60
                </span>
              </label>
              <input value={form.meta_title} onChange={e => setForm(f => ({ ...f, meta_title: e.target.value }))} placeholder="Best Salary Loans in India 2026 | SalaryTopUp" maxLength={70} />
              <div className="bf-seo-preview-bar" style={{ width: `${Math.min(100, (metaTitleLen / 60) * 100)}%`, background: metaTitleLen > 60 ? '#ef4444' : metaTitleLen > 50 ? '#22c55e' : '#f59e0b' }} />
            </div>

            <div className="adm-field">
              <label>
                Meta Description
                <span className={`bf-char ${metaDescLen > 160 ? 'bf-char-over' : metaDescLen > 120 ? 'bf-char-ok' : 'bf-char-low'}`}>
                  {metaDescLen}/160
                </span>
              </label>
              <textarea rows="3" value={form.meta_description} onChange={e => setForm(f => ({ ...f, meta_description: e.target.value }))} placeholder="Click-worthy description that shows in Google search results..." maxLength={180} />
              <div className="bf-seo-preview-bar" style={{ width: `${Math.min(100, (metaDescLen / 160) * 100)}%`, background: metaDescLen > 160 ? '#ef4444' : metaDescLen > 120 ? '#22c55e' : '#f59e0b' }} />
            </div>

            <div className="adm-field">
              <label>Focus Keyword <span className="bf-hint">(main keyword to rank for)</span></label>
              <input value={form.focus_keyword} onChange={e => setForm(f => ({ ...f, focus_keyword: e.target.value }))} placeholder="e.g. salary advance loan" />
            </div>

            <div className="adm-field">
              <label>Tags <span className="bf-hint">(comma separated, 3–8 tags)</span></label>
              <input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="salary loan, instant loan, emergency fund, finance tips" />
            </div>

            {/* FAQs */}
            <div className="adm-card bf-section" style={{marginTop: 16}}>
              <div className="bf-section-title">FAQs <span className="bf-hint">(optional — shown on blog page)</span></div>
              {faqs.map((faq, i) => (
                <div key={i} style={{marginBottom: 12, background: '#f8fafc', borderRadius: 8, padding: '12px 14px', position: 'relative'}}>
                  <input
                    placeholder={`Question ${i + 1}`}
                    value={faq.question}
                    onChange={e => { const n = [...faqs]; n[i].question = e.target.value; setFaqs(n); }}
                    style={{width: '100%', marginBottom: 8, padding: '8px 10px', border: '1px solid #dde3ec', borderRadius: 6, fontSize: 13}}
                  />
                  <textarea
                    placeholder="Answer"
                    value={faq.answer}
                    rows={3}
                    onChange={e => { const n = [...faqs]; n[i].answer = e.target.value; setFaqs(n); }}
                    style={{width: '100%', padding: '8px 10px', border: '1px solid #dde3ec', borderRadius: 6, fontSize: 13, resize: 'vertical'}}
                  />
                  <button type="button" onClick={() => setFaqs(faqs.filter((_, j) => j !== i))}
                    style={{position: 'absolute', top: 10, right: 10, background: '#fee2e2', border: 'none', borderRadius: 6, padding: '3px 8px', color: '#ef4444', cursor: 'pointer', fontSize: 13}}>
                    ✕
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => setFaqs([...faqs, { question: '', answer: '' }])}
                style={{padding: '8px 16px', background: '#1a3d65', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600}}>
                + Add FAQ
              </button>
            </div>

            {/* Google Preview */}
            {(form.meta_title || form.title) && (
              <div className="bf-google-preview">
                <div className="bf-gp-label">Google Preview</div>
                <div className="bf-gp-url">salarytopup.com › blog › {form.slug || 'your-post-slug'}</div>
                <div className="bf-gp-title">{form.meta_title || form.title}</div>
                <div className="bf-gp-desc">{form.meta_description || form.short_description || 'Meta description will appear here...'}</div>
              </div>
            )}
          </div>

        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="bf-side">

          {/* Publish */}
          <div className="adm-card bf-section">
            <div className="bf-section-title">Publish</div>
            <div className="adm-field">
              <label>Status</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="scheduled">Scheduled</option>
              </select>
            </div>
            {form.status === 'scheduled' && (
              <div className="adm-field">
                <label>📅 Schedule Date & Time</label>
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  min={minDateTime}
                  onChange={e => setScheduledAt(e.target.value)}
                  style={{width:'100%', padding:'8px 10px', border:'1.5px solid #26b9db', borderRadius:8, fontSize:13}}
                />
                <small style={{color:'#888', fontSize:11}}>Blog will auto-publish at this date & time</small>
              </div>
            )}
            <div className="adm-field">
              <label>Category</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                {categories.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="adm-field">
              <label>Author</label>
              <select value={form.author} onChange={e => setForm(f => ({ ...f, author: e.target.value }))}>
                <option value="">-- Select Author --</option>
                {authors.map(a => <option key={a}>{a}</option>)}
              </select>
            </div>
            <button type="submit" className="adm-btn-primary bf-submit" disabled={loading}>
              {loading ? 'Saving...' : (id ? 'Update Blog' : 'Publish Blog')}
            </button>
          </div>

          {/* Featured Image */}
          <div className="adm-card bf-section">
            <div className="bf-section-title">Featured Image</div>
            {imagePreview ? (
              <div className="bf-img-preview-wrap">
                <img src={imagePreview} alt="Featured" className="bf-img-preview" />
                <div className="bf-img-actions">
                  <button type="button" className="bf-img-change" onClick={() => setShowMedia(true)}>Change Image</button>
                  <button type="button" className="bf-img-remove" onClick={() => { setImagePreview(''); setImageAlt(''); }}>✕ Remove</button>
                </div>
              </div>
            ) : (
              <button type="button" className="bf-img-upload" onClick={() => setShowMedia(true)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="32" height="32"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                <span>Set Featured Image</span>
                <span className="bf-img-hint">1200 × 630px recommended</span>
              </button>
            )}
            <div className="adm-field" style={{ marginTop: '12px' }}>
              <label>Alt Text <span className="bf-hint">(SEO)</span></label>
              <input value={imageAlt} onChange={e => setImageAlt(e.target.value)} placeholder="Describe the image..." />
            </div>
          </div>

        </div>
      </form>
    </div>
  );
}