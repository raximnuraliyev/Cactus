import { apiGet, apiPost } from "./client";

export interface AIScenario {
  title: string;
  category: string;
  timeLimit: number;
  difficulty: string;
  characterIntro: string;
  briefing: string;
  isRealCharacter: boolean;
  totalClues: number;
  clues: string[];
  tactic: string;
  initialGreeting: string;
}

export interface AIEvaluation {
  isCompromised: boolean;
  isGameOver: boolean;
  fraudsterReply: string;
  rewards: {
    awareness: number;
    intuition: number;
    speed: number;
    resilience: number;
  };
}

export function generateScenario(category: string, level: number) {
  return apiPost<{ data: { scenario: AIScenario } }>("/api/v1/ai/scenario", { category, level });
}

export function evaluateResponse(scenarioContext: string, chatHistory: any[], userResponse: string) {
  return apiPost<{ data: { evaluation: AIEvaluation } }>("/api/v1/ai/evaluate", { scenarioContext, chatHistory, userResponse });
}
