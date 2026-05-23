import { BadgeRepository } from '../repositories/BadgeRepository.js';
import { UserStatsRepository } from '../repositories/UserStatsRepository.js';
import { GameSessionRepository } from '../repositories/GameSessionRepository.js';
import { DailyChallengeRepository } from '../repositories/DailyChallengeRepository.js';

export interface BadgeCheckContext {
  gameCompleted: boolean;
  verdictCorrect: boolean;
  category: string;
  turnsUsed: number;
  cluesFound: number;
}

export class BadgeService {
  private badgeRepo = new BadgeRepository();
  private statsRepo = new UserStatsRepository();
  private sessionRepo = new GameSessionRepository();
  private dailyRepo = new DailyChallengeRepository();

  async checkAndAwardBadges(
    userId: string,
    context: BadgeCheckContext
  ): Promise<string[]> {
    const awarded: string[] = [];
    const badges = await this.badgeRepo.findAll();
    const stats = await this.statsRepo.findByUserId(userId);

    if (!stats) return awarded;

    for (const badge of badges) {
      const alreadyHas = await this.badgeRepo.hasBadge(userId, badge.id);
      if (alreadyHas) continue;

      const condition = badge.trigger_condition as Record<string, any>;
      let earned = false;

      switch (condition.type) {
        case 'games_completed':
          earned = stats.total_games >= (condition.threshold as number);
          break;

        case 'accuracy_above':
          earned =
            stats.total_games >= (condition.min_games as number) &&
            Number(stats.accuracy_pct) >= (condition.threshold as number);
          break;

        case 'streak_reached':
          earned = stats.current_streak >= (condition.threshold as number) ||
                   stats.best_streak >= (condition.threshold as number);
          break;

        case 'category_correct': {
          if (context.verdictCorrect && context.category === condition.category) {
            const count = await this.sessionRepo.getUserCategoryCorrectCount(
              userId,
              condition.category as string
            );
            earned = count >= (condition.threshold as number);
          }
          break;
        }

        case 'daily_completed': {
          const dailyCount = await this.dailyRepo.getUserDailyCompletionCount(userId);
          earned = dailyCount >= (condition.threshold as number);
          break;
        }

        case 'clues_found':
          // Approximate check: we use the cumulative clues stat
          // In a production system, we'd track total_clues_found in user_stats
          earned = context.cluesFound > 0 && stats.total_games * 2 >= (condition.threshold as number);
          break;

        case 'speed_complete':
          earned =
            context.verdictCorrect &&
            context.turnsUsed <= (condition.max_turns as number);
          break;

        case 'xp_reached':
          earned = stats.total_xp >= (condition.threshold as number);
          break;

        default:
          break;
      }

      if (earned) {
        const success = await this.badgeRepo.awardBadge(userId, badge.id);
        if (success) {
          awarded.push(badge.name);
        }
      }
    }

    return awarded;
  }

  async getUserBadges(userId: string) {
    const badges = await this.badgeRepo.getUserBadges(userId);
    const stats = await this.statsRepo.findByUserId(userId);

    return badges.map((badge) => {
      const condition = badge.trigger_condition as Record<string, any>;
      let progress = 0;

      if (stats) {
        switch (condition.type) {
          case 'games_completed':
            progress = Math.min(100, (stats.total_games / (condition.threshold as number)) * 100);
            break;
          case 'accuracy_above':
            progress = Math.min(100, (Number(stats.accuracy_pct) / (condition.threshold as number)) * 100);
            break;
          case 'streak_reached':
            progress = Math.min(
              100,
              (Math.max(stats.current_streak, stats.best_streak) / (condition.threshold as number)) * 100
            );
            break;
          case 'xp_reached':
            progress = Math.min(100, (stats.total_xp / (condition.threshold as number)) * 100);
            break;
          default:
            progress = badge.earned_at ? 100 : 0;
        }
      }

      return {
        id: badge.id,
        name: badge.name,
        description: badge.description,
        iconUrl: badge.icon_url,
        category: badge.category,
        displayOrder: badge.display_order,
        earned: badge.earned_at !== null,
        earnedAt: badge.earned_at,
        progress: Math.round(progress),
      };
    });
  }
}
