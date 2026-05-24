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
                className={`relative overflow-hidden p-6 rounded-2xl transition-all ${
                  isComplete
                    ? "bg-white dark:bg-[#13191E] border-2 border-[#1EB863] shadow-sm"
                    : "grayscale bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 text-gray-400"
                }`}
              >
                <SpotlightHover className={isComplete ? "t-accent-muted opacity-50" : "opacity-0"} />

                <div className="flex items-start space-x-4 relative z-10">
                  {/* Visual badge round container */}
                  <div className={`p-4 rounded-2xl border-2 flex items-center justify-center transition-all ${
                    isComplete
                      ? "bg-[#1EB863]/20 border-[#1EB863] text-[#1EB863]"
                      : "bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400"
                  }`}>
                    {renderBadgeIcon(badge.icon, isComplete)}
                  </div>

                  <div className="flex-1 space-y-1.5">
                    <div className="flex justify-between items-start">
                      <h4 className={`text-base font-bold ${isComplete ? "text-black dark:text-white" : "text-gray-400"}`}>
                        {t(`badges.${badge.name.replace(/\s+/g, '_').toLowerCase()}.name`) || badge.name}
                      </h4>
                      <span className={`text-[9px] font-mono px-2 py-1 rounded font-bold uppercase ${
                        isComplete 
                          ? "bg-[#1EB863]/20 text-[#1EB863] animate-pulse"
                          : "bg-gray-200 dark:bg-gray-800 text-gray-500"
                      }`}>
                        {isComplete ? t("badges_page.unlocked") : t("badges_page.locked")}
                      </span>
                    </div>

                    <p className={`text-xs ${isComplete ? "text-gray-600 dark:text-gray-300" : "text-gray-400"} font-semibold leading-relaxed`}>
                      {t(`badges.${badge.name.replace(/\s+/g, '_').toLowerCase()}.desc`) || badge.description}
                    </p>

                    {/* Progress tracker bar */}
                    <div className="space-y-1 pt-1 font-mono text-[9px] t-text-secondary">
                      <div className="flex justify-between">
                        <span>{t("badges_page.calibration")}</span>
                        <span>{badge.progress} / {badge.totalRequired}</span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${isComplete ? "bg-[#1EB863]" : "bg-gray-400"}`}
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
