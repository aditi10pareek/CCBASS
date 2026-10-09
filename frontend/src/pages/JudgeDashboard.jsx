import React, { useState, useEffect } from 'react';
import { Calendar, Briefcase, FileText, Clock, FileCheck, CheckCircle } from 'lucide-react';
import MetricCard from '../components/MetricCard';
import CustomCalendar from '../components/CustomCalendar';
import api from '../services/api';

const JudgeDashboard = () => {
  const [activeTab, setActiveTab] = useState('docket');
  const [metrics, setMetrics] = useState(null);
  const [hearings, setHearings] = useState([]);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Remarks Form State
  const [activeHearingId, setActiveHearingId] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [closeCase, setCloseCase] = useState(false);

  const fetchJudgeData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const metricsRes = await api.analytics.getDashboard();
      const hearingsRes = await api.hearings.getAll(); // Fetch hearings (filter by judgeId on server)
      const casesRes = await api.cases.getAll(); // Fetch cases (filter by judgeId on server)

      if (metricsRes.success && hearingsRes.success && casesRes.success) {
        setMetrics(metricsRes.data.metrics);
        setHearings(hearingsRes.data);
        setCases(casesRes.data);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to load docket records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJudgeData();
  }, []);

  const handleRecordRemarks = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setError('');
    
    try {
      const res = await api.hearings.update(activeHearingId, {
        status: 'Conducted',
        remarks,
        closeCase
      });

      if (res.success) {
        setSuccessMsg('Remarks saved and case roster updated!');
        setActiveHearingId(null);
        setRemarks('');
        setCloseCase(false);
        fetchJudgeData();
      }
    } catch (err) {
      setError(err.message || 'Failed to update hearing details.');
    }
  };

  const getTodayDateString = () => {
    const today = new Date();
    return today.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
  };

  const startOfToday = new Date().setHours(0,0,0,0);
  const endOfToday = new Date().setHours(23,59,59,999);
  
  // Filter today's hearings
  const todaysHearings = hearings.filter(h => {
    const hDate = new Date(h.date).getTime();
    return hDate >= startOfToday && hDate <= endOfToday;
  });

  if (loading) return <div className="loader" />;

  return (
    <div>
      <div className="flex-between">
        <div>
          <h1 className="page-title">Judge Bench Console</h1>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            className={`btn ${activeTab === 'docket' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('docket')}
          >
            Today's Docket
          </button>
          <button 
            className={`btn ${activeTab === 'cases' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('cases')}
          >
            Assigned Cases
          </button>
          <button 
            className={`btn ${activeTab === 'calendar' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('calendar')}
          >
            Roster Calendar
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

      {/* Metrics Header */}
      <div className="metrics-grid" style={{ marginBottom: '2rem' }}>
        <MetricCard 
          value={metrics?.assignedCases || 0} 
          label="Pending Assigned Cases" 
          icon={Briefcase} 
          color="blue" 
        />
        <MetricCard 
          value={todaysHearings.length} 
          label="Today's Roster Count" 
          icon={Calendar} 
          color="teal" 
        />
        <MetricCard 
          value={metrics?.pendingOrders || 0} 
          label="Pending Order Entries" 
          icon={Clock} 
          color="orange" 
        />
        <MetricCard 
          value={metrics?.delayedCases || 0} 
          label="Roster Backlog" 
          icon={FileText} 
          color="red" 
        />
      </div>

      {/* Tab 1: Today's Docket */}
      {activeTab === 'docket' && (
        <div style={{ display: 'grid', gridTemplateColumns: activeHearingId ? '1fr 1fr' : '1fr', gap: '1.5rem' }}>
          <div className="dashboard-panel">
            <div className="panel-header">
              <h3 className="panel-title"> Roster Docket for {getTodayDateString()}</h3>
            </div>

            {todaysHearings.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                No hearings scheduled on your roster today.
              </div>
            ) : (
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Case Number</th>
                      <th>Title</th>
                      <th>Court Room</th>
                      <th>Assigned Lawyer</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {todaysHearings.map(h => (
                      <tr key={h._id}>
                        <td><strong>{h.time}</strong></td>
                        <td style={{ fontWeight: 700 }}>{h.caseId?.caseNumber}</td>
                        <td style={{ fontWeight: 600 }}>{h.caseId?.title}</td>
                        <td>{h.caseId?.court}</td>
                        <td>{h.caseId?.lawyerId?.name}</td>
                        <td>
                          <span className={`badge ${
                            h.status === 'Conducted' ? 'badge-success' : 
                            h.status === 'Scheduled' ? 'badge-info' : 'badge-danger'
                          }`}>
                            {h.status}
                          </span>
                        </td>
                        <td>
                          {h.status === 'Scheduled' ? (
                            <button 
                              className="btn btn-primary btn-sm"
                              onClick={() => {
                                setActiveHearingId(h._id);
                                setRemarks(h.remarks || '');
                              }}
                            >
                              Add Order/Remarks
                            </button>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Concluded</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Remarks Sidebar Panel */}
          {activeHearingId && (
            <div className="dashboard-panel animate-fade-in">
              <div className="panel-header">
                <h3 className="panel-title">Record Bench Order / remarks</h3>
                <button className="btn btn-secondary btn-sm" onClick={() => setActiveHearingId(null)}>Cancel</button>
              </div>
              <form onSubmit={handleRecordRemarks} style={{ marginTop: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Hearing Remarks & Court Orders</label>
                  <textarea 
                    rows="6"
                    className="form-textarea"
                    placeholder="Enter summary of proceedings, witness notes, evidence presented, and directions..."
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
                    <strong>Dispose / Close Case</strong> (Mark this litigation as officially resolved)
                  </label>
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                  <CheckCircle size={16} /> Submit Order & Conclude Hearing
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Assigned Cases */}
      {activeTab === 'cases' && (
        <div className="dashboard-panel">
          <div className="panel-header">
            <h3 className="panel-title">Assigned Pending Cases</h3>
          </div>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Case Number</th>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Plaintiff</th>
                  <th>Defendant</th>
                  <th>Priority Score</th>
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
                    <td>
                      <span className={`priority-tag ${c.priorityScore > 50 ? 'priority-high' : ''}`}>
                        {c.priorityScore}
                      </span>
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
        </div>
      )}

      {/* Tab 3: Calendar */}
      {activeTab === 'calendar' && (
        <div style={{ marginTop: '1rem' }}>
          <CustomCalendar hearings={hearings} />
        </div>
      )}
    </div>
  );
};

export default JudgeDashboard;
