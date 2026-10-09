import React, { useState, useEffect } from 'react';
import { Users, UserPlus, ShieldAlert, CheckCircle, XCircle } from 'lucide-react';
import api from '../services/api';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Register Form State
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Clerk',
    phone: ''
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.auth.getUsers();
      if (res.success) {
        setUsers(res.data);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to retrieve user accounts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    
    try {
      const res = await api.auth.register(form);
      if (res.success) {
        setSuccess(`User ${res.data.name} (${res.data.role}) registered successfully.`);
        setForm({ name: '', email: '', password: '', role: 'Clerk', phone: '' });
        fetchUsers();
      }
    } catch (err) {
      setError(err.message || 'Registration failed.');
    }
  };

  const handleStatusToggle = async (userId, currentStatus) => {
    setSuccess('');
    setError('');
    const nextStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    
    try {
      const res = await api.auth.updateUserStatus(userId, nextStatus);
      if (res.success) {
        setSuccess(`Account status updated to ${nextStatus}.`);
        fetchUsers();
      }
    } catch (err) {
      setError(err.message || 'Failed to update account status.');
    }
  };

  if (loading) return <div className="loader" />;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem' }} className="grid-2">
      {/* Users List Panel */}
      <div className="dashboard-panel">
        <div className="panel-header">
          <h3 className="panel-title">Court Staff & System Users</h3>
        </div>
        
        {success && (
          <div style={{ padding: '0.75rem', backgroundColor: 'var(--success-light)', color: 'var(--success)', border: '1px solid var(--success)', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.9rem', fontWeight: 600 }}>
            {success}
          </div>
        )}
        {error && (
          <div style={{ padding: '0.75rem', backgroundColor: 'var(--danger-light)', color: 'var(--danger)', border: '1px solid var(--danger)', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.9rem', fontWeight: 600 }}>
            {error}
          </div>
        )}

        <div className="table-container" style={{ marginTop: '1rem' }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Contact</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id}>
                  <td style={{ fontWeight: 600 }}>{u.name}</td>
                  <td>{u.email}</td>
                  <td>
                    <span className="user-badge" style={{ fontSize: '0.75rem' }}>{u.role}</span>
                  </td>
                  <td>{u.phone || 'N/A'}</td>
                  <td>
                    <span className={`badge ${u.status === 'Active' ? 'badge-success' : 'badge-danger'}`}>
                      {u.status}
                    </span>
                  </td>
                  <td>
                    {u.role !== 'Admin' ? (
                      <button 
                        className={`btn ${u.status === 'Active' ? 'btn-danger' : 'btn-primary'} btn-sm`}
                        onClick={() => handleStatusToggle(u._id, u.status)}
                      >
                        {u.status === 'Active' ? 'Deactivate' : 'Activate'}
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>System Owner</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Register User Panel */}
      <div className="dashboard-panel" style={{ height: 'fit-content' }}>
        <div className="panel-header">
          <h3 className="panel-title">Add Court Personnel</h3>
        </div>
        <form onSubmit={handleRegister} style={{ marginTop: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. Advocate Abhishek Manu Singhvi"
              value={form.name}
              onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address (Government/Official Domain)</label>
            <input 
              type="email" 
              className="form-input" 
              placeholder="e.g. abhishek@nyaayflow.gov"
              value={form.email}
              onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Secure Access Password</label>
            <input 
              type="password" 
              className="form-input" 
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm(prev => ({ ...prev, password: e.target.value }))}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Contact Number (Phone)</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="+91 (999) 000-1111"
              value={form.phone}
              onChange={(e) => setForm(prev => ({ ...prev, phone: e.target.value }))}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Staff Role Assignment</label>
            <select 
              className="form-select"
              value={form.role}
              onChange={(e) => setForm(prev => ({ ...prev, role: e.target.value }))}
            >
              <option value="Clerk">Court Clerk (Filing & Schedules)</option>
              <option value="Judge">Hon'ble Judge (Benches & Remarks)</option>
              <option value="Lawyer">Panelist Advocate (Representation)</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
            <UserPlus size={16} /> Finalize Registration
          </button>
        </form>
      </div>
    </div>
  );
};

export default UsersPage;
