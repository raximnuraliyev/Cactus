import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useI18n } from "../i18n";
import { useGame } from "../contexts/GameContext";
import { ScenarioTemplate, Turn } from "../types";
import { 
  ShieldCheck, 
  ShieldAlert, 
  FileCheck2, 
  Search, 
  Layers
} from "lucide-react";
import { SpotlightHover } from "./ui/spotlight-hover";

export default function EvidenceView() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useI18n();
  const { submitVerdict } = useGame();

  const [selectedVerdict, setSelectedVerdict] = useState<"real_employee" | "fraudster" | null>(null);
  const [selectedTactic, setSelectedTactic] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const routeState = location.state as { 
    scenario?: ScenarioTemplate;
    turns?: Turn[];
    toolsUsed?: string[];
    cluesFound?: string[];
    sessionId?: string;
  } | null;

  if (!routeState?.scenario) {
    navigate("/home");
    return null;
  }

  const { scenario, toolsUsed = [], cluesFound = [], sessionId } = routeState;

  const cyberTactics = [
    "Authority combined with Urgency pressure",
    "Corporate identity spoofing / Phishing redirect",
    "Reverse Payout Phishing with CVV harvest",
    "Executable payload Trojan injection",
    "None - standard banking procedure validation"
  ];

  const handleCommit = async () => {
    if (!selectedVerdict || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const result = await submitVerdict(selectedVerdict, cluesFound, sessionId);
      navigate("/game/debrief", {
        state: {
          scenario,
          result: {
            ...result,
            cluesFound // Pass the string array instead of the integer from the backend
          },
          verdictGiven: selectedVerdict
        }
      });
    } catch (error) {
      console.error("Failed to submit verdict", error);
      // Fallback for offline mode
      const isCorrect = (selectedVerdict === "real_employee" && scenario.isRealCharacter) ||
                        (selectedVerdict === "fraudster" && !scenario.isRealCharacter);
      navigate("/game/debrief", {
        state: {
          scenario,
          result: {
            correct: isCorrect,
            xpGained: isCorrect ? (scenario.difficulty === 'hard' ? 1500 : scenario.difficulty === 'medium' ? 1000 : 500) : 0,
            debriefText: isCorrect ? "Excellent deduction. You correctly analyzed the evidence." : "Incorrect assessment. Review the flags again.",
            cluesFound: cluesFound
          },
          verdictGiven: selectedVerdict
        }
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto py-2 animate-fade-in pb-16">
      
      {/* Evidence board title card */}
      <div className="relative overflow-hidden p-6 glass-card-accent">
        <SpotlightHover className="t-accent-muted opacity-50" />
        <div className="relative z-10 space-y-2">
          <span className="text-[9px] font-mono border t-border-accent t-text-accent px-2 py-0.5 rounded tracking-widest font-bold t-accent-muted">
            EVIDENCE ANALYTICS PORTAL
          </span>
          <h2 className="text-2xl font-light tracking-tight t-text mt-1">
            {t("active_game.evidence_title")}
          </h2>
          <p className="text-xs t-text-secondary font-sans tracking-wide">
            {t("active_game.gather_clues")}
          </p>
        </div>
      </div>

      {/* Flagged logs section */}
      <div className="glass-card p-5 space-y-3">
        <h4 className="text-xs font-mono t-text-accent uppercase tracking-widest flex items-center gap-1.5">
          <Search className="w-4 h-4 t-text-accent" />
          Flagged Diagnostic Artifacts ({cluesFound.length})
        </h4>

        <div className="space-y-2.5">
          {cluesFound.length > 0 ? (
            cluesFound.map((clue, idx) => (
              <div key={idx} className="p-3 t-bg-secondary t-border border-l-2 border-l-red-500 rounded-r-xl text-xs t-text-secondary font-sans leading-relaxed flex items-start gap-2.5 shadow">
                <ShieldAlert className="w-4 h-4 t-danger shrink-0 mt-0.5" />
                <span className="t-text">{clue}</span>
              </div>
            ))
          ) : (
            <div className="p-4 t-bg-secondary rounded-xl text-center t-border text-xs t-text-muted italic">
              No clues explicitly flagged. You will rely purely on your intuition and final diagnostic tools for the verdict.
            </div>
          )}
        </div>
      </div>

      {/* Diagnostics tools summary */}
      <div className="glass-card p-5 space-y-3">
        <h4 className="text-xs font-mono t-text-accent uppercase tracking-widest flex items-center gap-1.5">
          <FileCheck2 className="w-4 h-4 t-text-accent" />
          Diagnostics Enforced ({toolsUsed.length})
        </h4>

        <div className="flex flex-wrap gap-2">
          {toolsUsed.length > 0 ? (
            toolsUsed.map((tool, idx) => (
              <span 
                key={idx} 
                className="text-[10px] font-mono border t-border-accent t-text-accent px-3 py-1 t-accent-muted rounded-full uppercase"
              >
                {tool.replace("_", " ")}
              </span>
            ))
          ) : (
            <span className="text-xs t-text-muted italic">No diagnostic tools were executed in this session.</span>
          )}
        </div>
      </div>

      {/* Active verdict section */}
      <div className="glass-card p-6 space-y-5 shadow-lg">
        <h3 className="text-sm font-semibold tracking-wide t-text uppercase border-b t-border pb-3">
          {t("active_game.commit_verdict")}
        </h3>

        {/* Choice buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            onClick={() => setSelectedVerdict("real_employee")}
            className={`cursor-pointer border p-5 rounded-2xl flex flex-col items-center justify-center text-center gap-2 group transition-all ${
              selectedVerdict === "real_employee"
                ? "t-border-accent t-accent-muted shadow-[0_0_15px_var(--accent-muted)]"
                : "t-border hover:t-border-accent t-bg-secondary"
            }`}
          >
            <ShieldCheck className={`w-8 h-8 ${selectedVerdict === "real_employee" ? "t-text-accent" : "t-text-muted group-hover:t-text-accent"}`} />
            <div>
              <span className="font-medium text-sm t-text block">{t("verdicts.legit")}</span>
              <span className="text-[10px] t-text-secondary block">Identified as official banking compliance process</span>
            </div>
          </div>

          <div
            onClick={() => setSelectedVerdict("fraudster")}
            className={`cursor-pointer border p-5 rounded-2xl flex flex-col items-center justify-center text-center gap-2 group transition-all ${
              selectedVerdict === "fraudster"
                ? "border-red-400 bg-red-500/10 shadow-[0_0_15px_rgba(239,68,68,0.15)]"
                : "t-border hover:border-red-400/30 t-bg-secondary"
            }`}
          >
            <ShieldAlert className={`w-8 h-8 ${selectedVerdict === "fraudster" ? "t-danger" : "t-text-muted group-hover:t-danger"}`} />
            <div>
              <span className="font-medium text-sm t-text block">{t("verdicts.scam")}</span>
              <span className="text-[10px] t-text-secondary block">Identified spoofing, coercion, or malware delivery</span>
            </div>
          </div>
        </div>

        {/* Tactical selection if they select fraudster */}
        {selectedVerdict === "fraudster" && (
          <div className="space-y-2 animate-fade-in pt-2">
            <label className="text-xs font-mono t-text-secondary block uppercase tracking-wider flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 t-text-muted" />
              {t("verdicts.tactic_heading")}
            </label>
            <select
              value={selectedTactic}
              onChange={(e) => setSelectedTactic(e.target.value)}
              className="w-full t-bg-secondary t-border focus:border-red-500/30 outline-none text-xs rounded-xl p-3 t-text font-sans"
            >
              <option value="">-- Choose Manipulation Technique --</option>
              {cyberTactics.map((tactic, idx) => (
                <option key={idx} value={tactic}>{tactic}</option>
              ))}
            </select>
          </div>
        )}

        {/* Submission Button */}
        <div className="pt-2 flex gap-3">
          <button
            onClick={() => navigate(-1)}
            disabled={isSubmitting}
            className="flex-1 py-3.5 rounded-full border t-border t-text-secondary hover:t-text font-medium text-xs font-mono uppercase transition-all block text-center"
          >
            Review Logs
          </button>
          
          <button
            onClick={handleCommit}
            disabled={!selectedVerdict || isSubmitting}
            className={`flex-1 py-3.5 rounded-full font-semibold text-xs font-mono uppercase tracking-wider transition-all shadow-[0_0_20px_var(--accent-muted)] ${
              selectedVerdict && !isSubmitting
                ? "t-accent-bg hover:brightness-110 border t-border-accent active:scale-98"
                : "t-bg-secondary t-border t-text-muted cursor-not-allowed shadow-none"
            }`}
          >
            {isSubmitting ? "Transmitting..." : "Transmit Case File"}
          </button>
        </div>
      </div>
    </div>
  );
}
