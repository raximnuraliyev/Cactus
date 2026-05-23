import cron from 'node-cron';
import { LeaderboardService } from '../services/LeaderboardService.js';

export function startLeaderboardRefreshJob() {
  // Run every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    try {
      const leaderboardService = new LeaderboardService();
      await leaderboardService.invalidateCache();
    } catch (error) {
      console.error('Error in leaderboardRefresh job:', error);
    }
  });
}
