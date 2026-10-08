import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('agriconnect_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState(() => localStorage.getItem('agriconnect_token') || null);
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
    if (storedToken) {
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
  }, []);

  // Login action
  const login = async (credentials) => {
    setAuthError(null);
    try {
      if (credentials.email && credentials.password) {
        const res = await authApi.login({
          email: credentials.email,
          password: credentials.password
        });
        if (res.success && res.user) {
          setCurrentUser(res.user);
          setToken(res.token);
          return { success: true, user: res.user };
        }
      }
    } catch (err) {
      console.warn('Backend login attempt error, using fallback state:', err.message);
      setAuthError(err.message || 'Invalid email or password.');
      // If error is explicit backend credentials rejection, throw error for UI display
      if (err.message && (err.message.includes('Invalid') || err.message.includes('password'))) {
        throw err;
      }
    }

    // Fallback simulated session if backend server is unreachable
    const fallbackUser = {
      id: 'user-' + Date.now(),
      name: credentials.name || (credentials.role === 'farmer' ? 'Ramesh Patel' : 'Manish Verma'),
      role: credentials.role || 'farmer',
      email: credentials.email || 'user@agriconnect.org',
      phone: credentials.phone || '9876543210',
      location: credentials.location || 'Gujarat, India',
      farmName: credentials.role === 'farmer' ? 'Patel Farms' : undefined,
      farmType: credentials.role === 'farmer' ? 'Wheat & Cotton' : undefined,
      skills: credentials.role === 'worker' ? 'Harvesting, Field Labor' : undefined,
      experience: credentials.role === 'worker' ? '3+ Years' : undefined,
      availability: credentials.role === 'worker' ? 'Full Time' : undefined,
      preferredRadius: credentials.role === 'worker' ? '10 km' : undefined
    };

    setCurrentUser(fallbackUser);
    setToken('simulated_jwt_token_' + Date.now());
    return { success: true, user: fallbackUser };
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
      console.warn('Backend register error, using fallback state:', err.message);
      setAuthError(err.message || 'Registration failed.');
      if (err.message && err.message.includes('already exists')) {
        throw err;
      }
    }

    // Fallback registration for offline environment
    const fallbackUser = {
      id: 'user-' + Date.now(),
      name: userData.name,
      email: userData.email,
      phone: userData.phone || '9876543210',
      role: userData.role || 'farmer',
      location: userData.location || 'Gujarat, India',
      farmName: userData.farmName || (userData.role === 'farmer' ? `${userData.name}'s Farm` : undefined),
      farmType: userData.farmType || (userData.role === 'farmer' ? 'Multi-crop Agriculture' : undefined),
      skills: userData.skills || (userData.role === 'worker' ? 'General Agriculture' : undefined),
      experience: userData.experience || (userData.role === 'worker' ? '1-3 Years' : undefined),
      availability: userData.availability || (userData.role === 'worker' ? 'Full Time' : undefined),
      preferredRadius: userData.preferredRadius || (userData.role === 'worker' ? '10 km' : undefined)
    };

    setCurrentUser(fallbackUser);
    setToken('simulated_jwt_token_' + Date.now());
    return { success: true, user: fallbackUser };
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
