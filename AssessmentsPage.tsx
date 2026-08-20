import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Clock,
  Award,
  Lock,
  Unlock,
  Play,
  FileSpreadsheet,
  Printer,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Eye,
  FileText,
  Search,
  BookOpen,
  X,
  Zap,
  Send,
  RefreshCw,
  MessageSquare,
  ShieldCheck,
  Download,
  Bell,
} from 'lucide-react';
import { Assessment, AssessmentAttempt, User, UnlockRequest } from '../types';
import { AssessmentRunner } from '../components/AssessmentRunner';
import {
  downloadAsPDF,
  downloadIndividualStudentScorecardPDF,
  downloadAsCSV,
  downloadAsExcel,
  downloadAsJSON,
  downloadAsWordDoc,
} from '../lib/export_utils';

interface AssessmentsPageProps {
  user: User;
  assessments: Assessment[];
  attempts: AssessmentAttempt[];
  onSubmitAssessment: (assessmentId: string, answers: Record<string, string | number>) => Promise<AssessmentAttempt>;
  onRefreshData?: () => void;
}

export const AssessmentsPage: React.FC<AssessmentsPageProps> = ({
  user,
  assessments,
  attempts,
  onSubmitAssessment,
  onRefreshData,
}) => {
  const [activeTab, setActiveTab] = useState<'exam_catalog' | 'results_hub'>('exam_catalog');
  const [activeAssessment, setActiveAssessment] = useState<Assessment | null>(null);
  const [selectedAttemptForView, setSelectedAttemptForView] = useState<AssessmentAttempt | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWeekFilter, setSelectedWeekFilter] = useState<number | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'UNLOCKED' | 'LOCKED'>('ALL');

  // Student Unlock Request States
  const [unlockRequests, setUnlockRequests] = useState<UnlockRequest[]>([]);
  const [requestLoadingDayId, setRequestLoadingDayId] = useState<number | null>(null);
  const [checkLoadingDayId, setCheckLoadingDayId] = useState<number | null>(null);
  const [isRefreshingGlobal, setIsRefreshingGlobal] = useState(false);
  const [bannerNotice, setBannerNotice] = useState<{ text: string; type: 'success' | 'info' | 'amber' } | null>(null);

  // Fetch unlock requests for current student
  const fetchStudentUnlockRequests = async () => {
    try {
      const token = localStorage.getItem('ts_token') || localStorage.getItem('token');
      if (!token) return;
      const res = await fetch('/api/student/unlock-requests', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUnlockRequests(data.requests || []);
      }
    } catch (e) {
      console.warn('Failed to load student unlock requests:', e);
    }
  };

  useEffect(() => {
    fetchStudentUnlockRequests();
  }, [user.id, user.currentUnlockedDay]);

  // Request teacher unlock for a specific test / day
  const handleRequestUnlock = async (dayId: number, assessmentId?: string, assessmentTitle?: string) => {
    try {
      setRequestLoadingDayId(dayId);
      const token = localStorage.getItem('ts_token') || localStorage.getItem('token');
      const res = await fetch('/api/student/request-unlock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          dayId,
          assessmentId,
          message: `Student ${user.name} requested unlock for ${assessmentTitle || `Day ${dayId} Test`}.`,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setBannerNotice({
          text: `📨 Request Sent to Teacher! Your instructor has been alerted to unlock ${assessmentTitle || `Day ${dayId} Test`}.`,
          type: 'success',
        });
        await fetchStudentUnlockRequests();
        if (onRefreshData) onRefreshData();
      } else {
        setBannerNotice({
          text: data.error || 'Could not submit unlock request.',
          type: 'amber',
        });
      }
    } catch (err: any) {
      setBannerNotice({
        text: 'Failed to reach teacher. Please try again.',
        type: 'amber',
      });
    } finally {
      setRequestLoadingDayId(null);
    }
  };

  // Check if test is unlocked live
  const handleCheckUnlockStatus = async (dayId: number, assessmentTitle?: string) => {
    try {
      setCheckLoadingDayId(dayId);
      const token = localStorage.getItem('ts_token') || localStorage.getItem('token');
      const res = await fetch(`/api/student/check-test-status?dayId=${dayId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.isUnlocked) {
          setBannerNotice({
            text: `🎉 UNLOCKED! ${assessmentTitle || `Day ${dayId} Test`} is unlocked by your teacher. You can start the exam now!`,
            type: 'success',
          });
        } else if (data.pendingRequest) {
          setBannerNotice({
            text: `⏳ Awaiting Teacher Release: Your request for Day ${dayId} was submitted on ${new Date(data.pendingRequest.requestedAt).toLocaleTimeString()}. Your instructor will unlock it shortly.`,
            type: 'info',
          });
        } else {
          setBannerNotice({
            text: `🔒 Still Locked: ${assessmentTitle || `Day ${dayId} Test`} is regulated by your instructor. Click "Ask Teacher to Unlock" to notify your teacher!`,
            type: 'amber',
          });
        }
        if (onRefreshData) onRefreshData();
      }
    } catch (e) {
      setBannerNotice({ text: 'Could not refresh test status.', type: 'amber' });
    } finally {
      setCheckLoadingDayId(null);
    }
  };

  const handleGlobalRefresh = async () => {
    setIsRefreshingGlobal(true);
    if (onRefreshData) await onRefreshData();
    await fetchStudentUnlockRequests();
    setTimeout(() => {
      setIsRefreshingGlobal(false);
      setBannerNotice({
        text: `🔄 Test & module statuses synchronized with instructor schedule. Current unlocked day: Day ${user.currentUnlockedDay || 1}.`,
        type: 'info',
      });
    }, 400);
  };

  if (activeAssessment) {
    return (
      <AssessmentRunner
        assessment={activeAssessment}
        onSubmit={onSubmitAssessment}
        onBack={() => setActiveAssessment(null)}
      />
    );
  }

  // Calculate dynamic metrics for student
  const passedAttempts = attempts.filter((a) => a.passed);
  const totalScoreObtained = attempts.reduce((acc, a) => acc + a.score, 0);
  const totalPossible = attempts.reduce((acc, a) => acc + a.totalMarks, 0);
  const overallAverage = totalPossible > 0 ? Math.round((totalScoreObtained / totalPossible) * 100) : 100;

  const currentUnlocked = user.currentUnlockedDay || 1;
  const currentWeek = Math.ceil(currentUnlocked / 5) || 1;
  const currentDayInWeek = ((currentUnlocked - 1) % 5) + 1;
  const currentUnlockLabel = `Week ${currentWeek} Day ${currentDayInWeek} (Day ${currentUnlocked})`;

  // Find any published, unlocked exam that hasn't been completed/passed yet
  const uncompletedExam = assessments.find((asm) => {
    const isUnlocked = user.role !== 'STUDENT' || asm.dayId <= currentUnlocked;
    if (!isUnlocked || !asm.isPublished) return false;
    const attempt = attempts.find((a) => a.assessmentId === asm.id);
    return !attempt || !attempt.passed;
  });

  // Filter assessments based on week and unlock status
  const displayedAssessments = assessments.filter((asm) => {
    const isUnlocked = user.role !== 'STUDENT' || asm.dayId <= currentUnlocked;
    const asmWeek = asm.weekId || Math.ceil(asm.dayId / 5) || 1;

    if (selectedWeekFilter !== 'ALL' && asmWeek !== selectedWeekFilter) return false;
    if (statusFilter === 'UNLOCKED' && !isUnlocked) return false;
    if (statusFilter === 'LOCKED' && isUnlocked) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const titleMatch = (asm.title || '').toLowerCase().includes(q);
      const descMatch = (asm.description || '').toLowerCase().includes(q);
      const dayMatch = (asm.dayLabel || `Day ${asm.dayId}`).toLowerCase().includes(q);
      return titleMatch || descMatch || dayMatch;
    }
    return true;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-slate-900 dark:text-slate-100">
      {/* Title & Teacher Status Banner */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono font-black text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
              STUDENT EXAMINATION PORTAL
            </span>
            <span className="text-xs font-mono font-black text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
              <Unlock className="w-3 h-3" /> Instructor Released up to {currentUnlockLabel}
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-950 dark:text-white mt-1">Examinations & Test Portal</h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
            Tests are teacher-regulated. Check if your test is unlocked, ask your teacher for approval, and take exams once released.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleGlobalRefresh}
            disabled={isRefreshingGlobal}
            className="bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            title="Check live unlock status from teacher"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingGlobal ? 'animate-spin text-indigo-600' : 'text-slate-500 dark:text-slate-400'}`} />
            <span>{isRefreshingGlobal ? 'Syncing...' : 'Sync Test Status'}</span>
          </button>

          <div className="bg-slate-50 dark:bg-slate-800 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-center font-mono">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block uppercase">PASSED EXAMS</span>
            <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
              {passedAttempts.length} / {assessments.length}
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-center font-mono">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block uppercase">AVG SCORE</span>
            <span className="text-base font-black text-indigo-600 dark:text-indigo-400">
              {overallAverage}%
            </span>
          </div>
        </div>
      </div>

      {/* Banner Notice Alert */}
      {bannerNotice && (
        <div
          className={`p-4 rounded-xl border text-xs font-semibold flex items-center justify-between shadow-xs transition-all ${
            bannerNotice.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : bannerNotice.type === 'amber'
              ? 'bg-amber-50 border-amber-200 text-amber-900'
              : 'bg-indigo-50 border-indigo-200 text-indigo-900'
          }`}
        >
          <div className="flex items-center gap-2">
            {bannerNotice.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : bannerNotice.type === 'amber' ? (
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            ) : (
              <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
            )}
            <span>{bannerNotice.text}</span>
          </div>
          <button onClick={() => setBannerNotice(null)} className="text-slate-400 hover:text-slate-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 rounded-xl border shadow-sm gap-4">
        <button
          onClick={() => setActiveTab('exam_catalog')}
          className={`py-3.5 px-2 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'exam_catalog'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-500'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          Tests & Exam Catalog ({assessments.length})
        </button>

        <button
          onClick={() => setActiveTab('results_hub')}
          className={`py-3.5 px-2 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'results_hub'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-500'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Award className="w-4 h-4" />
          My Results Hub & Transcripts ({attempts.length})
        </button>
      </div>

      {/* ============================================================ */}
      {/* TAB 1: EXAM CATALOG */}
      {/* ============================================================ */}
      {activeTab === 'exam_catalog' && (
        <div className="space-y-6">
            {/* New Exam Notification Banner */}
            {uncompletedExam && (
              <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-md animate-pulse">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-amber-100 rounded-xl text-amber-600 border border-amber-200 shrink-0">
                    <Bell className="w-5 h-5 animate-bounce" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-black bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full border border-amber-200 uppercase">
                      New Exam Alert
                    </span>
                    <h4 className="text-xs font-black text-slate-900 mt-1">
                      "{uncompletedExam.title}" is published and available!
                    </h4>
                    <p className="text-[11px] text-slate-600 font-medium">
                      Day: {uncompletedExam.dayLabel || `Day ${uncompletedExam.dayId}`} • Duration: {uncompletedExam.durationMinutes} Minutes • Questions: {uncompletedExam.questions.length} MCQs
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveAssessment(uncompletedExam)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs px-4 py-2.5 rounded-xl shadow-md transition-all shrink-0 cursor-pointer flex items-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  Take Test Now &rarr;
                </button>
              </div>
            )}

            {/* Teacher Lock/Unlock Information & Flow Card */}
            <div className="p-4 bg-gradient-to-r from-indigo-50/90 via-sky-50/80 to-indigo-50/90 dark:from-indigo-950/40 dark:via-sky-950/30 dark:to-indigo-950/40 border border-indigo-200 dark:border-indigo-900 rounded-2xl text-xs text-indigo-950 dark:text-indigo-200 space-y-2 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-indigo-900">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  <span>Instructor-Led Exam Unlock Flow</span>
                </div>
                <span className="text-[11px] font-mono font-bold bg-white/80 text-indigo-700 px-2.5 py-0.5 rounded-full border border-indigo-200">
                  Current Access: Day 1 to Day {currentUnlocked}
                </span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Only your course instructor unlocks tests and study modules. If an exam is locked, click{' '}
                <strong className="text-indigo-900 font-semibold">&quot;Ask Teacher to Unlock&quot;</strong> to submit an instant request. Once approved by your instructor, the test unlocks automatically and you can begin your examination.
              </p>
            </div>

            {/* Filter Bar */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 uppercase mr-1">WEEK:</span>
              <button
                onClick={() => setSelectedWeekFilter('ALL')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all border ${
                  selectedWeekFilter === 'ALL'
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                All Weeks
              </button>
              {[1, 2, 3, 4].map((wk) => (
                <button
                  key={wk}
                  onClick={() => setSelectedWeekFilter(wk)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all border ${
                    selectedWeekFilter === wk
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Week {wk}
                </button>
              ))}

              <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block" />

              <span className="text-xs font-mono font-bold text-slate-400 uppercase mr-1">STATUS:</span>
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border ${
                  statusFilter === 'ALL'
                    ? 'bg-slate-800 text-white border-slate-800'
                    : 'bg-slate-50 text-slate-600 border-slate-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter('UNLOCKED')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border ${
                  statusFilter === 'UNLOCKED'
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-slate-50 text-emerald-700 border-slate-200'
                }`}
              >
                🔓 Unlocked ({assessments.filter((a) => a.dayId <= currentUnlocked).length})
              </button>
              <button
                onClick={() => setStatusFilter('LOCKED')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border ${
                  statusFilter === 'LOCKED'
                    ? 'bg-amber-600 text-white border-amber-600'
                    : 'bg-slate-50 text-amber-800 border-slate-200'
                }`}
              >
                🔒 Locked ({assessments.filter((a) => a.dayId > currentUnlocked).length})
              </button>
            </div>

            <div className="relative w-full md:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search exams..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pl-9 pr-4 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Assessments Grid */}
          <div className="grid md:grid-cols-2 gap-5">
            {displayedAssessments.map((asm) => {
              const isUnlocked = user.role !== 'STUDENT' || asm.dayId <= currentUnlocked;
              const attempt = attempts.find((a) => a.assessmentId === asm.id);
              const weekNum = asm.weekId || Math.ceil(asm.dayId / 5) || 1;
              const dayInWeek = ((asm.dayId - 1) % 5) + 1;
              const dayLabel = asm.dayLabel || `Week ${weekNum} Day ${dayInWeek}`;

              const pendingReq = unlockRequests.find(
                (r) => r.dayId === asm.dayId && r.status === 'PENDING'
              );
              const isRequestingThis = requestLoadingDayId === asm.dayId;
              const isCheckingThis = checkLoadingDayId === asm.dayId;

              return (
                <div
                  key={asm.id}
                  className={`p-5 rounded-2xl border transition-all space-y-4 flex flex-col justify-between touch-sensor-card ${
                    isUnlocked
                      ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-300 dark:hover:border-indigo-700'
                      : 'bg-slate-50/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-md font-mono font-bold border border-indigo-200">
                        {dayLabel} (Day {asm.dayId})
                      </span>

                      {attempt?.passed ? (
                        <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold font-mono px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Passed ({attempt.score}/{attempt.totalMarks})
                        </span>
                      ) : attempt ? (
                        <span className="text-[10px] bg-amber-50 text-amber-700 font-bold font-mono px-2.5 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 text-amber-600" /> Retry ({attempt.score}/{attempt.totalMarks})
                        </span>
                      ) : isUnlocked ? (
                        <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold font-mono px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                          <Unlock className="w-3 h-3 text-emerald-600" /> Unlocked by Teacher
                        </span>
                      ) : (
                        <span className="text-[10px] bg-amber-50 text-amber-800 font-bold font-mono px-2.5 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
                          <Lock className="w-3 h-3 text-amber-600" /> Locked by Teacher
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="text-base font-extrabold text-slate-950 dark:text-white leading-snug">{asm.title}</h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed font-medium">{asm.description}</p>
                    </div>

                    <div className="flex items-center gap-3 text-xs font-mono text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-500" /> {asm.durationMinutes} Mins
                      </span>
                      <span>•</span>
                      <span>{asm.questions.length} MCQs</span>
                      <span>•</span>
                      <span>Pass: {asm.passingMarks} / {asm.totalMarks} Marks</span>
                    </div>
                  </div>

                  <div className="pt-2 space-y-2">
                    {isUnlocked ? (
                      <div className="space-y-1.5">
                        <button
                          onClick={() => setActiveAssessment(asm)}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-xs transition-all flex items-center justify-center gap-2 touch-sensor-btn sensor-glow"
                        >
                          <Play className="w-4 h-4 fill-white" />
                          {attempt ? 'Retake Exam / Improve Score' : 'Take Exam Now (Unlocked)'}
                        </button>
                        <div className="text-center">
                          <span className="text-[11px] text-emerald-700 font-mono font-medium">
                            ✓ Teacher approved & ready to take
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2 bg-slate-100/90 p-3 rounded-xl border border-slate-200 sensor-inset">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-xs font-mono text-amber-800 font-semibold">
                            <Lock className="w-3.5 h-3.5 text-amber-600" />
                            <span>Locked by Instructor</span>
                          </div>
                          <button
                            onClick={() => handleCheckUnlockStatus(asm.dayId, asm.title)}
                            disabled={isCheckingThis}
                            className="text-[11px] text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-2xs touch-sensor-btn"
                          >
                            <RefreshCw className={`w-3 h-3 ${isCheckingThis ? 'animate-spin' : ''}`} />
                            <span>Check Status</span>
                          </button>
                        </div>

                        {pendingReq ? (
                          <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900 space-y-1">
                            <div className="flex items-center justify-between font-bold">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-amber-600" /> Unlock Request Sent
                              </span>
                              <span className="text-[10px] font-mono text-amber-700">
                                {new Date(pendingReq.requestedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-[11px] text-amber-800 leading-tight">
                              Your teacher has been notified. As soon as the teacher approves, this button will turn green!
                            </p>
                            <button
                              onClick={() => handleRequestUnlock(asm.dayId, asm.id, asm.title)}
                              disabled={isRequestingThis}
                              className="w-full mt-1 bg-amber-200 hover:bg-amber-300 text-amber-900 font-bold py-1.5 rounded text-[11px] transition-all touch-sensor-btn"
                            >
                              {isRequestingThis ? 'Sending Alert...' : 'Ping Teacher Again'}
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleRequestUnlock(asm.dayId, asm.id, asm.title)}
                            disabled={isRequestingThis}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-lg text-xs shadow-xs transition-all flex items-center justify-center gap-2 touch-sensor-btn sensor-glow"
                          >
                            <MessageSquare className="w-4 h-4" />
                            <span>{isRequestingThis ? 'Submitting Request...' : 'Ask Teacher to Unlock Test'}</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {displayedAssessments.length === 0 && (
            <div className="bg-white dark:bg-slate-900 p-12 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto text-xl font-bold">
                🔍
              </div>
              <h3 className="font-bold text-slate-800 dark:text-white text-sm">No examinations found</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                No tests match your selected filter criteria. Try choosing &quot;All Weeks&quot; or resetting the search query.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 2: MY RESULTS HUB & TRANSCRIPTS */}
      {/* ============================================================ */}
      {activeTab === 'results_hub' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="font-black text-slate-950 dark:text-white text-sm">Verified Examination Transcripts</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Official scorecard archive with AI competency evaluations.</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Export Buttons */}
                {/* Download PDF Full Report */}
                <button
                  onClick={() => {
                    const exportHeaders = [
                      { key: 'assessmentTitle', label: 'Assessment' },
                      { key: 'dayLabel', label: 'Day / Module' },
                      { key: 'score', label: 'Score' },
                      { key: 'totalMarks', label: 'Total Marks' },
                      { key: 'percentage', label: 'Percentage' },
                      { key: 'status', label: 'Status' },
                      { key: 'submittedAt', label: 'Completion Date' },
                    ];
                    const exportData = attempts.map((a) => ({
                      assessmentTitle: a.assessmentTitle || a.assessmentId,
                      dayLabel: a.dayLabel || `Day ${a.dayId}`,
                      score: a.score,
                      totalMarks: a.totalMarks,
                      percentage: `${a.totalMarks > 0 ? Math.round((a.score / a.totalMarks) * 100) : 0}%`,
                      status: a.passed ? 'PASSED' : 'RETAKE REQUIRED',
                      submittedAt: new Date(a.submittedAt).toLocaleDateString(),
                    }));
                    downloadAsPDF(
                      exportData,
                      exportHeaders,
                      `${user.name}'s Academic Assessment Transcripts`,
                      `My_Exam_Transcripts_${new Date().toISOString().slice(0, 10)}.pdf`
                    );
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-1.5 cursor-pointer"
                  title="Download All Transcripts as PDF Report"
                >
                  <Download className="w-3.5 h-3.5" />
                  Full PDF Report
                </button>

                <button
                  onClick={() => {
                    const exportHeaders = [
                      { key: 'id', label: 'Attempt ID' },
                      { key: 'assessmentTitle', label: 'Assessment' },
                      { key: 'dayLabel', label: 'Day / Module' },
                      { key: 'score', label: 'Score' },
                      { key: 'totalMarks', label: 'Total' },
                      { key: 'percentage', label: 'Percentage' },
                      { key: 'status', label: 'Status' },
                      { key: 'submittedAt', label: 'Date' },
                    ];
                    const exportData = attempts.map((a) => ({
                      id: a.id,
                      assessmentTitle: a.assessmentTitle || a.assessmentId,
                      dayLabel: a.dayLabel || `Day ${a.dayId}`,
                      score: a.score,
                      totalMarks: a.totalMarks,
                      percentage: `${a.totalMarks > 0 ? Math.round((a.score / a.totalMarks) * 100) : 0}%`,
                      status: a.passed ? 'PASSED' : 'RETAKE',
                      submittedAt: new Date(a.submittedAt).toLocaleDateString(),
                    }));
                    downloadAsCSV(exportData, exportHeaders, `My_Exam_Transcripts_${new Date().toISOString().slice(0, 10)}.csv`);
                  }}
                  className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1.5 rounded-lg border border-emerald-200 flex items-center gap-1 cursor-pointer"
                  title="Download CSV"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  CSV
                </button>

                <button
                  onClick={() => {
                    const exportHeaders = [
                      { key: 'id', label: 'Attempt ID' },
                      { key: 'assessmentTitle', label: 'Assessment' },
                      { key: 'dayLabel', label: 'Day / Module' },
                      { key: 'score', label: 'Score' },
                      { key: 'totalMarks', label: 'Total' },
                      { key: 'percentage', label: 'Percentage' },
                      { key: 'status', label: 'Status' },
                      { key: 'submittedAt', label: 'Date' },
                    ];
                    const exportData = attempts.map((a) => ({
                      id: a.id,
                      assessmentTitle: a.assessmentTitle || a.assessmentId,
                      dayLabel: a.dayLabel || `Day ${a.dayId}`,
                      score: a.score,
                      totalMarks: a.totalMarks,
                      percentage: `${a.totalMarks > 0 ? Math.round((a.score / a.totalMarks) * 100) : 0}%`,
                      status: a.passed ? 'PASSED' : 'RETAKE',
                      submittedAt: new Date(a.submittedAt).toLocaleDateString(),
                    }));
                    downloadAsExcel(exportData, exportHeaders, 'Student Transcripts', `My_Exam_Transcripts_${new Date().toISOString().slice(0, 10)}.xls`);
                  }}
                  className="bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold px-2.5 py-1.5 rounded-lg border border-teal-200 flex items-center gap-1 cursor-pointer"
                  title="Download Excel"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-teal-600" />
                  Excel
                </button>

                <button
                  onClick={() => {
                    const exportHeaders = [
                      { key: 'id', label: 'Attempt ID' },
                      { key: 'assessmentTitle', label: 'Assessment' },
                      { key: 'dayLabel', label: 'Day / Module' },
                      { key: 'score', label: 'Score' },
                      { key: 'totalMarks', label: 'Total' },
                      { key: 'percentage', label: 'Percentage' },
                      { key: 'status', label: 'Status' },
                      { key: 'submittedAt', label: 'Date' },
                    ];
                    const exportData = attempts.map((a) => ({
                      id: a.id,
                      assessmentTitle: a.assessmentTitle || a.assessmentId,
                      dayLabel: a.dayLabel || `Day ${a.dayId}`,
                      score: a.score,
                      totalMarks: a.totalMarks,
                      percentage: `${a.totalMarks > 0 ? Math.round((a.score / a.totalMarks) * 100) : 0}%`,
                      status: a.passed ? 'PASSED' : 'RETAKE',
                      submittedAt: new Date(a.submittedAt).toLocaleDateString(),
                    }));
                    downloadAsWordDoc(exportData, exportHeaders, 'Student Transcript Summary', `My_Exam_Transcripts_${new Date().toISOString().slice(0, 10)}.doc`);
                  }}
                  className="bg-indigo-50 hover:bg-indigo-100 text-indigo-800 text-xs font-bold px-2.5 py-1.5 rounded-lg border border-indigo-200 flex items-center gap-1 cursor-pointer"
                  title="Download Word Document"
                >
                  <FileText className="w-3.5 h-3.5 text-indigo-600" />
                  Word
                </button>

                <button
                  onClick={() => {
                    downloadAsJSON(attempts, `My_Exam_Transcripts_${new Date().toISOString().slice(0, 10)}.json`);
                  }}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-2.5 py-1.5 rounded-lg border border-slate-300 flex items-center gap-1 cursor-pointer"
                  title="Download JSON"
                >
                  <Download className="w-3.5 h-3.5 text-slate-600" />
                  JSON
                </button>

                <button
                  onClick={() => window.print()}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-2.5 py-1.5 rounded-lg border border-slate-300 flex items-center gap-1 cursor-pointer"
                  title="Print / Save PDF"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-600" />
                  Print / PDF
                </button>

                <div className="relative w-full sm:w-48">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2" />
                  <input
                    type="text"
                    placeholder="Filter..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 pl-9 pr-4 py-1.5 rounded-lg border border-slate-200 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase font-mono">
                    <th className="py-2.5 px-3">Examination</th>
                    <th className="py-2.5 px-3">Day / Module</th>
                    <th className="py-2.5 px-3">Score</th>
                    <th className="py-2.5 px-3">Verdict</th>
                    <th className="py-2.5 px-3">Completed At</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {attempts
                    .filter((att) => {
                      const title = (att.assessmentTitle || att.assessmentId || '').toLowerCase();
                      const dayTag = (att.dayLabel || '').toLowerCase();
                      return title.includes(searchQuery.toLowerCase()) || dayTag.includes(searchQuery.toLowerCase());
                    })
                    .map((att) => (
                      <tr key={att.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all text-slate-950 dark:text-slate-100">
                        <td className="py-3 px-3 font-semibold">{att.assessmentTitle || att.assessmentId}</td>
                        <td className="py-3 px-3 font-mono font-bold text-indigo-700">{att.dayLabel || `Day ${att.dayId}`}</td>
                        <td className="py-3 px-3 font-mono font-bold">
                          {att.score} / {att.totalMarks} ({att.totalMarks > 0 ? Math.round((att.score / att.totalMarks) * 100) : 0}%)
                        </td>
                        <td className="py-3 px-3">
                          {att.passed ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200 font-mono">
                              <CheckCircle2 className="w-3 h-3" /> PASSED
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200 font-mono">
                              <AlertCircle className="w-3 h-3" /> RETAKE REQUIRED
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">
                          {new Date(att.submittedAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => downloadIndividualStudentScorecardPDF(att)}
                              className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold px-2 py-1 rounded-lg text-[11px] inline-flex items-center gap-1 border border-indigo-200 transition-all cursor-pointer"
                              title="Download Scorecard PDF"
                            >
                              <Download className="w-3 h-3 text-indigo-600" /> PDF
                            </button>
                            <button
                              onClick={() => setSelectedAttemptForView(att)}
                              className="bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold px-2.5 py-1 rounded-lg text-[11px] inline-flex items-center gap-1 border border-slate-200 transition-all cursor-pointer"
                            >
                              <Eye className="w-3 h-3" /> View
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                  {attempts.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-400 text-xs">
                        No exam attempts recorded yet. Take an unlocked test in the Exam Catalog!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Transcript Modal */}
      {selectedAttemptForView && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 space-y-5 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-indigo-600 uppercase tracking-wider">
                  OFFICIAL COMPETENCY SCORECARD
                </span>
                <h3 className="text-lg font-black text-slate-950 dark:text-white">Verified Examination Transcript</h3>
              </div>
              <button
                onClick={() => setSelectedAttemptForView(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                <div>
                  <h4 className="text-sm font-black text-slate-900">{selectedAttemptForView.userName || user.name}</h4>
                  <p className="text-xs text-slate-500 font-mono">{selectedAttemptForView.userEmail || user.email}</p>
                </div>
                <div className="text-right font-mono">
                  <span className="text-[10px] text-slate-400 uppercase block font-bold">OUTCOME</span>
                  <span className={`text-xs font-bold ${selectedAttemptForView.passed ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {selectedAttemptForView.passed ? 'PASSED & CERTIFIED' : 'RETAKE REQUIRED'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div>
                  <span className="text-slate-400 block text-[10px]">EXAMINATION</span>
                  <span className="font-bold text-slate-900">{selectedAttemptForView.assessmentTitle}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">OBTAINED SCORE</span>
                  <span className="font-bold text-indigo-600 text-sm">
                    {selectedAttemptForView.score} / {selectedAttemptForView.totalMarks} Marks
                  </span>
                </div>
              </div>

              <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs italic font-serif text-slate-700">
                &quot;{selectedAttemptForView.aiAnalysis}&quot;
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => downloadIndividualStudentScorecardPDF(selectedAttemptForView)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-3.5 py-1.5 rounded-lg text-xs transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                  title="Download Official Scorecard as PDF"
                >
                  <Download className="w-3.5 h-3.5" /> Download Result PDF
                </button>

                <button
                  onClick={() => window.print()}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-1.5 rounded-lg text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" /> Print
                </button>
              </div>

              <button
                onClick={() => setSelectedAttemptForView(null)}
                className="text-xs font-bold text-slate-500 hover:text-slate-900 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

