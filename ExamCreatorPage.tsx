import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  CheckSquare,
  Award,
  Calendar,
  Clock,
  Send,
  Mic,
  MicOff,
  Volume2,
  Plus,
  Trash2,
  Edit3,
  X,
  Play,
  CheckCircle2,
  FileText,
  LayoutDashboard,
  Bell,
  ArrowRight,
  BookOpen,
  HelpCircle,
  Upload,
  Database,
  Layers,
  AlignLeft,
  Type,
  Image as ImageIcon,
  Eye,
  Check,
  Filter,
  Loader2,
  Maximize2,
  Minimize2,
  Bot,
  Zap,
  Radio,
  Share2,
} from 'lucide-react';
import { Assessment, User, CourseMaterial } from '../types';
import { safeFetchJson } from '../lib/api';

interface ExamCreatorPageProps {
  user: User;
  onNavigate: (page: string) => void;
  preloadedMaterial?: CourseMaterial | null;
}

// ============================================================
// INLINE SEND EXAM EMAIL PANEL (embedded in Published Exams)
// ============================================================
const SendExamEmailPanel: React.FC<{ assessments: Assessment[]; user: User }> = ({ assessments, user }) => {
  const [selectedExamId, setSelectedExamId] = React.useState<string>('');
  const [recipientEmails, setRecipientEmails] = React.useState<string>('');
  const [emailMessage, setEmailMessage] = React.useState<string>('');
  const [isSending, setIsSending] = React.useState(false);
  const [sendStatus, setSendStatus] = React.useState<string | null>(null);
  const [sendError, setSendError] = React.useState<string | null>(null);

  const selectedExam = assessments.find((a) => a.id === selectedExamId);

  const handleSendEmail = async () => {
    if (!selectedExamId) { setSendError('⚠️ Please select an exam.'); return; }
    const emails = recipientEmails.split(/[\n,;]+/).map((e) => e.trim()).filter(Boolean);
    if (emails.length === 0) { setSendError('⚠️ Please enter at least one recipient email.'); return; }

    setIsSending(true);
    setSendStatus(null);
    setSendError(null);
    const token = localStorage.getItem('ts_token');

    try {
      const exam = assessments.find((a) => a.id === selectedExamId);
      const { ok, data } = await safeFetchJson<{ success: boolean; sent: number; message: string }>('/api/teacher/send-exam-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          examId: selectedExamId,
          examTitle: exam?.title,
          examDayLabel: exam?.dayLabel,
          examTotalMarks: exam?.totalMarks,
          examDurationMinutes: exam?.durationMinutes,
          examPassingMarks: exam?.passingMarks,
          recipientEmails: emails,
          customMessage: emailMessage,
          senderName: user.name || 'Your Instructor',
        }),
      });

      if (ok && data?.success) {
        setSendStatus(`✅ Exam notification sent to ${data.sent || emails.length} recipient(s)!`);
        setRecipientEmails('');
        setEmailMessage('');
      } else {
        setSendError((data as any)?.message || '⚠️ Failed to send email. Please try again.');
      }
    } catch (e: any) {
      setSendError(`⚠️ Error: ${e.message}`);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border-2 border-indigo-300 dark:border-indigo-800 shadow-md space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-md shrink-0">
          <Send className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-black text-base text-slate-950 dark:text-white">Send Exam Email Notification</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Select an exam and send full details to students via email.
          </p>
        </div>
        <span className="ml-auto text-[10px] font-mono font-black bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 px-2.5 py-1 rounded-full border border-indigo-300 dark:border-indigo-700">
          SEND EMAIL
        </span>
      </div>

      {sendStatus && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 rounded-xl text-xs font-bold text-emerald-900 dark:text-emerald-300 flex items-center justify-between">
          <span>{sendStatus}</span>
          <button onClick={() => setSendStatus(null)} className="text-emerald-700 hover:underline text-xs">Dismiss</button>
        </div>
      )}
      {sendError && (
        <div className="p-3.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-700 rounded-xl text-xs font-bold text-rose-900 dark:text-rose-300 flex items-center justify-between">
          <span>{sendError}</span>
          <button onClick={() => setSendError(null)} className="text-rose-700 hover:underline text-xs">Dismiss</button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Left: Exam Selector */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-black text-slate-900 dark:text-slate-100 mb-1.5">
              Select Exam to Send
            </label>
            <select
              value={selectedExamId}
              onChange={(e) => setSelectedExamId(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-950 dark:text-slate-100"
            >
              <option value="">-- Choose an exam --</option>
              {assessments.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.title} ({a.dayLabel || `Day ${a.dayId}`})
                </option>
              ))}
            </select>
          </div>

          {selectedExam && (
            <div className="bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-black bg-indigo-200 dark:bg-indigo-900 text-indigo-900 dark:text-indigo-300 px-2 py-0.5 rounded-full">
                  {selectedExam.dayLabel || `Day ${selectedExam.dayId}`}
                </span>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${selectedExam.isPublished ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-900'}`}>
                  {selectedExam.isPublished ? 'LIVE' : 'DRAFT'}
                </span>
              </div>
              <p className="text-xs font-black text-slate-950 dark:text-white">{selectedExam.title}</p>
              <div className="flex items-center gap-3 text-[11px] font-mono text-slate-600 dark:text-slate-400 font-semibold">
                <span>📝 {selectedExam.questions?.length || 0} Questions</span>
                <span>🏆 {selectedExam.totalMarks} Marks</span>
                <span>⏱ {selectedExam.durationMinutes} Mins</span>
              </div>
            </div>
          )}
        </div>

        {/* Right: Recipients */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-black text-slate-900 dark:text-slate-100 mb-1.5">
              Recipient Email(s) <span className="font-normal text-slate-500">(comma, semicolon, or new line separated)</span>
            </label>
            <textarea
              value={recipientEmails}
              onChange={(e) => setRecipientEmails(e.target.value)}
              rows={4}
              placeholder={"student1@example.com\nstudent2@example.com\nor: email1@x.com, email2@x.com"}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-950 dark:text-slate-100 resize-y"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-slate-900 dark:text-slate-100 mb-1.5">
              Additional Message <span className="font-normal text-slate-500">(optional)</span>
            </label>
            <textarea
              value={emailMessage}
              onChange={(e) => setEmailMessage(e.target.value)}
              rows={3}
              placeholder="Dear students, please find the upcoming exam details below..."
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-950 dark:text-slate-100 resize-y"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
          Email will include: exam title, week/day, question count, total marks, duration, and your message.
        </p>
        <button
          onClick={handleSendEmail}
          disabled={isSending || !selectedExamId}
          className={`font-black text-xs px-6 py-2.5 rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer ${
            isSending || !selectedExamId
              ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
              : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-indigo-600/30'
          }`}
        >
          {isSending ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
          ) : (
            <><Send className="w-4 h-4" /> Send Exam Email</>
          )}
        </button>
      </div>
    </div>
  );
};

export const ExamCreatorPage: React.FC<ExamCreatorPageProps> = ({
  user,
  onNavigate,
  preloadedMaterial,
}) => {
  // Active Navigation Tab: 'manual_creator' vs 'voice_assistant' vs 'published_exams'
  const [activeTab, setActiveTab] = useState<'create' | 'voice_assistant' | 'published_exams'>('create');

  // Exam Form State (Manual / Quick Form)
  const [selectedWeek, setSelectedWeek] = useState<number>(preloadedMaterial?.week || 1);
  const [selectedDayInWeek, setSelectedDayInWeek] = useState<number>(preloadedMaterial?.day || 1);
  const [examSubject, setExamSubject] = useState<string>(preloadedMaterial?.topic || 'Performance Systems & OKRs');
  const [examTitle, setExamTitle] = useState<string>(
    preloadedMaterial ? `Evaluation: ${preloadedMaterial.title}` : 'Week 1 Day 1 Evaluation: Performance Frameworks'
  );
  const [examDifficulty, setExamDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [examDuration, setExamDuration] = useState<number>(15);
  const [examPassingMarks, setExamPassingMarks] = useState<number>(18);
  const [numQuestionsToGenerate, setNumQuestionsToGenerate] = useState<number>(5);
  const [questionsList, setQuestionsList] = useState<any[]>([]);

  // Manual Question Addition Modal
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newOptionA, setNewOptionA] = useState('');
  const [newOptionB, setNewOptionB] = useState('');
  const [newOptionC, setNewOptionC] = useState('');
  const [newOptionD, setNewOptionD] = useState('');
  const [newCorrectIdx, setNewCorrectIdx] = useState<number>(0);
  const [showAddCustomModal, setShowAddCustomModal] = useState(false);

  // States & Loaders
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [isSavingExam, setIsSavingExam] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [isQuestionsConfirmed, setIsQuestionsConfirmed] = useState<boolean>(false);
  const [previewTabMode, setPreviewTabMode] = useState<'preview' | 'json'>('preview');

  // Standard Form Custom File Upload State
  const [uploadedDocFilename, setUploadedDocFilename] = useState<string>('');
  const [uploadedDocType, setUploadedDocType] = useState<string>('');
  const [uploadedDocSize, setUploadedDocSize] = useState<string>('');
  const [uploadedDocContent, setUploadedDocContent] = useState<string>('');
  const [uploadedDocLines, setUploadedDocLines] = useState<number>(0);
  const [uploadedDocWords, setUploadedDocWords] = useState<number>(0);
  const [isUploadingDoc, setIsUploadingDoc] = useState<boolean>(false);
  const [isSavingToRAG, setIsSavingToRAG] = useState<boolean>(false);
  const [docRAGSuccess, setDocRAGSuccess] = useState<string | null>(null);

  // ==========================================
  // AI VOICE EXAM CREATION CONVERSATIONAL ENGINE (PURE VOICE-FIRST)
  // ==========================================
  const [isVoiceFullScreen, setIsVoiceFullScreen] = useState(false);
  const [voiceStep, setVoiceStep] = useState<number>(1);
  const [voiceInput, setVoiceInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [autoListenEnabled, setAutoListenEnabled] = useState(true);
  const [isSpeechMuted, setIsSpeechMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const INITIAL_AI_GREETING = 'Greetings, Professor! I am your AI Voice Assessment Synthesizer. What topic or subject would you like to create an examination for today?';
  const [lastAIPrompt, setLastAIPrompt] = useState(INITIAL_AI_GREETING);
  const [voiceAssistantState, setVoiceAssistantState] = useState<{
    topic?: string;
    week?: number;
    day?: number;
    dayLabel?: string;
    questionCount?: number;
    totalMarks?: number;
    marksPerQuestion?: number;
    passingMarks?: number;
    questions?: any[];
    published?: boolean;
    createdExam?: any;
  }>({});
  const [isVoiceLoading, setIsVoiceLoading] = useState(false);
  const [voiceTranscriptFeed, setVoiceTranscriptFeed] = useState<Array<{ sender: 'ai' | 'teacher'; text: string; time: string }>>([
    {
      sender: 'ai',
      text: INITIAL_AI_GREETING,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  // Calculated Day ID (1-20)
  const currentCalculatedDayId = (selectedWeek - 1) * 5 + selectedDayInWeek;

  useEffect(() => {
    fetchExistingAssessments();
  }, []);

  const fetchExistingAssessments = async () => {
    const token = localStorage.getItem('ts_token');
    try {
      const { ok, data } = await safeFetchJson<{ assessments: Assessment[] }>('/api/assessments', {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (ok && data?.assessments) {
        setAssessments(data.assessments);
      }
    } catch (e) {
      console.error('Failed to fetch assessments:', e);
    }
  };

  // Generate Questions via standard AI button
  const handleGenerateQuestionsAI = async () => {
    setIsGeneratingQuestions(true);
    setStatusMessage(null);
    setIsQuestionsConfirmed(false);
    const token = localStorage.getItem('ts_token');

    try {
      const { ok, data } = await safeFetchJson<{ questions: any[]; sourceTopic?: string }>('/api/teacher/generate-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          topic: examSubject,
          documentContent: examTitle,
          count: numQuestionsToGenerate,
          difficulty: examDifficulty,
        }),
      });

      if (ok && data?.questions) {
        setQuestionsList(data.questions);
        setIsQuestionsConfirmed(false);
        setStatusMessage(`✨ Successfully synthesized ${data.questions.length} questions for "${examSubject}". Please preview and confirm before publishing.`);
      } else {
        setStatusMessage('⚠️ Failed to synthesize questions.');
      }
    } catch (e: any) {
      setStatusMessage(`⚠️ Error: ${e.message}`);
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  // Add Manual Custom Question
  const handleAddCustomQuestion = () => {
    if (!newQuestionText.trim() || !newOptionA.trim() || !newOptionB.trim()) {
      setStatusMessage('⚠️ Please provide question text and at least 2 options.');
      return;
    }

    const options = [newOptionA.trim(), newOptionB.trim()];
    if (newOptionC.trim()) options.push(newOptionC.trim());
    if (newOptionD.trim()) options.push(newOptionD.trim());

    const newQ = {
      id: `q_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      text: newQuestionText.trim(),
      options,
      correctAnswer: newCorrectIdx,
      marks: 10,
      type: 'MCQ',
      explanation: 'Instructor verified custom question.',
    };

    setQuestionsList((prev) => [...prev, newQ]);
    setIsQuestionsConfirmed(false);
    setNewQuestionText('');
    setNewOptionA('');
    setNewOptionB('');
    setNewOptionC('');
    setNewOptionD('');
    setNewCorrectIdx(0);
    setShowAddCustomModal(false);
    setStatusMessage('✅ Custom question added. Please review the updated preview.');
  };

  const handleRemoveQuestion = (idx: number) => {
    setQuestionsList((prev) => prev.filter((_, i) => i !== idx));
    setIsQuestionsConfirmed(false);
  };

  const handleSaveExam = async (announceToStudents: boolean) => {
    if (!examTitle.trim()) {
      setStatusMessage('⚠️ Please provide an Exam Title.');
      return;
    }
    if (questionsList.length === 0) {
      setStatusMessage('⚠️ Please generate or add at least 1 question before publishing.');
      return;
    }
    if (announceToStudents && !isQuestionsConfirmed) {
      setStatusMessage('⚠️ Teacher Verification Required: Please review the question preview and check the confirmation box before publishing.');
      return;
    }

    setIsSavingExam(true);
    const token = localStorage.getItem('ts_token');
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    const dayLabel = `Week ${selectedWeek} Day ${selectedDayInWeek} (${dayNames[selectedDayInWeek - 1] || 'Day ' + selectedDayInWeek})`;

    try {
      const { ok, data } = await safeFetchJson<{ success: boolean; assessment: Assessment }>('/api/teacher/create-exam', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          weekId: selectedWeek,
          dayId: currentCalculatedDayId,
          dayLabel,
          title: examTitle,
          description: `Evaluation assessment for ${dayLabel}`,
          subject: examSubject,
          difficulty: examDifficulty,
          durationMinutes: examDuration,
          totalMarks: questionsList.reduce((acc, q) => acc + (q.marks || 10), 0),
          passingMarks: examPassingMarks,
          questions: questionsList,
          announceToStudents,
        }),
      });

      if (ok && data?.assessment) {
        setStatusMessage(
          announceToStudents
            ? `🎉 Exam "${examTitle}" is now officially published and LIVE! Broadcast announcement delivered to students.`
            : `✅ Exam "${examTitle}" successfully saved as draft.`
        );
        fetchExistingAssessments();
        setActiveTab('published_exams');
        setTimeout(() => setStatusMessage(null), 6000);
      } else {
        setStatusMessage('⚠️ Failed to publish examination.');
      }
    } catch (e: any) {
      setStatusMessage(`⚠️ Error: ${e.message}`);
    } finally {
      setIsSavingExam(false);
    }
  };

  // ----------------------------------------------------
  // STANDARD FORM: CUSTOM FILE UPLOADER & RAG PROCESSOR
  // ----------------------------------------------------
  const handleStandardDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingDoc(true);
    setDocRAGSuccess(null);
    setUploadedDocFilename(file.name);
    setUploadedDocType(file.type || 'application/pdf');
    setUploadedDocSize((file.size / 1024).toFixed(1) + ' KB');

    // Auto-update subject and title if empty or default
    const baseName = file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' ');
    setExamSubject(baseName);
    setExamTitle(`Evaluation: ${baseName}`);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = (evt.target?.result as string) || '';
      setUploadedDocContent(content);

      // Calculate lines & words
      const lines = content.split(/\r\n|\r|\n/).length;
      const words = content.trim().split(/\s+/).filter(Boolean).length;
      setUploadedDocLines(lines || 45);
      setUploadedDocWords(words || 450);
      setIsUploadingDoc(false);
      setStatusMessage(`📄 Uploaded "${file.name}" (${(file.size / 1024).toFixed(1)} KB). Ready to generate questions or index to RAG base.`);
    };

    reader.onerror = () => {
      setIsUploadingDoc(false);
      setStatusMessage('⚠️ Failed to read uploaded file.');
    };

    if (file.type.startsWith('image/')) {
      reader.readAsDataURL(file);
    } else {
      reader.readAsText(file);
    }
  };

  // Generate Questions directly from the uploaded document text
  const handleGenerateQuestionsFromDoc = async () => {
    if (!uploadedDocContent && !uploadedDocFilename) {
      setStatusMessage('⚠️ Please select and upload a document file first.');
      return;
    }

    setIsGeneratingQuestions(true);
    setStatusMessage(null);
    const token = localStorage.getItem('ts_token');

    try {
      const { ok, data } = await safeFetchJson<{ questions: any[]; sourceTopic?: string }>('/api/teacher/generate-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          topic: examSubject || uploadedDocFilename,
          documentContent: uploadedDocContent.slice(0, 8000) || `Comprehensive analysis document: ${uploadedDocFilename}`,
          count: numQuestionsToGenerate,
          difficulty: examDifficulty,
        }),
      });

      if (ok && data?.questions) {
        setQuestionsList(data.questions);
        setIsQuestionsConfirmed(false);
        setStatusMessage(`✨ Synthesized ${data.questions.length} questions from "${uploadedDocFilename}". Please preview and confirm before publishing.`);
      } else {
        setStatusMessage('⚠️ Question synthesis failed.');
      }
    } catch (e: any) {
      setStatusMessage(`⚠️ Error: ${e.message}`);
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  // Store uploaded document into Document RAG Base
  const handleSaveUploadedDocToRAG = async () => {
    if (!uploadedDocFilename) return;

    setIsSavingToRAG(true);
    setDocRAGSuccess(null);
    const token = localStorage.getItem('ts_token');

    try {
      const { ok, data } = await safeFetchJson<{ material: CourseMaterial }>('/api/materials/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: examTitle || uploadedDocFilename.replace(/\.[^/.]+$/, ''),
          filename: uploadedDocFilename,
          fileType: uploadedDocType || 'application/pdf',
          content: uploadedDocContent || `Extracted course syllabus and benchmarks for ${examSubject}`,
          week: selectedWeek,
          day: selectedDayInWeek,
          topic: examSubject,
          detectedPicturesCount: 2,
        }),
      });

      if (ok && data?.material) {
        setDocRAGSuccess(`✅ Document "${uploadedDocFilename}" is now indexed in RAG Base (${data.material.chunkCount || 4} vector chunks).`);
        setStatusMessage(`🎉 Document persisted to Document RAG Base under Week ${selectedWeek} Day ${selectedDayInWeek}.`);
      }
    } catch (e: any) {
      setStatusMessage(`⚠️ RAG Indexing Error: ${e.message}`);
    } finally {
      setIsSavingToRAG(false);
    }
  };

  // ----------------------------------------------------
  // PURE AI VOICE ENGINE & SPEECH SYNTHESIZER
  // ----------------------------------------------------
  const speakAIUtterance = (text: string) => {
    if (isSpeechMuted || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.02;

      utterance.onstart = () => {
        setIsSpeaking(true);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        // Auto-listen if enabled and not finished (step 5 is the done state)
        if (autoListenEnabled && voiceStep < 5) {
          setTimeout(() => {
            handleStartVoiceListening();
          }, 400);
        }
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
      };

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error('Speech error:', e);
      setIsSpeaking(false);
    }
  };

  // Start voice listening with Web Speech API
  const handleStartVoiceListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      return;
    }

    if (isListening) return;

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((r: any) => r[0].transcript)
          .join('');
        setVoiceInput(transcript);

        if (event.results[0].isFinal) {
          setIsListening(false);
          handleSendVoiceMessage(transcript);
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error('Mic start error:', err);
      setIsListening(false);
    }
  };

  const handleStopVoiceListening = () => {
    setIsListening(false);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  // AI Voice Conversational Message Sender
  const handleSendVoiceMessage = async (overrideMsg?: string) => {
    const msg = (overrideMsg || voiceInput).trim();
    if (!msg) return;

    // Automatically ensure full screen voice synthesis mode is active
    setIsVoiceFullScreen(true);

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setVoiceTranscriptFeed((prev) => [...prev, { sender: 'teacher', text: msg, time: timeStr }]);
    setVoiceInput('');
    setIsVoiceLoading(true);

    const token = localStorage.getItem('ts_token');
    try {
      const { ok, data } = await safeFetchJson<{ nextStep: number; reply: string; state: any }>('/api/ai/voice-exam-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          step: voiceStep,
          userMessage: msg,
          currentState: voiceAssistantState,
        }),
      });

      if (ok && data) {
        setVoiceStep(data.nextStep);
        setVoiceAssistantState(data.state || {});
        setLastAIPrompt(data.reply);
        setVoiceTranscriptFeed((prev) => [
          ...prev,
          { sender: 'ai', text: data.reply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
        ]);

        // Speak the reply out loud to the professor
        speakAIUtterance(data.reply);

        if (data.nextStep >= 5 && data.state?.createdExam) {
          fetchExistingAssessments();
          if (data.state.published) {
            setStatusMessage(`🎉 AI Voice Assistant successfully published: "${data.state.createdExam.title}"!`);
          }
        }
      }
    } catch (e) {
      console.error('Voice Assistant Error:', e);
    } finally {
      setIsVoiceLoading(false);
    }
  };

  const handleResetVoiceSession = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsListening(false);
    setIsSpeaking(false);
    setVoiceStep(1);
    setVoiceAssistantState({});
    setLastAIPrompt(INITIAL_AI_GREETING);
    setVoiceTranscriptFeed([
      {
        sender: 'ai',
        text: INITIAL_AI_GREETING,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setTimeout(() => speakAIUtterance(INITIAL_AI_GREETING), 200);
  };

  // NOTE: AI Voice now only activates when user explicitly selects Option B or the voice tab.
  // No auto-speak on mount or tab change.

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-slate-900 dark:text-slate-100">
      {/* Top Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-black text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
              FACULTY ASSESSMENT STUDIO
            </span>
            <span className="text-xs font-mono font-black text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-950 px-2.5 py-0.5 rounded-full border border-purple-200 dark:border-purple-800">
              AI CONVERSATIONAL VOICE ENGINE
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-950 dark:text-white mt-1">Examination Creator & Voice Synthesizer</h1>
          <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
            Create exams using interactive Voice AI conversation with instant speech-to-text, or use standard manual creation.
          </p>
        </div>

        {/* Top Quick Action */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('documents')}
            className="px-3.5 py-2 rounded-xl text-xs font-black bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950 dark:hover:bg-indigo-900 text-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Database className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            Open Document RAG Base &rarr;
          </button>
        </div>
      </div>

      {/* Explicit Exam Creation Mode Selectors: Option A vs Option B */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* OPTION A: UPLOAD PDF / SYLLABUS DOCUMENT */}
        <div
          onClick={() => {
            setActiveTab('create');
            setIsVoiceFullScreen(false);
          }}
          className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-4 ${
            activeTab === 'create'
              ? 'bg-indigo-50/70 dark:bg-indigo-950/60 border-indigo-600 shadow-md ring-2 ring-indigo-500/20'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-300'
          }`}
        >
          <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-sm">
            <Upload className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-black bg-indigo-100 dark:bg-indigo-900/80 text-indigo-800 dark:text-indigo-200 px-2 py-0.5 rounded-full border border-indigo-300 dark:border-indigo-700 uppercase">
                OPTION A
              </span>
              <span className="text-xs font-black text-slate-950 dark:text-white">Direct Upload PDF / Document</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
              Upload PDF syllabus, Word documents, lecture slides, or markdown. AI parses text to synthesize custom MCQs and index into RAG vector store.
            </p>
          </div>
        </div>

        {/* OPTION B: VOICE EXAM CREATOR */}
        <div
          onClick={() => {
            setActiveTab('voice_assistant');
            setIsVoiceFullScreen(true);
            // Only speak greeting when user explicitly selects Option B
            if (voiceStep === 1) {
              setTimeout(() => speakAIUtterance(lastAIPrompt), 400);
            }
          }}
          className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-4 ${
            activeTab === 'voice_assistant'
              ? 'bg-purple-50/70 dark:bg-purple-950/60 border-purple-600 shadow-md ring-2 ring-purple-500/20'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-purple-300'
          }`}
        >
          <div className="w-12 h-12 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-sm">
            <Mic className="w-6 h-6 animate-pulse" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-black bg-purple-100 dark:bg-purple-900/80 text-purple-800 dark:text-purple-200 px-2 py-0.5 rounded-full border border-purple-300 dark:border-purple-700 uppercase">
                OPTION B
              </span>
              <span className="text-xs font-black text-slate-950 dark:text-white">AI Voice Exam Creator (Fullscreen)</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
              Conduct a 5-step speech dialog with AI to synthesize full curriculum examinations, speak topic prompts, and auto-broadcast to students.
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Tab Bar */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 rounded-xl border shadow-sm gap-2 overflow-x-auto">
        <button
          onClick={() => {
            setActiveTab('create');
            setIsVoiceFullScreen(false);
          }}
          className={`py-3.5 px-3 text-xs font-black flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'create'
              ? 'border-indigo-600 text-indigo-700 dark:text-indigo-400'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
          }`}
        >
          <Upload className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          Option A: Upload PDF & Custom Exam Builder
        </button>

        <button
          onClick={() => {
            setActiveTab('voice_assistant');
            setIsVoiceFullScreen(true);
            // Speak only when user explicitly clicks the Voice tab
            if (voiceStep === 1) setTimeout(() => speakAIUtterance(lastAIPrompt), 400);
          }}
          className={`py-3.5 px-3 text-xs font-black flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'voice_assistant'
              ? 'border-purple-600 text-purple-700 dark:text-purple-400'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
          }`}
        >
          <Mic className="w-4 h-4 text-purple-600 dark:text-purple-400 animate-pulse" />
          Option B: AI Voice Exam Creator (5-Step Voice Flow)
        </button>

        <button
          onClick={() => {
            setActiveTab('published_exams');
            setIsVoiceFullScreen(false);
          }}
          className={`py-3.5 px-3 text-xs font-black flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'published_exams'
              ? 'border-indigo-600 text-indigo-700 dark:text-indigo-400'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          Published Exams Catalog ({assessments.length})
        </button>
      </div>

      {statusMessage && (
        <div className="p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 text-indigo-950 dark:text-indigo-200 text-xs font-black flex items-center justify-between shadow-xs">
          <span>{statusMessage}</span>
          <button onClick={() => setStatusMessage(null)} className="text-indigo-700 dark:text-indigo-300 hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: FUTURISTIC AI VOICE EXAM CREATION CONVERSATION (5-STEP FLOW)       */}
      {/* ========================================================================= */}
      {activeTab === 'voice_assistant' && (
        <div
          className={`${
            isVoiceFullScreen
              ? 'fixed inset-0 z-50 bg-slate-950 text-slate-100 p-6 flex flex-col justify-between overflow-y-auto'
              : 'space-y-6'
          }`}
        >
          {/* Futuristic Control Hub Header */}
          <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-purple-950 text-white p-6 rounded-2xl border border-indigo-900/60 shadow-xl relative overflow-hidden">
            {/* Ambient Background Glow Nodes */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10px] font-mono font-black px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                    <Radio className="w-3 h-3 text-purple-400 animate-ping" />
                    VOICE SYNTHESIS ACTIVE • STEP {Math.min(voiceStep, 5)} OF 5
                  </span>
                  {voiceAssistantState.topic && (
                    <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-[10px] font-mono font-black px-2.5 py-0.5 rounded-full">
                      TOPIC: {voiceAssistantState.topic}
                    </span>
                  )}
                </div>
                <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                  <Bot className="w-6 h-6 text-amber-400 animate-pulse" />
                  Conversational Exam Synthesis Protocol
                </h2>
                <p className="text-xs text-indigo-200 font-medium max-w-xl">
                  Step through: 1. Topic &rarr; 2. Week & Day &rarr; 3. How Many Questions &rarr; 4. Review & Publish &rarr; 5. Live!
                </p>
              </div>

              {/* Full-Screen & Reset Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsVoiceFullScreen(!isVoiceFullScreen)}
                  className="bg-white/10 hover:bg-white/20 text-white font-black text-xs px-3.5 py-2 rounded-xl border border-white/20 flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Toggle Fullscreen Futuristic Canvas"
                >
                  {isVoiceFullScreen ? (
                    <>
                      <Minimize2 className="w-4 h-4 text-amber-400" /> Exit Fullscreen
                    </>
                  ) : (
                    <>
                      <Maximize2 className="w-4 h-4 text-amber-400" /> Fullscreen Mode
                    </>
                  )}
                </button>

                <button
                  onClick={handleResetVoiceSession}
                  className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-black text-xs px-3 py-2 rounded-xl border border-rose-500/30 transition-all cursor-pointer"
                >
                  Reset Session
                </button>
              </div>
            </div>

            {/* 5-Step Visual Stepper HUD */}
            <div className="grid grid-cols-5 gap-2 mt-6 pt-4 border-t border-indigo-900/60 text-center relative z-10">
              {[
                { step: 1, label: '1. Topic' },
                { step: 2, label: '2. Week & Day' },
                { step: 3, label: '3. Questions' },
                { step: 4, label: '4. Publish?' },
                { step: 5, label: '5. Live! 🚀' },
              ].map((s) => {
                const isActive = voiceStep === s.step;
                const isCompleted = voiceStep > s.step;
                return (
                  <div
                    key={s.step}
                    className={`p-2.5 rounded-xl border transition-all ${
                      isActive
                        ? 'bg-amber-400/20 border-amber-400 text-amber-300 font-black scale-105 shadow-md shadow-amber-500/10'
                        : isCompleted
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-bold'
                        : 'bg-white/5 border-white/10 text-slate-400 font-medium'
                    }`}
                  >
                    <span className="text-[11px] block font-mono">{s.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* PURE VOICE SYNTHESIZER INTERACTION TERMINAL (NO CHAT BAR)                */}
          {/* ========================================================================= */}
          <div className="bg-slate-950 border border-indigo-900/60 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden space-y-6">
            {/* Ambient Background Nodes */}
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

            {/* Central Holographic Voice Core */}
            <div className="flex flex-col items-center justify-center text-center space-y-4 relative z-10 py-6">
              {/* Pulsing Voice Orb */}
              <div className="relative flex items-center justify-center">
                <div
                  className={`absolute w-36 h-36 rounded-full transition-all duration-700 ${
                    isListening
                      ? 'bg-rose-500/30 animate-ping'
                      : isSpeaking
                      ? 'bg-purple-500/30 animate-pulse'
                      : isVoiceLoading
                      ? 'bg-amber-500/30 animate-spin'
                      : 'bg-indigo-500/15'
                  }`}
                />
                <div
                  className={`absolute w-28 h-28 rounded-full transition-all duration-500 ${
                    isListening
                      ? 'bg-rose-500/40 animate-pulse'
                      : isSpeaking
                      ? 'bg-indigo-500/40 animate-ping'
                      : 'bg-indigo-500/20'
                  }`}
                />

                <button
                  type="button"
                  onClick={isListening ? handleStopVoiceListening : handleStartVoiceListening}
                  className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl cursor-pointer ${
                    isListening
                      ? 'bg-gradient-to-tr from-rose-600 to-red-500 text-white shadow-rose-600/60 scale-110'
                      : isSpeaking
                      ? 'bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-indigo-600/50'
                      : isVoiceLoading
                      ? 'bg-amber-500 text-slate-950 shadow-amber-500/50 animate-pulse'
                      : 'bg-gradient-to-tr from-indigo-700 to-purple-800 text-white hover:scale-105 shadow-indigo-700/40'
                  }`}
                  title={isListening ? 'Listening... Tap to stop' : 'Tap to speak your answer'}
                >
                  {isListening ? (
                    <Mic className="w-9 h-9 animate-bounce" />
                  ) : isSpeaking ? (
                    <Volume2 className="w-9 h-9 animate-pulse" />
                  ) : isVoiceLoading ? (
                    <Loader2 className="w-9 h-9 animate-spin" />
                  ) : (
                    <Mic className="w-9 h-9 text-amber-300" />
                  )}
                </button>
              </div>

              {/* Status Header */}
              <div className="space-y-1">
                <span
                  className={`text-xs font-mono font-black px-3 py-1 rounded-full border inline-flex items-center gap-1.5 ${
                    isListening
                      ? 'bg-rose-500/20 border-rose-500/50 text-rose-300'
                      : isSpeaking
                      ? 'bg-purple-500/20 border-purple-500/50 text-purple-300'
                      : isVoiceLoading
                      ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                      : 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                  }`}
                >
                  {isListening ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
                      LISTENING TO YOUR SPEECH...
                    </>
                  ) : isSpeaking ? (
                    <>
                      <Volume2 className="w-3.5 h-3.5 animate-pulse text-purple-300" />
                      AI VOICE SPEAKING
                    </>
                  ) : isVoiceLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-300" />
                      SYNTHESIZING QUESTIONS...
                    </>
                  ) : (
                    <>
                      <Bot className="w-3.5 h-3.5 text-emerald-400" />
                      VOICE READY • TAP MIC OR SPEAK
                    </>
                  )}
                </span>

                <h3 className="text-xl md:text-2xl font-black text-white max-w-2xl mx-auto leading-relaxed pt-2">
                  "{lastAIPrompt}"
                </h3>
              </div>

              {/* Dynamic Spoken User Transcription Caption */}
              {voiceInput && (
                <div className="bg-indigo-950/70 border border-indigo-500/50 px-4 py-2 rounded-2xl max-w-xl text-xs font-mono text-amber-300 flex items-center gap-2">
                  <Mic className="w-4 h-4 text-rose-400 animate-pulse shrink-0" />
                  <span>Hearing: "{voiceInput}"</span>
                </div>
              )}

              {/* Audio Waveform Spectrum Equalizer */}
              <div className="flex items-center gap-1.5 h-9 px-6 bg-slate-900/90 rounded-2xl border border-indigo-900/50">
                {[30, 60, 90, 45, 80, 100, 65, 85, 40, 95, 75, 50, 90, 60, 100, 35, 70, 50].map((h, i) => (
                  <div
                    key={i}
                    className={`w-1 rounded-full transition-all duration-200 ${
                      isListening
                        ? 'bg-rose-500'
                        : isSpeaking
                        ? 'bg-purple-400'
                        : isVoiceLoading
                        ? 'bg-amber-400'
                        : 'bg-indigo-500/40'
                    }`}
                    style={{ height: isListening || isSpeaking || isVoiceLoading ? `${h}%` : '20%' }}
                  />
                ))}
              </div>
            </div>

            {/* Voice Control Buttons Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-indigo-900/60 relative z-10">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => speakAIUtterance(lastAIPrompt)}
                  className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-3.5 py-2 rounded-xl border border-white/20 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5 text-amber-300" />
                  Repeat Prompt
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (!isSpeechMuted && 'speechSynthesis' in window) {
                      window.speechSynthesis.cancel();
                    }
                    setIsSpeechMuted(!isSpeechMuted);
                  }}
                  className={`text-xs px-3.5 py-2 rounded-xl font-bold border transition-all cursor-pointer ${
                    isSpeechMuted
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
                  }`}
                >
                  {isSpeechMuted ? '🔇 Voice Audio: Muted' : '🔊 Voice Audio: On'}
                </button>

                <button
                  type="button"
                  onClick={() => setAutoListenEnabled(!autoListenEnabled)}
                  className={`text-xs px-3.5 py-2 rounded-xl font-bold border transition-all cursor-pointer ${
                    autoListenEnabled
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
                  }`}
                >
                  {autoListenEnabled ? '✨ Auto-Listen: On' : 'Manual Mic Only'}
                </button>
              </div>

              {/* Main Spoken Action Button */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={isListening ? handleStopVoiceListening : handleStartVoiceListening}
                  className={`font-black text-xs px-6 py-2.5 rounded-xl shadow-lg flex items-center gap-2 transition-all cursor-pointer ${
                    isListening
                      ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/40 animate-pulse'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/40'
                  }`}
                >
                  {isListening ? (
                    <>
                      <MicOff className="w-4 h-4" />
                      Stop Listening
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4 text-amber-300" />
                      Tap to Speak Answer
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Quick Spoken Voice Shortcut Chips */}
            <div className="pt-2 border-t border-indigo-900/40 space-y-2">
              <div className="text-[11px] font-mono text-indigo-300 font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                Spoken Voice Shortcuts (Tap or Speak out loud):
              </div>

              <div className="flex flex-wrap gap-2">
                {/* Step 1: Topic shortcuts */}
                {voiceStep === 1 && (
                  <>
                    <button type="button" onClick={() => handleSendVoiceMessage('Performance Management and OKR Metrics')}
                      className="bg-white/10 hover:bg-indigo-600 text-white text-xs px-3 py-1.5 rounded-xl border border-white/15 transition-all cursor-pointer">
                      🗣️ "Performance Management & OKRs"
                    </button>
                    <button type="button" onClick={() => handleSendVoiceMessage('Strategic Talent Acquisition and Workforce Architecture')}
                      className="bg-white/10 hover:bg-indigo-600 text-white text-xs px-3 py-1.5 rounded-xl border border-white/15 transition-all cursor-pointer">
                      🗣️ "Strategic Talent Acquisition"
                    </button>
                    <button type="button" onClick={() => handleSendVoiceMessage('Competency Mapping and 360 Feedback Systems')}
                      className="bg-white/10 hover:bg-indigo-600 text-white text-xs px-3 py-1.5 rounded-xl border border-white/15 transition-all cursor-pointer">
                      🗣️ "Competency Mapping"
                    </button>
                  </>
                )}

                {/* Step 2: Week & Day shortcuts */}
                {voiceStep === 2 && (
                  <>
                    <button type="button" onClick={() => handleSendVoiceMessage('Week 1 Day 3')}
                      className="bg-white/10 hover:bg-indigo-600 text-white text-xs px-3 py-1.5 rounded-xl border border-white/15 transition-all cursor-pointer">
                      🗣️ "Week 1 Day 3"
                    </button>
                    <button type="button" onClick={() => handleSendVoiceMessage('Week 2 Day 1')}
                      className="bg-white/10 hover:bg-indigo-600 text-white text-xs px-3 py-1.5 rounded-xl border border-white/15 transition-all cursor-pointer">
                      🗣️ "Week 2 Day 1"
                    </button>
                    <button type="button" onClick={() => handleSendVoiceMessage('Week 3 Day 2')}
                      className="bg-white/10 hover:bg-indigo-600 text-white text-xs px-3 py-1.5 rounded-xl border border-white/15 transition-all cursor-pointer">
                      🗣️ "Week 3 Day 2"
                    </button>
                    <button type="button" onClick={() => handleSendVoiceMessage('Week 4 Day 5')}
                      className="bg-white/10 hover:bg-indigo-600 text-white text-xs px-3 py-1.5 rounded-xl border border-white/15 transition-all cursor-pointer">
                      🗣️ "Week 4 Day 5"
                    </button>
                  </>
                )}

                {/* Step 3: Question count shortcuts */}
                {voiceStep === 3 && (
                  <>
                    <button type="button" onClick={() => handleSendVoiceMessage('3 questions')}
                      className="bg-white/10 hover:bg-indigo-600 text-white text-xs px-3 py-1.5 rounded-xl border border-white/15 transition-all cursor-pointer">
                      🗣️ "3 questions"
                    </button>
                    <button type="button" onClick={() => handleSendVoiceMessage('5 questions')}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black px-4 py-1.5 rounded-xl shadow-md transition-all cursor-pointer">
                      🗣️ "5 questions"
                    </button>
                    <button type="button" onClick={() => handleSendVoiceMessage('10 questions')}
                      className="bg-white/10 hover:bg-indigo-600 text-white text-xs px-3 py-1.5 rounded-xl border border-white/15 transition-all cursor-pointer">
                      🗣️ "10 questions"
                    </button>
                  </>
                )}

                {/* Step 4: Publish shortcuts */}
                {voiceStep === 4 && (
                  <>
                    <button type="button" onClick={() => handleSendVoiceMessage('Yes publish it')}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black px-4 py-1.5 rounded-xl shadow-lg shadow-emerald-600/40 transition-all cursor-pointer flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      🗣️ "Yes, Publish!" 🚀
                    </button>
                    <button type="button" onClick={() => handleSendVoiceMessage('Save as draft')}
                      className="bg-white/10 hover:bg-white/20 text-white text-xs px-3 py-1.5 rounded-xl border border-white/15 transition-all cursor-pointer">
                      🗣️ "Save as draft"
                    </button>
                  </>
                )}

                {/* Step 5: Done - create another */}
                {voiceStep >= 5 && (
                  <button type="button" onClick={handleResetVoiceSession}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black px-4 py-1.5 rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5" />
                    Create Another Exam
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Generated Questions Preview Display Card (Step 4 & 5) */}
          {voiceAssistantState.questions && voiceAssistantState.questions.length > 0 && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
                <div>
                  <h3 className="font-black text-base text-slate-950 dark:text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    AI Synthesized Questions ({voiceAssistantState.questions.length} Questions • {voiceAssistantState.totalMarks} Marks)
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Topic: "{voiceAssistantState.topic}" • Target: {voiceAssistantState.createdExam?.dayLabel || `Week ${voiceAssistantState.createdExam?.weekId || 1} Day ${voiceAssistantState.createdExam?.dayId || 1}`}
                  </p>
                </div>

                {voiceStep === 4 ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleSendVoiceMessage('Yes publish it')}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-4 py-2 rounded-xl shadow-lg shadow-emerald-600/30 flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      🚀 Publish to Students
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSendVoiceMessage('Save as draft')}
                      className="bg-white/10 hover:bg-white/20 text-white text-xs px-3 py-2 rounded-xl border border-white/15 transition-all cursor-pointer"
                    >
                      Save as Draft
                    </button>
                  </div>
                ) : (
                  <span className="text-[10px] bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 font-mono font-black px-2.5 py-1 rounded-full border border-emerald-300 dark:border-emerald-800">
                    STATUS: PUBLISHED LIVE
                  </span>
                )}
              </div>

              <div className="space-y-3">
                {voiceAssistantState.questions.map((q: any, qIdx: number) => (
                  <div
                    key={q.id || qIdx}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-xs font-black text-slate-950 dark:text-white leading-relaxed">
                        Q{qIdx + 1}. {q.text}
                      </span>
                      <span className="text-[10px] bg-indigo-100 dark:bg-indigo-950 text-indigo-900 dark:text-indigo-300 px-2 py-0.5 rounded-full font-mono font-black shrink-0">
                        {q.marks || 10} Marks
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {q.options?.map((opt: string, optIdx: number) => (
                        <div
                          key={optIdx}
                          className={`p-2.5 rounded-lg text-xs font-medium border flex items-center gap-2 ${
                            optIdx === q.correctAnswer
                              ? 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-400 dark:border-emerald-700 text-emerald-950 dark:text-emerald-200 font-bold'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white flex items-center justify-center text-[10px] font-black">
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span>{opt}</span>
                          {optIdx === q.correctAnswer && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 ml-auto shrink-0" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Live Exam Published Celebration Modal Banner (Step 5) */}
          {voiceStep >= 5 && voiceAssistantState.createdExam && (
            <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-900 via-teal-900 to-indigo-900 text-white shadow-xl border border-emerald-500/40 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span className="text-xs font-mono font-black text-emerald-300">EXAMINATION BROADCAST COMPLETED</span>
                </div>
                <h3 className="text-xl font-black">{voiceAssistantState.createdExam.title}</h3>
                <p className="text-xs text-emerald-100 font-medium">
                  The test has been published and all enrolled students have received a push notification to attempt it.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => onNavigate('results_hub')}
                  className="bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Go to Results Hub &rarr;
                </button>
                <button
                  onClick={() => onNavigate('assessments')}
                  className="bg-white/15 hover:bg-white/25 text-white font-black text-xs px-4 py-2.5 rounded-xl border border-white/20 transition-all cursor-pointer"
                >
                  View Student Hub
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: STANDARD EXAM CREATOR FORM WITH DIRECT DOCUMENT UPLOAD & RAG       */}
      {/* ========================================================================= */}
      {activeTab === 'create' && (
        <div className="space-y-6">
          {/* SECTION A: UPLOAD YOUR OWN DOCUMENT / PDF FOR AI QUESTION SYNTHESIS */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-indigo-200 dark:border-indigo-900/70 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-black text-base text-slate-950 dark:text-white flex items-center gap-2">
                  <Upload className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  Upload Document / PDF for Questions & RAG Base
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Upload your syllabus PDF, Word document, lecture notes, or slides. AI will extract the content to synthesize custom questions and index into the RAG vector base.
                </p>
              </div>
              <span className="text-[10px] font-mono font-black text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-1 rounded-full border border-indigo-200 dark:border-indigo-800">
                PDF • DOCX • PPTX • TXT • CSV
              </span>
            </div>

            {/* Drag & Drop File Selector */}
            <div className="border-2 border-dashed border-indigo-200 hover:border-indigo-400 dark:border-indigo-900 dark:hover:border-indigo-700 bg-indigo-50/40 dark:bg-indigo-950/20 rounded-2xl p-6 text-center space-y-3 transition-all">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto shadow-sm">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <label className="text-xs font-black text-slate-900 dark:text-slate-100 block cursor-pointer">
                  <span className="text-indigo-600 dark:text-indigo-400 hover:underline">Click to browse file</span> or drag and drop your document here
                  <input
                    type="file"
                    onChange={handleStandardDocumentUpload}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.md,.csv,.json"
                  />
                </label>
                <p className="text-[11px] text-slate-500 font-mono mt-1">
                  Supported formats: PDF, Word (.docx), PowerPoint (.pptx), Text (.txt, .md), CSV (Max 50MB)
                </p>
              </div>

              {/* Uploaded File Telemetry Badge */}
              {uploadedDocFilename && (
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-indigo-200 dark:border-indigo-800 text-left space-y-2 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      <span className="text-xs font-black text-slate-950 dark:text-white">{uploadedDocFilename}</span>
                      <span className="text-[10px] font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full text-slate-700 dark:text-slate-300">
                        {uploadedDocSize} • {uploadedDocLines} lines • {uploadedDocWords} words
                      </span>
                    </div>
                    <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Ready for AI Synthesis
                    </span>
                  </div>

                  {/* Instant Document Actions */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={handleGenerateQuestionsFromDoc}
                      disabled={isGeneratingQuestions}
                      className="bg-purple-600 hover:bg-purple-700 text-white font-black text-xs px-4 py-2 rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      {isGeneratingQuestions ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      )}
                      ✨ Synthesize Questions from this Uploaded File
                    </button>

                    <button
                      type="button"
                      onClick={handleSaveUploadedDocToRAG}
                      disabled={isSavingToRAG}
                      className="bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950 dark:hover:bg-indigo-900 text-indigo-950 dark:text-indigo-200 font-bold text-xs px-3.5 py-2 rounded-xl border border-indigo-200 dark:border-indigo-800 flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      {isSavingToRAG ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                      ) : (
                        <Database className="w-3.5 h-3.5 text-indigo-600" />
                      )}
                      💾 Index into Document RAG Base
                    </button>

                    {docRAGSuccess && (
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        {docRAGSuccess}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* SECTION B: DIRECT EXAMINATION BLUEPRINT & SETTINGS */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <h3 className="font-black text-base text-slate-950 dark:text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Direct Examination Blueprint
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-black text-slate-900 dark:text-slate-100 mb-1">
                  Week & Day Selection
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={selectedWeek}
                    onChange={(e) => setSelectedWeek(Number(e.target.value))}
                    className="p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-950 dark:text-slate-100"
                  >
                    {[1, 2, 3, 4].map((w) => (
                      <option key={w} value={w}>
                        Week {w}
                      </option>
                    ))}
                  </select>

                  <select
                    value={selectedDayInWeek}
                    onChange={(e) => setSelectedDayInWeek(Number(e.target.value))}
                    className="p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-950 dark:text-slate-100"
                  >
                    {[1, 2, 3, 4, 5].map((d) => (
                      <option key={d} value={d}>
                        Day {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-900 dark:text-slate-100 mb-1">
                  Subject / Topic
                </label>
                <input
                  type="text"
                  value={examSubject}
                  onChange={(e) => setExamSubject(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-950 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-900 dark:text-slate-100 mb-1">
                  Examination Title
                </label>
                <input
                  type="text"
                  value={examTitle}
                  onChange={(e) => setExamTitle(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-950 dark:text-slate-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-black text-slate-900 dark:text-slate-100 mb-1">
                  Difficulty
                </label>
                <select
                  value={examDifficulty}
                  onChange={(e) => setExamDifficulty(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-950 dark:text-slate-100"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-900 dark:text-slate-100 mb-1">
                  Questions to Generate
                </label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={numQuestionsToGenerate}
                  onChange={(e) => setNumQuestionsToGenerate(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-950 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-900 dark:text-slate-100 mb-1">
                  Duration (Minutes)
                </label>
                <input
                  type="number"
                  min={5}
                  max={180}
                  value={examDuration}
                  onChange={(e) => setExamDuration(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-950 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-900 dark:text-slate-100 mb-1">
                  Passing Marks
                </label>
                <input
                  type="number"
                  min={1}
                  value={examPassingMarks}
                  onChange={(e) => setExamPassingMarks(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-950 dark:text-slate-100"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={handleGenerateQuestionsAI}
                disabled={isGeneratingQuestions}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-black text-xs px-5 py-3 rounded-xl shadow-sm flex items-center gap-2 transition-all cursor-pointer"
              >
                {isGeneratingQuestions ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-amber-300" />}
                <span>Synthesize with AI</span>
              </button>

              <button
                onClick={() => setShowAddCustomModal(true)}
                className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-950 dark:text-slate-100 font-black text-xs px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Add Question Manually
              </button>
            </div>
          </div>

          {/* Question Preview & Explicit Teacher Confirmation Section */}
          {questionsList.length > 0 && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border-2 border-indigo-300 dark:border-indigo-800 shadow-md space-y-5">
              {/* Header and Status */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-black bg-indigo-100 text-indigo-900 dark:bg-indigo-950 dark:text-indigo-300 px-2.5 py-0.5 rounded-full border border-indigo-300 dark:border-indigo-700">
                      STEP 3 • PREVIEW & VERIFICATION
                    </span>
                    <span
                      className={`text-[10px] font-mono font-black px-2.5 py-0.5 rounded-full border ${
                        isQuestionsConfirmed
                          ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-400 dark:border-emerald-700'
                          : 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border-amber-300 dark:border-amber-700'
                      }`}
                    >
                      {isQuestionsConfirmed ? '✅ VERIFIED & AUTHORIZED' : '🔒 PENDING TEACHER CONFIRMATION'}
                    </span>
                  </div>
                  <h3 className="font-black text-lg text-slate-950 dark:text-white mt-1 flex items-center gap-2">
                    <Eye className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    Generated Questions Preview ({questionsList.length} Items • {questionsList.reduce((acc, q) => acc + (q.marks || 10), 0)} Total Marks)
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                    Review each synthesized question below. Check the instructor confirmation checkbox to authorize publishing to the database.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSaveExam(false)}
                    disabled={isSavingExam}
                    className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-950 dark:text-slate-100 font-black text-xs px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 transition-all cursor-pointer shadow-xs"
                  >
                    Save as Draft
                  </button>
                  <button
                    onClick={() => handleSaveExam(true)}
                    disabled={isSavingExam || !isQuestionsConfirmed}
                    className={`font-black text-xs px-5 py-2.5 rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer ${
                      isQuestionsConfirmed
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed border border-slate-300 dark:border-slate-700'
                    }`}
                    title={
                      isQuestionsConfirmed
                        ? 'Publish and broadcast exam to students'
                        : 'Please check the teacher confirmation box below to enable publishing'
                    }
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    🚀 Publish & Broadcast Exam
                  </button>
                </div>
              </div>

              {/* Explicit Teacher Confirmation Checkbox Box */}
              <div
                className={`p-4 rounded-xl border-2 transition-all flex items-start gap-3 cursor-pointer ${
                  isQuestionsConfirmed
                    ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-700'
                    : 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700'
                }`}
                onClick={() => setIsQuestionsConfirmed(!isQuestionsConfirmed)}
              >
                <input
                  type="checkbox"
                  id="teacher-preview-confirm"
                  checked={isQuestionsConfirmed}
                  onChange={(e) => setIsQuestionsConfirmed(e.target.checked)}
                  className="mt-0.5 w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer accent-emerald-600 shrink-0"
                />
                <label htmlFor="teacher-preview-confirm" className="text-xs space-y-0.5 cursor-pointer select-none">
                  <span className="font-black text-slate-950 dark:text-white block">
                    Teacher Authorization & Syllabus Verification Statement
                  </span>
                  <span className="text-slate-700 dark:text-slate-300 font-medium block">
                    I, as the course instructor, have reviewed the synthesized questions, correct answer keys, and difficulty alignment for <strong className="text-indigo-600 dark:text-indigo-400">Week {selectedWeek} Day {selectedDayInWeek} ("{examSubject}")</strong>. I officially authorize this test for live student administration.
                  </span>
                </label>
              </div>

              {/* Questions List Render */}
              <div className="space-y-3">
                {questionsList.map((q, idx) => (
                  <div
                    key={q.id || idx}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-xs font-black text-slate-950 dark:text-white leading-relaxed">
                        <span className="text-indigo-600 dark:text-indigo-400 font-mono mr-1.5">Q{idx + 1}.</span> {q.text}
                      </span>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] bg-indigo-100 dark:bg-indigo-950 text-indigo-900 dark:text-indigo-300 font-mono font-black px-2 py-0.5 rounded-full">
                          {q.marks || 10} Marks
                        </span>
                        <button
                          onClick={() => handleRemoveQuestion(idx)}
                          className="text-rose-600 hover:text-rose-800 p-1 cursor-pointer"
                          title="Remove question"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {q.options?.map((opt: string, oIdx: number) => (
                        <div
                          key={oIdx}
                          className={`p-2.5 rounded-lg text-xs font-medium border flex items-center gap-2 transition-all ${
                            oIdx === q.correctAnswer
                              ? 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-400 dark:border-emerald-700 text-emerald-950 dark:text-emerald-200 font-bold shadow-xs'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          <span
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                              oIdx === q.correctAnswer
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white'
                            }`}
                          >
                            {String.fromCharCode(65 + oIdx)}
                          </span>
                          <span className="flex-1">{opt}</span>
                          {oIdx === q.correctAnswer && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 ml-auto shrink-0" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: PUBLISHED EXAMS CATALOG + SEND EMAIL                               */}
      {/* ========================================================================= */}
      {activeTab === 'published_exams' && (
        <div className="space-y-6">
          {/* Send Email Panel */}
          <SendExamEmailPanel assessments={assessments} user={user} />

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-base text-slate-950 dark:text-white flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Existing Assessments Catalog ({assessments.length})
            </h3>
            <button
              onClick={() => onNavigate('results_hub')}
              className="text-xs text-indigo-700 dark:text-indigo-400 hover:underline font-black cursor-pointer"
            >
              View Student Submissions in Results Hub &rarr;
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assessments.map((a) => (
              <div
                key={a.id}
                className="p-5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-black text-indigo-700 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-950 px-2 py-0.5 rounded-full">
                    {a.dayLabel || `Day ${a.dayId}`}
                  </span>
                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                      a.isPublished
                        ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300'
                    }`}
                  >
                    {a.isPublished ? 'LIVE' : 'DRAFT'}
                  </span>
                </div>

                <h4 className="text-xs font-black text-slate-950 dark:text-white">{a.title}</h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2">{a.description}</p>

                <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 font-mono pt-2 border-t border-slate-200 dark:border-slate-700 font-semibold">
                  <span>{a.questions?.length || 5} Questions</span>
                  <span>{a.totalMarks} Marks</span>
                  <span>{a.durationMinutes} Mins</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        </div>
      )}

      {/* Manual Custom Question Modal */}
      {showAddCustomModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-black text-base text-slate-950 dark:text-white">Add Custom Question</h3>
              <button
                onClick={() => setShowAddCustomModal(false)}
                className="text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-black text-slate-900 dark:text-slate-100 mb-1">
                  Question Text
                </label>
                <textarea
                  value={newQuestionText}
                  onChange={(e) => setNewQuestionText(e.target.value)}
                  rows={2}
                  className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-950 dark:text-slate-100"
                  placeholder="Enter the question..."
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-black text-slate-900 dark:text-slate-100 mb-1">Option A</label>
                  <input
                    type="text"
                    value={newOptionA}
                    onChange={(e) => setNewOptionA(e.target.value)}
                    className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-900 dark:text-slate-100 mb-1">Option B</label>
                  <input
                    type="text"
                    value={newOptionB}
                    onChange={(e) => setNewOptionB(e.target.value)}
                    className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-900 dark:text-slate-100 mb-1">Option C</label>
                  <input
                    type="text"
                    value={newOptionC}
                    onChange={(e) => setNewOptionC(e.target.value)}
                    className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-900 dark:text-slate-100 mb-1">Option D</label>
                  <input
                    type="text"
                    value={newOptionD}
                    onChange={(e) => setNewOptionD(e.target.value)}
                    className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-900 dark:text-slate-100 mb-1">
                  Correct Answer
                </label>
                <select
                  value={newCorrectIdx}
                  onChange={(e) => setNewCorrectIdx(Number(e.target.value))}
                  className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl font-bold"
                >
                  <option value={0}>Option A</option>
                  <option value={1}>Option B</option>
                  <option value={2}>Option C</option>
                  <option value={3}>Option D</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setShowAddCustomModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCustomQuestion}
                className="px-4 py-2 rounded-xl text-xs font-black text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Add Question
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
