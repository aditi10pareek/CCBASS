import React from 'react';
import { useAuth } from '../context/AuthContext';
import AdminDashboard from './AdminDashboard';
import ClerkDashboard from './ClerkDashboard';
import JudgeDashboard from './JudgeDashboard';
import LawyerDashboard from './LawyerDashboard';

const DashboardWrapper = () => {
  const { user } = useAuth();

  if (!user) return null;

  switch (user.role) {
    case 'Admin':
      return <AdminDashboard />;
    case 'Clerk':
      return <ClerkDashboard />;
    case 'Judge':
      return <JudgeDashboard />;
    case 'Lawyer':
      return <LawyerDashboard />;
    default:
      return (
        <div style={{ padding: '3rem', textAlign: 'center' }}>
          <h3>Invalid account role detected.</h3>
          <p>Please contact System Administrator.</p>
        </div>
      );
  }
};

export default DashboardWrapper;
