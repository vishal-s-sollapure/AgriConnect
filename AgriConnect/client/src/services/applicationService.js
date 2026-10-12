import { api } from './jobService';

/**
 * Worker Applications API Service
 */
export const applicationService = {
  /**
   * Fetch applications submitted by the current authenticated worker
   */
  getMyApplications: async (params = {}) => {
    const res = await api.get('/applications/my-applications', { params });
    return res.data;
  },

  /**
   * Apply for an open job
   */
  applyForJob: async (jobId, data = {}) => {
    const res = await api.post(`/jobs/${jobId}/apply`, data);
    return res.data;
  },

  /**
   * Withdraw a pending job application
   */
  withdrawApplication: async (applicationId) => {
    const res = await api.patch(`/applications/${applicationId}/withdraw`);
    return res.data;
  },

  /**
   * Farmer: Accept or reject an application
   */
  updateApplicationStatus: async (applicationId, status) => {
    const res = await api.patch(`/applications/${applicationId}/status`, { status });
    return res.data;
  },

  /**
   * Farmer: Fetch safe worker profile for hiring evaluation
   */
  getWorkerProfile: async (workerId) => {
    const res = await api.get(`/users/workers/${workerId}`);
    return res.data;
  }
};

export default applicationService;
