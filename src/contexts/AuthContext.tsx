import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { User } from "../types";
import {
  login as apiLogin,
  register as apiRegister,
  loginTelegram as apiLoginTg,
  logout as apiLogout,
} from "../api/auth";
import { getProfile } from "../api/user";
import { setTokens, clearTokens } from "../api/client";

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, username: string) => Promise<void>;
  loginTelegram: (initData: string) => Promise<void>;
  loginAsGuest: () => void;
  logout: () => void;
  updateUser: (fields: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const MOCK_EXTENSIONS = {
  stats: {
    awareness: 35,
    intuition: 28,
    speed: 42,
    resilience: 15,
    reputation: 68
  },
  achievements: [
    { id: "first_blood", earnedAt: new Date().toISOString() },
    { id: "sherlock", earnedAt: new Date().toISOString() },
    { id: "boss", earnedAt: new Date().toISOString() }
  ]
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [loading, setLoading] = useState(true);

  // On mount, try loading user from stored token
  useEffect(() => {
    const token = localStorage.getItem("rf_access_token");
    if (token) {
      getProfile()
        .then((res) => {
          // @ts-ignore - API returns { user, stats, rank } in data
          setUser({ 
            ...res.data.user, 
            stats: { ...res.data.stats, ...MOCK_EXTENSIONS.stats },
            achievements: MOCK_EXTENSIONS.achievements
          });
        })
        .catch(() => {
          clearTokens();
        })
        .finally(() => setLoading(false));
    } else {
      // Check if they were a guest
      const guestFlag = localStorage.getItem("rf_guest");
      if (guestFlag === "true") {
        setIsGuest(true);
        // Load a mock guest user from localStorage
        const saved = localStorage.getItem("real_or_fake_user");
        if (saved) {
          try {
            setUser(JSON.parse(saved));
          } catch {
            /* ignore */
          }
        }
      }
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await apiLogin(email, password);
    setTokens(res.data.accessToken, res.data.refreshToken);
    const profileRes = await getProfile();
    // @ts-ignore
    setUser({ 
      ...profileRes.data.user, 
      stats: { ...profileRes.data.stats, ...MOCK_EXTENSIONS.stats },
      achievements: MOCK_EXTENSIONS.achievements 
    });
    setIsGuest(false);
    localStorage.removeItem("rf_guest");
  }, []);

  const register = useCallback(
    async (email: string, password: string, username: string) => {
      const res = await apiRegister(email, password, username);
      setTokens(res.data.accessToken, res.data.refreshToken);
      const profileRes = await getProfile();
      // @ts-ignore
      setUser({ 
        ...profileRes.data.user, 
        stats: { ...profileRes.data.stats, ...MOCK_EXTENSIONS.stats },
        achievements: MOCK_EXTENSIONS.achievements 
      });
      setIsGuest(false);
      localStorage.removeItem("rf_guest");
    },
    []
  );

  const loginTelegram = useCallback(async (initData: string) => {
    const res = await apiLoginTg(initData);
    setTokens(res.data.accessToken, res.data.refreshToken);
    const profileRes = await getProfile();
    // @ts-ignore
    setUser({ 
      ...profileRes.data.user, 
      stats: { ...profileRes.data.stats, ...MOCK_EXTENSIONS.stats },
      achievements: MOCK_EXTENSIONS.achievements 
    });
    setIsGuest(false);
    localStorage.removeItem("rf_guest");
  }, []);

  const loginAsGuest = useCallback(() => {
    setIsGuest(true);
    localStorage.setItem("rf_guest", "true");
    const guestUser: User = {
      id: "guest-" + Date.now(),
      username: "Guest_Agent",
      language: "en",
      stats: {
        totalXp: 0,
        currentLevel: 1,
        totalGames: 0,
        correctVerdicts: 0,
        accuracyPct: 0,
        currentStreak: 0,
        bestStreak: 0,
        elo: 600,
        placementGamesPlayed: 0,
        ...MOCK_EXTENSIONS.stats
      },
      achievements: MOCK_EXTENSIONS.achievements
    };
    setUser(guestUser);
    localStorage.setItem("real_or_fake_user", JSON.stringify(guestUser));
  }, []);

  const logout = useCallback(() => {
    const rt = localStorage.getItem("rf_refresh_token");
    if (rt) apiLogout(rt).catch(() => {});
    clearTokens();
    setUser(null);
    setIsGuest(false);
    localStorage.removeItem("rf_guest");
    localStorage.removeItem("real_or_fake_user");
  }, []);

  const updateUser = useCallback((fields: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...fields };
      localStorage.setItem("real_or_fake_user", JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user && !isGuest,
        isGuest,
        loading,
        login,
        register,
        loginTelegram,
        loginAsGuest,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
