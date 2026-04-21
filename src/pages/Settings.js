import React, { useEffect, useRef, useState, useCallback } from 'react';
import API from '../api';
import toast from 'react-hot-toast';
import defaultLogo from '../logo-st.webp';

/* ── SVG Icons ── */
const Ico = {
  globe: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  image: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
  user:  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  lock:  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  eye:   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  eyeOff:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>,
  upload:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>,
  check: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  save:  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>,
  warn:  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  spin:  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>,
  preview:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
};

/* ── Reusable Section card ── */
const Section = ({ icon, title, subtitle, children }) => (
  <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e8eef2', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 22px', borderBottom: '1px solid #f1f5f9', background: '#fafcfd' }}>
      <span style={{ color: '#2C6275', display: 'flex' }}>{icon}</span>
      <div>
        <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#0d2240' }}>{title}</div>
        {subtitle && <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 1 }}>{subtitle}</div>}
      </div>
    </div>
    <div style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
      {children}
    </div>
  </div>
);

const Field = ({ label, hint, children }) => (
  <div>
    <label style={{ display: 'block', fontWeight: 600, fontSize: '0.8rem', color: '#374151', marginBottom: 6 }}>{label}</label>
    {hint && <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: '0 0 6px' }}>{hint}</p>}
    {children}
  </div>
);

const inp = { width: '100%', padding: '9px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: '0.85rem', color: '#0d2240', outline: 'none', boxSizing: 'border-box', background: '#fff' };

const SaveBtn = ({ saving, label = 'Save Changes', onClick }) => (
  <button onClick={onClick} disabled={saving}
    style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: saving ? '#94a3b8' : 'linear-gradient(135deg, #2C6275, #3a8fa0)', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 24px', fontWeight: 700, fontSize: '0.85rem', cursor: saving ? 'not-allowed' : 'pointer', alignSelf: 'flex-start' }}>
    <span style={{ display: 'flex', animation: saving ? 'spin 1s linear infinite' : 'none' }}>{saving ? Ico.spin : Ico.save}</span>
    {saving ? 'Saving...' : label}
  </button>
);

/* ── Image Upload Card ── */
const ImageUploadCard = ({ label, hint, currentUrl, uploadEndpoint, onUploaded, accept = 'image/*', isLogo }) => {
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const ref = useRef();

  // use currentUrl directly (component mounts after data is loaded)
  const preview = currentUrl || '';

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    try {
      const r = await API.post(uploadEndpoint, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      const url = r.data.logoUrl || r.data.faviconUrl;
      onUploaded(url);
      setUploaded(true);
      // Notify Layout to refresh logo
      window.dispatchEvent(new CustomEvent('site-settings-updated', { detail: { logoUrl: r.data.logoUrl, faviconUrl: r.data.faviconUrl } }));
      toast.success(`${label} updated!`);
    } catch { toast.error(`Failed to upload ${label}`); }
    setUploading(false);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
      {/* Preview box */}
      <div style={{ width: isLogo ? 140 : 72, height: 72, borderRadius: 10, border: '1.5px dashed #d1d5db', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
        {preview
          ? <img src={preview} alt={label} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 8 }} />
          : <span style={{ color: '#d1d5db', display: 'flex' }}>{Ico.image}</span>}
      </div>
      {/* Right side */}
      <div style={{ flex: 1, minWidth: 180 }}>
        <div style={{ fontWeight: 600, fontSize: '0.82rem', color: '#374151', marginBottom: 3 }}>{label}</div>
        {hint && <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: 12, lineHeight: 1.5 }}>{hint}</div>}
        <input ref={ref} type="file" accept={accept} style={{ display: 'none' }} onChange={handleFile} />
        <button
          onClick={() => ref.current.click()}
          disabled={uploading}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: '#fff', border: '1.5px solid #d1d5db', borderRadius: 8, padding: '7px 16px', fontSize: '0.8rem', fontWeight: 600, color: '#374151', cursor: uploading ? 'not-allowed' : 'pointer', opacity: uploading ? 0.6 : 1 }}>
          <span style={{ display: 'flex', animation: uploading ? 'spin 1s linear infinite' : 'none' }}>{uploading ? Ico.spin : Ico.upload}</span>
          {uploading ? 'Uploading...' : 'Choose File'}
        </button>
        {(preview || uploaded) && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '0.72rem', color: '#16a34a', marginTop: 8, fontWeight: 600 }}>
            <span style={{ display: 'flex' }}>{Ico.check}</span> {uploaded ? 'Updated successfully' : 'Current image set'}
          </div>
        )}
      </div>
    </div>
  );
};

/* ── Main Settings Page ── */
export default function Settings() {
  const [site, setSite] = useState({ siteName: 'SalaryTopUp', tagline: 'Instant Pay Relief', logoUrl: '', faviconUrl: '' });
  const [siteLoading, setSiteLoading] = useState(true);
  const [siteSaving, setSiteSaving] = useState(false);

  const [pw, setPw] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwSaving, setPwSaving] = useState(false);
  const [showPw, setShowPw] = useState({ cur: false, nw: false, cf: false });

  const [adminInfo, setAdminInfo] = useState({ name: '', email: '' });
  const [adminSaving, setAdminSaving] = useState(false);

  useEffect(() => {
    API.get('/site-settings')
      .then(r => { setSite({ siteName: r.data.siteName || 'SalaryTopUp', tagline: r.data.tagline || 'Instant Pay Relief', logoUrl: r.data.logoUrl || '', faviconUrl: r.data.faviconUrl || '' }); setSiteLoading(false); })
      .catch(() => setSiteLoading(false));
    API.get('/auth/me')
      .then(r => setAdminInfo({ name: r.data.name || '', email: r.data.email || '' }))
      .catch(() => {});
  }, []);

  const saveSite = async () => {
    setSiteSaving(true);
    try { await API.put('/site-settings', { siteName: site.siteName, tagline: site.tagline }); toast.success('Site identity saved!'); }
    catch { toast.error('Error saving'); }
    setSiteSaving(false);
  };

  const savePw = async () => {
    if (!pw.currentPassword || !pw.newPassword || !pw.confirmPassword) return toast.error('All fields required');
    if (pw.newPassword !== pw.confirmPassword) return toast.error('Passwords do not match');
    if (pw.newPassword.length < 6) return toast.error('Min 6 characters required');
    setPwSaving(true);
    try { await API.put('/auth/change-password', { currentPassword: pw.currentPassword, newPassword: pw.newPassword }); toast.success('Password changed!'); setPw({ currentPassword: '', newPassword: '', confirmPassword: '' }); }
    catch (err) { toast.error(err.response?.data?.message || 'Incorrect current password'); }
    setPwSaving(false);
  };

  const saveAdmin = async () => {
    setAdminSaving(true);
    try { await API.put('/auth/update-profile', { name: adminInfo.name, email: adminInfo.email }); toast.success('Profile updated!'); }
    catch (err) { toast.error(err.response?.data?.message || 'Error updating'); }
    setAdminSaving(false);
  };

  if (siteLoading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 80, gap: 10, color: '#94a3b8', fontSize: '0.9rem' }}>
      <span style={{ display: 'flex', animation: 'spin 1s linear infinite' }}>{Ico.spin}</span> Loading...
    </div>
  );

  return (
    <>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ maxWidth: 820 }}>

        {/* Page header */}
        <div style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0d2240', margin: 0 }}>Settings</h2>
          <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '4px 0 0' }}>Manage site identity, logo, favicon and admin credentials</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* 1. Site Identity */}
          <Section icon={Ico.globe} title="Site Identity" subtitle="Site name and tagline displayed on the website">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Field label="Site Name">
                <input style={inp} value={site.siteName} onChange={e => setSite(s => ({ ...s, siteName: e.target.value }))} placeholder="SalaryTopUp" />
              </Field>
              <Field label="Tagline" hint="Short slogan shown under the logo in the sidebar">
                <input style={inp} value={site.tagline} onChange={e => setSite(s => ({ ...s, tagline: e.target.value }))} placeholder="Instant Pay Relief" />
              </Field>
            </div>
            <SaveBtn saving={siteSaving} label="Save Identity" onClick={saveSite} />
          </Section>

          {/* 2. Logo & Favicon */}
          <Section icon={Ico.image} title="Logo & Favicon" subtitle="Upload site logo and browser tab favicon">
            <ImageUploadCard
              label="Site Logo"
              hint="PNG or WebP with transparent background · Min 200×60px · Shown in admin sidebar and website header"
              currentUrl={site.logoUrl}
              uploadEndpoint="/site-settings/upload-logo"
              onUploaded={url => setSite(s => ({ ...s, logoUrl: url }))}
              isLogo
            />

            <div style={{ height: 1, background: '#f1f5f9' }} />

            <ImageUploadCard
              label="Favicon"
              hint="PNG or ICO · 32×32px or 64×64px · Shown in the browser tab"
              currentUrl={site.faviconUrl}
              uploadEndpoint="/site-settings/upload-favicon"
              onUploaded={url => setSite(s => ({ ...s, faviconUrl: url }))}
              accept="image/png,image/x-icon,image/svg+xml,image/webp"
            />

            {/* Live Preview */}
            <div style={{ background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 14px', borderBottom: '1px solid #e2e8f0' }}>
                <span style={{ display: 'flex', color: '#94a3b8' }}>{Ico.preview}</span>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Live Preview</span>
              </div>
              {/* Browser tab mock */}
              <div style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginBottom: 6 }}>Browser Tab</div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 6, padding: '5px 12px' }}>
                  <div style={{ width: 14, height: 14, borderRadius: 2, overflow: 'hidden', background: '#e2e8f0', flexShrink: 0 }}>
                    {site.faviconUrl && <img src={site.faviconUrl} alt="fav" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />}
                  </div>
                  <span style={{ fontSize: '0.78rem', color: '#374151', fontWeight: 500 }}>{site.siteName || 'SalaryTopUp'} — {site.tagline || 'Instant Pay Relief'}</span>
                </div>
              </div>
              {/* Sidebar logo mock */}
              <div style={{ padding: '12px 16px' }}>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginBottom: 8 }}>Sidebar Logo</div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: '#0d2240', padding: '10px 16px', borderRadius: 10 }}>
                  <img
                    src={site.logoUrl || defaultLogo}
                    alt="logo preview"
                    style={{ height: 30, objectFit: 'contain', maxWidth: 120 }}
                  />
                  {!site.logoUrl && <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.88rem' }}>{site.siteName || 'SalaryTopUp'}</span>}
                </div>
              </div>
            </div>
          </Section>

          {/* 3. Admin Profile */}
          <Section icon={Ico.user} title="Admin Profile" subtitle="Update admin name and login email">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Field label="Admin Name">
                <input style={inp} value={adminInfo.name} onChange={e => setAdminInfo(a => ({ ...a, name: e.target.value }))} placeholder="Admin" />
              </Field>
              <Field label="Login Email">
                <input style={inp} type="email" value={adminInfo.email} onChange={e => setAdminInfo(a => ({ ...a, email: e.target.value }))} placeholder="admin@salarytopup.com" />
              </Field>
            </div>
            <SaveBtn saving={adminSaving} label="Save Profile" onClick={saveAdmin} />
          </Section>

          {/* 4. Change Password */}
          <Section icon={Ico.lock} title="Change Password" subtitle="Update your admin panel login password">
            {[
              ['currentPassword', 'Current Password', 'cur'],
              ['newPassword', 'New Password', 'nw'],
              ['confirmPassword', 'Confirm New Password', 'cf'],
            ].map(([key, label, eye]) => (
              <Field key={key} label={label}>
                <div style={{ position: 'relative' }}>
                  <input
                    style={{ ...inp, paddingRight: 42 }}
                    type={showPw[eye] ? 'text' : 'password'}
                    value={pw[key]}
                    onChange={e => setPw(p => ({ ...p, [key]: e.target.value }))}
                    placeholder="••••••••"
                  />
                  <button type="button" onClick={() => setShowPw(s => ({ ...s, [eye]: !s[eye] }))}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', padding: 0 }}>
                    {showPw[eye] ? Ico.eyeOff : Ico.eye}
                  </button>
                </div>
              </Field>
            ))}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: '10px 14px', fontSize: '0.78rem', color: '#92400e' }}>
              <span style={{ display: 'flex', flexShrink: 0, marginTop: 1 }}>{Ico.warn}</span>
              Password must be at least 6 characters. You will need to log in again after changing.
            </div>
            <SaveBtn saving={pwSaving} label="Update Password" onClick={savePw} />
          </Section>

        </div>
      </div>
    </>
  );
}