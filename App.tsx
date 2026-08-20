import React, { useState, useEffect } from 'react';
import { User, StudentProfile, Course, Assessment, AssessmentAttempt, DocumentItem, NotificationItem } from './types';
import { ThemeProvider } from './context/ThemeContext';
import { ThemeSelectorModal } from './components/ThemeSelectorModal';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { StudentDashboardPage } from './pages/StudentDashboardPage';
import { TeacherDashboardPage } from './pages/TeacherDashboardPage';
import { SendExamEmailPage } from './pages/SendExamEmailPage';
import { ExamCreatorPage } from './pages/ExamCreatorPage';
import { TeacherResultsHubPage } from './pages/TeacherResultsHubPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { CourseDetailPage } from './pages/CourseDetailPage';
import { AssessmentsPage } from './pages/AssessmentsPage';
import { SkillsPage } from './pages/SkillsPage';
import { CareerPage } from './pages/CareerPage';
import { MockInterviewPage } from './pages/MockInterviewPage';
import { Chatbot } from './components/Chatbot';
import { PortfolioPage } from './pages/PortfolioPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { SecuritySettingsPage } from './pages/SecuritySettingsPage';
import { AscentCurriculumPage } from './pages/AscentCurriculumPage';
import { safeFetchJson } from './lib/api';
import { Shield } from 'lucide-react';

function AppContent() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [attempts, setAttempts] = useState<AssessmentAttempt[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [currentPage, setCurrentPage] = useState<string>('login');
  const [chatbotParams, setChatbotParams] = useState<{ targetDay?: number; targetWeek?: number }>({});
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [preloadedMaterialForExam, setPreloadedMaterialForExam] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const [publicPortfolioData, setPublicPortfolioData] = useState<{ user: { name: string; role: string }; profile: any } | null>(null);
  const [publicPortfolioError, setPublicPortfolioError] = useState<string | null>(null);

  const fetchPublicPortfolio = async (userId: string) => {
    setLoading(true);
    try {
      const { ok, data } = await safeFetchJson<{ user: { name: string; role: string }; profile: any }>(`/api/portfolio/${userId}`);
      if (ok && data) {
        setPublicPortfolioData(data);
        setPublicPortfolioError(null);
        setCurrentPage('public-portfolio');
      } else {
        setPublicPortfolioError((data as any)?.error || 'This portfolio is private or does not exist.');
        setCurrentPage('public-portfolio');
      }
    } catch (err: any) {
      console.error('Failed to fetch public portfolio:', err);
      setPublicPortfolioError('Error loading portfolio.');
      setCurrentPage('public-portfolio');
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = (page: string, params?: { targetDay?: number; targetWeek?: number }) => {
    if (page === 'chatbot' && params) {
      setChatbotParams(params);
    }
    if (page !== 'public-portfolio') {
      window.history.pushState({}, '', '/');
    }
    setCurrentPage(page);
  };

  // Initialize and check active session
  useEffect(() => {
    const match = window.location.pathname.match(/\/portfolio\/([^/]+)/);
    if (match) {
      const pUserId = match[1];
      fetchPublicPortfolio(pUserId);
    } else {
      fetchInitialData();
    }
  }, []);

  const fetchInitialData = async () => {
    const token = localStorage.getItem('ts_token');
    try {
      if (token) {
        const { ok, data: userData } = await safeFetchJson<{ user: User; profile: StudentProfile }>('/api/users/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (ok && userData?.user) {
          setUser(userData.user);
          setProfile(userData.profile || null);
          setCurrentPage(
            userData.user.role === 'ADMIN'
              ? 'admin-dashboard'
              : userData.user.role === 'TEACHER'
              ? 'teacher-dashboard'
              : 'dashboard'
          );
        } else {
          setCurrentPage('login');
        }
      } else {
        setCurrentPage('login');
      }

      // Fetch global catalog data
      const [resC, resA, resD] = await Promise.all([
        safeFetchJson<{ courses: Course[] }>('/api/courses'),
        safeFetchJson<{ assessments: Assessment[]; attempts?: AssessmentAttempt[] }>('/api/assessments', {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        }),
        safeFetchJson<{ documents: DocumentItem[] }>('/api/documents', {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        }),
      ]);

      if (resC.ok && resC.data?.courses) {
        setCourses(resC.data.courses);
        if (resC.data.courses.length > 0) setSelectedCourse(resC.data.courses[0]);
      }
      if (resA.ok && resA.data?.assessments) {
        setAssessments(resA.data.assessments);
        if (resA.data.attempts) setAttempts(resA.data.attempts);
      }
      if (resD.ok && resD.data?.documents) {
        setDocuments(resD.data.documents);
      }

      if (token) {
        const { ok, data: nData } = await safeFetchJson<{ notifications: NotificationItem[] }>('/api/notifications', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (ok && nData?.notifications) {
          setNotifications(nData.notifications);
        }
      }
    } catch (err) {
      console.error('Failed to load platform state:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = (loggedInUser: User, token: string) => {
    setUser(loggedInUser);
    fetchInitialData();
  };

  const handleLogout = () => {
    localStorage.removeItem('ts_token');
    setUser(null);
    setProfile(null);
    setCurrentPage('login');
  };

  const handleUpdateProfile = async (updatedProfile: Partial<StudentProfile>, twoFactorEnabled?: boolean) => {
    const token = localStorage.getItem('ts_token');
    if (twoFactorEnabled !== undefined) {
      setUser((prev) => (prev ? { ...prev, twoFactorEnabled } : null));
    }
    try {
      const { ok, data } = await safeFetchJson<{ success: boolean; profile: StudentProfile; user?: User }>('/api/users/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ profile: updatedProfile, twoFactorEnabled }),
      });
      if (ok && data?.profile) {
        setProfile(data.profile);
      } else if (Object.keys(updatedProfile).length > 0) {
        setProfile((prev) => (prev ? { ...prev, ...updatedProfile } : (updatedProfile as StudentProfile)));
      }
      if (ok && data?.user) {
        setUser(data.user);
      }
    } catch (e) {
      console.error('Failed to update profile:', e);
      if (Object.keys(updatedProfile).length > 0) {
        setProfile((prev) => (prev ? { ...prev, ...updatedProfile } : (updatedProfile as StudentProfile)));
      }
    }
  };

  // Idempotent Day Unlock
  const handleUnlockDay = async (targetDayId: number) => {
    if (!user) return;
    const token = localStorage.getItem('ts_token');
    try {
      const { ok, data } = await safeFetchJson('/api/unlock-day', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ dayId: targetDayId, courseId: selectedCourse?.id || 'CRS_TALENT_101' }),
      });
      if (ok && data.success) {
        if (data.user) {
          setUser(data.user);
        } else {
          setUser((prev) => (prev ? { ...prev, currentUnlockedDay: targetDayId } : null));
        }
        // Refresh state
        fetchInitialData();
      }
    } catch (err) {
      console.error('Day unlock failed:', err);
    }
  };

  // Submit Assessment Answers
  const handleSubmitAssessment = async (
    assessmentId: string,
    answers: Record<string, string | number>
  ): Promise<AssessmentAttempt> => {
    const token = localStorage.getItem('ts_token');
    const { ok, data } = await safeFetchJson('/api/assessments/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ assessmentId, answers }),
    });

    if (ok && data.attempt) {
      setAttempts((prev) => [data.attempt, ...prev]);
      // Refresh user state in case Day unlocked
      fetchInitialData();
      return data.attempt;
    }
    throw new Error(data?.error || 'Assessment evaluation failed.');
  };

  // Upload Document
  const handleUploadDocument = async (
    filename: string,
    dayId: number,
    category: string,
    content: string
  ) => {
    const token = localStorage.getItem('ts_token');
    const { ok, data } = await safeFetchJson('/api/documents/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ filename, dayId, category, content }),
    });
    if (ok && data.document) {
      setDocuments((prev) => [data.document, ...prev]);
    }
  };

  // Mark notifications read
  const handleMarkAllRead = async () => {
    const token = localStorage.getItem('ts_token');
    await safeFetchJson('/api/notifications/read', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, readStatus: true })));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 flex items-center justify-center font-mono text-xs">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-indigo-600 shadow-sm animate-pulse mx-auto flex items-center justify-center font-bold text-white">
            TS
          </div>
          <p className="text-indigo-600 dark:text-indigo-400 font-medium">Booting TalentSphere Elevate Platform...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      <Navbar
        user={user}
        notifications={notifications}
        onLogout={handleLogout}
        onNavigate={handleNavigate}
        currentPage={currentPage}
      />

      <div className="flex flex-1">
        <Sidebar
          user={user}
          currentPage={currentPage}
          onNavigate={handleNavigate}
        />

        <main className="flex-1 overflow-x-hidden">
          {currentPage === 'landing' && (
            <LandingPage onNavigate={handleNavigate} />
          )}

          {currentPage === 'login' && (
            <LoginPage
              onLoginSuccess={handleLoginSuccess}
              onNavigate={handleNavigate}
            />
          )}

          {currentPage === 'register' && (
            <RegisterPage onNavigate={handleNavigate} />
          )}

          {currentPage === 'dashboard' && user && (
            <StudentDashboardPage
              user={user}
              profile={profile}
              courses={courses}
              onNavigate={handleNavigate}
              onUnlockDay={handleUnlockDay}
            />
          )}

          {currentPage === 'teacher-dashboard' && user && (
            <TeacherDashboardPage
              user={user}
              documents={documents}
              onUploadDocument={handleUploadDocument}
              onNavigate={handleNavigate}
              onPreloadMaterialForExam={(mat) => setPreloadedMaterialForExam(mat)}
            />
          )}

          {currentPage === 'exam-creator' && user && (
            <ExamCreatorPage
              user={user}
              onNavigate={handleNavigate}
              preloadedMaterial={preloadedMaterialForExam}
            />
          )}

          {currentPage === 'send-exam-email' && user && (
            <SendExamEmailPage
              user={user}
              onNavigate={handleNavigate}
            />
          )}

          {currentPage === 'teacher-results' && user && (
            <TeacherResultsHubPage
              user={user}
              onNavigate={handleNavigate}
            />
          )}

          {currentPage === 'ascent-roadmap' && user && (
            <AscentCurriculumPage
              user={user}
              onNavigate={handleNavigate}
              onUnlockDay={handleUnlockDay}
            />
          )}

          {(currentPage === 'admin-dashboard' || currentPage === 'admin-users' || currentPage === 'admin-logs') && user && (
            <AdminDashboardPage user={user} />
          )}

          {(currentPage === 'courses' || currentPage === 'course-detail') && user && selectedCourse && (
            <CourseDetailPage
              course={selectedCourse}
              user={user}
              onUnlockDay={handleUnlockDay}
              onNavigate={handleNavigate}
            />
          )}

          {currentPage === 'assessments' && user && (
            <AssessmentsPage
              user={user}
              assessments={assessments}
              attempts={attempts}
              onSubmitAssessment={handleSubmitAssessment}
              onRefreshData={fetchInitialData}
            />
          )}

          {currentPage === 'skills' && user && (
            <SkillsPage profile={profile} onNavigate={handleNavigate} />
          )}

          {currentPage === 'career' && user && (
            <CareerPage profile={profile} onNavigate={handleNavigate} />
          )}

          {(currentPage === 'mock-interview' || currentPage === 'mock_interview') && user && (
            <MockInterviewPage
              user={user}
              profile={profile}
              attempts={attempts}
              onNavigate={handleNavigate}
            />
          )}

          {currentPage === 'chatbot' && user && (
            <div className="p-6 max-w-5xl mx-auto">
              <Chatbot
                unlockedDay={user.currentUnlockedDay}
                initialTargetDay={chatbotParams.targetDay}
                initialTargetWeek={chatbotParams.targetWeek}
              />
            </div>
          )}

          {currentPage === 'portfolio' && user && (
            <PortfolioPage
              user={user}
              profile={profile}
              onUpdateProfile={handleUpdateProfile}
            />
          )}

          {currentPage === 'public-portfolio' && (
            <div className="p-6 max-w-5xl mx-auto">
              {publicPortfolioError ? (
                <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-center space-y-4 max-w-md mx-auto">
                  <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950 flex items-center justify-center mx-auto text-rose-600 dark:text-rose-400">
                    <Shield className="w-6 h-6" />
                  </div>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white">Portfolio Access Restricted</h2>
                  <p className="text-xs text-slate-500 leading-relaxed">{publicPortfolioError}</p>
                  <button
                    onClick={() => handleNavigate('login')}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-md cursor-pointer"
                  >
                    Go to Login
                  </button>
                </div>
              ) : publicPortfolioData ? (
                <PortfolioPage
                  user={null}
                  profile={null}
                  onUpdateProfile={undefined}
                  isReadOnly={true}
                  publicUser={publicPortfolioData.user}
                  publicProfile={publicPortfolioData.profile}
                />
              ) : null}
            </div>
          )}

          {currentPage === 'documents' && user && (
            <DocumentsPage
              user={user}
              documents={documents}
              onUploadDocument={handleUploadDocument}
              onNavigate={handleNavigate}
            />
          )}

          {currentPage === 'notifications' && user && (
            <NotificationsPage
              notifications={notifications}
              onMarkAllRead={handleMarkAllRead}
            />
          )}

          {currentPage === 'security' && user && (
            <SecuritySettingsPage
              user={user}
              profile={profile}
              onUpdateProfile={handleUpdateProfile}
            />
          )}
        </main>
      </div>

      {/* Global Color Theme & Secret Value Modal */}
      <ThemeSelectorModal />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
