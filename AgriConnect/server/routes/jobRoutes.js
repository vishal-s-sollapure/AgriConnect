const express = require('express');
const router = express.Router();
const {
  createJob,
  getMyJobs,
  getJobById,
  updateJob,
  updateJobStatus,
  deleteJob
} = require('../controllers/jobController');
const { protect, requireRole } = require('../middleware/authMiddleware');

// Router endpoints for Farmer Job Management
router.post('/', protect, requireRole('farmer'), createJob);
router.get('/my-jobs', protect, requireRole('farmer'), getMyJobs);
router.get('/:id', protect, getJobById);
router.put('/:id', protect, requireRole('farmer'), updateJob);
router.patch('/:id/status', protect, requireRole('farmer'), updateJobStatus);
router.delete('/:id', protect, requireRole('farmer'), deleteJob);

module.exports = router;
