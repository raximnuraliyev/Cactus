import { apiGet } from "./client";
import type { LeaderboardEntry } from "../types";

interface LeaderboardResponse {
  data: {
    entries: LeaderboardEntry[];
    myRank?: number;
  };
}

export function getWeekly(limit = 100) {
  return apiGet<LeaderboardResponse>(
    `/api/v1/leaderboard/weekly?limit=${limit}`
  );
}

export function getAllTime(limit = 100) {
  return apiGet<LeaderboardResponse>(
    `/api/v1/leaderboard/all-time?limit=${limit}`
  );
}
