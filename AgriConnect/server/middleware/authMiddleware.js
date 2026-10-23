const jwt = require('jsonwebtoken');
const User = require('../models/User');
const getJwtSecret = require('../utils/getJwtSecret');

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
        getJwtSecret()
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

// Middleware to optionally attach authenticated user if token is provided
exports.optionalProtect = async (req, res, next) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(
        token,
        getJwtSecret()
      );
      req.user = await User.findById(decoded.id || decoded.userId).select('-password');
    } catch (error) {
      // Ignore token errors for optional protection, treat as unauthenticated
      req.user = null;
    }
  }
  next();
};
