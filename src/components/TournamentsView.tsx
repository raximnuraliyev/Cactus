import React, { useState } from "react";
import { useI18n } from "../i18n";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import { 
  Swords, 
  Users, 
  QrCode, 
  Plus, 
  LogIn, 
  Copy, 
  Check, 
  Play,
  XCircle,
  ScanLine,
  Trophy,
  Info
} from "lucide-react";
import type { TournamentLobby } from "../types";
import { useNavigate } from "react-router-dom";
import { createLobby, getLobby, joinLobby, leaveLobby, startGame } from "../api/tournaments";

const LOCAL_STORAGE_LOBBY_KEY = "cactus_active_lobby";

export default function TournamentsView() {
  const { t } = useI18n();
  const { theme } = useTheme();
  const { user } = useAuth();
  
  const navigate = useNavigate();
  
  const [joinId, setJoinId] = useState("");
  const [activeLobby, setActiveLobbyState] = useState<TournamentLobby | null>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_LOBBY_KEY);
    return saved ? JSON.parse(saved) : null;
  });

  React.useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (activeLobby?.id) {
      // Poll backend every 2 seconds
      interval = setInterval(() => {
        getLobby(activeLobby.id)
          .then(res => {
            setActiveLobbyState(res.data.lobby);
            localStorage.setItem(LOCAL_STORAGE_LOBBY_KEY, JSON.stringify(res.data.lobby));
            if (res.data.lobby.status === 'active') {
              navigate("/tournaments/arena");
            }
          })
          .catch(() => {
            // Lobby might be deleted
            setActiveLobbyState(null);
            localStorage.removeItem(LOCAL_STORAGE_LOBBY_KEY);
          });
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [activeLobby?.id]);

  const setActiveLobby = (lobby: TournamentLobby | null) => {
    if (lobby) {
      localStorage.setItem(LOCAL_STORAGE_LOBBY_KEY, JSON.stringify(lobby));
    } else {
      localStorage.removeItem(LOCAL_STORAGE_LOBBY_KEY);
    }
    setActiveLobbyState(lobby);
  };
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"join" | "create">("join");
  const [focusedSection, setFocusedSection] = useState<string | null>(null);

  const handleCreateLobby = async () => {
    try {
      const res = await createLobby(user?.username || "Player");
      setActiveLobby(res.data.lobby);
    } catch (e) {
      console.error(e);
      alert(t("tournaments.error") || "Error creating lobby");
    }
  };

  const handleCopyId = () => {
    if (activeLobby) {
      navigator.clipboard.writeText(activeLobby.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleMockPlayerJoin = async () => {
    if (activeLobby && activeLobby.players.length < activeLobby.maxPlayers) {
      try {
        const res = await joinLobby(activeLobby.id, `Agent_${Math.floor(100 + Math.random() * 900)}`);
        setActiveLobby(res.data.lobby);
      } catch {}
    }
  };

  const handleLeaveLobby = async () => {
    if (activeLobby) {
      try {
        await leaveLobby(activeLobby.id, user?.username || "Player");
      } catch {}
    }
    setActiveLobby(null);
  };

  // Lobby View
  if (activeLobby) {
    return (
      <div className="p-4 sm:p-6 w-full max-w-lg mx-auto space-y-6 animate-fade-in pb-24">
        <div className="glass-card p-6 flex flex-col items-center text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Swords className="w-24 h-24" />
          </div>
          
          <div className="w-16 h-16 rounded-full t-bg-secondary flex items-center justify-center mb-4 t-border border shadow-sm relative z-10">
            <Users className="w-8 h-8 t-text-accent" />
          </div>
          
          <h2 className="text-xl font-bold t-text tracking-wide mb-1 relative z-10">
            {t("tournaments.waiting_operatives") || "Waiting for Operatives..."}
          </h2>
          <p className="t-text-secondary text-sm mb-6 relative z-10">
            {t("tournaments.share_code") || "Share this code or QR with your squad"}
          </p>

          <div className="w-full t-bg-secondary border t-border rounded-2xl p-4 mb-6 relative z-10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono t-text-muted uppercase tracking-wider">{t("tournaments.lobby_code") || "Lobby Code"}</span>
              <span className="text-xs font-mono t-text-accent uppercase bg-green-500/10 px-2 py-0.5 rounded-full">
                {activeLobby.players.length}/{activeLobby.maxPlayers} {t("tournaments.ready") || "Ready"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-mono font-bold tracking-widest t-text">
                {activeLobby.id}
              </span>
              <button 
                onClick={handleCopyId}
                className="p-2 t-bg border t-border hover:t-border-accent rounded-xl transition-all"
              >
                {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5 t-text-secondary" />}
              </button>
            </div>
          </div>

          <div className="w-40 h-40 t-bg border t-border rounded-xl flex flex-col items-center justify-center mb-6 relative z-10 p-2 shadow-lg">
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${activeLobby.id}&color=4ADE80&bgcolor=12181B`} 
              alt="QR Code"
              className="w-full h-full rounded-lg object-contain"
            />
            <span className="text-[10px] font-mono t-text-secondary mt-2 opacity-50">{t("tournaments.scan_to_join") || "SCAN TO JOIN"}</span>
          </div>

          <div className="w-full space-y-3 relative z-10">
            <h3 className="text-left text-xs font-mono t-text-muted uppercase tracking-wider pl-2">{t("tournaments.operatives") || "Operatives"}</h3>
            <div className="space-y-2">
              {activeLobby.players.map((p, i) => (
                <div key={i} className="flex items-center justify-between p-3 t-bg border t-border rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full t-accent-bg flex items-center justify-center font-bold text-xs">
                      {p.charAt(0)}
                    </div>
                    <span className="text-sm font-medium t-text">{p}</span>
                  </div>
                  {i === 0 && (
                    <span className="text-[10px] font-mono t-text-accent border t-border-accent px-2 py-0.5 rounded uppercase">{t("tournaments.host") || "Host"}</span>
                  )}
                </div>
              ))}
              
              {/* Empty slots */}
              {Array.from({ length: activeLobby.maxPlayers - activeLobby.players.length }).map((_, i) => (
                <div key={`empty-${i}`} className="flex items-center justify-between p-3 border border-dashed t-border rounded-xl opacity-50">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full t-bg-secondary flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full t-bg animate-pulse" />
                    </div>
                    <span className="text-sm font-medium t-text-muted italic">{t("tournaments.awaiting") || "Awaiting connection..."}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dev button to mock a player joining */}
          {activeLobby.players.length < activeLobby.maxPlayers && (
            <button onClick={handleMockPlayerJoin} className="mt-4 text-[10px] text-emerald-500 underline opacity-50 hover:opacity-100">
              [DEV] {t("tournaments.simulate_join") || "Simulate Player Join"}
            </button>
          )}

          <div className="w-full grid grid-cols-1 gap-3 mt-6 relative z-10">
            <button 
              disabled={activeLobby.players.length < 2 || activeLobby.status === 'active'}
              onClick={async () => {
                if (activeLobby.hostUsername === (user?.username || "Player") && activeLobby.status === 'waiting') {
                  try {
                    await startGame(activeLobby.id);
                  } catch (e) {
                    console.error("Failed to start game", e);
                  }
                }
              }}
              className="w-full py-4 t-accent-bg rounded-xl font-bold uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
            >
              <Play className="w-5 h-5 fill-current" />
              {activeLobby.status === 'active' ? "Operation Active" : (t("tournaments.commence_op") || "Commence Operation")}
            </button>
            <button 
              onClick={handleLeaveLobby}
              className="w-full py-3 t-bg border t-border hover:t-danger hover:border-red-500/30 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2"
            >
              <XCircle className="w-4 h-4" />
              {t("tournaments.disband_squad") || "Disband Squad"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main Tournaments Dashboard
  return (
    <div className="p-4 sm:p-6 w-full max-w-lg mx-auto space-y-6 animate-fade-in pb-24">
      
      {/* Header */}
      <div className="flex items-center space-x-3 mb-8">
        <div className="p-3 rounded-2xl t-bg-card border t-border-accent shadow-[0_0_15px_rgba(74,222,128,0.15)]">
          <Swords className="w-6 h-6 t-text-accent" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold t-text tracking-wide">{t("tournaments.title") || "Multiplayer Ops"}</h1>
          <p className="text-sm t-text-secondary">{t("tournaments.subtitle") || "Train together. Trust no one."}</p>
        </div>
        <button onClick={() => setFocusedSection(focusedSection === "header" ? null : "header")} className="p-2 rounded-full hover:bg-white/10 transition-colors">
          <Info className="w-5 h-5 t-text-secondary" />
        </button>
      </div>

      {focusedSection === "header" && (
        <div className="bg-black/90 border border-green-500/50 rounded-xl p-4 shadow-2xl mb-6 animate-fade-in-up">
          <h4 className="text-green-400 font-bold mb-1">{t("tournaments.info_header_title") || "Squad Management"}</h4>
          <p className="text-xs text-gray-300">{t("tournaments.info_header_desc") || "Join an existing operation with a code, or host your own secure lobby for up to 4 operatives."}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex t-bg-secondary p-1 rounded-2xl border t-border mb-6">
        <button
          onClick={() => setActiveTab("join")}
          className={`flex-1 py-3 text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2 ${
            activeTab === "join" 
              ? "t-bg shadow-sm t-text" 
              : "t-text-muted hover:t-text-secondary"
          }`}
        >
          <LogIn className="w-4 h-4" />
          {t("tournaments.join_squad") || "Join Squad"}
        </button>
        <button
          onClick={() => setActiveTab("create")}
          className={`flex-1 py-3 text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2 ${
            activeTab === "create" 
              ? "t-bg shadow-sm t-text" 
              : "t-text-muted hover:t-text-secondary"
          }`}
        >
          <Plus className="w-4 h-4" />
          {t("tournaments.create_squad") || "Create Squad"}
        </button>
      </div>

      {/* Join Section */}
      {activeTab === "join" && (
        <div className="glass-card p-6 space-y-6 animate-fade-in">
          <div>
            <label className="block text-xs font-mono t-text-muted uppercase tracking-wider mb-2 pl-1">
              {t("tournaments.enter_code") || "Enter Lobby Code"}
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={joinId}
                onChange={(e) => setJoinId(e.target.value.toUpperCase())}
                placeholder="CCT-XXXX"
                className="flex-1 t-bg border t-border focus:t-border-accent outline-none rounded-xl px-4 py-3 t-text font-mono text-lg font-bold tracking-widest"
                maxLength={8}
              />
              <button 
                disabled={joinId.length < 4}
                onClick={async () => {
                  try {
                    const res = await joinLobby(joinId, user?.username || "Player");
                    setActiveLobby(res.data.lobby);
                  } catch (e) {
                    alert(t("tournaments.invalid_code") || "Invalid or full lobby.");
                  }
                }}
                className="px-6 t-accent-bg rounded-xl font-bold disabled:opacity-50 transition-all active:scale-95"
              >
                {t("tournaments.join_btn") || "JOIN"}
              </button>
            </div>
          </div>

          <div className="flex items-center py-2">
            <div className="flex-1 h-px t-bg-secondary border-t t-border"></div>
            <span className="px-4 text-[10px] font-mono t-text-muted uppercase">{t("tournaments.or") || "OR"}</span>
            <div className="flex-1 h-px t-bg-secondary border-t t-border"></div>
          </div>

          <div>
            <label className="block text-xs font-mono t-text-muted uppercase tracking-wider mb-2 pl-1 text-center">
              {t("tournaments.scan_qr") || "Scan Operative QR"}
            </label>
            <button className="w-full aspect-video t-bg border border-dashed t-border hover:t-border-accent rounded-2xl flex flex-col items-center justify-center group transition-all">
              <div className="p-4 rounded-full t-bg-secondary group-hover:t-accent-muted transition-colors mb-3">
                <ScanLine className="w-8 h-8 t-text-secondary group-hover:t-text-accent" />
              </div>
              <span className="text-sm font-medium t-text-secondary group-hover:t-text">{t("tournaments.tap_camera") || "Tap to open camera"}</span>
            </button>
          </div>
        </div>
      )}

      {/* Create Section */}
      {activeTab === "create" && (
        <div className="glass-card p-6 text-center space-y-6 animate-fade-in">
          <div className="w-20 h-20 rounded-full t-bg-secondary border t-border-accent flex items-center justify-center mx-auto mb-2 shadow-[0_0_20px_rgba(74,222,128,0.1)]">
            <Users className="w-10 h-10 t-text-accent" />
          </div>
          
          <div>
            <h3 className="text-lg font-bold t-text mb-2">{t("tournaments.host_op") || "Host an Operation"}</h3>
            <p className="text-sm t-text-secondary px-4 leading-relaxed">
              {t("tournaments.host_desc") || "Create a secure lobby and invite up to 3 other operatives. You will compete on the same cases simultaneously."}
            </p>
          </div>

          <div className="p-4 t-bg border t-border rounded-xl text-left space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="t-text-muted">{t("tournaments.game_mode") || "Game Mode"}</span>
              <span className="t-text font-medium">{t("tournaments.standard_ops") || "Standard Ops"}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="t-text-muted">{t("tournaments.difficulty") || "Difficulty"}</span>
              <span className="t-text font-medium">{t("tournaments.adaptive") || "Adaptive"}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="t-text-muted">{t("tournaments.max_squad") || "Max Squad Size"}</span>
              <span className="t-text font-medium">4 {t("tournaments.operatives_count") || "Operatives"}</span>
            </div>
          </div>

          <button 
            onClick={handleCreateLobby}
            className="w-full py-4 t-accent-bg rounded-xl font-bold uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95 shadow-lg shadow-green-500/20"
          >
            <Plus className="w-5 h-5" />
            {t("tournaments.create_lobby") || "Create Lobby"}
          </button>
        </div>
      )}

      {/* Active Global Tournaments (Mock) */}
      <div className="relative">
        <div className="flex items-center justify-between mb-3 pl-1">
          <h3 className="text-xs font-mono t-text-muted uppercase tracking-wider">{t("tournaments.global_ops") || "Global Operations"}</h3>
          <button onClick={() => setFocusedSection(focusedSection === "global" ? null : "global")} className="p-1 rounded-full hover:bg-white/10 transition-colors">
            <Info className="w-4 h-4 t-text-secondary" />
          </button>
        </div>

        {focusedSection === "global" && (
          <div className="absolute bottom-full left-0 w-full bg-black/90 border border-green-500/50 rounded-xl p-4 shadow-2xl mb-2 z-20 animate-fade-in-up">
            <h4 className="text-green-400 font-bold mb-1">{t("tournaments.info_global_title") || "Global Tournaments"}</h4>
            <p className="text-xs text-gray-300">{t("tournaments.info_global_desc") || "Compete in massive scheduled events against hundreds of players for exclusive badges and high XP payouts."}</p>
          </div>
        )}
        <div className="p-6 border border-dashed t-border rounded-2xl flex flex-col items-center justify-center text-center">
          <Trophy className="w-8 h-8 t-text-secondary opacity-50 mb-2" />
          <p className="text-sm t-text-secondary">{t("tournaments.no_global") || "No global tournaments active currently."}</p>
          <p className="text-xs t-text-muted mt-1">{t("tournaments.check_back") || "Check back later or start your own squad."}</p>
        </div>
      </div>
      
    </div>
  );
}
