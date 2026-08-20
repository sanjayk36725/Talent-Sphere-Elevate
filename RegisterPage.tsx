import React, { useState } from 'react';
import { Mail, Lock, User as UserIcon, Shield, ArrowRight, Loader2, CheckCircle2, Bot, Sparkles, GraduationCap, Compass } from 'lucide-react';
import { PasswordStrengthMeter, analyzePassword } from '../components/PasswordStrengthMeter';
import { safeFetchJson } from '../lib/api';

interface RegisterPageProps {
  onNavigate: (page: string) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigate }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'STUDENT' | 'TEACHER'>('STUDENT');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const pwdAnalysis = analyzePassword(password);
    if (pwdAnalysis.score < 2) {
      setError('Please choose a stronger password containing letters, numbers, and symbols.');
      return;
    }

    setLoading(true);

    try {
      const { ok, data } = await safeFetchJson('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });

      if (!ok) {
        throw new Error(data.error || 'Registration failed. Please try again.');
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to register.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl w-full max-w-md text-center space-y-4">
          <CheckCircle2 className="w-16 h-16 text-emerald-600 dark:text-emerald-400 mx-auto animate-bounce" />
          <h2 className="text-2xl font-black text-slate-950 dark:text-white">Account Created Successfully!</h2>
          <p className="text-xs font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
            Welcome to TalentSphere Elevate. Your credentials for <span className="font-bold text-slate-950 dark:text-white font-mono">{email}</span> are active. You can now log in to begin your 20-Day Ascent!
          </p>
          <button
            onClick={() => onNavigate('login')}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3 rounded-xl transition-all shadow-md text-xs cursor-pointer"
          >
            Proceed to Login &rarr;
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl w-full max-w-md">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-amber-500 flex items-center justify-center text-white font-black text-xl mx-auto mb-3 shadow-lg shadow-indigo-500/20">
            TS
          </div>
          <h2 className="text-2xl font-black text-slate-950 dark:text-white">Start Your 20-Day Ascent</h2>
          <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mt-1">
            Create your account to access daily proctored exams & AI interview guidance
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-black text-slate-900 dark:text-slate-100 mb-1">Full Name</label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-slate-600 dark:text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-slate-50 dark:bg-slate-950 text-slate-950 dark:text-slate-100 placeholder:text-slate-500 text-xs pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 font-semibold focus:outline-none focus:border-indigo-600"
                placeholder="Sanjay Kumar"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-900 dark:text-slate-100 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-600 dark:text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-slate-50 dark:bg-slate-950 text-slate-950 dark:text-slate-100 placeholder:text-slate-500 text-xs pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 font-semibold font-mono focus:outline-none focus:border-indigo-600"
                placeholder="sanjay@domain.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-900 dark:text-slate-100 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-600 dark:text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-slate-50 dark:bg-slate-950 text-slate-950 dark:text-slate-100 placeholder:text-slate-500 text-xs pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 font-semibold focus:outline-none focus:border-indigo-600"
                placeholder="e.g. StrongP@ssword123"
              />
            </div>
            <PasswordStrengthMeter password={password} />
          </div>

          <div>
            <label className="block text-xs font-black text-slate-900 dark:text-slate-100 mb-1">Account Role</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole('STUDENT')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-black flex items-center justify-center gap-2 cursor-pointer transition-all ${
                  role === 'STUDENT'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-200 border-slate-300 dark:border-slate-700'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                Student Candidate
              </button>

              <button
                type="button"
                onClick={() => setRole('TEACHER')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-black flex items-center justify-center gap-2 cursor-pointer transition-all ${
                  role === 'TEACHER'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-200 border-slate-300 dark:border-slate-700'
                }`}
              >
                <Compass className="w-4 h-4" />
                Faculty Instructor
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-xs cursor-pointer mt-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Create Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs font-semibold text-slate-700 dark:text-slate-300 mt-5">
          Already have an account?{' '}
          <button onClick={() => onNavigate('login')} className="text-indigo-700 dark:text-indigo-400 font-extrabold hover:underline cursor-pointer">
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
};
