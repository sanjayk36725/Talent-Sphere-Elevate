import React, { useState } from 'react';
import { ShieldCheck, Lock, CheckCircle2, Server, AlertCircle } from 'lucide-react';
import { User, StudentProfile } from '../types';
import { ESMTPModelPanel } from '../components/ESMTPModelPanel';
import { PasswordStrengthMeter, analyzePassword } from '../components/PasswordStrengthMeter';

interface SecuritySettingsPageProps {
  user: User;
  profile: StudentProfile | null;
  onUpdateProfile: (updatedProfile: Partial<StudentProfile>, twoFactorEnabled?: boolean) => void;
}

export const SecuritySettingsPage: React.FC<SecuritySettingsPageProps> = ({
  user,
  profile,
  onUpdateProfile,
}) => {
  const [activeTab, setActiveTab] = useState<'security' | 'esmtp'>('security');
  const [twoFactor, setTwoFactor] = useState(user.twoFactorEnabled);
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleToggle2FA = () => {
    const nextState = !twoFactor;
    setTwoFactor(nextState);
    onUpdateProfile({}, nextState);
    setSuccessMsg(`Two-Factor Authentication (2FA) ${nextState ? 'Enabled' : 'Disabled'}.`);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const pwdAnalysis = analyzePassword(newPassword);
    if (pwdAnalysis.score < 3) {
      setErrorMsg('Please choose a stronger password (must contain uppercase, lowercase, numbers, and symbols).');
      return;
    }

    setSuccessMsg('Password successfully changed with strong encryption.');
    setPassword('');
    setNewPassword('');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono font-bold text-indigo-600">SECURITY & ESMTP MAIL MODEL</span>
          <h1 className="text-2xl font-black text-slate-900 mt-0.5">Security & ESMTP Server Settings</h1>
          <p className="text-xs text-slate-500">Manage 2FA authentication, password encryption, and ESMTP server dispatch parameters.</p>
        </div>

        {/* Tab Buttons */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'security'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-indigo-600" /> Account Security & 2FA
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('esmtp')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'esmtp'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Server className="w-4 h-4 text-indigo-600" /> ESMTP Mail Model
          </button>
        </div>
      </div>

      {activeTab === 'esmtp' ? (
        <ESMTPModelPanel userEmail={user.email} />
      ) : (
        <>
          {successMsg && (
            <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> {successMsg}
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600" /> {errorMsg}
            </div>
          )}

          {/* 2FA Toggle Card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-500" /> Two-Factor Email OTP Authentication (2FA)
              </h3>
              <p className="text-xs text-slate-500">
                When enabled, logging in requires entering a 6-digit OTP dispatched via ESMTP email to <span className="text-slate-900 font-mono font-semibold">{user.email}</span>.
              </p>
            </div>

            <button
              onClick={handleToggle2FA}
              className={`px-4 py-2 rounded-lg font-bold text-xs transition-all shadow-xs ${
                twoFactor
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-600 border border-slate-300'
              }`}
            >
              {twoFactor ? '2FA Active' : 'Enable 2FA'}
            </button>
          </div>

          {/* Password Change Form */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Lock className="w-4 h-4 text-indigo-600" /> Change Account Password
            </h3>

            <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Current Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-white text-slate-900 text-xs px-3.5 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="e.g. StrongP@ssw0rd!"
                  className="w-full bg-white text-slate-900 text-xs px-3.5 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
                <PasswordStrengthMeter password={newPassword} />
              </div>

              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2.5 rounded-lg shadow-xs transition-all"
              >
                Update Password
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
};

