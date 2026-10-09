import React, { useState, useEffect } from 'react';
import CustomCalendar from '../components/CustomCalendar';
import api from '../services/api';

const CalendarPage = () => {
  const [hearings, setHearings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchHearings = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.hearings.getAll();
      if (res.success) {
        setHearings(res.data);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch calendar schedules.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHearings();
  }, []);

  if (loading) return <div className="loader" />;
  if (error) return <div style={{ color: 'var(--danger)', padding: '2rem', textAlign: 'center' }}>{error}</div>;

  return (
    <div>
      <div className="panel-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1 className="page-title" style={{ margin: 0 }}>Hearing Calendar</h1>
          <p className="page-subtitle" style={{ margin: 0 }}>Roster agenda visualizer. Click on any date to inspect daily rosters.</p>
        </div>
      </div>
      <CustomCalendar hearings={hearings} />
    </div>
  );
};

export default CalendarPage;
