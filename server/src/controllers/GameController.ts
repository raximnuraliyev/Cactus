import type { Request, Response, NextFunction } from 'express';
import { GameService } from '../services/GameService.js';
import { DailyChallengeService } from '../services/DailyChallengeService.js';

const gameService = new GameService();
const dailyChallengeService = new DailyChallengeService();

export class GameController {
  static async startGame(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { category, difficulty } = req.body;
      const userId = req.user?.userId;
      const language = req.user?.language ?? req.body.language ?? 'en';

      const result = await gameService.startGame({
        userId,
        category: category as string,
        difficulty: difficulty as string,
        language: language as string,
      });

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  static async submitTurn(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { inputType, input, playerInput } = req.body;
      const language = req.user?.language ?? req.body.language ?? 'en';

      const result = await gameService.submitTurn({
        sessionId: id as string,
        inputType: inputType as 'choice' | 'text' | 'tool',
        playerInput: (playerInput || input || '') as string,
        language: language as string,
      });

      res.json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  static async submitVerdict(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { verdict } = req.body;
      const userId = req.user?.userId;
      const language = req.user?.language ?? req.body.language ?? 'en';

      const result = await gameService.submitVerdict({
        sessionId: id as string,
        verdict: verdict as any,
        userId,
        language: language as string,
      });

      // If daily challenge, record completion
      if (userId) {
        try {
          const sessionState = await gameService.getSessionState(id as string);
          if (sessionState.session.completedAt) {
            await dailyChallengeService.recordDailyCompletion(userId, result.score);
          }
        } catch {
          // Non-critical, don't fail the verdict
        }
      }

      res.json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getSession(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const result = await gameService.getSessionState(id as string);

      res.json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getDailyChallenge(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      const result = await dailyChallengeService.getTodaysChallenge(userId);

      res.json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);

      const result = await gameService.getHistory(userId, page, limit);

      res.json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
}
