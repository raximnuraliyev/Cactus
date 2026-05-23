import { Router } from 'express';
import { GameController } from '../controllers/GameController.js';
import { authenticateJWT as authenticate, optionalAuth as optionalAuthenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { z } from 'zod';

const router = Router();

const startSchema = z.object({
  body: z.object({
    category: z.enum(['phishing', 'phone_call', 'transaction', 'document']).optional(),
    difficulty: z.enum(['easy', 'medium', 'hard']).optional()
  })
});

const turnSchema = z.object({
  body: z.object({
    inputType: z.enum(['choice', 'text', 'tool']),
    input: z.string().min(1)
  }),
  params: z.object({
    id: z.string().uuid()
  })
});

const verdictSchema = z.object({
  body: z.object({
    verdict: z.enum(['real_employee', 'fraudster']),
    flaggedClues: z.array(z.string()).default([])
  }),
  params: z.object({
    id: z.string().uuid()
  })
});

router.post('/start', optionalAuthenticate, validate(startSchema as any), GameController.startGame);
router.post('/:id/turn', authenticate, validate(turnSchema as any), GameController.submitTurn);
router.post('/:id/verdict', authenticate, validate(verdictSchema as any), GameController.submitVerdict);
router.get('/daily-challenge', authenticate, GameController.getDailyChallenge);
router.get('/history', authenticate, GameController.getHistory);
router.get('/:id', authenticate, GameController.getSession);

export default router;
