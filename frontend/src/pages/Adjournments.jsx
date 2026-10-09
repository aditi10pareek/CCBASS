import React, { useState, useEffect } from 'react';
import { Clock, Check, X, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const AdjournmentsPage = () => {
  const { user } = useAuth();
  const [adjournments, setAdjournments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchAdjournments = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.adjournments.getAll();
      if (res.success) {
        setAdjournments(res.data);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to retrieve adjournment list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdjournments();
  }, []);

  const handleAction = async (id, status) => {
    setSuccess('');
    setError('');
    try {
      const res = await api.adjournments.updateStatus(id, status);
      if (res.success) {
        setSuccess(`Adjournment petition has been ${status.toLowerCase()}ed.`);
        fetchAdjournments();
      }
    } catch (err) {
      setError(err.message || 'Action failed.');
    }
  };

  if (loading) return <div className="loader" />;

  return (
    <div className="dashboard-panel">
      <div className="panel-header">
        <div>
          <h3 className="panel-title">Court Adjournment Petitions</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            List of adjournments requested by counsel due to conflicting schedules or emergencies.
          </p>
        </div>
      </div>

      {success && (
        <div style={{ padding: '0.75rem', backgroundColor: 'var(--success-light)', color: 'var(--success)', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontWeight: 600 }}>
          {success}
        </div>
      )}
      {error && (
        <div style={{ padding: '0.75rem', backgroundColor: 'var(--danger-light)', color: 'var(--danger)', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontWeight: 600 }}>
          {error}
        </div>
      )}

      {adjournments.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          No adjournment petitions logged.
        </div>
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Case Number</th>
                <th>Case Title</th>
                <th>Requested By</th>
                <th>Reason</th>
                <th>Proposed Next Date</th>
                <th>Status</th>
                {(user.role === 'Clerk' || user.role === 'Admin') && <th className="no-print">Decision</th>}
              </tr>
            </thead>
            <tbody>
              {adjournments.map(a => (
                <tr key={a._id}>
                  <td style={{ fontWeight: 700 }}>{a.caseId?.caseNumber || 'N/A'}</td>
                  <td style={{ fontWeight: 600 }}>{a.caseId?.title || 'Unknown Case'}</td>
                  <td>{a.requestedBy?.name} ({a.requestedBy?.role})</td>
                  <td>{a.reason}</td>
                  <td>
                    <strong>{new Date(a.date).toLocaleDateString()}</strong>
                  </td>
                  <td>
                    <span className={`badge ${
                      a.status === 'Approved' ? 'badge-success' :
                      a.status === 'Rejected' ? 'badge-danger' : 'badge-warning'
                    }`}>
                      {a.status}
                    </span>
                  </td>
                  {(user.role === 'Clerk' || user.role === 'Admin') && (
                    <td className="no-print">
                      {a.status === 'Pending' ? (
                        <div style={{ display: 'flex', gap: '0.35rem' }}>
                          <button 
                            className="btn btn-primary btn-sm"
                            style={{ display: 'flex', alignItems: 'center', gap: '2px', padding: '0.25rem 0.6rem' }}
                            onClick={() => handleAction(a._id, 'Approved')}
                          >
                            <Check size={12} /> Approve
                          </button>
                          <button 
                            className="btn btn-danger btn-sm"
                            style={{ display: 'flex', alignItems: 'center', gap: '2px', padding: '0.25rem 0.6rem' }}
                            onClick={() => handleAction(a._id, 'Rejected')}
                          >
                            <X size={12} /> Reject
                          </button>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                          Processed
                        </span>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdjournmentsPage;
