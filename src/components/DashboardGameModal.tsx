import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useI18n } from "../i18n";
import { X, ShieldAlert, Zap, Brain, Eye, Target, AlertTriangle, Send } from "lucide-react";
import { generateScenario, evaluateResponse, type AIScenario, type AIEvaluation } from "../api/ai";

interface DashboardGameModalProps {
  onClose: () => void;
}

export default function DashboardGameModal({ onClose }: DashboardGameModalProps) {
  const { user, updateUser } = useAuth();
  const { t } = useI18n();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [evaluating, setEvaluating] = useState(false);
  const [scenario, setScenario] = useState<AIScenario | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  
  const [chatHistory, setChatHistory] = useState<{ sender: 'fraudster' | 'user'; text: string }[]>([]);
  const [userInput, setUserInput] = useState("");
  
  const [results, setResults] = useState<AIEvaluation | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadNewScenario();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, evaluating]);

  const loadNewScenario = async () => {
    setLoading(true);
    setError(null);
    setResults(null);
    setChatHistory([]);
    setUserInput("");
    try {
      const elo = user?.stats?.elo || 1200;
      const res = await generateScenario("Phishing and Social Engineering", elo);
      const newScenario = res.data.scenario;
      setScenario(newScenario);
      setTimeLeft(newScenario.timeLimit || 60);
      setChatHistory([{ sender: 'fraudster', text: newScenario.initialGreeting }]);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to generate scenario. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (timeLeft > 0 && !results && !loading) {
      const timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !results && scenario && !loading) {
      // Time ran out
      handleEvaluationResult({
        isCompromised: true,
        isGameOver: true,
        fraudsterReply: "You took too long! The funds have been siphoned.",
        rewards: { awareness: 0, intuition: 0, speed: 0, resilience: -10 }
      });
    }
  }, [timeLeft, results, scenario, loading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || evaluating || results) return;

    const text = userInput.trim();
    setUserInput("");
    const updatedHistory = [...chatHistory, { sender: 'user' as const, text }];
    setChatHistory(updatedHistory);
    setEvaluating(true);

    try {
      const res = await evaluateResponse(scenario!.briefing, updatedHistory, text);
      const evaluation = res.data.evaluation;
      
      setChatHistory(prev => [...prev, { sender: 'fraudster', text: evaluation.fraudsterReply }]);
      
      if (evaluation.isGameOver) {
        handleEvaluationResult(evaluation);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setEvaluating(false);
    }
  };

  const handleEvaluationResult = (evaluation: AIEvaluation) => {
    setResults(evaluation);

    if (user?.stats) {
      const updatedStats = {
        ...user.stats,
        awareness: Math.min(50, Math.max(0, user.stats.awareness + evaluation.rewards.awareness)),
        intuition: Math.min(50, Math.max(0, user.stats.intuition + evaluation.rewards.intuition)),
        speed: Math.min(50, Math.max(0, user.stats.speed + evaluation.rewards.speed)),
        resilience: Math.min(50, Math.max(0, user.stats.resilience + evaluation.rewards.resilience)),
      };
      updateUser({ stats: updatedStats });
    }
  };

  if (loading || !scenario) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/80 backdrop-blur-2xl" onClick={onClose} />
        <div className="glass-card border t-border-accent rounded-3xl p-6 w-full max-w-2xl relative z-10 shadow-[0_0_50px_rgba(74,222,128,0.2)] animate-fade-in flex flex-col items-center justify-center min-h-[400px] bg-black/60 backdrop-blur-xl">
          <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-6 h-6 text-gray-400" />
          </button>
          
          {error ? (
            <div className="flex flex-col items-center text-center">
              <AlertTriangle className="w-16 h-16 text-red-400 mb-4" />
              <h3 className="text-xl font-bold text-red-400 uppercase tracking-widest mb-2">Connection Failed</h3>
              <p className="text-gray-400 font-mono mb-6 max-w-md">{error}</p>
              <div className="flex gap-4">
                <button onClick={onClose} className="px-6 py-2 rounded-xl border border-gray-600 text-gray-300 hover:bg-white/5 font-mono uppercase text-sm transition-colors">
                  Abort
                </button>
                <button onClick={loadNewScenario} className="px-6 py-2 rounded-xl bg-green-500 hover:bg-green-400 text-black font-bold font-mono uppercase text-sm transition-colors">
                  Retry Connection
                </button>
              </div>
            </div>
          ) : (
            <>
              <Zap className="w-12 h-12 text-green-400 animate-pulse mb-4" />
              <p className="text-green-400 font-mono tracking-widest uppercase">Generating AI Scenario...</p>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-2xl" onClick={onClose} />
      
      <div className="glass-card border t-border-accent rounded-3xl p-6 w-full max-w-2xl relative z-10 shadow-[0_0_50px_rgba(74,222,128,0.2)] animate-fade-in overflow-hidden flex flex-col h-[90vh] bg-black/60 backdrop-blur-xl">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-green-500/30 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
              <Target className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-widest text-white">{scenario.title}</h2>
              <span className="text-xs font-mono text-green-400 uppercase">{scenario.category} | Difficulty: {scenario.difficulty}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="py-4 flex-1 overflow-y-auto space-y-6 flex flex-col">
          <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700 font-mono text-sm leading-relaxed text-gray-300">
            <span className="font-bold text-green-400">Briefing: </span>{scenario.briefing}
            <br/><br/>
            <span className="font-bold text-red-400">Contact: </span>{scenario.characterIntro}
          </div>

          <div className="flex items-center justify-between shrink-0">
            <h3 className="text-lg font-bold text-white">Live Interception</h3>
            
            {!results && (
              <div className={`font-mono text-xl font-bold flex items-center gap-2 ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-green-400'}`}>
                <Zap className="w-5 h-5" />
                00:{timeLeft.toString().padStart(2, '0')}
              </div>
            )}
          </div>

          <div className="flex-1 bg-black/40 border border-gray-800 rounded-xl p-4 overflow-y-auto space-y-4">
            {chatHistory.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-xl ${msg.sender === 'user' ? 'bg-green-600/20 border border-green-500/30 text-green-100' : 'bg-red-900/20 border border-red-500/30 text-red-100'}`}>
                  <div className="text-xs font-mono opacity-50 mb-1">{msg.sender === 'user' ? 'You' : 'Unknown Caller'}</div>
                  <div className="text-sm">{msg.text}</div>
                </div>
              </div>
            ))}
            {evaluating && (
              <div className="flex justify-start">
                <div className="bg-red-900/10 border border-red-500/10 p-3 rounded-xl text-red-400 text-sm italic animate-pulse">
                  Typing...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {!results ? (
            <form onSubmit={handleSend} className="shrink-0 flex gap-2">
              <input 
                type="text" 
                value={userInput}
                onChange={e => setUserInput(e.target.value)}
                placeholder="Type your response to the caller..."
                disabled={evaluating}
                className="flex-1 bg-black/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-green-500 font-mono disabled:opacity-50"
              />
              <button 
                type="submit"
                disabled={evaluating || !userInput.trim()}
                className="px-6 py-3 bg-green-500 hover:bg-green-400 text-black rounded-xl font-bold transition-colors disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          ) : (
            <div className="animate-slide-up space-y-6 shrink-0 pt-4">
              <div className={`p-4 rounded-xl border ${!results.isCompromised ? 'bg-green-900/30 border-green-500' : 'bg-red-900/30 border-red-500'} flex items-center gap-4`}>
                {!results.isCompromised ? <Target className="w-8 h-8 text-green-400" /> : <AlertTriangle className="w-8 h-8 text-red-400" />}
                <div>
                  <h3 className={`text-xl font-black uppercase tracking-widest ${!results.isCompromised ? 'text-green-400' : 'text-red-400'}`}>
                    {!results.isCompromised ? "Correct Evasion" : "Compromised"}
                  </h3>
                  <p className="text-gray-300 text-sm mt-1">
                    {!results.isCompromised ? "You successfully navigated the threat." : "You fell for the social engineering tactic."}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-black/40 border border-gray-800 p-4 rounded-xl text-center">
                  <Eye className="w-6 h-6 mx-auto mb-2 text-blue-400" />
                  <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Awareness</div>
                  <div className={`font-mono text-xl ${results.rewards.awareness >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {results.rewards.awareness >= 0 ? '+' : ''}{results.rewards.awareness}
                  </div>
                </div>
                <div className="bg-black/40 border border-gray-800 p-4 rounded-xl text-center">
                  <Brain className="w-6 h-6 mx-auto mb-2 text-purple-400" />
                  <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Intuition</div>
                  <div className={`font-mono text-xl ${results.rewards.intuition >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {results.rewards.intuition >= 0 ? '+' : ''}{results.rewards.intuition}
                  </div>
                </div>
                <div className="bg-black/40 border border-gray-800 p-4 rounded-xl text-center">
                  <Zap className="w-6 h-6 mx-auto mb-2 text-yellow-400" />
                  <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Speed</div>
                  <div className={`font-mono text-xl ${results.rewards.speed >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {results.rewards.speed >= 0 ? '+' : ''}{results.rewards.speed}
                  </div>
                </div>
                <div className="bg-black/40 border border-gray-800 p-4 rounded-xl text-center">
                  <ShieldAlert className="w-6 h-6 mx-auto mb-2 text-orange-400" />
                  <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Resilience</div>
                  <div className={`font-mono text-xl ${results.rewards.resilience >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {results.rewards.resilience >= 0 ? '+' : ''}{results.rewards.resilience}
                  </div>
                </div>
              </div>

              <button
                onClick={loadNewScenario}
                className="w-full py-4 bg-green-500 hover:bg-green-400 text-black font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(74,222,128,0.2)]"
              >
                Load Next Scenario
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
