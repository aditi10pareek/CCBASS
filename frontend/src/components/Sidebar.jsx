import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Gavel, 
  LayoutDashboard, 
  Briefcase, 
  Calendar, 
  Users, 
  FileText, 
  BarChart3, 
  Clock, 
  UserCheck 
} from 'lucide-react';

const Sidebar = () => {
  const { user } = useAuth();

  if (!user) return null;

  const renderLinks = () => {
    switch (user.role) {
      case 'Admin':
        return (
          <>
            <NavLink to="/dashboard" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <LayoutDashboard size={20} />
              <span>Dashboard</span>
            </NavLink>
            <NavLink to="/users" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <Users size={20} />
              <span>Manage Users</span>
            </NavLink>
            <NavLink to="/reports" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <FileText size={20} />
              <span>Reports</span>
            </NavLink>
            <NavLink to="/analytics" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <BarChart3 size={20} />
              <span>Analytics</span>
            </NavLink>
          </>
        );

      case 'Clerk':
        return (
          <>
            <NavLink to="/dashboard" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <LayoutDashboard size={20} />
              <span>Dashboard</span>
            </NavLink>
            <NavLink to="/cases" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <Briefcase size={20} />
              <span>Manage Cases</span>
            </NavLink>
            <NavLink to="/hearings" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <Calendar size={20} />
              <span>Schedule Hearing</span>
            </NavLink>
            <NavLink to="/adjournments" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <Clock size={20} />
              <span>Adjournments</span>
            </NavLink>
          </>
        );

      case 'Judge':
        return (
          <>
            <NavLink to="/dashboard" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <LayoutDashboard size={20} />
              <span>Dashboard</span>
            </NavLink>
            <NavLink to="/cases" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <Briefcase size={20} />
              <span>Assigned Cases</span>
            </NavLink>
            <NavLink to="/hearings" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <Calendar size={20} />
              <span>Today's Hearings</span>
            </NavLink>
            <NavLink to="/calendar" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <Calendar size={20} />
              <span>Calendar</span>
            </NavLink>
          </>
        );

      case 'Lawyer':
        return (
          <>
            <NavLink to="/dashboard" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <LayoutDashboard size={20} />
              <span>Dashboard</span>
            </NavLink>
            <NavLink to="/cases" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <Briefcase size={20} />
              <span>My Cases</span>
            </NavLink>
            <NavLink to="/calendar" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <Calendar size={20} />
              <span>Calendar</span>
            </NavLink>
            <NavLink to="/availability" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <UserCheck size={20} />
              <span>Availability</span>
            </NavLink>
            <NavLink to="/adjournments" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <Clock size={20} />
              <span>Adjournments</span>
            </NavLink>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <Gavel size={26} className="text-light" />
        <span className="sidebar-logo-text">NyaayFlow Gov</span>
      </div>

      <nav className="sidebar-menu">
        {renderLinks()}
      </nav>

      <div className="sidebar-footer">
        <div>Logged in as:</div>
        <div style={{ color: 'white', fontWeight: 600, fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {user.email}
        </div>
        <div style={{ fontSize: '0.75rem' }}>v1.0.0 (MongoDB Atlas)</div>
      </div>
    </aside>
  );
};

export default Sidebar;
