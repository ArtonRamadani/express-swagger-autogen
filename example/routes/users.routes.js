/**
 * Users Routes
 */

const express = require('express');
const router = express.Router();
const {
  getAllUsersHandler,
  getUserByIdHandler,
  createUserHandler,
  updateUserHandler,
  deleteUserHandler
} = require('../controllers/users.controller');
const verifyToken = require('../middleware/verifyToken');

// All user routes require authentication
router.get('/', verifyToken, getAllUsersHandler);
router.get('/:id', verifyToken, getUserByIdHandler);
router.post('/', verifyToken, createUserHandler);
router.put('/:id', verifyToken, updateUserHandler);
router.delete('/:id', verifyToken, deleteUserHandler);

module.exports = router;
