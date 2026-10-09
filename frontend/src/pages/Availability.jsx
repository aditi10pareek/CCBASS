import React, { useState, useEffect } from 'react';
import { UserCheck } from 'lucide-react';
import api from '../services/api';

const AvailabilityPage = () => {
  const [availabilityLog, setAvailabilityLog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [form, setForm] = useState({
    date: '',
    available: false,
    reason: ''
  });

  const fetchAvailability = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.lawyers.getMyAvailability();
      if (res.success) {
        setAvailabilityLog(res.data);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch availability schedules.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailability();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setError('');

    try {
      const res = await api.lawyers.updateAvailability(form);
      if (res.success) {
        setSuccessMsg('Availability updated successfully.');
        setForm({ date: '', available: false, reason: '' });
        fetchAvailability();
      }
    } catch (err) {
      setError(err.message || 'Failed to apply schedule.');
    }
  };

  if (loading) return <div className="loader" />;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }} className="grid-2">
      <div className="dashboard-panel">
        <div className="panel-header">
          <h3 className="panel-title">Log Unavailability Blockout</h3>
        </div>
        
        {successMsg && (
          <div style={{ padding: '0.75rem', backgroundColor: 'var(--success-light)', color: 'var(--success)', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontWeight: 600 }}>
            {successMsg}
          </div>
        )}
        {error && (
          <div style={{ padding: '0.75rem', backgroundColor: 'var(--danger-light)', color: 'var(--danger)', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontWeight: 600 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ marginTop: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Target Date</label>
            <input 
              type="date" 
              className="form-input"
              value={form.date}
              onChange={(e) => setForm(prev => ({ ...prev, date: e.target.value }))}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Calendar Availability</label>
            <select 
              className="form-select"
              value={form.available ? 'true' : 'false'}
              onChange={(e) => setForm(prev => ({ ...prev, available: e.target.value === 'true' }))}
            >
              <option value="false">Unavailable (Block Scheduling)</option>
              <option value="true">Available (Remove Block)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Unavailability Reason / Notes</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. Attending Supreme Court session, illness..."
              value={form.reason}
              onChange={(e) => setForm(prev => ({ ...prev, reason: e.target.value }))}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
            Submit Calendar override
          </button>
        </form>
      </div>

      <div className="dashboard-panel">
        <div className="panel-header">
          <h3 className="panel-title">Active Overrides Log</h3>
        </div>
        
        {availabilityLog.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No unavailability overrides logged. You are cleared for all scheduling.
          </div>
        ) : (
          <div className="table-container" style={{ marginTop: '1rem' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Blocked Date</th>
                  <th>Reason</th>
                  <th>Override Status</th>
                </tr>
              </thead>
              <tbody>
                {availabilityLog.map((av, idx) => (
                  <tr key={idx}>
                    <td><strong>{new Date(av.date).toLocaleDateString()}</strong></td>
                    <td>{av.reason || 'None provided'}</td>
                    <td>
                      <span className={`badge ${av.available ? 'badge-success' : 'badge-danger'}`}>
                        {av.available ? 'Available' : 'Blocked'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AvailabilityPage;
