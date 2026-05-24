import { Router } from 'express';
import { UserController } from '../controllers/UserController.js';
import { authenticateJWT as authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { z } from 'zod';

const router = Router();

const updateSchema = z.object({
  body: z.object({
    username: z.string().min(2).max(32).optional(),
    language: z.enum(['en', 'ru', 'uz']).optional(),
    isPrivate: z.boolean().optional(),
    notifyDaily: z.boolean().optional(),
    stats: z.object({
      elo: z.number().optional(),
      awareness: z.number().optional(),
      intuition: z.number().optional(),
      speed: z.number().optional(),
      resilience: z.number().optional(),
      placement_games_played: z.number().optional()
    }).optional()
  })
});

router.get('/me', authenticate, UserController.getProfile);
router.patch('/me', authenticate, validate(updateSchema as any), UserController.updateProfile);
router.get('/badges', authenticate, UserController.getBadges);
router.get('/stats', authenticate, (req, res, next) => (UserController as any).getStats(req, res, next));

export default router;
