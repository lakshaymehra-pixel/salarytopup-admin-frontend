import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import defaultLogo from '../logo-st.webp';
import API from '../api';
import './Layout.css';

const Icons = {
  dashboard: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  blogs: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>,
  contacts: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  applications: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>,
  settings: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  logout: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  menu: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  user: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  chevron: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>,
  allposts: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
  addnew: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>,
  media: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
  category: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>,
  authors: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  leads: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>,
  form: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  newsletter: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  cms: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>,
  cmspage: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>,
  faq: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  keywords: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  testimonials: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  career: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/></svg>,
  footer: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="17" x2="21" y2="17"/><line x1="7" y1="21" x2="7" y2="17"/><line x1="12" y1="21" x2="12" y2="17"/><line x1="17" y1="21" x2="17" y2="17"/></svg>,
};

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [logoUrl, setLogoUrl] = useState('');

  useEffect(() => {
    API.get('/site-settings').then(r => { if (r.data.logoUrl) setLogoUrl(r.data.logoUrl); }).catch(() => {});
    const onUpdate = (e) => { if (e.detail?.logoUrl) setLogoUrl(e.detail.logoUrl); };
    window.addEventListener('site-settings-updated', onUpdate);
    return () => window.removeEventListener('site-settings-updated', onUpdate);
  }, []);
  const isBlogPath = location.pathname.startsWith('/blog') || location.pathname.startsWith('/blogs') || location.pathname === '/media';
  const isLeadsPath = location.pathname.startsWith('/leads');
  const isCmsPath = location.pathname.startsWith('/cms');
  const isFaqPath = location.pathname.startsWith('/faqs');
  const isSeoPath = location.pathname.startsWith('/seo');
  const isJobPath = location.pathname.startsWith('/careers') || location.pathname.startsWith('/job-applications');
  const [blogOpen, setBlogOpen] = useState(isBlogPath);
  const [leadsOpen, setLeadsOpen] = useState(isLeadsPath);
  const [cmsOpen, setCmsOpen] = useState(isCmsPath);
  const [seoOpen, setSeoOpen] = useState(isSeoPath);
  const [jobOpen, setJobOpen] = useState(isJobPath);

  const isBlogActive = isBlogPath;
  const isLeadsActive = isLeadsPath;

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className={`adm-layout ${collapsed ? 'collapsed' : ''}`}>
      <aside className="adm-sidebar">
        <div className="adm-logo">
          <img src={logoUrl || defaultLogo} alt="SalaryTopUp" className="adm-logo-img" />
          {!collapsed && <span className="adm-logo-text">SalaryTopUp</span>}
          <button className="adm-toggle-sb" onClick={() => setCollapsed(c => !c)} title="Toggle sidebar">
            {Icons.menu}
          </button>
        </div>

        <nav className="adm-nav">
          {/* Dashboard */}
          {!collapsed && <div className="adm-nav-section">Main</div>}
          <NavLink to="/" end className={({ isActive }) => `adm-nav-item ${isActive ? 'active' : ''}`}>
            <span className="adm-nav-icon">{Icons.dashboard}</span>
            {!collapsed && <span className="adm-nav-label">Dashboard</span>}
          </NavLink>

          {/* Blog — dropdown */}
          {!collapsed && <div className="adm-nav-section">Content</div>}
          <div className={`adm-nav-group ${isBlogActive ? 'group-active' : ''}`}>
            <button className={`adm-nav-item adm-nav-parent ${isBlogActive ? 'active' : ''}`} onClick={() => setBlogOpen(o => !o)}>
              <span className="adm-nav-icon">{Icons.blogs}</span>
              {!collapsed && <><span className="adm-nav-label">Blog</span><span className={`adm-chevron ${blogOpen ? 'open' : ''}`}>{Icons.chevron}</span></>}
            </button>
            {blogOpen && !collapsed && (
              <div className="adm-subnav">
                <NavLink to="/blogs" end className={({ isActive }) => `adm-sub-item ${isActive ? 'active' : ''}`}>
                  <span className="adm-sub-icon">{Icons.allposts}</span>All Posts
                </NavLink>
                <NavLink to="/blogs/new" className={({ isActive }) => `adm-sub-item ${isActive ? 'active' : ''}`}>
                  <span className="adm-sub-icon">{Icons.addnew}</span>Add New
                </NavLink>
                <NavLink to="/media" className={({ isActive }) => `adm-sub-item ${isActive ? 'active' : ''}`}>
                  <span className="adm-sub-icon">{Icons.media}</span>Media
                </NavLink>
                <NavLink to="/blog/categories" className={({ isActive }) => `adm-sub-item ${isActive ? 'active' : ''}`}>
                  <span className="adm-sub-icon">{Icons.category}</span>Categories
                </NavLink>
                <NavLink to="/blog/authors" className={({ isActive }) => `adm-sub-item ${isActive ? 'active' : ''}`}>
                  <span className="adm-sub-icon">{Icons.authors}</span>Authors
                </NavLink>
              </div>
            )}
          </div>

          {/* CMS — dropdown */}
          <div className={`adm-nav-group ${isCmsPath ? 'group-active' : ''}`}>
            <button className={`adm-nav-item adm-nav-parent ${isCmsPath ? 'active' : ''}`} onClick={() => setCmsOpen(o => !o)}>
              <span className="adm-nav-icon">{Icons.cms}</span>
              {!collapsed && <><span className="adm-nav-label">CMS Pages</span><span className={`adm-chevron ${cmsOpen ? 'open' : ''}`}>{Icons.chevron}</span></>}
            </button>
            {cmsOpen && !collapsed && (
              <div className="adm-subnav">
                <NavLink to="/cms/about-us" className={({ isActive }) => `adm-sub-item ${isActive ? 'active' : ''}`}>
                  <span className="adm-sub-icon">{Icons.cmspage}</span>About Us
                </NavLink>
                <NavLink to="/cms/contact" className={({ isActive }) => `adm-sub-item ${isActive ? 'active' : ''}`}>
                  <span className="adm-sub-icon">{Icons.cmspage}</span>Contact
                </NavLink>
                <NavLink to="/cms/privacy-policy" className={({ isActive }) => `adm-sub-item ${isActive ? 'active' : ''}`}>
                  <span className="adm-sub-icon">{Icons.cmspage}</span>Privacy Policy
                </NavLink>
                <NavLink to="/cms/terms-and-conditions" className={({ isActive }) => `adm-sub-item ${isActive ? 'active' : ''}`}>
                  <span className="adm-sub-icon">{Icons.cmspage}</span>Terms & Conditions
                </NavLink>
                <NavLink to="/cms/rate-and-terms" className={({ isActive }) => `adm-sub-item ${isActive ? 'active' : ''}`}>
                  <span className="adm-sub-icon">{Icons.cmspage}</span>Rate & Terms
                </NavLink>
              </div>
            )}
          </div>

          <NavLink to="/faqs" className={({ isActive }) => `adm-nav-item ${isActive || isFaqPath ? 'active' : ''}`}>
            <span className="adm-nav-icon">{Icons.faq}</span>
            {!collapsed && <span className="adm-nav-label">FAQs</span>}
          </NavLink>

          <NavLink to="/testimonials" className={({ isActive }) => `adm-nav-item ${isActive ? 'active' : ''}`}>
            <span className="adm-nav-icon">{Icons.testimonials}</span>
            {!collapsed && <span className="adm-nav-label">Testimonials</span>}
          </NavLink>

          {/* Jobs — dropdown */}
          <div className={`adm-nav-group ${isJobPath ? 'group-active' : ''}`}>
            <button className={`adm-nav-item adm-nav-parent ${isJobPath ? 'active' : ''}`} onClick={() => setJobOpen(o => !o)}>
              <span className="adm-nav-icon">{Icons.career}</span>
              {!collapsed && <><span className="adm-nav-label">Jobs</span><span className={`adm-chevron ${jobOpen ? 'open' : ''}`}>{Icons.chevron}</span></>}
            </button>
            {jobOpen && !collapsed && (
              <div className="adm-subnav">
                <NavLink to="/careers" className={({ isActive }) => `adm-sub-item ${isActive ? 'active' : ''}`}>
                  <span className="adm-sub-icon">{Icons.career}</span>Careers
                </NavLink>
                <NavLink to="/job-applications" className={({ isActive }) => `adm-sub-item ${isActive ? 'active' : ''}`}>
                  <span className="adm-sub-icon">{Icons.form}</span>Job Applications
                </NavLink>
              </div>
            )}
          </div>

          {/* Leads — dropdown */}
          {!collapsed && <div className="adm-nav-section">Leads</div>}
          <div className={`adm-nav-group ${isLeadsActive ? 'group-active' : ''}`}>
            <button className={`adm-nav-item adm-nav-parent ${isLeadsActive ? 'active' : ''}`} onClick={() => setLeadsOpen(o => !o)}>
              <span className="adm-nav-icon">{Icons.leads}</span>
              {!collapsed && <><span className="adm-nav-label">Leads</span><span className={`adm-chevron ${leadsOpen ? 'open' : ''}`}>{Icons.chevron}</span></>}
            </button>
            {leadsOpen && !collapsed && (
              <div className="adm-subnav">
                <NavLink to="/leads/forms" className={({ isActive }) => `adm-sub-item ${isActive ? 'active' : ''}`}>
                  <span className="adm-sub-icon">{Icons.form}</span>Form Leads
                </NavLink>
                <NavLink to="/leads/newsletter" className={({ isActive }) => `adm-sub-item ${isActive ? 'active' : ''}`}>
                  <span className="adm-sub-icon">{Icons.newsletter}</span>Newsletter
                </NavLink>
                <NavLink to="/leads/chatbot" className={({ isActive }) => `adm-sub-item ${isActive ? 'active' : ''}`}>
                  <span className="adm-sub-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><line x1="9" y1="10" x2="15" y2="10"/><line x1="12" y1="7" x2="12" y2="13"/></svg>
                  </span>Chatbot Leads
                </NavLink>
              </div>
            )}
          </div>

          {/* SEO — dropdown */}
          {!collapsed && <div className="adm-nav-section">SEO & Settings</div>}
          <div className={`adm-nav-group ${isSeoPath ? 'group-active' : ''}`}>
            <button className={`adm-nav-item adm-nav-parent ${isSeoPath ? 'active' : ''}`} onClick={() => setSeoOpen(o => !o)}>
              <span className="adm-nav-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </span>
              {!collapsed && (
                <>
                  <span className="adm-nav-label">SEO</span>
                  <span className={`adm-chevron ${seoOpen ? 'open' : ''}`}>{Icons.chevron}</span>
                </>
              )}
            </button>
            {seoOpen && !collapsed && (
              <div className="adm-subnav">
                <NavLink to="/seo/dashboard" className={({ isActive }) => `adm-sub-item ${isActive ? 'active' : ''}`}>
                  <span className="adm-sub-icon">{Icons.dashboard}</span>SEO Dashboard
                </NavLink>
                <NavLink to="/seo/keyword-rankings" className={({ isActive }) => `adm-sub-item ${isActive ? 'active' : ''}`}>
                  <span className="adm-sub-icon">{Icons.keywords}</span>Keyword Rankings
                </NavLink>
                <NavLink to="/seo/keyword-suggestions" className={({ isActive }) => `adm-sub-item ${isActive ? 'active' : ''}`}>
                  <span className="adm-sub-icon">{Icons.keywords}</span>Keyword Suggestions
                </NavLink>
                <NavLink to="/seo/content-optimizer" className={({ isActive }) => `adm-sub-item ${isActive ? 'active' : ''}`}>
                  <span className="adm-sub-icon">{Icons.blogs}</span>Content Optimizer
                </NavLink>
                <NavLink to="/seo/meta-tags" className={({ isActive }) => `adm-sub-item ${isActive ? 'active' : ''}`}>
                  <span className="adm-sub-icon">{Icons.cmspage}</span>Meta Tags
                </NavLink>
                <NavLink to="/seo/internal-linking" className={({ isActive }) => `adm-sub-item ${isActive ? 'active' : ''}`}>
                  <span className="adm-sub-icon">{Icons.allposts}</span>Internal Linking
                </NavLink>
                <NavLink to="/seo/site-health" className={({ isActive }) => `adm-sub-item ${isActive ? 'active' : ''}`}>
                  <span className="adm-sub-icon">{Icons.applications}</span>Site Health
                </NavLink>
                <NavLink to="/seo/indexing-sitemap" className={({ isActive }) => `adm-sub-item ${isActive ? 'active' : ''}`}>
                  <span className="adm-sub-icon">{Icons.media}</span>Indexing & Sitemap
                </NavLink>
                <NavLink to="/seo/alerts" className={({ isActive }) => `adm-sub-item ${isActive ? 'active' : ''}`}>
                  <span className="adm-sub-icon">{Icons.contacts}</span>Alerts
                </NavLink>
                <NavLink to="/seo/settings" className={({ isActive }) => `adm-sub-item ${isActive ? 'active' : ''}`}>
                  <span className="adm-sub-icon">{Icons.settings}</span>SEO Settings
                </NavLink>
              </div>
            )}
          </div>

          {/* Footer Settings */}
          <NavLink to="/footer-settings" className={({ isActive }) => `adm-nav-item ${isActive ? 'active' : ''}`}>
            <span className="adm-nav-icon">{Icons.footer}</span>
            {!collapsed && <span className="adm-nav-label">Footer</span>}
          </NavLink>

          {/* Settings */}
          <NavLink to="/settings" className={({ isActive }) => `adm-nav-item ${isActive ? 'active' : ''}`}>
            <span className="adm-nav-icon">{Icons.settings}</span>
            {!collapsed && <span className="adm-nav-label">Settings</span>}
          </NavLink>
        </nav>

        <button className="adm-logout" onClick={logout}>
          <span className="adm-nav-icon">{Icons.logout}</span>
          {!collapsed && <span>Logout</span>}
        </button>
      </aside>

      <div className="adm-main">
        <header className="adm-header">
          <button className="adm-toggle" onClick={() => setCollapsed(!collapsed)}>{Icons.menu}</button>
          <div className="adm-header-right">
            <div className="adm-admin-badge">
              <span className="adm-admin-icon">{Icons.user}</span>
              <span>Admin</span>
            </div>
          </div>
        </header>
        <main className="adm-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}