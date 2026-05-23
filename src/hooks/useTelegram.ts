import { useMemo } from "react";

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initData: string;
        initDataUnsafe: {
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
            language_code?: string;
          };
        };
        ready: () => void;
        expand: () => void;
        close: () => void;
        setHeaderColor: (color: string) => void;
        setBackgroundColor: (color: string) => void;
        HapticFeedback: {
          impactOccurred: (style: "light" | "medium" | "heavy" | "rigid" | "soft") => void;
          notificationOccurred: (type: "error" | "success" | "warning") => void;
          selectionChanged: () => void;
        };
        MainButton: {
          text: string;
          show: () => void;
          hide: () => void;
          onClick: (fn: () => void) => void;
          offClick: (fn: () => void) => void;
          setParams: (params: { text?: string; color?: string; text_color?: string; is_active?: boolean; is_visible?: boolean }) => void;
        };
        BackButton: {
          show: () => void;
          hide: () => void;
          onClick: (fn: () => void) => void;
          offClick: (fn: () => void) => void;
        };
        colorScheme: "light" | "dark";
        themeParams: Record<string, string>;
      };
    };
  }
}

export function useTelegram() {
  const webApp = window.Telegram?.WebApp;

  const value = useMemo(() => {
    const isTelegram = !!webApp;

    if (isTelegram && webApp) {
      // Configure Telegram theme for our cyberpunk aesthetic
      try {
        webApp.setHeaderColor("#09090b");
        webApp.setBackgroundColor("#000000");
        webApp.expand();
        webApp.ready();
      } catch {
        // Telegram SDK might not support all methods on all versions
      }
    }

    return {
      isTelegram,
      webApp: webApp ?? null,
      initData: webApp?.initData ?? "",
      hapticFeedback: webApp?.HapticFeedback ?? null,
      mainButton: webApp?.MainButton ?? null,
      backButton: webApp?.BackButton ?? null,
      user: webApp?.initDataUnsafe?.user ?? null,
    };
  }, [webApp]);

  return value;
}
