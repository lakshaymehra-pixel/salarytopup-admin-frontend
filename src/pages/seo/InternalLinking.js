import React, { useEffect, useState } from 'react';
import API from '../../api';
import './InternalLinking.css';

export default function InternalLinking() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('existing');
  const [search, setSearch] = useState('');

  useEffect(() => {
    API.get('/blogs?limit=200').then(r => {
      const list = r.data.blogs || r.data || [];
      // Parse internal links from each blog's content
      const enriched = list.map(b => {
        const content = b.long_description || '';
        const linkMatches = [...content.matchAll(/<a\s[^>]*href="([^"]*)"[^>]*>([^<]*)<\/a>/gi)];
        const internalLinks = linkMatches.filter(m => !m[1].startsWith('http') || m[1].includes('salarytopup.com')).map(m => ({ href: m[1], text: m[2] }));
        const externalLinks = linkMatches.filter(m => m[1].startsWith('http') && !m[1].includes('salarytopup.com')).length;
        return { ...b, internalLinks, externalLinks };
      });
      setBlogs(enriched);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  // Find linking opportunities: blogs that share keywords in titles/focus_keyword
  const getOpportunities = (blog) => {
    if (!blog.focus_keyword && !blog.title) return [];
    const words = [...new Set([
      ...(blog.focus_keyword || '').toLowerCase().split(/\s+/),
      ...(blog.title || '').toLowerCase().split(/\s+/).slice(0, 3),
    ])].filter(w => w.length > 4);

    return blogs.filter(b => {
      if (b._id === blog._id) return false;
      const alreadyLinked = blog.internalLinks.some(l => l.href.includes(b.slug));
      if (alreadyLinked) return false;
      const bWords = ((b.title || '') + ' ' + (b.focus_keyword || '')).toLowerCase();
      return words.some(w => bWords.includes(w));
    }).slice(0, 5);
  };

  const orphans = blogs.filter(b => b.internalLinks.length === 0);

  const filtered = blogs.filter(b => !search || b.title?.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div className="seo-loading">Loading blog posts...</div>;

  return (
    <div className="il-wrap">
      <div className="adm-page-header">
        <div>
          <h2 className="adm-page-title">Internal Linking</h2>
          <p className="adm-page-sub">Scan internal links and find linking opportunities</p>
        </div>
      </div>

      <div className="seo-stats-row">
        <div className="seo-stat-card">
          <div><div className="seo-stat-val">{blogs.length}</div><div className="seo-stat-lbl">Total Blog Posts</div></div>
        </div>
        <div className="seo-stat-card">
          <div><div className="seo-stat-val">{orphans.length}</div><div className="seo-stat-lbl">Orphan Pages (0 links)</div></div>
        </div>
        <div className="seo-stat-card">
          <div><div className="seo-stat-val">{blogs.reduce((a, b) => a + b.internalLinks.length, 0)}</div><div className="seo-stat-lbl">Total Internal Links</div></div>
        </div>
      </div>

      <div className="kr-tabs">
        <button className={`kr-tab ${tab === 'existing' ? 'active' : ''}`} onClick={() => setTab('existing')}>Existing Links</button>
        <button className={`kr-tab ${tab === 'opportunities' ? 'active' : ''}`} onClick={() => setTab('opportunities')}>Linking Opportunities</button>
        <button className={`kr-tab ${tab === 'orphans' ? 'active' : ''}`} onClick={() => setTab('orphans')}>Orphan Pages ({orphans.length})</button>
      </div>

      <div className="kr-filters">
        <input className="kr-search" placeholder="Search posts..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {tab === 'existing' && (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr><th>Blog Post</th><th>Internal Links</th><th>External Links</th><th>Linked Pages</th></tr>
            </thead>
            <tbody>
              {filtered.map(b => (
                <tr key={b._id}>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{b.title}</div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>/blog/{b.slug}</div>
                  </td>
                  <td>
                    <span className={`il-count ${b.internalLinks.length === 0 ? 'il-zero' : b.internalLinks.length >= 3 ? 'il-good' : 'il-low'}`}>
                      {b.internalLinks.length}
                    </span>
                  </td>
                  <td><span style={{ color: '#64748b' }}>{b.externalLinks}</span></td>
                  <td>
                    <div className="il-links-list">
                      {b.internalLinks.slice(0, 3).map((l, i) => (
                        <span key={i} className="il-link-tag">{l.text || l.href}</span>
                      ))}
                      {b.internalLinks.length > 3 && <span className="il-link-more">+{b.internalLinks.length - 3} more</span>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'opportunities' && (
        <div className="il-opps">
          {filtered.map(b => {
            const opps = getOpportunities(b);
            if (opps.length === 0) return null;
            return (
              <div key={b._id} className="il-opp-card">
                <div className="il-opp-source">
                  <strong>{b.title}</strong>
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>/blog/{b.slug}</span>
                </div>
                <div className="il-opp-suggestions">
                  {opps.map(op => (
                    <div key={op._id} className="il-opp-item">
                      <span>→ Link to: <strong>{op.title}</strong></span>
                      <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>/blog/{op.slug}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          {filtered.every(b => getOpportunities(b).length === 0) && (
            <div className="seo-empty">No linking opportunities found. All related posts are already linked!</div>
          )}
        </div>
      )}

      {tab === 'orphans' && (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr><th>Blog Post</th><th>Status</th><th>Action</th></tr>
            </thead>
            <tbody>
              {orphans.length === 0 ? (
                <tr><td colSpan={3} style={{ textAlign: 'center', color: '#94a3b8', padding: 40 }}>No orphan pages! All posts have at least one internal link.</td></tr>
              ) : orphans.filter(b => !search || b.title?.toLowerCase().includes(search.toLowerCase())).map(b => (
                <tr key={b._id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{b.title}</div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>/blog/{b.slug}</div>
                  </td>
                  <td><span style={{ color: '#ef4444', fontWeight: 600, fontSize: '0.8rem' }}>No internal links</span></td>
                  <td>
                    <a href={`/blogs/edit/${b._id}`} className="adm-btn-xs">Edit Post</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}