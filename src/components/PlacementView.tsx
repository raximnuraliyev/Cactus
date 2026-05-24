import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useGame } from "../contexts/GameContext";
import { useI18n } from "../i18n";
import { 
  STARTING_ELO_OPTIONS, 
  ATTENTION_MODIFIERS, 
  PLACEMENT_SCENARIOS,
  getLevelFromXp
} from "../levelData";
import { 
  Target, 
  BrainCircuit, 
  ShieldAlert, 
  Play, 
  Award,
  ChevronRight,
  SkipForward
} from "lucide-react";

export default function PlacementView() {
  const { user, updateUser } = useAuth();
  const { startGame } = useGame();
  const { t, lang } = useI18n();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [q1Value, setQ1Value] = useState<number | null>(null);
  const [q2Value, setQ2Value] = useState<number | null>(null);

  if (!user) return null;

  const placementGamesPlayed = user.stats?.placementGamesPlayed || 0;

  const handleQuestionnaireSubmit = () => {
    if (q1Value === null || q2Value === null) return;
    
    const initialElo = q1Value + q2Value;
    
    updateUser({
      stats: {
        ...user.stats,
        elo: initialElo,
        placementGamesPlayed: 1 // Start at match 1 after questionnaire
      }
    });
  };

  const startPlacementMatch = async () => {
    try {
      // Find the appropriate placement scenario based on progress
      const difficultyMap: Record<string, any> = {
        "Easy": "easy",
        "Medium": "medium",
        "Hard": "hard",
        "Adaptive": undefined // Random difficulty
      };
      const diff = difficultyMap[matchConfig.label];
      
      const res = await startGame(undefined, diff);
      navigate(`/game/${res.sessionId}`);
    } catch (err) {
      console.error(err);
    }
  };

  // Questionnaire Phase (First Launch)
  if (placementGamesPlayed === 0) {
    return (
      <div className="p-4 sm:p-6 w-full max-w-lg mx-auto space-y-6 animate-fade-in pb-24">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full t-accent-muted t-border-accent border-2 flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(74,222,128,0.2)]">
            <BrainCircuit className="w-8 h-8 t-text-accent" />
          </div>
          <h1 className="text-2xl font-bold t-text tracking-wide mb-2">{t("placement.cognitive_calibration") || "Cognitive Calibration"}</h1>
          <p className="t-text-secondary text-sm">
            {t("placement.calibration_desc") || "Before we assign your first cases, we need to calibrate your neural baseline."}
          </p>
        </div>

        <div className="space-y-6">
          {step === 1 && (
            <div className="glass-card p-6 space-y-4 animate-fade-in">
              <h3 className="text-lg font-semibold t-text border-b t-border pb-3">
                {t("placement.q1") || "1. How familiar are you with digital fraud tactics?"}
              </h3>
              <div className="space-y-3">
                {STARTING_ELO_OPTIONS.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setQ1Value(opt.elo);
                      setTimeout(() => setStep(2), 300);
                    }}
                    className={`w-full text-left px-4 py-4 rounded-xl border transition-all flex items-center justify-between ${
                      q1Value === opt.elo 
                        ? "t-border-accent t-accent-bg shadow-md" 
                        : "t-bg border-transparent hover:t-border-accent t-text"
                    }`}
                  >
                    <span className="font-medium">
                      {lang === 'ru' ? opt.labelRu : (lang === 'uz' ? opt.labelUz : opt.label)}
                    </span>
                    {q1Value === opt.elo && <Target className="w-5 h-5 opacity-80" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="glass-card p-6 space-y-4 animate-fade-in">
              <button 
                onClick={() => setStep(1)}
                className="text-[10px] uppercase font-mono t-text-muted hover:t-text-secondary flex items-center mb-2"
              >
                ← {t("placement.back") || "Back"}
              </button>
              <h3 className="text-lg font-semibold t-text border-b t-border pb-3">
                {t("placement.q2") || "2. How would you rate your daily attentiveness?"}
              </h3>
              <div className="space-y-3">
                {ATTENTION_MODIFIERS.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => setQ2Value(opt.modifier)}
                    className={`w-full text-left px-4 py-4 rounded-xl border transition-all flex items-center justify-between ${
                      q2Value === opt.modifier 
                        ? "t-border-accent t-accent-bg shadow-md" 
                        : "t-bg border-transparent hover:t-border-accent t-text"
                    }`}
                  >
                    <span className="font-medium">
                      {lang === 'ru' ? opt.labelRu : (lang === 'uz' ? opt.labelUz : opt.label)}
                    </span>
                    {q2Value === opt.modifier && <Target className="w-5 h-5 opacity-80" />}
                  </button>
                ))}
              </div>

              {q2Value !== null && (
                <button
                  onClick={handleQuestionnaireSubmit}
                  className="w-full mt-6 py-4 t-accent-bg rounded-xl font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-green-500/20 active:scale-95 transition-all"
                >
                  <BrainCircuit className="w-5 h-5" />
                  {t("placement.initialize") || "Initialize Profile"}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Calibration Phase (Matches 1-5)
  const currentMatch = Math.min(placementGamesPlayed, 5);
  const matchConfig = PLACEMENT_SCENARIOS[currentMatch - 1] || PLACEMENT_SCENARIOS[0];

  return (
    <div className="p-4 sm:p-6 w-full max-w-md mx-auto space-y-6 animate-fade-in pb-24">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full t-bg-secondary border t-border mb-4">
          <Target className="w-4 h-4 t-text-accent mr-2" />
          <span className="text-xs font-mono font-bold uppercase tracking-widest t-text">
            {t("placement.calibration_phase") || "Calibration Phase"}
          </span>
        </div>
        <h1 className="text-2xl font-bold t-text tracking-wide mb-2">
          {t("placement.match") || "Placement Match"} {currentMatch}/5
        </h1>
        <p className="t-text-secondary text-sm">
          {t("placement.match_desc") || "Your performance in these initial cases will determine your starting rank and difficulty curve."}
        </p>
      </div>

      <div className="glass-card p-6 space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl" />
        
        <div className="flex justify-between items-end border-b t-border pb-4 relative z-10">
          <div>
            <span className="text-[10px] font-mono t-text-muted uppercase tracking-wider block mb-1">
              {t("placement.baseline_elo") || "Current Baseline ELO"}
            </span>
            <span className="text-3xl font-mono font-bold t-text">
              {user.stats?.elo || 600}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-mono t-text-muted uppercase tracking-wider block mb-1">
              {t("placement.match_difficulty") || "Match Difficulty"}
            </span>
            <span className="text-sm font-semibold t-text-accent px-2 py-1 rounded t-bg-secondary border t-border">
              {matchConfig.label}
            </span>
          </div>
        </div>

        <div className="space-y-4 relative z-10">
          <div className="flex justify-between text-xs t-text-secondary">
            <span>{t("placement.progress") || "Progress"}</span>
            <span>{currentMatch - 1} / 5</span>
          </div>
          <div className="h-2 w-full t-bg rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-500 rounded-full transition-all duration-1000"
              style={{ width: `${((currentMatch - 1) / 5) * 100}%` }}
            />
          </div>
          
          <div className="flex justify-between pt-2">
            {[1, 2, 3, 4, 5].map((num) => (
              <div 
                key={num} 
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border transition-all ${
                  num < currentMatch 
                    ? "t-accent-bg t-border-accent" 
                    : num === currentMatch
                      ? "t-bg-card t-border-accent t-text-accent shadow-[0_0_10px_rgba(74,222,128,0.3)]"
                      : "t-bg t-border t-text-muted"
                }`}
              >
                {num}
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={startPlacementMatch}
          className="w-full mt-4 py-4 t-accent-bg rounded-xl font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-green-500/20 active:scale-95 transition-all relative z-10"
        >
          <Play className="w-5 h-5" />
          {t("placement.commence") || "Commence Operation"}
        </button>
        
        <button
          onClick={() => updateUser({ stats: { ...user.stats, placementGamesPlayed: 5 } })}
          className="w-full mt-2 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 rounded-xl font-bold uppercase tracking-wider flex items-center justify-center gap-2 text-red-400 active:scale-95 transition-all relative z-10"
        >
          <SkipForward className="w-5 h-5" />
          Skip Placement (Dev)
        </button>
      </div>

      <div className="p-4 rounded-xl border border-dashed t-border t-bg flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 t-text-accent shrink-0 mt-0.5" />
        <p className="text-xs t-text-secondary leading-relaxed">
          <strong>{t("placement.directive") || "Directive:"}</strong> {t("placement.directive_desc") || "Treat this case seriously. Your ability to detect subtle manipulation tactics is being monitored. Mistakes will significantly impact your initial rating."}
        </p>
      </div>
    </div>
  );
}
