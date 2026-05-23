import 'dotenv/config'; // loads ../.env
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { requestLogger } from './middleware/requestLogger.js';
import { errorHandler } from './middleware/errorHandler.js';
import { generalLimiter as globalRateLimiter } from './middleware/rateLimiter.js';
import apiRoutes from './routes/index.js';
import { startJobs } from './jobs/index.js';
import { env } from './config/env.js';
import { startTelegramBot } from './config/telegram.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: env.APP_URL, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(requestLogger);
app.use(globalRateLimiter);

app.use('/api/v1', apiRoutes);

app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`Server running on port ${env.PORT}`);
  startJobs();
  startTelegramBot();
});
