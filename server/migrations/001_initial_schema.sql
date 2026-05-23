-- 001_initial_schema.sql
-- Enums
DO $$ BEGIN
  CREATE TYPE user_language AS ENUM ('en', 'ru', 'uz');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('guest', 'player', 'org_admin', 'super_admin');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE scenario_type AS ENUM ('phishing', 'phone_call', 'transaction', 'document');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE difficulty_level AS ENUM ('easy', 'medium', 'hard');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE session_status AS ENUM ('active', 'completed', 'abandoned');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE input_type AS ENUM ('choice', 'text', 'tool');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(32) NOT NULL,
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255),
  telegram_id BIGINT UNIQUE,
  avatar_url VARCHAR(512),
  language user_language NOT NULL DEFAULT 'en',
  role user_role NOT NULL DEFAULT 'player',
  is_private BOOLEAN NOT NULL DEFAULT false,
  notify_daily BOOLEAN NOT NULL DEFAULT true,
  email_verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  CONSTRAINT users_auth_check CHECK (email IS NOT NULL OR telegram_id IS NOT NULL)
);

-- user_stats (1:1 with users)
CREATE TABLE IF NOT EXISTS user_stats (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  total_xp INTEGER NOT NULL DEFAULT 0 CHECK (total_xp >= 0),
  current_level SMALLINT NOT NULL DEFAULT 1 CHECK (current_level BETWEEN 1 AND 7),
  total_games INTEGER NOT NULL DEFAULT 0,
  correct_verdicts INTEGER NOT NULL DEFAULT 0,
  accuracy_pct NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (accuracy_pct BETWEEN 0 AND 100),
  current_streak SMALLINT NOT NULL DEFAULT 0,
  best_streak SMALLINT NOT NULL DEFAULT 0,
  last_played_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- scenario_templates
CREATE TABLE IF NOT EXISTS scenario_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category scenario_type NOT NULL,
  difficulty difficulty_level NOT NULL,
  title VARCHAR(255) NOT NULL,
  briefing_text TEXT NOT NULL,
  character_intro VARCHAR(512) NOT NULL,
  is_real_character BOOLEAN NOT NULL,
  system_prompt TEXT NOT NULL,
  clues JSONB NOT NULL DEFAULT '[]',
  tactics_used JSONB NOT NULL DEFAULT '[]',
  initial_choices JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- game_sessions
CREATE TABLE IF NOT EXISTS game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  scenario_template_id UUID NOT NULL REFERENCES scenario_templates(id),
  scenario_type scenario_type NOT NULL,
  difficulty difficulty_level NOT NULL,
  is_real_character BOOLEAN NOT NULL,
  verdict_given VARCHAR(20),
  verdict_correct BOOLEAN,
  score_total INTEGER NOT NULL DEFAULT 0 CHECK (score_total >= 0),
  score_breakdown JSONB NOT NULL DEFAULT '{}',
  clues_found SMALLINT NOT NULL DEFAULT 0,
  clues_total SMALLINT NOT NULL,
  tools_used JSONB NOT NULL DEFAULT '[]',
  debrief_text TEXT,
  status session_status NOT NULL DEFAULT 'active',
  is_daily_challenge BOOLEAN NOT NULL DEFAULT false,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- session_turns
CREATE TABLE IF NOT EXISTS session_turns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
  turn_number SMALLINT NOT NULL,
  input_type input_type NOT NULL,
  player_input TEXT NOT NULL,
  ai_response TEXT NOT NULL,
  flagged_suspicious BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(session_id, turn_number)
);

-- badges
CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT NOT NULL,
  icon_url VARCHAR(512),
  category VARCHAR(50) NOT NULL,
  trigger_condition JSONB NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0
);

-- user_badges (M:N junction)
CREATE TABLE IF NOT EXISTS user_badges (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, badge_id)
);

-- daily_challenges
CREATE TABLE IF NOT EXISTS daily_challenges (
  challenge_date DATE PRIMARY KEY,
  template_id UUID NOT NULL REFERENCES scenario_templates(id),
  total_completions INTEGER NOT NULL DEFAULT 0,
  avg_score NUMERIC(10,2) NOT NULL DEFAULT 0
);

-- daily_completions
CREATE TABLE IF NOT EXISTS daily_completions (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  challenge_date DATE NOT NULL REFERENCES daily_challenges(challenge_date),
  PRIMARY KEY (user_id, challenge_date)
);

-- refresh_tokens
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked BOOLEAN NOT NULL DEFAULT false
);
