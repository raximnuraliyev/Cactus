import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useI18n } from "../i18n";
import { MINI_GAME_SCENARIOS } from "../data";
import { X, ShieldAlert, Zap, Brain, Eye, Target, AlertTriangle } from "lucide-react";

interface DashboardGameModalProps {
  onClose: () => void;
}

export default function DashboardGameModal({ onClose }: DashboardGameModalProps) {
  const { user, updateUser } = useAuth();
  const { t } = useI18n();
  
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [results, setResults] = useState<{
    awareness: number;
    intuition: number;
    speed: number;
    resilience: number;
    isCorrect: boolean;
  } | null>(null);

  const scenario = MINI_GAME_SCENARIOS[scenarioIndex];

  useEffect(() => {
    if (scenario && !results) {
      setTimeLeft(scenario.timeLimit);
      setShowHint(false);
    }
  }, [scenarioIndex, scenario, results]);

  useEffect(() => {
    if (timeLeft > 0 && !results) {
      const timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !results && scenario) {
      // Time ran out
      handleChoice({
        text: "Time out",
        isCorrect: false,
        awarenessReward: 0,
        resilienceReward: -10
      });
    }
  }, [timeLeft, results, scenario]);

  const handleChoice = (choice: typeof scenario.choices[0]) => {
    if (results) return;

    let { awarenessReward, resilienceReward } = choice;
    let speedReward = 0;
    let intuitionReward = 0;

    if (choice.isCorrect) {
      // Speed bonus
      if (timeLeft > scenario.timeLimit * 0.5) {
        speedReward = 15;
      } else if (timeLeft > 0) {
        speedReward = 5;
      }

      // Intuition penalty if hint used
      if (!showHint) {
        intuitionReward = 10;
      } else {
        intuitionReward = -5;
      }
    }

    const newResults = {
      awareness: awarenessReward,
      intuition: intuitionReward,
      speed: speedReward,
      resilience: resilienceReward,
      isCorrect: choice.isCorrect
    };

    setResults(newResults);

    // Apply stats
    if (user?.stats) {
      const updatedStats = {
        ...user.stats,
        awareness: Math.min(50, Math.max(0, user.stats.awareness + awarenessReward)),
        intuition: Math.min(50, Math.max(0, user.stats.intuition + intuitionReward)),
        speed: Math.min(50, Math.max(0, user.stats.speed + speedReward)),
        resilience: Math.min(50, Math.max(0, user.stats.resilience + resilienceReward)),
      };
      updateUser({ stats: updatedStats });
    }
  };

  const nextScenario = () => {
    if (scenarioIndex < MINI_GAME_SCENARIOS.length - 1) {
      setScenarioIndex(prev => prev + 1);
      setResults(null);
    } else {
      onClose();
    }
  };

  if (!scenario) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-2xl" onClick={onClose} />
      
      <div className="glass-card border t-border-accent rounded-3xl p-6 w-full max-w-2xl relative z-10 shadow-[0_0_50px_rgba(74,222,128,0.2)] animate-fade-in overflow-hidden flex flex-col max-h-[90vh] bg-black/60 backdrop-blur-xl">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-green-500/30 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
              <Target className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-widest text-white">{scenario.title}</h2>
              <span className="text-xs font-mono text-green-400 uppercase">{scenario.category}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="py-6 flex-1 overflow-y-auto space-y-6">
          <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700 font-mono text-sm leading-relaxed text-gray-300">
            {scenario.situation}
          </div>

          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">{scenario.question}</h3>
            
            {!results && (
              <div className={`font-mono text-xl font-bold flex items-center gap-2 ${timeLeft <= 5 ? 'text-red-500 animate-pulse' : 'text-green-400'}`}>
                <Zap className="w-5 h-5" />
                00:{timeLeft.toString().padStart(2, '0')}
              </div>
            )}
          </div>

          {!results ? (
            <div className="space-y-3">
              {scenario.choices.map((choice, i) => (
                <button
                  key={i}
                  onClick={() => handleChoice(choice)}
                  className="w-full text-left p-4 rounded-xl bg-gray-800/50 hover:bg-gray-700/80 border border-gray-700 hover:border-green-500/50 transition-all group relative overflow-hidden"
                >
                  <span className="relative z-10 text-gray-200 font-medium group-hover:text-white">{choice.text}</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}

              <div className="pt-4 flex justify-end">
                <button 
                  onClick={() => setShowHint(true)}
                  disabled={showHint}
                  className="text-sm font-mono text-gray-400 hover:text-blue-400 flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  <Eye className="w-4 h-4" />
                  {showHint ? "Hint Used" : "Request Hint (-Intuition XP)"}
                </button>
              </div>

              {showHint && (
                <div className="mt-4 p-3 border-l-2 border-blue-500 bg-blue-900/20 text-blue-300 text-sm font-mono flex gap-2">
                  <Brain className="w-5 h-5 shrink-0" />
                  {scenario.hint}
                </div>
              )}
            </div>
          ) : (
            <div className="animate-slide-up space-y-6">
              <div className={`p-4 rounded-xl border ${results.isCorrect ? 'bg-green-900/30 border-green-500' : 'bg-red-900/30 border-red-500'} flex items-center gap-4`}>
                {results.isCorrect ? <Target className="w-8 h-8 text-green-400" /> : <AlertTriangle className="w-8 h-8 text-red-400" />}
                <div>
                  <h3 className={`text-xl font-black uppercase tracking-widest ${results.isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                    {results.isCorrect ? "Correct Evasion" : "Compromised"}
                  </h3>
                  <p className="text-gray-300 text-sm mt-1">
                    {results.isCorrect ? "You successfully navigated the threat." : "You fell for the social engineering tactic."}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-black/40 border border-gray-800 p-4 rounded-xl text-center">
                  <Eye className="w-6 h-6 mx-auto mb-2 text-blue-400" />
                  <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Awareness</div>
                  <div className={`font-mono text-xl ${results.awareness >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {results.awareness >= 0 ? '+' : ''}{results.awareness}
                  </div>
                </div>
                <div className="bg-black/40 border border-gray-800 p-4 rounded-xl text-center">
                  <Brain className="w-6 h-6 mx-auto mb-2 text-purple-400" />
                  <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Intuition</div>
                  <div className={`font-mono text-xl ${results.intuition >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {results.intuition >= 0 ? '+' : ''}{results.intuition}
                  </div>
                </div>
                <div className="bg-black/40 border border-gray-800 p-4 rounded-xl text-center">
                  <Zap className="w-6 h-6 mx-auto mb-2 text-yellow-400" />
                  <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Speed</div>
                  <div className={`font-mono text-xl ${results.speed >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {results.speed >= 0 ? '+' : ''}{results.speed}
                  </div>
                </div>
                <div className="bg-black/40 border border-gray-800 p-4 rounded-xl text-center">
                  <ShieldAlert className="w-6 h-6 mx-auto mb-2 text-orange-400" />
                  <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Resilience</div>
                  <div className={`font-mono text-xl ${results.resilience >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {results.resilience >= 0 ? '+' : ''}{results.resilience}
                  </div>
                </div>
              </div>

              <button
                onClick={nextScenario}
                className="w-full py-4 bg-green-500 hover:bg-green-400 text-black font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(74,222,128,0.2)]"
              >
                {scenarioIndex < MINI_GAME_SCENARIOS.length - 1 ? "Next Scenario" : "Finish Training"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
