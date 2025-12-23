import express from 'express';
import { createProgram, listPrograms, joinProgram, listJoinedPrograms } from '../controllers/program.controller.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, listPrograms);
router.get('/joined', authenticateToken, listJoinedPrograms);
router.post('/', authenticateToken, createProgram);
router.post('/:id/join', authenticateToken, joinProgram);

export default router;
