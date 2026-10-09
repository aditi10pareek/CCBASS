import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Edit, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const HearingsPage = () => {
  const { user } = useAuth();
  const [hearings, setHearings] = useState([]);
  const [dateFilter, setDateFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Remarks Form Inline State
  const [editingHearingId, setEditingHearingId] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [closeCase, setCloseCase] = useState(false);

  const fetchHearings = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (dateFilter) params.date = dateFilter;

      const res = await api.hearings.getAll(params);
      if (res.success) {
        setHearings(res.data);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to retrieve scheduled hearings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHearings();
  }, [dateFilter]);

  const handleSaveRemarks = async (e, id) => {
    e.preventDefault();
    setSuccess('');
    setError('');

    try {
      const res = await api.hearings.update(id, {
        status: 'Conducted',
        remarks,
        closeCase
      });

      if (res.success) {
        setSuccess('Hearing remarks and order logs saved successfully.');
        setEditingHearingId(null);
        setRemarks('');
        setCloseCase(false);
        fetchHearings();
      }
    } catch (err) {
      setError(err.message || 'Failed to submit court order.');
    }
  };

  if (loading) return <div className="loader" />;

  return (
    <div className="dashboard-panel">
      <div className="panel-header">
        <div>
          <h3 className="panel-title">Scheduled Court Hearings</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            List of hearings scheduled. Use the date filter to search by day.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }} className="no-print">
          <input 
            type="date" 
            className="form-input"
            style={{ width: '160px', paddingTop: '0.4rem', paddingBottom: '0.4rem' }}
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
          {dateFilter && (
            <button className="btn btn-secondary btn-sm" onClick={() => setDateFilter('')}>Clear</button>
          )}
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

      {hearings.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          No hearings scheduled on this date.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1rem' }}>
          {hearings.map(h => (
            <div 
              key={h._id} 
              style={{
                border: '1px solid var(--card-border)',
                borderRadius: 'var(--radius-md)',
                padding: '1.5rem',
                backgroundColor: '#ffffff',
                borderLeft: '5px solid var(--primary-light)',
                boxShadow: 'var(--shadow-sm)',
                display: 'grid',
                gridTemplateColumns: editingHearingId === h._id ? '1fr' : '3fr 1fr',
                gap: '1.5rem'
              }}
            >
              {/* Content block */}
              {editingHearingId !== h._id ? (
                <>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary)' }}>
                        {h.caseId?.caseNumber || 'CR-N/A'}
                      </span>
                      <span className={`badge ${
                        h.status === 'Conducted' ? 'badge-success' : 
                        h.status === 'Scheduled' ? 'badge-info' : 'badge-danger'
                      }`}>
                        {h.status}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Priority Rating: <strong className="priority-tag" style={{ padding: '0.1rem 0.35rem' }}>{h.caseId?.priorityScore || 0}</strong>
                      </span>
                    </div>

                    <h4 style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '0.75rem' }}>
                      {h.caseId?.title || 'State vs. Anonymous'}
                    </h4>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      <div className="align-center" style={{ gap: '0.5rem' }}>
                        <Calendar size={15} />
                        <span>Date: <strong>{new Date(h.date).toLocaleDateString(undefined, { dateStyle: 'medium' })}</strong></span>
                      </div>
                      <div className="align-center" style={{ gap: '0.5rem' }}>
                        <Clock size={15} />
                        <span>Session time: <strong>{h.time}</strong></span>
                      </div>
                      <div className="align-center" style={{ gap: '0.5rem' }}>
                        <MapPin size={15} />
                        <span>Court room: <strong>{h.caseId?.court || 'Judicial Chamber 1'}</strong></span>
                      </div>
                    </div>

                    {h.remarks && (
                      <div style={{ 
                        marginTop: '1rem', 
                        padding: '0.75rem 1rem', 
                        backgroundColor: '#f8fafc', 
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid #e2e8f0',
                        fontSize: '0.85rem'
                      }}>
                        <strong>Judgment Remarks: </strong> {h.remarks}
                      </div>
                    )}
                  </div>

                  {/* Actions column */}
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-end', gap: '0.5rem' }}>
                    {user.role === 'Judge' && h.status === 'Scheduled' && (
                      <button 
                        className="btn btn-primary btn-sm"
                        style={{ display: 'flex', gap: '0.25rem' }}
                        onClick={() => {
                          setEditingHearingId(h._id);
                          setRemarks(h.remarks || '');
                        }}
                      >
                        <Edit size={14} /> Enter Orders
                      </button>
                    )}
                  </div>
                </>
              ) : (
                /* Inline Edit Mode for Judges */
                <form onSubmit={(e) => handleSaveRemarks(e, h._id)}>
                  <h4 style={{ fontWeight: 700, marginBottom: '1rem', color: 'var(--primary)' }}>
                    Record Court Orders - Case {h.caseId?.caseNumber}
                  </h4>
                  
                  <div className="form-group">
                    <label className="form-label">Hearing remarks & Bench Directions</label>
                    <textarea 
                      className="form-textarea" 
                      rows="4" 
                      placeholder="Write order details..."
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-checkbox-label">
                      <input 
                        type="checkbox"
                        className="form-checkbox"
                        checked={closeCase}
                        onChange={(e) => setCloseCase(e.target.checked)}
                      />
                      <span>Mark Case as Closed / Disposed</span>
                    </label>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button type="submit" className="btn btn-primary btn-sm">
                      Save Remarks & Conclude
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-secondary btn-sm" 
                      onClick={() => setEditingHearingId(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HearingsPage;
