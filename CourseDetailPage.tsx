import React, { useState } from 'react';
import { BookOpen, Lock, CheckCircle2, FileText, Sparkles, Play, ArrowLeft } from 'lucide-react';
import { Course, User } from '../types';

interface CourseDetailPageProps {
  course: Course;
  user: User;
  onUnlockDay: (dayId: number) => void;
  onNavigate: (page: string) => void;
}

export const CourseDetailPage: React.FC<CourseDetailPageProps> = ({
  course,
  user,
  onUnlockDay,
  onNavigate,
}) => {
  const modules = course?.modules || [];
  const [activeDay, setActiveDay] = useState(1);
  const [activeLesson, setActiveLesson] = useState<any>(modules[0]?.lessons?.[0] || null);

  const currentModule = modules.find((m) => m.dayId === activeDay) || modules[0] || {
    id: 'MOD_DEFAULT',
    dayId: 1,
    title: 'Core Fundamentals',
    description: 'Introduction to Talent Sphere curriculum.',
    lessons: [],
  };
  const isDayUnlocked = activeDay <= (user?.currentUnlockedDay || 1);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Navigation Bar */}
      <button
        onClick={() => onNavigate('courses')}
        className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1 transition-all"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Course Catalog
      </button>

      {/* Course Header Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded font-mono font-bold border border-indigo-200">
            {course.category} • {course.difficulty}
          </span>
          <h1 className="text-2xl font-black text-slate-900">{course.title}</h1>
          <p className="text-xs text-slate-600 leading-relaxed">{course.description}</p>
          <div className="text-xs text-slate-900 font-bold pt-1">
            Instructor: <span className="text-amber-600">{course.instructor}</span>
          </div>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center flex flex-col justify-between shrink-0 min-w-[200px]">
          <div>
            <span className="text-[11px] text-slate-500 font-bold block">INSTRUCTOR RELEASED</span>
            <span className="text-xl font-black text-amber-600 font-mono mt-1 block">
              Day {user.currentUnlockedDay} Unlocked
            </span>
          </div>

          <div className="mt-2 text-[11px] text-slate-500 font-mono">
            {user.currentUnlockedDay >= 7 ? '🌟 Full Course Released' : 'Progress Regulated by Teacher'}
          </div>
        </div>
      </div>

      {/* Two Pane Layout: Day Modules Sidebar + Active Day Content */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Day Modules Selector */}
        <div className="space-y-3">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-600" /> Progressive Modules
          </h3>

          {modules.map((m) => {
            const unlocked = m.dayId <= (user?.currentUnlockedDay || 1);
            const isSelected = m.dayId === activeDay;

            return (
              <div
                key={m.id}
                onClick={() => setActiveDay(m.dayId)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                    : unlocked
                    ? 'bg-white border-slate-200 text-slate-900 hover:bg-slate-50'
                    : 'bg-slate-50/70 border-slate-200 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : unlocked
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    Day {m.dayId}
                  </span>

                  {unlocked ? (
                    <CheckCircle2 className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-emerald-600'}`} />
                  ) : (
                    <Lock className="w-4 h-4 text-slate-400" />
                  )}
                </div>

                <h4 className="text-xs font-bold mt-1">{m.title}</h4>

                {!unlocked && (
                  <span className="mt-2 text-[10px] text-slate-500 font-mono block text-center bg-slate-100 py-1 rounded border border-slate-200">
                    🔒 Locked by Instructor
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Active Module Viewer */}
        <div className="md:col-span-2 space-y-6">
          {!isDayUnlocked ? (
            <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-xs text-center space-y-4">
              <Lock className="w-12 h-12 text-amber-500 mx-auto opacity-80" />
              <h3 className="text-lg font-bold text-slate-900">Day {activeDay} Content Locked</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                Day {activeDay} study materials, PDFs, and evaluations are locked by your instructor. Your teacher will release this module according to the curriculum schedule.
              </p>
              <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-800 text-xs px-4 py-2 rounded-lg border border-amber-200 font-mono font-bold">
                <Lock className="w-3.5 h-3.5 text-amber-600" />
                <span>Instructor Authorization Required for Day {activeDay}</span>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Attached PDFs for current Day */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase font-mono flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-amber-500" />
                  Day {activeDay} Unlocked Course PDFs (Indexed in Vector Store)
                </h4>

                <div className="grid sm:grid-cols-2 gap-3">
                  {currentModule.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-center justify-between"
                    >
                      <div className="overflow-hidden">
                        <span className="text-xs font-bold text-slate-900 block truncate">{doc.filename}</span>
                        <span className="text-[10px] text-slate-500 block font-mono">{doc.vectorChunkCount} Vector Chunks</span>
                      </div>
                      <button
                        onClick={() => onNavigate('chatbot')}
                        className="text-[10px] bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold px-2.5 py-1 rounded border border-indigo-200 shrink-0"
                      >
                        Ask AI
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Lesson Reader */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
                <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900">{activeLesson?.title || 'Lesson Overview'}</h4>
                  <span className="text-xs text-slate-500 font-mono">{activeLesson?.duration || '20 Mins'}</span>
                </div>

                <div className="text-xs text-slate-700 leading-relaxed space-y-3 bg-slate-50 p-4 rounded-lg font-serif border border-slate-200">
                  <p>{activeLesson?.content}</p>
                  <p>
                    In this lesson, we break down actionable objectives, metric evaluation frameworks, and how dynamic skill scoring helps guide your personal career roadmap.
                  </p>
                </div>

                {currentModule.assessmentId && (
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => onNavigate(`assessment-${currentModule.assessmentId}`)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-lg shadow-xs transition-all"
                    >
                      Take Day {activeDay} Assessment
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
