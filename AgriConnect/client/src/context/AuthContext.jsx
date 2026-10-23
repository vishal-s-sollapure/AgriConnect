import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('agriconnect_user') || localStorage.getItem('agri_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState(() => localStorage.getItem('agriconnect_token') || localStorage.getItem('agri_token') || null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Synchronize localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('agriconnect_user', JSON.stringify(currentUser));
      localStorage.setItem('agri_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('agriconnect_user');
      localStorage.removeItem('agri_user');
    }
  }, [currentUser]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('agriconnect_token', token);
      localStorage.setItem('agri_token', token);
    } else {
      localStorage.removeItem('agriconnect_token');
      localStorage.removeItem('agri_token');
    }
  }, [token]);

  // Restore authenticated user on page reload
  const refreshUser = async () => {
    const storedToken = localStorage.getItem('agriconnect_token') || localStorage.getItem('agri_token');
    if (storedToken && !storedToken.startsWith('simulated_')) {
      try {
        const res = await authApi.getCurrentUser();
        if (res.success && res.user) {
          setCurrentUser(res.user);
        }
      } catch (err) {
        console.warn('Could not verify JWT token with backend server:', err.message);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    refreshUser();

    const handleLogoutSync = () => {
      setCurrentUser(null);
      setToken(null);
    };
    window.addEventListener('agriconnect_logout', handleLogoutSync);
    return () => window.removeEventListener('agriconnect_logout', handleLogoutSync);
  }, []);

  // Login always requires a valid account on the backend.
  const login = async (credentials) => {
    setAuthError(null);
    try {
      if (!credentials.email || !credentials.password) {
        throw new Error('Please provide both email and password.');
      }
      const res = await authApi.login({
        email: credentials.email,
        password: credentials.password
      });
      if (!res.success || !res.user || !res.token) {
        throw new Error(res.message || 'Login failed.');
      }

      setCurrentUser(res.user);
      setToken(res.token);
      return { success: true, user: res.user };
    } catch (err) {
      setAuthError(err.message || 'Login failed.');
      throw err;
    }
  };

  // Register action
  const register = async (userData) => {
    setAuthError(null);
    try {
      const res = await authApi.register(userData);
      if (res.success && res.user) {
        setCurrentUser(res.user);
        setToken(res.token);
        return { success: true, user: res.user };
      }
    } catch (err) {
      console.warn('Backend register error:', err.message);
      setAuthError(err.message || 'Registration failed.');
      throw err;
    }
  };

  // Profile update action
  const updateProfile = async (profileData) => {
    try {
      const res = await authApi.updateUserProfile(profileData);
      if (res.success && res.user) {
        setCurrentUser(res.user);
        return { success: true, user: res.user };
      }
    } catch (err) {
      console.warn('Backend profile update failed, applying local update:', err.message);
    }

    const updated = { ...currentUser, ...profileData };
    setCurrentUser(updated);
    return { success: true, user: updated };
  };

  // Logout action
  const logout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      // Ignore network errors on logout
    }
    setCurrentUser(null);
    setToken(null);
    localStorage.removeItem('agriconnect_user');
    localStorage.removeItem('agriconnect_token');
    localStorage.removeItem('agri_user');
    localStorage.removeItem('agri_token');
    window.dispatchEvent(new Event('agriconnect_logout'));
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      token,
      loading,
      authError,
      login,
      register,
      logout,
      refreshUser,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
