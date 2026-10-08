const User = require('../models/User');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
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
    const user = await User.findById(req.user.id);

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
