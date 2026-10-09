import React, { useState, useEffect } from 'react';
import { FileText, Download, Printer, ShieldAlert } from 'lucide-react';
import api from '../services/api';

const Reports = () => {
  const [reportType, setReportType] = useState('pending');
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateReport = async () => {
    setLoading(true);
    setError('');
    try {
      if (reportType === 'pending') {
        const res = await api.cases.getAll({ status: 'New,Scheduled,Adjourned', sort: 'priorityScoreDesc' });
        if (res.success) setReportData(res.data);
      } else if (reportType === 'closed') {
        const res = await api.cases.getAll({ status: 'Closed' });
        if (res.success) setReportData(res.data);
      } else if (reportType === 'delay') {
        const res = await api.cases.getAll();
        if (res.success) {
          // Delayed: Filing age > 1 year OR adjournments > 3 and not closed
          const oneYearAgo = new Date();
          oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
          const filtered = res.data.filter(c => 
            c.status !== 'Closed' && 
            (new Date(c.filingDate) <= oneYearAgo || c.adjournmentCount > 3)
          );
          setReportData(filtered);
        }
      } else if (reportType === 'judges') {
        const chartRes = await api.analytics.getCharts();
        if (chartRes.success) {
          setReportData(chartRes.data.judgeWorkload);
        }
      } else if (reportType === 'lawyers') {
        const chartRes = await api.analytics.getCharts();
        if (chartRes.success) {
          setReportData(chartRes.data.lawyerDelays);
        }
      }
    } catch (err) {
      console.error(err);
      setError('Failed to compile court report.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateReport();
  }, [reportType]);

  const handlePrint = () => {
    window.print();
  };

  const renderTable = () => {
    if (loading) return <div className="loader" />;
    if (reportData.length === 0) {
      return (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          No records matched the selected parameters.
        </div>
      );
    }

    switch (reportType) {
      case 'pending':
      case 'delay':
        return (
          <table className="custom-table">
            <thead>
              <tr>
                <th>Case Number</th>
                <th>Title</th>
                <th>Classification</th>
                <th>Assigned Judge</th>
                <th>Assigned Lawyer</th>
                <th>Filing Date</th>
                <th>Adjournments</th>
                <th>Priority Score</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {reportData.map(c => (
                <tr key={c._id}>
                  <td style={{ fontWeight: 700 }}>{c.caseNumber}</td>
                  <td style={{ fontWeight: 600 }}>{c.title}</td>
                  <td>{c.caseType}</td>
                  <td>{c.judgeId?.name}</td>
                  <td>{c.lawyerId?.name}</td>
                  <td>{new Date(c.filingDate).toLocaleDateString()}</td>
                  <td>{c.adjournmentCount}</td>
                  <td>
                    <span className={`priority-tag ${c.priorityScore > 50 ? 'priority-high' : ''}`}>
                      {c.priorityScore}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${
                      c.status === 'Scheduled' ? 'badge-info' : 'badge-warning'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      case 'closed':
        return (
          <table className="custom-table">
            <thead>
              <tr>
                <th>Case Number</th>
                <th>Title</th>
                <th>Type</th>
                <th>Judge</th>
                <th>Lawyer</th>
                <th>Filing Date</th>
                <th>Disposal Date</th>
                <th>Adjournments</th>
              </tr>
            </thead>
            <tbody>
              {reportData.map(c => (
                <tr key={c._id}>
                  <td style={{ fontWeight: 700 }}>{c.caseNumber}</td>
                  <td style={{ fontWeight: 600 }}>{c.title}</td>
                  <td>{c.caseType}</td>
                  <td>{c.judgeId?.name}</td>
                  <td>{c.lawyerId?.name}</td>
                  <td>{new Date(c.filingDate).toLocaleDateString()}</td>
                  <td>{new Date(c.updatedAt).toLocaleDateString()}</td>
                  <td>{c.adjournmentCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      case 'judges':
        return (
          <table className="custom-table">
            <thead>
              <tr>
                <th>Judge Name</th>
                <th>Pending Assigned Cases (Roster Count)</th>
              </tr>
            </thead>
            <tbody>
              {reportData.map((item, index) => (
                <tr key={index}>
                  <td style={{ fontWeight: 600 }}>{item.judgeName}</td>
                  <td><strong>{item.caseCount}</strong> cases pending in court</td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      case 'lawyers':
        return (
          <table className="custom-table">
            <thead>
              <tr>
                <th>Lawyer Name</th>
                <th>Average Adjournments per Case</th>
                <th>Total Adjournments</th>
              </tr>
            </thead>
            <tbody>
              {reportData.map((item, index) => (
                <tr key={index}>
                  <td style={{ fontWeight: 600 }}>{item.lawyerName}</td>
                  <td>
                    <span className={`badge ${item.avgAdjournments > 4 ? 'badge-danger' : (item.avgAdjournments > 2 ? 'badge-warning' : 'badge-success')}`}>
                      {item.avgAdjournments} average
                    </span>
                  </td>
                  <td><strong>{item.totalAdjournments}</strong> request(s) filed</td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      default:
        return null;
    }
  };

  return (
    <div>
      <div className="flex-between">
        <div>
          <h1 className="page-title">Registry Reports Console</h1>
          <p className="page-subtitle">Compile and print summaries of backlogs, dispositions, and judicial performances.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }} className="no-print">
          <button className="btn btn-secondary" onClick={handlePrint}>
            <Printer size={16} /> Print Report
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 3.5fr', gap: '1.5rem', marginTop: '1.5rem' }} className="grid-2">
        {/* Navigation Sidebar */}
        <div className="dashboard-panel no-print" style={{ height: 'fit-content' }}>
          <div className="panel-header">
            <h4 style={{ fontWeight: 700 }}>Select Report</h4>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
            <button 
              className={`btn ${reportType === 'pending' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ justifyContent: 'flex-start', fontSize: '0.85rem' }}
              onClick={() => setReportType('pending')}
            >
              Pending Cases Queue
            </button>
            <button 
              className={`btn ${reportType === 'closed' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ justifyContent: 'flex-start', fontSize: '0.85rem' }}
              onClick={() => setReportType('closed')}
            >
              Disposed Cases Log
            </button>
            <button 
              className={`btn ${reportType === 'delay' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ justifyContent: 'flex-start', fontSize: '0.85rem' }}
              onClick={() => setReportType('delay')}
            >
              Court Backlog Delay Report
            </button>
            <button 
              className={`btn ${reportType === 'judges' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ justifyContent: 'flex-start', fontSize: '0.85rem' }}
              onClick={() => setReportType('judges')}
            >
              Judicial Roster Workloads
            </button>
            <button 
              className={`btn ${reportType === 'lawyers' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ justifyContent: 'flex-start', fontSize: '0.85rem' }}
              onClick={() => setReportType('lawyers')}
            >
              Lawyer Adjournment Index
            </button>
          </div>
        </div>

        {/* Display Panel */}
        <div className="dashboard-panel">
          <div className="panel-header">
            <h3 className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={20} />
              {reportType === 'pending' && 'Official Pending Roster Report'}
              {reportType === 'closed' && 'Official Case Dispositions (Closed Cases)'}
              {reportType === 'delay' && 'Official Court Backlog & Delay Index Audit'}
              {reportType === 'judges' && 'Judge Performance & Case Distribution'}
              {reportType === 'lawyers' && 'Lawyer Performance & Adjournment Summary'}
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Total: {reportData.length} records
            </span>
          </div>

          {error && (
            <div style={{ padding: '0.75rem', backgroundColor: 'var(--danger-light)', color: 'var(--danger)', borderRadius: 'var(--radius-sm)', marginBottom: '1rem' }}>
              {error}
            </div>
          )}

          <div className="table-container" style={{ marginTop: '1rem' }}>
            {renderTable()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
