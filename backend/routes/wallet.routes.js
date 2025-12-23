import express from 'express';
import { getWallet, adjustWallet } from '../controllers/wallet.controller.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/wallet
router.get('/', authenticateToken, getWallet);

// @route   POST /api/wallet/adjust
router.post('/adjust', authenticateToken, adjustWallet);

export default router;
