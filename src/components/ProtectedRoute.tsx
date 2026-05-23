import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Shield } from "lucide-react";

export default function ProtectedRoute() {
  const { user, isGuest, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 animate-fade-in">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border border-green-400/30 flex items-center justify-center animate-pulse">
            <Shield className="w-8 h-8 text-green-400 animate-pulse" />
          </div>
          <div className="absolute inset-0 rounded-full border border-green-400/10 animate-ping" style={{ animationDuration: "2s" }} />
        </div>
        <span className="text-xs font-mono text-zinc-500 tracking-widest uppercase">
          Authenticating Agent…
        </span>
      </div>
    );
  }

  if (!user && !isGuest) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
