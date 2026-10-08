import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

const AgriContext = createContext();

export function AgriProvider({ children }) {
  // Current user state (null if logged out)
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('agri_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState(() => localStorage.getItem('agri_token') || null);
  const [authError, setAuthError] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);

  // Initial jobs list
  const [jobs, setJobs] = useState([
    {
      id: 'job-1',
      title: 'Wheat Harvesting & Bundling',
      farmerName: 'Ramesh Patel',
      farmerPhone: '9876543210',
      location: 'Anand, Gujarat',
      distance: '2.5 km away',
      crop: 'Wheat',
      wage: 650,
      workersNeeded: 5,
      workersHired: 2,
      duration: '3 Days',
      startDate: '2026-10-10',
      description: 'Looking for experienced workers for wheat field harvesting and bundling. Food and tea provided twice a day.',
      status: 'active',
      createdAt: '2026-10-06'
    },
    {
      id: 'job-2',
      title: 'Cotton Picking & Sorting',
      farmerName: 'Suresh Kumar',
      farmerPhone: '9812345678',
      location: 'Rajkot, Gujarat',
      distance: '4.0 km away',
      crop: 'Cotton',
      wage: 600,
      workersNeeded: 8,
      workersHired: 4,
      duration: '5 Days',
      startDate: '2026-10-12',
      description: 'Urgent need for cotton pickers. Daily payment cash on field. Flexible working hours.',
      status: 'active',
      createdAt: '2026-10-07'
    },
    {
      id: 'job-3',
      title: 'Paddy Field Preparation & Irrigation',
      farmerName: 'Vikram Singh',
      farmerPhone: '9765432109',
      location: 'Kheda, Gujarat',
      distance: '1.8 km away',
      crop: 'Paddy / Rice',
      wage: 700,
      workersNeeded: 4,
      workersHired: 1,
      duration: '2 Days',
      startDate: '2026-10-09',
      description: 'Tractor operation assistance and channel irrigation setup.',
      status: 'active',
      createdAt: '2026-10-05'
    }
  ]);

  // Initial applications
  const [applications, setApplications] = useState([
    {
      id: 'app-1',
      jobId: 'job-1',
      jobTitle: 'Wheat Harvesting & Bundling',
      workerName: 'Manish Verma',
      workerPhone: '9988776655',
      workerSkills: 'Harvesting, Tractor Handling',
      workerExperience: '6 Years',
      location: 'Anand Village',
      status: 'pending',
      appliedAt: '2026-10-07'
    },
    {
      id: 'app-2',
      jobId: 'job-2',
      jobTitle: 'Cotton Picking & Sorting',
      workerName: 'Sunita Devi',
      workerPhone: '9123456789',
      workerSkills: 'Cotton Picking, Sorting',
      workerExperience: '4 Years',
      location: 'Rajkot North',
      status: 'accepted',
      appliedAt: '2026-10-06'
    }
  ]);

  // Save current user and token to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('agri_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('agri_user');
    }
  }, [currentUser]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('agri_token', token);
    } else {
      localStorage.removeItem('agri_token');
    }
  }, [token]);

  // Check auth profile on mount if token exists
  useEffect(() => {
    async function fetchUserProfile() {
      if (token && !currentUser) {
        try {
          const res = await authApi.getProfile();
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

  // Real Login with API backend & offline fallback
  const login = async (credentials) => {
    setAuthError(null);
    setIsLoadingAuth(true);
    try {
      // Attempt API call if email and password provided
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
      console.warn('Backend login failed, falling back to simulated session:', err.message);
      setAuthError(err.message || 'Login failed');
    }

    // Fallback simulated session for frontend preview
    const fallbackUser = {
      id: 'user-' + Date.now(),
      name: credentials.name || (credentials.role === 'farmer' ? 'Ramesh Patel' : 'Manish Verma'),
      role: credentials.role || 'farmer',
      email: credentials.email || (credentials.role === 'farmer' ? 'farmer@agriconnect.org' : 'worker@agriconnect.org'),
      location: credentials.location || 'Gujarat, India',
      phone: credentials.phone || '9876543210',
      skills: credentials.role === 'worker' ? 'Harvesting, Field Work' : undefined,
      experience: credentials.role === 'worker' ? '4 Years' : undefined,
      farmDetails: credentials.role === 'farmer' ? '20 Acres Multi-crop Farm' : undefined
    };
    setCurrentUser(fallbackUser);
    setToken('simulated_jwt_token_' + Date.now());
    setIsLoadingAuth(false);
    return { success: true, user: fallbackUser };
  };

  // Real Register with API backend & offline fallback
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
      console.warn('Backend registration failed, falling back to simulated user session:', err.message);
      setAuthError(err.message || 'Registration failed');
      // If error is duplicate email or explicit API error, re-throw for UI error display
      if (err.message && err.message.includes('already exists')) {
        setIsLoadingAuth(false);
        throw err;
      }
    }

    // Fallback registration
    const fallbackUser = {
      id: 'user-' + Date.now(),
      name: userData.name,
      email: userData.email,
      phone: userData.phone || '9876543210',
      role: userData.role || 'farmer',
      location: userData.location || 'Gujarat, India',
      skills: userData.skills || (userData.role === 'worker' ? 'General Farm Work' : undefined),
      experience: userData.experience || (userData.role === 'worker' ? '2 Years' : undefined),
      farmDetails: userData.farmDetails || (userData.role === 'farmer' ? 'Local Farm' : undefined),
      bio: userData.bio || 'New AgriConnect Member'
    };
    setCurrentUser(fallbackUser);
    setToken('simulated_jwt_token_' + Date.now());
    setIsLoadingAuth(false);
    return { success: true, user: fallbackUser };
  };

  // Update Profile
  const updateProfile = async (profileData) => {
    try {
      const res = await authApi.updateProfile(profileData);
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
  };

  // Farmer: Post a new Job
  const postJob = (newJobData) => {
    const job = {
      id: 'job-' + Date.now(),
      farmerName: currentUser ? currentUser.name : 'Farmer',
      farmerPhone: currentUser ? currentUser.phone : '9876543210',
      location: newJobData.location || (currentUser ? currentUser.location : 'Nearby Farm'),
      distance: '1.0 km away',
      workersHired: 0,
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
      ...newJobData
    };
    setJobs(prev => [job, ...prev]);
    return job;
  };

  // Worker: Apply for a Job
  const applyForJob = (jobId) => {
    const targetJob = jobs.find(j => j.id === jobId);
    if (!targetJob) return;

    // Check if already applied
    const existing = applications.find(a => a.jobId === jobId && a.workerName === (currentUser?.name || 'Manish Verma'));
    if (existing) return existing;

    const newApp = {
      id: 'app-' + Date.now(),
      jobId: targetJob.id,
      jobTitle: targetJob.title,
      workerName: currentUser ? currentUser.name : 'Manish Verma',
      workerPhone: currentUser ? currentUser.phone : '9988776655',
      workerSkills: currentUser?.skills || 'Agricultural Field Work',
      workerExperience: currentUser?.experience || '3+ Years',
      location: currentUser ? currentUser.location : 'Nearby',
      status: 'pending',
      appliedAt: new Date().toISOString().split('T')[0]
    };

    setApplications(prev => [newApp, ...prev]);
    return newApp;
  };

  // Farmer: Accept/Reject Application
  const updateApplicationStatus = (appId, newStatus) => {
    setApplications(prev => prev.map(app => {
      if (app.id === appId) {
        return { ...app, status: newStatus };
      }
      return app;
    }));
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
      postJob,
      applications,
      applyForJob,
      updateApplicationStatus
    }}>
      {children}
    </AgriContext.Provider>
  );
}

export function useAgri() {
  return useContext(AgriContext);
}
