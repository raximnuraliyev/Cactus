import React, { useState, useEffect } from "react";
import { LeaderboardEntry } from "../types";
import { getWeekly, getAllTime } from "../api/leaderboard";
import { useAuth } from "../contexts/AuthContext";
import { useI18n } from "../i18n";
import { 
  Trophy, 
  Search, 
  Crown, 
  TrendingUp, 
  Bot,
} from "lucide-react";

export default function LeaderboardView() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [leaderboardTab, setLeaderboardTab] = useState<"weekly" | "alltime">("weekly");
  const [searchTerm, setSearchTerm] = useState("");
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true);
      try {
        const fetchFn = leaderboardTab === "weekly" ? getWeekly : getAllTime;
        const res = await fetchFn(100); // fetch top 100
        setEntries(res.data.entries || []);
      } catch (error) {
        console.error("Failed to fetch leaderboard", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, [leaderboardTab]);

  const filteredEntries = entries.filter(entry => 
    (entry.username || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      
      {/* Leaderboard title layout */}
      <div className="relative overflow-hidden p-6 md:p-8 glass-card">
        {/* Robot asset replacing trophy and pushed to background right side */}
        <div className="absolute right-[-10%] top-[-20%] pointer-events-none opacity-20 z-0">
          <Bot className="w-64 h-64 text-[var(--text-main)]" />
        </div>
        
        <div className="relative z-10 flex justify-between items-center">
          <div className="space-y-1">
            <span className="text-xs font-mono border border-[var(--accent-dark)] text-[var(--accent-neon)] px-2 py-1 rounded uppercase font-bold bg-[var(--accent-muted)]">
              {t("leaderboard.badge_label")}
            </span>
            <h2 className="text-3xl font-bold tracking-tight t-text mt-2 font-sans">
              {t("leaderboard.title")}
            </h2>
            <p className="text-sm text-[var(--text-muted)] font-sans mt-1">
              {t("leaderboard.subtitle")}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs navigation + Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Toggle tabs */}
        <div className="flex bg-[var(--bg-card)] backdrop-blur-md p-1 border border-[var(--border)] rounded-full w-full md:w-auto shrink-0">
          <button
            onClick={() => setLeaderboardTab("weekly")}
            className={`flex-1 md:flex-none text-center px-6 py-2.5 rounded-full text-sm font-mono transition-all font-semibold ${
              leaderboardTab === "weekly"
                ? "bg-[var(--accent-neon)] text-[#0D1117] shadow-[0_0_10px_var(--accent-muted)]"
                : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
            }`}
          >
            {t("leaderboard.weekly")}
          </button>
          <button
            onClick={() => setLeaderboardTab("alltime")}
            className={`flex-1 md:flex-none text-center px-6 py-2.5 rounded-full text-sm font-mono transition-all font-semibold ${
              leaderboardTab === "alltime"
                ? "bg-[var(--accent-neon)] text-[#0D1117] shadow-[0_0_10px_var(--accent-muted)]"
                : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
            }`}
          >
            {t("leaderboard.alltime")}
          </button>
        </div>

        {/* Search entry bar */}
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-[var(--text-muted)]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t("leaderboard.search")}
            className="w-full bg-[var(--bg-card)] backdrop-blur-md border border-[var(--border)] text-sm focus:border-[var(--accent-dark)] outline-none rounded-lg pl-11 pr-5 py-3 text-[var(--text-main)] font-mono placeholder-[var(--text-muted)] transition-colors"
          />
        </div>
      </div>

      {/* Leaderboard Table Row Structure */}
      <div className="glass-card overflow-hidden shadow-xl">
        {/* Headings */}
        <div className="grid grid-cols-12 px-6 py-4 border-b border-[var(--border)] font-mono text-xs text-[var(--text-muted)] uppercase tracking-widest font-bold bg-[var(--bg-card)]">
          <div className="col-span-2">{t("leaderboard.rank")}</div>
          <div className="col-span-5">{t("leaderboard.detective")}</div>
          <div className="col-span-2 text-center">{t("leaderboard.level")}</div>
          <div className="col-span-3 text-right">{t("leaderboard.xp")}</div>
        </div>

        {/* Items */}
        <div className="divide-y t-border min-h-[200px]">
          {isLoading ? (
            <div className="p-10 flex justify-center">
              <div className="w-10 h-10 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
              {filteredEntries.map((player, idx) => {
                const isTop3 = player.rank <= 3;
                const isMe = user?.username === player.username;
                return (
                  <div 
                    key={idx} 
                    className={`grid grid-cols-12 px-6 py-5 items-center transition-colors ${
                      isMe 
                        ? "t-accent-muted border-y t-border-accent" 
                        : "hover:t-bg-secondary"
                    }`}
                  >
                    {/* Rank column */}
                    <div className="col-span-2 flex items-center gap-1.5 font-mono text-base">
                      {isTop3 ? (
                        <div className="flex items-center gap-1.5">
                          <Crown className={`w-5 h-5 ${
                            player.rank === 1 ? "text-yellow-400" : player.rank === 2 ? "text-slate-300" : "text-amber-600"
                          }`} />
                          <span className="t-text font-bold">{player.rank}</span>
                        </div>
                      ) : (
                        <span className="t-text-secondary font-semibold">{player.rank}</span>
                      )}
                    </div>

                    {/* Name avatar column */}
                    <div className="col-span-5 flex items-center space-x-4 truncate">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-mono font-bold border ${
                        isMe 
                          ? "t-bg-secondary t-border-accent t-text-accent shadow-[0_0_10px_var(--accent-muted)]" 
                          : "t-bg-secondary t-border t-text-secondary"
                      }`}>
                        {(player.username || 'U').slice(0, 1).toUpperCase()}
                      </div>
                      <div>
                        <span className={`text-base block truncate ${
                          isMe ? "t-text-accent font-bold" : "t-text"
                        }`}>
                          {player.username}
                          {isMe && (
                            <span className="text-[10px] font-mono uppercase t-accent-muted border t-border-accent t-text-accent px-2 py-0.5 rounded ml-2 font-bold">
                              {t("leaderboard.me_badge")}
                            </span>
                          )}
                        </span>
                        <span className="text-xs t-text-secondary flex items-center gap-1.5 font-mono mt-0.5">
                          <TrendingUp className="w-3.5 h-3.5 t-text-accent" />
                          {player.accuracy}%
                        </span>
                      </div>
                    </div>

                    {/* Level badge column */}
                    <div className="col-span-2 text-center font-mono text-sm">
                      <span className="t-bg-secondary px-3 py-1.5 border t-border rounded-lg t-text-secondary font-semibold">
                        Lvl.{player.level}
                      </span>
                    </div>

                    {/* Score column */}
                    <div className="col-span-3 text-right font-mono text-base font-bold">
                      <span className={isMe ? "t-text-accent" : "t-text"}>
                        {(player.score || 0).toLocaleString()}
                      </span>
                      <span className="text-xs t-text-muted font-mono ml-1.5 font-normal">XP</span>
                    </div>
                  </div>
                );
              })}

              {filteredEntries.length === 0 && !isLoading && (
                <div className="p-10 text-center text-sm text-slate-500 italic">{t("leaderboard.no_results")}</div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
