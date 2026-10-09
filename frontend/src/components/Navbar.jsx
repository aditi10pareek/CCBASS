import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Bell, User, LogOut, Check, Gavel } from 'lucide-react';
import api from '../services/api';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      if (user) {
        const res = await api.analytics.getNotifications();
        if (res.success) {
          setNotifications(res.data);
          setUnreadCount(res.data.filter(n => n.status === 'Unread').length);
        }
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll every 30 seconds for live notifications
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const handleMarkRead = async (id, e) => {
    e.stopPropagation();
    try {
      const res = await api.analytics.markNotificationRead(id);
      if (res.success) {
        setNotifications(prev => 
          prev.map(n => n._id === id ? { ...n, status: 'Read' } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Failed to mark notification read:', err);
    }
  };

  if (!user) return null;

  return (
    <header className="navbar">
      <div className="navbar-title" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        <div style={{
          background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
          color: 'white',
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(104, 98, 217, 0.4)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <Gavel size={20} />
        </div>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.3px', margin: 0, lineHeight: 1.1 }}>
            NyaayFlow Portal
          </h2>
          <span style={{ color: '#94a3b8', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.5px' }}>
            CASE SCHEDULING PORTAL
          </span>
        </div>
      </div>

      <div className="navbar-user">
        {/* Notifications Dropdown */}
        <div style={{ position: 'relative' }}>
          <button 
            onClick={toggleDropdown}
            style={{ 
              background: 'rgba(255, 255, 255, 0.08)', 
              border: '1px solid rgba(255, 255, 255, 0.15)', 
              cursor: 'pointer', 
              position: 'relative',
              padding: '0.55rem',
              borderRadius: '10px',
              color: '#e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'var(--transition)'
            }}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: -4,
                right: -4,
                backgroundColor: 'var(--danger)',
                color: 'white',
                fontSize: '0.65rem',
                fontWeight: 'bold',
                borderRadius: '50%',
                width: '18px',
                height: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 6px rgba(239, 68, 68, 0.5)'
              }}>
                {unreadCount}
              </span>
            )}
          </button>

          {showDropdown && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: '46px',
              backgroundColor: 'white',
              border: '1px solid var(--card-border)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-lg)',
              width: '320px',
              zIndex: 200,
              maxHeight: '400px',
              overflowY: 'auto'
            }}>
              <div style={{
                padding: '0.75rem 1rem',
                borderBottom: '1px solid var(--card-border)',
                fontWeight: 600,
                fontSize: '0.9rem',
                color: 'var(--text-primary)'
              }} className="flex-between">
                <span>Alerts & Notifications</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  ({unreadCount} new)
                </span>
              </div>

              {notifications.length === 0 ? (
                <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  No notifications yet.
                </div>
              ) : (
                notifications.map(n => (
                  <div 
                    key={n._id} 
                    className={`notification-item ${n.status === 'Unread' ? 'unread' : ''}`}
                    style={{ cursor: 'default' }}
                  >
                    <div style={{ flex: 1 }}>
                      <div className="notification-title">{n.title}</div>
                      <div className="notification-message">{n.message}</div>
                      <div className="notification-time">
                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    {n.status === 'Unread' && (
                      <button 
                        onClick={(e) => handleMarkRead(n._id, e)}
                        title="Mark as Read"
                        style={{
                          background: 'var(--primary-glow)',
                          border: 'none',
                          color: 'var(--primary-light)',
                          cursor: 'pointer',
                          padding: '0.25rem',
                          borderRadius: 'var(--radius-sm)'
                        }}
                      >
                        <Check size={14} />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* User Badge */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.65rem',
          background: 'rgba(255, 255, 255, 0.08)',
          padding: '0.35rem 0.85rem 0.35rem 0.45rem',
          borderRadius: '9999px',
          border: '1px solid rgba(255, 255, 255, 0.12)'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            fontSize: '0.85rem',
            border: '1px solid rgba(255, 255, 255, 0.25)'
          }}>
            {user.name[0].toUpperCase()}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff', lineHeight: 1.1 }}>{user.name}</span>
            <span style={{ 
              fontSize: '0.65rem', 
              width: 'fit-content', 
              padding: '0.05rem 0.4rem', 
              marginTop: '0.15rem',
              borderRadius: '4px',
              background: 'rgba(99, 102, 241, 0.3)',
              border: '1px solid rgba(165, 180, 252, 0.4)',
              color: '#c7d2fe',
              fontWeight: 700,
              letterSpacing: '0.5px',
              textTransform: 'uppercase'
            }}>
              {user.role}
            </span>
          </div>
        </div>

        {/* Logout Button */}
        <button 
          onClick={logout}
          title="Sign Out"
          style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#fca5a5',
            cursor: 'pointer',
            padding: '0.5rem 0.85rem',
            marginLeft: '0.25rem',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            fontSize: '0.85rem',
            fontWeight: 600,
            transition: 'var(--transition)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.25)';
            e.currentTarget.style.color = '#ffffff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.15)';
            e.currentTarget.style.color = '#fca5a5';
          }}
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
