import React from 'react';
import { Award, TrendingUp, Sparkles, Plus } from 'lucide-react';
import { StudentProfile } from '../types';

interface SkillsPageProps {
  profile: StudentProfile | null;
  onNavigate: (page: string) => void;
}

export const SkillsPage: React.FC<SkillsPageProps> = ({ profile, onNavigate }) => {
  const defaultSkills = [
    { name: 'Performance Management & OKRs', level: 'Advanced', score: 90 },
    { name: 'Talent Analytics & KPIs', level: 'Intermediate', score: 82 },
    { name: 'Strategic Workforce Architecture', level: 'Intermediate', score: 85 },
    { name: 'Python & AI Skill Models', level: 'Beginner', score: 75 },
    { name: '360-Degree Feedback Calibration', level: 'Advanced', score: 88 },
  ];

  const skills = profile?.skills && profile.skills.length > 0 ? profile.skills : defaultSkills;
  const avgScore = Math.round(skills.reduce((acc, s) => acc + s.score, 0) / (skills.length || 1));

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-slate-900 dark:text-slate-100">
      {/* Title */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-black text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950 px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
              DYNAMIC COMPETENCY MATRIX
            </span>
            <span className="text-xs font-mono font-black text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
              AVG RATING: {avgScore}%
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-950 dark:text-white mt-1">Skill Verification & Analytics</h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
            Real-time proficiency tracking automatically updated upon clearing day-wise assessments.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('career')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs px-4 py-2.5 rounded-xl shadow-md shadow-indigo-600/30 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-400" /> AI Skill Gap Analysis
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {skills.map((sk) => (
          <div
            key={sk.name}
            className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-black text-slate-950 dark:text-white text-sm">{sk.name}</h3>
              <span className="text-xs font-mono font-black text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950 px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                {sk.level} ({sk.score}/100)
              </span>
            </div>

            <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-500"
                style={{ width: `${sk.score}%` }}
              />
            </div>

            <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
              Verified through curriculum assessments, proctored evaluations, and project milestones.
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
