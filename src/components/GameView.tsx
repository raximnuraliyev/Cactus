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
  Info,
  Wrench,
  Search
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
  const [showBriefing, setShowBriefing] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

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
      state: { scenario, turns, toolsUsed, cluesFound, sessionId: session?.sessionId },
    });
  };

  const handleAbandon = () => {
    setShowExitConfirm(true);
  };

  const confirmAbandon = () => {
    navigate("/home");
  };

  const loading = isAiLoading || gameLoading;

  return (
    <div className="flex flex-col h-full w-full max-w-2xl mx-auto glass-card overflow-hidden font-sans relative">
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

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowBriefing(true)}
            className="p-1.5 rounded-full bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-all"
            title={t("active_game.briefing_title") || "Case Briefing"}
          >
            <Info className="w-5 h-5" />
          </button>
          <button
            onClick={handleAbandon}
            className="text-xs t-text-muted border t-border rounded-full px-3 py-1.5 hover:t-danger hover:border-red-500/30 transition-all font-semibold"
          >
            {t("active_game.abort_case")}
          </button>
        </div>
      </div>

      {/* Custom Exit Confirmation Modal */}
      {showExitConfirm && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="t-bg-elevated border t-border rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold t-text flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 t-danger" />
              Abandon Investigation?
            </h3>
            <p className="text-sm t-text-secondary">
              Are you sure you want to abort? All progress in this session will be lost and your case will be closed.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border t-border t-text hover:t-bg-secondary transition-all font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={confirmAbandon}
                className="flex-1 py-2.5 rounded-xl bg-red-500/20 text-red-500 hover:bg-red-500/30 border border-red-500/30 transition-all font-semibold"
              >
                Confirm Abort
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Case Briefing Modal */}
      {showBriefing && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="t-bg-elevated border t-border rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4 max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center border-b t-border pb-3 shrink-0">
              <h3 className="text-lg font-bold t-text flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-400" />
                Case Briefing
              </h3>
              <button onClick={() => setShowBriefing(false)} className="t-text-muted hover:t-text">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto space-y-4 text-sm t-text pr-2 scrollbar-hide flex-1">
              <div>
                <span className="text-[10px] font-mono t-text-muted uppercase tracking-widest block mb-1">Scenario</span>
                <p className="font-semibold">{scenario.title}</p>
              </div>
              <div>
                <span className="text-[10px] font-mono t-text-muted uppercase tracking-widest block mb-1">Target Description</span>
                <p className="t-text-secondary leading-relaxed">{scenario.briefing_text || session?.briefing}</p>
              </div>
              <div>
                <span className="text-[10px] font-mono t-text-muted uppercase tracking-widest block mb-1">Your Objective</span>
                <p className="t-text-secondary leading-relaxed">Engage with the subject, utilize investigation tools, uncover their motives, and determine if this is a genuine request or a fraudulent attempt.</p>
              </div>
            </div>
            <div className="pt-3 border-t t-border shrink-0">
              <button
                onClick={() => setShowBriefing(false)}
                className="w-full py-2.5 rounded-xl t-accent-bg t-text font-bold uppercase tracking-wider active:scale-95 transition-all"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}

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

            {/* Investigation Tools Slide-up Panel */}
            {showToolsPanel && (
              <div className="w-full t-bg-elevated border t-border animate-fade-in shadow-[0_-5px_20px_rgba(0,0,0,0.05)] rounded-2xl overflow-hidden mb-2">
                <div className="p-3">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-sm font-semibold t-text-secondary tracking-wide flex items-center gap-2">
                      <Search className="w-4 h-4 t-text-accent" />
                      Investigation Tools
                    </h4>
                    <button 
                      onClick={() => setShowToolsPanel(false)}
                      className="p-1 rounded-full t-bg-secondary t-text-secondary hover:t-text"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handlePlayerAction(t("active_game.hang_up"), true, "hang_up")}
                      className="flex flex-col items-center justify-center gap-1.5 t-text border t-border t-bg-card hover:t-bg-secondary py-3 rounded-xl transition-all shadow-sm"
                    >
                      <PhoneOff className="w-4 h-4 text-red-500" />
                      <span className="text-[10px] font-medium text-center px-1">Terminate Call</span>
                    </button>
                    <button
                      onClick={() => handlePlayerAction(t("active_game.employee_id"), true, "request_id")}
                      className="flex flex-col items-center justify-center gap-1.5 t-text border t-border t-bg-card hover:t-bg-secondary py-3 rounded-xl transition-all shadow-sm"
                    >
                      <Lock className="w-4 h-4 text-blue-500" />
                      <span className="text-[10px] font-medium text-center px-1">Verify ID Badge</span>
                    </button>
                    <button
                      onClick={() => handlePlayerAction(t("active_game.complain"), true, "complain_supervisor")}
                      className="flex flex-col items-center justify-center gap-1.5 t-text border t-border t-bg-card hover:t-bg-secondary py-3 rounded-xl transition-all shadow-sm"
                    >
                      <Briefcase className="w-4 h-4 text-amber-500" />
                      <span className="text-[10px] font-medium text-center px-1">Supervisor Query</span>
                    </button>
                    <button
                      onClick={() => handlePlayerAction(t("active_game.flag_suspicious"), false, "flag_dialog")}
                      className="flex flex-col items-center justify-center gap-1.5 t-text border t-border t-bg-card hover:t-bg-secondary py-3 rounded-xl transition-all shadow-sm"
                    >
                      <ShieldAlert className="w-4 h-4 text-emerald-500" />
                      <span className="text-[10px] font-medium text-center px-1">Flag Red Flag</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Input Bar */}
            <form onSubmit={submitTextQuery} className="flex items-end gap-2 relative">
              <button
                type="button"
                onClick={() => setShowToolsPanel(!showToolsPanel)}
                disabled={loading || callerStatus === "disconnected"}
                className={`p-3 rounded-full transition-all flex-shrink-0 flex items-center justify-center ${showToolsPanel ? 't-accent-bg shadow-md text-white' : 't-bg border t-border hover:t-border-accent hover:t-text-accent'}`}
                title="Investigation Tools"
              >
                <Wrench className="w-5 h-5" />
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
        <div className="p-3 border-t t-border t-bg-secondary">
          <button
            onClick={handleFinishGame}
            disabled={!canEnd}
            className={`w-full py-3.5 font-semibold text-[15px] rounded-xl flex items-center justify-center gap-2 transition-all ${
              canEnd 
                ? "t-accent-bg hover:opacity-90 active:scale-95 shadow-lg" 
                : "t-bg-card border t-border t-text-muted cursor-not-allowed"
            }`}
          >
            <CheckCircle2 className="w-5 h-5" />
            {canEnd ? t("active_game.finish_game") : `Gather more evidence (${Math.min(3, turns.length)}/3)`}
          </button>
        </div>
      </div>
    </div>
  );
}
