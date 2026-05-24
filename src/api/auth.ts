import { apiPost } from "./client";
import type { AuthResponse } from "../types";

export function register(email: string, password: string, username: string) {
  return apiPost<AuthResponse>("/api/v1/auth/register", {
    email,
    password,
    username,
  });
}

export const login = async (email: string, password: string) => {
  return apiPost<AuthResponse>("/api/v1/auth/login", { email, password });
};

export const guestLogin = async () => {
  return apiPost<AuthResponse>("/api/v1/auth/guest", {});
};

export function loginTelegram(initData: string) {
  return apiPost<AuthResponse>("/api/v1/auth/telegram", { initData });
}

export function refreshToken(token: string) {
  return apiPost<{ data: { accessToken: string; refreshToken: string } }>(
    "/api/v1/auth/refresh",
    { refreshToken: token }
  );
}

export function logout(token: string) {
  return apiPost("/api/v1/auth/logout", { refreshToken: token });
}
