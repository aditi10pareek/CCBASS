import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import DashboardWrapper from './pages/DashboardWrapper';
import Cases from './pages/Cases';
import Hearings from './pages/Hearings';
import Adjournments from './pages/Adjournments';
import Calendar from './pages/Calendar';
import Availability from './pages/Availability';
import Users from './pages/Users';
import Reports from './pages/Reports';
import Analytics from './pages/Analytics';
import CaseDetails from './pages/CaseDetails';

// Protected Route Wrapper
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loader" />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Navbar />
        {children}
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/public-case/:id" element={<CaseDetails />} />

          {/* Protected General routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardWrapper />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/cases" 
            element={
              <ProtectedRoute allowedRoles={['Clerk', 'Judge', 'Lawyer']}>
                <Cases />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/hearings" 
            element={
              <ProtectedRoute allowedRoles={['Clerk', 'Judge']}>
                <Hearings />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/adjournments" 
            element={
              <ProtectedRoute allowedRoles={['Clerk', 'Lawyer', 'Admin']}>
                <Adjournments />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/calendar" 
            element={
              <ProtectedRoute allowedRoles={['Judge', 'Lawyer']}>
                <Calendar />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/availability" 
            element={
              <ProtectedRoute allowedRoles={['Lawyer']}>
                <Availability />
              </ProtectedRoute>
            } 
          />

          {/* Protected Admin/Clerk specific routes */}
          <Route 
            path="/users" 
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <Users />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/reports" 
            element={
              <ProtectedRoute allowedRoles={['Admin', 'Clerk']}>
                <Reports />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/analytics" 
            element={
              <ProtectedRoute allowedRoles={['Admin', 'Clerk']}>
                <Analytics />
              </ProtectedRoute>
            } 
          />

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
