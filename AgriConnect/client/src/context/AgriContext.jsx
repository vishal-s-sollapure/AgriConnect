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
    } finally {
      setIsLoadingAuth(false);
    }
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
