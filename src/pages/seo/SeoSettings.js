import React, { useEffect, useState } from 'react';
import API from '../../api';
import toast from 'react-hot-toast';
import './SeoSettings.css';

export default function SeoSettings() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState('gsc');
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    API.get('/seo/settings').then(r => setSettings(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const set = (k, v) => setSettings(p => ({ ...p, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      await API.put('/seo/settings', settings);
      toast.success('Settings saved!');
      // Reload to get fresh masked values
      const r = await API.get('/seo/settings');
      setSettings(r.data);
    } catch { toast.error('Save failed'); }
    setSaving(false);
  };

  const connectGsc = async () => {
    setAuthLoading(true);
    try {
      const r = await API.get('/seo/settings/gsc-auth-url');
      window.open(r.data.url, '_blank', 'width=600,height=700');
      toast.success('Authorize in the popup, then reload this page.');
      setTimeout(() => { API.get('/seo/settings').then(r2 => setSettings(r2.data)); }, 3000);
    } catch (e) { toast.error(e.response?.data?.message || 'Error getting auth URL'); }
    setAuthLoading(false);
  };

  const disconnectGsc = async () => {
    if (!window.confirm('Disconnect Google Search Console?')) return;
    await API.post('/seo/settings/gsc-disconnect');
    toast.success('GSC disconnected');
    setSettings(p => ({ ...p, gscConnected: false }));
  };

  const field = (label, key, placeholder, type = 'text', hint = '') => (
    <div className="ss-field">
      <label>{label}</label>
      {hint && <div className="ss-hint">{hint}</div>}
      <input type={type} value={settings[key] || ''} onChange={e => set(key, e.target.value)} placeholder={placeholder} />
    </div>
  );

  const toggle = (label, key, hint = '') => (
    <div className="ss-toggle-row">
      <div>
        <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#374151' }}>{label}</div>
        {hint && <div className="ss-hint">{hint}</div>}
      </div>
      <label className="ss-switch">
        <input type="checkbox" checked={!!settings[key]} onChange={e => set(key, e.target.checked)} />
        <span className="ss-slider" />
      </label>
    </div>
  );

  return (
    <div className="ss-wrap">
      <div className="adm-page-header">
        <div>
          <h2 className="adm-page-title">SEO Settings</h2>
          <p className="adm-page-sub">Configure Google APIs and SEO defaults</p>
        </div>
        <button className="adm-btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save Settings'}</button>
      </div>

      <div className="kr-tabs">
        <button className={`kr-tab ${tab === 'gsc' ? 'active' : ''}`} onClick={() => setTab('gsc')}>Google Search Console</button>
        <button className={`kr-tab ${tab === 'ga' ? 'active' : ''}`} onClick={() => setTab('ga')}>Google Analytics</button>
        <button className={`kr-tab ${tab === 'general' ? 'active' : ''}`} onClick={() => setTab('general')}>General</button>
      </div>

      {loading ? <div className="seo-loading">Loading...</div> : (
        <div className="ss-content">
          {tab === 'gsc' && (
            <div className="ss-section">
              {/* Connection Status */}
              <div className={`ss-status-card ${settings.gscConnected ? 'ss-connected' : 'ss-disconnected'}`}>
                <div style={{ fontSize: '1.4rem' }}>{settings.gscConnected ? '●' : '●'}</div>
                <div>
                  <div style={{ fontWeight: 700 }}>{settings.gscConnected ? 'Connected to Google Search Console' : 'Not Connected'}</div>
                  <div style={{ fontSize: '0.78rem', opacity: 0.8 }}>
                    {settings.gscConnected ? `Site: ${settings.gscSiteUrl || 'configured'}` : 'Follow steps below to connect'}
                  </div>
                </div>
                {settings.gscConnected && (
                  <button className="adm-btn-xs adm-btn-danger-xs" onClick={disconnectGsc} style={{ marginLeft: 'auto' }}>Disconnect</button>
                )}
              </div>

              {/* Setup Guide */}
              <div className="ss-guide">
                <div className="ss-guide-title">Setup Guide</div>
                {[
                  { step: 1, text: 'Go to Google Cloud Console → Create or select a project' },
                  { step: 2, text: 'Enable "Google Search Console API" from APIs & Services' },
                  { step: 3, text: 'Go to APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID' },
                  { step: 4, text: 'Application type: Web application. Add redirect URI: http://localhost:5000/api/seo/settings/gsc-callback' },
                  { step: 5, text: 'Copy Client ID and Client Secret below, then click "Connect with Google"' },
                ].map(s => (
                  <div key={s.step} className="ss-step"><span className="pp-step-num">{s.step}</span><span>{s.text}</span></div>
                ))}
              </div>

              {field('Client ID', 'gscClientId', 'Paste your OAuth 2.0 Client ID here...')}
              {field('Client Secret', 'gscClientSecret', settings.gscClientSecret?.startsWith('***') ? 'Already set (hidden)' : 'Paste your Client Secret here...')}
              {field('Site URL (in GSC)', 'gscSiteUrl', 'e.g. https://salarytopup.com or sc-domain:salarytopup.com', 'text', 'Exact URL/domain as registered in GSC')}

              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button className="adm-btn-primary" onClick={save} disabled={saving}>Save Credentials</button>
                <button className="adm-btn-secondary" onClick={connectGsc} disabled={authLoading || !settings.gscClientId || !settings.gscClientSecret?.replace(/\*/g, '')}>
                  {authLoading ? 'Opening...' : 'Connect with Google'}
                </button>
              </div>
            </div>
          )}

          {tab === 'ga' && (
            <div className="ss-section">
              <div className={`ss-status-card ${settings.gaConnected ? 'ss-connected' : 'ss-disconnected'}`}>
                <div style={{ fontSize: '1.4rem' }}>{settings.gaConnected ? '●' : '●'}</div>
                <div>
                  <div style={{ fontWeight: 700 }}>{settings.gaConnected ? 'Connected to Google Analytics 4' : 'Not Connected'}</div>
                  <div style={{ fontSize: '0.78rem', opacity: 0.8 }}>
                    {settings.gaConnected ? `Property ID: ${settings.gaPropertyId}` : 'Follow steps below to connect'}
                  </div>
                </div>
              </div>

              <div className="ss-guide">
                <div className="ss-guide-title">Setup Guide (Service Account)</div>
                {[
                  'Google Cloud Console → Enable "Google Analytics Data API"',
                  'IAM & Admin → Service Accounts → Create Service Account',
                  'Grant role: Viewer → Create Key (JSON) → Download the file',
                  'In GA4: Admin → Property Access Management → Add service account email → Viewer',
                  'Copy GA4 Property ID (just the number, e.g. 123456789)',
                  'Paste client_email, private_key from JSON, and Property ID below',
                ].map((s, i) => (
                  <div key={i} className="ss-step"><span className="pp-step-num">{i + 1}</span><span>{s}</span></div>
                ))}
              </div>

              {field('GA4 Property ID', 'gaPropertyId', 'e.g. 123456789', 'text', 'Numbers only, found in GA4 → Admin → Property Settings')}
              {field('Service Account Email', 'gaClientEmail', 'something@project.iam.gserviceaccount.com')}
              <div className="ss-field">
                <label>Service Account Private Key</label>
                <div className="ss-hint">Paste the "private_key" value from your service account JSON file (starts with -----BEGIN RSA PRIVATE KEY-----)</div>
                <textarea
                  value={settings.gaPrivateKey?.startsWith('***') ? '' : (settings.gaPrivateKey || '')}
                  onChange={e => set('gaPrivateKey', e.target.value)}
                  placeholder={settings.gaPrivateKey?.startsWith('***') ? 'Already set (hidden)' : '-----BEGIN RSA PRIVATE KEY-----\n...'}
                  rows={5}
                  style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: '0.8rem', fontFamily: 'monospace', resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
              <button className="adm-btn-primary" onClick={save} disabled={saving} style={{ marginTop: 4 }}>Save GA Settings</button>
            </div>
          )}

          {tab === 'general' && (
            <div className="ss-section">
              {field('Site URL', 'siteUrl', 'https://salarytopup.com', 'text', 'Used in sitemap generation and canonical URLs')}
              {field('OpenAI API Key', 'openaiApiKey', settings.openaiApiKey?.startsWith('***') ? 'Already set (hidden)' : 'sk-...', 'text', 'For AI-powered keyword suggestions (optional). Get from platform.openai.com')}
              {field('Default Meta Title Suffix', 'defaultMetaTitleSuffix', ' | Salary Topup', 'text', 'Appended to all page titles in SEO')}

              <div className="ss-divider">Alert Settings</div>
              {field('Rank Drop Alert Threshold', 'alertRankDropThreshold', '5', 'number', 'Alert when keyword drops more than N positions')}
              {toggle('Enable SEO Alerts', 'alertsEnabled', 'Automatically generate alerts for missing meta, rank drops, etc.')}
              {toggle('Alert on Missing Meta', 'alertMissingMeta', 'Create alerts for pages with no meta title or description')}

              <div className="ss-divider">Sitemap Settings</div>
              {toggle('Auto-Generate Sitemap', 'autoSitemapEnabled', 'Regenerate sitemap when new blog posts are published')}
              {toggle('Include Blog Posts', 'sitemapIncludeBlogs', 'Add all published blog posts to the sitemap')}
              {toggle('Include CMS Pages', 'sitemapIncludePages', 'Add all CMS pages to the sitemap')}

              <button className="adm-btn-primary" onClick={save} disabled={saving} style={{ marginTop: 8 }}>Save General Settings</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}