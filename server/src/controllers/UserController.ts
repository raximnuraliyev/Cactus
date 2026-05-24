import type { Request, Response, NextFunction } from 'express';
import { UserRepository } from '../repositories/UserRepository.js';
import { UserStatsRepository } from '../repositories/UserStatsRepository.js';
import { BadgeService } from '../services/BadgeService.js';
import { LeaderboardRepository } from '../repositories/LeaderboardRepository.js';
import { NotFoundError } from '../middleware/errorHandler.js';

const userRepo = new UserRepository();
const statsRepo = new UserStatsRepository();
const badgeService = new BadgeService();
const leaderboardRepo = new LeaderboardRepository();

export class UserController {
  static async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const user = await userRepo.findById(userId);

      if (!user) throw new NotFoundError('User');

      const stats = await statsRepo.findByUserId(userId);
      const rank = await leaderboardRepo.getUserRank(userId);

      const { password_hash, deleted_at, ...safeUser } = user;

      res.json({
        success: true,
        data: {
          user: safeUser,
          stats: stats
            ? {
                totalXp: stats.total_xp,
                currentLevel: stats.current_level,
                totalGames: stats.total_games,
                correctVerdicts: stats.correct_verdicts,
                accuracyPct: Number(stats.accuracy_pct),
                currentStreak: stats.current_streak,
                bestStreak: stats.best_streak,
                lastPlayedAt: stats.last_played_at,
                elo: stats.elo,
                awareness: stats.awareness,
                intuition: stats.intuition,
                speed: stats.speed,
                resilience: stats.resilience,
                placementGamesPlayed: stats.placement_games_played,
              }
            : null,
          rank,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  static async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { username, avatarUrl, language, isPrivate, notifyDaily, stats } = req.body;

      const updated = await userRepo.update(userId, {
        username,
        avatar_url: avatarUrl,
        language,
        is_private: isPrivate,
        notify_daily: notifyDaily,
      });

      if (!updated) throw new NotFoundError('User');
      
      let updatedStats = null;
      if (stats) {
        updatedStats = await statsRepo.updateStats(userId, {
          elo: stats.elo,
          awareness: stats.awareness,
          intuition: stats.intuition,
          speed: stats.speed,
          resilience: stats.resilience,
          placement_games_played: stats.placement_games_played
        });
      }

      const { password_hash, deleted_at, ...safeUser } = updated;

      res.json({
        success: true,
        data: { 
          user: safeUser,
          stats: updatedStats ? {
            totalXp: updatedStats.total_xp,
            currentLevel: updatedStats.current_level,
            totalGames: updatedStats.total_games,
            correctVerdicts: updatedStats.correct_verdicts,
            accuracyPct: Number(updatedStats.accuracy_pct),
            currentStreak: updatedStats.current_streak,
            bestStreak: updatedStats.best_streak,
            lastPlayedAt: updatedStats.last_played_at,
            elo: updatedStats.elo,
            awareness: updatedStats.awareness,
            intuition: updatedStats.intuition,
            speed: updatedStats.speed,
            resilience: updatedStats.resilience,
            placementGamesPlayed: updatedStats.placement_games_played,
          } : undefined
        },
      });
    } catch (err) {
      next(err);
    }
  }

  static async getBadges(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const badges = await badgeService.getUserBadges(userId);

      res.json({
        success: true,
        data: { badges },
      });
    } catch (err) {
      next(err);
    }
  }
}
