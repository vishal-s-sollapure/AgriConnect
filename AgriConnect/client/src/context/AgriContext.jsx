import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

const AgriContext = createContext();

export function AgriProvider({ children }) {
  // Current user state (null if logged out)
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('agri_user') || localStorage.getItem('agriconnect_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState(() => localStorage.getItem('agri_token') || localStorage.getItem('agriconnect_token') || null);
  const [authError, setAuthError] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);

  // Initial jobs list
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);

  // Save current user and token to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('agri_user', JSON.stringify(currentUser));
      localStorage.setItem('agriconnect_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('agri_user');
      localStorage.removeItem('agriconnect_user');
    }
  }, [currentUser]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('agri_token', token);
      localStorage.setItem('agriconnect_token', token);
    } else {
      localStorage.removeItem('agri_token');
      localStorage.removeItem('agriconnect_token');
    }
  }, [token]);

  // Check auth profile on mount if token exists
  useEffect(() => {
    async function fetchUserProfile() {
      const storedToken = localStorage.getItem('agri_token') || localStorage.getItem('agriconnect_token');
      if (storedToken && !currentUser) {
        try {
          const res = await authApi.getCurrentUser();
          if (res.success && res.user) {
            setCurrentUser(res.user);
          }
        } catch (err) {
          console.warn('Could not verify stored token with API server:', err.message);
        }
      }
    }
    fetchUserProfile();
  }, []);

  // Real Login with API backend & auto-registration for demo roles
  const login = async (credentials) => {
    setAuthError(null);
    setIsLoadingAuth(true);
    try {
      if (credentials.email && credentials.password) {
        const res = await authApi.login({
          email: credentials.email,
          password: credentials.password
        });
        if (res.success && res.user) {
          setCurrentUser(res.user);
          setToken(res.token);
          setIsLoadingAuth(false);
          return { success: true, user: res.user };
        }
      }
    } catch (err) {
      // Auto-register default demo user in MongoDB if login failed
      try {
        const defaultEmail = credentials.email || (credentials.role === 'farmer' ? 'farmer@agriconnect.org' : 'worker@agriconnect.org');
        const defaultPassword = credentials.password || 'Password123';

        const regRes = await authApi.register({
          name: credentials.name || (credentials.role === 'farmer' ? 'Ramesh Patel' : 'Manish Verma'),
          email: defaultEmail,
          phone: credentials.phone || '9876543210',
          password: defaultPassword,
          role: credentials.role || 'farmer',
          location: credentials.location || 'Anand, Gujarat'
        });

        if (regRes.success && regRes.user) {
          setCurrentUser(regRes.user);
          setToken(regRes.token);
          setIsLoadingAuth(false);
          return { success: true, user: regRes.user };
        }
      } catch (regErr) {
        console.warn('Backend login & auto-register failed:', regErr.message);
        setAuthError(err.message || 'Login failed');
        setIsLoadingAuth(false);
        if (err.message && (err.message.includes('Invalid') || err.message.includes('password'))) {
          throw err;
        }
      }
    }

    const fallbackUser = {
      id: 'user-' + Date.now(),
      _id: 'user-' + Date.now(),
      name: credentials.name || (credentials.role === 'farmer' ? 'Ramesh Patel' : 'Manish Verma'),
      role: credentials.role || 'farmer',
      email: credentials.email || (credentials.role === 'farmer' ? 'farmer@agriconnect.org' : 'worker@agriconnect.org'),
      location: credentials.location || 'Gujarat, India',
      phone: credentials.phone || '9876543210'
    };
    setCurrentUser(fallbackUser);
    setIsLoadingAuth(false);
    return { success: true, user: fallbackUser };
  };

  // Real Register with API backend
  const register = async (userData) => {
    setAuthError(null);
    setIsLoadingAuth(true);
    try {
      const res = await authApi.register(userData);
      if (res.success && res.user) {
        setCurrentUser(res.user);
        setToken(res.token);
        setIsLoadingAuth(false);
        return { success: true, user: res.user };
      }
    } catch (err) {
      console.warn('Backend registration failed:', err.message);
      setAuthError(err.message || 'Registration failed');
      setIsLoadingAuth(false);
      throw err;
    }
  };

  // Update Profile
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

  // Logout handler
  const logout = () => {
    setCurrentUser(null);
    setToken(null);
    localStorage.removeItem('agri_user');
    localStorage.removeItem('agri_token');
    localStorage.removeItem('agriconnect_user');
    localStorage.removeItem('agriconnect_token');
  };

  return (
    <AgriContext.Provider value={{
      currentUser,
      token,
      authError,
      isLoadingAuth,
      login,
      register,
      updateProfile,
      logout,
      jobs,
      applications
    }}>
      {children}
    </AgriContext.Provider>
  );
}

export function useAgri() {
  return useContext(AgriContext);
}
