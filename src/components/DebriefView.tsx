import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useI18n } from "../i18n";
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

  const handlePlayAgain = () => {
    clearSession();
    navigate("/home");
  };

  const handleGoHome = () => {
    clearSession();
    navigate("/home");
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto py-2 animate-fade-in pb-20">
      
      {/* Animated Verdict Title Banner */}
      <div className={`relative overflow-hidden p-8 rounded-2xl border text-center relative ${
        result.correct 
          ? "border-green-500/30 bg-green-500/5 shadow-[0_0_20px_rgba(0,255,0,0.05)]" 
          : "border-red-500/30 bg-red-500/5 shadow-[0_0_20px_rgba(239,68,68,0.05)]"
      }`}>
        <SpotlightHover className={result.correct ? "from-green-500/10" : "from-red-500/10"} />
        
        <div className="relative z-10 flex flex-col items-center justify-center space-y-3">
          {result.correct ? (
            <CheckCircle className="w-16 h-16 text-green-400 animate-bounce" />
          ) : (
            <XCircle className="w-16 h-16 text-red-400 animate-shake" />
          )}

          <h2 className={`text-xl md:text-2xl font-light tracking-wide ${
            result.correct ? "text-green-400" : "text-red-400"
          }`}>
            {getTranslatedTitle()}
          </h2>

          <div className="flex items-center gap-1.5 border t-border t-bg-secondary px-4 py-1 rounded-full text-[10px] font-mono font-bold tracking-widest t-text-secondary">
            CASE RATING: {result.correct ? "GRADE S" : "GRADE F"}
          </div>
        </div>
      </div>

      {/* Ticker score transfer card */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl p-5 t-bg-card t-border flex flex-col items-center justify-center text-center glass-card">
          <Award className="w-5 h-5 t-text-accent mb-1 animate-pulse" />
          <span className="text-[10px] font-mono t-text-secondary uppercase tracking-widest">{t("debrief_page.xp_gained")}</span>
          <span className="text-3xl font-bold t-text font-mono mt-1">
            +{animatedScore} <span className="text-xs t-text-accent">XP</span>
          </span>
        </div>

        <div className="rounded-2xl p-5 t-bg-card t-border flex flex-col items-center justify-center text-center glass-card">
          <Flame className="w-5 h-5 text-orange-500 mb-1 fill-orange-500" />
          <span className="text-[10px] font-mono t-text-secondary uppercase tracking-widest">Accuracy Rating</span>
          <span className="text-3xl font-bold t-text font-mono mt-1">
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
                className={`p-3.5 border rounded-xl flex items-start gap-3 text-xs leading-relaxed transition-all ${
                  wasFound 
                    ? "t-border-accent t-accent-muted t-text" 
                    : "border-red-500/20 bg-red-500/5 t-text-secondary"
                }`}
              >
                <div className="shrink-0 mt-0.5">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold ${
                    wasFound 
                      ? "t-accent-bg" 
                      : "bg-red-500/20 text-red-400 border border-red-400/30"
                  }`}>
                    {wasFound ? "✓" : "✗"}
                  </span>
                </div>
                <div>
                  <span className={`text-[10px] font-mono font-semibold block uppercase mb-1 ${wasFound ? "t-text-accent" : "text-red-400"}`}>
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
          className="flex items-center justify-center gap-2 t-accent-bg hover:brightness-110 rounded-full py-4 font-semibold text-xs tracking-wider uppercase active:scale-98 transition-all"
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
