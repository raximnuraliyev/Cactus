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
  Eye,
  Brain,
  Zap,
  Star,
  Crown,
  Trophy,
  Lock,
  CheckCircle2
} from "lucide-react";
import { SpotlightHover } from "./ui/spotlight-hover";
import type { ScenarioTemplate, ScenarioType, DifficultyLevel } from "../types";
import PlacementView from "./PlacementView";
import DashboardGameModal from "./DashboardGameModal";

const HighlightBlock = ({ 
  isActive, 
  tooltipNode, 
  children, 
  className 
}: { 
  isActive: boolean, 
  tooltipNode: React.ReactNode, 
  children: React.ReactNode, 
  className?: string 
}) => {
  return (
    <div className={`relative transition-all duration-500 rounded-xl ${isActive ? "z-[70] scale-[1.02] bg-gray-900 ring-2 ring-green-500 shadow-[0_0_50px_rgba(74,222,128,0.3)]" : "z-10"} ${className || ''}`}>
      {children}
      {isActive && tooltipNode}
    </div>
  );
};

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
  const [showGameModal, setShowGameModal] = useState(false);

  // Guided Tour Setup
  const TOUR_STEPS = [
    { id: "profile", title: "Agent Profile", desc: "Your identity, rank, and current experience level. Keep your streak alive to earn XP multipliers!" },
    { id: "challenge", title: "Daily Critical Dispatch", desc: "Complete these unique daily scenarios to earn rare badges and massive XP boosts." },
    { id: "actions", title: "Action Center", desc: "Jump into quick play scenarios, manage your tournaments, or train your stats." },
    { id: "stats", title: "Character Stats", desc: "Your 4 core detective traits. High Intuition gives hints, high Resilience slows down pressure timers." },
    { id: "reputation", title: "City Reputation", desc: "Your overall standing in the anti-fraud division. Reach higher tiers to unlock legendary cases." }
  ];

  const [tourStep, setTourStep] = useState<number | null>(() => {
    return sessionStorage.getItem(`dashboard_tour_done_${user?.username}`) ? null : 0;
  });
  const [focusedSection, setFocusedSection] = useState<string | null>(null);

  const handleNextTour = () => {
    if (tourStep !== null && tourStep < TOUR_STEPS.length - 1) {
      setTourStep(tourStep + 1);
    } else {
      setTourStep(null);
      sessionStorage.setItem(`dashboard_tour_done_${user?.username}`, "true");
    }
  };

  const activeOverlayId = tourStep !== null ? TOUR_STEPS[tourStep].id : focusedSection;
  const isOverlayActive = activeOverlayId !== null;

  const renderTooltip = (sectionId: string) => {
    if (activeOverlayId !== sectionId) return null;
    const stepDef = TOUR_STEPS.find(s => s.id === sectionId);
    if (!stepDef) return null;

    return (
      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-72 bg-gray-900 border border-green-500/50 p-4 rounded-xl shadow-[0_0_30px_rgba(74,222,128,0.2)] z-[100] animate-fade-in pointer-events-auto text-left">
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 border-8 border-transparent border-b-green-500/50" />
        <h4 className="text-green-400 font-black tracking-widest uppercase mb-2">{t(`dashboard_tour.${stepDef.id}`) || stepDef.title}</h4>
        <p className="text-sm text-gray-300 mb-4 leading-relaxed">{t(`dashboard_tour.${stepDef.id}_desc`) || stepDef.desc}</p>
        
        {tourStep !== null ? (
          <div className="flex items-center justify-between mt-2">
            <div className="flex gap-1.5">
              {TOUR_STEPS.map((_, i) => (
                <div key={i} className={`w-2 h-2 rounded-full ${i === tourStep ? "bg-green-400" : "bg-gray-600"}`} />
              ))}
            </div>
            <button 
              onClick={handleNextTour}
              className="flex items-center gap-1 px-4 py-2 bg-green-500 hover:bg-green-400 text-black font-bold rounded-lg transition-colors text-xs uppercase"
            >
              {tourStep < TOUR_STEPS.length - 1 ? "NEXT" : "FINISH"}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex justify-end mt-2">
            <button 
              onClick={() => setFocusedSection(null)}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-bold rounded-lg transition-colors"
            >
              DISMISS
            </button>
          </div>
        )}
      </div>
    );
  };

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
    <div className="pb-24 animate-fade-in relative min-h-screen">
      
      {/* Tour Overlay Backdrop */}
      <div 
        className={`fixed inset-0 z-[60] bg-black/70 transition-all pointer-events-auto ${isOverlayActive ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => { if(focusedSection) setFocusedSection(null) }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* ========================================== */}
        {/* LEFT COLUMN: Actions & Identity (7 cols)   */}
        {/* ========================================== */}
        <div className="lg:col-span-7 flex flex-col gap-6">

          {/* Profile details block */}
          <HighlightBlock isActive={activeOverlayId === 'profile'} tooltipNode={renderTooltip('profile')}>
            <div className="relative p-6 glass-card group rounded-xl h-full">
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
                    <span>â€¢</span>
                    <span>Games: {user.stats?.totalGames || 0}</span>
                    <span>â€¢</span>
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

              <button 
                onClick={() => setShowGameModal(true)}
                className="w-full mt-4 py-3 bg-gradient-to-r from-green-500/10 to-transparent hover:from-green-500/20 border border-green-500/30 hover:border-green-500/50 rounded-xl text-green-400 font-mono font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-2"
              >
                <Terminal className="w-4 h-4" />
                Train Stats (Simulator)
              </button>
            </div>
            </div>
          </HighlightBlock>

          {/* Daily Challenge banner */}
          <HighlightBlock isActive={activeOverlayId === 'challenge'} tooltipNode={renderTooltip('challenge')}>
            <div className="relative overflow-hidden p-6 glass-card-accent rounded-xl shadow-[0_0_20px_var(--accent-muted)]">
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
          </HighlightBlock>

          {/* Category selection / Action Center */}
          <HighlightBlock isActive={activeOverlayId === 'actions'} tooltipNode={renderTooltip('actions')}>
            <div className="glass-card p-6 relative rounded-xl h-full">
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
          </HighlightBlock>
        </div>

        {/* ========================================== */}
        {/* RIGHT COLUMN: Stats & Reputation (5 cols)  */}
        {/* ========================================== */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Layer 2: Character Stats */}
          <HighlightBlock isActive={activeOverlayId === 'stats'} tooltipNode={renderTooltip('stats')}>
            <CharacterStatsBlock />
          </HighlightBlock>

          {/* Layer 3: City Reputation */}
          <HighlightBlock isActive={activeOverlayId === 'reputation'} tooltipNode={renderTooltip('reputation')}>
            <ReputationBlock />
          </HighlightBlock>

          {/* Neural Threat Diagnostic */}
          <div className="relative space-y-3">
            <h3 className="text-sm font-mono font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-400 animate-pulse" />
              {t("neural_lab")}
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              {t("neural_lab_desc")}
            </p>
            <NeuralThreatDiagnostic />
          </div>

          {/* Layer 7: Achievements */}
          <AchievementsBlock />

        </div>

      </div>

      {/* Game Modal rendered outside grid */}
      {showGameModal && <DashboardGameModal onClose={() => setShowGameModal(false)} />}
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

function ReputationBlock() {
  const { user } = useAuth();
  const { t } = useI18n();
  const rep = user?.stats?.reputation || 0;
  
  let tier = 0;
  let color = "text-gray-400";
  let bg = "bg-gray-400/10";
  let border = "border-gray-500/30";
  let shadow = "";
  
  if (rep >= 91) {
    tier = 4;
    color = "text-cyan-300";
    bg = "bg-cyan-400/20";
    border = "border-cyan-400/50";
    shadow = "shadow-[0_0_25px_rgba(34,211,238,0.5)]";
  } else if (rep >= 71) {
    tier = 3;
    color = "text-yellow-400";
    bg = "bg-yellow-400/20";
    border = "border-yellow-400/50";
    shadow = "shadow-[0_0_20px_rgba(250,204,21,0.4)]";
  } else if (rep >= 41) {
    tier = 2;
    color = "text-slate-200";
    bg = "bg-slate-300/20";
    border = "border-slate-300/50";
  } else if (rep >= 21) {
    tier = 1;
    color = "text-orange-300";
    bg = "bg-orange-300/20";
    border = "border-orange-300/40";
  }

  return (
    <div className="glass-card p-6 flex flex-col md:flex-row items-center gap-6 overflow-hidden relative h-full">
      {tier >= 3 && (
        <div className={`absolute top-0 left-0 w-full h-full ${tier === 4 ? 'animate-pulse' : ''} pointer-events-none opacity-20`} style={{ background: 'radial-gradient(circle at center, var(--accent) 0%, transparent 70%)'}} />
      )}
      <div className={`w-20 h-20 rounded-full flex-shrink-0 flex items-center justify-center border-4 ${color} ${bg} ${border} ${shadow} z-10`}>
        <span className="text-3xl font-black font-mono">{rep}</span>
      </div>
      <div className="text-center md:text-left z-10 flex-1">
        <h3 className="text-xs font-mono font-bold t-text-muted uppercase tracking-widest mb-1">
          {t("dash_rep_title") || "City Reputation"}
        </h3>
        <h2 className={`text-2xl font-bold uppercase tracking-wide ${color}`}>
          {t(`dash_rep_tier_${tier}`)}
        </h2>
        <div className="mt-3 h-2 w-full max-w-md bg-black/40 rounded-full overflow-hidden border border-white/10">
          <div 
            className={`h-full rounded-full ${color.replace('text-', 'bg-')} transition-all duration-1000`} 
            style={{ width: `${rep}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function CharacterStatsBlock() {
  const { user } = useAuth();
  const { t } = useI18n();
  const stats = user?.stats;
  
  const eye = Math.min(50, stats?.awareness || 0);
  const brain = Math.min(50, stats?.intuition || 0);
  const bolt = Math.min(50, stats?.speed || 0);
  const shield = Math.min(50, stats?.resilience || 0);

  // Calculate polygon points for radar chart (max 50)
  // Center is 100,100, radius is 80
  const getPoint = (val: number, angle: number) => {
    const r = (val / 50) * 80;
    const rad = (angle - 90) * (Math.PI / 180);
    return `${100 + r * Math.cos(rad)},${100 + r * Math.sin(rad)}`;
  };

  const points = `${getPoint(eye, 0)} ${getPoint(bolt, 90)} ${getPoint(shield, 180)} ${getPoint(brain, 270)}`;

  const statItems = [
    { id: "eye", val: eye, icon: Eye, color: "text-emerald-400", bg: "bg-emerald-400" },
    { id: "brain", val: brain, icon: Brain, color: "text-purple-400", bg: "bg-purple-400" },
    { id: "bolt", val: bolt, icon: Zap, color: "text-orange-400", bg: "bg-orange-400" },
    { id: "shield", val: shield, icon: Shield, color: "text-red-400", bg: "bg-red-400" },
  ];

  return (
    <div className="glass-card p-6 h-full">
      <h3 className="text-sm font-mono font-bold t-text-accent uppercase tracking-widest mb-6 flex items-center gap-2">
        <Activity className="w-5 h-5" />
        {t("dash_stats_title") || "Character Stats"}
      </h3>
      
      <div className="flex flex-col lg:flex-row items-center gap-8">
        {/* Radar Chart */}
        <div className="relative w-48 h-48 flex-shrink-0">
          <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-[0_0_15px_rgba(0,0,0,0.5)]">
            {/* Grid */}
            <polygon points="100,20 180,100 100,180 20,100" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
            <polygon points="100,40 160,100 100,160 40,100" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
            <polygon points="100,60 140,100 100,140 60,100" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
            <polygon points="100,80 120,100 100,120 80,100" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
            
            {/* Axis */}
            <line x1="100" y1="20" x2="100" y2="180" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
            <line x1="20" y1="100" x2="180" y2="100" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
            
            {/* Data Polygon */}
            <polygon 
              points={points} 
              fill="var(--accent-muted)" 
              stroke="var(--accent)" 
              strokeWidth="2"
              className="opacity-70 transition-all duration-1000"
            />
          </svg>
          
          <Eye className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 w-4 h-4 text-emerald-400" />
          <Zap className="absolute top-1/2 right-0 translate-x-2 -translate-y-1/2 w-4 h-4 text-orange-400" />
          <Shield className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-2 w-4 h-4 text-red-400" />
          <Brain className="absolute top-1/2 left-0 -translate-x-2 -translate-y-1/2 w-4 h-4 text-purple-400" />
        </div>
        
        {/* Stat Bars */}
        <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
          {statItems.map(item => (
            <div key={item.id} className="t-bg-secondary p-4 rounded-xl border t-border relative overflow-hidden group">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <item.icon className={`w-4 h-4 ${item.color}`} />
                  <span className="font-bold t-text uppercase text-sm">{t(`dash_stats_${item.id}`)}</span>
                </div>
                <span className={`font-mono font-black ${item.color}`}>{item.val}/50</span>
              </div>
              <p className="text-[10px] t-text-muted font-mono mb-3 uppercase tracking-wider h-6">
                {t(`dash_stats_${item.id}_desc`)}
              </p>
              <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${item.bg} transition-all duration-1000 group-hover:brightness-125`}
                  style={{ width: `${(item.val / 50) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AchievementsBlock() {
  const { user } = useAuth();
  const { t } = useI18n();
  
  const unlockedIds = user?.achievements?.map(a => a.id) || [];
  
  const achievements = [
    { id: "first_blood", rarity: "common", color: "text-slate-400", bg: "bg-slate-400/10", border: "border-slate-400/30", pct: 84.2 },
    { id: "unbreakable", rarity: "epic", color: "text-purple-400", bg: "bg-purple-400/10", border: "border-purple-400/30", pct: 12.5 },
    { id: "sherlock", rarity: "rare", color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/30", pct: 28.7 },
    { id: "trollmaster", rarity: "epic", color: "text-purple-400", bg: "bg-purple-400/10", border: "border-purple-400/30", pct: 8.9 },
    { id: "legend", rarity: "legendary", color: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-yellow-400/50", pct: 1.2 },
    { id: "boss", rarity: "legendary", color: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-yellow-400/50", pct: 0.5 },
  ];

  return (
    <div className="glass-card p-6">
      <h3 className="text-sm font-mono font-bold t-text-accent uppercase tracking-widest mb-4 flex items-center gap-2">
        <Trophy className="w-5 h-5" />
        {t("dash_achievements_title") || "Achievements"}
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {achievements.map(achv => {
          const isUnlocked = unlockedIds.includes(achv.id);
          return (
            <div 
              key={achv.id} 
              className={`p-4 rounded-xl border transition-all duration-300 relative overflow-hidden group ${
                isUnlocked 
                  ? `t-bg-secondary ${achv.border} hover:-translate-y-1 hover:shadow-[0_4px_15px_rgba(0,0,0,0.3)]` 
                  : "t-bg-card t-border opacity-50 grayscale hover:grayscale-0"
              }`}
            >
              {isUnlocked && achv.rarity === 'legendary' && (
                <div className="absolute inset-0 bg-gradient-to-tr from-yellow-400/5 to-transparent pointer-events-none" />
              )}
              
              <div className="flex gap-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${isUnlocked ? achv.bg + ' ' + achv.color : 'bg-black/40 text-gray-500'}`}>
                  {isUnlocked ? (
                    achv.rarity === 'legendary' ? <Crown className="w-6 h-6" /> :
                    achv.rarity === 'epic' ? <Star className="w-6 h-6" /> :
                    <Award className="w-6 h-6" />
                  ) : (
                    <Lock className="w-6 h-6" />
                  )}
                </div>
                
                <div className="flex-1">
                  <h4 className={`font-bold text-sm ${isUnlocked ? achv.color : 'text-gray-500'} mb-1`}>
                    {t(`dash_achv_${achv.id}`)}
                  </h4>
                  <p className="text-[10px] leading-tight t-text-secondary line-clamp-2 mb-2">
                    {t(`dash_achv_${achv.id}_desc`)}
                  </p>
                  
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-[9px] font-mono uppercase tracking-wider text-gray-500">
                      {isUnlocked ? "Unlocked" : "Locked"}
                    </span>
                    <span className="text-[9px] font-mono text-gray-400">
                      {achv.pct}% of players
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

