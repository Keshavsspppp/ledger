import express from 'express';
import {
  getSessions,
  getSessionById,
  createSession,
  requestSession,
  updateSession,
  completeSession,
  cancelSession,
  addSessionReview
} from '../controllers/session.controller.js';
import { authenticateToken } from '../middleware/auth.js';
import { createSessionRules, createReviewRules, validateId, validate } from '../middleware/validator.js';

const router = express.Router();

// @route   GET /api/sessions
router.get('/', authenticateToken, getSessions);

// @route   GET /api/sessions/:id
router.get('/:id', authenticateToken, validateId, validate, getSessionById);

// @route   POST /api/sessions
router.post('/', authenticateToken, createSessionRules, validate, createSession);
router.post('/request', authenticateToken, requestSession);

// @route   PUT /api/sessions/:id
router.put('/:id', authenticateToken, validateId, validate, updateSession);

// @route   POST /api/sessions/:id/complete
router.post('/:id/complete', authenticateToken, validateId, validate, completeSession);

// @route   POST /api/sessions/:id/cancel
router.post('/:id/cancel', authenticateToken, validateId, validate, cancelSession);

// @route   POST /api/sessions/:id/review
router.post('/:id/review', authenticateToken, validateId, createReviewRules, validate, addSessionReview);

export default router;
