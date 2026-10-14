const express = require('express');
const router = express.Router();
const {
  getJobs,
  getNearbyJobs,
  geocodeLocationQuery,
  createJob,
  getMyJobs,
  getJobById,
  updateJob,
  updateJobStatus,
  deleteJob,
  applyForJob
} = require('../controllers/jobController');
const {
  getJobApplications,
  getJobHiringSummary
} = require('../controllers/applicationController');
const { protect, optionalProtect, requireRole } = require('../middleware/authMiddleware');

// Geocoding helper route (OpenStreetMap Nominatim proxy)
router.get('/geocode', geocodeLocationQuery);

// Dedicated Nearby Jobs Endpoint
router.get('/nearby', getNearbyJobs);

// Public Job Discovery
router.get('/', getJobs);

// Farmer Job Management Routes
router.post('/', protect, requireRole('farmer'), createJob);
router.get('/my-jobs', protect, requireRole('farmer'), getMyJobs);

// Farmer Job Applicant Review and Hiring Summary
router.get('/:id/applications', protect, requireRole('farmer'), getJobApplications);
router.get('/:id/hiring-summary', protect, requireRole('farmer'), getJobHiringSummary);

// Public / Authenticated Job Details
router.get('/:id', optionalProtect, getJobById);

// Worker Job Application Route
router.post('/:id/apply', protect, requireRole('worker'), applyForJob);

// Farmer Job Management Modification Routes
router.put('/:id', protect, requireRole('farmer'), updateJob);
router.patch('/:id/status', protect, requireRole('farmer'), updateJobStatus);
router.delete('/:id', protect, requireRole('farmer'), deleteJob);

module.exports = router;
