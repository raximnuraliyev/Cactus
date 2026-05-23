import { query } from '../config/database.js';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon_url: string | null;
  category: string;
  trigger_condition: Record<string, unknown>;
  display_order: number;
}

export interface UserBadge {
  user_id: string;
  badge_id: string;
  earned_at: Date;
}

export interface BadgeWithEarned extends Badge {
  earned_at: Date | null;
}

export class BadgeRepository {
  async findAll(): Promise<Badge[]> {
    const result = await query<Badge>(
      `SELECT * FROM badges ORDER BY display_order ASC`
    );
    return result.rows;
  }

  async findById(id: string): Promise<Badge | null> {
    const result = await query<Badge>(
      `SELECT * FROM badges WHERE id = $1`,
      [id]
    );
    return result.rows[0] ?? null;
  }

  async findByName(name: string): Promise<Badge | null> {
    const result = await query<Badge>(
      `SELECT * FROM badges WHERE name = $1`,
      [name]
    );
    return result.rows[0] ?? null;
  }

  async getUserBadges(userId: string): Promise<BadgeWithEarned[]> {
    const result = await query<BadgeWithEarned>(
      `SELECT b.*, ub.earned_at
       FROM badges b
       LEFT JOIN user_badges ub ON ub.badge_id = b.id AND ub.user_id = $1
       ORDER BY b.display_order ASC`,
      [userId]
    );
    return result.rows;
  }

  async getEarnedBadges(userId: string): Promise<Badge[]> {
    const result = await query<Badge>(
      `SELECT b.*
       FROM badges b
       INNER JOIN user_badges ub ON ub.badge_id = b.id
       WHERE ub.user_id = $1
       ORDER BY ub.earned_at DESC`,
      [userId]
    );
    return result.rows;
  }

  async awardBadge(userId: string, badgeId: string): Promise<boolean> {
    try {
      await query(
        `INSERT INTO user_badges (user_id, badge_id) VALUES ($1, $2)
         ON CONFLICT (user_id, badge_id) DO NOTHING`,
        [userId, badgeId]
      );
      return true;
    } catch {
      return false;
    }
  }

  async hasBadge(userId: string, badgeId: string): Promise<boolean> {
    const result = await query<{ count: string }>(
      `SELECT COUNT(*) as count FROM user_badges WHERE user_id = $1 AND badge_id = $2`,
      [userId, badgeId]
    );
    return parseInt(result.rows[0]?.count ?? '0', 10) > 0;
  }

  async countEarnedBadges(userId: string): Promise<number> {
    const result = await query<{ count: string }>(
      `SELECT COUNT(*) as count FROM user_badges WHERE user_id = $1`,
      [userId]
    );
    return parseInt(result.rows[0]?.count ?? '0', 10);
  }
}
