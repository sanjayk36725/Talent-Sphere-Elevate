export type Role = 'STUDENT' | 'TEACHER' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  isVerified: boolean;
  twoFactorEnabled: boolean;
  verificationToken?: string;
  resetToken?: string;
  otpCode?: string;
  otpExpiresAt?: number;
  currentUnlockedDay: number; // e.g. Day 1, Day 2, Day 3...
  createdAt: string;
}

export interface StudentProfile {
  userId: string;
  college: string;
  degree: string;
  department: string;
  year: string;
  cgpa: number;
  skills: { name: string; level: 'Beginner' | 'Intermediate' | 'Advanced'; score: number }[];
  interests: string[];
  projects: Project[];
  certificates: Certificate[];
  careerGoal: string;
  targetRole: string;
  learningStreak: number;
  publicPortfolio: boolean;
  bio?: string;
  phone?: string;
  location?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  githubUrl?: string;
  demoUrl?: string;
}

export interface Certificate {
  id: string;
  name: string;
  issuer: string;
  date: string;
  url?: string;
}

export interface DocumentItem {
  id: string;
  filename: string;
  fileType: string;
  ownerId: string;
  uploadedBy: string;
  courseId: string;
  dayId: number; // Global Day sequence: 1, 2, 3, 4, 5...
  weekId?: number; // e.g. Week 1, Week 2...
  dayLabel?: string; // e.g. "Week 1 Day 1"
  category: string;
  status: 'Processing' | 'Completed' | 'Failed';
  pageCount: number;
  vectorChunkCount: number;
  accessLevel: 'public' | 'unlocked_students' | 'teacher_only';
  uploadDate: string;
}

export interface DocumentChunk {
  id: string;
  documentId: string;
  docName: string;
  dayId: number;
  weekId?: number;
  dayLabel?: string;
  pageNumber: number;
  content: string;
  accessLevel: string;
  courseId: string;
  ownerId: string;
}

export interface Question {
  id: string;
  text: string;
  options?: string[];
  correctAnswer: string | number;
  type: 'MCQ' | 'TRUE_FALSE' | 'SHORT_ANSWER';
  marks: number;
}

export interface Assessment {
  id: string;
  title: string;
  description: string;
  subject: string;
  courseId: string;
  dayId: number;
  weekId?: number;
  dayLabel?: string; // e.g. "Week 1 Day 1 (Mon)"
  difficulty: 'Easy' | 'Medium' | 'Hard';
  durationMinutes: number;
  totalMarks: number;
  passingMarks: number;
  questions: Question[];
  attemptLimit: number;
  isPublished?: boolean; // Announced & published to students
  status?: 'Draft' | 'Published' | 'Archived';
  attachedFileName?: string;
  announcedAt?: string;
}

export interface AssessmentAttempt {
  id: string;
  assessmentId: string;
  assessmentTitle?: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  dayId?: number;
  weekId?: number;
  dayLabel?: string;
  score: number;
  totalMarks: number;
  passed: boolean;
  answers: Record<string, string | number>;
  aiAnalysis?: string;
  submittedAt: string;
  resultReleased?: boolean; // When false, result is locked for student until teacher unlocks it
  releasedAt?: string;
}

export interface CourseModule {
  id: string;
  dayId: number; // Day 1, Day 2...
  weekId?: number; // Week 1, Week 2...
  dayLabel?: string; // "Week 1 Day 1"
  title: string;
  description: string;
  lessons: { id: string; title: string; content: string; duration: string }[];
  documents: DocumentItem[];
  assessmentId?: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  instructor: string;
  thumbnail: string;
  modules: CourseModule[];
  enrolledCount: number;
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  unlockedDay: number;
  completedLessons: string[];
  enrolledAt: string;
  lastActivity: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'email' | 'system' | 'security' | 'unlock' | 'assessment';
  readStatus: boolean;
  createdAt: string;
}

export interface UnlockRequest {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  dayId: number;
  weekId?: number;
  dayLabel?: string;
  assessmentId?: string;
  assessmentTitle?: string;
  message?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requestedAt: string;
  approvedAt?: string;
  approvedBy?: string;
}

export interface EmailLog {
  id: string;
  emailType: string;
  recipient: string;
  subject: string;
  status: 'SENT' | 'FAILED' | 'QUEUED';
  sentAt: string;
  error?: string;
}

export interface ESMTPConfig {
  host: string;
  port: number;
  security: 'STARTTLS' | 'SSL' | 'NONE';
  authMethod: 'LOGIN' | 'PLAIN' | 'CRAM-MD5' | 'NONE';
  username: string;
  password?: string;
  fromName: string;
  fromEmail: string;
  ehloName: string;
  timeoutSeconds: number;
  enableDebugLogs: boolean;
  extensions: {
    eightBitMime: boolean;
    smtpUtf8: boolean;
    pipelining: boolean;
    dsn: boolean;
    sizeLimitMb: number;
  };
}

export interface ESMTPTestResult {
  success: boolean;
  message: string;
  handshakeLogs: string[];
  latencyMs: number;
  capabilitiesDetected: string[];
  sentMessageId?: string;
}

export interface SecurityEvent {
  id: string;
  userId: string;
  eventType: string;
  ip: string;
  details: string;
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  sources?: DocumentChunk[];
  ocrText?: string;
}

export interface CareerRecommendation {
  targetRole: string;
  matchPercentage: number;
  requiredSkills: string[];
  skillGaps: string[];
  roadmapPhases: { phase: number; title: string; description: string; duration: string }[];
  recommendedProjects: string[];
  suggestedCertifications: string[];
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  studentUniqueId: string;
  department: string;
  week: number;
  day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri';
  scheduleLabel: string;
  status: 'Present' | 'Absent' | 'Late';
  updatedAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  createdBy: string;
  creatorRole?: string;
  targetWeek: number;
  targetDay: number;
  dayLabel: string;
  examId?: string;
  examTitle?: string;
  topic?: string;
  isLiveExam?: boolean;
  createdAt: string;
}

export interface MockInterview {
  id: string;
  studentId: string;
  studentName: string;
  targetWeek: number;
  resumeFilename: string;
  overallScore: number;
  communicationScore: number;
  technicalDepthScore: number;
  confidenceScore: number;
  summaryText: string;
  questionsAnsweredCount: number;
  totalQuestions: number;
  completedAt: string;
}

export interface DocumentPicture {
  id: string;
  title: string;
  type: 'diagram' | 'chart' | 'photo' | 'table' | 'screenshot';
  pageNumber?: number;
  caption: string;
  previewUrl?: string;
}

export interface CourseMaterial {
  id: string;
  title: string;
  filename: string;
  fileType: string;
  fileSize: string;
  summary: string;
  uploadedBy: string;
  uploadedAt: string;
  week: number;
  day: number;
  topic: string;
  status: 'Ready' | 'Processing';
  chunkCount?: number;
  lineCount?: number;
  wordCount?: number;
  pictureCount?: number;
  pictures?: DocumentPicture[];
  rawContent?: string;
  chunks?: DocumentChunk[];
}

export interface DocumentBreakdown {
  id: string;
  title: string;
  filename: string;
  fileType: string;
  fileSize: string;
  summary: string;
  uploadedBy: string;
  uploadedAt: string;
  week: number;
  day: number;
  dayLabel: string;
  topic: string;
  chunkCount: number;
  lineCount: number;
  wordCount: number;
  pictureCount: number;
  pictures: DocumentPicture[];
  chunks: DocumentChunk[];
  rawContent: string;
}
