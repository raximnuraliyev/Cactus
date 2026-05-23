import { Router } from 'express';
import { LeaderboardController } from '../controllers/LeaderboardController.js';
import { authenticateJWT as authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/weekly', authenticate, LeaderboardController.getWeekly);
router.get('/all-time', authenticate, LeaderboardController.getAllTime);

export default router;
