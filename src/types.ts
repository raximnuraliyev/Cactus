export type ScenarioType = "phishing" | "phone_call" | "transaction" | "document";

export type DifficultyLevel = "easy" | "medium" | "hard";

export type GameStatus = "briefing" | "playing" | "evidence" | "verdict" | "debrief";

export interface UserStats {
  totalXp: number;
  currentLevel: number;
  totalGames: number;
  correctVerdicts: number;
  accuracyPct: number;
  currentStreak: number;
  bestStreak: number;
  elo: number;
  placementGamesPlayed: number;
}

export interface User {
  id: string;
  username: string;
  avatarUrl?: string;
  language: "en" | "ru" | "uz";
  stats: UserStats;
}

export interface Turn {
  turnNumber: number;
  inputType: "choice" | "text" | "tool";
  playerInput: string;
  aiResponse: string;
  flaggedSuspicious?: boolean;
  timestamp: string;
}

export interface ScenarioTemplate {
  id: string;
  type: ScenarioType;
  title: string;
  difficulty: DifficultyLevel;
  briefing: string;
  characterIntro: string;
  isRealCharacter: boolean;
  totalClues: number;
  clues: string[]; // List of clues present
  tactic: string; // Manipulation tactic e.g. "Authority combined with Urgency"
  initialChoices: string[];
  stages: {
    question: string;
    choices: string[];
    responses: {
      isReal: string;
      isFake: string;
      clueReveal?: string;
    };
  }[];
}

export interface GameSession {
  id: string;
  template: ScenarioTemplate;
  status: GameStatus;
  currentTurn: number;
  turns: Turn[];
  toolsUsed: string[];
  cluesFound: string[];
  verdictGiven?: "real_employee" | "fraudster";
  verdictCorrect?: boolean;
  scoreTotal: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  earned: boolean;
  progress: number; // e.g. 7 for "7/10"
  totalRequired: number;
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  level: number;
  score: number;
  accuracy: number;
  isMe?: boolean;
}

export interface PlacementAnswer {
  question: string;
  answer: string;
  eloModifier: number;
}

export interface TournamentLobby {
  id: string;
  hostUsername: string;
  players: string[];
  maxPlayers: number;
  status: 'waiting' | 'active' | 'completed';
  phase?: number;
  roles?: Record<string, string>;
  messages?: Array<{ id: number; type: 'system' | 'user'; sender?: string; content: string; time: string }>;
  tasks?: Array<{ id: number; title: string; rewardXP: number; completedBy: string[] }>;
  xp?: Record<string, number>;
  startTime?: number;
  endTime?: number;
  winner?: 'Bank Staff' | 'Fraudster';
}

export interface PostGameBreakdown {
  correctVerdict: number;
  cluesFound: number;
  toolsUsed: number;
  speedBonus: number;
  fraudTypeGuessed: number;
  dailyChallengeBonus: number;
  streakBonus: number;
  hintPenalty: number;
  totalXp: number;
  oldElo: number;
  newElo: number;
}

/* ─── API Response Types ─────────────────────────────── */

export interface AuthResponse {
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
}

export interface GameStartResponse {
  data: {
    sessionId: string;
    briefing: string;
    characterIntro: string;
    templateId?: string;
    initialChoices: string[];
    scenarioType: ScenarioType;
    difficulty: DifficultyLevel;
    uiMode: string;
    cluesTotal: number;
  };
}

export interface TurnResponse {
  data: {
    response: string;
    turnNumber: number;
    canEnd: boolean;
    choices: string[];
    clueRevealed?: string;
  };
}

export interface VerdictResponse {
  data: {
    correct: boolean;
    scoreBreakdown: {
      base: number;
      clueBonus: number;
      streakMultiplier: number;
      total: number;
    };
    totalXp: number;
    debriefText: string;
    cluesFound: string[];
    cluesMissed: string[];
    tactic: string;
    badgesEarned: Badge[];
  };
}

export interface DailyChallengeResponse {
  data: {
    challengeDate: string;
    scenarioType: ScenarioType;
    completed: boolean;
    streakCount: number;
  };
}

/* ─── Active Game Session (client-side state) ────────── */

export interface ActiveGameSession {
  sessionId: string;
  briefing: string;
  characterIntro: string;
  templateId?: string;
  scenarioType: ScenarioType;
  difficulty: DifficultyLevel;
  initialChoices: string[];
  cluesTotal: number;
  turns: Turn[];
  cluesFound: string[];
  toolsUsed: string[];
  canEnd: boolean;
  currentChoices: string[];
}
