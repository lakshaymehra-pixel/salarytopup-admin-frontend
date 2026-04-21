import React, { useEffect, useState } from 'react';
import API from '../../api';
import toast from 'react-hot-toast';
import './KeywordSuggestions.css';

const DIFF_COLOR = { Low: '#16a34a', Medium: '#f59e0b', High: '#ef4444' };
const INTENT_COLOR = { informational: '#3b82f6', transactional: '#16a34a', navigational: '#f59e0b' };

export default function KeywordSuggestions() {
  const [seed, setSeed] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [lastSeed, setLastSeed] = useState('');
  const [savedIds, setSavedIds] = useState(new Set());
  const [hasOpenAI, setHasOpenAI] = useState(false);

  useEffect(() => {
    API.get('/seo/settings').then(r => setHasOpenAI(r.data.openaiConnected)).catch(() => {});
    API.get('/seo/keyword-suggestions').then(r => setSuggestions(r.data)).catch(() => {});
  }, []);

  const generate = async () => {
    if (!seed.trim()) return toast.error('Enter a seed keyword');
    setGenerating(true);
    try {
      const r = await API.post('/seo/keyword-suggestions/generate', { seedKeyword: seed.trim() });
      setSuggestions(r.data.suggestions);
      setLastSeed(seed.trim());
      toast.success(`Generated ${r.data.newCount} new suggestions (via ${r.data.source})`);
    } catch (e) { toast.error(e.response?.data?.message || 'Error generating'); }
    setGenerating(false);
  };

  const saveToTracker = async (id) => {
    try {
      await API.post(`/seo/keyword-suggestions/${id}/save-to-tracker`);
      setSavedIds(prev => new Set([...prev, id]));
      setSuggestions(prev => prev.map(s => s._id === id ? { ...s, saved: true } : s));
      toast.success('Added to Keyword Tracker');
    } catch { toast.error('Error saving'); }
  };

  const del = async (id) => {
    await API.delete(`/seo/keyword-suggestions/${id}`);
    setSuggestions(prev => prev.filter(s => s._id !== id));
  };

  const loadSeed = async (s) => {
    setSeed(s);
    setLoading(true);
    try {
      const r = await API.get(`/seo/keyword-suggestions?seed=${encodeURIComponent(s)}`);
      setSuggestions(r.data);
      setLastSeed(s);
    } catch {}
    setLoading(false);
  };

  // Get unique seeds from suggestions
  const seeds = [...new Set(suggestions.map(s => s.seedKeyword))].slice(0, 10);

  const displayed = lastSeed ? suggestions.filter(s => s.seedKeyword === lastSeed) : suggestions;

  return (
    <div className="ks-wrap">
      <div className="adm-page-header">
        <div>
          <h2 className="adm-page-title">Keyword Suggestions</h2>
          <p className="adm-page-sub">AI-powered keyword ideas for your content</p>
        </div>
      </div>

      {!hasOpenAI && (
        <div className="ks-banner">
          <strong>Pattern-based suggestions active.</strong> Add your OpenAI API key in <a href="/seo/settings">SEO Settings</a> for AI-powered suggestions with better accuracy.
        </div>
      )}
      {hasOpenAI && (
        <div className="ks-banner ks-banner-green">
          <strong>AI mode active.</strong> Suggestions are powered by GPT-4o-mini.
        </div>
      )}

      {/* Generator */}
      <div className="ks-generator">
        <input
          className="ks-input"
          placeholder="Enter seed keyword (e.g. salary loan, personal loan india)"
          value={seed}
          onChange={e => setSeed(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && generate()}
        />
        <button className="adm-btn-primary" onClick={generate} disabled={generating}>
          {generating ? 'Generating...' : '✨ Generate Suggestions'}
        </button>
      </div>

      {/* Past seeds */}
      {seeds.length > 0 && (
        <div className="ks-seeds">
          <span style={{ fontSize: '0.78rem', color: '#94a3b8', marginRight: 8 }}>Past searches:</span>
          {seeds.map(s => (
            <button key={s} className={`ks-seed-btn ${lastSeed === s ? 'active' : ''}`} onClick={() => loadSeed(s)}>{s}</button>
          ))}
        </div>
      )}

      {/* Results */}
      <div className="ks-stats-row">
        <span className="ks-count">{displayed.length} suggestions {lastSeed && `for "${lastSeed}"`}</span>
        <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{displayed.filter(s => s.saved).length} added to tracker</span>
      </div>

      {loading ? <div className="seo-loading">Loading...</div> : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Suggested Keyword</th>
                <th>Est. Volume</th>
                <th>Difficulty</th>
                <th>Intent</th>
                <th>Source</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayed.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: '#94a3b8', padding: 40 }}>
                  Enter a seed keyword above and click Generate Suggestions
                </td></tr>
              ) : displayed.map(s => (
                <tr key={s._id} style={{ opacity: s.saved ? 0.6 : 1 }}>
                  <td><strong>{s.suggestedKeyword}</strong></td>
                  <td><span className="ks-vol">{s.estimatedVolume}</span></td>
                  <td>
                    <span className="ks-diff" style={{ color: DIFF_COLOR[s.difficulty], background: DIFF_COLOR[s.difficulty] + '15' }}>
                      {s.difficulty}
                    </span>
                  </td>
                  <td>
                    {s.intent && <span className="ks-intent" style={{ color: INTENT_COLOR[s.intent], background: INTENT_COLOR[s.intent] + '15' }}>{s.intent}</span>}
                  </td>
                  <td><span className="ks-source">{s.source}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {s.saved ? (
                        <span style={{ color: '#16a34a', fontSize: '0.78rem', fontWeight: 600 }}>✓ Added</span>
                      ) : (
                        <button className="adm-btn-xs" onClick={() => saveToTracker(s._id)}>+ Add to Tracker</button>
                      )}
                      <button className="adm-btn-xs adm-btn-danger-xs" onClick={() => del(s._id)}>Del</button>
                    </div>
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