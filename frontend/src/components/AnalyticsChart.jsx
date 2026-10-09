import React from 'react';

const AnalyticsChart = ({ type, data, title }) => {
  if (!data || (Array.isArray(data) && data.length === 0)) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        No data available to display.
      </div>
    );
  }

  // 1. Horizontal bar chart (e.g. for Case Type distribution or Judge Workload)
  const renderHorizontalBars = () => {
    // Find maximum count for scaling
    const maxVal = Math.max(...data.map(item => item.count || item.caseCount || item.totalAdjournments || 1));

    return (
      <div className="chart-bar-container">
        {data.map((item, idx) => {
          const label = item.type || item.judgeName || item.lawyerName || 'Unknown';
          const value = item.count !== undefined ? item.count : (item.caseCount !== undefined ? item.caseCount : item.totalAdjournments);
          const percent = Math.max(8, (value / maxVal) * 100);

          // Alternating colors
          const hues = [220, 160, 25, 5, 280, 190];
          const color = `hsl(${hues[idx % hues.length]}, 70%, 50%)`;

          return (
            <div key={idx} className="chart-bar-row">
              <div className="chart-bar-label" title={label}>{label}</div>
              <div className="chart-bar-track">
                <div 
                  className="chart-bar-fill" 
                  style={{ 
                    width: `${percent}%`, 
                    backgroundColor: color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    paddingRight: '8px'
                  }}
                >
                  <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'white' }}>{value}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // 2. Vertical bar chart (e.g. for Monthly Cases filing)
  const renderVerticalBars = () => {
    const maxVal = Math.max(...data.map(item => item.count || 1));

    return (
      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-around',
        height: '240px',
        padding: '1rem 0',
        borderBottom: '2px solid var(--card-border)'
      }}>
        {data.map((item, idx) => {
          const label = item.month || 'N/A';
          const value = item.count || 0;
          const percent = (value / maxVal) * 100;

          return (
            <div 
              key={idx} 
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                flex: 1,
                gap: '0.5rem',
                height: '100%',
                justifyContent: 'flex-end'
              }}
            >
              <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-secondary)' }}>{value}</span>
              <div 
                style={{
                  width: '60%',
                  maxWidth: '36px',
                  height: `${percent}%`,
                  minHeight: '8px',
                  backgroundColor: 'var(--primary-light)',
                  borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
                  backgroundImage: 'linear-gradient(to top, var(--primary) 0%, var(--primary-light) 100%)',
                  transition: 'height 0.5s ease',
                  boxShadow: 'var(--shadow-sm)'
                }}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', transform: 'rotate(-25deg)', transformOrigin: 'top center', marginTop: '0.25rem' }}>
                {label}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  // 3. Grid-based progress list (e.g. for Lawyer Adjournments)
  const renderProgressList = () => {
    const maxVal = Math.max(...data.map(item => item.avgAdjournments || 1));

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {data.map((item, idx) => {
          const label = item.lawyerName || 'Unknown';
          const avg = item.avgAdjournments !== undefined ? item.avgAdjournments : 0;
          const total = item.totalAdjournments !== undefined ? item.totalAdjournments : 0;
          const percent = Math.min(100, (avg / Math.max(1, maxVal)) * 100);

          return (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <div className="flex-between" style={{ fontSize: '0.875rem' }}>
                <span style={{ fontWeight: 600 }}>{label}</span>
                <span style={{ color: 'var(--text-secondary)' }}>
                  Avg: <strong>{avg}</strong> ({total} total)
                </span>
              </div>
              <div style={{ height: '8px', backgroundColor: '#e2e8f0', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                <div 
                  style={{ 
                    height: '100%', 
                    width: `${percent}%`, 
                    backgroundColor: avg > 4 ? 'var(--danger)' : (avg > 2 ? 'var(--warning)' : 'var(--success)'),
                    borderRadius: 'var(--radius-full)'
                  }} 
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="dashboard-panel" style={{ height: '100%', minHeight: '340px' }}>
      <div className="panel-header">
        <h3 className="panel-title">{title}</h3>
      </div>
      <div style={{ marginTop: '1rem' }}>
        {type === 'horizontalBar' && renderHorizontalBars()}
        {type === 'verticalBar' && renderVerticalBars()}
        {type === 'progressList' && renderProgressList()}
      </div>
    </div>
  );
};

export default AnalyticsChart;
