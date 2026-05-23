import cron from 'node-cron';
import { NotificationService } from '../services/NotificationService.js';

export function startStreakProtectionJob() {
  // Run at 8 PM Tashkent time (UTC+5)
  cron.schedule('0 20 * * *', async () => {
    try {
      const service = new NotificationService();
      await service.sendStreakProtectionAlerts();
    } catch (error) {
      console.error('Error in streakProtection job:', error);
    }
  }, {
    timezone: 'Asia/Tashkent'
  });
}
