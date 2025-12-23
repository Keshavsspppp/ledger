import express from 'express';
import {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserStats
} from '../controllers/user.controller.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';
import { updateUserRules, validateId, validate } from '../middleware/validator.js';

const router = express.Router();

// @route   GET /api/users
router.get('/', optionalAuth, getUsers);

// @route   GET /api/users/:id
router.get('/:id', validateId, validate, getUserById);

// @route   PUT /api/users/:id
router.put('/:id', authenticateToken, validateId, updateUserRules, validate, updateUser);

// @route   DELETE /api/users/:id
router.delete('/:id', authenticateToken, validateId, validate, deleteUser);

// @route   GET /api/users/:id/stats
router.get('/:id/stats', validateId, validate, getUserStats);

export default router;
