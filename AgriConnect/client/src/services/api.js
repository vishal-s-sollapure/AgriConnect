// Centralized API service configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Reusable fetch wrapper with automatic JWT Authorization header attachment
 */
export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('agriconnect_token') || localStorage.getItem('agri_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || data.error || 'API request failed');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

// Authentication & User API Service Functions
export const authApi = {
  // Register new Farmer or Worker account
  register: (userData) => apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData)
  }),

  // Login user with credentials
  login: (credentials) => apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  }),

  // Get current authenticated user profile
  getCurrentUser: () => apiRequest('/auth/me', {
    method: 'GET'
  }),

  // Logout user
  logout: () => apiRequest('/auth/logout', {
    method: 'POST'
  }),

  // Get user profile
  getUserProfile: () => apiRequest('/users/profile', {
    method: 'GET'
  }),

  // Update user profile
  updateUserProfile: (profileData) => apiRequest('/users/profile', {
    method: 'PUT',
    body: JSON.stringify(profileData)
  })
};

export default apiRequest;
