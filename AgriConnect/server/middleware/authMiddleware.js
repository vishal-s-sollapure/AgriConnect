const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to protect routes via JWT token verification
exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Extract token from Bearer scheme
      token = req.headers.authorization.split(' ')[1];

      // Verify JWT token
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'agriconnect_secure_jwt_secret_key_2026'
      );

      // Attach user from database (excluding password hash)
      req.user = await User.findById(decoded.id || decoded.userId).select('-password');

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Not authorized: User account no longer exists'
        });
      }

      next();
    } catch (error) {
      console.error('JWT Verification Error:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Not authorized: Invalid or expired token'
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized: No authentication token provided'
    });
  }
};

// Middleware to enforce role-based access control (e.g. requireRole('farmer'))
exports.requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized: Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: User role '${req.user.role}' is not authorized to access this resource`
      });
    }

    next();
  };
};
