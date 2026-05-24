import { apiGet, apiPatch } from "./client";
import type { User, Badge } from "../types";

export function getProfile() {
  return apiGet<{ data: User }>("/api/v1/user/me");
}

export function updateProfile(fields: {
  username?: string;
  language?: string;
  isPrivate?: boolean;
  notifyDaily?: boolean;
  stats?: any;
}) {
  return apiPatch<{ data: User }>("/api/v1/user/me", fields);
}

export function getBadges() {
  return apiGet<{ data: { badges: Badge[] } }>("/api/v1/user/badges");
}
