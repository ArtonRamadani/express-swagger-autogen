/**
 * JWT Authentication Middleware
 * This middleware will be automatically detected by express-swagger-autogen
 */

const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  // Extract token from Authorization header
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      status: 'Error',
      message: 'Access denied. No token provided.'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({
        status: 'Error',
        message: 'Token has expired. Please log in again.'
      });
    }
    
    return res.status(403).json({
      status: 'Error',
      message: 'Invalid token.'
    });
  }
};

module.exports = verifyToken;
