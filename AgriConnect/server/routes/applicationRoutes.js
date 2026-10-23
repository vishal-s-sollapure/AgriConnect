const express = require('express');
const router = express.Router();
const {
  getMyApplications,
  withdrawApplication,
  updateApplicationStatus
} = require('../controllers/applicationController');
const { protect, requireRole } = require('../middleware/authMiddleware');

// Worker application routes
router.get('/my-applications', protect, requireRole('worker'), getMyApplications);
router.patch('/:id/withdraw', protect, requireRole('worker'), withdrawApplication);

// Farmer hiring decision route
router.patch('/:id/status', protect, requireRole('farmer'), updateApplicationStatus);

module.exports = router;
