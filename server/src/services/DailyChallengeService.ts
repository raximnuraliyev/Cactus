import { DailyChallengeRepository } from '../repositories/DailyChallengeRepository.js';
import { ScenarioRepository } from '../repositories/ScenarioRepository.js';
import { GameService } from './GameService.js';
import { NotFoundError } from '../middleware/errorHandler.js';

export class DailyChallengeService {
  private dailyRepo = new DailyChallengeRepository();
  private scenarioRepo = new ScenarioRepository();
  private gameService = new GameService();

  async getTodaysChallenge(userId?: string) {
    const today = new Date().toISOString().split('T')[0]!;
    let challenge = await this.dailyRepo.findByDate(today);

    if (!challenge) {
      // Auto-create today's challenge
      const template = await this.scenarioRepo.findRandomForDaily();
      if (!template) throw new NotFoundError('No scenarios available for daily challenge');
      challenge = await this.dailyRepo.create(today, template.id);
    }

    const template = await this.scenarioRepo.findById(challenge.template_id);
    if (!template) throw new NotFoundError('Scenario template');

    let hasCompleted = false;
    if (userId) {
      hasCompleted = await this.dailyRepo.hasUserCompleted(userId, today);
    }

    return {
      challengeDate: challenge.challenge_date,
      templateId: challenge.template_id,
      title: template.title,
      category: template.category,
      difficulty: template.difficulty,
      briefing: template.briefing_text,
      totalCompletions: challenge.total_completions,
      avgScore: Number(challenge.avg_score),
      hasCompleted,
    };
  }

  async startDailyChallenge(userId: string, language: string) {
    const today = new Date().toISOString().split('T')[0]!;
    const hasCompleted = await this.dailyRepo.hasUserCompleted(userId, today);

    if (hasCompleted) {
      throw new NotFoundError('You have already completed today\'s daily challenge');
    }

    let challenge = await this.dailyRepo.findByDate(today);
    if (!challenge) {
      const template = await this.scenarioRepo.findRandomForDaily();
      if (!template) throw new NotFoundError('No scenarios available');
      challenge = await this.dailyRepo.create(today, template.id);
    }

    return this.gameService.startGame({
      userId,
      isDailyChallenge: true,
      dailyTemplateId: challenge.template_id,
      language,
    });
  }

  async recordDailyCompletion(userId: string, score: number): Promise<void> {
    const today = new Date().toISOString().split('T')[0]!;
    await this.dailyRepo.recordCompletion(userId, today);
    await this.dailyRepo.incrementCompletion(today, score);
  }

  async ensureTodaysChallengeExists(): Promise<void> {
    const today = new Date().toISOString().split('T')[0]!;
    const existing = await this.dailyRepo.findByDate(today);
    if (!existing) {
      const template = await this.scenarioRepo.findRandomForDaily();
      if (template) {
        await this.dailyRepo.create(today, template.id);
        console.log(`[DailyChallenge] Created challenge for ${today}`);
      }
    }
  }
}
