import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Award,
  BookOpen,
  CheckSquare,
  Compass,
  ArrowRight,
  Zap,
  TrendingUp,
  ShieldCheck,
  Video,
  Mic,
  Calendar,
  Clock,
  ChevronRight,
  Bell,
  BarChart3,
  FileText,
  Play,
  Upload,
  CheckCircle2,
} from 'lucide-react';
import { User, StudentProfile, Course, AssessmentAttempt, Announcement, MockInterview } from '../types';
import { AscentPath } from '../components/AscentPath';
import { LiveMockInterviewModal } from '../components/LiveMockInterviewModal';
import { safeFetchJson } from '../lib/api';

interface StudentDashboardPageProps {
  user: User;
  profile: StudentProfile | null;
  courses: Course[];
  onNavigate: (page: string) => void;
  onUnlockDay: (dayId: number) => void;
}

export const StudentDashboardPage: React.FC<StudentDashboardPageProps> = ({
  user,
  profile,
  courses,
  onNavigate,
  onUnlockDay,
}) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'mock_interview'>('dashboard');
  const [attempts, setAttempts] = useState<AssessmentAttempt[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [mockInterviews, setMockInterviews] = useState<MockInterview[]>([]);
  const [showLiveInterviewModal, setShowLiveInterviewModal] = useState(false);
  const [resumeFilename, setResumeFilename] = useState('Sanjay_Kumar_Resume.pdf');

  useEffect(() => {
    fetchStudentData();
  }, [user.id]);

  const fetchStudentData = async () => {
    const token = localStorage.getItem('ts_token');
    try {
      const [resAttempts, resAnnouncements, resInterviews] = await Promise.all([
        safeFetchJson<{ attempts: AssessmentAttempt[] }>('/api/assessments/attempts', {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        }),
        safeFetchJson<{ announcements: Announcement[] }>('/api/announcements', {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        }),
        safeFetchJson<{ interviews: MockInterview[] }>('/api/mock-interviews', {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        }),
      ]);

      if (resAttempts.ok && resAttempts.data?.attempts) {
        setAttempts(resAttempts.data.attempts);
      }
      if (resAnnouncements.ok && resAnnouncements.data?.announcements) {
        setAnnouncements(resAnnouncements.data.announcements);
      }
      if (resInterviews.ok && resInterviews.data?.interviews) {
        setMockInterviews(resInterviews.data.interviews);
      }
    } catch (e) {
      console.error('Error fetching student dashboard data:', e);
    }
  };

  // Stat calculations
  const totalAttempts = attempts.length;
  const avgScore = totalAttempts > 0
    ? Math.round(attempts.reduce((acc, a) => acc + (a.score / (a.totalMarks || 1)) * 100, 0) / totalAttempts)
    : 85;
  const maxScore = totalAttempts > 0
    ? Math.max(...attempts.map((a) => Math.round((a.score / (a.totalMarks || 1)) * 100)))
    : 96;

  const latestInterview = mockInterviews[0];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-slate-900 dark:text-slate-100">
      {/* Top Banner & Welcome Card */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-black text-amber-700 dark:text-amber-400 mb-1">
            <Sparkles className="w-4 h-4 text-amber-500" />
            STUDENT ACADEMIC PORTAL • DAY {user.currentUnlockedDay} UNLOCKED
          </div>
          <h1 className="text-2xl font-black text-slate-950 dark:text-white">Welcome Back, {user.name}! 👋</h1>
          <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mt-1 max-w-xl">
            {profile?.college || 'Talent Sphere Elevate Academy'} • {profile?.degree || 'B.Tech CS'} (3rd Year)
          </p>
        </div>

        {/* Dual Primary Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => onNavigate('assessments')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs px-4 py-2.5 rounded-xl shadow-sm flex items-center gap-2 transition-all cursor-pointer"
          >
            <CheckSquare className="w-4 h-4" />
            Take Proctored Test &rarr;
          </button>

          <button
            onClick={() => setShowLiveInterviewModal(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white font-black text-xs px-4 py-2.5 rounded-xl shadow-sm flex items-center gap-2 transition-all cursor-pointer"
          >
            <Mic className="w-4 h-4" />
            Day 6 AI Mock Interview
          </button>
        </div>
      </div>

      {/* Top Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 rounded-xl border shadow-sm gap-4 overflow-x-auto">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`py-3.5 px-3 text-xs font-black flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'dashboard'
              ? 'border-indigo-600 text-indigo-700 dark:text-indigo-400'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Dashboard Overview
        </button>

        <button
          onClick={() => onNavigate('assessments')}
          className="py-3.5 px-3 text-xs font-black flex items-center gap-2 border-b-2 border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white transition-all whitespace-nowrap cursor-pointer"
        >
          <CheckSquare className="w-4 h-4" />
          Proctored Exam Hub
        </button>

        <button
          onClick={() => setActiveTab('mock_interview')}
          className={`py-3.5 px-3 text-xs font-black flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'mock_interview'
              ? 'border-indigo-600 text-indigo-700 dark:text-indigo-400'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
          }`}
        >
          <Mic className="w-4 h-4" />
          Day 6 Mock Interview Hub
          {mockInterviews.length > 0 && (
            <span className="bg-emerald-100 text-emerald-900 text-[10px] font-black px-2 py-0.5 rounded-full">
              {mockInterviews.length} Completed
            </span>
          )}
        </button>
      </div>

      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* 4 Computed Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 font-bold mb-1">
                <span>AVERAGE MARK</span>
                <Award className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="text-3xl font-black font-mono text-slate-950 dark:text-white">{avgScore}%</div>
              <div className="text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-1 font-bold">
                <TrendingUp className="w-3.5 h-3.5" /> High Academic Standing
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 font-bold mb-1">
                <span>HIGHEST TEST MARK</span>
                <Zap className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-3xl font-black font-mono text-amber-600 dark:text-amber-400">{maxScore}%</div>
              <div className="text-xs text-slate-600 dark:text-slate-400 font-semibold">Top Score in Cohort</div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 font-bold mb-1">
                <span>EXAMS COMPLETED</span>
                <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="text-3xl font-black font-mono text-emerald-700 dark:text-emerald-400">
                {totalAttempts} / 20 Days
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400 font-semibold">
                Day {user.currentUnlockedDay} Currently Unlocked
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 font-bold mb-1">
                <span>MOCK INTERVIEW</span>
                <Video className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="text-2xl font-black font-mono text-purple-800 dark:text-purple-300">
                {latestInterview ? `${latestInterview.overallScore}% Score` : 'Day 6 Ready'}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400 font-semibold">
                {latestInterview ? 'Evaluated by Dr. Aris' : 'Oral AI Voice Session'}
              </div>
            </div>
          </div>

          {/* Signature Ascent Path Component */}
          <AscentPath
            currentUnlockedDay={user.currentUnlockedDay || 1}
            maxDays={20}
            isTeacher={false}
          />

          {/* Two Columns: Marks Progression & Teacher Announcements */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: My Obtained Marks Progression Chart & Breakdown */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-black text-base text-slate-950 dark:text-white flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    My Obtained Marks Progression (Day & Week Wise)
                  </h3>
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mt-0.5">
                    Continuous score tracking across all daily proctored examinations
                  </p>
                </div>
                <button
                  onClick={() => onNavigate('assessments')}
                  className="text-xs text-indigo-700 dark:text-indigo-400 hover:underline font-black flex items-center gap-1 cursor-pointer"
                >
                  View All &rarr;
                </button>
              </div>

              {/* Day-Wise Score Visualizer Bars */}
              <div className="space-y-3 pt-2">
                {[
                  { day: 'Week 1 Day 1 (Mon)', title: 'Introduction to OKRs & Performance Systems', score: 28, total: 30, pct: 93 },
                  { day: 'Week 1 Day 2 (Tue)', title: 'SMART Goals & Metric Calibration', score: 26, total: 30, pct: 87 },
                  { day: 'Week 1 Day 3 (Wed)', title: 'Continuous Feedback & 360 Reviews', score: 29, total: 30, pct: 97 },
                  { day: 'Week 1 Day 4 (Thu)', title: 'Skill Matrices & Competency Mapping', score: 27, total: 30, pct: 90 },
                  { day: 'Week 1 Day 5 (Fri)', title: 'Weekly Synthesis & Cumulative Assessment', score: 25, total: 30, pct: 83 },
                ].map((item, idx) => (
                  <div key={idx} className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="font-black text-slate-950 dark:text-white">{item.day}</span>
                        <span className="text-slate-700 dark:text-slate-300 block text-xs font-medium">{item.title}</span>
                      </div>
                      <div className="text-right font-mono">
                        <span className="font-black text-indigo-700 dark:text-indigo-400">{item.score}/{item.total} Marks</span>
                        <span className="text-xs text-slate-600 dark:text-slate-400 block font-bold">{item.pct}%</span>
                      </div>
                    </div>

                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${item.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right 1 Col: Teacher Announcements Feed */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-base text-slate-950 dark:text-white flex items-center gap-2">
                  <Bell className="w-5 h-5 text-amber-500" />
                  Faculty Announcements
                </h3>
                <span className="text-[10px] bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-700 px-2.5 py-0.5 rounded-full font-mono font-black">
                  {announcements.length} Live
                </span>
              </div>

              <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                {announcements.map((ann) => (
                  <div
                    key={ann.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-black text-slate-950 dark:text-white leading-tight">
                        {ann.title}
                      </span>
                      {ann.isLiveExam && (
                        <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200 font-mono font-black px-2 py-0.5 rounded-full whitespace-nowrap">
                          LIVE EXAM
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                      {ann.message}
                    </p>

                    <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 font-mono pt-1 border-t border-slate-200 dark:border-slate-700">
                      <span className="font-semibold">{ann.createdBy}</span>
                      <span>{new Date(ann.createdAt).toLocaleDateString()}</span>
                    </div>

                    {/* Touch to Take Exam CTA */}
                    <button
                      onClick={() => onNavigate('assessments')}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      Touch to Take Exam &rarr;
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mock Interview Hub Tab */}
      {activeTab === 'mock_interview' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/60 border border-amber-800 px-3 py-1 rounded-full uppercase">
                DAY 6 CAPSTONE INTERVIEW
              </span>
              <h2 className="text-3xl font-black">AI Voice Technical Interviewer</h2>
              <p className="text-xs text-purple-200 leading-relaxed">
                Experience real-time interactive voice evaluations with Dr. Aris. Receive detailed feedback on technical depth, behavioral agility, and communication clarity based on your resume and weekly coursework.
              </p>
            </div>

            <button
              onClick={() => setShowLiveInterviewModal(true)}
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm px-6 py-3.5 rounded-2xl shadow-lg flex items-center gap-2 transition-all cursor-pointer"
            >
              <Mic className="w-5 h-5 text-slate-950" />
              Launch Live Interview Now &rarr;
            </button>
          </div>

          {/* Past Mock Interview Results */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-black text-lg text-slate-950 dark:text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              My Oral Evaluation History & Transcripts
            </h3>

            {mockInterviews.length === 0 ? (
              <div className="p-8 text-center text-slate-600 dark:text-slate-400 space-y-3">
                <Mic className="w-10 h-10 mx-auto text-slate-400" />
                <p className="text-sm font-bold">No mock interviews completed yet.</p>
                <button
                  onClick={() => setShowLiveInterviewModal(true)}
                  className="bg-purple-600 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-sm cursor-pointer"
                >
                  Start Your First Interview
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mockInterviews.map((mock) => (
                  <div
                    key={mock.id}
                    className="p-5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-purple-900 bg-purple-100 dark:bg-purple-950 dark:text-purple-200 px-2.5 py-0.5 rounded-full">
                        WEEK {mock.targetWeek} DAY 6 INTERVIEW
                      </span>
                      <span className="text-xs font-black text-slate-900 dark:text-slate-100 font-mono">
                        {new Date(mock.completedAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                        <span className="text-[10px] text-slate-600 dark:text-slate-400 font-bold block">OVERALL</span>
                        <span className="text-lg font-black text-amber-600 dark:text-amber-400 font-mono">{mock.overallScore}%</span>
                      </div>
                      <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                        <span className="text-[10px] text-slate-600 dark:text-slate-400 font-bold block">COMM</span>
                        <span className="text-lg font-black text-indigo-600 dark:text-indigo-400 font-mono">{mock.communicationScore}%</span>
                      </div>
                      <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                        <span className="text-[10px] text-slate-600 dark:text-slate-400 font-bold block">TECH</span>
                        <span className="text-lg font-black text-purple-600 dark:text-purple-400 font-mono">{mock.technicalDepthScore}%</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-800 dark:text-slate-200 italic bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700 font-serif leading-relaxed">
                      &quot;{mock.summaryText}&quot;
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Live Voice Mock Interview Modal */}
      {showLiveInterviewModal && (
        <LiveMockInterviewModal
          user={user}
          week={1}
          resumeFilename={resumeFilename}
          onClose={() => {
            setShowLiveInterviewModal(false);
            fetchStudentData();
          }}
          onComplete={(newInterview) => {
            setMockInterviews((prev) => [newInterview, ...prev]);
          }}
        />
      )}
    </div>
  );
};
