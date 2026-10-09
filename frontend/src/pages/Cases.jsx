import React, { useState, useEffect } from 'react';
import { Briefcase, Calendar, Plus, Clock, Search, Filter } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Link, useNavigate } from 'react-router-dom';

const CasesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cases, setCases] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchCases = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (typeFilter) params.caseType = typeFilter;
      if (search) params.search = search;

      const res = await api.cases.getAll(params);
      if (res.success) {
        setCases(res.data);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to retrieve case listings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, [statusFilter, typeFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCases();
  };

  if (loading) return <div className="loader" />;

  return (
    <div className="dashboard-panel">
      <div className="panel-header">
        <div>
          <h3 className="panel-title">Active Litigation Roster</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Roster of cases assigned to your credentials.
          </p>
        </div>
        
        {/* Search & Filter Bar */}
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }} className="no-print">
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search title, party, room..."
              className="form-input"
              style={{ paddingLeft: '2.25rem', width: '200px', paddingTop: '0.4rem', paddingBottom: '0.4rem' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select 
            className="form-select"
            style={{ width: '130px', paddingTop: '0.4rem', paddingBottom: '0.4rem' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="New">New</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Adjourned">Adjourned</option>
            <option value="Closed">Closed</option>
          </select>

          <select 
            className="form-select"
            style={{ width: '130px', paddingTop: '0.4rem', paddingBottom: '0.4rem' }}
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">All Types</option>
            <option value="Civil">Civil</option>
            <option value="Criminal">Criminal</option>
          </select>

          <button type="submit" className="btn btn-primary btn-sm">Search</button>
        </form>
      </div>

      {error && (
        <div style={{ padding: '0.75rem', backgroundColor: 'var(--danger-light)', color: 'var(--danger)', borderRadius: 'var(--radius-sm)', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      {cases.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          No case records found.
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
                <th>Court</th>
                <th>Priority Score</th>
                <th>Status</th>
                {user.role === 'Clerk' && <th>Action</th>}
              </tr>
            </thead>
            <tbody>
              {cases.map(c => (
                <tr key={c._id}>
                  <td style={{ fontWeight: 700 }}>{c.caseNumber}</td>
                  <td style={{ fontWeight: 600 }}>{c.title}</td>
                  <td>
                    <span className={`badge ${c.caseType === 'Criminal' ? 'badge-danger' : 'badge-info'}`}>
                      {c.caseType}
                    </span>
                  </td>
                  <td>{c.plaintiff}</td>
                  <td>{c.defendant}</td>
                  <td>{c.court}</td>
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
                  {user.role === 'Clerk' && (
                    <td>
                      {c.status === 'New' ? (
                        <button 
                          className="btn btn-primary btn-sm"
                          onClick={() => {
                            // Redirect to Clerk scheduling tab
                            navigate('/dashboard');
                          }}
                        >
                          Book Roster
                        </button>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Scheduled</span>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CasesPage;
