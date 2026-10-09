import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Briefcase, Calendar, MapPin, User, Scale, ArrowLeft, Clock, MessageSquare } from 'lucide-react';
import api from '../services/api';

const CaseDetails = () => {
  const { id } = useParams();
  const [caseDetails, setCaseDetails] = useState(null);
  const [hearings, setHearings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCaseDetails = async () => {
      try {
        setLoading(true);
        setError('');
        
        const detailsRes = await api.cases.getById(id);
        const hearingsRes = await api.hearings.getAll({ caseId: id });

        if (detailsRes.success) {
          setCaseDetails(detailsRes.data);
        }
        if (hearingsRes.success) {
          setHearings(hearingsRes.data);
        }
      } catch (err) {
        console.error(err);
        setError('Failed to retrieve case timeline details.');
      } finally {
        setLoading(false);
      }
    };

    fetchCaseDetails();
  }, [id]);

  if (loading) return <div className="loader" />;
  if (error) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <div style={{ color: 'var(--danger)', marginBottom: '1.5rem' }}>{error}</div>
        <Link to="/" className="btn btn-secondary">← Back to Portal Home</Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '900px', margin: '2rem auto', padding: '0 1.5rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/" className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', gap: '0.25rem' }}>
          <ArrowLeft size={16} /> Back to Search
        </Link>
      </div>

      {caseDetails && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Main Summary Header */}
          <div className="dashboard-panel" style={{ borderLeft: '6px solid var(--primary)' }}>
            <div className="flex-between">
              <span className="user-badge" style={{ fontSize: '0.85rem' }}>
                Case File Roster
              </span>
              <span className={`badge ${
                caseDetails.status === 'Closed' ? 'badge-success' :
                caseDetails.status === 'Scheduled' ? 'badge-info' : 'badge-warning'
              }`} style={{ fontSize: '0.9rem', padding: '0.35rem 0.75rem' }}>
                {caseDetails.status}
              </span>
            </div>

            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '1rem', color: 'var(--primary)' }}>
              {caseDetails.caseNumber} - {caseDetails.title}
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginTop: '1.5rem', fontSize: '0.9rem' }}>
              <div className="align-center" style={{ gap: '0.5rem' }}>
                <MapPin size={16} style={{ color: 'var(--primary-light)' }} />
                <span>Assigned Court: <strong>{caseDetails.court}</strong></span>
              </div>
              <div className="align-center" style={{ gap: '0.5rem' }}>
                <Calendar size={16} style={{ color: 'var(--primary-light)' }} />
                <span>Filing Date: <strong>{new Date(caseDetails.filingDate).toLocaleDateString(undefined, { dateStyle: 'long' })}</strong></span>
              </div>
              <div className="align-center" style={{ gap: '0.5rem' }}>
                <User size={16} style={{ color: 'var(--primary-light)' }} />
                <span>Hon'ble Judge: <strong>{caseDetails.judgeId?.name || 'N/A'}</strong></span>
              </div>
              <div className="align-center" style={{ gap: '0.5rem' }}>
                <User size={16} style={{ color: 'var(--primary-light)' }} />
                <span>Assigned Counsel: <strong>{caseDetails.lawyerId?.name || 'N/A'}</strong></span>
              </div>
            </div>
          </div>

          {/* Litigants & Priority scoring */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem' }} className="grid-2">
            {/* Litigants Card */}
            <div className="dashboard-panel">
              <div className="panel-header">
                <h3 className="panel-title">Litigation Parties</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Plaintiff (Petitioner)</span>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary-light)' }}>
                    {caseDetails.plaintiff}
                  </div>
                </div>
                <hr style={{ border: 0, borderTop: '1px solid var(--card-border)' }} />
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Defendant (Respondent)</span>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--danger)' }}>
                    {caseDetails.defendant}
                  </div>
                </div>
              </div>
            </div>

            {/* Backlog Score Explainer */}
            <div className="dashboard-panel">
              <div className="panel-header">
                <h3 className="panel-title">Priority Details</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '0.5rem', textAlign: 'center' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>PRIORITY INDEX RATING</div>
                <div className={`priority-tag ${caseDetails.priorityScore > 50 ? 'priority-high' : ''}`} style={{ fontSize: '2.5rem', padding: '0.25rem 1rem', borderRadius: 'var(--radius-md)', fontWeight: 800 }}>
                  {caseDetails.priorityScore}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                  Adjournments logged: <strong>{caseDetails.adjournmentCount}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Court Timeline & Hearings history */}
          <div className="dashboard-panel">
            <div className="panel-header">
              <h3 className="panel-title">Court Docket & Timeline</h3>
            </div>
            
            {hearings.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                No hearing roster entries recorded yet for this case file.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem', position: 'relative', paddingLeft: '1.5rem', borderLeft: '2px dashed var(--card-border)' }}>
                {hearings.map((h, index) => (
                  <div key={h._id} style={{ position: 'relative', marginBottom: '0.5rem' }}>
                    {/* Bullet marker */}
                    <div style={{
                      position: 'absolute',
                      left: '-31px',
                      top: '4px',
                      width: '14px',
                      height: '14px',
                      borderRadius: '50%',
                      backgroundColor: h.status === 'Conducted' ? 'var(--success)' : (h.status === 'Scheduled' ? 'var(--info)' : 'var(--danger)'),
                      border: '3px solid white',
                      boxShadow: 'var(--shadow-sm)'
                    }} />

                    <div style={{ border: '1px solid var(--card-border)', borderRadius: 'var(--radius-md)', padding: '1rem', backgroundColor: '#f8fafc' }}>
                      <div className="flex-between">
                        <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                          Hearing #{hearings.length - index}
                        </span>
                        <span className={`badge ${
                          h.status === 'Conducted' ? 'badge-success' : 
                          h.status === 'Scheduled' ? 'badge-info' : 'badge-danger'
                        }`}>
                          {h.status}
                        </span>
                      </div>
                      
                      <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.5rem 0' }}>
                        <div className="align-center" style={{ gap: '0.25rem' }}>
                          <Calendar size={13} />
                          <span>{new Date(h.date).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                        </div>
                        <div className="align-center" style={{ gap: '0.25rem' }}>
                          <Clock size={13} />
                          <span>{h.time}</span>
                        </div>
                      </div>

                      {h.remarks ? (
                        <div style={{ marginTop: '0.5rem', backgroundColor: 'white', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0', fontSize: '0.85rem' }}>
                          <div className="align-center" style={{ gap: '0.25rem', fontWeight: 600, color: 'var(--primary)', marginBottom: '0.25rem' }}>
                            <MessageSquare size={13} />
                            <span>Bench Order Details:</span>
                          </div>
                          <p style={{ color: 'var(--text-secondary)' }}>{h.remarks}</p>
                        </div>
                      ) : (
                        h.status === 'Scheduled' && (
                          <span style={{ fontSize: '0.8rem', fontStyle: 'italic', color: 'var(--text-muted)' }}>
                            Hearing is scheduled and active.
                          </span>
                        )
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CaseDetails;
