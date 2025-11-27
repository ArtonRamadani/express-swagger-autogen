/**
 * Main Routes Index
 * Combines all route modules
 */

const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth.routes');
const usersRoutes = require('./users.routes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', usersRoutes);

module.exports = router;
