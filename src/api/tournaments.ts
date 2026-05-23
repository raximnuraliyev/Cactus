import { apiGet, apiPost } from "./client";
import type { TournamentLobby } from "../types";

export function createLobby(username: string) {
  return apiPost<{ data: { lobby: TournamentLobby } }>("/api/v1/tournaments/lobby", { username });
}

export function getLobby(id: string) {
  return apiGet<{ data: { lobby: TournamentLobby } }>(`/api/v1/tournaments/lobby/${id}`);
}

export function joinLobby(id: string, username: string) {
  return apiPost<{ data: { lobby: TournamentLobby } }>(`/api/v1/tournaments/lobby/${id}/join`, { username });
}

export function leaveLobby(id: string, username: string) {
  return apiPost<{ data: { lobby: TournamentLobby } }>(`/api/v1/tournaments/lobby/${id}/leave`, { username });
}

export function startGame(id: string) {
  return apiPost<{ data: { lobby: TournamentLobby } }>(`/api/v1/tournaments/lobby/${id}/start`);
}

export function finishTour(id: string, username: string) {
  return apiPost<{ data: { lobby: TournamentLobby } }>(`/api/v1/tournaments/lobby/${id}/finishTour`, { username });
}

export function sendMessage(id: string, username: string, content: string, time: string) {
  return apiPost<{ data: { lobby: TournamentLobby } }>(`/api/v1/tournaments/lobby/${id}/message`, { username, content, time });
}

export function endGame(id: string) {
  return apiPost<{ data: { lobby: TournamentLobby } }>(`/api/v1/tournaments/lobby/${id}/end`);
}

export function completeTask(id: string, username: string, taskId: number) {
  return apiPost<{ data: { lobby: TournamentLobby } }>(`/api/v1/tournaments/lobby/${id}/task`, { username, taskId });
}
