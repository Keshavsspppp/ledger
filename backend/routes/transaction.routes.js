import express from 'express';
import {
  getTransactions,
  getTransactionById,
  getTransactionStats,
  createManualTransaction,
  exportTransactions
} from '../controllers/transaction.controller.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateId, validate } from '../middleware/validator.js';

const router = express.Router();

// @route   GET /api/transactions
router.get('/', authenticateToken, getTransactions);

// @route   GET /api/transactions/stats
router.get('/stats', authenticateToken, getTransactionStats);

// @route   GET /api/transactions/:id
router.get('/:id', authenticateToken, validateId, validate, getTransactionById);

// @route   POST /api/transactions/manual
router.post('/manual', authenticateToken, createManualTransaction);
router.get('/export', authenticateToken, exportTransactions);

export default router;
