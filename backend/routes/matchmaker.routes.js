import express from 'express';
import { getRecommendations, getPersonalizedSuggestions } from '../controllers/matchmaker.controller.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/matchmaker/recommend
router.post('/recommend', authenticateToken, getRecommendations);

// @route   GET /api/matchmaker/suggestions
router.get('/suggestions', authenticateToken, getPersonalizedSuggestions);

export default router;
