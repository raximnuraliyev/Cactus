import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useGame } from "../contexts/GameContext";
import { useI18n } from "../i18n";
import { getDailyChallenge } from "../api/game";
import { SCENARIO_TEMPLATES } from "../data";
import { translateScenario } from "../hooks/useTranslatedScenario";
import {
  Shield,
  Flame,
  ChevronRight,
  Terminal,
  TrendingUp,
  Cpu,
  Award,
  PhoneCall,
  Mail,
  CreditCard,
  FileText,
  Activity,
  Wifi,
} from "lucide-react";
import { SpotlightHover } from "./ui/spotlight-hover";
import type { ScenarioTemplate, ScenarioType, DifficultyLevel } from "../types";
import PlacementView from "./PlacementView";

export default function DashboardView() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { startGame } = useGame();
  const { t } = useI18n();

  const [countdown, setCountdown] = useState("");
  const [completedDaily, setCompletedDaily] = useState(false);
  const [activeStreak, setActiveStreak] = useState(0);
  const [dailyLoading, setDailyLoading] = useState(false);
  const [loadingScenario, setLoadingScenario] = useState<string | null>(null);

  useEffect(() => {
    getDailyChallenge()
      .then((res) => {
        setCompletedDaily(res.data.completed);
        setActiveStreak(res.data.streakCount);
      })
      .catch(() => {
        // Fallback for guest mode or error
      });
  }, []);

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const nextMidnight = new Date();
      nextMidnight.setHours(24, 0, 0, 0);
      const diff = nextMidnight.getTime() - now.getTime();

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);

      setCountdown(
        `${hours.toString().padStart(2, "0")}:${mins
          .toString()
          .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
      );
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!user) return null;

  const placementGamesPlayed = user.stats?.placementGamesPlayed || 0;
  if (placementGamesPlayed < 5) {
    return <PlacementView />;
  }

  const getCategoryIcon = (type: string) => {
    switch (type) {
      case "phone_call":
        return <PhoneCall className="w-5 h-5 text-green-400" />;
      case "phishing":
        return <Mail className="w-5 h-5 text-green-400" />;
      case "transaction":
        return <CreditCard className="w-5 h-5 text-green-400" />;
      case "document":
        return <FileText className="w-5 h-5 text-green-400" />;
      default:
        return <Shield className="w-5 h-5 text-green-400" />;
    }
  };

  const getCategoryTitle = (type: string) => {
    switch (type) {
      case "phone_call":
        return t("category_phone");
      case "phishing":
        return t("category_phishing");
      case "transaction":
        return t("category_transaction");
      case "document":
        return t("category_document");
      default:
        return type;
    }
  };

  const handleSelectScenario = async (scen: ScenarioTemplate) => {
    setLoadingScenario(scen.id);
    try {
      const session = await startGame(
        scen.type as ScenarioType,
        scen.difficulty as DifficultyLevel
      );
      navigate("/game/start", {
        state: { scenario: scen, session },
      });
    } catch {
      navigate("/game/start", { state: { scenario: scen } });
    } finally {
      setLoadingScenario(null);
    }
  };

  const handleStartDailyChallenge = async () => {
    if (completedDaily || dailyLoading) return;
    setDailyLoading(true);
    try {
      const session = await startGame();
      navigate("/game/start", {
        state: { session, isDaily: true },
      });
    } catch {
      navigate("/game/start", {
        state: { scenario: SCENARIO_TEMPLATES[0], isDaily: true },
      });
    } finally {
      setDailyLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-24 animate-fade-in">
      {/* Profile details block */}
      <div className="relative overflow-hidden p-6 glass-card group">
        <SpotlightHover className="t-accent-muted opacity-50" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10 w-full">
          <div className="flex items-center space-x-4 min-w-0 flex-1">
            <div className="relative flex-shrink-0">
              <div className="w-16 h-16 rounded-full t-bg-secondary border-2 t-border-accent flex items-center justify-center t-text-accent text-xl font-bold font-mono shadow-[0_0_15px_var(--accent-muted)] group-hover:shadow-[0_0_20px_var(--accent-muted)] transition-all">
                {(user.username || 'U').slice(0, 2).toUpperCase()}
              </div>
              <div className="absolute -bottom-1 -right-1 t-accent-bg font-semibold text-[10px] px-1.5 py-0.5 rounded-full font-mono flex items-center">
                Lv.{user.stats?.currentLevel || 1}
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-xl font-bold tracking-wide t-text truncate max-w-[140px] xs:max-w-[200px]">
                  {user.username}
                </h2>

                <div className="border t-border-accent rounded-lg py-1 px-1.5 t-accent-muted text-center leading-none inline-flex flex-col justify-center h-[34px] flex-shrink-0">
                  <span className="text-[8px] font-mono font-black t-text-accent tracking-wider">
                    SECURE
                  </span>
                  <span className="text-[8px] font-mono font-black t-text-accent tracking-wider mt-0.5">
                    AGENT
                  </span>
                </div>

                <div className="rounded-full border t-border-accent t-accent-muted px-3.5 h-[34px] flex items-center gap-2 select-none flex-shrink-0">
                  <Flame className="w-4 h-4 text-orange-400 fill-orange-400 animate-pulse flex-shrink-0" />
                  <div className="flex flex-col leading-none text-left font-mono">
                    <span className="text-[10px] font-extrabold t-text-accent uppercase tracking-tight">
                      {activeStreak || user.stats?.currentStreak || 0} day
                    </span>
                    <span className="text-[9px] t-text-accent font-bold mt-0.5 uppercase tracking-tight">
                      streak
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-sm t-text-secondary font-mono">
                <span className="flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 t-text-accent" />
                  Accuracy: {user.stats?.accuracyPct || 0}%
                </span>
                <span>•</span>
                <span>Games: {user.stats?.totalGames || 0}</span>
                <span>•</span>
                <span className="t-text-accent">ELO: {user.stats?.elo || 1200}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Level XP indicator */}
        <div className="mt-5 relative z-10 font-mono text-sm">
          <div className="flex justify-between t-text-secondary mb-1">
            <span>EXP Tracker ({user.stats?.totalXp || 0} XP)</span>
            <span className="t-text-accent font-semibold">
              {(user.stats?.totalXp || 0) % 1000} / 1000 XP
            </span>
          </div>
          <div className="h-2.5 w-full t-bg-secondary rounded-full overflow-hidden t-border">
            <div
              className="h-full t-accent-bg transition-all duration-500"
              style={{ width: `${((user.stats?.totalXp || 0) % 1000) / 10}%` }}
            />
          </div>
        </div>
      </div>

      {/* Daily Challenge banner (Von Restorff Effect) */}
      <div className="relative overflow-hidden p-6 glass-card-accent shadow-[0_0_20px_var(--accent-muted)]">
        <div className="absolute top-0 right-0 p-3 bg-red-500/10 border-l border-b border-red-500/20 text-red-400 font-mono text-xs font-bold uppercase tracking-widest rounded-bl-lg animate-pulse">
          Critical Dispatch
        </div>
        <div className="flex items-start space-x-5">
          <div className="p-4 t-bg-secondary border t-border-accent rounded-full flex items-center justify-center shadow-[0_0_15px_var(--accent-muted)]">
            <Cpu
              className="w-8 h-8 t-text-accent animate-spin"
              style={{ animationDuration: "10s" }}
            />
          </div>
          <div className="flex-1 space-y-1">
            <span className="text-sm font-mono font-bold t-text-accent uppercase tracking-widest">
              {t("daily_challenge")}
            </span>
            <h3 className="text-xl font-bold t-text">{t("daily_title")}</h3>
            <p className="text-base t-text-secondary">{t("daily_desc")}</p>
            <div className="flex items-center gap-3 pt-2 font-mono text-sm">
              <span className="t-text-muted">Reset:</span>
              <span className="t-danger font-bold tracking-wider font-mono">
                {countdown}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={handleStartDailyChallenge}
            disabled={completedDaily || dailyLoading}
            className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-5 text-lg font-bold transition-all shadow-[0_0_20px_var(--accent-muted)] ${
              completedDaily
                ? "t-bg-secondary t-border t-text-muted cursor-not-allowed shadow-none"
                : "t-accent-bg border t-border-accent active:scale-95 hover:brightness-110"
            }`}
          >
            {completedDaily ? (
              <>
                <Award className="w-5 h-5 t-text-muted" />
                {t("daily_done")}
              </>
            ) : (
              <>
                <Terminal className="w-5 h-5" />
                {dailyLoading ? "Loading..." : t("daily_start")}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Category selection */}
      <div className="glass-card p-6">
        <h3 className="text-sm font-mono font-bold t-text-accent uppercase tracking-widest mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5" />
          {t("scenario_cabinet")}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SCENARIO_TEMPLATES.map((rawScen) => {
            const scen = translateScenario(rawScen, t);
            return (
            <div
              key={scen.id}
              onClick={() => handleSelectScenario(scen)}
              className={`relative overflow-hidden p-6 md:p-8 min-h-[120px] rounded-2xl t-bg-secondary border t-border hover:t-border-accent cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-[0_0_20px_var(--accent-muted)] group flex justify-between items-center ${
                loadingScenario === scen.id ? "opacity-60 pointer-events-none" : ""
              }`}
            >
              <div className="flex items-center space-x-4 relative z-10">
                <div className="p-4 t-bg-card border t-border group-hover:t-border-accent rounded-xl transition-colors">
                  {getCategoryIcon(scen.type)}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-base t-text group-hover:t-text-accent transition-colors">
                      {getCategoryTitle(scen.type)}
                    </h4>
                    <span
                      className={`flex items-center justify-center text-[10px] font-mono font-black w-[20px] h-[20px] rounded-[6px] border flex-shrink-0 leading-none select-none pb-[0.5px] ${
                        scen.difficulty === "easy"
                          ? "t-text-accent t-border-accent t-accent-muted"
                          : scen.difficulty === "medium"
                          ? "text-yellow-400 border-yellow-500/30 bg-yellow-500/10"
                          : "text-red-400 border-red-500/30 bg-red-400/10"
                      }`}
                    >
                      {scen.difficulty.slice(0, 1).toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm t-text-secondary line-clamp-2">
                    {scen.title}
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-full t-bg-card border t-border group-hover:t-border-accent group-hover:t-accent-muted group-hover:t-text-accent transition-all t-text-muted flex-shrink-0 ml-4">
                {loadingScenario === scen.id ? (
                  <div className="w-5 h-5 border-2 t-border-accent border-t-transparent rounded-full animate-spin" />
                ) : (
                  <ChevronRight className="w-5 h-5" />
                )}
              </div>
            </div>
          )})}
        </div>
      </div>

      {/* Neural Threat Diagnostic */}
      <div className="relative mt-10 space-y-3">
        <h3 className="text-sm font-mono font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2">
          <Activity className="w-5 h-5 text-emerald-400 animate-pulse" />
          {t("neural_lab")}
        </h3>
        <p className="text-sm text-slate-400 leading-relaxed">
          {t("neural_lab_desc")}
        </p>
        <NeuralThreatDiagnostic />
      </div>
    </div>
  );
}

function NeuralThreatDiagnostic() {
  const { t } = useI18n();
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [nodes, setNodes] = useState([
    { id: "voice", label: "Voice Node A-1", ping: 14, status: "stable", traffic: "normal" },
    { id: "phishing", label: "Mail Vector M-9", ping: 32, status: "stable", traffic: "elevated" },
    { id: "refunds", label: "Card Ledger L-4", ping: 45, status: "attention", traffic: "normal" },
    { id: "leaks", label: "Document Audits D-3", ping: 19, status: "stable", traffic: "low" },
  ]);

  const handleSweepScan = () => {
    if (isScanning) return;
    setIsScanning(true);
    setScanProgress(0);

    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          setNodes((n) =>
            n.map((node) => ({
              ...node,
              ping: Math.floor(Math.random() * 45) + 10,
              status: Math.random() > 0.8 ? "attention" : "stable",
              traffic: Math.random() > 0.6 ? "elevated" : "normal",
            }))
          );
          return 100;
        }
        return prev + 10;
      });
    }, 120);
  };

  return (
    <div className="glass-card p-6 space-y-5 relative overflow-hidden">
      {isScanning && (
        <div className="absolute top-0 left-0 w-full h-[2px] t-accent-bg blur-[2px] shadow-[0_0_8px_var(--accent)] animate-bounce" />
      )}

      <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b t-border pb-4 gap-3">
        <div className="space-y-1">
          <span className="text-xs font-mono t-text-muted uppercase tracking-widest block font-bold">
            {t("dashboard.scanner.title")}
          </span>
          <div className="flex items-center gap-2 font-mono text-sm font-bold t-text">
            <Wifi className="w-4 h-4 t-text-accent" />
            <span>
              {isScanning ? t("dashboard.scanner.status_sweeping") : t("dashboard.scanner.status_calibrated")}
            </span>
          </div>
        </div>

        <button
          onClick={handleSweepScan}
          disabled={isScanning}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold tracking-wider uppercase border transition-all ${
            isScanning
              ? "t-accent-muted t-border-accent t-text-accent animate-pulse cursor-not-allowed"
              : "t-bg-secondary hover:t-bg-card t-border hover:t-border-accent t-text"
          }`}
        >
          {isScanning ? `${t("dashboard.scanner.btn_scanning")} ${scanProgress}%` : t("dashboard.scanner.btn_trigger")}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {nodes.map((node) => (
          <div
            key={node.id}
            className="p-5 rounded-xl t-bg-secondary border t-border w-full flex flex-col justify-between space-y-3 group transition-all hover:t-border-accent"
          >
            <div className="flex justify-between items-start">
              <span className="text-base font-mono font-bold t-text">
                {t(`dashboard.scanner.node_${node.id}`)}
              </span>
              <span
                className={`inline-block w-2.5 h-2.5 rounded-full ${
                  isScanning
                    ? "bg-yellow-400 animate-ping"
                    : node.status === "attention"
                    ? "bg-red-400 animate-pulse shadow-[0_0_8px_rgba(248,113,113,0.5)]"
                    : "t-accent-bg shadow-[0_0_8px_var(--accent)] animate-pulse"
                }`}
              />
            </div>

            <div className="flex justify-between items-end font-mono">
              <div className="space-y-1.5 text-xs t-text-secondary">
                <div>
                  {t("dashboard.scanner.traffic")}{" "}
                  <span className="t-text font-bold uppercase">
                    {isScanning ? t("dashboard.scanner.sweeping") : t(`dashboard.scanner.traffic_${node.traffic}`)}
                  </span>
                </div>
                <div>
                  {t("dashboard.scanner.delay_stat")}{" "}
                  <span className="t-text font-bold">
                    1/{node.ping * 4} {t("dashboard.scanner.sec")}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-base t-text-accent font-bold block">
                  {isScanning ? "..." : `${node.ping} ms`}
                </span>
                <span className="text-xs t-text-muted uppercase tracking-widest block mt-0.5">
                  {t("dashboard.scanner.core_delay")}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
