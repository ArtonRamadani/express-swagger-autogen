/**
 * Authentication Routes
 */

const express = require('express');
const router = express.Router();
const { loginHandler, getProfileHandler } = require('../controllers/auth.controller');
const verifyToken = require('../middleware/verifyToken');

// Public route - no authentication required
router.post('/login', loginHandler);

// Protected route - requires authentication
router.get('/profile', verifyToken, getProfileHandler);

module.exports = router;
