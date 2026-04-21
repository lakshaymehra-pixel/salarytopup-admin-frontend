import React, { useState, useEffect, useCallback } from 'react';
import API from '../../api';
import './ContentOptimizer.css';

function fleschScore(text) {
  const sentences = (text.match(/[.!?]+/g) || []).length || 1;
  const words = (text.match(/\b\w+\b/g) || []).length || 1;
  const syllables = text.replace(/[^a-zA-Z]/g, '').split('').reduce((acc, c, i, arr) => {
    if ('aeiouAEIOU'.includes(c) && (i === 0 || !'aeiouAEIOU'.includes(arr[i - 1]))) return acc + 1;
    return acc;
  }, 0) || 1;
  const score = 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words);
  return Math.max(0, Math.min(100, Math.round(score)));
}

function analyze(content, keyword, metaTitle, metaDesc) {
  const text = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const words = (text.match(/\b\w+\b/g) || []);
  const wordCount = words.length;
  const sentences = (text.match(/[.!?]+/g) || []).length;
  const readingTime = Math.ceil(wordCount / 200);
  const flesch = wordCount > 20 ? fleschScore(text) : 0;

  const h1s = (content.match(/<h1[^>]*>/gi) || []).length;
  const h2s = (content.match(/<h2[^>]*>/gi) || []).length;
  const h3s = (content.match(/<h3[^>]*>/gi) || []).length;
  const imgs = (content.match(/<img[^>]*>/gi) || []).length;
  const imgsNoAlt = (content.match(/<img(?![^>]*alt=)[^>]*>/gi) || []).length;
  const links = (content.match(/<a\s[^>]*href[^>]*>/gi) || []).length;

  let keywordDensity = 0;
  let keywordCount = 0;
  if (keyword && wordCount > 0) {
    const re = new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    keywordCount = (text.match(re) || []).length;
    keywordDensity = parseFloat(((keywordCount / wordCount) * 100).toFixed(2));
  }

  const inTitle = keyword && metaTitle ? metaTitle.toLowerCase().includes(keyword.toLowerCase()) : null;
  const inDesc = keyword && metaDesc ? metaDesc.toLowerCase().includes(keyword.toLowerCase()) : null;

  const suggestions = [];
  if (wordCount < 300) suggestions.push({ type: 'error', msg: `Content too short (${wordCount} words). Aim for at least 800 words.` });
  else if (wordCount < 800) suggestions.push({ type: 'warning', msg: `Content is ${wordCount} words. Top-ranking pages often have 1000+ words.` });
  else suggestions.push({ type: 'success', msg: `Good content length: ${wordCount} words.` });

  if (h1s === 0) suggestions.push({ type: 'error', msg: 'No H1 heading found. Add exactly one H1 tag.' });
  else if (h1s > 1) suggestions.push({ type: 'warning', msg: `${h1s} H1 tags found. Use only one H1.` });
  else suggestions.push({ type: 'success', msg: 'H1 tag present.' });

  if (h2s === 0) suggestions.push({ type: 'warning', msg: 'No H2 headings. Add H2 headings to structure content.' });
  else if (h2s >= 3) suggestions.push({ type: 'success', msg: `Good: ${h2s} H2 headings found.` });

  if (keyword) {
    if (keywordDensity < 0.5) suggestions.push({ type: 'warning', msg: `Keyword density too low (${keywordDensity}%). Aim for 1-2%.` });
    else if (keywordDensity > 3) suggestions.push({ type: 'warning', msg: `Keyword density too high (${keywordDensity}%). May be seen as keyword stuffing.` });
    else suggestions.push({ type: 'success', msg: `Keyword density is ${keywordDensity}% — good.` });
    if (inTitle === false) suggestions.push({ type: 'error', msg: 'Focus keyword not in meta title.' });
    if (inTitle === true) suggestions.push({ type: 'success', msg: 'Focus keyword found in meta title.' });
    if (inDesc === false) suggestions.push({ type: 'warning', msg: 'Focus keyword not in meta description.' });
  }

  if (imgsNoAlt > 0) suggestions.push({ type: 'warning', msg: `${imgsNoAlt} image(s) missing alt text.` });
  else if (imgs > 0) suggestions.push({ type: 'success', msg: 'All images have alt text.' });

  if (!metaTitle) suggestions.push({ type: 'error', msg: 'Meta title is empty.' });
  else if (metaTitle.length < 30) suggestions.push({ type: 'warning', msg: `Meta title too short (${metaTitle.length} chars). Aim 50-60.` });
  else if (metaTitle.length > 70) suggestions.push({ type: 'warning', msg: `Meta title too long (${metaTitle.length} chars). Keep under 60.` });
  else suggestions.push({ type: 'success', msg: `Meta title length is good (${metaTitle.length} chars).` });

  if (!metaDesc) suggestions.push({ type: 'error', msg: 'Meta description is empty.' });
  else if (metaDesc.length < 100) suggestions.push({ type: 'warning', msg: `Meta description too short (${metaDesc.length} chars). Aim 120-160.` });
  else if (metaDesc.length > 165) suggestions.push({ type: 'warning', msg: `Meta description too long (${metaDesc.length} chars). Keep under 160.` });
  else suggestions.push({ type: 'success', msg: `Meta description length is good (${metaDesc.length} chars).` });

  const errors = suggestions.filter(s => s.type === 'error').length;
  const warnings = suggestions.filter(s => s.type === 'warning').length;
  const successes = suggestions.filter(s => s.type === 'success').length;
  const total = suggestions.length;
  const score = total > 0 ? Math.round((successes / total) * 100) : 0;

  return { wordCount, readingTime, sentences, flesch, h1s, h2s, h3s, imgs, imgsNoAlt, links, keywordDensity, keywordCount, suggestions, score, errors, warnings, successes };
}

const SCORE_COLOR = s => s >= 80 ? '#16a34a' : s >= 50 ? '#f59e0b' : '#ef4444';
const TYPE_ICON = { success: '✓', warning: '!', error: '✕' };

export default function ContentOptimizer() {
  const [content, setContent] = useState('');
  const [keyword, setKeyword] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDesc, setMetaDesc] = useState('');
  const [result, setResult] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [selectedBlog, setSelectedBlog] = useState('');

  useEffect(() => {
    API.get('/blogs?limit=100').then(r => setBlogs(r.data.blogs || r.data || [])).catch(() => {});
  }, []);

  const run = useCallback(() => {
    if (!content.trim()) return;
    setResult(analyze(content, keyword, metaTitle, metaDesc));
  }, [content, keyword, metaTitle, metaDesc]);

  useEffect(() => {
    const t = setTimeout(run, 400);
    return () => clearTimeout(t);
  }, [run]);

  const loadBlog = async (id) => {
    if (!id) return;
    setSelectedBlog(id);
    try {
      const r = await API.get(`/blogs/${id}`);
      const b = r.data;
      setContent(b.long_description || b.short_description || '');
      setKeyword(b.focus_keyword || '');
      setMetaTitle(b.meta_title || b.title || '');
      setMetaDesc(b.meta_description || '');
    } catch {}
  };

  return (
    <div className="co-wrap">
      <div className="adm-page-header">
        <div>
          <h2 className="adm-page-title">Content Optimizer</h2>
          <p className="adm-page-sub">Real-time SEO analysis for your content</p>
        </div>
      </div>

      {/* Load blog */}
      <div className="co-load-row">
        <select value={selectedBlog} onChange={e => loadBlog(e.target.value)} className="kr-select" style={{ minWidth: 280 }}>
          <option value="">— Or load an existing blog post —</option>
          {blogs.map(b => <option key={b._id} value={b._id}>{b.title}</option>)}
        </select>
      </div>

      <div className="co-layout">
        {/* Left: Inputs */}
        <div className="co-left">
          <div className="co-field">
            <label>Focus Keyword</label>
            <input value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="e.g. salary loan india" />
          </div>
          <div className="co-field">
            <label>Meta Title</label>
            <input value={metaTitle} onChange={e => setMetaTitle(e.target.value)} placeholder="Page meta title..." />
          </div>
          <div className="co-field">
            <label>Meta Description</label>
            <input value={metaDesc} onChange={e => setMetaDesc(e.target.value)} placeholder="Page meta description..." />
          </div>
          <div className="co-field" style={{ flex: 1 }}>
            <label>Content (HTML or plain text)</label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Paste your blog content here..."
              className="co-textarea"
            />
          </div>
        </div>

        {/* Right: Analysis */}
        <div className="co-right">
          {!result ? (
            <div className="co-empty">Start typing to see live SEO analysis</div>
          ) : (
            <>
              {/* Score */}
              <div className="co-score-card">
                <div className="co-score-circle" style={{ borderColor: SCORE_COLOR(result.score) }}>
                  <span style={{ color: SCORE_COLOR(result.score) }}>{result.score}</span>
                  <small>/100</small>
                </div>
                <div>
                  <div className="co-score-label">SEO Score</div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                    {result.errors} errors · {result.warnings} warnings · {result.successes} passed
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="co-stats-grid">
                {[
                  { label: 'Word Count', val: result.wordCount },
                  { label: 'Reading Time', val: `${result.readingTime} min` },
                  { label: 'Readability', val: `${result.flesch}/100` },
                  { label: 'H1 / H2 / H3', val: `${result.h1s} / ${result.h2s} / ${result.h3s}` },
                  { label: 'Images', val: result.imgs },
                  { label: 'Links', val: result.links },
                  ...(keyword ? [{ label: `"${keyword.slice(0, 15)}" density`, val: `${result.keywordDensity}%` }] : []),
                ].map(s => (
                  <div key={s.label} className="co-stat">
                    <div className="co-stat-val">{s.val}</div>
                    <div className="co-stat-lbl">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Suggestions */}
              <div className="co-suggestions">
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0d2240', marginBottom: 10 }}>Suggestions</div>
                {result.suggestions.map((s, i) => (
                  <div key={i} className={`co-suggestion co-suggestion-${s.type}`}>
                    <span>{TYPE_ICON[s.type]}</span>
                    <span>{s.msg}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}