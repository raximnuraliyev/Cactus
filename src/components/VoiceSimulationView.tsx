import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVoiceSimulation } from '../hooks/useVoiceSimulation';
import { Phone, PhoneOff, ShieldAlert, KeyRound, Shield, Trophy, XCircle, RefreshCw } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export default function VoiceSimulationView() {
  const navigate = useNavigate();
  const {
    phase,
    score,
    secondsElapsed,
    subtitles,
    isBreached,
    audioLevel,
    startSession,
    useTool,
    submitVerdict,
    t
  } = useVoiceSimulation();

  const { isDark } = useTheme();

  // Helper to format MM:SS
  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Regular Expression Regex Parser for Scam Keywords
  const renderSubtitleText = (text: string) => {
    // Regex matching SMS kod, password, etc.
    const regex = /(SMS[\s-]?kod|SMS[\s-]?code|karta raqami|номер карты|card number|pul o'tkazish|перевод|6[\s-]?xonali|6[\s-]?digit|password|pin)/gi;
    const parts = text.split(regex);
    
    return parts.map((part, i) => {
      if (regex.test(part)) {
        return (
          <strong 
            key={i} 
            className="text-red-500 font-bold underline decoration-red-500 decoration-2 underline-offset-4 animate-pulse px-1"
          >
            {part}
          </strong>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  // Animated Waveform lines (15 vertical equalizer bars)
  const renderWaveform = () => {
    // We base the heights on the audioLevel + some math random for variety
    const bars = Array.from({ length: 15 });
    return (
      <div className="flex items-center justify-center gap-1 h-12 w-full mt-4">
        {bars.map((_, i) => {
          const baseHeight = audioLevel > 0 ? Math.max(4, (audioLevel / 2) * Math.random()) : 4;
          return (
            <div
              key={i}
              className="w-1.5 rounded-full bg-emerald-400 transition-all duration-75"
              style={{ height: `${baseHeight}px` }}
            />
          );
        })}
      </div>
    );
  };

  // PHASE 1: RINGING OVERLAY
  if (phase === 1) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full max-w-2xl mx-auto p-6 animate-fade-in">
        <div className="glass-card w-full p-8 flex flex-col items-center shadow-2xl relative overflow-hidden rounded-3xl border-2 border-emerald-500/20">
          <div className="absolute inset-0 bg-emerald-500/5 animate-pulse" />
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-24 h-24 rounded-full bg-emerald-500/20 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(16,185,129,0.3)] animate-pulse">
              <Phone className="w-10 h-10 text-emerald-400" />
            </div>
            
            <h2 className="text-2xl font-bold t-text tracking-wide mb-2">Davron aka (Boss)</h2>
            <p className="text-emerald-400 font-mono text-sm tracking-widest uppercase mb-10">
              {t.incoming}
            </p>

            <div className="flex gap-6 w-full max-w-sm">
              <button
                onClick={() => navigate('/home')}
                className="flex-1 flex flex-col items-center gap-2 t-text hover:text-red-400 transition-colors"
              >
                <div className="w-14 h-14 rounded-full bg-red-500/20 border border-red-500/50 flex items-center justify-center hover:bg-red-500/30">
                  <PhoneOff className="w-6 h-6 text-red-500" />
                </div>
                <span className="text-xs font-semibold uppercase">{t.decline}</span>
              </button>

              <button
                onClick={startSession}
                className="flex-1 flex flex-col items-center gap-2 t-text hover:text-emerald-400 transition-colors"
              >
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center hover:bg-emerald-500/30 animate-bounce">
                  <Phone className="w-6 h-6 text-emerald-500 fill-emerald-500" />
                </div>
                <span className="text-xs font-semibold uppercase">{t.accept}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // PHASE 3: METRICS DEBRIEF
  if (phase === 3) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full max-w-2xl mx-auto p-4 animate-fade-in">
        <div className="glass-card w-full p-8 flex flex-col items-center shadow-2xl rounded-3xl border t-border relative overflow-hidden">
          
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-xl ${isBreached ? 'bg-red-500/20' : 'bg-emerald-500/20'}`}>
            {isBreached ? (
              <XCircle className="w-10 h-10 text-red-500" />
            ) : (
              <Trophy className="w-10 h-10 text-emerald-400" />
            )}
          </div>
          
          <h2 className="text-2xl font-bold t-text tracking-wide mb-2 text-center">
            {isBreached ? t.breach : t.success}
          </h2>
          
          <div className="flex flex-col items-center bg-black/20 p-6 rounded-2xl w-full max-w-sm my-6 border t-border">
            <span className="text-xs t-text-secondary uppercase tracking-widest mb-2 font-mono">Final Metrics</span>
            <div className="text-4xl font-black font-mono tracking-tighter" style={{ color: isBreached ? '#ef4444' : '#10b981' }}>
              {score} PTS
            </div>
            <div className="text-sm t-text-muted mt-2">
              Time elapsed: {formatTime(secondsElapsed)}
            </div>
          </div>

          <div className="flex gap-4 w-full max-w-sm">
            <button
              onClick={() => navigate('/home')}
              className="flex-1 py-3 t-bg-secondary t-text font-semibold rounded-xl border t-border hover:border-emerald-500/50 transition-all"
            >
              Dashboard
            </button>
            <button
              onClick={() => { setPhase(1); }}
              className="flex-1 py-3 bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 font-semibold rounded-xl hover:bg-emerald-500/30 flex items-center justify-center gap-2 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              {t.retry}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // PHASE 2: ACTIVE VOICE CALL SESSION
  return (
    <div className="flex flex-col h-full w-full max-w-3xl mx-auto font-sans relative overflow-hidden">
      
      {/* 2.1 Top Global Navigation Header */}
      <header className="flex justify-between items-center px-4 py-3 border-b t-border t-bg-secondary shrink-0 z-20 shadow-sm">
        <h1 className="text-xs sm:text-sm font-bold tracking-widest t-text uppercase">
          {t.title}
        </h1>
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 border border-emerald-500/30 bg-emerald-500/10 rounded-lg shadow-inner">
            <span className="text-xs font-mono font-bold text-emerald-400 tracking-wider">
              ⭐ {score} PTS
            </span>
          </div>
        </div>
      </header>

      {/* Main Layout Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-32">
        
        {/* 2.2 Active Audio Stream Dashboard Container */}
        <div className="flex justify-center mb-2 animate-fade-in">
          <div className="glass-card border t-border rounded-2xl p-6 w-full max-w-sm flex flex-col items-center shadow-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent animate-shimmer" />
            
            <div className="w-16 h-16 rounded-full t-bg-secondary border-2 border-emerald-500 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.2)] mb-3 relative">
               <Phone className="w-6 h-6 text-emerald-400" />
               <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#13191E]" />
            </div>
            
            <h3 className="text-lg font-bold t-text mb-1">Davron aka (Boss)</h3>
            <div className="text-emerald-400 font-mono text-xl font-medium tracking-widest drop-shadow-md">
              {formatTime(secondsElapsed)}
            </div>
            
            {/* Real-time Waveform Monitor */}
            {renderWaveform()}
          </div>
        </div>

        {/* 2.3 Live Speech-To-Text Subtitle Engine */}
        <div className="w-full max-w-2xl mx-auto space-y-3">
          <h4 className="text-[10px] font-mono uppercase t-text-muted tracking-widest px-2">Live Transcript</h4>
          <div className="space-y-3">
            {subtitles.map((sub) => (
              <div key={sub.id} className={`flex ${sub.speaker === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                <div 
                  className={`px-4 py-3 rounded-2xl max-w-[85%] text-[15px] leading-relaxed shadow-sm ${
                    sub.speaker === 'user' 
                      ? 't-bg-secondary border t-border t-text rounded-br-sm' 
                      : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-50 rounded-bl-sm'
                  }`}
                >
                  <span className="text-[9px] uppercase font-bold opacity-50 block mb-1 tracking-wider">
                    {sub.speaker === 'user' ? 'You' : 'Davron aka'}
                  </span>
                  {renderSubtitleText(sub.text)}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 2.4 Cyber-Investigation & Toolkit Deck (Fixed Bottom) */}
      <div className="absolute bottom-0 left-0 w-full t-bg-elevated border-t t-border z-30 p-3 pb-safe shadow-[0_-10px_30px_rgba(0,0,0,0.2)]">
        <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-3">
          
          <div className="md:col-span-2 flex flex-col gap-2">
            <h4 className="text-[10px] font-mono uppercase t-text-muted tracking-widest px-1">
              {t.toolsLabel}
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => useTool('PASSWORD_CHALLENGE')}
                className="flex items-center justify-center gap-2 p-3 rounded-xl border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 transition-all active:scale-95 shadow-sm"
              >
                <KeyRound className="w-4 h-4 shrink-0" />
                <span className="text-[11px] font-bold uppercase tracking-wider truncate">
                  {t.askPassBtn}
                </span>
              </button>
              <button
                onClick={() => useTool('LINE_INTERCEPT')}
                className="flex items-center justify-center gap-2 p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 transition-all active:scale-95 shadow-sm"
              >
                <Shield className="w-4 h-4 shrink-0" />
                <span className="text-[11px] font-bold uppercase tracking-wider truncate">
                  {t.callBackBtn}
                </span>
              </button>
            </div>
          </div>

          <div className="flex flex-col justify-end mt-2 md:mt-0">
             <button
                onClick={submitVerdict}
                className="w-full py-4 bg-red-500/20 text-red-500 border-2 border-red-500/50 hover:bg-red-500/30 font-black tracking-widest text-xs uppercase rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
              >
                <ShieldAlert className="w-5 h-5 shrink-0 animate-pulse" />
                {t.verdictBtn}
              </button>
          </div>

        </div>
      </div>

    </div>
  );
}
