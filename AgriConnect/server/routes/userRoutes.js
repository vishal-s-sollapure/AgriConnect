const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  updateUserProfile,
  getWorkerProfileForFarmer
} = require('../controllers/userController');
const { protect, requireRole } = require('../middleware/authMiddleware');

router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);

// Farmer viewing worker profile for hiring review
router.get('/workers/:id', protect, requireRole('farmer'), getWorkerProfileForFarmer);

module.exports = router;
