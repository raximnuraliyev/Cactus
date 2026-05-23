import { query } from '../config/database.js';

export interface GameSession {
  id: string;
  user_id: string | null;
  scenario_template_id: string;
  scenario_type: 'phishing' | 'phone_call' | 'transaction' | 'document';
  difficulty: 'easy' | 'medium' | 'hard';
  is_real_character: boolean;
  verdict_given: string | null;
  verdict_correct: boolean | null;
  score_total: number;
  score_breakdown: Record<string, number>;
  clues_found: number;
  clues_total: number;
  tools_used: string[];
  debrief_text: string | null;
  status: 'active' | 'completed' | 'abandoned';
  is_daily_challenge: boolean;
  started_at: Date;
  completed_at: Date | null;
}

export interface CreateSessionInput {
  user_id?: string | null;
  scenario_template_id: string;
  scenario_type: string;
  difficulty: string;
  is_real_character: boolean;
  clues_total: number;
  is_daily_challenge?: boolean;
}

export class GameSessionRepository {
  async findById(id: string): Promise<GameSession | null> {
    const result = await query<GameSession>(
      `SELECT * FROM game_sessions WHERE id = $1`,
      [id]
    );
    return result.rows[0] ?? null;
  }

  async create(input: CreateSessionInput): Promise<GameSession> {
    const result = await query<GameSession>(
      `INSERT INTO game_sessions
        (user_id, scenario_template_id, scenario_type, difficulty, is_real_character, clues_total, is_daily_challenge)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        input.user_id ?? null,
        input.scenario_template_id,
        input.scenario_type,
        input.difficulty,
        input.is_real_character,
        input.clues_total,
        input.is_daily_challenge ?? false,
      ]
    );
    return result.rows[0]!;
  }

  async updateVerdict(
    id: string,
    verdictGiven: string,
    verdictCorrect: boolean,
    scoreTotal: number,
    scoreBreakdown: Record<string, number>,
    cluesFound: number,
    toolsUsed: string[],
    debriefText: string
  ): Promise<GameSession | null> {
    const result = await query<GameSession>(
      `UPDATE game_sessions
       SET verdict_given = $2,
           verdict_correct = $3,
           score_total = $4,
           score_breakdown = $5,
           clues_found = $6,
           tools_used = $7,
           debrief_text = $8,
           status = 'completed',
           completed_at = now()
       WHERE id = $1
       RETURNING *`,
      [
        id,
        verdictGiven,
        verdictCorrect,
        scoreTotal,
        JSON.stringify(scoreBreakdown),
        cluesFound,
        JSON.stringify(toolsUsed),
        debriefText,
      ]
    );
    return result.rows[0] ?? null;
  }

  async updateCluesFound(id: string, cluesFound: number): Promise<void> {
    await query(
      `UPDATE game_sessions SET clues_found = $2 WHERE id = $1`,
      [id, cluesFound]
    );
  }

  async addToolUsed(id: string, tool: string): Promise<void> {
    await query(
      `UPDATE game_sessions
       SET tools_used = tools_used || $2::jsonb
       WHERE id = $1`,
      [id, JSON.stringify([tool])]
    );
  }

  async abandon(id: string): Promise<void> {
    await query(
      `UPDATE game_sessions SET status = 'abandoned', completed_at = now() WHERE id = $1`,
      [id]
    );
  }

  async findUserHistory(
    userId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<GameSession[]> {
    const result = await query<GameSession>(
      `SELECT * FROM game_sessions
       WHERE user_id = $1 AND status = 'completed'
       ORDER BY started_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );
    return result.rows;
  }

  async countUserGames(userId: string): Promise<number> {
    const result = await query<{ count: string }>(
      `SELECT COUNT(*) as count FROM game_sessions WHERE user_id = $1 AND status = 'completed'`,
      [userId]
    );
    return parseInt(result.rows[0]?.count ?? '0', 10);
  }

  async findActiveSession(userId: string): Promise<GameSession | null> {
    const result = await query<GameSession>(
      `SELECT * FROM game_sessions WHERE user_id = $1 AND status = 'active' ORDER BY started_at DESC LIMIT 1`,
      [userId]
    );
    return result.rows[0] ?? null;
  }

  async hasCompletedDailyChallenge(userId: string, date: string): Promise<boolean> {
    const result = await query<{ count: string }>(
      `SELECT COUNT(*) as count FROM game_sessions
       WHERE user_id = $1 AND is_daily_challenge = true AND status = 'completed'
         AND started_at::date = $2::date`,
      [userId, date]
    );
    return parseInt(result.rows[0]?.count ?? '0', 10) > 0;
  }

  async getUserCategoryCorrectCount(userId: string, category: string): Promise<number> {
    const result = await query<{ count: string }>(
      `SELECT COUNT(*) as count FROM game_sessions
       WHERE user_id = $1 AND scenario_type = $2 AND verdict_correct = true AND status = 'completed'`,
      [userId, category]
    );
    return parseInt(result.rows[0]?.count ?? '0', 10);
  }
}
