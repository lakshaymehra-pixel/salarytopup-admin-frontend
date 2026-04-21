import React, { useEffect, useState } from 'react';
import API from '../api';
import toast from 'react-hot-toast';
import './Table.css';

export default function Applications() {
  const [apps, setApps] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');

  const load = () => {
    API.get(`/applications?page=${page}&limit=10&status=${status}`)
      .then(r => { setApps(r.data.applications); setTotal(r.data.total); })
      .catch(() => {});
  };

  useEffect(() => { load(); }, [page, status]);

  const updateStatus = async (id, s) => {
    await API.put(`/applications/${id}`, { status: s });
    toast.success('Status updated');
    load();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete?')) return;
    await API.delete(`/applications/${id}`);
    toast.success('Deleted');
    load();
  };

  return (
    <div>
      <div className="adm-page-header">
        <h2 className="adm-page-title">Loan Applications</h2>
        <span className="adm-count">{total} total</span>
      </div>
      <div className="adm-filters">
        <select className="adm-select" value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="disbursed">Disbursed</option>
        </select>
      </div>
      <div className="adm-card">
        <table className="adm-table">
          <thead><tr><th>Name</th><th>Mobile</th><th>Email</th><th>Amount</th><th>Employer</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
          <tbody>
            {apps.map(a => (
              <tr key={a._id}>
                <td><strong>{a.name}</strong></td>
                <td>{a.mobile}</td>
                <td>{a.email}</td>
                <td>₹{a.loanAmount?.toLocaleString() || '-'}</td>
                <td>{a.employerName || '-'}</td>
                <td><span className={`badge badge-${a.status}`}>{a.status}</span></td>
                <td>{new Date(a.createdAt).toLocaleDateString()}</td>
                <td className="adm-actions">
                  <select className="adm-select-sm" value={a.status} onChange={e => updateStatus(a._id, e.target.value)}>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="disbursed">Disbursed</option>
                  </select>
                  <button className="adm-btn-sm adm-btn-danger" onClick={() => handleDelete(a._id)}>Delete</button>
                </td>
              </tr>
            ))}
            {apps.length === 0 && <tr><td colSpan="8" className="adm-empty">No applications found</td></tr>}
          </tbody>
        </table>
        <div className="adm-pagination">
          <span>{total} total</span>
          <div>
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
            <span>Page {page}</span>
            <button disabled={apps.length < 10} onClick={() => setPage(p => p + 1)}>Next →</button>
          </div>
        </div>
      </div>
    </div>
  );
}
