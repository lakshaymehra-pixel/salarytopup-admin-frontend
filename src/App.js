import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Blogs from './pages/Blogs';
import BlogForm from './pages/BlogForm';
import Contacts from './pages/Contacts';
import Applications from './pages/Applications';
import Settings from './pages/Settings';
import MediaPage from './pages/MediaPage';
import Categories from './pages/Categories';
import Authors from './pages/Authors';
import FormLeads from './pages/FormLeads';
import NewsletterLeads from './pages/NewsletterLeads';
import ChatbotLeads from './pages/ChatbotLeads';
import CmsEditor from './pages/CmsEditor';
import Faqs from './pages/Faqs';
import Keywords from './pages/Keywords';
import Testimonials from './pages/Testimonials';
import FooterSettings from './pages/FooterSettings';
import SeoDashboard from './pages/seo/SeoDashboard';
import KeywordRankings from './pages/seo/KeywordRankings';
import KeywordSuggestions from './pages/seo/KeywordSuggestions';
import PagePerformance from './pages/seo/PagePerformance';
import ContentOptimizer from './pages/seo/ContentOptimizer';
import MetaTagsManager from './pages/seo/MetaTagsManager';
import InternalLinking from './pages/seo/InternalLinking';
import IndexingSitemap from './pages/seo/IndexingSitemap';
import SiteHealth from './pages/seo/SiteHealth';
import TrafficAnalytics from './pages/seo/TrafficAnalytics';
import SeoAlerts from './pages/seo/SeoAlerts';
import SeoSettings from './pages/seo/SeoSettings';
import Careers from './pages/Careers';
import JobApplications from './pages/JobApplications';

const PrivateRoute = ({ children }) => {
  return localStorage.getItem('token') ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="blogs" element={<Blogs />} />
          <Route path="blogs/new" element={<BlogForm />} />
          <Route path="blogs/edit/:id" element={<BlogForm />} />
          <Route path="media" element={<MediaPage />} />
          <Route path="blog/categories" element={<Categories />} />
          <Route path="blog/authors" element={<Authors />} />
          <Route path="leads/forms" element={<FormLeads />} />
          <Route path="leads/newsletter" element={<NewsletterLeads />} />
          <Route path="leads/chatbot" element={<ChatbotLeads />} />
          <Route path="cms" element={<CmsEditor />} />
          <Route path="cms/:slug" element={<CmsEditor />} />
          <Route path="faqs" element={<Faqs />} />
          <Route path="keywords" element={<Keywords />} />
          <Route path="testimonials" element={<Testimonials />} />
          <Route path="contacts" element={<Contacts />} />
          <Route path="applications" element={<Applications />} />
          <Route path="settings" element={<Settings />} />
          <Route path="careers" element={<Careers />} />
          <Route path="job-applications" element={<JobApplications />} />
          <Route path="footer-settings" element={<FooterSettings />} />
          <Route path="seo/dashboard" element={<SeoDashboard />} />
          <Route path="seo/keyword-rankings" element={<KeywordRankings />} />
          <Route path="seo/keyword-suggestions" element={<KeywordSuggestions />} />
          <Route path="seo/page-performance" element={<PagePerformance />} />
          <Route path="seo/content-optimizer" element={<ContentOptimizer />} />
          <Route path="seo/meta-tags" element={<MetaTagsManager />} />
          <Route path="seo/internal-linking" element={<InternalLinking />} />
          <Route path="seo/indexing-sitemap" element={<IndexingSitemap />} />
          <Route path="seo/site-health" element={<SiteHealth />} />
          <Route path="seo/traffic-analytics" element={<TrafficAnalytics />} />
          <Route path="seo/alerts" element={<SeoAlerts />} />
          <Route path="seo/settings" element={<SeoSettings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
