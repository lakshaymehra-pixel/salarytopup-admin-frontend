import React, { useEffect, useState } from 'react';
import API from '../../api';
import toast from 'react-hot-toast';
import './IndexingSitemap.css';

export default function IndexingSitemap() {
  const [settings, setSettings] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [genResult, setGenResult] = useState(null);
  const [inspectUrl, setInspectUrl] = useState('');
  const [inspecting, setInspecting] = useState(false);
  const [inspectResult, setInspectResult] = useState(null);
  const [gscConnected, setGscConnected] = useState(false);

  useEffect(() => {
    API.get('/seo/settings').then(r => {
      setSettings(r.data);
      setGscConnected(r.data.gscConnected);
    }).catch(() => {});
  }, []);

  const generateSitemap = async () => {
    setGenerating(true);
    try {
      const r = await API.post('/seo/audit/sitemap/generate');
      setGenResult(r.data);
      toast.success(`Sitemap generated — ${r.data.urls} URLs`);
    } catch { toast.error('Generation failed'); }
    setGenerating(false);
  };

  const inspectUrlHandler = async () => {
    if (!inspectUrl.trim()) return toast.error('Enter a URL to inspect');
    setInspecting(true);
    setInspectResult(null);
    try {
      const r = await API.get(`/seo/gsc/inspect?url=${encodeURIComponent(inspectUrl)}`);
      setInspectResult(r.data);
    } catch { toast.error('Inspection failed'); }
    setInspecting(false);
  };

  return (
    <div className="is-wrap">
      <div className="adm-page-header">
        <div>
          <h2 className="adm-page-title">Indexing & Sitemap</h2>
          <p className="adm-page-sub">Manage your XML sitemap and check Google indexing status</p>
        </div>
      </div>

      <div className="is-grid">
        {/* Sitemap Card */}
        <div className="seo-card">
          <div className="seo-card-title">XML Sitemap</div>
          <div className="is-info-row">
            <span>Last Generated:</span>
            <strong>{settings?.sitemapLastGenerated ? new Date(settings.sitemapLastGenerated).toLocaleString() : 'Never'}</strong>
          </div>
          <div className="is-info-row">
            <span>Auto Sitemap:</span>
            <strong>{settings?.autoSitemapEnabled ? 'Enabled' : 'Disabled'}</strong>
          </div>
          <div className="is-info-row">
            <span>Include Blogs:</span>
            <strong>{settings?.sitemapIncludeBlogs !== false ? 'Yes' : 'No'}</strong>
          </div>
          <div className="is-info-row">
            <span>Include Pages:</span>
            <strong>{settings?.sitemapIncludePages !== false ? 'Yes' : 'No'}</strong>
          </div>
          {genResult && (
            <div className="is-result-box">
              Generated {genResult.urls} URLs at {new Date(genResult.generatedAt).toLocaleTimeString()}
            </div>
          )}
          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <button className="adm-btn-primary" onClick={generateSitemap} disabled={generating}>
              {generating ? 'Generating...' : 'Generate Sitemap'}
            </button>
            <a href="http://localhost:5000/api/seo/audit/sitemap" target="_blank" rel="noreferrer" className="adm-btn-secondary">
              View XML →
            </a>
          </div>
        </div>

        {/* URL Inspection Card */}
        <div className="seo-card">
          <div className="seo-card-title">URL Indexing Inspector</div>
          {!gscConnected ? (
            <div className="is-no-gsc">
              <p>URL inspection requires Google Search Console connection.</p>
              <a href="/seo/settings" style={{ color: '#3b82f6', fontWeight: 600, fontSize: '0.85rem' }}>Connect GSC in Settings →</a>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                <input
                  className="kr-search"
                  style={{ flex: 1 }}
                  placeholder="https://salarytopup.com/blog/..."
                  value={inspectUrl}
                  onChange={e => setInspectUrl(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && inspectUrlHandler()}
                />
                <button className="adm-btn-primary" onClick={inspectUrlHandler} disabled={inspecting}>
                  {inspecting ? 'Checking...' : 'Check'}
                </button>
              </div>
              {inspectResult && (
                <div>
                  {inspectResult.configured === false ? (
                    <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>GSC not connected.</div>
                  ) : (
                    <div className="is-inspect-result">
                      {(() => {
                        const r = inspectResult.result || {};
                        const indexed = r.indexStatusResult?.coverageState === 'Submitted and indexed';
                        return (
                          <>
                            <div className={`is-indexed-badge ${indexed ? 'is-indexed' : 'is-not-indexed'}`}>
                              {indexed ? 'Indexed' : 'Not Indexed'}
                            </div>
                            <div className="is-info-row"><span>Coverage State:</span><strong>{r.indexStatusResult?.coverageState || '—'}</strong></div>
                            <div className="is-info-row"><span>Last Crawled:</span><strong>{r.indexStatusResult?.lastCrawlTime ? new Date(r.indexStatusResult.lastCrawlTime).toLocaleDateString() : '—'}</strong></div>
                            <div className="is-info-row"><span>Robots Allowed:</span><strong>{r.indexStatusResult?.robotsTxtState || '—'}</strong></div>
                            <div className="is-info-row"><span>Mobile Usable:</span><strong>{r.mobileUsabilityResult?.verdict || '—'}</strong></div>
                          </>
                        );
                      })()}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Sitemap Settings */}
        <div className="seo-card">
          <div className="seo-card-title">Sitemap Settings</div>
          <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: 16 }}>
            Customize what gets included in your sitemap. Changes take effect on next generation.
          </p>
          <div className="is-info-row">
            <span>Site URL (base for sitemap)</span>
            <strong style={{ color: '#0d2240' }}>{settings?.siteUrl || 'Not set — configure in SEO Settings'}</strong>
          </div>
          <div style={{ marginTop: 16 }}>
            <a href="/seo/settings" className="adm-btn-secondary">Edit Sitemap Settings →</a>
          </div>
        </div>

        {/* Submit to Google */}
        <div className="seo-card">
          <div className="seo-card-title">📤 Submit to Google</div>
          <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: 16 }}>
            After generating your sitemap, submit it to Google Search Console for faster indexing.
          </p>
          <div className="is-steps">
            <div className="is-step">1. Generate your sitemap above</div>
            <div className="is-step">2. Open <a href="https://search.google.com/search-console" target="_blank" rel="noreferrer">Google Search Console</a></div>
            <div className="is-step">3. Go to Sitemaps → Add a new sitemap</div>
            <div className="is-step">4. Enter: <code>{(settings?.siteUrl || 'https://salarytopup.com') + '/sitemap.xml'}</code></div>
          </div>
          <div style={{ marginTop: 12, fontSize: '0.78rem', color: '#94a3b8' }}>
            Your sitemap URL: <code>{(settings?.siteUrl || 'https://salarytopup.com') + '/sitemap.xml'}</code>
          </div>
        </div>
      </div>
    </div>
  );
}