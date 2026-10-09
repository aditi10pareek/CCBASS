import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Clock, MapPin, User, FileText } from 'lucide-react';

const CustomCalendar = ({ hearings = [] }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Month names
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Days of week
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Get number of days in the month
  const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
  
  // Get index of first day of the month (0 = Sunday, 1 = Monday...)
  const getFirstDayOfMonth = (y, m) => new Date(y, m, 1).getDay();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDayIndex = getFirstDayOfMonth(year, month);

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Group hearings by day of month (YYYY-MM-DD)
  const getHearingsForDate = (d) => {
    return hearings.filter(h => {
      const hDate = new Date(h.date);
      return (
        hDate.getFullYear() === year &&
        hDate.getMonth() === month &&
        hDate.getDate() === d
      );
    });
  };

  const selectedHearings = hearings.filter(h => {
    const hDate = new Date(h.date);
    return (
      hDate.getFullYear() === selectedDate.getFullYear() &&
      hDate.getMonth() === selectedDate.getMonth() &&
      hDate.getDate() === selectedDate.getDate()
    );
  });

  const renderDays = () => {
    const dayCells = [];
    
    // Add empty cells for prefix days
    for (let i = 0; i < firstDayIndex; i++) {
      dayCells.push(<div key={`empty-${i}`} className="calendar-day empty" />);
    }

    // Add actual days
    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected = 
        selectedDate.getDate() === day &&
        selectedDate.getMonth() === month &&
        selectedDate.getFullYear() === year;

      const dayHearings = getHearingsForDate(day);
      const isToday = 
        new Date().getDate() === day &&
        new Date().getMonth() === month &&
        new Date().getFullYear() === year;

      dayCells.push(
        <div 
          key={`day-${day}`} 
          className={`calendar-day ${isSelected ? 'active' : ''}`}
          onClick={() => setSelectedDate(new Date(year, month, day))}
          style={{ 
            cursor: 'pointer',
            border: isToday ? '2px solid var(--primary-light)' : '1px solid #f1f5f9'
          }}
        >
          <div className="flex-between">
            <span className="calendar-day-num" style={{ color: isToday ? 'var(--primary-light)' : 'inherit' }}>
              {day}
            </span>
            {isToday && (
              <span style={{ fontSize: '0.65rem', backgroundColor: 'var(--primary-light)', color: 'white', padding: '0.05rem 0.25rem', borderRadius: '4px', fontWeight: 'bold' }}>
                Today
              </span>
            )}
          </div>
          <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '2px', maxHeight: '42px', marginTop: '4px' }}>
            {dayHearings.slice(0, 2).map((h, i) => (
              <div 
                key={i} 
                className="calendar-event"
                title={h.caseId?.title || 'Court Hearing'}
              >
                {h.caseId?.caseNumber || 'Hearing'}
              </div>
            ))}
            {dayHearings.length > 2 && (
              <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'center' }}>
                +{dayHearings.length - 2} more
              </div>
            )}
          </div>
        </div>
      );
    }

    return dayCells;
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '1.5rem' }}>
      {/* Calendar Card */}
      <div className="calendar-container">
        <div className="calendar-header">
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
            {monthNames[month]} {year}
          </h3>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-secondary btn-sm" onClick={prevMonth} style={{ padding: '0.35rem' }}>
              <ChevronLeft size={18} />
            </button>
            <button className="btn btn-secondary btn-sm" onClick={nextMonth} style={{ padding: '0.35rem' }}>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div className="calendar-grid">
          {dayNames.map((d, i) => (
            <div key={i} className="calendar-day-header">{d}</div>
          ))}
          {renderDays()}
        </div>
      </div>

      {/* Selected Day details */}
      <div className="dashboard-panel" style={{ height: 'fit-content', minHeight: '380px' }}>
        <div className="panel-header">
          <h3 className="panel-title">
            Hearings for {selectedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
          </h3>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
          {selectedHearings.length === 0 ? (
            <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              No hearings scheduled on this date.
            </div>
          ) : (
            selectedHearings.map((h, i) => (
              <div 
                key={i} 
                style={{
                  border: '1px solid var(--card-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  backgroundColor: '#f8fafc',
                  borderLeft: '4px solid var(--primary-light)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem'
                }}
              >
                <div className="flex-between">
                  <span style={{ fontWeight: 700, color: 'var(--primary)' }}>
                    {h.caseId?.caseNumber || 'N/A'}
                  </span>
                  <span className={`badge ${
                    h.status === 'Scheduled' ? 'badge-info' : 
                    h.status === 'Conducted' ? 'badge-success' : 'badge-danger'
                  }`}>
                    {h.status}
                  </span>
                </div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                  {h.caseId?.title || 'Unknown Case'}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  <div className="align-center" style={{ gap: '0.5rem' }}>
                    <Clock size={14} />
                    <span>Time: <strong>{h.time}</strong></span>
                  </div>
                  <div className="align-center" style={{ gap: '0.5rem' }}>
                    <MapPin size={14} />
                    <span>Court: <strong>{h.caseId?.court || 'N/A'}</strong></span>
                  </div>
                  <div className="align-center" style={{ gap: '0.5rem' }}>
                    <User size={14} />
                    <span>Judge: <strong>{h.judgeId?.name || 'Assigned Judge'}</strong></span>
                  </div>
                  {h.remarks && (
                    <div style={{ 
                      marginTop: '0.5rem', 
                      padding: '0.5rem', 
                      backgroundColor: 'white', 
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid #e2e8f0',
                      fontSize: '0.8rem'
                    }}>
                      <strong>Remarks: </strong>{h.remarks}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomCalendar;
