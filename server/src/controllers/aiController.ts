import type { Request, Response, NextFunction } from 'express';
import { AIService } from '../services/ai.service.js';
import { ValidationError } from '../middleware/errorHandler.js';

export class AIController {
  static async generateScenario(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { category, level } = req.body;
      if (!category) throw new ValidationError('Category is required');

      const userLevel = level || 1;
      const scenario = await AIService.generateTrainingScenario(category, userLevel);

      res.status(200).json({
        success: true,
        data: { scenario },
      });
    } catch (err) {
      next(err);
    }
  }

  static async evaluateResponse(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { scenarioContext, chatHistory, userResponse } = req.body;
      if (!scenarioContext || !chatHistory || !userResponse) {
        throw new ValidationError('scenarioContext, chatHistory, and userResponse are required');
      }

      const evaluation = await AIService.evaluateTrainingResponse(scenarioContext, chatHistory, userResponse);

      // We could also save XP to the user's DB profile here
      // For now, we just return the evaluation so the frontend can display it

      res.status(200).json({
        success: true,
        data: { evaluation },
      });
    } catch (err) {
      next(err);
    }
  }
}
