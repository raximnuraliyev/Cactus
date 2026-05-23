import React, { useState, useEffect } from "react";
import { Badge } from "../types";
import { getBadges } from "../api/user";
import { useI18n } from "../i18n";
import { 
  Award, 
  MailCheck, 
  PhoneOff, 
  ShieldAlert, 
  FileLock2, 
} from "lucide-react";
import { SpotlightHover } from "./ui/spotlight-hover";

export default function BadgeView() {
  const { t } = useI18n();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getBadges()
      .then(res => setBadges(res.data.badges || []))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const renderBadgeIcon = (iconName: string, earned: boolean) => {
    const iconClass = `w-8 h-8 ${earned ? "t-text-accent animate-pulse" : "t-text-muted"}`;
    switch (iconName) {
      case "MailCheck":
        return <MailCheck className={iconClass} />;
      case "PhoneOff":
        return <PhoneOff className={iconClass} />;
      case "ShieldAlert":
        return <ShieldAlert className={iconClass} />;
      case "FileLock2":
        return <FileLock2 className={iconClass} />;
      default:
        return <Award className={iconClass} />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      
      {/* Badge Cabinet Title Banner */}
      <div className="relative overflow-hidden p-6 glass-card-accent">
        <div className="relative z-10 flex justify-between items-center">
          <div className="space-y-1">
            <span className="text-[9px] font-mono border t-border-accent t-text-accent px-2 py-0.5 rounded uppercase font-bold t-accent-muted">
              {t("badges_page.badge_label")}
            </span>
            <h2 className="text-2xl font-bold tracking-tight t-text mt-1">
              {t("badges_page.title")}
            </h2>
            <p className="text-xs t-text-secondary font-sans">
              {t("badges_page.subtitle")}
            </p>
          </div>
          <Award className="w-12 h-12 t-text-accent stroke-1 opacity-80" />
        </div>
      </div>

      {isLoading ? (
        <div className="p-12 flex justify-center">
          <div className="w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {badges.map((badge) => {
            const isComplete = badge.earned || badge.progress >= badge.totalRequired;
            return (
              <div 
                key={badge.id}
                className={`relative overflow-hidden p-6 glass-card transition-all ${
                  isComplete
                    ? "t-border-accent t-accent-muted shadow-[0_0_15px_var(--accent-muted)]"
                    : "t-border opacity-70"
                }`}
              >
                <SpotlightHover className={isComplete ? "t-accent-muted opacity-50" : "opacity-0"} />

                <div className="flex items-start space-x-4 relative z-10">
                  {/* Visual badge round container */}
                  <div className={`p-4 rounded-2xl border flex items-center justify-center transition-all ${
                    isComplete
                      ? "t-bg-secondary t-border-accent t-text-accent shadow-[0_0_15px_var(--accent-muted)]"
                      : "t-bg-secondary t-border t-text-muted"
                  }`}>
                    {renderBadgeIcon(badge.icon, isComplete)}
                  </div>

                  <div className="flex-1 space-y-1.5">
                    <div className="flex justify-between items-start">
                      <h4 className={`text-base font-semibold ${isComplete ? "t-text" : "t-text-muted"}`}>
                        {t(`badges.${badge.name.replace(/\s+/g, '_').toLowerCase()}.name`) || badge.name}
                      </h4>
                      <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${
                        isComplete 
                          ? "t-text-accent t-border-accent t-accent-muted font-bold animate-pulse"
                          : "t-text-muted t-border"
                      }`}>
                        {isComplete ? t("badges_page.unlocked") : t("badges_page.locked")}
                      </span>
                    </div>

                    <p className={`text-xs ${isComplete ? "t-text-secondary" : "t-text-muted"} font-sans leading-relaxed`}>
                      {t(`badges.${badge.name.replace(/\s+/g, '_').toLowerCase()}.desc`) || badge.description}
                    </p>

                    {/* Progress tracker bar */}
                    <div className="space-y-1 pt-1 font-mono text-[9px] t-text-secondary">
                      <div className="flex justify-between">
                        <span>{t("badges_page.calibration")}</span>
                        <span>{badge.progress} / {badge.totalRequired}</span>
                      </div>
                      <div className="h-1 t-bg-secondary rounded-full overflow-hidden border t-border">
                        <div 
                          className={`h-full ${isComplete ? "t-accent-bg shadow-[0_0_8px_var(--accent-muted)]" : "t-bg-card"}`}
                          style={{ width: `${(badge.progress / badge.totalRequired) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
