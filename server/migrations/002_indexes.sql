-- 002_indexes.sql

-- users: find by email for login (only non-deleted)
CREATE INDEX IF NOT EXISTS idx_users_email_active
  ON users(email) WHERE deleted_at IS NULL;

-- users: find by telegram_id for Telegram login
CREATE INDEX IF NOT EXISTS idx_users_telegram_id
  ON users(telegram_id) WHERE telegram_id IS NOT NULL;

-- game_sessions: user's completed games ordered by recency
CREATE INDEX IF NOT EXISTS idx_game_sessions_user_completed
  ON game_sessions(user_id, started_at DESC) WHERE status = 'completed';

-- game_sessions: global leaderboard by score
CREATE INDEX IF NOT EXISTS idx_game_sessions_leaderboard
  ON game_sessions(score_total DESC, completed_at DESC) WHERE status = 'completed';

-- game_sessions: user's daily challenge history
CREATE INDEX IF NOT EXISTS idx_game_sessions_user_daily
  ON game_sessions(user_id, is_daily_challenge, started_at DESC);

-- session_turns: ordered turns within a session
CREATE INDEX IF NOT EXISTS idx_session_turns_session_order
  ON session_turns(session_id, turn_number ASC);

-- user_stats: leaderboard by XP and accuracy
CREATE INDEX IF NOT EXISTS idx_user_stats_leaderboard
  ON user_stats(total_xp DESC, accuracy_pct DESC);

-- scenario_templates: filter active by category+difficulty
CREATE INDEX IF NOT EXISTS idx_scenario_templates_active
  ON scenario_templates(category, difficulty) WHERE is_active = TRUE;

-- user_badges: find all badges for a user
CREATE INDEX IF NOT EXISTS idx_user_badges_user
  ON user_badges(user_id, badge_id);

-- refresh_tokens: lookup by hash for non-revoked tokens
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_hash_active
  ON refresh_tokens(token_hash) WHERE revoked = FALSE;
