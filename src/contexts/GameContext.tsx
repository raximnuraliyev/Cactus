import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type {
  Turn,
  ActiveGameSession,
  ScenarioType,
  DifficultyLevel,
  VerdictResponse,
} from "../types";
import {
  startGame as apiStartGame,
  submitTurn as apiSubmitTurn,
  submitVerdict as apiSubmitVerdict,
} from "../api/game";

interface GameContextValue {
  session: ActiveGameSession | null;
  isLoading: boolean;
  verdictResult: VerdictResponse["data"] | null;
  startGame: (category?: ScenarioType, difficulty?: DifficultyLevel) => Promise<ActiveGameSession>;
  sendTurn: (input: string, inputType: "choice" | "text" | "tool") => Promise<void>;
  submitVerdict: (verdict: "real_employee" | "fraudster", flaggedClues: string[], overrideSessionId?: string) => Promise<VerdictResponse["data"]>;
  clearSession: () => void;
  addLocalTurn: (turn: Turn) => void;
  flagTurn: (turnIndex: number) => void;
  addToolUsed: (tool: string) => void;
  addClue: (clue: string) => void;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<ActiveGameSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [verdictResult, setVerdictResult] = useState<VerdictResponse["data"] | null>(null);

  const startGame = useCallback(
    async (category?: ScenarioType, difficulty?: DifficultyLevel) => {
      setIsLoading(true);
      setVerdictResult(null);
      try {
        const res = await apiStartGame(category, difficulty);
        const d = res.data;
        const newSession: ActiveGameSession = {
          sessionId: d.sessionId,
          briefing: d.briefing,
          characterIntro: d.characterIntro,
          templateId: d.templateId,
          scenarioType: d.scenarioType,
          difficulty: d.difficulty,
          initialChoices: d.initialChoices,
          cluesTotal: d.cluesTotal,
          turns: [],
          cluesFound: [],
          toolsUsed: [],
          canEnd: false,
          currentChoices: d.initialChoices,
        };
        setSession(newSession);
        return newSession;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const sendTurn = useCallback(
    async (input: string, inputType: "choice" | "text" | "tool") => {
      if (!session) return;
      setIsLoading(true);
      try {
        const res = await apiSubmitTurn(session.sessionId, inputType, input);
        const d = res.data;
        const newTurn: Turn = {
          turnNumber: d.turnNumber,
          inputType,
          playerInput: input,
          aiResponse: d.response,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };

        setSession((prev) => {
          if (!prev) return prev;
          const updatedClues = d.clueRevealed
            ? [...prev.cluesFound, d.clueRevealed]
            : prev.cluesFound;
          return {
            ...prev,
            turns: [...prev.turns, newTurn],
            canEnd: d.canEnd,
            currentChoices: d.choices || [],
            cluesFound: updatedClues,
          };
        });
      } finally {
        setIsLoading(false);
      }
    },
    [session]
  );

  const doSubmitVerdict = useCallback(
    async (verdict: "real_employee" | "fraudster", flaggedClues: string[], overrideSessionId?: string) => {
      const activeSessionId = overrideSessionId || session?.sessionId;
      if (!activeSessionId) throw new Error("No active session");
      setIsLoading(true);
      try {
        const res = await apiSubmitVerdict(
          activeSessionId,
          verdict,
          flaggedClues
        );
        setVerdictResult(res.data);
        return res.data;
      } finally {
        setIsLoading(false);
      }
    },
    [session]
  );

  const clearSession = useCallback(() => {
    setSession(null);
    setVerdictResult(null);
  }, []);

  const addLocalTurn = useCallback((turn: Turn) => {
    setSession((prev) =>
      prev ? { ...prev, turns: [...prev.turns, turn] } : prev
    );
  }, []);

  const flagTurn = useCallback((turnIndex: number) => {
    setSession((prev) => {
      if (!prev) return prev;
      const updated = prev.turns.map((t, i) =>
        i === turnIndex ? { ...t, flaggedSuspicious: true } : t
      );
      return { ...prev, turns: updated };
    });
  }, []);

  const addToolUsed = useCallback((tool: string) => {
    setSession((prev) =>
      prev ? { ...prev, toolsUsed: [...prev.toolsUsed, tool] } : prev
    );
  }, []);

  const addClue = useCallback((clue: string) => {
    setSession((prev) => {
      if (!prev || prev.cluesFound.includes(clue)) return prev;
      return { ...prev, cluesFound: [...prev.cluesFound, clue] };
    });
  }, []);

  return (
    <GameContext.Provider
      value={{
        session,
        isLoading,
        verdictResult,
        startGame,
        sendTurn,
        submitVerdict: doSubmitVerdict,
        clearSession,
        addLocalTurn,
        flagTurn,
        addToolUsed,
        addClue,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
}
