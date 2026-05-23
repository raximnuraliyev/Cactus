import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useGame } from "../contexts/GameContext";
import { useI18n } from "../i18n";
import {
  ShieldAlert,
  Terminal,
  ChevronRight,
  ChevronLeft,
  Layers,
  Sparkles,
} from "lucide-react";
import { SpotlightHover } from "./ui/spotlight-hover";
import type { ScenarioTemplate } from "../types";
import { SCENARIO_TEMPLATES } from "../data";
import { useTranslatedScenario } from "../hooks/useTranslatedScenario";

export default function BriefingView() {
  const navigate = useNavigate();
  const location = useLocation();
  const { session } = useGame();
  const { t } = useI18n();

  // Get scenario from route state or fall back to session/template data
  const routeState = location.state as {
    scenario?: ScenarioTemplate;
    session?: { briefing?: string; characterIntro?: string; scenarioType?: string; difficulty?: string; sessionId?: string; templateId?: string };
  } | null;

  const apiSession = routeState?.session || session;
  const matchedScenario = apiSession?.templateId ? SCENARIO_TEMPLATES.find(s => s.id === apiSession.templateId) : null;
  const rawScenario: ScenarioTemplate | null = routeState?.scenario || matchedScenario || SCENARIO_TEMPLATES[0];
  const scenario = useTranslatedScenario(rawScenario, t);

  if (!rawScenario) {
    navigate("/home");
    return null;
  }

  const briefingText = scenario.briefing;
  const characterIntro = scenario.characterIntro;

  const handleStart = () => {
    const sessionId = apiSession?.sessionId || "local";
    navigate(`/game/${sessionId}`, {
      state: { scenario, session: apiSession },
    });
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto py-4 animate-fade-in">
      {/* Header back click */}
      <button
        onClick={() => navigate("/home")}
        className="flex items-center gap-2 text-xs font-mono text-zinc-500 hover:text-green-400 transition-all group pb-2"
      >
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        {t("back_to_dashboard")}
      </button>

      {/* Briefing Case Card */}
      <div className="relative overflow-hidden rounded-2xl p-6 bg-zinc-950 border border-green-500/20 backdrop-blur-md">
        <SpotlightHover className="from-green-500/10 via-transparent" />

        <div className="space-y-4 relative z-10">
          <div className="flex justify-between items-start">
            <span className="text-[12px] font-mono border border-green-500/30 text-green-400 px-2.5 py-1 rounded bg-green-500/5 uppercase tracking-widest font-bold">
              {t("briefing.case_archive_id")} {scenario.id.toUpperCase()}
            </span>
            <span
              className={`text-xs font-mono py-1 px-2.5 rounded font-bold uppercase border ${
                scenario.difficulty === "easy"
                  ? "text-green-400 border-green-500/20 bg-green-500/5"
                  : scenario.difficulty === "medium"
                  ? "text-yellow-400 border-yellow-500/20 bg-yellow-500/5"
                  : "text-red-400 border-red-500/20 bg-red-400/5"
              }`}
            >
              {t(`briefing.difficulty_${scenario.difficulty}`)} {t("briefing.multiplier")}
            </span>
          </div>

          <h2 className="text-2xl md:text-3xl font-light tracking-tight text-white mt-2">
            {scenario.title}
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 border-y border-zinc-900 py-4 font-mono text-xs text-zinc-400">
            <div>
              <span className="text-[12px] text-zinc-500 block">
                {t("briefing.tactical_metric")}
              </span>
              <span className="text-white flex items-center gap-1.5 mt-1 font-semibold">
                <Layers className="w-3.5 h-3.5 text-green-400" />
                {t(`briefing.metric.${scenario.type}`)}
              </span>
            </div>
            <div>
              <span className="text-[12px] text-zinc-500 block">
                {t("briefing.official_target")}
              </span>
              <span className="text-white mt-1 block font-semibold truncate text-[14px]">
                {characterIntro}
              </span>
            </div>
            <div>
              <span className="text-[12px] text-zinc-500 block">
                {t("briefing.reward")}
              </span>
              <span className="text-green-400 flex items-center gap-1.5 mt-1 font-semibold text-[14px]">
                <Sparkles className="w-3.5 h-3.5" />
                {scenario.difficulty === "easy"
                  ? 500
                  : scenario.difficulty === "medium"
                  ? 1000
                  : 2500}{" "}
                XP
              </span>
            </div>
          </div>

          <div className="space-y-3 font-sans text-sm tracking-wide leading-relaxed text-zinc-300 pt-2">
            <p className="border-l-2 border-green-400 pl-4 bg-green-500/5 py-2.5 rounded-r-lg text-zinc-300 text-[14px] leading-relaxed">
              {briefingText}
            </p>
          </div>
        </div>
      </div>

      {/* Challenge Rules Grid */}
      <div className="rounded-2xl p-6 bg-zinc-900/40 border border-zinc-800 space-y-4">
        <h3 className="text-xs font-mono text-green-400 uppercase tracking-widest flex items-center gap-1.5">
          <Terminal className="w-4 h-4" />
          {t("scenario_briefing")}
        </h3>

        <div className="space-y-3 text-sm text-zinc-400 leading-relaxed font-sans">
          {[1, 2, 3].map((ruleNum) => (
            <div key={ruleNum} className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 mt-1.5 flex-shrink-0" />
              <p>{t(`briefing.rule_${ruleNum}`)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Launch button */}
      <button
        onClick={handleStart}
        className="w-full relative group overflow-hidden bg-green-400 py-4 rounded-full font-semibold text-black transition-all hover:bg-green-300 font-sans tracking-wide uppercase text-sm shadow-[0_0_20px_rgba(0,255,0,0.25)] flex items-center justify-center gap-2 active:scale-98"
      >
        <span className="relative z-10 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4" />
          {t("play_now")}
        </span>
        <ChevronRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
        <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
      </button>
    </div>
  );
}
