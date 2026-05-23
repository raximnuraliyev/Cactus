import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

type Theme = "dark" | "light";

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const DARK_VARS: Record<string, string> = {
  "--bg-primary": "#12181B",
  "--bg-secondary": "#1E2326",
  "--bg-card": "rgba(255,255,255,0.05)",
  "--bg-card-hover": "rgba(255,255,255,0.08)",
  "--bg-elevated": "rgba(30,35,38,0.9)",
  "--text-primary": "#E2E8F0",
  "--text-secondary": "#94A3B8",
  "--text-muted": "#64748B",
  "--accent": "#4ADE80",
  "--accent-hover": "#22C55E",
  "--accent-muted": "rgba(74,222,128,0.15)",
  "--accent-text": "#12181B",
  "--border": "rgba(255,255,255,0.08)",
  "--border-accent": "rgba(74,222,128,0.25)",
  "--danger": "#F87171",
  "--danger-muted": "rgba(248,113,113,0.1)",
  "--warning": "#FBBF24",
  "--chat-incoming": "rgba(255,255,255,0.06)",
  "--chat-outgoing": "#1B5E20",
  "--chat-outgoing-text": "#E2E8F0",
  "--nav-bg": "rgba(18,24,27,0.92)",
  "--shadow-color": "rgba(0,0,0,0.5)",
  "--spline-opacity": "0.15",
};

const LIGHT_VARS: Record<string, string> = {
  "--bg-primary": "#EEF2F6",
  "--bg-secondary": "#E2E8F0",
  "--bg-card": "rgba(0,0,0,0.03)",
  "--bg-card-hover": "rgba(0,0,0,0.06)",
  "--bg-elevated": "rgba(255,255,255,0.95)",
  "--text-primary": "#1E293B",
  "--text-secondary": "#475569",
  "--text-muted": "#94A3B8",
  "--accent": "#059669",
  "--accent-hover": "#047857",
  "--accent-muted": "rgba(5,150,105,0.12)",
  "--accent-text": "#FFFFFF",
  "--border": "rgba(0,0,0,0.08)",
  "--border-accent": "rgba(5,150,105,0.3)",
  "--danger": "#DC2626",
  "--danger-muted": "rgba(220,38,38,0.08)",
  "--warning": "#D97706",
  "--chat-incoming": "#E8F5E9",
  "--chat-outgoing": "#C8E6C9",
  "--chat-outgoing-text": "#1E293B",
  "--nav-bg": "rgba(248,250,252,0.92)",
  "--shadow-color": "rgba(0,0,0,0.1)",
  "--spline-opacity": "0.06",
};

function applyThemeVars(theme: Theme) {
  const vars = theme === "dark" ? DARK_VARS : LIGHT_VARS;
  const root = document.documentElement;
  root.setAttribute("data-theme", theme);
  for (const [key, value] of Object.entries(vars)) {
    root.style.setProperty(key, value);
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem("cactus_theme") as Theme | null;
    return saved === "light" ? "light" : "dark";
  });

  useEffect(() => {
    applyThemeVars(theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      localStorage.setItem("cactus_theme", next);
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark: theme === "dark" }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
