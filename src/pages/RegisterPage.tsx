import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Shield, ChevronLeft, UserPlus, AlertCircle } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useI18n } from "../i18n";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { t } = useI18n();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!username.trim()) e.username = t("auth.username_required");
    else if (username.length < 2 || username.length > 32) e.username = t("auth.username_min");
    if (!email.trim()) e.email = t("auth.email_required");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = t("auth.email_invalid");
    if (!password.trim()) e.password = t("auth.password_required");
    else if (password.length < 8 || !/\d/.test(password)) e.password = t("auth.password_min");
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError("");
    if (!validate()) return;
    setLoading(true);
    try {
      await register(email, password, username);
      navigate("/home", { replace: true });
    } catch (err) {
      setApiError((err as Error).message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-md mx-auto py-6 animate-fade-in">
      <button
        onClick={() => navigate("/")}
        className="flex items-center gap-2 text-xs font-mono t-text-muted hover:t-text-accent transition-all group"
      >
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        {t("back_to_dashboard")}
      </button>

      {/* Header */}
      <div className="relative overflow-hidden p-6 rounded-2xl t-bg-elevated border t-border">
        <div className="relative z-10 flex justify-between items-center">
          <div className="space-y-1">
            <span className="text-[9px] font-mono border t-border-accent t-text-accent px-2 py-0.5 rounded uppercase font-bold t-accent-muted">
              SECURE ENROLLMENT PORTAL
            </span>
            <h2 className="text-2xl font-light tracking-tight t-text mt-1">
              {t("auth.register_title")}
            </h2>
            <p className="text-xs t-text-secondary font-sans">
              {t("auth.register_subtitle")}
            </p>
          </div>
          <Shield className="w-12 h-12 t-text-accent stroke-1 opacity-80" />
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="rounded-2xl p-6 glass-card space-y-5">
        {apiError && (
          <div className="flex items-center gap-2 p-3 rounded-xl t-danger-bg border t-border text-red-400 text-xs font-mono">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {apiError}
          </div>
        )}

        {/* Username */}
        <div className="space-y-1.5">
          <label className="text-xs font-mono t-text-muted block uppercase tracking-wider">
            {t("username")}
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            maxLength={32}
            className="w-full t-bg border t-border text-sm focus:t-border-accent outline-none rounded-xl px-4 py-3 t-text font-mono"
            placeholder="CyberAgent_01"
          />
          {errors.username && (
            <span className="text-[10px] text-red-400 font-mono">{errors.username}</span>
          )}
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label className="text-xs font-mono t-text-muted block uppercase tracking-wider">
            {t("email")}
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full t-bg border t-border text-sm focus:t-border-accent outline-none rounded-xl px-4 py-3 t-text font-mono"
            placeholder="agent@secure.mail"
          />
          {errors.email && (
            <span className="text-[10px] text-red-400 font-mono">{errors.email}</span>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label className="text-xs font-mono t-text-muted block uppercase tracking-wider">
            {t("password")}
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full t-bg border t-border text-sm focus:t-border-accent outline-none rounded-xl px-4 py-3 t-text font-mono"
            placeholder="••••••••"
          />
          {errors.password && (
            <span className="text-[10px] text-red-400 font-mono">{errors.password}</span>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full t-accent-bg rounded-full py-4 text-sm font-semibold tracking-wider uppercase transition-all shadow-md active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <span className="animate-pulse">{t("auth.processing")}</span>
          ) : (
            <>
              <UserPlus className="w-4 h-4" />
              {t("auth.submit_register")}
            </>
          )}
        </button>

        <p className="text-center text-xs t-text-muted font-mono">
          {t("have_account")}{" "}
          <Link to="/auth/login" className="t-text-accent hover:underline">
            {t("login")}
          </Link>
        </p>
      </form>
    </div>
  );
}
