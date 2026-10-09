import React from 'react';

const MetricCard = ({ value, label, icon: Icon, color = 'blue' }) => {
  // Gradients and HSL values based on card colors
  const colorMap = {
    blue: { bg: 'rgba(59, 130, 246, 0.1)', border: 'rgba(59, 130, 246, 0.2)', text: '#3b82f6' },
    green: { bg: 'rgba(16, 185, 129, 0.1)', border: 'rgba(16, 185, 129, 0.2)', text: '#10b981' },
    orange: { bg: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.2)', text: '#f59e0b' },
    red: { bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.2)', text: '#ef4444' },
    purple: { bg: 'rgba(139, 92, 246, 0.1)', border: 'rgba(139, 92, 246, 0.2)', text: '#8b5cf6' },
    teal: { bg: 'rgba(6, 182, 212, 0.1)', border: 'rgba(6, 182, 212, 0.2)', text: '#06b6d4' }
  };

  const selectedColor = colorMap[color] || colorMap.blue;

  return (
    <div className="metric-card">
      <div 
        className="metric-icon-wrapper"
        style={{ 
          backgroundColor: selectedColor.bg,
          border: `1px solid ${selectedColor.border}`,
          color: selectedColor.text
        }}
      >
        {Icon && <Icon size={24} />}
      </div>
      <div className="metric-info">
        <span className="metric-value">{value}</span>
        <span className="metric-label">{label}</span>
      </div>
    </div>
  );
};

export default MetricCard;
