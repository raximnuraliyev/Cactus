import { query } from '../config/database.js';

export interface ScenarioTemplate {
  id: string;
  category: 'phishing' | 'phone_call' | 'transaction' | 'document';
  difficulty: 'easy' | 'medium' | 'hard';
  title: string;
  briefing_text: string;
  character_intro: string;
  is_real_character: boolean;
  system_prompt: string;
  clues: string[];
  tactics_used: string[];
  initial_choices: string[];
  is_active: boolean;
  created_at: Date;
}

export class ScenarioRepository {
  async findById(id: string): Promise<ScenarioTemplate | null> {
    const result = await query<ScenarioTemplate>(
      `SELECT * FROM scenario_templates WHERE id = $1`,
      [id]
    );
    return result.rows[0] ?? null;
  }

  async findActive(
    category?: string,
    difficulty?: string
  ): Promise<ScenarioTemplate[]> {
    let sql = `SELECT * FROM scenario_templates WHERE is_active = true`;
    const params: unknown[] = [];
    let paramIndex = 1;

    if (category) {
      sql += ` AND category = $${paramIndex++}`;
      params.push(category);
    }
    if (difficulty) {
      sql += ` AND difficulty = $${paramIndex++}`;
      params.push(difficulty);
    }

    sql += ` ORDER BY created_at ASC`;

    const result = await query<ScenarioTemplate>(sql, params);
    return result.rows;
  }

  async findRandom(
    category?: string,
    difficulty?: string
  ): Promise<ScenarioTemplate | null> {
    let sql = `SELECT * FROM scenario_templates WHERE is_active = true`;
    const params: unknown[] = [];
    let paramIndex = 1;

    if (category) {
      sql += ` AND category = $${paramIndex++}`;
      params.push(category);
    }
    if (difficulty) {
      sql += ` AND difficulty = $${paramIndex++}`;
      params.push(difficulty);
    }

    sql += ` ORDER BY RANDOM() LIMIT 1`;

    const result = await query<ScenarioTemplate>(sql, params);
    return result.rows[0] ?? null;
  }

  async findRandomForDaily(): Promise<ScenarioTemplate | null> {
    const result = await query<ScenarioTemplate>(
      `SELECT * FROM scenario_templates
       WHERE is_active = true
       ORDER BY RANDOM()
       LIMIT 1`
    );
    return result.rows[0] ?? null;
  }

  async count(): Promise<number> {
    const result = await query<{ count: string }>(
      `SELECT COUNT(*) as count FROM scenario_templates WHERE is_active = true`
    );
    return parseInt(result.rows[0]?.count ?? '0', 10);
  }
}
