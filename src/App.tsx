import React, { useState, Suspense, lazy } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import { useI18n } from "./i18n";
import { useTheme } from "./contexts/ThemeContext";
import ProtectedRoute from "./components/ProtectedRoute";

// Lazy-load Spline for performance
const SplineScene = lazy(() =>
  import("./components/ui/splite").then((m) => ({ default: m.SplineScene }))
);

// Pages
import LandingPage from "./pages/LandingPage";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";

// Views
import DashboardView from "./components/DashboardView";
import BriefingView from "./components/BriefingView";
import GameView from "./components/GameView";
import EvidenceView from "./components/EvidenceView";
import DebriefView from "./components/DebriefView";
import LeaderboardView from "./components/LeaderboardView";
import BadgeView from "./components/BadgeView";
import TournamentsView from "./components/TournamentsView";
import TournamentArenaView from "./components/TournamentArenaView";
import VoiceSimulationView from "./components/VoiceSimulationView";

import {
  Shield,
  Trophy,
  Award,
  Terminal,
  User,
  Swords,
  Sun,
  Moon,
} from "lucide-react";

export default function App() {
  const { user } = useAuth();
  const { t, lang, setLang } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme, isDark } = useTheme();

  // Determine if bottom nav and header should show
  const isPublicRoute =
    location.pathname === "/" ||
    location.pathname.startsWith("/auth");
    
  const isArenaView = location.pathname.startsWith("/tournaments/arena");
  const isGameActive = location.pathname.startsWith("/game/") && location.pathname !== "/game/evidence" && location.pathname !== "/game/debrief" && location.pathname !== "/game/start";
  const showNav = !isPublicRoute && user && !isArenaView && !isGameActive;

  // Active nav state helper
  const isNavActive = (paths: string[]) =>
    paths.some((p) =>
      p === "/home"
        ? location.pathname === "/home" || location.pathname.startsWith("/game")
        : location.pathname.startsWith(p)
    );

  const handleGlobalPointerMove = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).tagName.toLowerCase() === 'canvas') return;
    
    const canvas = document.querySelector('#spline-backdrop-container canvas');
    if (canvas) {
      canvas.dispatchEvent(new PointerEvent('pointermove', {
        clientX: e.clientX,
        clientY: e.clientY,
        bubbles: false
      }));
    }
  };

  return (
    <div 
      className="min-h-screen t-bg t-text relative flex flex-col items-center justify-start overflow-x-hidden font-sans"
      onPointerMove={handleGlobalPointerMove}
    >
      {/* Absolute Full Screen Background 3D Spline Scene */}
      <div
        className="fixed inset-0 w-full h-full z-0 pointer-events-auto select-none t-bg transition-colors duration-500"
        id="spline-backdrop-container"
      >
        <Suspense fallback={<div className="w-full h-full t-bg-secondary" />}>
          <SplineScene
            scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
            className="w-full h-full transition-opacity duration-500"
            style={{ 
              opacity: isDark ? 0.15 : 0.4, 
              filter: isDark ? 'none' : 'invert(1)',
              mixBlendMode: isDark ? 'screen' : 'multiply'
            }}
          />
        </Suspense>
      </div>

      {/* Absolute background visual grid */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(0,255,0,0.015)_1px,transparent_1px)] bg-[size:24px_24px] z-0" />
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-400/20 to-transparent shadow-[0_0_10px_rgba(0,255,0,0.3)] z-10 animate-pulse" />

      {/* Cybernetic Bezel Container Frame */}
      <div className="relative w-full max-w-full h-[100dvh] z-10 flex flex-col px-2 py-3 sm:px-4 sm:py-4 md:px-6 md:py-6 transition-all duration-300 pointer-events-none">
        {/* Dynamic Header Navbar */}
        {showNav && (
          <header className="flex justify-between items-center t-nav-bg backdrop-blur-md rounded-2xl p-4 border t-border space-x-2 shrink-0 relative z-30 mb-4 shadow-[0_0_15px_rgba(52,211,153,0.02)] pointer-events-auto">
            {/* Branded Logo */}
            <div
              onClick={() => navigate("/home")}
              className="flex items-center space-x-2 cursor-pointer group"
            >
              <Shield className="w-5 h-5 t-text-accent group-hover:rotate-12 transition-transform shadow-[0_0_10px_rgba(52,211,153,0.2)]" />
              <h1 className="text-sm font-light tracking-widest t-text uppercase group-hover:text-emerald-400 transition-colors font-mono font-bold">
                CACTUS
              </h1>
            </div>

            {/* Controls: Theme Toggle & Lang Switcher */}
            <div className="flex items-center space-x-3">
              <button
                onClick={toggleTheme}
                className="p-1.5 rounded-full border t-border hover:border-emerald-400/30 t-text-secondary hover:text-emerald-400 transition-all font-mono text-[9px]"
                title={t("theme.toggle")}
              >
                {isDark ? (
                  <Moon className="w-3.5 h-3.5 t-text-accent" />
                ) : (
                  <Sun className="w-3.5 h-3.5 t-text-accent" />
                )}
              </button>

              <div className="flex t-bg-secondary border t-border rounded-full p-0.5 text-xs font-mono select-none">
                {(["en", "ru", "uz"] as const).map((lCode) => (
                  <button
                    key={lCode}
                    onClick={() => setLang(lCode)}
                    className={`px-2 py-1 rounded-full uppercase transition-all font-bold ${
                      lang === lCode
                        ? "t-accent-bg font-semibold"
                        : "t-text-secondary hover:text-emerald-400"
                    }`}
                  >
                    {lCode}
                  </button>
                ))}
              </div>
            </div>
          </header>
        )}

        {/* Floating animated radar sweep bar */}
        {showNav && (
          <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-green-500/10 to-transparent relative overflow-hidden shrink-0 pointer-events-none mb-3">
            <div
              className="absolute top-0 left-0 h-full w-24 bg-green-400/20 blur shadow-[0_0_8px_rgba(0,255,0,0.5)] animate-shimmer"
              style={{ animationDuration: "3s" }}
            />
          </div>
        )}

        {/* Principal Content Body Area */}
        <main className={`flex-1 overflow-y-auto pr-0.5 pointer-events-auto ${showNav ? 'pb-32 sm:pb-36' : 'pb-0'}`}>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth/register" element={<RegisterPage />} />
            <Route path="/auth/login" element={<LoginPage />} />

            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/home" element={<DashboardView />} />
              <Route path="/game/start" element={<BriefingView />} />
              <Route path="/game/:sessionId" element={<GameView />} />
              <Route path="/game/evidence" element={<EvidenceView />} />
              <Route path="/game/debrief" element={<DebriefView />} />
              <Route path="/leaderboard" element={<LeaderboardView />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/achievements" element={<BadgeView />} />
              <Route path="/tournaments" element={<TournamentsView />} />
              <Route path="/tournaments/arena" element={<TournamentArenaView />} />
              <Route path="/voice-simulation" element={<VoiceSimulationView />} />
            </Route>
          </Routes>
        </main>

        {/* Floating Quick Action Nav Bottom Menu Bar */}
        {showNav && (
          <nav className="fixed bottom-4 left-1/2 transform -translate-x-1/2 w-full max-w-[400px] t-nav-bg backdrop-blur-lg border t-border px-3 py-2.5 rounded-full flex justify-between items-center z-40 shadow-[0_4px_30px_rgba(0,0,0,0.15)] pointer-events-auto">
            <button
              onClick={() => navigate("/home")}
              className={`flex flex-col items-center justify-center p-1 cursor-pointer transition-all flex-1 ${
                isNavActive(["/home"])
                  ? "t-text-accent scale-105"
                  : "t-text-secondary hover:text-emerald-400"
              }`}
            >
              <Terminal className="w-5 h-5" />
              <span className="text-[9px] font-mono mt-0.5 tracking-wider uppercase font-semibold">
                {t("main_menu.dashboard")}
              </span>
            </button>

            <button
              onClick={() => navigate("/tournaments")}
              className={`flex flex-col items-center justify-center p-1 cursor-pointer transition-all flex-1 ${
                isNavActive(["/tournaments"])
                  ? "t-text-accent scale-105"
                  : "t-text-secondary hover:text-emerald-400"
              }`}
            >
              <Swords className="w-5 h-5" />
              <span className="text-[9px] font-mono mt-0.5 tracking-wider uppercase font-semibold">
                {t("main_menu.tournaments")}
              </span>
            </button>

            <button
              onClick={() => navigate("/leaderboard")}
              className={`flex flex-col items-center justify-center p-1 cursor-pointer transition-all flex-1 ${
                isNavActive(["/leaderboard"])
                  ? "t-text-accent scale-105"
                  : "t-text-secondary hover:text-emerald-400"
              }`}
            >
              <Trophy className="w-5 h-5" />
              <span className="text-[9px] font-mono mt-0.5 tracking-wider uppercase font-semibold">
                {t("main_menu.leaderboard")}
              </span>
            </button>

            <button
              onClick={() => navigate("/achievements")}
              className={`flex flex-col items-center justify-center p-1 cursor-pointer transition-all flex-1 ${
                isNavActive(["/achievements"])
                  ? "t-text-accent scale-105"
                  : "t-text-secondary hover:text-emerald-400"
              }`}
            >
              <Award className="w-5 h-5" />
              <span className="text-[9px] font-mono mt-0.5 tracking-wider uppercase font-semibold">
                {t("main_menu.achievements")}
              </span>
            </button>

            <button
              onClick={() => navigate("/profile")}
              className={`flex flex-col items-center justify-center p-1 cursor-pointer transition-all flex-1 ${
                isNavActive(["/profile"])
                  && !location.pathname.includes("/achievements")
                  ? "t-text-accent scale-105"
                  : "t-text-secondary hover:text-emerald-400"
              }`}
            >
              <User className="w-5 h-5" />
              <span className="text-[9px] font-mono mt-0.5 tracking-wider uppercase font-semibold">
                {t("main_menu.profile")}
              </span>
            </button>
          </nav>
        )}
      </div>
    </div>
  );
}
