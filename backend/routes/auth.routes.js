import express from 'express';
import { verifyUser, getCurrentUser } from '../controllers/auth.controller.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/auth/verify
router.post('/verify', verifyUser);

// @route   GET /api/auth/me
router.get('/me', authenticateToken, getCurrentUser);

export default router;
