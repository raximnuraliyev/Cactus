import { LeaderboardRepository } from '../repositories/LeaderboardRepository.js';

export class LeaderboardService {
  private leaderboardRepo = new LeaderboardRepository();

  async getWeeklyLeaderboard() {
    const entries = await this.leaderboardRepo.getWeeklyTop100();
    return {
      period: 'weekly',
      entries: entries.map((e) => ({
        rank: Number(e.rank),
        userId: e.user_id,
        username: e.username,
        avatarUrl: e.avatar_url,
        totalXp: Number(e.total_xp),
        level: Number(e.current_level),
        accuracy: Number(e.accuracy_pct),
        gamesPlayed: Number(e.total_games),
      })),
    };
  }

  async getAllTimeLeaderboard() {
    const entries = await this.leaderboardRepo.getAllTimeTop100();
    return {
      period: 'all-time',
      entries: entries.map((e) => ({
        rank: Number(e.rank),
        userId: e.user_id,
        username: e.username,
        avatarUrl: e.avatar_url,
        totalXp: Number(e.total_xp),
        level: Number(e.current_level),
        accuracy: Number(e.accuracy_pct),
        gamesPlayed: Number(e.total_games),
      })),
    };
  }

  async getUserRank(userId: string) {
    return this.leaderboardRepo.getUserRank(userId);
  }

  async invalidateCache() {
    await this.leaderboardRepo.invalidateCache();
  }
}
