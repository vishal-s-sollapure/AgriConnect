import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Create Axios Instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to attach Authorization Bearer token automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('agriconnect_token') || localStorage.getItem('agri_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to format error responses consistently
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const formattedError = {
      status: error.response?.status || 500,
      message: error.response?.data?.message || error.message || 'An error occurred while connecting to the server',
      errors: error.response?.data?.errors || [],
      data: error.response?.data || null
    };
    return Promise.reject(formattedError);
  }
);

/**
 * Job API Service methods for Farmer Job Management
 */
export const jobService = {
  /**
   * Create a new job post
   */
  createJob: async (jobData) => {
    const res = await api.post('/jobs', jobData);
    return res.data;
  },

  /**
   * Fetch jobs posted by the authenticated farmer
   */
  getMyJobs: async (params = {}) => {
    const res = await api.get('/jobs/my-jobs', { params });
    return res.data;
  },

  /**
   * Fetch details of a specific job by ID
   */
  getJobById: async (id) => {
    const res = await api.get(`/jobs/${id}`);
    return res.data;
  },

  /**
   * Update an existing job details
   */
  updateJob: async (id, jobData) => {
    const res = await api.put(`/jobs/${id}`, jobData);
    return res.data;
  },

  /**
   * Change job status (open, closed, completed)
   */
  updateJobStatus: async (id, status) => {
    const res = await api.patch(`/jobs/${id}/status`, { status });
    return res.data;
  },

  /**
   * Delete a job post
   */
  deleteJob: async (id) => {
    const res = await api.delete(`/jobs/${id}`);
    return res.data;
  }
};

export default jobService;
