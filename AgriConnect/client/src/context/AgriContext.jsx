import React, { createContext, useContext, useState, useEffect } from 'react';

const AgriContext = createContext();

export function AgriProvider({ children }) {
  // Current user state (null if logged out)
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('agri_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Mock initial jobs list
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

  // Mock initial applications
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
      status: 'pending', // 'pending' | 'accepted' | 'rejected'
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

  // Save current user to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('agri_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('agri_user');
    }
  }, [currentUser]);

  // Login handler
  const login = (userData) => {
    const user = {
      id: 'user-' + Date.now(),
      name: userData.name || (userData.role === 'farmer' ? 'Ramesh Patel' : 'Manish Verma'),
      role: userData.role || 'farmer', // 'farmer' or 'worker'
      email: userData.email,
      location: userData.location || 'Gujarat',
      phone: userData.phone || '9876543210'
    };
    setCurrentUser(user);
    return user;
  };

  // Logout handler
  const logout = () => {
    setCurrentUser(null);
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
      workerSkills: 'Agricultural Field Work',
      workerExperience: '3+ Years',
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
      login,
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
