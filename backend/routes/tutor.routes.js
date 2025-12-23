import express from 'express';
import {
  getTutors,
  getTutorById,
  createTutor,
  updateTutor,
  addReview,
  getTutorReviews
} from '../controllers/tutor.controller.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';
import { createTutorRules, createReviewRules, validateId, validate } from '../middleware/validator.js';

const router = express.Router();

// @route   GET /api/tutors
router.get('/', optionalAuth, getTutors);

// @route   GET /api/tutors/:id
router.get('/:id', validateId, validate, getTutorById);

// @route   POST /api/tutors
router.post('/', authenticateToken, createTutorRules, validate, createTutor);

// @route   PUT /api/tutors/:id
router.put('/:id', authenticateToken, validateId, validate, updateTutor);

// @route   POST /api/tutors/:id/reviews
router.post('/:id/reviews', authenticateToken, validateId, createReviewRules, validate, addReview);

// @route   GET /api/tutors/:id/reviews
router.get('/:id/reviews', validateId, validate, getTutorReviews);

export default router;
