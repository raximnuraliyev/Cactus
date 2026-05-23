import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { getRedis } from '../config/redis.js';
import { env } from '../config/env.js';

function createRedisStore(prefix: string) {
  const client = getRedis();
  return new RedisStore({
    sendCommand: (...args: string[]) => {
      const [cmd, ...rest] = args;
      return (client as any).call(cmd, ...rest) as Promise<any>;
    },
    prefix: `rl:${prefix}:`,
  });
}

export const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  store: env.NODE_ENV !== 'test' ? createRedisStore('general') : undefined,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests, please try again later',
    },
  },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  store: env.NODE_ENV !== 'test' ? createRedisStore('auth') : undefined,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many authentication attempts, please try again later',
    },
  },
});

export const gameLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  store: env.NODE_ENV !== 'test' ? createRedisStore('game') : undefined,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many game requests, please slow down',
    },
  },
});
