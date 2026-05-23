import { query } from '../config/database.js';

export interface DailyChallenge {
  challenge_date: string;
  template_id: string;
  total_completions: number;
  avg_score: number;
}

export class DailyChallengeRepository {
  async findByDate(date: string): Promise<DailyChallenge | null> {
    const result = await query<DailyChallenge>(
      `SELECT * FROM daily_challenges WHERE challenge_date = $1`,
      [date]
    );
    return result.rows[0] ?? null;
  }

  async create(date: string, templateId: string): Promise<DailyChallenge> {
    const result = await query<DailyChallenge>(
      `INSERT INTO daily_challenges (challenge_date, template_id)
       VALUES ($1, $2)
       ON CONFLICT (challenge_date) DO NOTHING
       RETURNING *`,
      [date, templateId]
    );
    // if ON CONFLICT hit, return existing
    if (!result.rows[0]) {
      const existing = await this.findByDate(date);
      return existing!;
    }
    return result.rows[0];
  }

  async incrementCompletion(date: string, score: number): Promise<void> {
    await query(
      `UPDATE daily_challenges
       SET total_completions = total_completions + 1,
           avg_score = ((avg_score * total_completions) + $2) / (total_completions + 1)
       WHERE challenge_date = $1`,
      [date, score]
    );
  }

  async hasUserCompleted(userId: string, date: string): Promise<boolean> {
    const result = await query<{ count: string }>(
      `SELECT COUNT(*) as count FROM daily_completions
       WHERE user_id = $1 AND challenge_date = $2`,
      [userId, date]
    );
    return parseInt(result.rows[0]?.count ?? '0', 10) > 0;
  }

  async recordCompletion(userId: string, date: string): Promise<void> {
    await query(
      `INSERT INTO daily_completions (user_id, challenge_date)
       VALUES ($1, $2)
       ON CONFLICT (user_id, challenge_date) DO NOTHING`,
      [userId, date]
    );
  }

  async getUserDailyCompletionCount(userId: string): Promise<number> {
    const result = await query<{ count: string }>(
      `SELECT COUNT(*) as count FROM daily_completions WHERE user_id = $1`,
      [userId]
    );
    return parseInt(result.rows[0]?.count ?? '0', 10);
  }
}
