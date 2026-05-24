import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Globe } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useI18n } from "../i18n";
import { useTelegram } from "../hooks/useTelegram";

export default function LandingPage() {
  const navigate = useNavigate();
  const { loginAsGuest, loginTelegram, isAuthenticated, isGuest } = useAuth();
  const { t, lang, setLang } = useI18n();
  const { isTelegram, initData } = useTelegram();

  // Auto-redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated || isGuest) {
      navigate("/home", { replace: true });
    }
  }, [isAuthenticated, isGuest, navigate]);

  // Auto-login via Telegram if in Telegram context
  useEffect(() => {
    if (isTelegram && initData) {
      loginTelegram(initData)
        .then(() => navigate("/home", { replace: true }))
        .catch(() => {
          // Fallback — Telegram auth failed, let user proceed manually
        });
    }
  }, [isTelegram, initData, loginTelegram, navigate]);

  const handleGuestPlay = async () => {
    await loginAsGuest();
    navigate("/home");
  };

  const handleToggleLang = () => {
    const order: Array<"en" | "ru" | "uz"> = ["en", "ru", "uz"];
    const idx = order.indexOf(lang as "en" | "ru" | "uz");
    setLang(order[(idx + 1) % order.length]);
  };

  return (
    <div className="flex flex-col items-center justify-center text-center space-y-8 py-10 animate-fade-in relative">
      <div className="relative">
        {/* Large custom radar ring */}
        <div className="w-32 h-32 rounded-full border t-border-accent flex items-center justify-center relative animate-pulse">
          <div
            className="absolute inset-2 rounded-full border t-border-accent t-accent-muted animate-ping"
            style={{ animationDuration: "3s" }}
          />
          <Shield className="w-16 h-16 t-text-accent stroke-1 filter drop-shadow-[0_0_15px_rgba(74,222,128,0.3)] animate-pulse" />
        </div>
      </div>

      <div className="space-y-3 px-4">
        <span className="text-[10px] font-mono border t-border-accent t-text-accent px-3 py-1 rounded-full uppercase tracking-widest font-bold t-accent-muted">
          MOBILE MINI APP AGENT TERMINAL
        </span>
        <h2 className="text-4xl md:text-5xl font-light tracking-tight t-text leading-tight">
          Can you spot the{" "}
          <span className="t-text-accent font-semibold font-mono">
            Impostor?
          </span>
        </h2>
        <p className="text-sm t-text-secondary leading-relaxed max-w-sm mx-auto">
          {t("splash_sub")}
        </p>
      </div>

      <div className="w-full space-y-3 px-4 pt-4">
        <button
          onClick={handleGuestPlay}
          className="w-full t-accent-bg rounded-full py-4 text-base font-semibold tracking-wider uppercase transition-all shadow-[0_0_15px_rgba(74,222,128,0.25)] active:scale-98 relative group overflow-hidden"
        >
          <span className="relative z-10">{t("guest_play")}</span>
        </button>

        <div className="flex justify-center items-center py-2 t-text-muted text-[10px] font-mono tracking-widest uppercase">
          <span>{t("or_separator")}</span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => navigate("/auth/register")}
            className="flex-1 t-bg border t-border hover:t-border-accent t-text rounded-full py-3 text-sm font-mono font-bold tracking-wider uppercase flex items-center justify-center gap-2 transition-all active:scale-98 shadow-sm"
          >
            {t("register")}
          </button>
          <button
            onClick={() => navigate("/auth/login")}
            className="flex-1 t-bg border t-border hover:t-border-accent t-text rounded-full py-3 text-sm font-mono font-bold tracking-wider uppercase flex items-center justify-center gap-2 transition-all active:scale-98 shadow-sm"
          >
            {t("login")}
          </button>
          <button
            onClick={handleToggleLang}
            className="flex items-center gap-2 px-5 py-3 t-bg-secondary border t-border rounded-full t-text-secondary hover:t-text text-xs font-mono font-bold uppercase transition-all shadow-sm"
          >
            <Globe className="w-4 h-4" />
            <span>{lang === "en" ? "ENG" : lang === "ru" ? "RUS" : "UZB"}</span>
          </button>
        </div>
      </div>

      {/* Technical credentials footer */}
      <div className="text-[10px] font-mono t-text-muted pt-6">
        {t("footer_text", "SECURE AGENCY KEY DIRECTIVE V.1.0 • ASIA-SOUTHEAST-REG")}
      </div>
    </div>
  );
}
