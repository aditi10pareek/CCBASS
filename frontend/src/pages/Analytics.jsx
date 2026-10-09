import React, { useState, useEffect } from 'react';
import { BarChart3, Clock, Scale, Hourglass } from 'lucide-react';
import AnalyticsChart from '../components/AnalyticsChart';
import api from '../services/api';

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.analytics.getCharts();
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to aggregate analytics database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) return <div className="loader" />;
  if (error) return <div style={{ color: 'var(--danger)', padding: '2rem', textAlign: 'center' }}>{error}</div>;

  return (
    <div>
      <div className="flex-between">
        <div>
          <h1 className="page-title">Executive Analytics</h1>
          <p className="page-subtitle">Roster delays, disposal rates, and workload distribution indices.</p>
        </div>
        <button className="btn btn-primary" onClick={fetchAnalytics}>
          Recalculate Metrics
        </button>
      </div>

      {/* Disposal Performance Card */}
      <div className="dashboard-panel" style={{ marginBottom: '2rem', borderLeft: '4px solid var(--success)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ 
            backgroundColor: 'var(--success-light)', 
            color: 'var(--success)', 
            padding: '1.25rem', 
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Hourglass size={36} />
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Average Case Disposal Speed
            </span>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary)', lineHeight: '1.1', margin: '0.25rem 0' }}>
              {data?.averageDisposalTime || 0} Days
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Average duration between filing and formal case disposition (marked Closed by Judge) across all resolved court dockets.
            </p>
          </div>
        </div>
      </div>

      {/* Grid of charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }} className="grid-2">
        <AnalyticsChart 
          type="verticalBar" 
          data={data?.monthlyCases || []} 
          title="Monthly Case Filings" 
        />
        <AnalyticsChart 
          type="horizontalBar" 
          data={data?.casesByType || []} 
          title="Litigation Categories (Civil vs Criminal)" 
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }} className="grid-2">
        <AnalyticsChart 
          type="horizontalBar" 
          data={data?.judgeWorkload || []} 
          title="Judicial Roster Distribution (Active Cases)" 
        />
        <AnalyticsChart 
          type="progressList" 
          data={data?.lawyerDelays || []} 
          title="Counsel Delays (Adjournments per Case)" 
        />
      </div>
    </div>
  );
};

export default Analytics;
