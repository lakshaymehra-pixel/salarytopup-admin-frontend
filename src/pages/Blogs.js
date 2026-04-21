import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import toast from 'react-hot-toast';
import './Table.css';
import './Blogs.css';

export default function Blogs() {
  const [blogs, setBlogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState({ total: 0, published: 0, draft: 0 });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  const [author, setAuthor] = useState('');
  const [categoryList, setCategoryList] = useState([]);
  const [authorList, setAuthorList] = useState([]);
  const [deleteId, setDeleteId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    API.get('/categories').then(r => setCategoryList(r.data.map(c => c.name))).catch(() => {});
    API.get('/authors').then(r => setAuthorList(r.data.map(a => a.name))).catch(() => {});
  }, []);

  const load = () => {
    const params = new URLSearchParams({ page, limit: 10 });
    if (search) params.append('search', search);
    if (status) params.append('status', status);
    if (category) params.append('category', category);
    if (author) params.append('author', author);
    API.get(`/blogs?${params}`)
      .then(r => {
        setBlogs(r.data.blogs);
        setTotal(r.data.total);
        setStats({ total: r.data.total, published: r.data.published ?? 0, draft: r.data.draft ?? 0 });
      })
      .catch(() => {});
  };

  useEffect(() => { load(); }, [page, search, status, category, author]);

  const handleDelete = async () => {
    await API.delete(`/blogs/${deleteId}`);
    toast.success('Blog deleted');
    setDeleteId(null);
    load();
  };

  const toggleStatus = async (blog) => {
    const newStatus = blog.status === 'published' ? 'draft' : 'published';
    await API.put(`/blogs/${blog._id}`, { status: newStatus });
    toast.success(`Blog ${newStatus}`);
    load();
  };

  const clearFilters = () => {
    setSearch(''); setStatus(''); setCategory(''); setAuthor(''); setPage(1);
  };

  const hasFilters = search || status || category || author;

  return (
    <div>
      <div className="adm-page-header">
        <div>
          <h2 className="adm-page-title">Blogs</h2>
          <p className="adm-page-sub">Manage all your blog posts</p>
        </div>
        <button className="adm-btn-primary" onClick={() => navigate('/blogs/new')}>+ New Blog</button>
      </div>

      {/* ── Analytics Bar ── */}
      <div className="bl-stats-row">
        <div className={`bl-stat-card ${!status ? 'active' : ''}`} onClick={() => { setStatus(''); setPage(1); }}>
          <div className="bl-stat-icon bl-icon-total">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>
          </div>
          <div>
            <div className="bl-stat-num">{total}</div>
            <div className="bl-stat-label">Total Posts</div>
          </div>
        </div>
        <div className={`bl-stat-card ${status === 'published' ? 'active' : ''}`} onClick={() => { setStatus('published'); setPage(1); }}>
          <div className="bl-stat-icon bl-icon-pub">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          </div>
          <div>
            <div className="bl-stat-num">{stats.published}</div>
            <div className="bl-stat-label">Published</div>
          </div>
        </div>
        <div className={`bl-stat-card ${status === 'draft' ? 'active' : ''}`} onClick={() => { setStatus('draft'); setPage(1); }}>
          <div className="bl-stat-icon bl-icon-draft">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </div>
          <div>
            <div className="bl-stat-num">{stats.draft}</div>
            <div className="bl-stat-label">Draft</div>
          </div>
        </div>
        <div className="bl-stat-card bl-stat-total-right">
          <div className="bl-stat-icon bl-icon-pages">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
          </div>
          <div>
            <div className="bl-stat-num">{Math.ceil(total / 10)}</div>
            <div className="bl-stat-label">Pages</div>
          </div>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="bl-filters">
        <input className="adm-search" placeholder="Search blogs..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        <select className="adm-select" value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>
          <option value="">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
        <select className="adm-select" value={category} onChange={e => { setCategory(e.target.value); setPage(1); }}>
          <option value="">All Categories</option>
          {categoryList.map(c => <option key={c}>{c}</option>)}
        </select>
        <select className="adm-select" value={author} onChange={e => { setAuthor(e.target.value); setPage(1); }}>
          <option value="">All Authors</option>
          {authorList.map(a => <option key={a}>{a}</option>)}
        </select>
        {hasFilters && <button className="bl-clear-btn" onClick={clearFilters}>✕ Clear</button>}
      </div>

      {/* ── Table ── */}
      <div className="adm-card">
        <table className="adm-table">
          <thead>
            <tr><th>#</th><th>Image</th><th>Title</th><th>Category</th><th>Author</th><th>Status</th><th>Date</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {blogs.map((b, i) => (
              <tr key={b._id}>
                <td style={{color:'#94a3b8', fontWeight:600}}>{(page-1)*10 + i + 1}</td>
                <td>
                  <img src={b.thumb_image_url || b.banner_image_url || ''} alt="" style={{width:'54px', height:'38px', objectFit:'cover', borderRadius:'6px', background:'#f1f5f9'}} />
                </td>
                <td><strong style={{color:'#0d2240'}}>{b.title}</strong></td>
                <td><span className="bl-tag">{b.category}</span></td>
                <td style={{fontSize:'0.8rem', color:'#64748b'}}>{b.author || 'SalaryTopUp Team'}</td>
                <td><span className={`badge badge-${b.status}`}>{b.status}</span></td>
                <td style={{fontSize:'0.8rem', color:'#64748b', whiteSpace:'nowrap'}}>{new Date(b.createdAt).toLocaleDateString('en-IN', {day:'2-digit', month:'short', year:'numeric'})}</td>
                <td>
                  <div className="adm-icon-actions">
                    <button className="adm-icon-btn adm-icon-edit" title="Edit" onClick={() => navigate(`/blogs/edit/${b._id}`)}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button className="adm-icon-btn adm-icon-toggle" title={b.status === 'published' ? 'Unpublish' : 'Publish'} onClick={() => toggleStatus(b)}>
                      {b.status === 'published'
                        ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                        : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      }
                    </button>
                    <button className="adm-icon-btn adm-icon-delete" title="Delete" onClick={() => setDeleteId(b._id)}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {blogs.length === 0 && <tr><td colSpan="8" className="adm-empty">No blogs found</td></tr>}
          </tbody>
        </table>
        <div className="adm-pagination">
          <span>{total} total posts</span>
          <div>
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
            <span>Page {page} of {Math.max(1, Math.ceil(total / 10))}</span>
            <button disabled={blogs.length < 10} onClick={() => setPage(p => p + 1)}>Next →</button>
          </div>
        </div>
      </div>

      {/* Delete Confirm Modal */}
      {deleteId && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div style={{ background:'#fff', borderRadius:16, padding:'32px 28px', maxWidth:380, width:'90%', boxShadow:'0 20px 60px rgba(0,0,0,0.18)', textAlign:'center' }}>
            <div style={{ width:52, height:52, background:'#fee2e2', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="24" height="24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
            </div>
            <h3 style={{ fontWeight:800, color:'#0d2240', fontSize:'1.1rem', margin:'0 0 8px' }}>Delete Blog?</h3>
            <p style={{ color:'#64748b', fontSize:'0.88rem', margin:'0 0 24px' }}>This action cannot be undone. Blog will be permanently deleted.</p>
            <div style={{ display:'flex', gap:10, justifyContent:'center' }}>
              <button onClick={() => setDeleteId(null)} style={{ padding:'10px 24px', border:'1.5px solid #e2e8f0', borderRadius:8, background:'#fff', color:'#475569', fontWeight:600, cursor:'pointer', fontSize:'0.88rem' }}>Cancel</button>
              <button onClick={handleDelete} style={{ padding:'10px 24px', border:'none', borderRadius:8, background:'#dc2626', color:'#fff', fontWeight:700, cursor:'pointer', fontSize:'0.88rem' }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}