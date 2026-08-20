import React, { useState, useEffect } from 'react';
import {
  Compass,
  Lock,
  Unlock,
  CheckCircle2,
  Sparkles,
  FileText,
  BookOpen,
  CheckSquare,
  Bot,
  Eye,
  AlertCircle,
  Clock,
  Layers,
  ChevronRight,
  ShieldCheck,
  Zap,
  Filter,
  RefreshCw,
  Search,
} from 'lucide-react';
import { User, Course, Assessment, DocumentItem, CourseMaterial } from '../types';
import { safeFetchJson } from '../lib/api';
import { DocumentInspectorModal } from '../components/DocumentInspectorModal';

interface AscentCurriculumPageProps {
  user: User;
  onNavigate: (page: string, params?: any) => void;
  onUnlockDay?: (dayId: number) => void;
}

interface CurriculumDay {
  dayId: number;
  weekId: number;
  dayInWeek: number;
  dayLabel: string;
  topic: string;
  description: string;
  learningObjectives: string[];
  documents: {
    id: string;
    filename: string;
    type: string;
    chunkCount: number;
    size: string;
    summary: string;
  }[];
  assessmentId?: string;
  assessmentTitle?: string;
  assessmentMarks?: number;
  assessmentQuestionsCount?: number;
}

export const AscentCurriculumPage: React.FC<AscentCurriculumPageProps> = ({
  user,
  onNavigate,
  onUnlockDay,
}) => {
  const isTeacher = user.role === 'TEACHER' || user.role === 'ADMIN';

  const [currentUnlockedDay, setCurrentUnlockedDay] = useState<number>(user.currentUnlockedDay || 1);
  const [selectedWeekFilter, setSelectedWeekFilter] = useState<number | 'all'>('all');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Inspector Modal State
  const [inspectDocId, setInspectDocId] = useState<string | null>(null);
  const [inspectMaterial, setInspectMaterial] = useState<CourseMaterial | null>(null);

  // Curriculum Master Definitions (20 Days / 4 Full Weeks)
  const curriculumDays: CurriculumDay[] = [
    // ===== WEEK 1: Foundations of Talent & Performance Architecture =====
    {
      dayId: 1,
      weekId: 1,
      dayInWeek: 1,
      dayLabel: 'Week 1 Day 1 (Mon)',
      topic: 'Foundations of Strategic Talent Management & OKR Frameworks',
      description: 'Introduction to enterprise performance management, cascading OKRs, organizational alignment, and baseline capability matrices.',
      learningObjectives: [
        'Understand objective & key result (OKR) architecture',
        'Learn how to avoid vanity metrics in performance appraisals',
        'Analyze baseline departmental competencies',
      ],
      documents: [
        {
          id: 'DOC_DAY1_1',
          filename: 'Talent_Sphere_Curriculum_Week1_Day1.pdf',
          type: 'pdf',
          chunkCount: 3,
          size: '1.4 MB',
          summary: 'Core syllabus on cascading enterprise goals and qualitative alignment.',
        },
      ],
      assessmentId: 'ASM_W1_D1',
      assessmentTitle: 'Week 1 Day 1 Evaluation: OKRs & Performance Architecture',
      assessmentMarks: 30,
      assessmentQuestionsCount: 3,
    },
    {
      dayId: 2,
      weekId: 1,
      dayInWeek: 2,
      dayLabel: 'Week 1 Day 2 (Tue)',
      topic: 'AI Career Pathing & Competency Ontologies',
      description: 'Building dynamic skill ontologies, automated role recommendations, vector embeddings, and learning graph topologies.',
      learningObjectives: [
        'Model skill progression hierarchies',
        'Integrate machine learning vector embeddings for talent matchmaking',
        'Define 7-phase actionable career trajectory milestones',
      ],
      documents: [
        {
          id: 'DOC_DAY2_1',
          filename: 'Talent_Sphere_Curriculum_Week1_Day2.pdf',
          type: 'pdf',
          chunkCount: 3,
          size: '1.6 MB',
          summary: 'Vector-based skill matching and dynamic competency assessment guidelines.',
        },
      ],
      assessmentId: 'ASM_W1_D2',
      assessmentTitle: 'Week 1 Day 2 Evaluation: AI Competency Ontologies',
      assessmentMarks: 30,
      assessmentQuestionsCount: 3,
    },
    {
      dayId: 3,
      weekId: 1,
      dayInWeek: 3,
      dayLabel: 'Week 1 Day 3 (Wed)',
      topic: '360° Multi-Rater Feedback & Bias Mitigation',
      description: 'Multi-rater assessment design, bias reduction algorithms, calibration protocols, and executive leadership development.',
      learningObjectives: [
        'Construct multi-angle feedback loops with confidentiality guards',
        'Synthesize qualitative feedback using generative NLP analysis',
        'Formulate constructive coaching roadmaps',
      ],
      documents: [
        {
          id: 'DOC_DAY3_1',
          filename: 'Talent_Sphere_Curriculum_Week1_Day3.pdf',
          type: 'pdf',
          chunkCount: 3,
          size: '1.2 MB',
          summary: 'Leadership evaluation metrics and 360 multi-rater feedback protocols.',
        },
      ],
      assessmentId: 'ASM_W1_D3',
      assessmentTitle: 'Week 1 Day 3 Evaluation: 360 Feedback & Bias Mitigation',
      assessmentMarks: 30,
      assessmentQuestionsCount: 3,
    },
    {
      dayId: 4,
      weekId: 1,
      dayInWeek: 4,
      dayLabel: 'Week 1 Day 4 (Thu)',
      topic: 'Talent Acquisition & Predictive AI Candidate Sourcing',
      description: 'Modern recruiting pipelines, applicant screening with OCR, skill gap forecasting, and interview rubrics.',
      learningObjectives: [
        'Automate resume parsing and skill verification with OCR',
        'Design bias-free interview scoring rubrics',
        'Implement predictive candidate tenure analysis',
      ],
      documents: [
        {
          id: 'DOC_DAY4_1',
          filename: 'Talent_Sphere_Curriculum_Week1_Day4.pdf',
          type: 'pdf',
          chunkCount: 3,
          size: '1.8 MB',
          summary: 'Predictive recruiting metrics and AI applicant scoring systems.',
        },
      ],
      assessmentId: 'ASM_W1_D4',
      assessmentTitle: 'Week 1 Day 4 Evaluation: Predictive Sourcing Systems',
      assessmentMarks: 30,
      assessmentQuestionsCount: 3,
    },
    {
      dayId: 5,
      weekId: 1,
      dayInWeek: 5,
      dayLabel: 'Week 1 Day 5 (Fri)',
      topic: 'Performance Appraisal Matrices & 9-Box Grid Calibration',
      description: 'Potential vs performance mapping, talent calibration committees, and organizational succession planning.',
      learningObjectives: [
        'Master the 9-box talent matrix calibration process',
        'Identify flight risks and high-potential future leaders',
        'Align performance distributions with organizational equity',
      ],
      documents: [
        {
          id: 'DOC_DAY5_1',
          filename: 'Talent_Sphere_Curriculum_Week1_Day5.pdf',
          type: 'pdf',
          chunkCount: 3,
          size: '1.5 MB',
          summary: '9-Box potential grids and executive succession calibration.',
        },
      ],
      assessmentId: 'ASM_W1_D5',
      assessmentTitle: 'Week 1 Day 5 Evaluation: 9-Box Grid & Calibration',
      assessmentMarks: 30,
      assessmentQuestionsCount: 3,
    },

    // ===== WEEK 2: Compensation, Leadership Development & Org Design =====
    {
      dayId: 6,
      weekId: 2,
      dayInWeek: 1,
      dayLabel: 'Week 2 Day 1 (Mon)',
      topic: 'Compensation, Equity Models & Total Rewards Architecture',
      description: 'Designing market-competitive salary bands, retention bonuses, equity compensation, and pay transparency audits.',
      learningObjectives: [
        'Calculate market compa-ratios and percentile positioning',
        'Design long-term incentive plans (LTIPs) and vesting schedules',
        'Evaluate pay transparency regulations and pay equity audits',
      ],
      documents: [
        {
          id: 'DOC_DAY6_1',
          filename: 'Talent_Sphere_Curriculum_Week2_Day1.pdf',
          type: 'pdf',
          chunkCount: 3,
          size: '1.3 MB',
          summary: 'Compensation banding and global equity distribution models.',
        },
      ],
      assessmentId: 'ASM_W2_D1',
      assessmentTitle: 'Week 2 Day 1 Evaluation: Compensation & Banding',
      assessmentMarks: 30,
      assessmentQuestionsCount: 3,
    },
    {
      dayId: 7,
      weekId: 2,
      dayInWeek: 2,
      dayLabel: 'Week 2 Day 2 (Tue)',
      topic: 'Strategic HR Architecture & Workforce Analytics',
      description: 'Headcount modeling, workforce capability indices, and AI-enabled organizational department hierarchy design.',
      learningObjectives: [
        'Architect scalable organizational department hierarchies',
        'Implement real-time workforce health dashboards',
        'Forecast talent supply and demand deficits',
      ],
      documents: [
        {
          id: 'DOC_DAY7_1',
          filename: 'Talent_Sphere_Curriculum_Week2_Day2.pdf',
          type: 'pdf',
          chunkCount: 3,
          size: '1.7 MB',
          summary: 'Workforce analytics, capacity modeling, and organizational design.',
        },
      ],
      assessmentId: 'ASM_W2_D2',
      assessmentTitle: 'Week 2 Day 2 Evaluation: Strategic HR Architecture',
      assessmentMarks: 30,
      assessmentQuestionsCount: 3,
    },
    {
      dayId: 8,
      weekId: 2,
      dayInWeek: 3,
      dayLabel: 'Week 2 Day 3 (Wed)',
      topic: 'High-Potential (HiPo) Identification & Executive Succession',
      description: 'Systematic frameworks for pinpointing accelerated leadership candidates, bench strength analysis, and risk mitigation.',
      learningObjectives: [
        'Formulate objective HiPo evaluation scorecards',
        'Map critical single-point-of-failure roles and designated successors',
        'Design individualized executive mentorship programs',
      ],
      documents: [
        {
          id: 'DOC_DAY8_1',
          filename: 'Talent_Sphere_Curriculum_Week2_Day3.pdf',
          type: 'pdf',
          chunkCount: 3,
          size: '1.4 MB',
          summary: 'Succession planning blueprints and leadership bench strength indices.',
        },
      ],
      assessmentId: 'ASM_W2_D3',
      assessmentTitle: 'Week 2 Day 3 Evaluation: Executive Succession & Bench Strength',
      assessmentMarks: 30,
      assessmentQuestionsCount: 3,
    },
    {
      dayId: 9,
      weekId: 2,
      dayInWeek: 4,
      dayLabel: 'Week 2 Day 4 (Thu)',
      topic: 'Employee Engagement, Sentiment Analysis & Retention Drivers',
      description: 'Continuous pulse surveying, natural language sentiment extraction from feedback, and proactive attrition mitigation.',
      learningObjectives: [
        'Deploy automated pulse feedback cadences',
        'Analyze employee Net Promoter Scores (eNPS) and drivers',
        'Create targeted retention interventions for at-risk cohorts',
      ],
      documents: [
        {
          id: 'DOC_DAY9_1',
          filename: 'Talent_Sphere_Curriculum_Week2_Day4.pdf',
          type: 'pdf',
          chunkCount: 3,
          size: '1.5 MB',
          summary: 'Sentiment telemetry and proactive retention frameworks.',
        },
      ],
      assessmentId: 'ASM_W2_D4',
      assessmentTitle: 'Week 2 Day 4 Evaluation: Engagement & Retention Telemetry',
      assessmentMarks: 30,
      assessmentQuestionsCount: 3,
    },
    {
      dayId: 10,
      weekId: 2,
      dayInWeek: 5,
      dayLabel: 'Week 2 Day 5 (Fri)',
      topic: 'Learning & Development (L&D) Pathways & Dynamic Skill Graphs',
      description: 'Designing enterprise learning ecosystems, micro-credentialing tracks, and adaptive skill upskilling roadmaps.',
      learningObjectives: [
        'Structure role-based micro-learning pathways',
        'Measure training ROI using Kirkpatrick evaluation models',
        'Map dynamic skill graphs to business unit capability targets',
      ],
      documents: [
        {
          id: 'DOC_DAY10_1',
          filename: 'Talent_Sphere_Curriculum_Week2_Day5.pdf',
          type: 'pdf',
          chunkCount: 3,
          size: '1.6 MB',
          summary: 'Adaptive L&D roadmaps and enterprise skill graphing standards.',
        },
      ],
      assessmentId: 'ASM_W2_D5',
      assessmentTitle: 'Week 2 Day 5 Evaluation: L&D Pathways & Micro-Credentials',
      assessmentMarks: 30,
      assessmentQuestionsCount: 3,
    },

    // ===== WEEK 3: Global Workforce Strategy, DE&I & Employee Relations =====
    {
      dayId: 11,
      weekId: 3,
      dayInWeek: 1,
      dayLabel: 'Week 3 Day 1 (Mon)',
      topic: 'Global Distributed Workforces & Cross-Border Employment',
      description: 'Managing remote and hybrid international teams, Employer of Record (EOR) legalities, and multi-timezone workflows.',
      learningObjectives: [
        'Navigate global compliance, permanent establishment risk, and tax models',
        'Establish asynchronous collaboration charters for distributed teams',
        'Structure localized compensation parity formulas',
      ],
      documents: [
        {
          id: 'DOC_DAY11_1',
          filename: 'Talent_Sphere_Curriculum_Week3_Day1.pdf',
          type: 'pdf',
          chunkCount: 3,
          size: '1.5 MB',
          summary: 'Global distributed workforce compliance and asynchronous charters.',
        },
      ],
      assessmentId: 'ASM_W3_D1',
      assessmentTitle: 'Week 3 Day 1 Evaluation: Global Distributed Workforce Strategy',
      assessmentMarks: 30,
      assessmentQuestionsCount: 3,
    },
    {
      dayId: 12,
      weekId: 3,
      dayInWeek: 2,
      dayLabel: 'Week 3 Day 2 (Tue)',
      topic: 'Diversity, Equity & Inclusion (DE&I) Frameworks & Audits',
      description: 'Quantitative DE&I metrics, equity in promotion pipelines, systemic barrier identification, and ERG leadership.',
      learningObjectives: [
        'Conduct statistically sound promotion velocity audits by demographic',
        'Implement inclusive hiring interview panels and scorecards',
        'Measure organizational belonging indices with verifiable metrics',
      ],
      documents: [
        {
          id: 'DOC_DAY12_1',
          filename: 'Talent_Sphere_Curriculum_Week3_Day2.pdf',
          type: 'pdf',
          chunkCount: 3,
          size: '1.7 MB',
          summary: 'DE&I audit methodologies and promotion velocity fairness analytics.',
        },
      ],
      assessmentId: 'ASM_W3_D2',
      assessmentTitle: 'Week 3 Day 2 Evaluation: DE&I Audits & Equity Analytics',
      assessmentMarks: 30,
      assessmentQuestionsCount: 3,
    },
    {
      dayId: 13,
      weekId: 3,
      dayInWeek: 3,
      dayLabel: 'Week 3 Day 3 (Wed)',
      topic: 'Workplace Culture, Psychological Safety & High-Trust Teams',
      description: 'Measuring psychological safety, open discourse rituals, failure retro cultures, and team dynamics optimization.',
      learningObjectives: [
        'Deploy Amy Edmondson psychological safety survey instruments',
        'Establish blame-free post-mortem processes',
        'Facilitate effective executive alignment sessions',
      ],
      documents: [
        {
          id: 'DOC_DAY13_1',
          filename: 'Talent_Sphere_Curriculum_Week3_Day3.pdf',
          type: 'pdf',
          chunkCount: 3,
          size: '1.3 MB',
          summary: 'Psychological safety measurement and high-trust team protocols.',
        },
      ],
      assessmentId: 'ASM_W3_D3',
      assessmentTitle: 'Week 3 Day 3 Evaluation: Psychological Safety & Trust Dynamics',
      assessmentMarks: 30,
      assessmentQuestionsCount: 3,
    },
    {
      dayId: 14,
      weekId: 3,
      dayInWeek: 4,
      dayLabel: 'Week 3 Day 4 (Thu)',
      topic: 'Employee Relations, Conflict Resolution & Labor Compliance',
      description: 'Navigating complex workplace disputes, structured investigation protocols, progressive discipline, and labor law compliance.',
      learningObjectives: [
        'Execute compliant and unbiased workplace investigation interviews',
        'Formulate legally defensible Performance Improvement Plans (PIPs)',
        'Mitigate organizational litigation exposures and grievance escalation',
      ],
      documents: [
        {
          id: 'DOC_DAY14_1',
          filename: 'Talent_Sphere_Curriculum_Week3_Day4.pdf',
          type: 'pdf',
          chunkCount: 3,
          size: '1.6 MB',
          summary: 'Employee relations investigation rubrics and labor law standards.',
        },
      ],
      assessmentId: 'ASM_W3_D4',
      assessmentTitle: 'Week 3 Day 4 Evaluation: Dispute Resolution & Labor Compliance',
      assessmentMarks: 30,
      assessmentQuestionsCount: 3,
    },
    {
      dayId: 15,
      weekId: 3,
      dayInWeek: 5,
      dayLabel: 'Week 3 Day 5 (Fri)',
      topic: 'Organizational Restructuring, Reskilling & Change Leadership',
      description: 'Leading large-scale business transformation, Kotter 8-step change frameworks, redeployment pipelines, and capability transition.',
      learningObjectives: [
        'Execute workforce redeployment and skills re-mapping',
        'Construct compassionate transition and outplacement strategies',
        'Measure change adoption friction across functional units',
      ],
      documents: [
        {
          id: 'DOC_DAY15_1',
          filename: 'Talent_Sphere_Curriculum_Week3_Day5.pdf',
          type: 'pdf',
          chunkCount: 3,
          size: '1.5 MB',
          summary: 'Change leadership frameworks and workforce transition matrices.',
        },
      ],
      assessmentId: 'ASM_W3_D5',
      assessmentTitle: 'Week 3 Day 5 Evaluation: Change Management & Workforce Transition',
      assessmentMarks: 30,
      assessmentQuestionsCount: 3,
    },

    // ===== WEEK 4: Advanced People Analytics, AI HR Tech & Future of Work =====
    {
      dayId: 16,
      weekId: 4,
      dayInWeek: 1,
      dayLabel: 'Week 4 Day 1 (Mon)',
      topic: 'Predictive People Analytics & Flight Risk Machine Learning',
      description: 'Building predictive attrition models, survival analysis, early warning triggers, and actionable retention interventions.',
      learningObjectives: [
        'Build Cox proportional hazard models for employee retention forecasting',
        'Identify key predictive features correlating with flight risk',
        'Establish proactive managerial nudge automations',
      ],
      documents: [
        {
          id: 'DOC_DAY16_1',
          filename: 'Talent_Sphere_Curriculum_Week4_Day1.pdf',
          type: 'pdf',
          chunkCount: 3,
          size: '1.8 MB',
          summary: 'Predictive people analytics and machine learning attrition modeling.',
        },
      ],
      assessmentId: 'ASM_W4_D1',
      assessmentTitle: 'Week 4 Day 1 Evaluation: Flight Risk Modeling & Analytics',
      assessmentMarks: 30,
      assessmentQuestionsCount: 3,
    },
    {
      dayId: 17,
      weekId: 4,
      dayInWeek: 2,
      dayLabel: 'Week 4 Day 2 (Tue)',
      topic: 'HR Tech Ecosystems, HCM Architecture & API Integrations',
      description: 'Modern HRIS/HCM platform architectures, API connectors, unified employee data graphs, and identity lifecycle orchestration.',
      learningObjectives: [
        'Design single-source-of-truth HR data pipelines',
        'Evaluate HCM vendor ecosystems (Workday, SAP SuccessFactors, BambooHR)',
        'Automate employee onboarding/offboarding webhooks and provisioning',
      ],
      documents: [
        {
          id: 'DOC_DAY17_1',
          filename: 'Talent_Sphere_Curriculum_Week4_Day2.pdf',
          type: 'pdf',
          chunkCount: 3,
          size: '1.6 MB',
          summary: 'Enterprise HCM platform architectures and API integration patterns.',
        },
      ],
      assessmentId: 'ASM_W4_D2',
      assessmentTitle: 'Week 4 Day 2 Evaluation: Enterprise HCM Systems & Integrations',
      assessmentMarks: 30,
      assessmentQuestionsCount: 3,
    },
    {
      dayId: 18,
      weekId: 4,
      dayInWeek: 3,
      dayLabel: 'Week 4 Day 3 (Wed)',
      topic: 'Ethical AI in HR, Algorithmic Transparency & Auditability',
      description: 'Mitigating algorithmic discrimination in recruiting and promotions, EEOC guidelines, NYC Local Law 144, and AI governance.',
      learningObjectives: [
        'Audit AI resume matching and interview scoring for disparate impact',
        'Implement model explainability and candidate adverse action notices',
        'Establish an enterprise AI Ethics in HR review committee',
      ],
      documents: [
        {
          id: 'DOC_DAY18_1',
          filename: 'Talent_Sphere_Curriculum_Week4_Day3.pdf',
          type: 'pdf',
          chunkCount: 3,
          size: '1.7 MB',
          summary: 'Ethical AI governance, disparate impact audits, and statutory HR guidelines.',
        },
      ],
      assessmentId: 'ASM_W4_D3',
      assessmentTitle: 'Week 4 Day 3 Evaluation: Ethical AI & Governance in HR',
      assessmentMarks: 30,
      assessmentQuestionsCount: 3,
    },
    {
      dayId: 19,
      weekId: 4,
      dayInWeek: 4,
      dayLabel: 'Week 4 Day 4 (Thu)',
      topic: 'Holistic Well-Being, Burnout Prevention & Hybrid Work Policy',
      description: 'Designing comprehensive mental health and ergonomics programs, workload telemetry, focus hours, and hybrid cadence optimization.',
      learningObjectives: [
        'Quantify organizational workload balance and meeting overload metrics',
        'Draft clear, flexible, and equitable hybrid work policies',
        'Structure mental wellness benefits with high utilization rates',
      ],
      documents: [
        {
          id: 'DOC_DAY19_1',
          filename: 'Talent_Sphere_Curriculum_Week4_Day4.pdf',
          type: 'pdf',
          chunkCount: 3,
          size: '1.4 MB',
          summary: 'Employee wellness architecture and sustainable hybrid work guidelines.',
        },
      ],
      assessmentId: 'ASM_W4_D4',
      assessmentTitle: 'Week 4 Day 4 Evaluation: Well-Being Architecture & Hybrid Policies',
      assessmentMarks: 30,
      assessmentQuestionsCount: 3,
    },
    {
      dayId: 20,
      weekId: 4,
      dayInWeek: 5,
      dayLabel: 'Week 4 Day 5 (Fri)',
      topic: 'Capstone: Enterprise Strategic Workforce Architecture Blueprint',
      description: 'Synthesis of the entire 4-week curriculum into a comprehensive, board-ready Enterprise Strategic Talent Architecture Blueprint.',
      learningObjectives: [
        'Synthesize 4-week competencies into a board-level strategic talent deck',
        'Formulate 3-year headcount, capability, and technology investment roadmaps',
        'Present executive ROI justification for human capital investments',
      ],
      documents: [
        {
          id: 'DOC_DAY20_1',
          filename: 'Talent_Sphere_Curriculum_Week4_Day5_Capstone.pdf',
          type: 'pdf',
          chunkCount: 5,
          size: '2.4 MB',
          summary: 'Executive Capstone: Enterprise Strategic Workforce Blueprint synthesis guidelines.',
        },
      ],
      assessmentId: 'ASM_W4_D5',
      assessmentTitle: 'Week 4 Day 5 Final Capstone: Strategic Workforce Architecture',
      assessmentMarks: 50,
      assessmentQuestionsCount: 5,
    },
  ];

  // Refresh current user unlocked day on mount
  useEffect(() => {
    fetchCurrentStatus();
  }, []);

  const fetchCurrentStatus = async () => {
    const token = localStorage.getItem('ts_token');
    if (!token) return;
    try {
      const { ok, data } = await safeFetchJson<{ user: User }>('/api/users/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (ok && data?.user) {
        setCurrentUnlockedDay(data.user.currentUnlockedDay || 1);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Teacher Action: Unlock Day (unlocks up to targetDay)
  const handleTeacherUnlockDay = async (targetDay: number) => {
    if (!isTeacher) return;
    setActionLoading(targetDay);
    setStatusMessage(null);
    const token = localStorage.getItem('ts_token');

    try {
      const { ok, data } = await safeFetchJson('/api/teacher/unlock-day', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ dayId: targetDay, courseId: 'CRS_TALENT_101' }),
      });

      if (ok && data?.success) {
        setCurrentUnlockedDay(targetDay);
        setStatusMessage(`🎉 Day ${targetDay} (and preceding modules) successfully UNLOCKED for all students! Curriculum PDFs and evaluations are now accessible.`);
        if (onUnlockDay) onUnlockDay(targetDay);
        setTimeout(() => setStatusMessage(null), 5000);
      } else {
        setStatusMessage('⚠️ Failed to unlock day.');
      }
    } catch (e: any) {
      setStatusMessage(`⚠️ Error: ${e.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  // Teacher Action: Lock Day (locks targetDay and subsequent modules by setting level to targetDay - 1)
  const handleTeacherLockDay = async (dayToLock: number) => {
    if (!isTeacher) return;
    setActionLoading(dayToLock);
    setStatusMessage(null);
    const token = localStorage.getItem('ts_token');
    const targetUnlockedLevel = Math.max(0, dayToLock - 1);

    try {
      const { ok, data } = await safeFetchJson('/api/teacher/lock-day', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ dayId: targetUnlockedLevel, courseId: 'CRS_TALENT_101' }),
      });

      if (ok && data?.success) {
        setCurrentUnlockedDay(targetUnlockedLevel);
        if (targetUnlockedLevel === 0) {
          setStatusMessage(`🔒 All curriculum days are now LOCKED for students. No modules or evaluations are accessible.`);
        } else {
          setStatusMessage(`🔒 Day ${dayToLock} and subsequent modules are now LOCKED. Access level set to Day ${targetUnlockedLevel}.`);
        }
        if (onUnlockDay) onUnlockDay(targetUnlockedLevel);
        setTimeout(() => setStatusMessage(null), 5000);
      } else {
        setStatusMessage('⚠️ Failed to lock day.');
      }
    } catch (e: any) {
      setStatusMessage(`⚠️ Error: ${e.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredDays = curriculumDays.filter((d) => {
    const matchesWeek = selectedWeekFilter === 'all' || d.weekId === selectedWeekFilter;
    const matchesSearch =
      d.topic.toLowerCase().includes(searchFilter.toLowerCase()) ||
      d.dayLabel.toLowerCase().includes(searchFilter.toLowerCase()) ||
      d.description.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesWeek && matchesSearch;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-slate-900 dark:text-slate-100">
      {/* Top Header Banner */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-black text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950 px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-800 flex items-center gap-1">
              <Compass className="w-3.5 h-3.5" />
              THE ASCENT PATH
            </span>
            <span
              className={`text-xs font-mono font-black px-2.5 py-0.5 rounded-full border ${
                isTeacher
                  ? 'bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                  : 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
              }`}
            >
              {isTeacher ? 'FACULTY LOCK/UNLOCK REGULATION' : 'STUDENT PROGRESSIVE ROADMAP'}
            </span>
          </div>

          <h1 className="text-2xl font-black text-slate-950 dark:text-white">
            Day-Wise Curriculum Roadmap & Knowledge Hub
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
            {isTeacher
              ? 'Instructor Control Center: Toggle LOCK or UNLOCK for each day module. Unlocked days reveal study PDF documents, vector RAG knowledge chunks, and assessments to all enrolled students.'
              : 'Progressive Mastery: Each day unlocks syllabus theory, study PDFs indexed in ChromaDB vector store, and assessments as released by your instructor.'}
          </p>
        </div>

        {/* Global Status Stat Card */}
        <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center min-w-[220px] shrink-0 text-center space-y-1">
          <span className="text-[11px] font-mono font-black uppercase text-slate-500">CURRENT RELEASE LEVEL</span>
          <div className="flex items-center gap-2 text-2xl font-black font-mono text-amber-600 dark:text-amber-400">
            <Unlock className="w-6 h-6" />
            <span>Day {currentUnlockedDay} of 20</span>
          </div>
          <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
            {currentUnlockedDay >= 20
              ? '🌟 Entire 4-Week Course Unlocked'
              : currentUnlockedDay === 0
              ? '🔒 All 20 Days Locked'
              : `${20 - currentUnlockedDay} of 20 Days Remaining Locked`}
          </span>
        </div>
      </div>

      {/* Status Alert Banner */}
      {statusMessage && (
        <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 text-xs font-bold text-indigo-900 dark:text-indigo-200 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <span>{statusMessage}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} className="text-indigo-500 hover:text-indigo-800">
            &times;
          </button>
        </div>
      )}

      {/* Teacher Quick Batch Controls */}
      {isTeacher && (
        <div className="bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/30 rounded-2xl p-4 flex flex-col lg:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
            <div>
              <div className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-2">
                Faculty Curriculum Gating Hub (4 Weeks / 20 Days)
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 font-black">
                  Active: Day {currentUnlockedDay} of 20
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                Clicking "Unlock Day X" unlocks up to Day X. Clicking "Lock Day X" locks Day X and following days.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => handleTeacherUnlockDay(20)}
              disabled={actionLoading !== null}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
              title="Unlock all 20 days across all 4 weeks"
            >
              <Unlock className="w-3.5 h-3.5" />
              Unlock All (1–20)
            </button>
            <button
              onClick={() => handleTeacherUnlockDay(15)}
              disabled={actionLoading !== null}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
              title="Unlock Week 1, 2, and 3 (Days 1 to 15)"
            >
              <Unlock className="w-3.5 h-3.5" />
              Week 1–3 (1–15)
            </button>
            <button
              onClick={() => handleTeacherUnlockDay(10)}
              disabled={actionLoading !== null}
              className="px-3 py-1.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
              title="Unlock Week 1 and 2 (Days 1 to 10)"
            >
              <Unlock className="w-3.5 h-3.5" />
              Week 1–2 (1–10)
            </button>
            <button
              onClick={() => handleTeacherUnlockDay(5)}
              disabled={actionLoading !== null}
              className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
              title="Unlock Week 1 (Days 1 to 5)"
            >
              <Unlock className="w-3.5 h-3.5" />
              Week 1 (1–5)
            </button>
            <button
              onClick={() => handleTeacherUnlockDay(1)}
              disabled={actionLoading !== null}
              className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              title="Reset to Day 1 only"
            >
              Reset Day 1
            </button>
            <button
              onClick={() => handleTeacherLockDay(1)}
              disabled={actionLoading !== null}
              className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
              title="Lock all 20 curriculum days"
            >
              <Lock className="w-3.5 h-3.5" />
              Lock All (0)
            </button>
          </div>
        </div>
      )}

      {/* Filters and Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-black uppercase font-mono text-slate-500">Filter Week:</span>
          <div className="flex gap-1 flex-wrap">
            <button
              onClick={() => setSelectedWeekFilter('all')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                selectedWeekFilter === 'all'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              All 4 Weeks
            </button>
            <button
              onClick={() => setSelectedWeekFilter(1)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                selectedWeekFilter === 1
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              Week 1 (1–5)
            </button>
            <button
              onClick={() => setSelectedWeekFilter(2)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                selectedWeekFilter === 2
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              Week 2 (6–10)
            </button>
            <button
              onClick={() => setSelectedWeekFilter(3)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                selectedWeekFilter === 3
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              Week 3 (11–15)
            </button>
            <button
              onClick={() => setSelectedWeekFilter(4)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                selectedWeekFilter === 4
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              Week 4 (16–20)
            </button>
          </div>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search topic, PDF, or module..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Curriculum Days Grid / Roadmap Cards */}
      <div className="space-y-4">
        {filteredDays.map((day) => {
          const isUnlocked = day.dayId <= currentUnlockedDay;
          const isCurrent = day.dayId === currentUnlockedDay;

          return (
            <div
              key={day.dayId}
              className={`bg-white dark:bg-slate-900 rounded-3xl border-2 transition-all p-6 shadow-xs ${
                isUnlocked
                  ? 'border-indigo-200 dark:border-indigo-900/60 ring-1 ring-indigo-500/10'
                  : 'border-slate-200 dark:border-slate-800 opacity-90'
              }`}
            >
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center font-mono font-black text-sm shrink-0 shadow-xs ${
                      isUnlocked
                        ? 'bg-amber-500 text-white shadow-amber-500/20'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {isUnlocked ? <CheckCircle2 className="w-6 h-6" /> : <Lock className="w-5 h-5" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-black px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {day.dayLabel}
                      </span>
                      {isUnlocked ? (
                        <span className="text-[11px] font-mono font-black text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> UNLOCKED
                        </span>
                      ) : (
                        <span className="text-[11px] font-mono font-black text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-300 dark:border-slate-700 flex items-center gap-1">
                          <Lock className="w-3 h-3" /> LOCKED BY INSTRUCTOR
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-black text-slate-950 dark:text-white mt-1">{day.topic}</h3>
                  </div>
                </div>

                {/* Lock / Unlock Controls & Navigation */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  {isTeacher ? (
                    <div className="flex items-center gap-2">
                      {!isUnlocked ? (
                        <button
                          disabled={actionLoading === day.dayId}
                          onClick={() => handleTeacherUnlockDay(day.dayId)}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                          title={`Unlock Day ${day.dayId} (and all preceding days)`}
                        >
                          <Unlock className="w-4 h-4" />
                          {actionLoading === day.dayId ? 'Unlocking...' : `Unlock Day ${day.dayId}`}
                        </button>
                      ) : (
                        <button
                          disabled={actionLoading === day.dayId}
                          onClick={() => handleTeacherLockDay(day.dayId)}
                          className="px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700 text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer"
                          title={`Lock Day ${day.dayId} (and all subsequent days)`}
                        >
                          <Lock className="w-4 h-4 text-amber-600" />
                          {actionLoading === day.dayId ? 'Locking...' : `Lock Day ${day.dayId}`}
                        </button>
                      )}
                    </div>
                  ) : (
                    <div>
                      {isUnlocked ? (
                        <button
                          onClick={() => onNavigate('chatbot', { targetDay: day.dayId, targetWeek: day.weekId })}
                          className="px-3.5 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          <Bot className="w-4 h-4" />
                          Ask Day {day.dayId} AI &rarr;
                        </button>
                      ) : (
                        <span className="text-xs font-mono font-bold text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
                          🔒 Locked by Instructor
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Card Body: Description & Objectives */}
              <div className="py-4 space-y-4">
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  {day.description}
                </p>

                {/* Objectives */}
                <div className="bg-slate-50 dark:bg-slate-950/60 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800/80 space-y-2">
                  <span className="text-[10px] font-mono font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    Core Competency Milestones:
                  </span>
                  <ul className="grid sm:grid-cols-3 gap-2">
                    {day.learningObjectives.map((obj, i) => (
                      <li key={i} className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2">
                        <span className="text-indigo-600 dark:text-indigo-400 font-bold">•</span>
                        <span>{obj}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Documents & RAG Vector Base / Assessments Section */}
                <div className="grid md:grid-cols-2 gap-3 pt-1">
                  {/* Documents & PDFs */}
                  <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        Attached Course PDFs & Documents
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 font-bold">
                        {isUnlocked ? 'Vector Search Active' : 'Locked'}
                      </span>
                    </div>

                    {day.documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2"
                      >
                        <div className="overflow-hidden space-y-0.5">
                          <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">
                            {doc.filename}
                          </span>
                          <span className="text-[10px] text-slate-500 block font-mono">
                            {doc.chunkCount} Vector Chunks • {doc.size} • {doc.summary}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {isUnlocked ? (
                            <button
                              onClick={() => {
                                setInspectDocId(doc.id);
                                setInspectMaterial({
                                  id: doc.id,
                                  title: doc.filename,
                                  filename: doc.filename,
                                  fileType: 'application/pdf',
                                  fileSize: doc.size,
                                  summary: doc.summary,
                                  uploadedBy: 'Course Faculty',
                                  uploadedAt: new Date().toISOString(),
                                  week: day.weekId,
                                  day: day.dayInWeek,
                                  topic: day.topic,
                                  status: 'Ready',
                                  chunkCount: doc.chunkCount,
                                  lineCount: 45,
                                  wordCount: 420,
                                  pictureCount: 2,
                                  rawContent: `${day.topic}\n\n${day.description}\n\nKey Learning Objectives:\n${day.learningObjectives.join('\n')}`,
                                });
                              }}
                              className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold border border-indigo-200 dark:border-indigo-800 flex items-center gap-1 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" /> Inspect PDF
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-mono">🔒 Locked</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Associated Exam / Assessment */}
                  <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                          <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          Day Evaluation Assessment
                        </span>
                        <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                          {day.assessmentMarks} Marks • {day.assessmentQuestionsCount} Questions
                        </span>
                      </div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {day.assessmentTitle}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Automated proctoring with instant evaluation, confidence analysis, and transcript generation.
                      </p>
                    </div>

                    <div className="pt-2 flex justify-end">
                      {isUnlocked ? (
                        <button
                          onClick={() => onNavigate('assessments')}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                        >
                          <CheckSquare className="w-3.5 h-3.5" />
                          {isTeacher ? 'View Exam Blueprint' : 'Launch Examination'}
                        </button>
                      ) : (
                        <span className="text-xs font-mono font-bold text-slate-400 dark:text-slate-500">
                          🔒 Exam Unlocks with Day {day.dayId}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Document Inspector Modal for PDFs */}
      {inspectMaterial && (
        <DocumentInspectorModal
          material={inspectMaterial}
          onClose={() => {
            setInspectDocId(null);
            setInspectMaterial(null);
          }}
          onPreloadForExam={(mat) => {
            setInspectMaterial(null);
            onNavigate('exam-creator');
          }}
        />
      )}
    </div>
  );
};
