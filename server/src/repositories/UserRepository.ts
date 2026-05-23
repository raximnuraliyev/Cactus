import { query, getClient } from '../config/database.js';
import type pg from 'pg';

export interface User {
  id: string;
  username: string;
  email: string | null;
  password_hash: string | null;
  telegram_id: number | null;
  avatar_url: string | null;
  language: 'en' | 'ru' | 'uz';
  role: 'guest' | 'player' | 'org_admin' | 'super_admin';
  is_private: boolean;
  notify_daily: boolean;
  email_verified: boolean;
  created_at: Date;
  deleted_at: Date | null;
}

export interface CreateUserInput {
  username: string;
  email?: string;
  password_hash?: string;
  telegram_id?: number;
  avatar_url?: string;
  language?: 'en' | 'ru' | 'uz';
  role?: 'guest' | 'player' | 'org_admin' | 'super_admin';
}

export interface UpdateUserInput {
  username?: string;
  avatar_url?: string;
  language?: 'en' | 'ru' | 'uz';
  is_private?: boolean;
  notify_daily?: boolean;
}

export class UserRepository {
  async findById(id: string): Promise<User | null> {
    const result = await query<User>(
      `SELECT * FROM users WHERE id = $1 AND deleted_at IS NULL`,
      [id]
    );
    return result.rows[0] ?? null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await query<User>(
      `SELECT * FROM users WHERE email = $1 AND deleted_at IS NULL`,
      [email]
    );
    return result.rows[0] ?? null;
  }

  async findByTelegramId(telegramId: number): Promise<User | null> {
    const result = await query<User>(
      `SELECT * FROM users WHERE telegram_id = $1 AND deleted_at IS NULL`,
      [telegramId]
    );
    return result.rows[0] ?? null;
  }

  async create(input: CreateUserInput, client?: pg.PoolClient): Promise<User> {
    const text = `INSERT INTO users (username, email, password_hash, telegram_id, avatar_url, language, role)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`;
    const values = [
        input.username,
        input.email ?? null,
        input.password_hash ?? null,
        input.telegram_id ?? null,
        input.avatar_url ?? null,
        input.language ?? 'en',
        input.role ?? 'player',
      ];
      
    const result = client 
      ? await client.query<User>(text, values)
      : await query<User>(text, values);
      
    return result.rows[0]!;
  }

  async update(id: string, input: UpdateUserInput): Promise<User | null> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (input.username !== undefined) {
      fields.push(`username = $${paramIndex++}`);
      values.push(input.username);
    }
    if (input.avatar_url !== undefined) {
      fields.push(`avatar_url = $${paramIndex++}`);
      values.push(input.avatar_url);
    }
    if (input.language !== undefined) {
      fields.push(`language = $${paramIndex++}`);
      values.push(input.language);
    }
    if (input.is_private !== undefined) {
      fields.push(`is_private = $${paramIndex++}`);
      values.push(input.is_private);
    }
    if (input.notify_daily !== undefined) {
      fields.push(`notify_daily = $${paramIndex++}`);
      values.push(input.notify_daily);
    }

    if (fields.length === 0) return this.findById(id);

    values.push(id);

    const result = await query<User>(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramIndex} AND deleted_at IS NULL RETURNING *`,
      values
    );
    return result.rows[0] ?? null;
  }

  async softDelete(id: string): Promise<boolean> {
    const result = await query(
      `UPDATE users SET deleted_at = now() WHERE id = $1 AND deleted_at IS NULL`,
      [id]
    );
    return (result.rowCount ?? 0) > 0;
  }
}
