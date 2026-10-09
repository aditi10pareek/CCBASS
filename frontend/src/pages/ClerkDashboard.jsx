import React, { useState, useEffect } from 'react';
import { FilePlus, Calendar, ShieldCheck, Clock, Users, HelpCircle, PlusCircle, CalendarPlus, CheckSquare } from 'lucide-react';
import MetricCard from '../components/MetricCard';
import api from '../services/api';

const ClerkDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [metrics, setMetrics] = useState(null);
  const [cases, setCases] = useState([]);
  const [lawyers, setLawyers] = useState([]);
  const [judges, setJudges] = useState([]);
  const [adjournments, setAdjournments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // 1. Case Registration Form State
  const [caseForm, setCaseForm] = useState({
    caseNumber: '',
    title: '',
    caseType: 'Civil',
    plaintiff: '',
    defendant: '',
    judgeId: '',
    lawyerId: '',
    court: '',
    filingDate: '',
    isWomenSafety: false,
    isSeniorCitizen: false,
    isChildRelated: false
  });

  // 2. Hearing Scheduling Form State
  const [hearingForm, setHearingForm] = useState({
    caseId: '',
    date: '',
    time: '10:00 AM'
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const metricsRes = await api.analytics.getDashboard();
      const casesRes = await api.cases.getAll();
      const lawyersRes = await api.lawyers.getAll();
      const judgesRes = await api.lawyers.getJudges();
      const adjournmentsRes = await api.adjournments.getAll();

      if (metricsRes.success && casesRes.success && lawyersRes.success && judgesRes.success && adjournmentsRes.success) {
        setMetrics(metricsRes.data.metrics);
        setCases(casesRes.data);
        setLawyers(lawyersRes.data);
        setJudges(judgesRes.data);
        setAdjournments(adjournmentsRes.data);

        // Prepopulate select options if available
        if (casesRes.data.length > 0) {
          const firstNewCase = casesRes.data.find(c => c.status === 'New');
          setHearingForm(prev => ({ 
            ...prev, 
            caseId: firstNewCase ? firstNewCase._id : casesRes.data[0]._id 
          }));
        }
        if (judgesRes.data.length > 0) {
          setCaseForm(prev => ({ ...prev, judgeId: judgesRes.data[0]._id }));
        }
        if (lawyersRes.data.length > 0) {
          setCaseForm(prev => ({ ...prev, lawyerId: lawyersRes.data[0]._id }));
        }
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to fetch registry data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle Case Registration
  const handleRegisterCase = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setError('');
    
    try {
      const res = await api.cases.create(caseForm);
      if (res.success) {
        setSuccessMsg(`Case ${res.data.caseNumber} registered successfully! Priority Score: ${res.data.priorityScore}`);
        // Reset form
        setCaseForm({
          caseNumber: '',
          title: '',
          caseType: 'Civil',
          plaintiff: '',
          defendant: '',
          judgeId: judges[0]?._id || '',
          lawyerId: lawyers[0]?._id || '',
          court: '',
          filingDate: '',
          isWomenSafety: false,
          isSeniorCitizen: false,
          isChildRelated: false
        });
        fetchData();
      }
    } catch (err) {
      setError(err.message || 'Failed to file case.');
    }
  };

  // Handle Hearing Booking
  const handleScheduleHearing = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setError('');

    try {
      const res = await api.hearings.schedule(hearingForm);
      if (res.success) {
        setSuccessMsg('Hearing scheduled and lawyers/judges notified!');
        fetchData();
      }
    } catch (err) {
      setError(err.message || 'Scheduling failed. Check lawyer availability.');
    }
  };

  // Handle Adjournment Approval / Rejection
  const handleAdjournmentStatus = async (id, status) => {
    setSuccessMsg('');
    setError('');
    try {
      const res = await api.adjournments.updateStatus(id, status);
      if (res.success) {
        setSuccessMsg(`Adjournment request ${status} successfully!`);
        fetchData();
      }
    } catch (err) {
      setError(err.message || 'Action failed.');
    }
  };

  const pendingCases = cases.filter(c => c.status === 'New');
  const activeHearings = cases.filter(c => c.status === 'Scheduled');

  if (loading) return <div className="loader" />;

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: '2.5rem', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: '0.25rem' }}>Court Clerk Dashboard</h1>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button 
            className={`btn ${activeTab === 'overview' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={`btn ${activeTab === 'register' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('register')}
          >
            <PlusCircle size={16} /> File New Case
          </button>
          <button 
            className={`btn ${activeTab === 'schedule' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('schedule')}
          >
            <CalendarPlus size={16} /> Book Hearing
          </button>
          <button 
            className={`btn ${activeTab === 'adjournments' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('adjournments')}
          >
            <CheckSquare size={16} /> Adjournments ({adjournments.filter(a => a.status === 'Pending').length})
          </button>
        </div>
      </div>

      {successMsg && (
        <div style={{ padding: '1rem', backgroundColor: 'var(--success-light)', color: 'var(--success)', border: '1px solid var(--success)', borderRadius: 'var(--radius-md)', marginBottom: '2rem', fontWeight: 600 }}>
          {successMsg}
        </div>
      )}
      {error && (
        <div style={{ padding: '1rem', backgroundColor: 'var(--danger-light)', color: 'var(--danger)', border: '1px solid var(--danger)', borderRadius: 'var(--radius-md)', marginBottom: '2rem', fontWeight: 600 }}>
          {error}
        </div>
      )}

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          <div className="metrics-grid">
            <MetricCard 
              value={metrics?.todaysHearingsCount || 0} 
              label="Today's Scheduled Hearings" 
              icon={Calendar} 
              color="blue" 
            />
            <MetricCard 
              value={metrics?.pendingScheduling || 0} 
              label="Cases Pending Scheduling" 
              icon={Clock} 
              color="orange" 
            />
            <MetricCard 
              value={metrics?.newCasesCount || 0} 
              label="New Cases Registered Today" 
              icon={PlusCircle} 
              color="teal" 
            />
            <MetricCard 
              value={adjournments.filter(a => a.status === 'Pending').length} 
              label="Unprocessed Adjournments" 
              icon={HelpCircle} 
              color="red" 
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
            <div className="dashboard-panel">
              <div className="panel-header">
                <h3 className="panel-title">Pending Case Queue (Needs Scheduling)</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Highest priority score at top</span>
              </div>

              {pendingCases.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  All registered cases are scheduled. Great work!
                </div>
              ) : (
                <div className="table-container">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Case Number</th>
                        <th>Title</th>
                        <th>Type</th>
                        <th>Court Room</th>
                        <th>Priority Score</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingCases.map(c => (
                        <tr key={c._id}>
                          <td style={{ fontWeight: 700 }}>{c.caseNumber}</td>
                          <td style={{ fontWeight: 600 }}>{c.title}</td>
                          <td>{c.caseType}</td>
                          <td>{c.court}</td>
                          <td>
                            <span className={`priority-tag ${c.priorityScore > 50 ? 'priority-high' : ''}`}>
                              {c.priorityScore}
                            </span>
                          </td>
                          <td>
                            <button 
                              className="btn btn-primary btn-sm"
                              onClick={() => {
                                setHearingForm(prev => ({ ...prev, caseId: c._id }));
                                setActiveTab('schedule');
                              }}
                            >
                              Schedule Now
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="dashboard-panel">
              <div className="panel-header">
                <h3 className="panel-title">All Active Cases</h3>
              </div>
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Case Number</th>
                      <th>Title</th>
                      <th>Assigned Judge</th>
                      <th>Assigned Lawyer</th>
                      <th>Adjournments</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cases.map(c => (
                      <tr key={c._id}>
                        <td style={{ fontWeight: 700 }}>{c.caseNumber}</td>
                        <td style={{ fontWeight: 600 }}>{c.title}</td>
                        <td>{c.judgeId?.name || 'N/A'}</td>
                        <td>{c.lawyerId?.name || 'N/A'}</td>
                        <td>{c.adjournmentCount}</td>
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
          </div>
        </>
      )}

      {/* Case Registration Tab */}
      {activeTab === 'register' && (
        <div className="dashboard-panel" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div className="panel-header">
            <h3 className="panel-title">Register & File New Court Case</h3>
          </div>
          <form onSubmit={handleRegisterCase} style={{ marginTop: '1rem' }}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Case Number (Unique Identification)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. CR-2026-1049"
                  value={caseForm.caseNumber}
                  onChange={(e) => setCaseForm(prev => ({ ...prev, caseNumber: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Case Title</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. State of Delhi vs. Aman Verma"
                  value={caseForm.title}
                  onChange={(e) => setCaseForm(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Plaintiff (Filing Party)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Filing Party Name"
                  value={caseForm.plaintiff}
                  onChange={(e) => setCaseForm(prev => ({ ...prev, plaintiff: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Defendant (Responding Party)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Responding Party Name"
                  value={caseForm.defendant}
                  onChange={(e) => setCaseForm(prev => ({ ...prev, defendant: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Case Classification</label>
                <select 
                  className="form-select"
                  value={caseForm.caseType}
                  onChange={(e) => setCaseForm(prev => ({ ...prev, caseType: e.target.value }))}
                >
                  <option value="Civil">Civil Dispute</option>
                  <option value="Criminal">Criminal Case (+30 score)</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Designated Court Hall</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Magistrate Court Room 2"
                  value={caseForm.court}
                  onChange={(e) => setCaseForm(prev => ({ ...prev, court: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Assigned Judge</label>
                <select 
                  className="form-select"
                  value={caseForm.judgeId}
                  onChange={(e) => setCaseForm(prev => ({ ...prev, judgeId: e.target.value }))}
                  required
                >
                  {judges.map(j => <option key={j._id} value={j._id}>{j.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Assigned Lawyer Panelist</label>
                <select 
                  className="form-select"
                  value={caseForm.lawyerId}
                  onChange={(e) => setCaseForm(prev => ({ ...prev, lawyerId: e.target.value }))}
                  required
                >
                  {lawyers.map(l => <option key={l._id} value={l._id}>{l.name}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Filing Date (Backdated cases get older age scores)</label>
              <input 
                type="date" 
                className="form-input" 
                value={caseForm.filingDate}
                onChange={(e) => setCaseForm(prev => ({ ...prev, filingDate: e.target.value }))}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Priority Parameters (Check all that apply)</label>
              <div className="form-checkbox-group">
                <label className="form-checkbox-label">
                  <input 
                    type="checkbox" 
                    className="form-checkbox"
                    checked={caseForm.isWomenSafety}
                    onChange={(e) => setCaseForm(prev => ({ ...prev, isWomenSafety: e.target.checked }))}
                  />
                  <span>Women Safety Case (+25)</span>
                </label>
                <label className="form-checkbox-label">
                  <input 
                    type="checkbox" 
                    className="form-checkbox"
                    checked={caseForm.isSeniorCitizen}
                    onChange={(e) => setCaseForm(prev => ({ ...prev, isSeniorCitizen: e.target.checked }))}
                  />
                  <span>Senior Citizen Involved (+20)</span>
                </label>
                <label className="form-checkbox-label">
                  <input 
                    type="checkbox" 
                    className="form-checkbox"
                    checked={caseForm.isChildRelated}
                    onChange={(e) => setCaseForm(prev => ({ ...prev, isChildRelated: e.target.checked }))}
                  />
                  <span>POCSO / Child Related (+20)</span>
                </label>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
              Submit File Registry & Calculate Score
            </button>
          </form>
        </div>
      )}

      {/* Hearing Scheduling Tab */}
      {activeTab === 'schedule' && (
        <div className="dashboard-panel" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div className="panel-header">
            <h3 className="panel-title">Schedule Court Hearing Date</h3>
          </div>
          <form onSubmit={handleScheduleHearing} style={{ marginTop: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Select Case (Sorted by priority score)</label>
              <select 
                className="form-select"
                value={hearingForm.caseId}
                onChange={(e) => setHearingForm(prev => ({ ...prev, caseId: e.target.value }))}
                required
              >
                {cases.map(c => (
                  <option key={c._id} value={c._id}>
                    [{c.priorityScore}] {c.caseNumber} - {c.title} ({c.status})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Select Hearing Date</label>
              <input 
                type="date" 
                className="form-input" 
                value={hearingForm.date}
                onChange={(e) => setHearingForm(prev => ({ ...prev, date: e.target.value }))}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Hearing Start Time</label>
              <select 
                className="form-select"
                value={hearingForm.time}
                onChange={(e) => setHearingForm(prev => ({ ...prev, time: e.target.value }))}
              >
                <option value="10:00 AM">10:00 AM (Morning Session)</option>
                <option value="11:30 AM">11:30 AM (Morning Session)</option>
                <option value="02:00 PM">02:00 PM (Afternoon Session)</option>
                <option value="03:30 PM">03:30 PM (Afternoon Session)</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
              Finalize Hearing (Validates Lawyer Availability)
            </button>
          </form>
        </div>
      )}

      {/* Adjournments Tab */}
      {activeTab === 'adjournments' && (
        <div className="dashboard-panel">
          <div className="panel-header">
            <h3 className="panel-title">Review Adjournment Requests</h3>
          </div>
          
          {adjournments.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              No adjournment requests filed in the system.
            </div>
          ) : (
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Case Number</th>
                    <th>Requested By</th>
                    <th>Reason</th>
                    <th>Proposed Next Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {adjournments.map(a => (
                    <tr key={a._id}>
                      <td style={{ fontWeight: 700 }}>{a.caseId?.caseNumber || 'N/A'}</td>
                      <td>{a.requestedBy?.name} ({a.requestedBy?.role})</td>
                      <td>{a.reason}</td>
                      <td>{new Date(a.date).toLocaleDateString()}</td>
                      <td>
                        <span className={`badge ${
                          a.status === 'Approved' ? 'badge-success' :
                          a.status === 'Rejected' ? 'badge-danger' : 'badge-warning'
                        }`}>
                          {a.status}
                        </span>
                      </td>
                      <td>
                        {a.status === 'Pending' ? (
                          <div style={{ display: 'flex', gap: '0.25rem' }}>
                            <button 
                              className="btn btn-primary btn-sm"
                              onClick={() => handleAdjournmentStatus(a._id, 'Approved')}
                            >
                              Approve
                            </button>
                            <button 
                              className="btn btn-danger btn-sm"
                              onClick={() => handleAdjournmentStatus(a._id, 'Rejected')}
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                            Processed
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ClerkDashboard;
