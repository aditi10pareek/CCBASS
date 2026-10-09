import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedUser = localStorage.getItem('nyaayflow_user');
      const token = localStorage.getItem('nyaayflow_token');
      
      if (storedUser && token) {
        try {
          setUser(JSON.parse(storedUser));
          // Fetch fresh profile from API to ensure validity
          const profile = await api.auth.getProfile();
          if (profile.success) {
            setUser(profile.data);
            localStorage.setItem('nyaayflow_user', JSON.stringify(profile.data));
          }
        } catch (error) {
          console.error('Session restoration failed:', error);
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.auth.login(email, password);
      if (res.success) {
        const { token, ...userData } = res.data;
        localStorage.setItem('nyaayflow_token', token);
        localStorage.setItem('nyaayflow_user', JSON.stringify(userData));
        setUser(userData);
        setLoading(false);
        return { success: true, user: userData };
      }
    } catch (error) {
      setLoading(false);
      return { success: false, message: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('nyaayflow_token');
    localStorage.removeItem('nyaayflow_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
