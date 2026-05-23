import cron from 'node-cron';
import { DailyChallengeService } from '../services/DailyChallengeService.js';

export function startDailyChallengeResetJob() {
  // Run at midnight Tashkent time (UTC+5)
  cron.schedule('0 0 * * *', async () => {
    try {
      const service = new DailyChallengeService();
      await service.ensureTodaysChallengeExists();
      console.log('Daily challenge reset completed successfully.');
    } catch (error) {
      console.error('Error in dailyChallengeReset job:', error);
    }
  }, {
    timezone: 'Asia/Tashkent'
  });
}
