import React, { useEffect, useRef, useState } from 'react';
import API from '../api';
import toast from 'react-hot-toast';

const DEFAULTS = {
  logoUrl: '',
  description: 'Your trusted partner for emergency funds. We provide quick, collateral-free loans with transparent terms.',
  phone1: '+91 93557 53533',
  phone2: '+91 8448240723',
  whatsapp: '+91 8448240723',
  email: 'customercare@salarytopup.com',
  address: 'B-76, 2nd Floor, Wazirpur Industrial Area, Delhi – 110052',
  rbiText: 'RBI Registered NBFC Baid Stock Broking Services Private Limited\n(Reg. No. B-14.02553)',
  copyright: '© 2026 Salary TopUp. All Right Reserved',
  facebookUrl: 'https://www.facebook.com/profile.php?id=61574094973748',
  twitterUrl: 'https://x.com/SalaryTopup',
  instagramUrl: 'https://www.instagram.com/salary_topup',
  linkedinUrl: 'https://www.linkedin.com/company/salary-topup/',
  playstoreUrl: 'https://play.google.com/store/apps/details?id=com.salarytopup.salarytopup',
};

const Section = ({ icon, title, children }) => (
  <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e8eef2', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 22px', borderBottom: '1px solid #f1f5f9', background: '#fafcfd' }}>
      <span style={{ display: 'flex', alignItems: 'center' }}>{icon}</span>
      <span style={{ fontWeight: 700, fontSize: '0.92rem', color: '#0d2240' }}>{title}</span>
    </div>
    <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 16 }}>
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

const inputStyle = {
  width: '100%', padding: '9px 12px', border: '1.5px solid #e2e8f0',
  borderRadius: 8, fontSize: '0.85rem', color: '#0d2240',
  outline: 'none', boxSizing: 'border-box', background: '#fff',
  transition: 'border-color 0.15s',
};
const taStyle = { ...inputStyle, resize: 'vertical', lineHeight: 1.6 };

const SocialIcons = {
  facebook: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="#1877F2"><path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.887v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/></svg>
  ),
  twitter: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="#000"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.63L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
  ),
  instagram: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="url(#igGrad)"><defs><radialGradient id="igGrad" cx="30%" cy="107%" r="150%"><stop offset="0%" stopColor="#fdf497"/><stop offset="5%" stopColor="#fdf497"/><stop offset="45%" stopColor="#fd5949"/><stop offset="60%" stopColor="#d6249f"/><stop offset="90%" stopColor="#285AEB"/></radialGradient></defs><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>
  ),
  linkedin: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="#0A66C2"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
  ),
};

const socialBg = { facebook: '#e7f0ff', twitter: '#f0f0f0', instagram: '#fff0f5', linkedin: '#e8f0fb' };

const SocialRow = ({ iconKey, label, value, onChange, placeholder }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
    <div style={{ width: 38, height: 38, borderRadius: 10, background: socialBg[iconKey] || '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      {SocialIcons[iconKey]}
    </div>
    <div style={{ flex: 1 }}>
      <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 4 }}>{label}</label>
      <input style={inputStyle} type="url" value={value} onChange={onChange} placeholder={placeholder} />
    </div>
  </div>
);

const LogoUpload = ({ logoUrl, onUploaded }) => {
  const [uploading, setUploading] = useState(false);
  const ref = useRef();
  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    try {
      const r = await API.post('/footer-settings/upload-logo', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      onUploaded(r.data.logoUrl);
      toast.success('Footer logo updated!');
    } catch { toast.error('Upload failed'); }
    setUploading(false);
  };
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 18, padding: '14px 0', borderBottom: '1px solid #f1f5f9', marginBottom: 4 }}>
      {/* Preview */}
      <div style={{ width: 140, height: 56, borderRadius: 10, border: '1.5px dashed #d1d5db', background: '#0d2240', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden', padding: 8 }}>
        {logoUrl
          ? <img src={logoUrl} alt="Footer Logo" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
          : <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', textAlign: 'center' }}>No logo set</span>}
      </div>
      {/* Info + button */}
      <div>
        <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#0d2240', marginBottom: 3 }}>Footer Logo</div>
        <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: 10 }}>Shown in footer on dark background · PNG/WebP recommended</div>
        <input ref={ref} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
        <button
          onClick={() => ref.current.click()}
          disabled={uploading}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: '#fff', border: '1.5px solid #d1d5db', borderRadius: 8, padding: '7px 16px', fontSize: '0.8rem', fontWeight: 600, color: '#374151', cursor: uploading ? 'not-allowed' : 'pointer', opacity: uploading ? 0.6 : 1 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>
          {uploading ? 'Uploading...' : 'Choose File'}
        </button>
        {logoUrl && <div style={{ fontSize: '0.7rem', color: '#16a34a', marginTop: 7, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Logo set
        </div>}
      </div>
    </div>
  );
};

export default function FooterSettings() {
  const [form, setForm] = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    API.get('/footer-settings')
      .then(r => { setForm({ ...DEFAULTS, ...r.data }); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await API.put('/footer-settings', form);
      toast.success('Footer settings saved!');
    } catch {
      toast.error('Error saving footer settings');
    }
    setSaving(false);
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 80, color: '#94a3b8', fontSize: '0.9rem' }}>Loading...</div>;

  return (
    <div style={{ maxWidth: 1100 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0d2240', margin: 0 }}>Footer Settings</h2>
          <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '4px 0 0' }}>Manage all footer content shown on the website</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{ background: 'linear-gradient(135deg, #2C6275, #3a8fa0)', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 28px', fontWeight: 700, fontSize: '0.88rem', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Two column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* LEFT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Brand */}
          <Section icon={<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#25557E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/></svg>} title="Brand Description">
            <LogoUpload logoUrl={form.logoUrl} onUploaded={url => setForm(f => ({ ...f, logoUrl: url }))} />
            <Field label="Description" hint="Shown under the logo in the footer">
              <textarea style={{ ...taStyle }} rows={4} value={form.description} onChange={set('description')} placeholder="Your trusted partner for..." />
            </Field>
          </Section>

          {/* Contact */}
          <Section icon={<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#25557E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.84a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>} title="Contact Information">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Phone 1">
                <input style={inputStyle} type="text" value={form.phone1} onChange={set('phone1')} placeholder="+91 93557 53533" />
              </Field>
              <Field label="Phone 2">
                <input style={inputStyle} type="text" value={form.phone2} onChange={set('phone2')} placeholder="+91 8448240723" />
              </Field>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="WhatsApp Number">
                <input style={inputStyle} type="text" value={form.whatsapp} onChange={set('whatsapp')} placeholder="+91 8448240723" />
              </Field>
              <Field label="Email Address">
                <input style={inputStyle} type="email" value={form.email} onChange={set('email')} placeholder="customercare@..." />
              </Field>
            </div>
          </Section>

          {/* Social Media */}
          <Section icon={<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#25557E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>} title="Social Media Links">
            <SocialRow iconKey="facebook" label="Facebook" value={form.facebookUrl} onChange={set('facebookUrl')} placeholder="https://facebook.com/..." />
            <SocialRow iconKey="twitter" label="Twitter / X" value={form.twitterUrl} onChange={set('twitterUrl')} placeholder="https://x.com/..." />
            <SocialRow iconKey="instagram" label="Instagram" value={form.instagramUrl} onChange={set('instagramUrl')} placeholder="https://instagram.com/..." />
            <SocialRow iconKey="linkedin" label="LinkedIn" value={form.linkedinUrl} onChange={set('linkedinUrl')} placeholder="https://linkedin.com/company/..." />
          </Section>

        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Address & Legal */}
          <Section icon={<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#25557E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="22" x2="21" y2="22"/><line x1="6" y1="18" x2="6" y2="11"/><line x1="10" y1="18" x2="10" y2="11"/><line x1="14" y1="18" x2="14" y2="11"/><line x1="18" y1="18" x2="18" y2="11"/><polygon points="12 2 2 7 22 7"/></svg>} title="Address & Legal">
            <Field label="Registered Office Address">
              <textarea style={taStyle} rows={2} value={form.address} onChange={set('address')} placeholder="B-76, 2nd Floor..." />
            </Field>
            <Field label="RBI Registration Text" hint="Shown in the bottom bar of footer">
              <textarea style={taStyle} rows={3} value={form.rbiText} onChange={set('rbiText')} placeholder="RBI Registered NBFC..." />
            </Field>
            <Field label="Copyright Text">
              <input style={inputStyle} type="text" value={form.copyright} onChange={set('copyright')} placeholder="© 2026 Salary TopUp..." />
            </Field>
          </Section>

          {/* App Links */}
          <Section icon={<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#25557E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>} title="App Store Links">
            <Field label="Google Play Store URL" hint="Link for the 'Get it on Google Play' button">
              <input style={inputStyle} type="url" value={form.playstoreUrl} onChange={set('playstoreUrl')} placeholder="https://play.google.com/store/apps/..." />
            </Field>
          </Section>

          {/* Live Preview */}
          <div style={{ background: '#0d2240', borderRadius: 14, padding: '20px 22px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 14px' }}>Footer Preview</p>
            <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)', margin: '0 0 12px', lineHeight: 1.6 }}>{form.description}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
              <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>{form.phone1}</span>
              <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>{form.whatsapp}</span>
              <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>{form.email}</span>
            </div>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 12 }}>
              <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', margin: '0 0 4px' }}>{form.address}</p>
              <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', margin: 0 }}>{form.copyright}</p>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom save */}
      <div style={{ marginTop: 24, paddingBottom: 40 }}>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{ background: 'linear-gradient(135deg, #2C6275, #3a8fa0)', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 36px', fontWeight: 700, fontSize: '0.92rem', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}
        >
          {saving ? 'Saving...' : 'Save All Changes'}
        </button>
      </div>
    </div>
  );
}