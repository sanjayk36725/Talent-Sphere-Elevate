import React from 'react';
import { Bell, Check, Trash2, Mail, ShieldAlert, Sparkles, CheckSquare } from 'lucide-react';
import { NotificationItem } from '../types';

interface NotificationsPageProps {
  notifications: NotificationItem[];
  onMarkAllRead: () => void;
}

export const NotificationsPage: React.FC<NotificationsPageProps> = ({
  notifications = [],
  onMarkAllRead,
}) => {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <span className="text-xs font-mono font-bold text-amber-600">IN-APP NOTIFICATIONS</span>
          <h1 className="text-2xl font-black text-slate-900 mt-0.5">Platform Activity Feed</h1>
        </div>

        <button
          onClick={onMarkAllRead}
          className="bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-bold px-3.5 py-2 rounded-lg border border-slate-300 transition-all flex items-center gap-2"
        >
          <Check className="w-4 h-4 text-emerald-600" /> Mark All as Read
        </button>
      </div>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="bg-white p-12 text-center text-slate-400 rounded-xl border border-slate-200 shadow-xs">
            <Bell className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm font-bold text-slate-600">No active notifications.</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 rounded-xl border transition-all flex items-start gap-4 ${
                !n.readStatus
                  ? 'bg-white border-indigo-200 shadow-xs'
                  : 'bg-slate-50 border-slate-200 opacity-80'
              }`}
            >
              <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600 border border-amber-200 shrink-0 mt-0.5">
                <Bell className="w-4 h-4 text-amber-600" />
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900">{n.title}</h4>
                  <span className="text-[10px] font-mono text-slate-500">
                    {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.message}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
