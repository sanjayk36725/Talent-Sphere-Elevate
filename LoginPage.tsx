import React, { useState } from 'react';
import { Mail, Lock, ShieldCheck, ArrowRight, Loader2, KeyRound, Sparkles, Cpu, Orbit, Zap, Bot, GraduationCap, Compass } from 'lucide-react';
import { User } from '../types';
import { safeFetchJson } from '../lib/api';

interface LoginPageProps {
  onLoginSuccess: (user: User, token: string) => void;
  onNavigate: (page: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onNavigate }) => {
  const [email, setEmail] = useState('sanjayk36725@gmail.com');
  const [password, setPassword] = useState('password123');
  const [otp, setOtp] = useState('');
  const [requires2FA, setRequires2FA] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (requires2FA) {
        const { ok, data } = await safeFetchJson('/api/auth/verify-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, otp }),
        });
        if (!ok) throw new Error(data.error || '2FA Verification failed');

        localStorage.setItem('ts_token', data.token);
        onLoginSuccess(data.user, data.token);
      } else {
        const { ok, data } = await safeFetchJson('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        if (!ok) throw new Error(data.error || 'Login failed');

        if (data.requires2FA) {
          setRequires2FA(true);
        } else {
          localStorage.setItem('ts_token', data.token);
          onLoginSuccess(data.user, data.token);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setRequires2FA(false);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] relative flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 overflow-hidden text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Ambient Glow Backdrop */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Glowing Orbs */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-600/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-32 w-96 h-96 bg-purple-500/10 dark:bg-purple-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-amber-500/10 dark:bg-amber-500/15 rounded-full blur-3xl" />

        {/* Floating Nodes */}
        <div className="absolute top-16 left-12 hidden lg:flex items-center gap-2 bg-white/90 dark:bg-slate-900/80 border border-indigo-200 dark:border-indigo-500/30 backdrop-blur-md px-3.5 py-2 rounded-full shadow-lg text-xs font-mono font-bold text-indigo-900 dark:text-indigo-300">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Intelligent Neural RAG</span>
        </div>

        <div className="absolute bottom-20 left-16 hidden lg:flex items-center gap-2 bg-white/90 dark:bg-slate-900/80 border border-purple-200 dark:border-purple-500/30 backdrop-blur-md px-3.5 py-2 rounded-full shadow-lg text-xs font-mono font-bold text-purple-900 dark:text-purple-300">
          <Cpu className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <span>768-Dim Vector Knowledge Base</span>
        </div>

        <div className="absolute top-24 right-16 hidden lg:flex items-center gap-2 bg-white/90 dark:bg-slate-900/80 border border-amber-200 dark:border-amber-500/30 backdrop-blur-md px-3.5 py-2 rounded-full shadow-lg text-xs font-mono font-bold text-amber-900 dark:text-amber-300">
          <Orbit className="w-4 h-4 text-amber-500 dark:text-amber-400" />
          <span>20-Day Ascent Curriculum Matrix</span>
        </div>

        <div className="absolute bottom-16 right-20 hidden lg:flex items-center gap-2 bg-white/90 dark:bg-slate-900/80 border border-emerald-200 dark:border-emerald-500/30 backdrop-blur-md px-3.5 py-2 rounded-full shadow-lg text-xs font-mono font-bold text-emerald-900 dark:text-emerald-300">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Military-Grade ESMTP 2FA Vault</span>
        </div>
      </div>

      {/* Main Login Card */}
      <div className="relative z-10 w-full max-w-md bg-white dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 backdrop-blur-xl p-8 rounded-2xl shadow-xl dark:shadow-2xl dark:shadow-indigo-950/50 transition-all">
        {/* Floating icon logo */}
        <div className="text-center mb-6 relative">
          <div className="relative inline-block mb-3">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-amber-500 p-0.5 shadow-lg shadow-indigo-500/30">
              <div className="w-full h-full bg-indigo-50 dark:bg-slate-950 rounded-2xl flex items-center justify-center">
                <Bot className="w-8 h-8 text-indigo-700 dark:text-amber-400 animate-pulse" />
              </div>
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-600 rounded-full border-2 border-white dark:border-slate-900" />
          </div>

          <h2 className="text-2xl font-black tracking-tight text-slate-950 dark:text-white">
            {requires2FA ? 'Two-Factor Authentication' : 'Sign In to TalentSphere'}
          </h2>
          <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mt-1">
            {requires2FA
              ? 'Enter the 6-digit cryptographic verification code sent via ESMTP'
              : 'Grounded intelligence, skill assessments & vector RAG knowledge'}
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-500/40 text-rose-800 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          {!requires2FA ? (
            <>
              <div>
                <label className="block text-xs font-black text-slate-900 dark:text-slate-100 mb-1.5 flex items-center justify-between">
                  <span>Email Address</span>
                  <span className="text-[10px] text-slate-600 dark:text-slate-400 font-mono font-bold">SECURE LOGIN</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-600 dark:text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-950/80 text-slate-950 dark:text-slate-100 placeholder:text-slate-500 text-xs pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 transition-all font-mono font-semibold"
                    placeholder="you@domain.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-900 dark:text-slate-100 mb-1.5 flex items-center justify-between">
                  <span>Password</span>
                  <span className="text-[10px] text-slate-600 dark:text-slate-400 font-mono font-bold">AES-256 VAULT</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-600 dark:text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-950/80 text-slate-950 dark:text-slate-100 placeholder:text-slate-500 text-xs pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 transition-all font-semibold"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </>
          ) : (
            <div>
              <label className="block text-xs font-black text-amber-900 dark:text-amber-300 mb-1.5">6-Digit ESMTP OTP Code</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-amber-600 dark:text-amber-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  className="w-full bg-white dark:bg-slate-950 text-slate-950 dark:text-amber-400 font-mono font-black text-center tracking-[0.5em] text-lg py-2.5 rounded-xl border border-amber-400 dark:border-amber-500/50 focus:outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-500/30"
                  placeholder="123456"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-gradient-to-r dark:from-indigo-600 dark:via-indigo-500 dark:to-purple-600 text-white font-black py-3 rounded-xl transition-all shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 text-xs mt-2 cursor-pointer"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : requires2FA ? (
              <>
                <ShieldCheck className="w-4 h-4 text-amber-300" />
                <span>Verify ESMTP 2FA & Enter</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Accelerator Hub */}
        <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800 text-center">
          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 font-black mb-3 font-mono tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" /> QUICK ONE-CLICK DEMO ACCESS
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleDemoLogin('sanjayk36725@gmail.com', 'password123')}
              className="bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/60 text-indigo-950 dark:text-indigo-200 text-xs font-black p-3 rounded-xl border border-indigo-200 dark:border-indigo-800/40 flex flex-col items-center gap-1.5 cursor-pointer transition-all hover:scale-105"
            >
              <GraduationCap className="w-5 h-5 text-indigo-700 dark:text-indigo-400" />
              <span>Student</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('teacher@talentsphere.edu', 'teacher123')}
              className="bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/50 dark:hover:bg-amber-900/60 text-amber-950 dark:text-amber-200 text-xs font-black p-3 rounded-xl border border-amber-200 dark:border-amber-800/40 flex flex-col items-center gap-1.5 cursor-pointer transition-all hover:scale-105"
            >
              <Compass className="w-5 h-5 text-amber-700 dark:text-amber-400" />
              <span>Teacher</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('admin@talentsphere.edu', 'admin123')}
              className="bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/60 text-emerald-950 dark:text-emerald-200 text-xs font-black p-3 rounded-xl border border-emerald-200 dark:border-emerald-800/40 flex flex-col items-center gap-1.5 cursor-pointer transition-all hover:scale-105"
            >
              <ShieldCheck className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
              <span>Admin</span>
            </button>
          </div>
        </div>

        <p className="text-center text-xs font-semibold text-slate-700 dark:text-slate-300 mt-5">
          Don't have an account?{' '}
          <button onClick={() => onNavigate('register')} className="text-indigo-700 dark:text-indigo-400 font-extrabold hover:underline cursor-pointer">
            Register here
          </button>
        </p>
      </div>
    </div>
  );
};
