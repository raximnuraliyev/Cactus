import type { Request, Response, NextFunction } from 'express';
import { validateTelegramInitData } from '../config/telegram.js';
import { UnauthorizedError } from './errorHandler.js';

declare global {
  namespace Express {
    interface Request {
      telegramUser?: {
        id: number;
        first_name: string;
        last_name?: string;
        username?: string;
        language_code?: string;
        photo_url?: string;
      };
    }
  }
}

export function authenticateTelegram(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const initData = req.body?.initData;

  if (!initData || typeof initData !== 'string') {
    next(new UnauthorizedError('Missing Telegram initData'));
    return;
  }

  const validated = validateTelegramInitData(initData);

  if (!validated) {
    next(new UnauthorizedError('Invalid Telegram authentication data'));
    return;
  }

  if (!validated.user) {
    next(new UnauthorizedError('Telegram user data not found'));
    return;
  }

  req.telegramUser = validated.user;
  next();
}
