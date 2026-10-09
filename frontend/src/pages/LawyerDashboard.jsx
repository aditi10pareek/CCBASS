import React, { useState, useEffect } from 'react';
import { Briefcase, Calendar, Clock, UserCheck, Plus, AlertCircle, RefreshCw } from 'lucide-react';
import MetricCard from '../components/MetricCard';
import CustomCalendar from '../components/CustomCalendar';
import api from '../services/api';

const LawyerDashboard = () => {
  const [activeTab, setActiveTab] = useState('cases');
  const [metrics, setMetrics] = useState(null);
  const [cases, setCases] = useState([]);
  const [hearings, setHearings] = useState([]);
  const [adjournments, setAdjournments] = useState([]);
  const [availabilityLog, setAvailabilityLog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // 1. Adjournment Form State
  const [adjournmentForm, setAdjournmentForm] = useState({
    caseId: '',
    reason: '',
    date: ''
  });

  // 2. Availability Form State
  const [availabilityForm, setAvailabilityForm] = useState({
    date: '',
    available: false,
    reason: ''
  });

  const fetchLawyerData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const metricsRes = await api.analytics.getDashboard();
      const casesRes = await api.cases.getAll(); // Filtered by lawyerId on server
      const hearingsRes = await api.hearings.getAll(); // Filtered by lawyer's cases on server
      const adjournmentsRes = await api.adjournments.getAll(); // Filtered by lawyer on server
      const availRes = await api.lawyers.getMyAvailability();

      if (metricsRes.success && casesRes.success && hearingsRes.success && adjournmentsRes.success && availRes.success) {
        setMetrics(metricsRes.data.metrics);
        setCases(casesRes.data);
        setHearings(hearingsRes.data);
        setAdjournments(adjournmentsRes.data);
        setAvailabilityLog(availRes.data);

        // Prepopulate adjournment case select
        const activeCases = casesRes.data.filter(c => c.status !== 'Closed');
        if (activeCases.length > 0) {
          setAdjournmentForm(prev => ({ ...prev, caseId: activeCases[0]._id }));
        }
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to retrieve representation roster.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLawyerData();
  }, []);

  const handleRequestAdjournment = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setError('');

    if (!adjournmentForm.caseId) {
      setError('Please select a case.');
      return;
    }

    try {
      const res = await api.adjournments.request(adjournmentForm);
      if (res.success) {
        setSuccessMsg('Adjournment request submitted to Judge/Clerk.');
        setAdjournmentForm(prev => ({ ...prev, reason: '', date: '' }));
        fetchLawyerData();
      }
    } catch (err) {
      setError(err.message || 'Failed to submit adjournment request.');
    }
  };

  const handleUpdateAvailability = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setError('');

    try {
      const res = await api.lawyers.updateAvailability(availabilityForm);
      if (res.success) {
        setSuccessMsg('Availability log updated. The scheduler will respect this setting.');
        setAvailabilityForm({ date: '', available: false, reason: '' });
        fetchLawyerData();
      }
    } catch (err) {
      setError(err.message || 'Failed to log availability.');
    }
  };

  const activeCases = cases.filter(c => c.status !== 'Closed');

  if (loading) return <div className="loader" />;

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: '2.5rem' }}>
        <div>
          <h1 className="page-title">Lawyer Console</h1>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            className={`btn ${activeTab === 'cases' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('cases')}
          >
            My Cases
          </button>
          <button 
            className={`btn ${activeTab === 'calendar' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('calendar')}
          >
            Roster Calendar
          </button>
          <button 
            className={`btn ${activeTab === 'adjourn' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('adjourn')}
          >
            File Adjournment
          </button>
          <button 
            className={`btn ${activeTab === 'availability' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('availability')}
          >
            Availability Block
          </button>
        </div>
      </div>

      {successMsg && (
        <div style={{ padding: '1rem', backgroundColor: 'var(--success-light)', color: 'var(--success)', border: '1px solid var(--success)', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontWeight: 600 }}>
          {successMsg}
        </div>
      )}
      {error && (
        <div style={{ padding: '1rem', backgroundColor: 'var(--danger-light)', color: 'var(--danger)', border: '1px solid var(--danger)', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontWeight: 600 }}>
          {error}
        </div>
      )}

      {/* Metrics Banner */}
      <div className="metrics-grid" style={{ marginBottom: '2rem' }}>
        <MetricCard 
          value={metrics?.activeCases || 0} 
          label="Active Representation Cases" 
          icon={Briefcase} 
          color="blue" 
        />
        <MetricCard 
          value={metrics?.upcomingHearings || 0} 
          label="Upcoming Hearings Scheduled" 
          icon={Calendar} 
          color="teal" 
        />
        <MetricCard 
          value={metrics?.pendingAdjournments || 0} 
          label="Pending Adjournment Requests" 
          icon={Clock} 
          color="orange" 
        />
        <MetricCard 
          value={availabilityLog.filter(a => !a.available).length} 
          label="Logged Blockout Dates" 
          icon={UserCheck} 
          color="red" 
        />
      </div>

      {/* Tab 1: My Cases */}
      {activeTab === 'cases' && (
        <div className="dashboard-panel">
          <div className="panel-header">
            <h3 className="panel-title">Your Representation Cases</h3>
          </div>
          
          {cases.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              No cases currently assigned.
            </div>
          ) : (
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Case Number</th>
                    <th>Title</th>
                    <th>Classification</th>
                    <th>Plaintiff</th>
                    <th>Defendant</th>
                    <th>Adjournments</th>
                    <th>Next Hearing</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {cases.map(c => (
                    <tr key={c._id}>
                      <td style={{ fontWeight: 700 }}>{c.caseNumber}</td>
                      <td style={{ fontWeight: 600 }}>{c.title}</td>
                      <td>{c.caseType}</td>
                      <td>{c.plaintiff}</td>
                      <td>{c.defendant}</td>
                      <td>{c.adjournmentCount}</td>
                      <td>
                        {c.nextHearing ? (
                          <strong>{new Date(c.nextHearing).toLocaleDateString()}</strong>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>Not Scheduled</span>
                        )}
                      </td>
                      <td>
                        <span className={`badge ${
                          c.status === 'Closed' ? 'badge-success' :
                          c.status === 'Scheduled' ? 'badge-info' :
                          c.status === 'Adjourned' ? 'badge-warning' : 'badge-muted'
                        }`}>
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Calendar */}
      {activeTab === 'calendar' && (
        <div style={{ marginTop: '1rem' }}>
          <CustomCalendar hearings={hearings} />
        </div>
      )}

      {/* Tab 3: File Adjournment */}
      {activeTab === 'adjourn' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }} className="grid-2">
          {/* Adjournment Form */}
          <div className="dashboard-panel">
            <div className="panel-header">
              <h3 className="panel-title">File Adjournment Request</h3>
            </div>
            
            {activeCases.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                You have no active cases eligible for adjournments.
              </div>
            ) : (
              <form onSubmit={handleRequestAdjournment} style={{ marginTop: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Select Case</label>
                  <select 
                    className="form-select"
                    value={adjournmentForm.caseId}
                    onChange={(e) => setAdjournmentForm(prev => ({ ...prev, caseId: e.target.value }))}
                    required
                  >
                    {activeCases.map(c => (
                      <option key={c._id} value={c._id}>{c.caseNumber} - {c.title}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Reason for Requesting Adjournment</label>
                  <textarea 
                    rows="4"
                    className="form-textarea"
                    placeholder="Enter detailed reason (e.g. counsel medical emergency, witness unavailable...)"
                    value={adjournmentForm.reason}
                    onChange={(e) => setAdjournmentForm(prev => ({ ...prev, reason: e.target.value }))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Proposed Next Hearing Date</label>
                  <input 
                    type="date" 
                    className="form-input"
                    value={adjournmentForm.date}
                    onChange={(e) => setAdjournmentForm(prev => ({ ...prev, date: e.target.value }))}
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                  Submit Formal Adjournment Petition
                </button>
              </form>
            )}
          </div>

          {/* Adjournment Requests Status list */}
          <div className="dashboard-panel">
            <div className="panel-header">
              <h3 className="panel-title">Your Adjournment Request History</h3>
            </div>
            
            {adjournments.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                No adjournment records found.
              </div>
            ) : (
              <div style={{ overflowY: 'auto', maxHeight: '420px', display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
                {adjournments.map(a => (
                  <div key={a._id} style={{ border: '1px solid var(--card-border)', padding: '1rem', borderRadius: 'var(--radius-md)', backgroundColor: '#f8fafc' }}>
                    <div className="flex-between">
                      <span style={{ fontWeight: 700 }}>{a.caseId?.caseNumber}</span>
                      <span className={`badge ${
                        a.status === 'Approved' ? 'badge-success' :
                        a.status === 'Rejected' ? 'badge-danger' : 'badge-warning'
                      }`}>
                        {a.status}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                      <strong>Reason: </strong>{a.reason}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                      Proposed Date: {new Date(a.date).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Availability */}
      {activeTab === 'availability' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }} className="grid-2">
          {/* Form to log unavailability */}
          <div className="dashboard-panel">
            <div className="panel-header">
              <h3 className="panel-title">Log Unavailability blockout</h3>
            </div>
            <form onSubmit={handleUpdateAvailability} style={{ marginTop: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Unavailability Date</label>
                <input 
                  type="date" 
                  className="form-input"
                  value={availabilityForm.date}
                  onChange={(e) => setAvailabilityForm(prev => ({ ...prev, date: e.target.value }))}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Block Status</label>
                <select 
                  className="form-select"
                  value={availabilityForm.available ? 'true' : 'false'}
                  onChange={(e) => setAvailabilityForm(prev => ({ ...prev, available: e.target.value === 'true' }))}
                >
                  <option value="false">Unavailable (Block scheduling on this day)</option>
                  <option value="true">Available (Clear previous block)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Reason / Supporting details</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. High Court Appearance, medical leave..."
                  value={availabilityForm.reason}
                  onChange={(e) => setAvailabilityForm(prev => ({ ...prev, reason: e.target.value }))}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                Apply Calendar Blockout
              </button>
            </form>
          </div>

          {/* Blockout logs */}
          <div className="dashboard-panel">
            <div className="panel-header">
              <h3 className="panel-title">Active Calendar Blockout Dates</h3>
            </div>
            
            {availabilityLog.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                No availability overrides logged. You are cleared for all scheduling.
              </div>
            ) : (
              <div className="table-container" style={{ marginTop: '1rem' }}>
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Blocked Date</th>
                      <th>Reason</th>
                      <th>Status</th>
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
      )}
    </div>
  );
};

export default LawyerDashboard;
