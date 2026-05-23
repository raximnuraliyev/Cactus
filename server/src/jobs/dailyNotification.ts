import cron from 'node-cron';
import { NotificationService } from '../services/NotificationService.js';

export function startDailyNotificationJob() {
  // Run at 9 AM Tashkent time (UTC+5)
  cron.schedule('0 9 * * *', async () => {
    try {
      const service = new NotificationService();
      await service.sendDailyReminders();
    } catch (error) {
      console.error('Error in dailyNotification job:', error);
    }
  }, {
    timezone: 'Asia/Tashkent'
  });
}
