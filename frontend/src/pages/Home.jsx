import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Gavel, FileText, Calendar, ShieldCheck, Scale, Users, Phone, Mail, Landmark, Lock, Sparkles } from 'lucide-react';
import api from '../services/api';
import supremeCourtImg from '../assets/supreme-court.jpg';

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setSearched(true);
    setError('');
    try {
      const res = await api.cases.getAll({ search: searchQuery });
      if (res.success) {
        setSearchResults(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch search results.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      backgroundImage: `linear-gradient(135deg, rgba(15, 23, 42, 0.91) 0%, rgba(30, 27, 75, 0.86) 50%, rgba(15, 23, 42, 0.93) 100%), url(${supremeCourtImg})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center center',
      backgroundAttachment: 'fixed',
      minHeight: '100vh', 
      paddingBottom: '4rem',
      color: '#ffffff'
    }}>
      {/* Top Header with High-End Frosted Glass & Max-Width Alignment */}
      <header style={{
        backgroundColor: 'rgba(97, 10, 246, 0.8)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
        //boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        padding: '0.85rem 1.5rem'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          {/* Brand Logo & Authority Label */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{
              background: 'linear-gradient(135deg, #ee0707 0%, #6366f1 50%, #818cf8 100%)',
              color: 'white',
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(79, 70, 229, 0.45)',
              border: '1px solid rgba(255, 255, 255, 0.25)'
            }}>
              <Gavel size={22} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ 
                  color: '#f4f8f5', 
                  fontSize: '1.45rem', 
                  fontWeight: 800, 
                  letterSpacing: '-0.5px', 
                  lineHeight: 1.1,
                  background: 'linear-gradient(135deg, #ffffff 0%, #f1f5f9 60%, #c7d2fe 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  NyaayFlow
                </span>
                <span style={{
                  backgroundColor: 'rgba(99, 102, 241, 0.25)',
                  border: '1px solid rgba(165, 180, 252, 0.35)',
                  color: '#a5b4fc',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  letterSpacing: '0.5px',
                  padding: '0.1rem 0.45rem',
                  borderRadius: '4px',
                  textTransform: 'uppercase'
                }}>
                  Gov Portal
                </span>
              </div>
              <span style={{ 
                color: '#94a3b8', 
                fontSize: '0.72rem', 
                fontWeight: 600, 
                letterSpacing: '0.6px',
                textTransform: 'uppercase',
                marginTop: '0.15rem'
              }}>
                Judicial Case Management
              </span>
            </div>
          </div>

          {/* Right Action Items */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#cbd5e1',
              fontSize: '0.8rem',
              background: 'rgba(255, 255, 255, 0.06)',
              padding: '0.45rem 0.95rem',
              borderRadius: '9999px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(8px)'
            }}>
              <ShieldCheck size={15} style={{ color: '#38bdf8' }} />
              <span style={{ fontWeight: 500 }}>e-Courts National Grid</span>
            </div>

            <Link 
              to="/login" 
              className="btn"
              style={{ 
                background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
                color: '#ffffff',
                padding: '0.55rem 1.35rem', 
                fontSize: '0.88rem',
                fontWeight: 600,
                borderRadius: '10px',
                border: '1px solid rgba(255, 255, 255, 0.22)',
                boxShadow: '0 4px 16px rgba(79, 70, 229, 0.45)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                transition: 'all 0.2s ease'
              }}
            >
              <Lock size={14} />
              Official Login
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div 
        style={{ 
          padding: '5rem 2rem 5.5rem 2rem',
          textAlign: 'center',
          position: 'relative'
        }}
      >
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'rgba(99, 102, 241, 0.22)',
          border: '1px solid rgba(165, 180, 252, 0.35)',
          color: '#c7d2fe',
          fontSize: '0.85rem',
          fontWeight: 700,
          letterSpacing: '1px',
          textTransform: 'uppercase',
          padding: '0.45rem 1.25rem',
          borderRadius: '9999px',
          marginBottom: '1.5rem',
          backdropFilter: 'blur(8px)',
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
        }}>
          <Landmark size={17} />
          National Judicial Portal
        </div>
        <h2 style={{ 
          maxWidth: '960px', 
          margin: '0 auto 1.25rem auto', 
          fontSize: '2.85rem', 
          fontWeight: 800, 
          letterSpacing: '-0.5px',
          lineHeight: 1.18,
          color: '#ffffff',
          textShadow: '0 3px 12px rgba(0, 0, 0, 0.6)' 
        }}>
          Court Management and Case Management System
        </h2>
        <p style={{ 
          maxWidth: '780px', 
          margin: '0 auto', 
          fontSize: '1.18rem', 
          color: '#cbd5e1', 
          lineHeight: 1.6,
          textShadow: '0 2px 8px rgba(0, 0, 0, 0.5)' 
        }}>
          To make policy for managing case loads, for effective Court Management and Case Management System.
        </p>
      </div>

      {/* Case Search Container */}
      <div className="search-wrapper" style={{ margin: '-2.5rem auto 3.5rem auto' }}>
        <form onSubmit={handleSearch} className="search-box" style={{ 
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.4)',
          boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.45)'
        }}>
          <input 
            type="text" 
            placeholder="Search case by Case Number, Plaintiff, Defendant, or Court..."
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ color: '#0f172a', fontWeight: 500 }}
          />
          <button type="submit" className="btn btn-primary search-btn" style={{ boxShadow: '0 4px 12px rgba(79, 70, 229, 0.35)' }}>
            <Search size={18} style={{ marginRight: '0.25rem' }} /> Search
          </button>
        </form>
      </div>

      {/* Main Body */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>
        {/* Search Results */}
        {searched && (
          <div className="dashboard-panel" style={{ 
            marginBottom: '3rem', 
            borderLeft: '4px solid var(--primary-light)',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            boxShadow: '0 15px 35px rgba(0, 0, 0, 0.3)',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.4)',
            color: '#1e293b'
          }}>
            <div className="panel-header" style={{ borderBottom: '1px solid #e2e8f0' }}>
              <h3 className="panel-title" style={{ color: '#0f172a' }}>Public Search Results</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => { setSearched(false); setSearchQuery(''); setSearchResults([]); }}>
                Clear Results
              </button>
            </div>
            
            {loading ? (
              <div className="loader" />
            ) : error ? (
              <div style={{ color: 'var(--danger)', padding: '1rem', textAlign: 'center' }}>{error}</div>
            ) : searchResults.length === 0 ? (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                No active records matched your search query. Please double-check the Case Number or names.
              </div>
            ) : (
              <div className="table-container" style={{ marginTop: '1rem' }}>
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Case Number</th>
                      <th>Case Title</th>
                      <th>Type</th>
                      <th>Assigned Court</th>
                      <th>Current Status</th>
                      <th>Next Hearing Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {searchResults.map((c) => (
                      <tr key={c._id}>
                        <td>
                          <Link to={`/public-case/${c._id}`} style={{ fontWeight: 700, color: 'var(--primary-light)' }}>
                            {c.caseNumber}
                          </Link>
                        </td>
                        <td style={{ fontWeight: 600 }}>{c.title}</td>
                        <td>
                          <span className={`badge ${c.caseType === 'Criminal' ? 'badge-danger' : 'badge-info'}`}>
                            {c.caseType}
                          </span>
                        </td>
                        <td>{c.court}</td>
                        <td>
                          <span className={`badge ${
                            c.status === 'Closed' ? 'badge-success' :
                            c.status === 'Scheduled' ? 'badge-info' :
                            c.status === 'Adjourned' ? 'badge-warning' : 'badge-muted'
                          }`}>
                            {c.status}
                          </span>
                        </td>
                        <td>
                          {c.nextHearing ? (
                            <strong style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--primary-light)' }}>
                              <Calendar size={14} />
                              {new Date(c.nextHearing).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                            </strong>
                          ) : (
                            <span style={{ color: 'var(--text-muted)' }}>Not Scheduled</span>
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

        {/* Features / Details grid */}
        <h2 style={{ 
          textAlign: 'center', 
          fontSize: '1.85rem', 
          fontWeight: 800, 
          marginBottom: '2.5rem', 
          color: '#ffffff',
          textShadow: '0 2px 10px rgba(0, 0, 0, 0.6)' 
        }}>
          Portal Features & Case Management
        </h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
          {/* Card 1 */}
          <div className="dashboard-panel" style={{ 
            textAlign: 'center', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            gap: '1rem', 
            padding: '2.25rem 2rem',
            background: 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.4)',
            borderRadius: '16px',
            boxShadow: '0 15px 35px rgba(0, 0, 0, 0.25)',
            color: '#1e293b'
          }}>
            <div style={{ backgroundColor: 'var(--primary-glow)', color: 'var(--primary-light)', padding: '1.1rem', borderRadius: '50%' }}>
              <Scale size={34} />
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#0f172a' }}>Priority Scoring Engine</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: '1.6' }}>
              NyaayFlow employs a robust algorithm to automatically score cases based on time in queue, criminal status, women's safety, senior citizenship, and adjournments to schedule hearings efficiently.
            </p>
          </div>

          {/* Card 2 */}
          <div className="dashboard-panel" style={{ 
            textAlign: 'center', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            gap: '1rem', 
            padding: '2.25rem 2rem',
            background: 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.4)',
            borderRadius: '16px',
            boxShadow: '0 15px 35px rgba(0, 0, 0, 0.25)',
            color: '#1e293b'
          }}>
            <div style={{ backgroundColor: 'var(--primary-glow)', color: 'var(--primary-light)', padding: '1.1rem', borderRadius: '50%' }}>
              <Calendar size={34} />
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#0f172a' }}>Automated Scheduling</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: '1.6' }}>
              Hearings are booked taking lawyer availabilities, judge workloads, and case priority ratings into account, reducing conflicting schedules and court congestion.
            </p>
          </div>

          {/* Card 3 */}
          <div className="dashboard-panel" style={{ 
            textAlign: 'center', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            gap: '1rem', 
            padding: '2.25rem 2rem',
            background: 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.4)',
            borderRadius: '16px',
            boxShadow: '0 15px 35px rgba(0, 0, 0, 0.25)',
            color: '#1e293b'
          }}>
            <div style={{ backgroundColor: 'var(--primary-glow)', color: 'var(--primary-light)', padding: '1.1rem', borderRadius: '50%' }}>
              <ShieldCheck size={34} />
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#0f172a' }}>Transparency & Security</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: '1.6' }}>
              Public citizens get immediate, login-free read-only access to search and track their court schedules, maintaining public trust while protecting sensitive court metadata.
            </p>
          </div>
        </div>

        {/* Contact Footer with Frosted Dark Glass */}
        <section className="dashboard-panel mt-2" style={{ 
          backgroundColor: 'rgba(15, 23, 42, 0.85)', 
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          color: 'white', 
          border: '1px solid rgba(255, 255, 255, 0.15)', 
          borderRadius: '16px',
          padding: '2.5rem',
          boxShadow: '0 15px 35px rgba(0, 0, 0, 0.35)',
          marginTop: '3.5rem'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }} className="grid-2">
            <div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: 'white' }}>Department of Justice Support</h3>
              <p style={{ color: '#cbd5e1', fontSize: '0.95rem', lineHeight: '1.6' }}>
                For queries regarding case schedules, lawyer panels, or system support, reach out to the court registry department during working hours (10:00 AM to 5:00 PM).
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', justifyContent: 'center', color: '#e2e8f0' }}>
              <div className="align-center" style={{ gap: '0.75rem' }}>
                <Phone size={18} style={{ color: 'var(--primary-light)' }} />
                <span>Registry Desk: 1800-419-2022</span>
              </div>
              <div className="align-center" style={{ gap: '0.75rem' }}>
                <Mail size={18} style={{ color: 'var(--primary-light)' }} />
                <span>Email: support.nyaayflow@gov.in</span>
              </div>
              <div className="align-center" style={{ gap: '0.75rem' }}>
                <Users size={18} style={{ color: 'var(--primary-light)' }} />
                <span>Portal managed by National Informatics Center</span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;
