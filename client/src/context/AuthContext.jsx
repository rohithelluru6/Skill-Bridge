import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('skillbridge_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [profile, setProfile] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('skillbridge_token'));
  const [loading, setLoading] = useState(true);

  // Refresh user data from server on initial mount
  useEffect(() => {
    async function loadUser() {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const data = await api.getCurrentUser();
        setUser(data.user);
        setProfile(data.profile);
        localStorage.setItem('skillbridge_user', JSON.stringify(data.user));
      } catch (err) {
        console.warn('Session expired or invalid:', err.message);
        logout();
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, [token]);

  const login = async (email, password) => {
    const data = await api.login({ email, password });
    setToken(data.access_token);
    setUser(data.user);
    localStorage.setItem('skillbridge_token', data.access_token);
    localStorage.setItem('skillbridge_user', JSON.stringify(data.user));
    
    // Fetch profile immediately
    try {
      const meData = await api.getCurrentUser();
      setProfile(meData.profile);
    } catch (e) {
      // Ignored if non-fatal
    }
    return data;
  };

  const register = async (formData) => {
    const data = await api.register(formData);
    setToken(data.access_token);
    setUser(data.user);
    localStorage.setItem('skillbridge_token', data.access_token);
    localStorage.setItem('skillbridge_user', JSON.stringify(data.user));
    
    try {
      const meData = await api.getCurrentUser();
      setProfile(meData.profile);
    } catch (e) {}
    return data;
  };

  const logout = () => {
    setUser(null);
    setProfile(null);
    setToken(null);
    localStorage.removeItem('skillbridge_token');
    localStorage.removeItem('skillbridge_user');
  };

  const refreshProfile = async () => {
    if (!token) return;
    try {
      const data = await api.getProfile();
      setProfile(data.profile);
      return data;
    } catch (e) {
      console.error('Failed to refresh profile:', e);
    }
  };

  const value = {
    user,
    profile,
    token,
    isAuthenticated: !!token && !!user,
    isAdmin: user?.role === 'admin',
    loading,
    login,
    register,
    logout,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
