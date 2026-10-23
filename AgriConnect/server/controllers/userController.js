const mongoose = require('mongoose');
const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const { memoryUsers } = require('./authController');

const isDbConnected = () => mongoose.connection && mongoose.connection.readyState === 1;

// Helper to find memory user by ID
const findMemoryUserById = (userId) => {
  if (!memoryUsers) return null;
  for (const u of memoryUsers.values()) {
    if (String(u._id) === String(userId) || String(u.id) === String(userId)) {
      return u;
    }
  }
  return null;
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
exports.getUserProfile = async (req, res) => {
  try {
    let user = null;

    if (isDbConnected()) {
      try {
        user = await User.findById(req.user.id);
      } catch (dbErr) {
        console.warn('[User] DB lookup failed, checking in-memory store:', dbErr.message);
      }
    }

    if (!user) {
      user = findMemoryUserById(req.user.id);
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found'
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        location: user.location,
        profileImage: user.profileImage,
        skills: user.skills,
        experience: user.experience,
        availability: user.availability,
        preferredRadius: user.preferredRadius,
        farmName: user.farmName,
        farmType: user.farmType,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('getUserProfile Controller Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching user profile.'
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateUserProfile = async (req, res) => {
  try {
    let user = null;

    if (isDbConnected()) {
      try {
        user = await User.findById(req.user.id);
      } catch (dbErr) {
        console.warn('[User] DB lookup failed for update:', dbErr.message);
      }
    }

    if (!user) {
      user = findMemoryUserById(req.user.id);
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found'
      });
    }

    // Update allowable fields (role is strictly protected and immutable via profile update)
    if (req.body.name) user.name = req.body.name.trim();
    if (req.body.phone) user.phone = req.body.phone.trim();
    if (req.body.location) user.location = req.body.location.trim();
    if (req.body.profileImage !== undefined) user.profileImage = req.body.profileImage;

    // Role-specific field updates
    if (user.role === 'worker') {
      if (req.body.skills !== undefined) user.skills = req.body.skills;
      if (req.body.experience !== undefined) user.experience = req.body.experience;
      if (req.body.availability !== undefined) user.availability = req.body.availability;
      if (req.body.preferredRadius !== undefined) user.preferredRadius = req.body.preferredRadius;
    } else if (user.role === 'farmer') {
      if (req.body.farmName !== undefined) user.farmName = req.body.farmName;
      if (req.body.farmType !== undefined) user.farmType = req.body.farmType;
    }

    // Password update if provided
    if (req.body.password && req.body.password.length >= 6) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedUser._id,
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        location: updatedUser.location,
        profileImage: updatedUser.profileImage,
        skills: updatedUser.skills,
        experience: updatedUser.experience,
        availability: updatedUser.availability,
        preferredRadius: updatedUser.preferredRadius,
        farmName: updatedUser.farmName,
        farmType: updatedUser.farmType,
        updatedAt: updatedUser.updatedAt
      }
    });
  } catch (error) {
    console.error('updateUserProfile Controller Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error updating user profile.'
    });
  }
};

/**
 * @desc    Get safe worker profile for hiring review by authorized farmer
 * @route   GET /api/users/workers/:id
 * @access  Private (Farmer only)
 */
exports.getWorkerProfileForFarmer = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid worker ID format'
      });
    }

    const worker = await User.findById(id);
    if (!worker || worker.role !== 'worker') {
      return res.status(404).json({
        success: false,
        message: 'Worker not found'
      });
    }

    // Authorization: Verify that this worker has applied to at least one job owned by this farmer
    const farmerJobIds = await Job.find({ farmer: req.user._id }).distinct('_id');

    const applications = await Application.find({
      worker: worker._id,
      job: { $in: farmerJobIds }
    }).populate('job', 'title crop status workersRequired');

    if (applications.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You are not authorized to view this worker profile as they have not applied to any of your jobs'
      });
    }

    // Check if any application by this worker has been accepted by this farmer
    const hasAcceptedApplication = applications.some(app => app.status === 'accepted');

    // Safe worker profile projection
    const safeWorker = {
      _id: worker._id,
      id: worker._id,
      name: worker.name,
      profileImage: worker.profileImage || '',
      location: worker.location || '',
      skills: worker.skills || 'General Agriculture',
      experience: worker.experience || '1-3 Years',
      availability: worker.availability || 'Full Time',
      preferredRadius: worker.preferredRadius || '10 km',
      createdAt: worker.createdAt,
      // Contact phone is revealed only after at least one application has been accepted
      phone: hasAcceptedApplication ? worker.phone : null,
      contactRevealed: hasAcceptedApplication,
      applications: applications.map(app => ({
        _id: app._id,
        jobId: app.job ? app.job._id : null,
        jobTitle: app.job ? app.job.title : 'Job',
        crop: app.job ? app.job.crop : '',
        status: app.status,
        message: app.message || '',
        appliedAt: app.createdAt
      }))
    };

    return res.status(200).json({
      success: true,
      worker: safeWorker
    });
  } catch (error) {
    console.error('getWorkerProfileForFarmer Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while retrieving worker profile'
    });
  }
};
