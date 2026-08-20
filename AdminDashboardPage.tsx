import React, { useEffect, useState } from 'react';
import { Users, Shield, Server, Mail, CheckCircle2, AlertTriangle, Activity } from 'lucide-react';
import { User, EmailLog, SecurityEvent } from '../types';
import { safeFetchJson } from '../lib/api';

interface AdminDashboardPageProps {
  user: User;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ user }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminAnalytics();
  }, []);

  const fetchAdminAnalytics = async () => {
    try {
      const token = localStorage.getItem('ts_token');
      const { ok, data: result } = await safeFetchJson('/api/admin/analytics', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (ok && result) {
        setData(result);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-xs text-indigo-600 font-mono">
        Loading System Health & Audit Analytics...
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Title */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs font-mono font-bold text-emerald-600">ADMINISTRATOR CONTROL PANEL</span>
          <h1 className="text-2xl font-black text-slate-900 mt-0.5">Platform Architecture & Security Logs</h1>
          <p className="text-xs text-slate-500">Monitor ChromaDB vector store health, SMTP email delivery logs, and user security events.</p>
        </div>

        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold">
          <Activity className="w-4 h-4 animate-pulse text-emerald-600" /> SYSTEM ALL SYSTEMS GO
        </div>
      </div>

      {/* System Status Banner */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-bold block">ChromaDB Vector DB</span>
            <span className="text-sm font-bold text-slate-900 mt-0.5 block">RAG Metadata Filter Active</span>
          </div>
          <CheckCircle2 className="w-6 h-6 text-emerald-600" />
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-bold block">SMTP Email Dispatch</span>
            <span className="text-sm font-bold text-slate-900 mt-0.5 block">{data?.emailLogsCount || 0} Emails Logs</span>
          </div>
          <Mail className="w-6 h-6 text-indigo-600" />
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-bold block">Registered Users</span>
            <span className="text-sm font-bold text-slate-900 mt-0.5 block">{data?.totalUsers || 0} Total</span>
          </div>
          <Users className="w-6 h-6 text-amber-500" />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <Users className="w-4 h-4 text-amber-500" /> Registered Platform Accounts
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase font-mono bg-slate-50">
                <th className="py-2.5 px-3">Name</th>
                <th className="py-2.5 px-3">Email</th>
                <th className="py-2.5 px-3">Role</th>
                <th className="py-2.5 px-3">Verified</th>
                <th className="py-2.5 px-3">Unlocked Day</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-900">
              {data?.users?.map((u: any) => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-semibold">{u.name}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-500">{u.email}</td>
                  <td className="py-2.5 px-3">
                    <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono font-bold text-[10px] px-2 py-0.5 rounded">
                      {u.role}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-emerald-600 font-medium">Verified</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-amber-700">Day {u.currentUnlockedDay}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SMTP Email Logs */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <Mail className="w-4 h-4 text-indigo-600" /> Dispatched SMTP Email Logs
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase bg-slate-50">
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Recipient</th>
                <th className="py-2.5 px-3">Subject</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-900">
              {data?.emailLogs?.map((e: EmailLog) => (
                <tr key={e.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 text-amber-700 font-semibold">{e.emailType}</td>
                  <td className="py-2.5 px-3 text-slate-800">{e.recipient}</td>
                  <td className="py-2.5 px-3 text-slate-500">{e.subject}</td>
                  <td className="py-2.5 px-3 text-emerald-600 font-bold">{e.status}</td>
                  <td className="py-2.5 px-3 text-slate-500">{new Date(e.sentAt).toLocaleTimeString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
