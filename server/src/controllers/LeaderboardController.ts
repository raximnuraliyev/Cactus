import type { Request, Response, NextFunction } from 'express';
import { LeaderboardService } from '../services/LeaderboardService.js';

const leaderboardService = new LeaderboardService();

export class LeaderboardController {
  static async getWeekly(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await leaderboardService.getWeeklyLeaderboard();

      res.json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getAllTime(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await leaderboardService.getAllTimeLeaderboard();

      res.json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
}
