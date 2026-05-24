import { GameSessionRepository } from '../repositories/GameSessionRepository.js';
import { SessionTurnRepository } from '../repositories/SessionTurnRepository.js';
import { ScenarioRepository } from '../repositories/ScenarioRepository.js';
import { UserStatsRepository } from '../repositories/UserStatsRepository.js';
import { AIService } from './ai.service.js';
import { ScoringService } from './ScoringService.js';
import { BadgeService } from './BadgeService.js';
import { AIPromptFactory } from '../factories/AIPromptFactory.js';
import { AppError, NotFoundError } from '../middleware/errorHandler.js';
import { cacheGet, cacheSet, cacheDel } from '../config/redis.js';

export interface StartGameInput {
  userId?: string;
  category?: string;
  difficulty?: string;
  isDailyChallenge?: boolean;
  dailyTemplateId?: string;
  language?: string;
}

export interface TurnInput {
  sessionId: string;
  inputType: 'choice' | 'text' | 'tool';
  playerInput: string;
  language?: string;
}

export interface VerdictInput {
  sessionId: string;
  verdict: 'real' | 'fake';
  userId?: string;
  language?: string;
}

export class GameService {
  private sessionRepo = new GameSessionRepository();
  private turnRepo = new SessionTurnRepository();
  private scenarioRepo = new ScenarioRepository();
  private statsRepo = new UserStatsRepository();
  private aiService = new AIService();
  private scoringService = new ScoringService();
  private badgeService = new BadgeService();

  async startGame(input: StartGameInput) {
    let template;

    if (input.dailyTemplateId) {
      template = await this.scenarioRepo.findById(input.dailyTemplateId);
    } else {
      template = await this.scenarioRepo.findRandom(input.category, input.difficulty);
    }

    if (!template) {
      throw new NotFoundError('No matching scenario found');
    }

    const clues = Array.isArray(template.clues) ? template.clues : JSON.parse(template.clues as any);

    const session = await this.sessionRepo.create({
      user_id: input.userId ?? null,
      scenario_template_id: template.id,
      scenario_type: template.category,
      difficulty: template.difficulty,
      is_real_character: template.is_real_character,
      clues_total: clues.length,
      is_daily_challenge: input.isDailyChallenge ?? false,
    });

    // Cache the system prompt and scenario data for the session
    const sessionData = {
      systemPrompt: template.system_prompt,
      isRealCharacter: template.is_real_character,
      clues,
      tacticsUsed: template.tactics_used,
      title: template.title,
      difficulty: template.difficulty,
    };
    await cacheSet(`session:${session.id}`, sessionData, 3600);

    const initialChoices = Array.isArray(template.initial_choices)
      ? template.initial_choices
      : JSON.parse(template.initial_choices as any);

    return {
      sessionId: session.id,
      scenarioType: template.category,
      difficulty: template.difficulty,
      title: template.title,
      briefing: template.briefing_text,
      characterIntro: template.character_intro,
      templateId: template.id,
      initialChoices,
      cluesTotal: clues.length,
    };
  }

  async submitTurn(input: TurnInput) {
    const session = await this.sessionRepo.findById(input.sessionId);
    if (!session) throw new NotFoundError('Game session');
    if (session.status !== 'active') {
      throw new AppError('This game session is no longer active', 400, 'SESSION_INACTIVE');
    }

    // Get cached scenario data
    let sessionData = await cacheGet<{
      systemPrompt: string;
      isRealCharacter: boolean;
      clues: string[];
      tacticsUsed: string[];
      title: string;
      difficulty: string;
    }>(`session:${input.sessionId}`);

    if (!sessionData) {
      // Rebuild from DB if cache expired
      const template = await this.scenarioRepo.findById(session.scenario_template_id);
      if (!template) throw new NotFoundError('Scenario template');

      const clues = Array.isArray(template.clues) ? template.clues : JSON.parse(template.clues as any);
      const tacticsUsed = Array.isArray(template.tactics_used) ? template.tactics_used : JSON.parse(template.tactics_used as any);

      sessionData = {
        systemPrompt: template.system_prompt,
        isRealCharacter: template.is_real_character,
        clues,
        tacticsUsed,
        title: template.title,
        difficulty: template.difficulty,
      };
      await cacheSet(`session:${input.sessionId}`, sessionData, 3600);
    }

    // Get conversation history
    const history = await this.turnRepo.getConversationHistory(input.sessionId);
    const turnNumber = (await this.turnRepo.getLastTurnNumber(input.sessionId)) + 1;

    // Build prompt and get AI response
    const language = input.language ?? 'en';
    const aiResponse = await this.aiService.generateResponse(
      sessionData.systemPrompt,
      history,
      input.playerInput,
      language
    );

    // Track if tool was used
    if (input.inputType === 'tool') {
      await this.sessionRepo.addToolUsed(input.sessionId, input.playerInput);
    }

    // Update clues found
    if (aiResponse.clueRevealed) {
      await this.sessionRepo.updateCluesFound(
        input.sessionId,
        Math.min(session.clues_found + 1, session.clues_total)
      );
    }

    // Save the turn
    const turn = await this.turnRepo.create({
      session_id: input.sessionId,
      turn_number: turnNumber,
      input_type: input.inputType,
      player_input: input.playerInput,
      ai_response: JSON.stringify(aiResponse),
      flagged_suspicious: aiResponse.clueRevealed,
    });

    return {
      turnNumber,
      response: aiResponse.response,
      suggestedChoices: aiResponse.suggestedChoices,
      clueRevealed: aiResponse.clueRevealed,
      cluesFound: session.clues_found + (aiResponse.clueRevealed ? 1 : 0),
      cluesTotal: session.clues_total,
      canEnd: turnNumber >= 3,
    };
  }

  async submitVerdict(input: VerdictInput) {
    const session = await this.sessionRepo.findById(input.sessionId);
    if (!session) throw new NotFoundError('Game session');
    if (session.status !== 'active') {
      throw new AppError('This game session is no longer active', 400, 'SESSION_INACTIVE');
    }

    const verdictCorrect =
      (input.verdict === 'fake' && !session.is_real_character) ||
      (input.verdict === 'real' && session.is_real_character);

    // Get session data for scoring
    let sessionData = await cacheGet<{
      systemPrompt: string;
      isRealCharacter: boolean;
      clues: string[];
      tacticsUsed: string[];
      title: string;
      difficulty: string;
    }>(`session:${input.sessionId}`);

    if (!sessionData) {
      const template = await this.scenarioRepo.findById(session.scenario_template_id);
      if (!template) throw new NotFoundError('Scenario template');
      const clues = Array.isArray(template.clues) ? template.clues : JSON.parse(template.clues as any);
      const tacticsUsed = Array.isArray(template.tactics_used) ? template.tactics_used : JSON.parse(template.tactics_used as any);
      sessionData = {
        systemPrompt: template.system_prompt,
        isRealCharacter: template.is_real_character,
        clues,
        tacticsUsed,
        title: template.title,
        difficulty: template.difficulty,
      };
    }

    // Calculate score
    const turnCount = await this.turnRepo.countBySessionId(input.sessionId);
    const toolsUsed = Array.isArray(session.tools_used)
      ? session.tools_used
      : JSON.parse(session.tools_used as any);

    const scoring = this.scoringService.calculate({
      verdictCorrect,
      cluesFound: session.clues_found,
      totalClues: session.clues_total,
      toolsUsed: toolsUsed.length,
      turnsUsed: turnCount,
      difficulty: session.difficulty as 'easy' | 'medium' | 'hard',
      currentStreak: 0,
    });

    // Get user streak for bonus
    if (input.userId) {
      const stats = await this.statsRepo.findByUserId(input.userId);
      if (stats) {
        const streakScoring = this.scoringService.calculate({
          verdictCorrect,
          cluesFound: session.clues_found,
          totalClues: session.clues_total,
          toolsUsed: toolsUsed.length,
          turnsUsed: turnCount,
          difficulty: session.difficulty as 'easy' | 'medium' | 'hard',
          currentStreak: stats.current_streak,
        });
        Object.assign(scoring, streakScoring);
      }
    }

    // Generate debrief
    const language = input.language ?? 'en';
    const debrief = await this.aiService.generateDebrief(
      sessionData.title,
      sessionData.isRealCharacter,
      input.verdict,
      verdictCorrect,
      session.clues_found,
      session.clues_total,
      sessionData.tacticsUsed,
      language
    );

    // Update session with verdict
    const updatedSession = await this.sessionRepo.updateVerdict(
      input.sessionId,
      input.verdict,
      verdictCorrect,
      scoring.totalScore,
      scoring.breakdown,
      session.clues_found,
      toolsUsed,
      debrief
    );

    // Update user stats if authenticated
    if (input.userId) {
      await this.statsRepo.recordGameResult(
        input.userId,
        verdictCorrect,
        scoring.totalScore
      );

      // Check badges
      await this.badgeService.checkAndAwardBadges(input.userId, {
        gameCompleted: true,
        verdictCorrect,
        category: session.scenario_type,
        turnsUsed: turnCount,
        cluesFound: session.clues_found,
      });
    }

    // Clean up cache
    await cacheDel(`session:${input.sessionId}`);

    return {
      verdictCorrect,
      isRealCharacter: session.is_real_character,
      score: scoring.totalScore,
      scoreBreakdown: scoring.breakdown,
      cluesFound: session.clues_found,
      cluesTotal: session.clues_total,
      debrief,
      xpEarned: scoring.totalScore,
    };
  }

  async getSessionState(sessionId: string) {
    const session = await this.sessionRepo.findById(sessionId);
    if (!session) throw new NotFoundError('Game session');

    const turns = await this.turnRepo.findBySessionId(sessionId);

    const parsedTurns = turns.map((t) => {
      let aiResponse;
      try {
        aiResponse = JSON.parse(t.ai_response);
      } catch {
        aiResponse = { response: t.ai_response, suggestedChoices: [], clueRevealed: false };
      }
      return {
        turnNumber: t.turn_number,
        inputType: t.input_type,
        playerInput: t.player_input,
        aiResponse,
        flaggedSuspicious: t.flagged_suspicious,
        createdAt: t.created_at,
      };
    });

    return {
      session: {
        id: session.id,
        scenarioType: session.scenario_type,
        difficulty: session.difficulty,
        status: session.status,
        cluesFound: session.clues_found,
        cluesTotal: session.clues_total,
        startedAt: session.started_at,
        completedAt: session.completed_at,
        verdictGiven: session.verdict_given,
        verdictCorrect: session.verdict_correct,
        scoreTotal: session.score_total,
        debrief: session.debrief_text,
      },
      turns: parsedTurns,
    };
  }

  async getHistory(userId: string, page: number, limit: number) {
    const offset = (page - 1) * limit;
    const [sessions, total] = await Promise.all([
      this.sessionRepo.findUserHistory(userId, limit, offset),
      this.sessionRepo.countUserGames(userId),
    ]);

    return {
      sessions: sessions.map((s) => ({
        id: s.id,
        scenarioType: s.scenario_type,
        difficulty: s.difficulty,
        verdictGiven: s.verdict_given,
        verdictCorrect: s.verdict_correct,
        scoreTotal: s.score_total,
        cluesFound: s.clues_found,
        cluesTotal: s.clues_total,
        isDailyChallenge: s.is_daily_challenge,
        startedAt: s.started_at,
        completedAt: s.completed_at,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
