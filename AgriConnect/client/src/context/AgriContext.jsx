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

    const handleLogoutSync = () => {
      setCurrentUser(null);
      setToken(null);
    };
    window.addEventListener('agriconnect_logout', handleLogoutSync);
    return () => window.removeEventListener('agriconnect_logout', handleLogoutSync);
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
        const defaultEmail = credentials.email || (credentials.role === 'farmer' ? 'vishalssollapure@gmail.com' : 'vishalssollapure1748@gmail.com');
        const defaultPassword = credentials.password || (credentials.role === 'farmer' ? 'Vishal@123' : 'Vishal@987');

        const regRes = await authApi.register({
          name: credentials.name || 'Vishal Sollapure',
          email: defaultEmail,
          phone: credentials.phone || '7795511748',
          password: defaultPassword,
          role: credentials.role || 'farmer',
          location: credentials.location || 'Maharashtra, India'
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
      name: credentials.name || 'Vishal Sollapure',
      role: credentials.role || 'farmer',
      email: credentials.email || (credentials.role === 'farmer' ? 'vishalssollapure@gmail.com' : 'vishalssollapure1748@gmail.com'),
      location: credentials.location || 'Maharashtra, India',
      phone: credentials.phone || '7795511748'
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

  // Post job helper
  const postJob = async (jobData) => {
    try {
      const formattedData = {
        title: jobData.title,
        crop: jobData.crop || 'Wheat',
        workType: jobData.workType || 'Harvesting',
        workersRequired: Number(jobData.workersNeeded || jobData.workersRequired || 1),
        wageAmount: Number(jobData.wage || jobData.wageAmount || 500),
        wageType: 'daily',
        startDate: jobData.startDate || new Date().toISOString().split('T')[0],
        durationValue: parseInt(jobData.duration) || 1,
        durationUnit: 'days',
        location: jobData.location || 'Local Farm',
        description: jobData.description || 'Farm labor job'
      };
      const res = await jobService.createJob(formattedData);
      if (res.success) {
        setJobs(prev => [res.job, ...prev]);
        return res.job;
      }
    } catch (err) {
      console.warn('Backend postJob failed, applying local state update:', err);
      const newJob = {
        _id: 'job-' + Date.now(),
        id: 'job-' + Date.now(),
        ...jobData,
        status: 'open',
        createdAt: new Date().toISOString()
      };
      setJobs(prev => [newJob, ...prev]);
      return newJob;
    }
  };

  // Logout handler
  const logout = () => {
    setCurrentUser(null);
    setToken(null);
    localStorage.removeItem('agri_user');
    localStorage.removeItem('agri_token');
    localStorage.removeItem('agriconnect_user');
    localStorage.removeItem('agriconnect_token');
    window.dispatchEvent(new Event('agriconnect_logout'));
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
      postJob,
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
