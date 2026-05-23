export interface ScoringInput {
  verdictCorrect: boolean;
  cluesFound: number;
  totalClues: number;
  toolsUsed: number;
  turnsUsed: number;
  difficulty: 'easy' | 'medium' | 'hard';
  currentStreak: number;
}

export interface ScoringResult {
  totalScore: number;
  breakdown: Record<string, number>;
}

const DIFFICULTY_MULTIPLIER: Record<string, number> = {
  easy: 1.0,
  medium: 1.5,
  hard: 2.0,
};

const MAX_OPTIMAL_TURNS = 5;
const VERDICT_POINTS = 500;
const CLUE_POINTS = 50;
const TOOL_POINTS = 25;
const MAX_EFFICIENCY_BONUS = 100;
const MAX_STREAK_BONUS_PCT = 50;
const STREAK_BONUS_PER_DAY = 10;

export class ScoringService {
  calculate(input: ScoringInput): ScoringResult {
    const breakdown: Record<string, number> = {};

    // Verdict bonus
    const verdictScore = input.verdictCorrect ? VERDICT_POINTS : 0;
    breakdown['verdict'] = verdictScore;

    // Clue discovery bonus
    const clueScore = input.cluesFound * CLUE_POINTS;
    breakdown['clues'] = clueScore;

    // Tool usage bonus
    const toolScore = input.toolsUsed * TOOL_POINTS;
    breakdown['tools'] = toolScore;

    // Efficiency bonus (fewer turns = higher bonus)
    let efficiencyScore = 0;
    if (input.verdictCorrect && input.turnsUsed <= MAX_OPTIMAL_TURNS) {
      const ratio = Math.max(0, 1 - (input.turnsUsed - 1) / MAX_OPTIMAL_TURNS);
      efficiencyScore = Math.round(MAX_EFFICIENCY_BONUS * ratio);
    }
    breakdown['efficiency'] = efficiencyScore;

    // Base score before multipliers
    const baseScore = verdictScore + clueScore + toolScore + efficiencyScore;

    // Difficulty multiplier
    const multiplier = DIFFICULTY_MULTIPLIER[input.difficulty] ?? 1.0;
    const afterDifficulty = Math.round(baseScore * multiplier);
    breakdown['difficultyMultiplier'] = multiplier;

    // Streak bonus
    const streakBonusPct = Math.min(
      input.currentStreak * STREAK_BONUS_PER_DAY,
      MAX_STREAK_BONUS_PCT
    );
    const streakBonus = Math.round(afterDifficulty * (streakBonusPct / 100));
    breakdown['streakBonus'] = streakBonus;

    const totalScore = afterDifficulty + streakBonus;
    breakdown['total'] = totalScore;

    return {
      totalScore,
      breakdown,
    };
  }
}
