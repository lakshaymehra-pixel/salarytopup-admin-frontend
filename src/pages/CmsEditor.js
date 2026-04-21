import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api';
import toast from 'react-hot-toast';
import './BlogForm.css';
import './CmsEditor.css';

const PAGES = [
  { slug: 'terms-and-conditions', label: 'Terms & Conditions' },
  { slug: 'privacy-policy', label: 'Privacy Policy' },
  { slug: 'rate-and-terms', label: 'Rate & Terms' },
  { slug: 'contact', label: 'Contact' },
  { slug: 'about-us', label: 'About Us' },
];

// Extract plain text HTML from JSX-style content (for seeding existing content)
const DEFAULT_CONTENT = {
  'terms-and-conditions': `<h2>Welcome to Salary Topup</h2><p>Powered by Baid Stock Broking Services Private Limited.</p><p>If you visit our website and use our services, you agree to be bound by the following terms and conditions.</p><p>We reserve the right to modify these Terms and Conditions at any time. Any changes will be posted on this page with the updated date, and your continued use of our services constitutes acceptance of those changes.</p><p><strong>Please Read Carefully All Terms &amp; Conditions</strong></p><h2>1. Eligibility Criteria</h2><ul><li><strong>Age Requirement:</strong> You must be at least 18 years of age to apply for a loan.</li><li><strong>Residency Requirement:</strong> You must be a legal resident of the country.</li><li><strong>Bank Account Requirement:</strong> You must have a bank account in your own name in the country where you live.</li></ul><h2>2. Loan Application Process</h2><ul><li><strong>How to Apply:</strong> To apply for a loan, visit the website, click on "Apply Now," and complete the online application process.</li><li><strong>Required Documentation:</strong> You may need to provide the following:<ul><li>Latest 3-month salary slip &amp; latest 6-month bank statement</li><li>Aadhaar card (front and back) and PAN card</li><li>Electricity bill (if own house or rented) and rent agreement</li><li>One bill from: Wi-Fi bill, credit bill, gas bill, or water bill</li><li>Two reference numbers with names and relationships</li><li>Office address and email ID with landmark (work from home or office)</li><li>WhatsApp current location and an alternate mobile number</li></ul></li></ul><h2>3. Loan Approval and Disbursement</h2><ul><li><strong>Approval Process:</strong> Once we evaluate your application and documentation, if approved, you will receive a loan offer.</li><li><strong>Disbursement Timeline:</strong> Upon approval, the loan will be processed and disbursed. Approval and disbursement times may vary based on the completeness and accuracy of your application and documents.</li></ul><h2>4. Repayment &amp; Interest Rate Terms</h2><ul><li><strong>Repayment Schedule:</strong> Repayments will be made based on the agreed schedule. Failure to repay on time may result in penalties or other actions as specified in the loan agreement.</li><li><strong>Interest Rates:</strong> Loan interest rates will be disclosed in the loan agreement, which is 1% per day.</li><li><strong>Late Payments and Penalties:</strong> Late payments may incur additional fees. If payments are not received by the due date, further penalties may apply.</li><li><strong>No Hidden Fees:</strong> We are committed to transparency. All fees and charges will be clearly disclosed before you accept any loan offer.</li></ul><h2>5. Prohibited Activities</h2><ul><li><strong>Fraudulent Activities:</strong> You agree not to engage in any fraudulent activities or misrepresent your identity during the loan process.</li><li><strong>Legal Compliance:</strong> You must respect all local laws and regulations while using our services, including any specific financial regulations in your country of residence.</li></ul><h2>6. Privacy Policy</h2><ul><li><strong>Data Collection:</strong> We collect personal and financial information during the loan application process to evaluate eligibility, provide services, and improve user experience.</li><li><strong>Data Usage:</strong> Your data will only be used for processing your loan application, communicating with you, and providing customer support.</li><li><strong>Data Protection:</strong> We take data security seriously and protect your personal information from unauthorized access.</li></ul><h2>7. Termination of Services</h2><ul><li><strong>Grounds for Termination:</strong> We reserve the right to terminate services for violation of these Terms, non-payment of loans, or any other breach of agreement.</li><li><strong>Process of Termination:</strong> If services are terminated, you will be notified, and all outstanding obligations must be fulfilled.</li></ul><h2>8. Limitation of Liability</h2><ul><li><strong>Scope of Liability:</strong> Our liability is limited to the maximum extent permitted by law, and we are not liable for any indirect, incidental, or consequential damages.</li><li><strong>Exclusion of Indirect Damages:</strong> We are not responsible for damages resulting from delays, loss of profits, or other indirect consequences of using our services.</li><li><strong>Maximum Liability:</strong> The maximum liability we are responsible for is limited to the total amount of the loan you applied for.</li></ul><h2>Contact Us</h2><p>If you have any questions or concerns about these Terms, please contact us at:</p><p><strong>Email:</strong> Customercare@salarytopup.com</p><p><strong>Phone:</strong> +91 9355753533</p><p>By using our services, you acknowledge that you have read, understood, and agree to be bound by these Terms &amp; Conditions. Failure to do so may result in you being held accountable for any losses.</p>`,
  'privacy-policy': `<p><strong>Baid Stock Broking Services Private Limited</strong> ("we," "our," "us") operates the https://www.salarytopup.com website (the "Service"). This Privacy Policy explains how we collect, use, and share your personal information when you use our Service.</p><h2>Information We Collection</h2><p><strong>Personal Information:</strong> When you apply for a loan or use our Services, we may collect personal information such as your Name, address, email address, phone number, date of birth, and other identifying information.</p><p><strong>Usage Information:</strong> We may collect information about how you access and use our website and services, including IP addresses, browser type, and operating system.</p><p><strong>Financial Information:</strong> Bank account details, credit card information, credit history, and other financial data necessary for providing our services.</p><p><strong>Identification Documents:</strong> Copies of government-issued identification documents, such as passports or driver's licenses.</p><h2>How We Use Your Information</h2><p>We use your information for the following purposes:</p><ul><li>To provide and maintain our services.</li><li>To process your transactions and manage your accounts.</li><li>To verify your identity and prevent fraud.</li></ul><h2>Data Security</h2><p>We implement appropriate technical and organisational measures to protect your personal information from unauthorised access, use, or disclosure. However, no method of transmission over the internet or electronic storage is 100% secure.</p><h2>Your Rights</h2><p>Depending on your jurisdiction, you may have the following rights regarding your personal information:</p><ul><li>The right to access your personal information.</li><li>The right to correct any inaccurate or incomplete information.</li><li>The right to request the deletion of your personal information.</li><li>The right to object to or restrict the processing of your personal information.</li></ul><p>To exercise these rights, please contact us using the information provided below.</p><h2>Data Retention and Deletion</h2><p>You also attest to the fact that, in accordance with our adopted document retention policy, we will be free to keep such papers for internal records.</p><p>You have the choice to consent to the use of certain data, limit its disclosure to third parties, control data retention, or revoke consent that has already been given to collect personal data if the Credit Line you were given is settled and you owe them nothing more, and you obtain specific regulatory authority in accordance with the Prevention of Money-Laundering Act, 2002.</p><ul><li>You have a right to request the deletion of your personal information.</li></ul><h2>Cookies and Tracking Technologies</h2><p>We use cookies and similar tracking technologies to enhance your experience on our website. You can control the use of cookies through your browser settings.</p><h2>Grievance Officer</h2><p>At Salary Topup, your privacy and satisfaction are our top priorities. To ensure your concerns are addressed promptly, we have appointed a dedicated Grievance Officer. If you have any issues or grievances regarding your personal information or our services, please do not hesitate to reach out.</p><h2>Contact Our Team</h2><p><strong>Customer Care</strong></p><p><strong>Phone:</strong> +91 9355753533</p><p><strong>Email:</strong> Customercare@salarytopup.com</p><p><strong>Address:</strong> B-76, 2nd Floor, Wazirpur Industrial Area, Delhi – 110052</p><p>We are committed to resolving your concerns in a timely and efficient manner. Thank you for choosing Salary Topup.</p><h2>Changes to this Privacy Policy</h2><p>We may update this Privacy Policy from time to time. We will notify you of any significant changes by posting the new Privacy Policy on our website.</p>`,
  'rate-and-terms': `<h2>Loan Rate &amp; Terms</h2><p>All loan rates and terms are transparent and disclosed before you accept any offer. Salary Topup is committed to zero hidden charges.</p><h2>1. Loan Amount</h2><ul><li><strong>Minimum Loan:</strong> ₹5,000</li><li><strong>Maximum Loan:</strong> ₹1,00,000</li></ul><h2>2. Interest Rate</h2><ul><li><strong>Rate:</strong> 1% per day on the outstanding principal amount.</li><li><strong>Annualised Rate:</strong> Up to 365% per annum.</li></ul><h2>3. Loan Tenure</h2><ul><li><strong>Minimum Tenure:</strong> 7 days</li><li><strong>Maximum Tenure:</strong> 40 days</li></ul><h2>4. Fees &amp; Charges</h2><ul><li><strong>Processing Fee:</strong> Disclosed at the time of application.</li><li><strong>No Hidden Charges:</strong> All fees are clearly disclosed before loan acceptance.</li></ul><h2>5. Contact Us</h2><div><p><strong>Email:</strong> Customercare@salarytopup.com</p><p><strong>Phone:</strong> +91 9355753533</p></div>`,
  'contact': `<h2>Contact Information</h2><p>We'd love to hear from you — send us a message or reach out directly.</p><h2>Address</h2><p>B-76, 2nd Floor, Wazirpur Industrial Area, Delhi 110052</p><h2>Phone</h2><p>+91 9355753533 (Monday - Saturday, 9 AM to 7 PM)</p><h2>WhatsApp</h2><p>+91-9899001138 | +91-8448240723</p><h2>Email</h2><p>customercare@salarytopup.com</p>`,
  'about-us': `<h2>Our Story</h2><h3>Building Financial Bridges</h3><p>At SalaryTopup, we understand that financial needs can arise anytime—whether it's an emergency or a personal goal. Our journey began with a vision to make salary loans simple, fast, and accessible for salaried professionals across India. As a technology-driven NBFC, we provide a fully digital lending experience with quick approvals, minimal documentation, and transparent processes. Our mission is to remove the complexities of traditional lending and provide reliable financial support whenever it is needed.</p><h2>Our Mission</h2><p>To provide fast, transparent, and accessible financial solutions to salaried professionals across India — empowering them to meet their immediate needs without stress or delay.</p><h2>Our Vision</h2><p>To become India's most trusted salary loan platform — known for speed, simplicity, and customer-first service.</p>`,
};

function RichEditor({ value, onChange, resetKey }) {
  const ref = useRef(null);
  const loaded = useRef(false);

  useEffect(() => { loaded.current = false; }, [resetKey]);
  useEffect(() => {
    if (ref.current && value && !loaded.current) {
      ref.current.innerHTML = value;
      loaded.current = true;
    }
  }, [value, resetKey]);

  const exec = (cmd, arg) => { document.execCommand(cmd, false, arg || null); ref.current.focus(); onChange(ref.current.innerHTML); };
  const block = (tag) => { document.execCommand('formatBlock', false, tag); ref.current.focus(); onChange(ref.current.innerHTML); };

  const TOOLS = [
    { label: 'H2', action: () => block('h2') },
    { label: 'H3', action: () => block('h3') },
    { label: '|' },
    { label: <b>B</b>, action: () => exec('bold') },
    { label: <i>I</i>, action: () => exec('italic') },
    { label: <u>U</u>, action: () => exec('underline') },
    { label: '|' },
    { label: '• List', action: () => exec('insertUnorderedList') },
    { label: '1. List', action: () => exec('insertOrderedList') },
    { label: '|' },
    { label: 'Clear', action: () => exec('removeFormat') },
  ];

  return (
    <div className="re-wrap">
      <div className="re-toolbar">
        {TOOLS.map((t, i) =>
          t.label === '|'
            ? <span key={i} className="re-sep" />
            : <button key={i} type="button" className="re-btn" onMouseDown={e => { e.preventDefault(); t.action(); }}>{t.label}</button>
        )}
      </div>
      <div
        ref={ref}
        className="re-body"
        contentEditable
        suppressContentEditableWarning
        onInput={() => onChange(ref.current.innerHTML)}
        style={{ minHeight: 400 }}
      />
    </div>
  );
}

const DEFAULT_CONTACT = {
  address: 'B-76, 2nd Floor, Wazirpur Industrial Area, Delhi 110052',
  phone: '+91 9355753533',
  hours: 'Monday - Saturday, 9 AM to 7 PM',
  whatsapp1: '+91-9899001138',
  whatsapp2: '+91-8448240723',
  email: 'customercare@salarytopup.com',
};

function ContactEditor({ data, onChange }) {
  const f = (key, val) => onChange({ ...data, [key]: val });
  const field = (label, key, placeholder) => (
    <div style={{ marginBottom: 16 }}>
      <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>{label}</label>
      <input
        value={data[key] || ''}
        onChange={e => f(key, e.target.value)}
        placeholder={placeholder}
        style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: '0.92rem', outline: 'none', boxSizing: 'border-box' }}
      />
    </div>
  );
  return (
    <div className="cms-editor-body">
      <div style={{ background: '#f0f9ff', border: '1.5px solid #bae6fd', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: '0.82rem', color: '#0369a1' }}>
        Edit contact details below — changes will reflect on the website Contact page instantly after saving.
      </div>
      {field('Our Address', 'address', 'B-76, 2nd Floor, Wazirpur Industrial Area, Delhi 110052')}
      {field('Customer Support Phone', 'phone', '+91 9355753533')}
      {field('Support Hours', 'hours', 'Monday - Saturday, 9 AM to 7 PM')}
      {field('WhatsApp Number 1', 'whatsapp1', '+91-9899001138')}
      {field('WhatsApp Number 2', 'whatsapp2', '+91-8448240723')}
      {field('Email Support', 'email', 'customercare@salarytopup.com')}
    </div>
  );
}

export default function CmsEditor() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [contactData, setContactData] = useState(DEFAULT_CONTACT);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  const currentPage = PAGES.find(p => p.slug === slug) || PAGES[0];
  const isContact = slug === 'contact';

  useEffect(() => {
    if (!slug) { navigate(`/cms/${PAGES[0].slug}`); return; }
    setLoading(true);
    API.get(`/pages/${slug}`)
      .then(r => {
        if (isContact) {
          try {
            const parsed = JSON.parse(r.data.content || '{}');
            setContactData({ ...DEFAULT_CONTACT, ...parsed });
          } catch { setContactData(DEFAULT_CONTACT); }
        } else {
          setContent(r.data.content || DEFAULT_CONTENT[slug] || '');
        }
        setTitle(r.data.title || currentPage.label);
        setResetKey(k => k + 1);
      })
      .catch(() => {
        if (isContact) setContactData(DEFAULT_CONTACT);
        else setContent(DEFAULT_CONTENT[slug] || '');
        setTitle(currentPage.label);
        setResetKey(k => k + 1);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const saveContent = isContact ? JSON.stringify(contactData) : content;
      await API.put(`/pages/${slug}`, { title, content: saveContent, slug });
      toast.success('Page saved!');
    } catch { toast.error('Error saving'); }
    setSaving(false);
  };

  return (
    <div className="cms-wrap">
      <div className="adm-page-header">
        <div>
          <h2 className="adm-page-title">CMS — Page Editor</h2>
          <p className="adm-page-sub">Edit website page content</p>
        </div>
        <button className="adm-btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Page'}
        </button>
      </div>

      {/* Page Tabs */}
      <div className="cms-tabs">
        {PAGES.map(p => (
          <button key={p.slug} className={`cms-tab ${slug === p.slug ? 'active' : ''}`} onClick={() => navigate(`/cms/${p.slug}`)}>
            {p.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8' }}>Loading...</div>
      ) : isContact ? (
        <ContactEditor data={contactData} onChange={setContactData} />
      ) : (
        <div className="cms-editor-body">
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Page Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Content</label>
            <RichEditor value={content} onChange={setContent} resetKey={resetKey} />
          </div>
          <div style={{ marginTop: 16 }}>
            <button className="adm-btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Page'}</button>
          </div>
        </div>
      )}
    </div>
  );
}