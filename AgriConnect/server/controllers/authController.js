const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../models/User');
const getJwtSecret = require('../utils/getJwtSecret');

const memoryUsers = new Map();

const isDbConnected = () => mongoose.connection && mongoose.connection.readyState === 1;

exports.memoryUsers = memoryUsers;

const generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, userId, role },
    getJwtSecret(),
    { expiresIn: '30d' }
  );
};

const requireDatabase = (res) => {
  if (process.env.NODE_ENV === 'production' && !isDbConnected()) {
    res.status(503).json({
      success: false,
      message: 'Authentication is temporarily unavailable.'
    });
    return false;
  }

  return true;
};

// Email validation helper regex
const isValidEmail = (email) => {
  return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email);
};

function sanitizeUser(user) {
  return {
    id: user._id,
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    location: user.location,
    profileImage: user.profileImage,
    ...(user.role === 'worker' ? {
      skills: user.skills,
      experience: user.experience,
      availability: user.availability,
      preferredRadius: user.preferredRadius
    } : {
      farmName: user.farmName,
      farmType: user.farmType
    }),
    createdAt: user.createdAt
  };
}

// @desc    Register a new user (Farmer or Worker)
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = async (req, res) => {
  try {
    if (!requireDatabase(res)) return;

    const {
      name,
      email,
      phone,
      password,
      role,
      location,
      skills,
      experience,
      availability,
      preferredRadius,
      farmName,
      farmType,
      profileImage
    } = req.body;

    // Required fields check
    if (!name || !email || !password || !phone || !role || !location) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all required fields: name, email, phone, password, role, and location.'
      });
    }

    // Role validation
    if (!['farmer', 'worker'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role specified. Role must be either "farmer" or "worker".'
      });
    }

    // Email format validation
    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.'
      });
    }

    // Password length validation
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Build user record based on role
    const userData = {
      name: name.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      password,
      role,
      location: location.trim(),
      profileImage: profileImage || ''
    };

    if (role === 'worker') {
      userData.skills = skills || 'General Agriculture';
      userData.experience = experience || '1-3 Years';
      userData.availability = availability || 'Full Time';
      userData.preferredRadius = preferredRadius || '10 km';
    } else if (role === 'farmer') {
      userData.farmName = farmName || `${name}'s Farm`;
      userData.farmType = farmType || 'Multi-crop Agriculture';
    }

    if (isDbConnected()) {
      const existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'An account with this email address already exists.'
        });
      }
      const user = await User.create(userData);
      const token = generateToken(user._id, user.role);

      return res.status(201).json({
        success: true,
        message: 'Account created successfully.',
        token,
        user: sanitizeUser(user)
      });
    } else {
      if (memoryUsers.has(normalizedEmail)) {
        return res.status(400).json({
          success: false,
          message: 'An account with this email address already exists.'
        });
      }
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const fakeId = new mongoose.Types.ObjectId().toString();
      const user = {
        _id: fakeId,
        id: fakeId,
        ...userData,
        password: hashedPassword,
        createdAt: new Date()
      };
      memoryUsers.set(normalizedEmail, user);

      const token = generateToken(user._id, user.role);
      return res.status(201).json({
        success: true,
        message: 'Account created successfully.',
        token,
        user: sanitizeUser(user)
      });
    }
  } catch (error) {
    console.error('Registration Controller Error:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.'
      });
    }
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error occurred during registration.'
    });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = async (req, res) => {
  try {
    if (!requireDatabase(res)) return;

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = isDbConnected()
      ? await User.findOne({ email: normalizedEmail }).select('+password')
      : memoryUsers.get(normalizedEmail);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // Check password
    let isMatch = false;
    if (typeof user.matchPassword === 'function') {
      isMatch = await user.matchPassword(password);
    } else if (user.password) {
      isMatch = await bcrypt.compare(password, user.password);
    }

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const token = generateToken(user._id, user.role);

    const sanitizedUser = {
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
    };

    return res.json({
      success: true,
      message: 'Login successful',
      token,
      user: sanitizedUser
    });
  } catch (error) {
    console.error('Login Controller Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error occurred during login.'
    });
  }
};

// @desc    Get current authenticated user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    if (!requireDatabase(res)) return;

    let user = null;

    if (isDbConnected()) {
      try {
        user = await User.findById(req.user.id);
      } catch (dbErr) {
        console.warn('[Auth] DB lookup failed for getMe:', dbErr.message);
      }
    }

    if (!user) {
      for (const u of memoryUsers.values()) {
        if (String(u._id) === String(req.user.id) || String(u.id) === String(req.user.id)) {
          user = u;
          break;
        }
      }
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found'
      });
    }

    return res.json({
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
    console.error('getMe Controller Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching user profile.'
    });
  }
};

// @desc    Logout user (clears token on client)
// @route   POST /api/auth/logout
// @access  Public / Private
exports.logoutUser = async (req, res) => {
  return res.json({
    success: true,
    message: 'Logged out successfully.'
  });
};
