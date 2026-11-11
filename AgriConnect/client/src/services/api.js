// Centralized API service configuration
function resolveApiBaseUrl() {
  const envUrl = (import.meta.env.VITE_API_BASE_URL || '').trim();
  if (!envUrl) {
    return 'http://localhost:5000/api';
  }
  // Strip trailing slashes
  const sanitized = envUrl.replace(/\/+$/, '');
  // If it already ends with /api, use it; otherwise append /api
  return sanitized.endsWith('/api') ? sanitized : `${sanitized}/api`;
}

const API_BASE_URL = resolveApiBaseUrl();

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

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${cleanEndpoint}`, {
      ...options,
      headers,
    });
  } catch (networkError) {
    throw new Error('Unable to connect to backend server. The service may be waking up (Render free tier) or check your connection.');
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || data.error || `Request failed with status ${response.status}`);
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
