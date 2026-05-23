import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useGame } from "../contexts/GameContext";
import { useI18n } from "../i18n";
import type { ScenarioTemplate, Turn } from "../types";
import { SCENARIO_TEMPLATES } from "../data";
import { useTranslatedScenario } from "../hooks/useTranslatedScenario";
import {
  Phone,
  PhoneOff,
  ShieldAlert,
  Send,
  Terminal,
  CheckCircle2,
  Briefcase,
  Lock,
  Paperclip,
  X,
  User,
} from "lucide-react";

export default function GameView() {
  const navigate = useNavigate();
  const location = useLocation();
  const { sessionId } = useParams<{ sessionId: string }>();
  const { session, sendTurn, isLoading: gameLoading, flagTurn, addToolUsed, addClue, addLocalTurn } = useGame();
  const { t } = useI18n();

  // Get scenario from route state for fallback/local mode
  const routeState = location.state as { scenario?: ScenarioTemplate } | null;
  const rawScenario = routeState?.scenario || SCENARIO_TEMPLATES[0];
  const scenario = useTranslatedScenario(rawScenario, t);

  // Local state for fallback/offline mode
  const [localTurns, setLocalTurns] = useState<Turn[]>([]);
  const [localToolsUsed, setLocalToolsUsed] = useState<string[]>([]);
  const [localCluesFound, setLocalCluesFound] = useState<string[]>([]);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [customText, setCustomText] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showToolsPanel, setShowToolsPanel] = useState(false);
  const [toolLogs, setToolLogs] = useState<string[]>([]);
  const [callerStatus, setCallerStatus] = useState<"connected" | "disconnected">("connected");

  const bottomRef = useRef<HTMLDivElement>(null);

  // Determine if we're using API or local mode
  const isApiMode = session && sessionId !== "local";
  const turns = isApiMode ? session.turns : localTurns;
  const toolsUsed = isApiMode ? session.toolsUsed : localToolsUsed;
  const cluesFound = isApiMode ? session.cluesFound : localCluesFound;
  const currentChoices = isApiMode 
    ? (turns.length <= 1 ? scenario.initialChoices : session.currentChoices) 
    : (callerStatus === "disconnected" ? [] : (scenario.stages[currentStageIndex]?.choices || []));
  const canEnd = isApiMode ? session.canEnd : (turns.length >= 3 || callerStatus === "disconnected");

  // Initialize conversation with opening response
  useEffect(() => {
    if (turns.length === 0) {
      const openingMsg = scenario.stages[0]?.question || "Hello, this is " + scenario.characterIntro;
      const initialTurn: Turn = {
        turnNumber: 0,
        inputType: "choice",
        playerInput: "[Acknowledge Incoming Session]",
        aiResponse: openingMsg,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      if (isApiMode) {
        addLocalTurn(initialTurn);
      } else {
        setLocalTurns([initialTurn]);
      }
    }
  }, []);

  // Scroll on updates
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [turns, isAiLoading, gameLoading, showToolsPanel]);

  const handlePlayerAction = async (inputText: string, isToolAction = false, toolName = "") => {
    if ((isAiLoading || gameLoading) || callerStatus === "disconnected") return;
    
    if (isToolAction) {
      setShowToolsPanel(false);
    }

    if (isApiMode) {
      // Send to API
      const inputType: "choice" | "text" | "tool" = isToolAction ? "tool" : "choice";
      try {
        await sendTurn(inputText, inputType);
        if (isToolAction && toolName) {
          addToolUsed(toolName);
          setToolLogs((prev) => [...prev, `[DIAGNOSTIC] ${toolName.toUpperCase()} event initialized.`]);
        }
      } catch {
        // Fallback to local
      }
      return;
    }

    // Local/fallback mode
    setIsAiLoading(true);
    const timestampStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    setTimeout(() => {
      let reply = "";
      const currentStage = scenario.stages[currentStageIndex] || scenario.stages[scenario.stages.length - 1];

      if (isToolAction) {
        if (toolName === "hang_up") {
          reply = "Connection severed by user. Secure redirection requested.";
          setCallerStatus("disconnected");
          setLocalToolsUsed((prev) => [...prev, "hang_up"]);
          setToolLogs((prev) => [...prev, `[DIAGNOSTIC] HANG_UP event initialized.`]);
        } else if (toolName === "request_id") {
          reply = scenario.isRealCharacter
            ? "Certainly. My regulatory badge identity is central-93822-UZ. You can cross-reference this on the core security index."
            : "Why do you suddenly care about ID codes? We have millions of UZS leaking right now! There is no time for bureaucracy, confirm the OTP immediately!";
          setLocalToolsUsed((prev) => [...prev, "request_id"]);
          setToolLogs((prev) => [...prev, `[DIAGNOSTIC] Investigated employee credentials.`]);
          if (!scenario.isRealCharacter && !localCluesFound.includes(scenario.clues[0])) {
            setLocalCluesFound((prev) => [...prev, scenario.clues[0]]);
          }
        } else if (toolName === "complain_supervisor") {
          reply = scenario.isRealCharacter
            ? "I am transferring you to Agent Vance, our supervisor on duty. Please hold."
            : "I am the senior manager on duty for security bypass channels! Transferring you will require resetting the insurance window and you will lose everything!";
          setLocalToolsUsed((prev) => [...prev, "complain_supervisor"]);
          setToolLogs((prev) => [...prev, `[DIAGNOSTIC] Requested supervisor protocol.`]);
          if (!scenario.isRealCharacter && !localCluesFound.includes(scenario.clues[1])) {
            setLocalCluesFound((prev) => [...prev, scenario.clues[1]]);
          }
        }
      } else {
        if (scenario.isRealCharacter) {
          reply = currentStage.responses.isReal;
        } else {
          reply = currentStage.responses.isFake;
          if (currentStage.responses.clueReveal && !localCluesFound.includes(currentStage.responses.clueReveal)) {
            setLocalCluesFound((prev) => [...prev, currentStage.responses.clueReveal!]);
          }
        }
        if (currentStageIndex < scenario.stages.length - 1) {
          setCurrentStageIndex((prev) => prev + 1);
        }
      }

      const nextTurn: Turn = {
        turnNumber: localTurns.length,
        inputType: isToolAction ? "tool" : "choice",
        playerInput: inputText,
        aiResponse: reply,
        timestamp: timestampStr,
      };

      setLocalTurns((prev) => [...prev, nextTurn]);
      setIsAiLoading(false);
    }, 1200);
  };

  const flagTurnAsSuspicious = (turnIndex: number) => {
    if (isApiMode) {
      flagTurn(turnIndex);
    } else {
      setLocalTurns((prev) =>
        prev.map((t, idx) =>
          idx === turnIndex ? { ...t, flaggedSuspicious: true } : t
        )
      );
    }

    // Reward with a clue discovery
    const matchedClue = scenario.clues[turnIndex % scenario.clues.length];
    if (!cluesFound.includes(matchedClue)) {
      if (isApiMode) {
        addClue(matchedClue);
      } else {
        setLocalCluesFound((prev) => [...prev, matchedClue]);
      }
      setToolLogs((prev) => [...prev, `[LOG] Clues uncovered. Clue matched: ${matchedClue}`]);
    }
  };

  const submitTextQuery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customText.trim() || isAiLoading || gameLoading) return;
    const query = customText;
    setCustomText("");
    handlePlayerAction(query);
  };

  const handleFinishGame = () => {
    navigate("/game/evidence", {
      state: { scenario, turns, toolsUsed, cluesFound },
    });
  };

  const handleAbandon = () => {
    if (confirm("Confirm abandoning the active investigation? Process state will clear.")) {
      navigate("/home");
    }
  };

  const loading = isAiLoading || gameLoading;

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] w-full max-w-2xl mx-auto glass-card overflow-hidden font-sans relative">
      {/* Telegram-style Header */}
      <div className="t-bg-secondary px-4 py-3 t-border border-b flex justify-between items-center relative z-10 shrink-0 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg t-bg-elevated t-text t-border border shadow-sm overflow-hidden">
              {scenario.type === "phone_call" ? (
                <Phone className="w-5 h-5 t-text-accent" />
              ) : (
                <User className="w-6 h-6 t-text-secondary mt-1" />
              )}
            </div>
            {callerStatus === "connected" && (
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 t-border rounded-full" />
            )}
          </div>
          <div className="flex flex-col">
            <h4 className="text-base font-semibold t-text tracking-wide leading-tight">
              {scenario.characterIntro.split(" ")[0] || scenario.characterIntro}
            </h4>
            <span className="text-xs t-text-secondary">
              {callerStatus === "connected" ? "online" : "last seen recently"}
            </span>
          </div>
        </div>

        <button
          onClick={handleAbandon}
          className="text-xs t-text-muted border t-border rounded-full px-3 py-1.5 hover:t-danger hover:border-red-500/30 transition-all font-semibold"
        >
          {t("active_game.abort_case")}
        </button>
      </div>

      {/* Chat History Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Date bubble indicator */}
        <div className="flex justify-center mb-6">
          <span className="text-[10px] font-medium t-bg-card t-text-secondary px-3 py-1 rounded-full border t-border shadow-sm">
            Today
          </span>
        </div>

        {turns.map((turn, index) => (
          <div key={index} className="space-y-4">
            {/* Player message */}
            {index > 0 && (
              <div className="flex justify-end animate-fade-in">
                <div className="chat-bubble-outgoing px-4 py-2.5 max-w-[85%] md:max-w-[75%] text-[15px] shadow-sm relative group">
                  <p className="leading-snug pr-8 whitespace-pre-line">{turn.playerInput}</p>
                  <span className="text-[10px] opacity-70 absolute bottom-1 right-2 block">
                    {turn.timestamp}
                  </span>
                </div>
              </div>
            )}

            {/* AI / Suspect message */}
            <div className="flex justify-start animate-fade-in">
              <div
                className={`px-4 py-2.5 max-w-[85%] md:max-w-[75%] text-[15px] shadow-sm relative group ${
                  turn.flaggedSuspicious
                    ? "t-danger-bg t-danger border-l-4 border-red-500 rounded-r-2xl rounded-bl-2xl"
                    : "chat-bubble-incoming"
                }`}
              >
                {turn.flaggedSuspicious && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full uppercase flex items-center gap-1 shadow-md z-10">
                    <ShieldAlert className="w-3 h-3" />
                    {t("active_game.tag_clue")}
                  </span>
                )}

                <p className="leading-snug pr-12 whitespace-pre-line relative z-0">
                  {turn.aiResponse}
                </p>
                <span className="text-[10px] opacity-60 absolute bottom-1 right-2 block">
                  {turn.timestamp}
                </span>

                {/* Flag button - inline for chat style */}
                {!turn.flaggedSuspicious && index > 0 && (
                  <button
                    onClick={() => flagTurnAsSuspicious(index)}
                    className="absolute top-1/2 -translate-y-1/2 -right-10 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity text-red-400 p-1.5 rounded-full t-bg-card border t-border hover:bg-red-500/10"
                    title={t("active_game.flag_btn")}
                  >
                    <ShieldAlert className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start animate-fade-in">
            <div className="chat-bubble-incoming px-4 py-3 shadow-sm flex items-center space-x-1.5 w-16">
              <div className="w-1.5 h-1.5 rounded-full t-bg-secondary typing-dot" />
              <div className="w-1.5 h-1.5 rounded-full t-bg-secondary typing-dot" />
              <div className="w-1.5 h-1.5 rounded-full t-bg-secondary typing-dot" />
            </div>
          </div>
        )}
        <div ref={bottomRef} className="h-2" />
      </div>

      {/* Investigation Tools Slide-up Panel */}
      {showToolsPanel && (
        <div className="absolute bottom-[4.5rem] left-0 w-full t-bg-elevated border-t t-border z-20 animate-slide-up shadow-[0_-10px_40px_rgba(0,0,0,0.1)] rounded-t-3xl">
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-sm font-semibold t-text-secondary tracking-wide">
                Investigation Tools
              </h4>
              <button 
                onClick={() => setShowToolsPanel(false)}
                className="p-1 rounded-full t-bg-secondary t-text-secondary hover:t-text"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 pb-2">
              <button
                onClick={() => handlePlayerAction(t("active_game.hang_up"), true, "hang_up")}
                className="flex flex-col items-center justify-center gap-2 t-text border t-border t-bg-card hover:t-bg-secondary py-4 rounded-2xl transition-all shadow-sm"
              >
                <div className="p-3 rounded-full bg-red-500/10 text-red-500">
                  <PhoneOff className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-medium">{t("active_game.hang_up_short")}</span>
              </button>
              <button
                onClick={() => handlePlayerAction(t("active_game.employee_id"), true, "request_id")}
                className="flex flex-col items-center justify-center gap-2 t-text border t-border t-bg-card hover:t-bg-secondary py-4 rounded-2xl transition-all shadow-sm"
              >
                <div className="p-3 rounded-full bg-blue-500/10 text-blue-500">
                  <Lock className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-medium">{t("active_game.query_id")}</span>
              </button>
              <button
                onClick={() => handlePlayerAction(t("active_game.complain"), true, "complain_supervisor")}
                className="flex flex-col items-center justify-center gap-2 t-text border t-border t-bg-card hover:t-bg-secondary py-4 rounded-2xl transition-all shadow-sm"
              >
                <div className="p-3 rounded-full bg-amber-500/10 text-amber-500">
                  <Briefcase className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-medium">{t("active_game.call_supervisor")}</span>
              </button>
              <button
                onClick={() => handlePlayerAction(t("active_game.flag_suspicious"), false, "flag_dialog")}
                className="flex flex-col items-center justify-center gap-2 t-text border t-border t-bg-card hover:t-bg-secondary py-4 rounded-2xl transition-all shadow-sm"
              >
                <div className="p-3 rounded-full bg-emerald-500/10 text-emerald-500">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-medium">{t("active_game.flag_suspicious_short")}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Choice Quick-Replies & Input Area */}
      <div className="t-bg-secondary border-t t-border shrink-0 relative z-30">
        {callerStatus === "connected" && (
          <div className="p-3 flex flex-col gap-3">
            {/* Quick Reply Chips */}
            {currentChoices.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1 pb-2 overflow-x-auto whitespace-nowrap scrollbar-hide">
                {currentChoices.map((choice, cIdx) => (
                  <button
                    key={cIdx}
                    onClick={() => handlePlayerAction(choice)}
                    disabled={loading}
                    className="inline-block text-left text-[13px] t-bg t-border border hover:t-border-accent t-text px-4 py-2.5 rounded-full transition-all shadow-sm flex-none max-w-full truncate"
                    style={{ whiteSpace: "normal" }}
                  >
                    {choice}
                  </button>
                ))}
              </div>
            )}

            {/* Input Bar */}
            <form onSubmit={submitTextQuery} className="flex items-end gap-2 relative">
              <button
                type="button"
                onClick={() => setShowToolsPanel(!showToolsPanel)}
                disabled={loading || callerStatus === "disconnected"}
                className={`p-3 rounded-full transition-all flex-shrink-0 ${showToolsPanel ? 't-accent-bg' : 't-text-muted hover:t-text-secondary'}`}
              >
                <Paperclip className="w-5 h-5" />
              </button>
              
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="Message"
                  disabled={loading || callerStatus === "disconnected"}
                  className="w-full text-[15px] t-bg border t-border focus:t-border-accent outline-none rounded-2xl px-4 py-3 t-text placeholder-slate-500 shadow-inner"
                />
              </div>
              
              <button
                type="submit"
                disabled={loading || !customText.trim()}
                className={`p-3 rounded-full transition-all flex-shrink-0 ${
                  customText.trim() && !loading 
                    ? "t-accent-bg shadow-md transform active:scale-95" 
                    : "t-bg-card t-text-muted"
                }`}
              >
                <Send className="w-5 h-5 ml-0.5" />
              </button>
            </form>
          </div>
        )}

        {/* End Game Button */}
        {canEnd && (
          <div className="p-3 border-t t-border t-bg-secondary">
            <button
              onClick={handleFinishGame}
              className="w-full py-3.5 t-accent-bg font-semibold text-[15px] rounded-xl flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 shadow-lg transition-all"
            >
              <CheckCircle2 className="w-5 h-5" />
              {t("active_game.finish_game")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
