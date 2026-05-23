import { apiGet, apiPost } from "./client";
import type {
  GameStartResponse,
  TurnResponse,
  VerdictResponse,
  DailyChallengeResponse,
  ScenarioType,
  DifficultyLevel,
} from "../types";

export function startGame(category?: ScenarioType, difficulty?: DifficultyLevel) {
  const lang = localStorage.getItem("rf_lang") || "en";
  return apiPost<GameStartResponse>("/api/v1/game/start", {
    category,
    difficulty,
    language: lang,
  });
}

export function submitTurn(
  sessionId: string,
  inputType: "choice" | "text" | "tool",
  input: string
) {
  const lang = localStorage.getItem("rf_lang") || "en";
  return apiPost<TurnResponse>(`/api/v1/game/${sessionId}/turn`, {
    inputType,
    input,
    language: lang,
  });
}

export function submitVerdict(
  sessionId: string,
  verdict: "real_employee" | "fraudster",
  flaggedClues: string[]
) {
  return apiPost<VerdictResponse>(`/api/v1/game/${sessionId}/verdict`, {
    verdict,
    flaggedClues,
  });
}

export function getSession(sessionId: string) {
  return apiGet<{ data: { session: Record<string, unknown> } }>(
    `/api/v1/game/${sessionId}`
  );
}

export function getDailyChallenge() {
  return apiGet<DailyChallengeResponse>("/api/v1/game/daily-challenge");
}

export function getHistory() {
  return apiGet<{ data: { sessions: Record<string, unknown>[] } }>(
    "/api/v1/game/history"
  );
}
