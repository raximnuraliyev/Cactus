import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useI18n } from "../i18n";
import { useAuth } from "../contexts/AuthContext";
import { useGame } from "../contexts/GameContext";
import { ScenarioTemplate } from "../types";
import { 
  CheckCircle, 
  XCircle, 
  Award, 
  Cpu, 
  Share2, 
  MessageSquareWarning,
  Flame,
  Play,
  Home
} from "lucide-react";
import { SpotlightHover } from "./ui/spotlight-hover";

export default function DebriefView() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useI18n();
    const { clearSession } = useGame();
    const { user, updateUser } = useAuth();

  const routeState = location.state as {
    scenario?: ScenarioTemplate;
    result?: {
      correct: boolean;
      xpGained: number;
      debriefText: string;
      cluesFound: string[];
      breakdown?: import('../types').PostGameBreakdown;
    };
    verdictGiven?: string;
  } | null;

  if (!routeState?.scenario || !routeState?.result) {
    navigate("/home");
    return null;
  }

  const { scenario, result, verdictGiven } = routeState;
  const [animatedScore, setAnimatedScore] = useState(0);

  // Score rolling loading ticker animation
  useEffect(() => {
    let start = 0;
    const end = result.xpGained;
    if (end === 0) return;
    const duration = 1000;
    const stepTime = Math.max(16, Math.abs(Math.floor(duration / end)));
    
    const timer = setInterval(() => {
      start += Math.ceil(end / 40);
      if (start >= end) {
        setAnimatedScore(end);
        clearInterval(timer);
      } else {
        setAnimatedScore(start);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [result.xpGained]);

  const getTranslatedTitle = () => {
    if (result.correct) {
      return t("debrief_page.verdict_true");
    } else {
      return t("debrief_page.verdict_false");
    }
  };

  const handleShareResult = () => {
    const shareMessage = `🕵️‍♂️ Real or Fake? anti-fraud game result!\n🎯 Verdict: ${
      result.correct ? "SUCCESSFUL DETECTIVE Work" : "COMPROMISED"
    }\n🏆 Score Gained: ${result.xpGained} XP\n🔥 Play & test your cyber security vigilance inside Telegram!`;
    
    const url = `https://t.me/share/url?url=https://ai.studio/build&text=${encodeURIComponent(shareMessage)}`;
    window.open(url, "_blank");
  };

  const updateLocalUserStats = () => {
    if (user?.stats) {
      updateUser({
        stats: {
          ...user.stats,
          placementGamesPlayed: Math.min(5, (user.stats.placementGamesPlayed || 0) + 1),
          totalXp: (user.stats.totalXp || 0) + (result?.xpEarned || 0),
          elo: result?.breakdown?.newElo || user.stats.elo
        }
      });
    }
  };

  const handlePlayAgain = () => {
    updateLocalUserStats();
    clearSession();
    navigate("/home");
  };

  const handleGoHome = () => {
    updateLocalUserStats();
    clearSession();
    navigate("/home");
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto py-2 animate-fade-in pb-20">
      
      {/* Animated Verdict Title Banner */}
      <div className={`relative overflow-hidden p-8 rounded-2xl text-center relative ${
        result.correct 
          ? "bg-[#1EB863] text-black border-b-4 border-[#168a4a]" 
          : "bg-red-500 text-white border-b-4 border-red-700"
      }`}>
        <SpotlightHover className={result.correct ? "from-green-200/50" : "from-red-200/50"} />
        
        <div className="relative z-10 flex flex-col items-center justify-center space-y-3">
          {result.correct ? (
            <CheckCircle className="w-16 h-16 text-black animate-bounce" />
          ) : (
            <XCircle className="w-16 h-16 text-white animate-shake" />
          )}

          <h2 className={`text-3xl font-extrabold tracking-wide ${
            result.correct ? "text-black" : "text-white"
          }`}>
            {getTranslatedTitle()}
          </h2>

          <div className={`flex items-center gap-1.5 border-2 px-4 py-1 rounded-full text-[10px] font-mono font-bold tracking-widest ${
            result.correct ? "border-black/20 text-black" : "border-white/20 text-white"
          }`}>
            CASE RATING: {result.correct ? "GRADE S" : "GRADE F"}
          </div>
        </div>
      </div>

      {/* Ticker score transfer card */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl p-5 bg-white dark:bg-[#13191E] border-2 border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center text-center">
          <Award className="w-5 h-5 text-[#1EB863] mb-1 animate-pulse" />
          <span className="text-[10px] font-mono t-text-secondary uppercase tracking-widest">{t("debrief_page.xp_gained")}</span>
          <span className="text-3xl font-extrabold text-[#1EB863] font-mono mt-1 drop-shadow-sm">
            +{animatedScore} <span className="text-xs text-[#1EB863]">XP</span>
          </span>
        </div>

        <div className="rounded-2xl p-5 bg-white dark:bg-[#13191E] border-2 border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center text-center">
          <Flame className="w-5 h-5 text-orange-500 mb-1 fill-orange-500" />
          <span className="text-[10px] font-mono t-text-secondary uppercase tracking-widest">Accuracy Rating</span>
          <span className="text-3xl font-extrabold t-text font-mono mt-1 drop-shadow-sm">
            {result.correct ? 100 : 0}%
          </span>
        </div>
      </div>

      {result.breakdown && (
        <div className="glass-card p-5 mt-4 space-y-3">
          <h4 className="text-xs font-mono t-text-accent uppercase tracking-widest flex items-center gap-1.5 mb-2">
            XP Breakdown & ELO Rating
          </h4>
          <div className="space-y-1.5 text-sm font-mono t-text-secondary">
            <div className="flex justify-between"><span>Base (Correct Verdict)</span> <span>+{result.breakdown.correctVerdict}</span></div>
            <div className="flex justify-between"><span>Clues Found</span> <span>+{result.breakdown.cluesFound}</span></div>
            <div className="flex justify-between"><span>Tools Used</span> <span>+{result.breakdown.toolsUsed}</span></div>
            <div className="flex justify-between"><span>Speed Bonus</span> <span>+{result.breakdown.speedBonus}</span></div>
            <div className="flex justify-between"><span>Fraud Type Guessed</span> <span>+{result.breakdown.fraudTypeGuessed}</span></div>
            <div className="flex justify-between"><span>Daily Challenge Bonus</span> <span>+{result.breakdown.dailyChallengeBonus}</span></div>
            <div className="flex justify-between"><span>Streak Bonus</span> <span>+{result.breakdown.streakBonus}</span></div>
            <div className="flex justify-between t-danger"><span>Hint Penalty</span> <span>{result.breakdown.hintPenalty}</span></div>
            <hr className="t-border my-2" />
            <div className="flex justify-between t-text-accent font-bold"><span>Total XP</span> <span>+{result.breakdown.totalXp}</span></div>
            
            <div className="mt-4 flex items-center justify-between p-3 t-bg-secondary rounded-lg border t-border">
              <span>Rating Change (ELO)</span>
              <div className="flex items-center gap-2">
                <span className="t-text-muted">{result.breakdown.oldElo}</span>
                <span>→</span>
                <span className="t-text-accent font-bold">{result.breakdown.newElo}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cyber AI analysis feedback paragraph */}
      <div className="glass-card p-6 space-y-3">
        <h3 className="text-xs font-mono t-text-accent uppercase tracking-widest flex items-center gap-2">
          <Cpu className="w-4 h-4 t-text-accent" />
          Neural forensics debriefing
        </h3>
        <p className="text-sm t-text-secondary font-sans tracking-wide leading-relaxed pl-4 border-l t-border-accent">
          {result.debriefText}
        </p>

        <div className="pt-3 border-t t-border flex items-center gap-2 font-mono text-xs t-text-muted">
          <span>COGNITIVE METHOD IDENTIFIED:</span>
          <span className="t-text-accent font-semibold uppercase">{scenario.tactic}</span>
        </div>
      </div>

      {/* Red flag indicators: Found vs Overlooked */}
      <div className="glass-card p-5 space-y-4">
        <h4 className="text-xs font-mono t-text-accent uppercase tracking-widest flex items-center gap-1.5">
          <MessageSquareWarning className="w-4 h-4 t-text-accent" />
          {t("debrief_page.clues_analyzed")}
        </h4>

        {/* List of critical clues */}
        <div className="space-y-3">
          {scenario.clues.map((clue, idx) => {
            const wasFound = result.cluesFound.includes(clue) || (result.correct && scenario.isRealCharacter);
            return (
              <div 
                key={idx} 
                className={`p-3.5 border-2 rounded-xl flex items-start gap-3 text-sm font-bold transition-all ${
                  wasFound 
                    ? "bg-[#1EB863]/20 text-black dark:text-white border-[#1EB863]" 
                    : "bg-red-100 dark:bg-red-950/40 text-red-800 dark:text-red-400 border-red-300 dark:border-red-500/50"
                }`}
              >
                <div className="shrink-0 mt-0.5">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold ${
                    wasFound 
                      ? "bg-[#1EB863] text-black" 
                      : "bg-red-500 text-white"
                  }`}>
                    {wasFound ? "✓" : "✗"}
                  </span>
                </div>
                <div>
                  <span className={`text-[10px] font-mono font-extrabold block uppercase mb-1 ${wasFound ? "text-green-700 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                    {wasFound ? "Evidence Uncovered" : "Overlooked Signal"}
                  </span>
                  <p>{clue}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <button
          onClick={handlePlayAgain}
          className="flex items-center justify-center gap-2 btn-primary py-4 uppercase"
        >
          <Play className="w-4 h-4 fill-current" />
          {t("debrief_page.play_again")}
        </button>

        <button
          onClick={handleShareResult}
          className="flex items-center justify-center gap-2 t-bg-secondary hover:t-bg-card t-border hover:t-border-accent t-text-secondary hover:t-text rounded-full py-4 font-semibold text-xs tracking-wider uppercase active:scale-98 transition-all"
        >
          <Share2 className="w-4 h-4" />
          Share Case Report
        </button>

        <button
          onClick={handleGoHome}
          className="flex items-center justify-center gap-2 t-bg hover:t-bg-secondary t-border t-text-muted hover:t-text-secondary rounded-full py-4 font-semibold text-xs tracking-wider uppercase active:scale-98 transition-all"
        >
          <Home className="w-4 h-4" />
          {t("debrief_page.go_home")}
        </button>
      </div>
    </div>
  );
}
