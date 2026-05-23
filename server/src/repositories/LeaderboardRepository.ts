import { query } from '../config/database.js';
import { cacheGet, cacheSet } from '../config/redis.js';

export interface LeaderboardEntry {
  user_id: string;
  username: string;
  avatar_url: string | null;
  total_xp: number;
  current_level: number;
  accuracy_pct: number;
  total_games: number;
  rank: number;
}

const CACHE_TTL = 300; // 5 minutes

export class LeaderboardRepository {
  async getWeeklyTop100(): Promise<LeaderboardEntry[]> {
    const cacheKey = 'leaderboard:weekly';
    const cached = await cacheGet<LeaderboardEntry[]>(cacheKey);
    if (cached) return cached;

    const result = await query<LeaderboardEntry>(
      `SELECT
        u.id as user_id,
        u.username,
        u.avatar_url,
        COALESCE(SUM(gs.score_total), 0)::INTEGER as total_xp,
        us.current_level,
        us.accuracy_pct,
        COUNT(gs.id)::INTEGER as total_games,
        ROW_NUMBER() OVER (ORDER BY COALESCE(SUM(gs.score_total), 0) DESC) as rank
       FROM users u
       INNER JOIN user_stats us ON us.user_id = u.id
       LEFT JOIN game_sessions gs ON gs.user_id = u.id
         AND gs.status = 'completed'
         AND gs.completed_at >= date_trunc('week', CURRENT_TIMESTAMP)
       WHERE u.deleted_at IS NULL AND u.is_private = false
       GROUP BY u.id, u.username, u.avatar_url, us.current_level, us.accuracy_pct
       HAVING COALESCE(SUM(gs.score_total), 0) > 0
       ORDER BY total_xp DESC
       LIMIT 100`
    );

    const entries = result.rows;
    await cacheSet(cacheKey, entries, CACHE_TTL);
    return entries;
  }

  async getAllTimeTop100(): Promise<LeaderboardEntry[]> {
    const cacheKey = 'leaderboard:all-time';
    const cached = await cacheGet<LeaderboardEntry[]>(cacheKey);
    if (cached) return cached;

    const result = await query<LeaderboardEntry>(
      `SELECT
        u.id as user_id,
        u.username,
        u.avatar_url,
        us.total_xp,
        us.current_level,
        us.accuracy_pct,
        us.total_games,
        ROW_NUMBER() OVER (ORDER BY us.total_xp DESC) as rank
       FROM users u
       INNER JOIN user_stats us ON us.user_id = u.id
       WHERE u.deleted_at IS NULL AND u.is_private = false AND us.total_xp > 0
       ORDER BY us.total_xp DESC
       LIMIT 100`
    );

    const entries = result.rows;
    await cacheSet(cacheKey, entries, CACHE_TTL);
    return entries;
  }

  async getUserRank(userId: string): Promise<number | null> {
    const result = await query<{ rank: string }>(
      `SELECT rank FROM (
        SELECT user_id, ROW_NUMBER() OVER (ORDER BY total_xp DESC) as rank
        FROM user_stats
       ) ranked
       WHERE user_id = $1`,
      [userId]
    );
    return result.rows[0] ? parseInt(result.rows[0].rank, 10) : null;
  }

  async invalidateCache(): Promise<void> {
    const { cacheDel } = await import('../config/redis.js');
    await cacheDel('leaderboard:weekly');
    await cacheDel('leaderboard:all-time');
  }
}
