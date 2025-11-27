/**
 * Authentication Controllers
 */

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Mock user database (in real app, use actual database)
const users = [
  {
    id: 1,
    username: 'demo',
    email: 'demo@example.com',
    password: '$2a$10$8K1p/a0dL1LKlOgvgVEyLOuYd2u2TT0jHJ0fU9VJ7vQf8K1p/a0dL', // 'password123'
    role: 'admin'
  }
];

/**
 * Login handler
 */
const loginHandler = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user
    const user = users.find(u => u.username === username);
    
    if (!user) {
      return res.status(401).json({
        status: 'Error',
        message: 'Invalid credentials'
      });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    
    if (!validPassword) {
      return res.status(401).json({
        status: 'Error',
        message: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.username,
        role: user.role 
      },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '24h' }
    );

    return res.status(200).json({
      status: 'Success',
      message: 'Login successful',
      token: token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      status: 'Error',
      message: 'Internal server error'
    });
  }
};

/**
 * Get current user profile
 */
const getProfileHandler = (req, res) => {
  try {
    // req.user is set by verifyToken middleware
    const user = users.find(u => u.id === req.user.id);
    
    if (!user) {
      return res.status(404).json({
        status: 'Error',
        message: 'User not found'
      });
    }

    return res.status(200).json({
      status: 'Success',
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({
      status: 'Error',
      message: 'Internal server error'
    });
  }
};

module.exports = {
  loginHandler,
  getProfileHandler
};
