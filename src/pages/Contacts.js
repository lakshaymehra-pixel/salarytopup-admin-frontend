import React, { useEffect, useState } from 'react';
import API from '../api';
import toast from 'react-hot-toast';
import './Table.css';

export default function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');

  const load = () => {
    API.get(`/contacts?page=${page}&limit=10&status=${status}`)
      .then(r => { setContacts(r.data.contacts); setTotal(r.data.total); })
      .catch(() => {});
  };

  useEffect(() => { load(); }, [page, status]);

  const updateStatus = async (id, s) => {
    await API.put(`/contacts/${id}`, { status: s });
    toast.success('Status updated');
    load();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete?')) return;
    await API.delete(`/contacts/${id}`);
    toast.success('Deleted');
    load();
  };

  return (
    <div>
      <div className="adm-page-header">
        <h2 className="adm-page-title">Contact Submissions</h2>
        <span className="adm-count">{total} total</span>
      </div>
      <div className="adm-filters">
        <select className="adm-select" value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>
          <option value="">All</option>
          <option value="new">New</option>
          <option value="read">Read</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>
      <div className="adm-card">
        <table className="adm-table">
          <thead><tr><th>Name</th><th>Email</th><th>Mobile</th><th>Type</th><th>Message</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {contacts.map(c => (
              <tr key={c._id}>
                <td><strong>{c.name}</strong></td>
                <td>{c.email}</td>
                <td>{c.mobile}</td>
                <td>{c.inquiryType}</td>
                <td className="adm-msg">{c.message}</td>
                <td><span className={`badge badge-${c.status}`}>{c.status}</span></td>
                <td className="adm-actions">
                  <select className="adm-select-sm" value={c.status} onChange={e => updateStatus(c._id, e.target.value)}>
                    <option value="new">New</option>
                    <option value="read">Read</option>
                    <option value="resolved">Resolved</option>
                  </select>
                  <button className="adm-btn-sm adm-btn-danger" onClick={() => handleDelete(c._id)}>Delete</button>
                </td>
              </tr>
            ))}
            {contacts.length === 0 && <tr><td colSpan="7" className="adm-empty">No contacts found</td></tr>}
          </tbody>
        </table>
        <div className="adm-pagination">
          <span>{total} total</span>
          <div>
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
            <span>Page {page}</span>
            <button disabled={contacts.length < 10} onClick={() => setPage(p => p + 1)}>Next →</button>
          </div>
        </div>
      </div>
    </div>
  );
}
