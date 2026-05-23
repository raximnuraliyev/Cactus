import { startLeaderboardRefreshJob } from './leaderboardRefresh.js';
import { startDailyChallengeResetJob } from './dailyChallengeReset.js';
import { startDailyNotificationJob } from './dailyNotification.js';
import { startStreakProtectionJob } from './streakProtection.js';

export function startJobs() {
  console.log('Starting background jobs...');
  startLeaderboardRefreshJob();
  startDailyChallengeResetJob();
  startDailyNotificationJob();
  startStreakProtectionJob();
  console.log('Background jobs started successfully.');
}
