import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useI18n } from "../i18n";
import { useTheme } from "../contexts/ThemeContext";
import { 
  Shield, 
  Send, 
  Handshake, 
  Clock, 
  AlertTriangle, 
  User, 
  CheckCircle,
  Check,
  Activity,
  LogOut,
  Crosshair,
  Server,
  Moon,
  Sun,
  Info,
  Trophy,
  ChevronRight,
  Globe,
  ChevronDown
} from "lucide-react";
import { getLobby, sendMessage, endGame, completeTask } from "../api/tournaments";
import type { TournamentLobby } from "../types";

const LOCAL_STORAGE_LOBBY_KEY = "cactus_active_lobby";

  // Guided tour steps will be built inside the component using t()

export default function TournamentArenaView() {
  const { user } = useAuth();
  const { t, lang: language, setLang: setLanguage } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [lobby, setLobby] = useState<TournamentLobby | null>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_LOBBY_KEY);
    return saved ? JSON.parse(saved) : null;
  });

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [timeLeft, setTimeLeft] = useState(300);
  const [chatInput, setChatInput] = useState("");
  const [showPenaltyModal, setShowPenaltyModal] = useState(false);
  
  const TOUR_STEPS = [
    { id: "identity", title: t("arena.identity") || "Identity", desc: t("arena.identity_desc") || "Your assigned role and status." },
    { id: "objectives", title: t("arena.objectives") || "Objectives", desc: t("arena.objectives_desc") || "Tasks required for mission success." },
    { id: "leaderboard", title: t("arena.leaderboard") || "Leaderboard", desc: t("arena.leaderboard_desc") || "Current player rankings." },
    { id: "hub", title: t("arena.hub") || "Scenario Hub", desc: t("arena.hub_desc") || "Observe player connections." },
    { id: "commlink", title: t("arena.commlink") || "Encrypted Comm-Link", desc: t("arena.commlink_desc") || "Secure squad communication." },
    { id: "propose_deal", title: t("arena.propose_deal") || "Propose Deal", desc: t("arena.propose_deal_desc") || "Initiate secure data exchange." }
  ];
  
  // Guided Tour State
  const [tourStep, setTourStep] = useState<number | null>(() => {
    return sessionStorage.getItem(`arena_tour_done_${lobby?.id || "temp"}`) ? null : 0;
  }); // 0, 1, 2 = active step. null = tour finished.
  const [focusedSection, setFocusedSection] = useState<string | null>(null); // For manual "Info" clicks
  
  const handleInfoClick = (sectionId: string) => {
    if (tourStep !== null) {
      setTourStep(null);
      sessionStorage.setItem(`arena_tour_done_${lobby?.id || "temp"}`, "true");
    }
    setFocusedSection(activeOverlayId === sectionId && tourStep === null ? null : sectionId);
  };

  const handleNextTour = () => {
    if (tourStep !== null && tourStep < TOUR_STEPS.length - 1) {
      setTourStep(tourStep + 1);
    } else {
      setTourStep(null);
      sessionStorage.setItem(`arena_tour_done_${lobby?.id || "temp"}`, "true");
    }
  };

  // Determine which section is currently "focused" by the tour or manual info click
  const activeOverlayId = tourStep !== null ? TOUR_STEPS[tourStep].id : focusedSection;
  const isOverlayActive = activeOverlayId !== null;

  const renderTooltip = (sectionId: string) => {
    if (activeOverlayId !== sectionId) return null;
    const stepDef = TOUR_STEPS.find(s => s.id === sectionId);
    if (!stepDef) return null;

    const positionClass = sectionId === 'propose_deal' 
      ? 'bottom-[calc(100%+1rem)] left-1/2 -translate-x-1/2' 
      : 'top-16 left-1/2 -translate-x-1/2';

    return (
      <div className={`absolute ${positionClass} w-72 sm:w-80 bg-gray-900 border border-green-500/50 rounded-xl p-5 shadow-2xl z-[80] animate-fade-in-up`}>
        <h4 className="text-green-400 font-black tracking-widest uppercase mb-2">{t(`arena.${stepDef.id}`) || stepDef.title}</h4>
        <p className="text-sm text-gray-300 mb-4 leading-relaxed">{t(`arena.${stepDef.id}_desc`) || stepDef.desc}</p>
        
        {tourStep !== null ? (
          <div className="flex items-center justify-between mt-2">
            <div className="flex gap-1.5">
              {TOUR_STEPS.map((_, i) => (
                <div key={i} className={`w-2 h-2 rounded-full ${i === tourStep ? "bg-green-400" : "bg-gray-600"}`} />
              ))}
            </div>
            <button 
              onClick={handleNextTour}
              className="flex items-center gap-1 px-4 py-2 bg-green-500 hover:bg-green-400 text-black font-bold rounded-lg transition-colors text-xs uppercase"
            >
              {tourStep < TOUR_STEPS.length - 1 ? (t("arena.next") || "NEXT") : (t("arena.finish") || "FINISH")}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex justify-end mt-2">
            <button 
              onClick={() => setFocusedSection(null)}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-lg transition-colors text-xs uppercase"
            >
              {t("arena.return") || "CLOSE"}
            </button>
          </div>
        )}
      </div>
    );
  };
  
  const HighlightBlock = ({ id, children, className = "" }: { id: string, children: React.ReactNode, className?: string }) => {
    const isActive = activeOverlayId === id;
    return (
      <div className={`relative transition-all duration-500 rounded-2xl ${isActive ? "z-[50] scale-[1.02] bg-gray-900 ring-2 ring-green-500 shadow-[0_0_50px_rgba(74,222,128,0.3)]" : "z-10"} ${className}`}>
        {children}
        {isActive && renderTooltip(id)}
      </div>
    );
  };
  
  const [showResults, setShowResults] = useState(false);
  const [activeNode, setActiveNode] = useState(1);
  const chatRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [lobby?.messages]);

  // Sync with backend every second
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (lobby?.id && lobby.status !== 'completed') {
      interval = setInterval(() => {
        getLobby(lobby.id)
          .then(res => {
            const updated = res.data.lobby;
            setLobby(updated);
            localStorage.setItem(LOCAL_STORAGE_LOBBY_KEY, JSON.stringify(updated));
            
            // Sync Timer
            if (updated.startTime && updated.endTime) {
              const remaining = Math.max(0, Math.floor((updated.endTime - Date.now()) / 1000));
              setTimeLeft(remaining);
              if (remaining === 0 && updated.status === 'active' && updated.hostUsername === user?.username) {
                endGame(updated.id); // host ends game
              }
            }

            if (updated.status === 'completed') {
              setShowResults(true);
            }
          })
          .catch(() => {
            // maybe lobby deleted
          });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [lobby?.id, lobby?.status, user?.username]);

  // Node pulsing logic
  useEffect(() => {
    if (!lobby) return;
    const interval = setInterval(() => {
      setActiveNode((prev) => (prev % lobby.players.length) + 1);
    }, 3000);
    return () => clearInterval(interval);
  }, [lobby]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !lobby) return;
    
    const content = chatInput.trim();
    setChatInput("");
    try {
      await sendMessage(lobby.id, user?.username || "Player", content, formatTime(timeLeft));
    } catch (err) {
      console.error(err);
    }
  };

  const handleProposeDeal = async () => {
    if (!lobby) return;
    try {
      await sendMessage(lobby.id, "System", `${user?.username || "Player"} has proposed a secure data exchange.`, formatTime(timeLeft));
    } catch (err) {}
  };

  const handleAbandon = () => {
    setShowPenaltyModal(true);
  };

  const confirmFlee = () => {
    localStorage.removeItem(LOCAL_STORAGE_LOBBY_KEY);
    navigate("/tournaments");
  };

  const closeResults = () => {
    localStorage.removeItem(LOCAL_STORAGE_LOBBY_KEY);
    navigate("/tournaments");
  };

  if (!lobby) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center t-bg">
        <h2 className="text-xl font-mono text-red-500">{t("arena.connection_lost") || "CONNECTION LOST. NO ACTIVE LOBBY."}</h2>
        <button onClick={() => navigate("/tournaments")} className="mt-4 px-4 py-2 t-border border t-text rounded-xl hover:t-accent-bg hover:text-black">{t("arena.return") || "Return"}</button>
      </div>
    );
  }

  const myRole = lobby.roles?.[user?.username || ""] || "Bank Staff";
  const translatedRole = myRole === "Bank Staff" ? (t("arena.role_bank_staff") || "BANK STAFF") : (t("arena.role_fraudster") || "FRAUDSTER");
  const isFraudster = myRole === "Fraudster"; 
  const currentMessages = lobby.messages || [];
  const currentTasks = lobby.tasks || [];
  
  // Sort players by XP for leaderboard
  const sortedPlayers = [...lobby.players].sort((a, b) => (lobby.xp?.[b] || 0) - (lobby.xp?.[a] || 0));

  return (
    <div className="fixed inset-0 z-50 flex flex-col p-2 sm:p-4 t-bg text-white font-sans pointer-events-auto">
      
      {/* Top Warning Bar & Nav */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500/50 to-transparent shadow-[0_0_15px_rgba(239,68,68,0.5)] z-0 animate-pulse" />

      {/* Global Dark Overlay for Tour/Focus */}
      {isOverlayActive && (
        <div 
          className="fixed inset-0 z-[40] bg-black/60 backdrop-blur-md transition-all" 
          onClick={() => { if(focusedSection) setFocusedSection(null) }} 
        />
      )}

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 relative">
        
        {/* DASHBOARD COLUMN */}
        <div className="lg:col-span-3 flex flex-col gap-4 relative">
          
          <div className="flex justify-between items-center bg-black/40 border t-border rounded-xl px-3 py-2 backdrop-blur-md relative z-20">
            {/* Moved Nav to Top-Left inside Dashboard column to avoid Leave button */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 t-text font-mono text-sm tracking-widest uppercase">
                {theme === "dark" ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-orange-400" />}
              </div>
              <div className="w-px h-4 bg-gray-700" />
              <div className="relative group">
                <button className="flex items-center gap-1 hover:bg-white/10 rounded-md transition-colors text-xs font-bold t-text uppercase">
                  <Globe className="w-3.5 h-3.5" />
                  {language}
                  <ChevronDown className="w-3 h-3 opacity-50" />
                </button>
                <div className="absolute top-full left-0 mt-2 w-32 bg-gray-900 border border-green-500/30 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all flex flex-col overflow-hidden z-[100]">
                  <button onClick={() => setLanguage('en')} className={`px-3 py-2 text-xs font-bold text-left hover:bg-green-500/20 ${language === 'en' ? 'text-green-400' : 'text-gray-300'}`}>EN - English</button>
                  <button onClick={() => setLanguage('ru')} className={`px-3 py-2 text-xs font-bold text-left hover:bg-green-500/20 ${language === 'ru' ? 'text-green-400' : 'text-gray-300'}`}>RU - Русский</button>
                  <button onClick={() => setLanguage('uz')} className={`px-3 py-2 text-xs font-bold text-left hover:bg-green-500/20 ${language === 'uz' ? 'text-green-400' : 'text-gray-300'}`}>UZ - O'zbek</button>
                </div>
              </div>
            </div>
            
            <button 
              onClick={handleAbandon}
              className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-bold rounded-lg transition-colors uppercase tracking-wider flex items-center gap-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Abandon</span>
            </button>
          </div>

          <HighlightBlock id="identity">
            <div className={`glass-card border-2 p-4 rounded-2xl flex flex-col shadow-xl backdrop-blur-xl ${
              isFraudster ? 'bg-red-950/40 border-red-500/50 shadow-red-500/10' : 'bg-blue-950/40 border-blue-500/50 shadow-blue-500/10'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-gray-400">{t("arena.identity") || "Your Hidden Identity"}</span>
                <button onClick={(e) => { e.stopPropagation(); handleInfoClick("identity"); }} className="p-1 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white">
                  <Info className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${isFraudster ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>
                  {isFraudster ? <AlertTriangle className="w-8 h-8" /> : <Shield className="w-8 h-8" />}
                </div>
                <div>
                  <h2 className={`text-2xl sm:text-3xl font-black uppercase tracking-widest ${isFraudster ? 'text-red-500' : 'text-blue-500'}`}>
                    {translatedRole}
                  </h2>
                </div>
              </div>
              <p className="mt-3 text-sm text-gray-300 font-mono leading-relaxed bg-black/40 p-3 rounded-xl border border-white/5">
                {isFraudster 
                  ? (t("arena.fraudster_obj") || "Objective: Frame another player or escape undetected. Sabotage the investigation.")
                  : (t("arena.bank_obj") || "Objective: Identify the fraudster and secure the transaction logs.")}
              </p>
            </div>
          </HighlightBlock>

          <HighlightBlock id="objectives" className="flex-1 min-h-[250px]">
            <div className="glass-card border t-border rounded-2xl flex flex-col h-full shadow-xl bg-black/20 backdrop-blur-md relative overflow-hidden">
              {/* Animated background gradient */}
              <div className="absolute inset-0 bg-gradient-to-b from-green-500/5 to-transparent pointer-events-none" />
              
              <div className="p-4 border-b t-border bg-black/40 flex items-center justify-between z-10 relative">
                <div className="flex items-center gap-2 text-gray-300 font-mono text-sm tracking-widest uppercase">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  {t("arena.objectives") || "Active Objectives"}
                </div>
                <button onClick={(e) => { e.stopPropagation(); handleInfoClick("objectives"); }} className="p-1 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white">
                  <Info className="w-4 h-4" />
                </button>
              </div>
              <div className="p-3 sm:p-4 overflow-y-auto custom-scrollbar flex-1 flex flex-col gap-3 relative z-10">
                {currentTasks.map(task => (
                  <div 
                    key={task.id}
                    className={`flex items-start gap-3 p-3 rounded-xl transition-all duration-300 text-left w-full border ${
                      task.completedBy.includes(user?.username || "")
                        ? 'bg-green-500/10 border-green-500/30 shadow-[inset_0_0_20px_rgba(74,222,128,0.1)]' 
                        : 'bg-black/40 border-white/10'
                    }`}
                  >
                    <div className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center border shrink-0 transition-colors ${
                      task.completedBy.includes(user?.username || "") ? 'bg-green-500 border-green-400 text-black' : 'border-gray-500 bg-gray-900'
                    }`}>
                      {task.completedBy.includes(user?.username || "") && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm ${task.completedBy.includes(user?.username || "") ? 'text-green-300 font-medium' : 'text-gray-200'}`}>{task.title}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold text-yellow-500 uppercase tracking-wider">+{task.rewardXP} XP</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </HighlightBlock>

          <HighlightBlock id="leaderboard">
            <div className="glass-card border t-border rounded-2xl shadow-xl bg-black/20 backdrop-blur-md overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 blur-3xl rounded-full" />
              <div className="p-4 border-b t-border bg-black/40 flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-300 font-mono text-sm tracking-widest uppercase">
                  <Activity className="w-4 h-4 text-green-500" />
                  {t("arena.leaderboard") || "Live Leaderboard"}
                </div>
                <button onClick={(e) => { e.stopPropagation(); handleInfoClick("leaderboard"); }} className="p-1 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white">
                  <Info className="w-4 h-4" />
                </button>
              </div>
              <div className="p-3 sm:p-4 flex flex-col gap-2 relative z-10">
                {sortedPlayers.map((p, idx) => (
                  <div key={p} className="flex items-center justify-between p-2 rounded-lg bg-black/40 border border-white/5">
                    <div className="flex items-center gap-3">
                      <span className="text-gray-500 font-mono text-xs">#{idx + 1}</span>
                      <span className={`font-bold ${p === user?.username ? 'text-green-400' : 'text-gray-300'}`}>{p}</span>
                    </div>
                    <span className="font-mono text-yellow-500 font-bold text-xs">{lobby.xp?.[p] || 0} XP</span>
                  </div>
                ))}
              </div>
            </div>
          </HighlightBlock>
          
        </div>


        {/* ==================================================================================== */}
        {/* MIDDLE COLUMN: ACTIVE GAME/SCENARIO */}
        {/* ==================================================================================== */}
        <div className="lg:col-span-6 flex flex-col gap-4 relative">
          
          <HighlightBlock id="hub" className="flex-1 flex flex-col">
            <div className="glass-card border t-border rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between shadow-xl shadow-black/20 backdrop-blur-xl bg-black/40 gap-4 sm:gap-0 shrink-0">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="w-10 h-10 rounded-xl bg-green-500/20 border border-green-500/50 flex items-center justify-center shrink-0">
                  <Shield className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-black uppercase tracking-widest text-white flex items-center gap-2">
                    {t("arena.scenario") || "Operation: Phantom Invoice"}
                    <button onClick={(e) => { e.stopPropagation(); handleInfoClick("hub"); }} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                      <Info className="w-4 h-4 text-gray-400 hover:text-white" />
                    </button>
                  </h1>
                  <p className="text-xs font-mono text-gray-400 tracking-[0.2em] uppercase">Scenario Active • Phase 1</p>
                </div>
              </div>
            
            <div className="flex items-center gap-4 shrink-0">
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-mono uppercase t-text-muted">{t("arena.time_remaining") || "Time Remaining"}</span>
                <div className={`text-3xl sm:text-4xl font-mono font-black tracking-widest ${timeLeft < 60 ? "text-red-500 animate-pulse" : "text-white"}`}>
                  {formatTime(timeLeft)}
                </div>
              </div>
              <button 
                onClick={handleAbandon}
                className="flex items-center gap-2 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-500 rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition-colors"
                title="Disconnect"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="glass-card flex-1 border t-border rounded-2xl relative overflow-hidden bg-black/40 shadow-inner min-h-[400px] flex items-center justify-center mt-4">
            <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:30px_30px]" />
            <div className="relative w-[350px] h-[350px] md:w-[500px] md:h-[500px]">
              
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
                <div className="w-36 h-36 rounded-full border-4 border-dashed t-border-accent flex items-center justify-center bg-black/80 shadow-[0_0_50px_rgba(52,211,153,0.3)]">
                  <div className="w-24 h-24 rounded-full t-bg border border-green-500/30 flex items-center justify-center flex-col">
                    <Crosshair className="w-10 h-10 t-text-accent mb-2" />
                    <span className="text-xs font-mono font-bold text-center leading-tight t-text" dangerouslySetInnerHTML={{__html: (t("arena.active_target") || "ACTIVE<br/>TARGET").replace(" ", "<br/>") }}></span>
                  </div>
                </div>
              </div>

              {lobby.players.map((player, index) => {
                const angle = (index * 360) / lobby.players.length;
                const radian = (angle * Math.PI) / 180;
                // Increased radius to spread them further around the larger center
                const radius = windowWidth < 768 ? 140 : 210; 
                const x = Math.cos(radian) * radius;
                const y = Math.sin(radian) * radius;
                const isActive = activeNode === index + 1;

                return (
                  <React.Fragment key={player}>
                    <div 
                      className={`absolute top-1/2 left-1/2 h-0.5 origin-left ${isActive ? 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.8)]' : 'bg-gray-500/30'} transition-all duration-500`}
                      style={{ 
                        width: `${radius - 40}px`,
                        transform: `rotate(${angle}deg)`,
                        zIndex: 10
                      }}
                    />
                    <div 
                      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 transition-all duration-500"
                      style={{ marginLeft: `${x}px`, marginTop: `${y}px` }}
                    >
                      {/* INCREASED NODE SIZES */}
                      <div className={`w-20 h-20 rounded-full flex flex-col items-center justify-center border-2 bg-black ${
                        isActive 
                          ? "border-green-400 shadow-[0_0_25px_rgba(74,222,128,0.6)] scale-110" 
                          : "border-gray-600/50 scale-100"
                      }`}>
                        <User className={`w-8 h-8 ${isActive ? "t-text-accent" : "text-gray-400"}`} />
                        <div className={`absolute -bottom-7 w-max text-xs font-mono font-bold px-3 py-1 rounded-full ${isActive ? "bg-green-500/20 text-green-400 border border-green-500/30" : "text-gray-400 t-bg-secondary border t-border"}`}>
                          {player}
                        </div>
                      </div>
                      
                      {isActive && (
                        <div className="absolute inset-0 rounded-full border border-green-400 animate-ping opacity-75" />
                      )}
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          </div>
          </HighlightBlock>

        </div>


        {/* ==================================================================================== */}
        {/* RIGHT COLUMN: COMM-LINK (CHAT) */}
        {/* ==================================================================================== */}
        <div className="lg:col-span-3 flex flex-col gap-2 relative">
          <HighlightBlock id="commlink" className="flex-1 flex flex-col">
            <div className="glass-card border t-border rounded-2xl flex flex-col overflow-hidden shadow-xl shadow-black/20 backdrop-blur-xl bg-black/40 relative flex-1">
              <div className="p-4 t-bg-secondary border-b t-border flex flex-col shrink-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Server className="w-5 h-5 t-text-accent" />
                    <h2 className="font-mono font-bold tracking-widest text-sm uppercase">{t("arena.commlink") || "Encrypted Comm-Link"}</h2>
                    <button onClick={(e) => { e.stopPropagation(); handleInfoClick("commlink"); }} className="p-1 rounded-full hover:bg-white/10 transition-colors">
                      <Info className="w-4 h-4 t-text-secondary" />
                    </button>
                  </div>
                </div>
              </div>

              <div ref={chatRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                {currentMessages.map((msg, idx) => (
                  <div key={idx} className="animate-fade-in-up">
                    {msg.type === "system" || msg.sender === "System" ? (
                      <div className="text-center my-4">
                        <span className="text-[10px] font-mono t-text-muted italic bg-black/20 px-3 py-1 rounded-full border border-white/5">
                          {msg.time} — {msg.content}
                        </span>
                      </div>
                    ) : (
                      <div className={`flex flex-col ${msg.sender === user?.username ? "items-end" : "items-start"}`}>
                        <div className="flex items-baseline gap-2 mb-1">
                          <span className="text-[10px] font-mono font-bold t-text-secondary">{msg.sender}</span>
                          <span className="text-[9px] font-mono t-text-muted">{msg.time}</span>
                        </div>
                        <div className={`px-4 py-2.5 rounded-2xl max-w-[85%] text-sm shadow-sm ${
                          msg.sender === user?.username 
                            ? "t-accent-bg text-black font-medium border border-green-500/20 rounded-tr-sm" 
                            : "t-bg-secondary t-border border rounded-tl-sm t-text"
                        }`}>
                          {msg.content}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="p-3 t-bg-secondary border-t t-border shrink-0">
                <form onSubmit={handleSendMessage} className="flex gap-2 relative">
                  <input 
                    type="text" 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder={t("arena.transmit") || "Transmit message..."}
                    disabled={lobby.status === 'completed'}
                    className="flex-1 bg-black/30 border t-border focus:t-border-accent rounded-xl px-4 py-3 text-sm outline-none t-text font-mono transition-colors disabled:opacity-50"
                  />
                  <button 
                    type="submit"
                    disabled={!chatInput.trim() || lobby.status === 'completed'}
                    className="p-3 t-accent-bg rounded-xl text-black hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 transition-all flex items-center justify-center"
                  >
                    <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </form>
              </div>
            </div>
          </HighlightBlock>

          <HighlightBlock id="propose_deal">
            <button onClick={handleProposeDeal} disabled={lobby.status === 'completed'} className="w-full py-3 sm:py-4 border-2 border-blue-500/30 hover:border-blue-500/50 bg-blue-950/30 hover:bg-blue-900/50 rounded-xl transition-all flex items-center justify-center gap-2 text-blue-400 hover:text-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.1)] hover:shadow-[0_0_20px_rgba(59,130,246,0.2)]">
              <Handshake className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="font-bold text-xs sm:text-sm tracking-widest uppercase">{t("arena.propose_deal") || "Propose Deal"}</span>
              <div onClick={(e) => { e.stopPropagation(); handleInfoClick("propose_deal"); }} className="p-1 hover:bg-white/10 rounded-full transition-colors text-blue-400 hover:text-white ml-2">
                <Info className="w-4 h-4" />
              </div>
            </button>
          </HighlightBlock>
        </div>

      </div>

      {/* ==================================================================================== */}
      {/* END GAME RESULTS MODAL */}
      {/* ==================================================================================== */}
      {showResults && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" />
          <div className="relative max-w-xl w-full p-8 rounded-3xl shadow-2xl animate-fade-in-up flex flex-col items-center text-center border border-white/10" style={{ background: "radial-gradient(circle at center, #1a202c, #000)" }}>
            
            <Trophy className="w-16 h-16 text-yellow-400 mb-6" />
            <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-widest">{t("arena.op_concluded") || "Operation Concluded"}</h2>
            
            <div className="text-xl font-bold mb-8">
              {t("arena.victory") || "Victory goes to the"} <span className={lobby.winner === "Fraudster" ? "text-red-400" : "text-blue-400"}>{lobby.winner}</span>!
            </div>

            <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 text-left space-y-4">
              <h3 className="text-sm font-mono text-gray-400 uppercase tracking-widest mb-4">{t("arena.post_game") || "Post-Game Intel"}</h3>
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-gray-300">{t("arena.fraudster_was") || "The Fraudster was:"}</span>
                <span className="font-bold text-red-400">
                  {Object.keys(lobby.roles || {}).find(k => lobby.roles![k] === "Fraudster") || "Unknown"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">{t("arena.xp_earned") || "Your Base XP Earned:"}</span>
                <span className="font-bold text-yellow-400">+150 XP</span>
              </div>
            </div>

            <button 
              onClick={closeResults}
              className="w-full py-4 bg-green-500 hover:bg-green-400 text-black font-black rounded-xl uppercase tracking-widest transition-colors shadow-[0_0_15px_rgba(74,222,128,0.5)]"
            >
              {t("arena.return_lobby") || "Return to Lobby"}
            </button>
          </div>
        </div>
      )}

      {/* ==================================================================================== */}
      {/* PENALTY MODAL */}
      {/* ==================================================================================== */}
      {showPenaltyModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowPenaltyModal(false)} />
          <div className="relative glass-card border-2 border-red-500/50 bg-red-950/90 max-w-md w-full p-6 rounded-2xl shadow-[0_0_50px_rgba(239,68,68,0.3)] animate-fade-in-up">
            <div className="w-16 h-16 rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-500 animate-pulse" />
            </div>
            <h2 className="text-2xl font-black text-center text-white mb-2 uppercase tracking-widest">{t("arena.abandon") || "Abandon Operation?"}</h2>
            <p className="text-center text-red-200 mb-6 font-mono text-sm leading-relaxed">
              {t("arena.abandon_warn") || "WARNING: Abandoning an active tournament will result in an immediate ELO penalty and forfeit of all session XP."}
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowPenaltyModal(false)}
                className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-xl transition-colors"
              >
                {t("arena.return_game") || "Return to Game"}
              </button>
              <button 
                onClick={confirmFlee}
                className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white font-black rounded-xl uppercase tracking-widest transition-colors shadow-[0_0_15px_rgba(239,68,68,0.5)]"
              >
                {t("arena.accept_penalty") || "Accept Penalty"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
