import { Router } from 'express';
import authRoutes from './auth.js';
import gameRoutes from './game.js';
import userRoutes from './user.js';
import leaderboardRoutes from './leaderboard.js';
import tournamentRoutes from './tournaments.js';
import aiRoutes from './ai.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/game', gameRoutes);
router.use('/user', userRoutes);
router.use('/leaderboard', leaderboardRoutes);
router.use('/tournaments', tournamentRoutes);
router.use('/ai', aiRoutes);

export default router;
