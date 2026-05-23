import morgan from 'morgan';
import type { RequestHandler } from 'express';
import { env } from '../config/env.js';

export const requestLogger: RequestHandler = morgan(
  env.NODE_ENV === 'production'
    ? ':remote-addr :method :url :status :res[content-length] - :response-time ms'
    : ':method :url :status :response-time ms',
  {
    skip: (_req, res) => {
      if (env.NODE_ENV === 'production') {
        return res.statusCode < 400;
      }
      return false;
    },
  }
);
