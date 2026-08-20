import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Upload,
  CheckSquare,
  Award,
  Users,
  Lock,
  Unlock,
  AlertCircle,
  Clock,
  Calendar,
  FileText,
  Search,
  CheckCircle2,
  XCircle,
  Eye,
  Send,
  Mail,
  Printer,
  Download,
  BookOpen,
  MessageSquare,
  HelpCircle,
  LayoutDashboard,
  ShieldCheck,
  Zap,
  Trash2,
  Edit3,
  BarChart3,
  TrendingUp,
  X,
  Mic,
  Volume2,
  Bell,
  UserCheck,
  UserX,
  Filter,
  Plus,
  Play,
  ArrowRight,
} from 'lucide-react';
import {
  Assessment,
  AssessmentAttempt,
  User,
  UnlockRequest,
  CourseMaterial,
  AttendanceRecord,
  Announcement,
} from '../types';
import { safeFetchJson } from '../lib/api';
import { DocumentInspectorModal } from '../components/DocumentInspectorModal';

interface TeacherDashboardPageProps {
  user: User;
  documents?: any[];
  onUploadDocument?: any;
  onNavigate: (page: string) => void;
  onPreloadMaterialForExam?: (mat: CourseMaterial) => void;
}

interface AttemptWithMeta extends AssessmentAttempt {
  assessmentTitle?: string;
  userName?: string;
  userEmail?: string;
  dayLabel?: string;
}

export const TeacherDashboardPage: React.FC<TeacherDashboardPageProps> = ({
  user,
  onNavigate,
  onPreloadMaterialForExam,
}) => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'materials' | 'attendance' | 'announcements' | 'students' | 'unlock_matrix'
  >('overview');

  // Master Data
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [attempts, setAttempts] = useState<AttemptWithMeta[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [faculty, setFaculty] = useState<any[]>([]);
  const [unlockRequests, setUnlockRequests] = useState<UnlockRequest[]>([]);
  const [materials, setMaterials] = useState<CourseMaterial[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [resultsSummary, setResultsSummary] = useState({
    totalAttempts: 0,
    passedCount: 0,
    failedCount: 0,
    passRate: 0,
    avgScore: 0,
    lockedCount: 0,
    releasedCount: 0,
  });

  // Filters & Status
  const [searchQuery, setSearchQuery] = useState('');
  const [attendanceWeekFilter, setAttendanceWeekFilter] = useState<string>('all');
  const [attendanceDayFilter, setAttendanceDayFilter] = useState<string>('all');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [unlockLoading, setUnlockLoading] = useState<boolean>(false);
  const [approvingRequestId, setApprovingRequestId] = useState<string | null>(null);

  // Document Inspector Modal State
  const [inspectModalDocId, setInspectModalDocId] = useState<string | null>(null);
  const [inspectModalMaterial, setInspectModalMaterial] = useState<CourseMaterial | null>(null);

  // File Upload Form State
  const [materialTitle, setMaterialTitle] = useState('');
  const [materialNotes, setMaterialNotes] = useState('');
  const [materialWeek, setMaterialWeek] = useState(1);
  const [materialDay, setMaterialDay] = useState(1);
  const [materialTopic, setMaterialTopic] = useState('Performance Systems');
  const [materialFile, setMaterialFile] = useState<{ name: string; content: string } | null>(null);
  const [isUploadingMaterial, setIsUploadingMaterial] = useState(false);

  // New Announcement Form State
  const [annTitle, setAnnTitle] = useState('');
  const [annMessage, setAnnMessage] = useState('');
  const [annWeek, setAnnWeek] = useState(1);
  const [annDay, setAnnDay] = useState(1);
  const [annExamId, setAnnExamId] = useState('');
  const [annIsLiveExam, setAnnIsLiveExam] = useState(true);

  useEffect(() => {
    fetchTeacherData();
  }, []);

  const fetchTeacherData = async () => {
    const token = localStorage.getItem('ts_token');
    try {
      const [
        resAssessments,
        resResults,
        resUnlockReqs,
        resMaterials,
        resAttendance,
        resAnnouncements,
        resStudents,
        resFaculty,
      ] = await Promise.all([
        safeFetchJson<{ assessments: Assessment[] }>('/api/assessments', {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        }),
        safeFetchJson<{ attempts: AttemptWithMeta[]; summary: any }>('/api/teacher/results', {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        }),
        safeFetchJson<{ requests: UnlockRequest[] }>('/api/teacher/unlock-requests', {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        }),
        safeFetchJson<{ materials: CourseMaterial[] }>('/api/materials', {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        }),
        safeFetchJson<{ attendance: AttendanceRecord[] }>('/api/attendance', {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        }),
        safeFetchJson<{ announcements: Announcement[] }>('/api/announcements', {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        }),
        safeFetchJson<{ students: any[] }>('/api/roster/students', {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        }),
        safeFetchJson<{ faculty: any[] }>('/api/roster/faculty', {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        }),
      ]);

      if (resAssessments.ok && resAssessments.data?.assessments) setAssessments(resAssessments.data.assessments);
      if (resResults.ok && resResults.data?.attempts) {
        setAttempts(resResults.data.attempts);
        if (resResults.data.summary) setResultsSummary(resResults.data.summary);
      }
      if (resUnlockReqs.ok && resUnlockReqs.data?.requests) setUnlockRequests(resUnlockReqs.data.requests);
      if (resMaterials.ok && resMaterials.data?.materials) setMaterials(resMaterials.data.materials);
      if (resAttendance.ok && resAttendance.data?.attendance) setAttendance(resAttendance.data.attendance);
      if (resAnnouncements.ok && resAnnouncements.data?.announcements) setAnnouncements(resAnnouncements.data.announcements);
      if (resStudents.ok && resStudents.data?.students) setStudents(resStudents.data.students);
      if (resFaculty.ok && resFaculty.data?.faculty) setFaculty(resFaculty.data.faculty);
    } catch (err) {
      console.error('Error loading teacher data:', err);
    }
  };

  // Upload Study Material Handler
  const handleUploadMaterial = async () => {
    if (!materialTitle.trim()) {
      setStatusMessage('⚠️ Please provide a Document Title.');
      return;
    }

    setIsUploadingMaterial(true);
    const token = localStorage.getItem('ts_token');

    try {
      const { ok, data } = await safeFetchJson<{ success: boolean; material: CourseMaterial }>('/api/materials/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: materialTitle,
          filename: materialFile ? materialFile.name : `${materialTitle.replace(/\s+/g, '_')}.pdf`,
          content: materialFile ? materialFile.content : '',
          summaryNotes: materialNotes,
          week: materialWeek,
          day: materialDay,
          topic: materialTopic,
        }),
      });

      if (ok && data?.material) {
        setMaterials((prev) => [data.material, ...prev]);
        setMaterialTitle('');
        setMaterialNotes('');
        setMaterialFile(null);
        setStatusMessage(`✅ Course Material "${data.material.title}" indexed and ready for AI exam synthesis!`);
        setTimeout(() => setStatusMessage(null), 5000);
      } else {
        setStatusMessage('⚠️ Failed to upload material.');
      }
    } catch (e: any) {
      setStatusMessage(`⚠️ Error: ${e.message}`);
    } finally {
      setIsUploadingMaterial(false);
    }
  };

  // Toggle Attendance Status
  const handleToggleAttendance = async (recordId: string) => {
    const token = localStorage.getItem('ts_token');
    try {
      const { ok, data } = await safeFetchJson<{ success: boolean; record: AttendanceRecord }>('/api/attendance/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id: recordId }),
      });

      if (ok && data?.record) {
        setAttendance((prev) => prev.map((a) => (a.id === recordId ? data.record : a)));
      }
    } catch (e) {
      console.error('Failed to toggle attendance:', e);
    }
  };

  // Switch to Exam Creator preloaded
  const handleGenerateExamFromMaterial = (mat: CourseMaterial) => {
    if (onPreloadMaterialForExam) {
      onPreloadMaterialForExam(mat);
    }
    onNavigate('exam-creator');
  };

  // Create Broadcast Announcement
  const handleCreateAnnouncement = async () => {
    if (!annTitle.trim() || !annMessage.trim()) {
      setStatusMessage('⚠️ Please provide an announcement title and message.');
      return;
    }

    const token = localStorage.getItem('ts_token');
    try {
      const { ok, data } = await safeFetchJson<{ success: boolean; announcement: Announcement }>('/api/announcements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: annTitle,
          message: annMessage,
          week: annWeek,
          day: annDay,
          assessmentId: annExamId || undefined,
          isLiveExam: annIsLiveExam,
        }),
      });

      if (ok && data?.announcement) {
        setAnnouncements((prev) => [data.announcement, ...prev]);
        setAnnTitle('');
        setAnnMessage('');
        setStatusMessage('🎉 Live broadcast announcement published to student feeds!');
        setTimeout(() => setStatusMessage(null), 4000);
      }
    } catch (e: any) {
      setStatusMessage(`⚠️ Error: ${e.message}`);
    }
  };

  // Unlock Request Approval
  const handleApproveUnlock = async (req: UnlockRequest) => {
    setApprovingRequestId(req.id);
    const token = localStorage.getItem('ts_token');
    try {
      const { ok } = await safeFetchJson(`/api/teacher/unlock-requests/${req.id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (ok) {
        setUnlockRequests((prev) =>
          prev.map((r) => (r.id === req.id ? { ...r, status: 'APPROVED' } : r))
        );
        setStatusMessage(`✅ Approved Day ${req.dayId} unlock for ${req.studentName}`);
        setTimeout(() => setStatusMessage(null), 4000);
      }
    } catch (err) {
      console.error('Failed to approve unlock request:', err);
    } finally {
      setApprovingRequestId(null);
    }
  };

  // Direct Teacher Day Unlock Override
  const handleDirectUnlock = async (userId: string, targetDayId: number) => {
    setUnlockLoading(true);
    const token = localStorage.getItem('ts_token');
    try {
      const { ok } = await safeFetchJson('/api/teacher/direct-unlock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, targetDayId }),
      });

      if (ok) {
        setStudents((prev) =>
          prev.map((s) => (s.id === userId ? { ...s, currentUnlockedDay: targetDayId } : s))
        );
        setStatusMessage(`✅ Student progressed to Day ${targetDayId}`);
        setTimeout(() => setStatusMessage(null), 4000);
      }
    } catch (err) {
      console.error('Failed direct unlock:', err);
    } finally {
      setUnlockLoading(false);
    }
  };

  // Filtered Attendance
  const filteredAttendance = attendance.filter((a) => {
    if (attendanceWeekFilter !== 'all' && a.week !== parseInt(attendanceWeekFilter, 10)) return false;
    if (attendanceDayFilter !== 'all' && a.day !== attendanceDayFilter) return false;
    return true;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner & Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
              FACULTY COMMAND CENTER
            </span>
            <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
              ASSESSMENT & CURRICULUM DASHBOARD
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">Instructor Command Dashboard</h1>
          <p className="text-xs text-slate-500">
            Monitor real-time student assessment reports, track daily attendance, manage indexed course materials, and broadcast updates.
          </p>
        </div>

        {/* Action Buttons to Dedicated Pages */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => onNavigate('exam-creator')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs flex items-center gap-2 transition-all"
          >
            <CheckSquare className="w-4 h-4" />
            + Create New Exam
          </button>
          <button
            onClick={() => onNavigate('teacher-results')}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs flex items-center gap-2 transition-all"
          >
            <Award className="w-4 h-4" />
            Manage Results ({resultsSummary.lockedCount} Pending)
          </button>
          <button
            onClick={() => onNavigate('exam-creator')}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs flex items-center gap-2 transition-all"
          >
            <Mail className="w-4 h-4" />
            Send Exam Email
          </button>
        </div>
      </div>

      {/* Global Status Message Alert */}
      {statusMessage && (
        <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl text-xs font-semibold text-indigo-900 flex items-center justify-between shadow-xs">
          <span>{statusMessage}</span>
          <button onClick={() => setStatusMessage(null)} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Sub-Navigation Tabs */}
      <div className="flex border-b border-slate-200 bg-white px-4 rounded-xl border shadow-xs gap-4 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`py-3.5 px-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'overview'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          Assessment Reports & Overview
        </button>

        <button
          onClick={() => setActiveTab('materials')}
          className={`py-3.5 px-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'materials'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4 text-purple-600" />
          Course Materials & Uploads ({materials.length})
        </button>

        <button
          onClick={() => setActiveTab('attendance')}
          className={`py-3.5 px-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'attendance'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <UserCheck className="w-4 h-4 text-emerald-600" />
          Attendance Tracking
        </button>

        <button
          onClick={() => setActiveTab('announcements')}
          className={`py-3.5 px-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'announcements'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Bell className="w-4 h-4 text-amber-500" />
          Broadcast Announcements ({announcements.length})
        </button>

        <button
          onClick={() => setActiveTab('students')}
          className={`py-3.5 px-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'students'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4 text-indigo-600" />
          Student Roster ({students.length || 5})
        </button>

        <button
          onClick={() => setActiveTab('unlock_matrix')}
          className={`py-3.5 px-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'unlock_matrix'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Unlock className="w-4 h-4 text-emerald-600" />
          Day Lock & Unlock Matrix
        </button>
      </div>

      {/* ============================================================ */}
      {/* TAB 1: OVERVIEW & ASSESSMENT REPORTS */}
      {/* ============================================================ */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase font-mono">ACTIVE STUDENTS</span>
              <div className="text-2xl font-black text-slate-900">{students.length || 5} Enrolled</div>
              <p className="text-[11px] text-slate-500">Live cohort progression</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase font-mono">CONFIGURED EXAMS</span>
              <div className="text-2xl font-black text-indigo-600">{assessments.length} / 20 Days</div>
              <p className="text-[11px] text-slate-500">Curriculum coverage</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase font-mono">PENDING SCORE RELEASES</span>
              <div className="text-2xl font-black text-amber-600">{resultsSummary.lockedCount || 0} Submissions</div>
              <p className="text-[11px] text-slate-500">Scorecards awaiting teacher release</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase font-mono">OVERALL PASS RATE</span>
              <div className="text-2xl font-black text-emerald-600">{resultsSummary.passRate || 90}% Pass</div>
              <p className="text-[11px] text-slate-500">{resultsSummary.passedCount} total passes recorded</p>
            </div>
          </div>

          {/* Quick Action Hub Banners */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div
              onClick={() => onNavigate('exam-creator')}
              className="bg-gradient-to-r from-indigo-900 to-indigo-800 text-white p-6 rounded-2xl shadow-sm space-y-3 cursor-pointer hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-white/10 text-white">
                    <CheckSquare className="w-5 h-5 text-amber-400" />
                  </span>
                  <span className="text-xs font-mono font-bold text-amber-300 uppercase">EXAM CREATION HUB</span>
                </div>
                <ArrowRight className="w-5 h-5 text-white/70 group-hover:translate-x-1 transition-transform" />
              </div>
              <h3 className="text-lg font-black">Create, Synthesize & Publish Examinations</h3>
              <p className="text-xs text-indigo-200 leading-relaxed">
                Generate questions from syllabus documents or utilize the AI Voice Assistant to synthesize oral/written tests and broadcast them live to students.
              </p>
              <div className="pt-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300 bg-white/10 px-3 py-1.5 rounded-lg">
                  Launch Exam Creation Studio &rarr;
                </span>
              </div>
            </div>

            <div
              onClick={() => onNavigate('teacher-results')}
              className="bg-gradient-to-r from-purple-900 to-purple-800 text-white p-6 rounded-2xl shadow-sm space-y-3 cursor-pointer hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-white/10 text-white">
                    <Award className="w-5 h-5 text-emerald-400" />
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-300 uppercase">RESULTS & SCORECARDS HUB</span>
                </div>
                <ArrowRight className="w-5 h-5 text-white/70 group-hover:translate-x-1 transition-transform" />
              </div>
              <h3 className="text-lg font-black">Verify Submissions & Release Scorecards</h3>
              <p className="text-xs text-purple-200 leading-relaxed">
                Review student scores, release digital scorecard access (lock/unlock), export PDF transcripts, and query the AI Analytics Assistant.
              </p>
              <div className="pt-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-300 bg-white/10 px-3 py-1.5 rounded-lg">
                  Open Results Hub ({resultsSummary.lockedCount} Pending) &rarr;
                </span>
              </div>
            </div>
          </div>

          {/* Assessment Reports & Recent Submissions Table */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-indigo-600" />
                  Assessment Reports & Recent Student Submissions
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Live log of student evaluations, scores, and pass/fail telemetry.
                </p>
              </div>

              <button
                onClick={() => onNavigate('teacher-results')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                View Full Results Hub &rarr;
              </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 font-mono text-[11px] text-slate-500 uppercase">
                  <tr>
                    <th className="p-3">Student</th>
                    <th className="p-3">Exam / Module</th>
                    <th className="p-3">Score & Percentage</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Scorecard State</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {attempts.slice(0, 6).map((att) => (
                    <tr key={att.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-bold text-slate-900">{att.userName || 'Student'}</td>
                      <td className="p-3 text-slate-600">
                        <span className="font-semibold block text-slate-900">{att.assessmentTitle}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{att.dayLabel || 'Daily Exam'}</span>
                      </td>
                      <td className="p-3 font-mono font-bold text-indigo-600">
                        {att.score}/{att.totalMarks} ({Math.round((att.score / att.totalMarks) * 100)}%)
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                            att.passed
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {att.passed ? 'PASSED' : 'RETRY'}
                        </span>
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                            att.resultReleased
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {att.resultReleased ? '🔓 RELEASED' : '🔒 LOCKED'}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => onNavigate('teacher-results')}
                          className="text-indigo-600 hover:underline font-bold text-xs"
                        >
                          Manage &rarr;
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 2: COURSE MATERIALS & TEACHER UPLOAD */}
      {/* ============================================================ */}
      {activeTab === 'materials' && (
        <div className="space-y-6">
          {/* Section 1: Teacher File Upload Form */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                  <Upload className="w-5 h-5 text-indigo-600" />
                  Teacher File & Syllabus Ingestion Hub
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Upload lecture notes, PDFs, or course outlines to index them into vector memory for automated exam synthesis.
                </p>
              </div>
              <span className="text-[10px] bg-indigo-50 text-indigo-700 font-mono font-bold px-2.5 py-1 rounded-full border border-indigo-200">
                VECTOR INDEX READY
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Document Title *</label>
                <input
                  type="text"
                  value={materialTitle}
                  onChange={(e) => setMaterialTitle(e.target.value)}
                  placeholder="e.g. Chapter 1: Performance Management Frameworks"
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Target Schedule</label>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={materialWeek}
                    onChange={(e) => setMaterialWeek(parseInt(e.target.value, 10))}
                    className="text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  >
                    <option value={1}>Week 1</option>
                    <option value={2}>Week 2</option>
                    <option value={3}>Week 3</option>
                    <option value={4}>Week 4</option>
                  </select>
                  <select
                    value={materialDay}
                    onChange={(e) => setMaterialDay(parseInt(e.target.value, 10))}
                    className="text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  >
                    <option value={1}>Day 1 (Mon)</option>
                    <option value={2}>Day 2 (Tue)</option>
                    <option value={3}>Day 3 (Wed)</option>
                    <option value={4}>Day 4 (Thu)</option>
                    <option value={5}>Day 5 (Fri)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Select File (PDF / DOC / TXT)</label>
                <input
                  type="file"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      const reader = new FileReader();
                      reader.onload = (evt) => {
                        setMaterialFile({ name: f.name, content: (evt.target?.result as string) || '' });
                      };
                      reader.readAsText(f);
                    }
                  }}
                  className="w-full text-xs p-1.5 bg-slate-50 border border-slate-300 rounded-xl file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Key Summary Notes & Core Objectives</label>
              <textarea
                value={materialNotes}
                onChange={(e) => setMaterialNotes(e.target.value)}
                placeholder="Paste lecture excerpts or core concepts here to guide AI exam generation..."
                rows={2}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleUploadMaterial}
                disabled={isUploadingMaterial}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs flex items-center gap-2 transition-all"
              >
                <Upload className="w-4 h-4" />
                {isUploadingMaterial ? 'Indexing Vector Document...' : 'Upload & Index Study Material'}
              </button>
            </div>
          </div>

          {/* Section 2: Collection Data (Uploaded Course Files) Panel */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-600" />
                  Collection Data • Uploaded Course Files
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Indexed academic documents available for instant AI exam generation.
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-slate-500">{materials.length} Documents</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {materials.map((mat) => (
                <div
                  key={mat.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3 flex flex-col justify-between hover:border-indigo-300 transition-all"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                        WEEK {mat.week} DAY {mat.day}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{mat.fileSize || '1.4 MB'}</span>
                    </div>
                    <h4 className="text-xs font-black text-slate-900">{mat.title}</h4>
                    <p className="text-[11px] text-slate-500 font-mono truncate">{mat.filename}</p>
                    <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-2">
                      {mat.summary}
                    </p>
                  </div>

                  {/* 4 Telemetry Metrics */}
                  <div className="grid grid-cols-4 gap-1 text-center bg-white p-1.5 rounded-lg border border-slate-200/60 text-[10px] font-mono">
                    <div>
                      <span className="text-slate-400 block text-[9px]">Chunks</span>
                      <span className="font-bold text-indigo-600">{mat.chunkCount || 4}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px]">Lines</span>
                      <span className="font-bold text-blue-600">{mat.lineCount || 240}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px]">Words</span>
                      <span className="font-bold text-emerald-600">{mat.wordCount ? `${Math.round(mat.wordCount / 1000)}k` : '3k'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px]">Visuals</span>
                      <span className="font-bold text-amber-600">{mat.pictureCount || 3}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-2">
                    <button
                      onClick={() => {
                        setInspectModalDocId(mat.id);
                        setInspectModalMaterial(mat);
                      }}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1.5 rounded-lg border border-indigo-200 flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Inspect Chunks
                    </button>

                    <button
                      onClick={() => handleGenerateExamFromMaterial(mat)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      Generate Exam &rarr;
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 3: ATTENDANCE TRACKING */}
      {/* ============================================================ */}
      {activeTab === 'attendance' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-emerald-600" />
                Student Attendance Tracking (Monday – Friday)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Live attendance ledger across Weeks 1 to 4. Click status tags to toggle (Present &rarr; Absent &rarr; Late).
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={attendanceWeekFilter}
                onChange={(e) => setAttendanceWeekFilter(e.target.value)}
                className="text-xs p-2 bg-slate-50 border border-slate-300 rounded-xl"
              >
                <option value="all">All Weeks</option>
                <option value="1">Week 1</option>
                <option value="2">Week 2</option>
                <option value="3">Week 3</option>
                <option value="4">Week 4</option>
              </select>

              <select
                value={attendanceDayFilter}
                onChange={(e) => setAttendanceDayFilter(e.target.value)}
                className="text-xs p-2 bg-slate-50 border border-slate-300 rounded-xl"
              >
                <option value="all">All Days (Mon–Fri)</option>
                <option value="Monday">Monday</option>
                <option value="Tuesday">Tuesday</option>
                <option value="Wednesday">Wednesday</option>
                <option value="Thursday">Thursday</option>
                <option value="Friday">Friday</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 font-mono text-[11px] text-slate-500 uppercase">
                <tr>
                  <th className="p-3">Student Name</th>
                  <th className="p-3">Curriculum Schedule</th>
                  <th className="p-3">Date</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-right">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAttendance.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 font-bold text-slate-900">{rec.studentName}</td>
                    <td className="p-3 font-mono text-slate-600">
                      Week {rec.week} • {rec.day}
                    </td>
                    <td className="p-3 text-slate-500 font-mono">{rec.date}</td>
                    <td className="p-3 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-mono font-bold inline-block ${
                          rec.status === 'Present'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : rec.status === 'Absent'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {rec.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleToggleAttendance(rec.id)}
                        className="text-indigo-600 hover:text-indigo-800 hover:underline font-bold text-xs"
                      >
                        Change Status &rarr;
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 4: BROADCAST ANNOUNCEMENTS */}
      {/* ============================================================ */}
      {activeTab === 'announcements' && (
        <div className="space-y-6">
          {/* Post Announcement Form */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <Bell className="w-5 h-5 text-amber-500" />
              Publish Broadcast Announcement to Students
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Announcement Title</label>
                <input
                  type="text"
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  placeholder="e.g. Day 3 Oral Examination is Now Live!"
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Target Schedule</label>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={annWeek}
                    onChange={(e) => setAnnWeek(parseInt(e.target.value, 10))}
                    className="text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  >
                    <option value={1}>Week 1</option>
                    <option value={2}>Week 2</option>
                    <option value={3}>Week 3</option>
                    <option value={4}>Week 4</option>
                  </select>
                  <select
                    value={annDay}
                    onChange={(e) => setAnnDay(parseInt(e.target.value, 10))}
                    className="text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  >
                    <option value={1}>Day 1</option>
                    <option value={2}>Day 2</option>
                    <option value={3}>Day 3</option>
                    <option value={4}>Day 4</option>
                    <option value={5}>Day 5</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Link Assessment (Optional)</label>
                <select
                  value={annExamId}
                  onChange={(e) => setAnnExamId(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                >
                  <option value="">-- No Direct Exam Link --</option>
                  {assessments.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Broadcast Message Body</label>
              <textarea
                value={annMessage}
                onChange={(e) => setAnnMessage(e.target.value)}
                placeholder="Type the message that will be shown to students..."
                rows={2}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleCreateAnnouncement}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs px-5 py-2.5 rounded-xl shadow-xs flex items-center gap-2 transition-all"
              >
                <Send className="w-4 h-4 text-slate-950" />
                Publish Live Announcement
              </button>
            </div>
          </div>

          {/* Existing Announcements List */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900">Active Student Broadcasts</h3>
            <div className="space-y-3">
              {announcements.map((ann) => (
                <div key={ann.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900">{ann.title}</span>
                    <span className="text-[10px] font-mono text-slate-400">
                      Week {ann.week} Day {ann.day} • {new Date(ann.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{ann.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 5: STUDENT ROSTER */}
      {/* ============================================================ */}
      {activeTab === 'students' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                Enrolled Student Roster ({students.length || 5})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Complete student cohort directory with unlocked day milestones.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 font-mono text-[11px] text-slate-500 uppercase">
                <tr>
                  <th className="p-3">Student Name & ID</th>
                  <th className="p-3">Email Address</th>
                  <th className="p-3">Department</th>
                  <th className="p-3">Current Unlocked Day</th>
                  <th className="p-3 text-right">Direct Override</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 font-bold text-slate-900">
                      <div>{s.name}</div>
                      <span className="text-[10px] text-slate-400 font-mono">{s.studentId || 'TS-STD-001'}</span>
                    </td>
                    <td className="p-3 text-slate-600 font-mono">{s.email}</td>
                    <td className="p-3 text-slate-600">{s.department || 'Computer Science & HR Systems'}</td>
                    <td className="p-3 font-mono font-bold text-indigo-600">
                      Day {s.currentUnlockedDay || 1} of 20
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleDirectUnlock(s.id, Math.max(0, (s.currentUnlockedDay || 1) - 1))}
                          disabled={unlockLoading || (s.currentUnlockedDay || 1) <= 0}
                          className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-md text-[11px] font-bold transition-all disabled:opacity-40"
                          title="Lock previous day"
                        >
                          -1 Lock
                        </button>
                        <button
                          onClick={() => handleDirectUnlock(s.id, Math.min(20, (s.currentUnlockedDay || 1) + 1))}
                          disabled={unlockLoading || (s.currentUnlockedDay || 1) >= 20}
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-md text-[11px] font-bold transition-all disabled:opacity-40"
                          title="Unlock next day"
                        >
                          +1 Unlock &rarr;
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 6: DAY LOCK & UNLOCK MATRIX */}
      {/* ============================================================ */}
      {activeTab === 'unlock_matrix' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <Unlock className="w-5 h-5 text-emerald-600" />
                Student Day Unlock & Request Approval Matrix
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Review student unlock assistance requests and override daily curriculum gating.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 font-mono text-[11px] text-slate-500 uppercase">
                <tr>
                  <th className="p-3">Student</th>
                  <th className="p-3">Requested Target Day</th>
                  <th className="p-3">Reason</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {unlockRequests.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-xs text-slate-500">
                      No pending unlock requests from students.
                    </td>
                  </tr>
                ) : (
                  unlockRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-bold text-slate-900">{req.studentName}</td>
                      <td className="p-3 font-mono font-bold text-indigo-600">Day {req.dayId}</td>
                      <td className="p-3 text-slate-600 max-w-xs truncate">{req.message || 'Course advancement request'}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                            req.status === 'APPROVED'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {req.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        {req.status === 'PENDING' ? (
                          <button
                            onClick={() => handleApproveUnlock(req)}
                            disabled={approvingRequestId === req.id}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow-xs transition-all"
                          >
                            Approve Unlock
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400">Approved</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DOCUMENT INSPECTOR MODAL */}
      {inspectModalDocId && (
        <DocumentInspectorModal
          documentId={inspectModalDocId}
          material={inspectModalMaterial}
          onClose={() => {
            setInspectModalDocId(null);
            setInspectModalMaterial(null);
          }}
          onCreateExam={(mat) => handleGenerateExamFromMaterial(mat)}
          onAskAI={(mat) => onNavigate('chatbot', { targetDay: mat.day, targetWeek: mat.week })}
        />
      )}
    </div>
  );
};
