import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Shield,
  TrendingUp,
  Target,
  CheckCircle,
  Flame,
  ChevronLeft,
  Edit2,
  Save,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useI18n } from "../i18n";
import { getHistory } from "../api/game";
import { updateProfile } from "../api/user";
import { SpotlightHover } from "../components/ui/spotlight-hover";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, updateUser, isGuest, logout } = useAuth();
  const { t } = useI18n();
  const [editingUsername, setEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState(user?.username || "");
  const [history, setHistory] = useState<Record<string, unknown>[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  useEffect(() => {
    if (!isGuest) {
      getHistory()
        .then((res) => setHistory(res.data.sessions || []))
        .catch(() => {})
        .finally(() => setHistoryLoading(false));
    } else {
      setHistoryLoading(false);
    }
  }, [isGuest]);

  if (!user) return null;

  const handleSaveUsername = async () => {
    if (newUsername.trim().length < 2 || newUsername.trim().length > 32) return;
    try {
      if (!isGuest) {
        await updateProfile({ username: newUsername.trim() });
      }
      updateUser({ username: newUsername.trim() });
      setEditingUsername(false);
    } catch {
      // silently fail
    }
  };

  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(user, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", `cactus_profile_${user?.username || 'export'}.json`);
    dlAnchorElem.click();
  };

  const handleImportData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const imported = JSON.parse(ev.target?.result as string);
          updateUser(imported);
          alert(t("profile.import_success") || "Profile imported successfully!");
        } catch {
          alert(t("profile.import_error") || "Invalid profile data.");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleClearCache = () => {
    if (window.confirm(t("settings.reset_confirm"))) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const stats = user.stats || { currentLevel: 1, totalXp: 0, totalGames: 0, accuracyPct: 0, correctVerdicts: 0, bestStreak: 0, currentStreak: 0 };

  return (
    <div className="space-y-6 pb-24 animate-fade-in">
      <button
        onClick={() => navigate("/home")}
        className="flex items-center gap-2 text-sm font-mono t-text-secondary hover:t-text-accent transition-all group"
      >
        <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        {t("back_to_dashboard")}
      </button>

      {/* Profile Header Card */}
      <div className="relative overflow-hidden p-8 glass-card">
        <SpotlightHover className="t-accent-muted opacity-50" />
        <div className="relative z-10 flex items-center gap-6">
          <div className="relative flex-shrink-0">
            <div className="w-24 h-24 rounded-full t-bg-secondary border-2 t-border-accent flex items-center justify-center t-text-accent text-3xl font-bold font-mono shadow-[0_0_20px_var(--accent-muted)]">
              {(user.username || 'U').slice(0, 2).toUpperCase()}
            </div>
            <div className="absolute -bottom-1 -right-1 t-accent-bg font-bold text-xs px-2 py-0.5 rounded-full font-mono">
              ELO {stats.elo || 1200}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            {editingUsername ? (
              <div className="flex items-center gap-2">
                  <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value.slice(0, 32))}
                  className="t-bg-secondary t-border outline-none rounded-lg px-4 py-2 t-text font-mono flex-1"
                  autoFocus
                />
                <button
                  onClick={handleSaveUsername}
                  className="p-2.5 rounded-lg t-accent-bg"
                >
                  <Save className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <h2 className="text-3xl font-bold t-text truncate">{user.username}</h2>
                <button
                  onClick={() => {
                    setNewUsername(user.username);
                    setEditingUsername(true);
                  }}
                  className="p-1.5 rounded t-text-secondary hover:t-text-accent transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
            )}
            <div className="flex items-center gap-2 mt-2 text-sm t-text-secondary font-mono">
              <TrendingUp className="w-4 h-4 t-text-accent" />
              {stats.totalXp.toLocaleString()} XP Total
            </div>
          </div>
        </div>

        {/* XP Bar */}
        <div className="mt-6 relative z-10 font-mono text-sm">
          <div className="flex justify-between t-text-secondary mb-2">
            <span>{t("profile.xp_tracker")} ({stats.totalXp} XP)</span>
            <span className="t-text-accent font-bold">
              {stats.totalXp % 1000} / 1000 XP
            </span>
          </div>
          <div className="h-3 w-full t-bg-secondary rounded-full overflow-hidden t-border">
            <div
              className="h-full t-accent-bg transition-all duration-500"
              style={{ width: `${(stats.totalXp % 1000) / 10}%` }}
            />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Shield, label: "ELO RATING", value: stats.elo || 1200 },
          { icon: Target, label: t("profile.total_games"), value: stats.totalGames },
          { icon: TrendingUp, label: t("profile.accuracy"), value: `${stats.accuracyPct}%` },
          { icon: Flame, label: t("profile.best_streak"), value: stats.bestStreak },
        ].map((stat, idx) => (
          <div key={idx} className="glass-card p-5 text-center">
            <stat.icon className="w-6 h-6 t-text-accent mx-auto mb-3" />
            <span className="text-xs font-mono t-text-secondary uppercase tracking-widest block font-bold">{stat.label}</span>
            <span className="text-3xl font-bold t-text font-mono mt-1 block">{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Recent History */}
      <div className="glass-card p-6 space-y-4">
        <h4 className="text-sm font-mono t-text-accent font-bold uppercase tracking-widest flex items-center gap-2">
          <Shield className="w-5 h-5" />
          {t("profile.recent_history")}
        </h4>

        {historyLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 t-bg-secondary rounded-xl animate-pulse" />
            ))}
          </div>
        ) : history.length === 0 ? (
          <p className="text-sm t-text-secondary italic text-center py-6">
            {t("profile.no_history")}
          </p>
        ) : (
          <div className="space-y-3">
            {history.slice(0, 10).map((session, idx) => (
              <div
                key={idx}
                className="p-4 t-bg-secondary t-border rounded-xl flex justify-between items-center text-sm"
              >
                <span className="t-text font-mono truncate font-bold">
                  {(session as { scenarioType?: string })?.scenarioType || "Case"} #{idx + 1}
                </span>
                <span
                  className={`font-mono font-bold text-lg ${
                    (session as { verdictCorrect?: boolean })?.verdictCorrect
                      ? "t-text-accent"
                      : "t-danger"
                  }`}
                >
                  {(session as { verdictCorrect?: boolean })?.verdictCorrect ? "✓" : "✗"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Data Management */}
      <div className="glass-card p-6 space-y-4 mt-6">
        <h4 className="text-sm font-mono t-text-accent font-bold uppercase tracking-widest flex items-center gap-2">
          <Save className="w-5 h-5" />
          {t("profile.data_management")}
        </h4>
        <div className="flex flex-wrap gap-3">
          <button onClick={handleExportData} className="px-4 py-2 t-bg-secondary t-border rounded-lg t-text hover:t-accent-bg transition-all">
            {t("profile.export_data")}
          </button>
          <button onClick={handleImportData} className="px-4 py-2 t-bg-secondary t-border rounded-lg t-text hover:t-accent-bg transition-all">
            {t("profile.import_data")}
          </button>
          <button onClick={handleClearCache} className="px-4 py-2 t-danger-bg t-danger t-border rounded-lg transition-all border-red-500/20 hover:bg-red-500/20">
            {t("profile.clear_cache")}
          </button>
          <button onClick={handleLogout} className="px-4 py-2 t-bg-secondary t-border rounded-lg t-text hover:t-accent-bg transition-all">
            {t("settings.logout")}
          </button>
        </div>
      </div>
    </div>
  );
}
