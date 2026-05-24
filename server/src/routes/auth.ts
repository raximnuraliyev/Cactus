import { Router } from 'express';
import { AuthController } from '../controllers/AuthController.js';
import { authenticateJWT as authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { z } from 'zod';

const router = Router();

const registerSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8),
    username: z.string().min(2).max(32)
  })
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string()
  })
});

const telegramSchema = z.object({
  body: z.object({
    initData: z.string().min(1)
  })
});

const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1)
  })
});

router.post('/register', validate(registerSchema as any), AuthController.register);
router.post('/telegram', validate(telegramSchema as any), AuthController.telegramLogin);
router.post('/login', validate(loginSchema as any), AuthController.login);
router.post('/guest', AuthController.guestLogin);
router.post('/refresh', validate(refreshSchema as any), AuthController.refresh);
router.post('/logout', authenticate, AuthController.logout);

export default router;
