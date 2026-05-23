import { query } from '../config/database.js';

export interface RefreshToken {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: Date;
  created_at: Date;
  revoked: boolean;
}

export class RefreshTokenRepository {
  async create(userId: string, tokenHash: string, expiresAt: Date): Promise<RefreshToken> {
    const result = await query<RefreshToken>(
      `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [userId, tokenHash, expiresAt]
    );
    return result.rows[0]!;
  }

  async findByHash(tokenHash: string): Promise<RefreshToken | null> {
    const result = await query<RefreshToken>(
      `SELECT * FROM refresh_tokens
       WHERE token_hash = $1 AND revoked = false AND expires_at > now()`,
      [tokenHash]
    );
    return result.rows[0] ?? null;
  }

  async revoke(id: string): Promise<void> {
    await query(
      `UPDATE refresh_tokens SET revoked = true WHERE id = $1`,
      [id]
    );
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await query(
      `UPDATE refresh_tokens SET revoked = true WHERE user_id = $1`,
      [userId]
    );
  }

  async deleteExpired(): Promise<number> {
    const result = await query(
      `DELETE FROM refresh_tokens WHERE expires_at < now() OR revoked = true`
    );
    return result.rowCount ?? 0;
  }
}
