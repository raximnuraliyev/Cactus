import { query } from '../config/database.js';

export interface SessionTurn {
  id: string;
  session_id: string;
  turn_number: number;
  input_type: 'choice' | 'text' | 'tool';
  player_input: string;
  ai_response: string;
  flagged_suspicious: boolean;
  created_at: Date;
}

export interface CreateTurnInput {
  session_id: string;
  turn_number: number;
  input_type: 'choice' | 'text' | 'tool';
  player_input: string;
  ai_response: string;
  flagged_suspicious?: boolean;
}

export class SessionTurnRepository {
  async create(input: CreateTurnInput): Promise<SessionTurn> {
    const result = await query<SessionTurn>(
      `INSERT INTO session_turns (session_id, turn_number, input_type, player_input, ai_response, flagged_suspicious)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        input.session_id,
        input.turn_number,
        input.input_type,
        input.player_input,
        input.ai_response,
        input.flagged_suspicious ?? false,
      ]
    );
    return result.rows[0]!;
  }

  async findBySessionId(sessionId: string): Promise<SessionTurn[]> {
    const result = await query<SessionTurn>(
      `SELECT * FROM session_turns WHERE session_id = $1 ORDER BY turn_number ASC`,
      [sessionId]
    );
    return result.rows;
  }

  async getLastTurnNumber(sessionId: string): Promise<number> {
    const result = await query<{ max: number | null }>(
      `SELECT MAX(turn_number) as max FROM session_turns WHERE session_id = $1`,
      [sessionId]
    );
    return result.rows[0]?.max ?? 0;
  }

  async countBySessionId(sessionId: string): Promise<number> {
    const result = await query<{ count: string }>(
      `SELECT COUNT(*) as count FROM session_turns WHERE session_id = $1`,
      [sessionId]
    );
    return parseInt(result.rows[0]?.count ?? '0', 10);
  }

  async countFlaggedSuspicious(sessionId: string): Promise<number> {
    const result = await query<{ count: string }>(
      `SELECT COUNT(*) as count FROM session_turns WHERE session_id = $1 AND flagged_suspicious = true`,
      [sessionId]
    );
    return parseInt(result.rows[0]?.count ?? '0', 10);
  }

  async getConversationHistory(sessionId: string): Promise<Array<{ role: string; content: string }>> {
    const turns = await this.findBySessionId(sessionId);
    const history: Array<{ role: string; content: string }> = [];

    for (const turn of turns) {
      history.push({ role: 'user', content: turn.player_input });
      history.push({ role: 'model', content: turn.ai_response });
    }

    return history;
  }
}
