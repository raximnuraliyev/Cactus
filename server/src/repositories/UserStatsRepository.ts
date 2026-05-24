import { query } from '../config/database.js';
import type pg from 'pg';

export interface UserStats {
  user_id: string;
  total_xp: number;
  current_level: number;
  total_games: number;
  correct_verdicts: number;
  accuracy_pct: number;
  current_streak: number;
  best_streak: number;
  last_played_at: Date | null;
  updated_at: Date;
  elo: number;
  awareness: number;
  intuition: number;
  speed: number;
  resilience: number;
  placement_games_played: number;
}

export class UserStatsRepository {
  async findByUserId(userId: string): Promise<UserStats | null> {
    const result = await query<UserStats>(
      `SELECT * FROM user_stats WHERE user_id = $1`,
      [userId]
    );
    return result.rows[0] ?? null;
  }

  async create(userId: string, client?: pg.PoolClient): Promise<UserStats> {
    const text = `INSERT INTO user_stats (user_id) VALUES ($1) RETURNING *`;
    const values = [userId];
    const result = client 
      ? await client.query<UserStats>(text, values)
      : await query<UserStats>(text, values);
    return result.rows[0]!;
  }

  async addXP(userId: string, xp: number): Promise<UserStats | null> {
    const result = await query<UserStats>(
      `UPDATE user_stats
       SET total_xp = total_xp + $2,
           current_level = LEAST(7, GREATEST(1,
             CASE
               WHEN total_xp + $2 >= 50000 THEN 7
               WHEN total_xp + $2 >= 25000 THEN 6
               WHEN total_xp + $2 >= 10000 THEN 5
               WHEN total_xp + $2 >= 5000 THEN 4
               WHEN total_xp + $2 >= 2000 THEN 3
               WHEN total_xp + $2 >= 500 THEN 2
               ELSE 1
             END
           )),
           updated_at = now()
       WHERE user_id = $1
       RETURNING *`,
      [userId, xp]
    );
    return result.rows[0] ?? null;
  }

  async recordGameResult(
    userId: string,
    isCorrect: boolean,
    xpEarned: number
  ): Promise<UserStats | null> {
    const result = await query<UserStats>(
      `UPDATE user_stats
       SET total_games = total_games + 1,
           placement_games_played = LEAST(5, placement_games_played + 1),
           correct_verdicts = correct_verdicts + $2,
           accuracy_pct = CASE
             WHEN total_games + 1 > 0
             THEN ROUND(((correct_verdicts + $2)::NUMERIC / (total_games + 1)) * 100, 2)
             ELSE 0
           END,
           current_streak = CASE WHEN $3 THEN current_streak + 1 ELSE 0 END,
           best_streak = CASE
             WHEN $3 AND current_streak + 1 > best_streak THEN current_streak + 1
             ELSE best_streak
           END,
           total_xp = total_xp + $4,
           current_level = LEAST(7, GREATEST(1,
             CASE
               WHEN total_xp + $4 >= 50000 THEN 7
               WHEN total_xp + $4 >= 25000 THEN 6
               WHEN total_xp + $4 >= 10000 THEN 5
               WHEN total_xp + $4 >= 5000 THEN 4
               WHEN total_xp + $4 >= 2000 THEN 3
               WHEN total_xp + $4 >= 500 THEN 2
               ELSE 1
             END
           )),
           last_played_at = now(),
           updated_at = now()
       WHERE user_id = $1
       RETURNING *`,
      [userId, isCorrect ? 1 : 0, isCorrect, xpEarned]
    );
    return result.rows[0] ?? null;
  }

  async resetStreak(userId: string): Promise<void> {
    await query(
      `UPDATE user_stats SET current_streak = 0, updated_at = now() WHERE user_id = $1`,
      [userId]
    );
  }

  async getStaleStreaks(hoursThreshold: number): Promise<UserStats[]> {
    const result = await query<UserStats>(
      `SELECT * FROM user_stats
       WHERE current_streak > 0
         AND last_played_at < now() - INTERVAL '1 hour' * $1`,
      [hoursThreshold]
    );
    return result.rows;
  }

  async updateStats(userId: string, updates: Partial<UserStats>): Promise<UserStats | null> {
    const fields: string[] = [];
    const values: any[] = [userId];
    let idx = 2;

    const allowedFields = [
      'total_xp', 'current_level', 'total_games', 'correct_verdicts',
      'accuracy_pct', 'current_streak', 'best_streak',
      'elo', 'awareness', 'intuition', 'speed', 'resilience', 'placement_games_played'
    ];

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key) && value !== undefined) {
        fields.push(`${key} = $${idx}`);
        values.push(value);
        idx++;
      }
    }

    if (fields.length === 0) return this.findByUserId(userId);

    fields.push(`updated_at = now()`);

    const result = await query<UserStats>(
      `UPDATE user_stats SET ${fields.join(', ')} WHERE user_id = $1 RETURNING *`,
      values
    );
    return result.rows[0] ?? null;
  }
}
