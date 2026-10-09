import React, { useState, useEffect } from 'react';
import { Briefcase, Clock, FileCheck, AlertTriangle, Users, Landmark, Scale } from 'lucide-react';
import MetricCard from '../components/MetricCard';
import AnalyticsChart from '../components/AnalyticsChart';
import api from '../services/api';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [recentCases, setRecentCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const metricsRes = await api.analytics.getDashboard();
      const chartsRes = await api.analytics.getCharts();
      const casesRes = await api.cases.getAll({ sort: 'priorityScoreDesc' });

      if (metricsRes.success && chartsRes.success && casesRes.success) {
        setMetrics(metricsRes.data.metrics);
        setChartData(chartsRes.data);
        setRecentCases(casesRes.data.slice(0, 5)); // Get top 5 priority cases
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to load administrator dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) return <div className="loader" />;
  if (error) return <div style={{ color: 'var(--danger)', padding: '2rem', textAlign: 'center' }}>{error}</div>;

  return (
    <div>
      <div className="flex-between">
        <div>
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-subtitle">NyaayFlow Operations control, backlog analytics, and rule configurations.</p>
        </div>
        <button className="btn btn-primary" onClick={fetchDashboardData}>
          Refresh Analytics
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="metrics-grid">
        <MetricCard 
          value={metrics?.totalCases || 0} 
          label="Total Registered Cases" 
          icon={Briefcase} 
          color="blue" 
        />
        <MetricCard 
          value={metrics?.pendingCases || 0} 
          label="Active Pending Cases" 
          icon={Clock} 
          color="orange" 
        />
        <MetricCard 
          value={metrics?.closedCases || 0} 
          label="Disposed Cases" 
          icon={FileCheck} 
          color="green" 
        />
        <MetricCard 
          value={metrics?.delayedCases || 0} 
          label="Backlog (Delayed)" 
          icon={AlertTriangle} 
          color="red" 
        />
        <MetricCard 
          value={metrics?.judgesCount || 0} 
          label="Active Judges" 
          icon={Landmark} 
          color="purple" 
        />
        <MetricCard 
          value={metrics?.lawyersCount || 0} 
          label="Active Lawyers" 
          icon={Users} 
          color="teal" 
        />
      </div>

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }} className="grid-2">
        <AnalyticsChart 
          type="verticalBar" 
          data={chartData?.monthlyCases || []} 
          title="Monthly Filing Trend (Last 6 Months)" 
        />
        <AnalyticsChart 
          type="horizontalBar" 
          data={chartData?.casesByType || []} 
          title="Case Type Distribution" 
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }} className="grid-2">
        <AnalyticsChart 
          type="horizontalBar" 
          data={chartData?.judgeWorkload || []} 
          title="Judge Workload (Pending Roster)" 
        />
        <AnalyticsChart 
          type="progressList" 
          data={chartData?.lawyerDelays || []} 
          title="Lawyer Delay Index (Average Adjournments)" 
        />
      </div>

      {/* Priority Rules & Backlogs */}
      <div className="dashboard-grid">
        {/* Top Priority Backlog List */}
        <div className="dashboard-panel">
          <div className="panel-header">
            <h3 className="panel-title">Top Priority Backlog Cases</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Sorted by score</span>
          </div>
          
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Case Number</th>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Score</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentCases.map((c) => (
                  <tr key={c._id}>
                    <td style={{ fontWeight: 700 }}>{c.caseNumber}</td>
                    <td style={{ fontWeight: 600 }}>{c.title}</td>
                    <td>{c.caseType}</td>
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

        {/* Priority Scoring Rules Legend */}
        <div className="dashboard-panel">
          <div className="panel-header">
            <h3 className="panel-title">Explainable Priority Rules</h3>
          </div>
          <div style={{ display: 'flex', flexSpread: 'column', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              The system automatically computes the Priority Score based on these scheduling parameters:
            </div>
            
            <div className="flex-between" style={{ padding: '0.5rem', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-sm)' }}>
              <span>Case Age &gt; 5 years</span>
              <strong style={{ color: 'var(--danger)' }}>+50</strong>
            </div>
            <div className="flex-between" style={{ padding: '0.5rem', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-sm)' }}>
              <span>Criminal Classification</span>
              <strong style={{ color: 'var(--primary-light)' }}>+30</strong>
            </div>
            <div className="flex-between" style={{ padding: '0.5rem', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-sm)' }}>
              <span>Women Safety Flag</span>
              <strong style={{ color: 'var(--success)' }}>+25</strong>
            </div>
            <div className="flex-between" style={{ padding: '0.5rem', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-sm)' }}>
              <span>Senior Citizen Defendant/Plaintiff</span>
              <strong style={{ color: 'var(--warning)' }}>+20</strong>
            </div>
            <div className="flex-between" style={{ padding: '0.5rem', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-sm)' }}>
              <span>Child Related Case</span>
              <strong style={{ color: 'var(--info)' }}>+20</strong>
            </div>
            <div className="flex-between" style={{ padding: '0.5rem', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-sm)' }}>
              <span>Adjournments &gt; 5 times</span>
              <strong style={{ color: 'var(--text-primary)' }}>+15</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
