import React, { useState, useEffect } from 'react';
import {
  Send,
  Mail,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  Users,
  BookOpen,
  Clock,
  Award,
  AlertCircle,
} from 'lucide-react';
import { Assessment, User } from '../types';
import { safeFetchJson } from '../lib/api';

interface SendExamEmailPageProps {
  user: User;
  onNavigate: (page: string) => void;
}

export const SendExamEmailPage: React.FC<SendExamEmailPageProps> = ({ user, onNavigate }) => {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>('');
  const [recipientEmails, setRecipientEmails] = useState<string>('');
  const [emailMessage, setEmailMessage] = useState<string>('');
  const [isSending, setIsSending] = useState(false);
  const [sendStatus, setSendStatus] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);
  const [loadingExams, setLoadingExams] = useState(true);

  useEffect(() => {
    const fetchAssessments = async () => {
      const token = localStorage.getItem('ts_token');
      const { ok, data } = await safeFetchJson<{ assessments: Assessment[] }>('/api/assessments', {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (ok && data?.assessments) {
        setAssessments(data.assessments.filter((a) => a.isPublished));
      }
      setLoadingExams(false);
    };
    fetchAssessments();
  }, []);

  const selectedExam = assessments.find((a) => a.id === selectedExamId);

  const handleSendEmail = async () => {
    if (!selectedExamId) { setSendError('⚠️ Please select an exam first.'); return; }
    const emails = recipientEmails.split(/[\n,;]+/).map((e) => e.trim()).filter(Boolean);
    if (emails.length === 0) { setSendError('⚠️ Please enter at least one recipient email.'); return; }

    setIsSending(true);
    setSendStatus(null);
    setSendError(null);
    const token = localStorage.getItem('ts_token');

    try {
      const { ok, data } = await safeFetchJson<{ success: boolean; sent: number; message: string }>(
        '/api/teacher/send-exam-email',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            examId: selectedExamId,
            examTitle: selectedExam?.title,
            examDayLabel: selectedExam?.dayLabel,
            examTotalMarks: selectedExam?.totalMarks,
            examDurationMinutes: selectedExam?.durationMinutes,
            examPassingMarks: selectedExam?.passingMarks,
            recipientEmails: emails,
            customMessage: emailMessage,
            senderName: user.name || 'Your Instructor',
          }),
        }
      );

      if (ok && data?.success) {
        setSendStatus(`✅ Exam notification sent to ${data.sent || emails.length} recipient(s) successfully!`);
        setRecipientEmails('');
        setEmailMessage('');
        setSelectedExamId('');
      } else {
        setSendError((data as any)?.message || '⚠️ Failed to send email. Check your SMTP configuration.');
      }
    } catch (e: any) {
      setSendError(`⚠️ Error: ${e.message}`);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-4">
          <button
            onClick={() => onNavigate('exam-creator')}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-md shrink-0">
            <Mail className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">EXAM DISTRIBUTION</span>
            <h1 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">Send Exam Email Notifications</h1>
          </div>
          <span className="ml-auto text-[10px] font-mono font-black bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 px-3 py-1 rounded-full border border-indigo-300 dark:border-indigo-700">
            ESMTP POWERED
          </span>
        </div>
      </div>

      {/* Status messages */}
      {sendStatus && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 rounded-xl text-sm font-bold text-emerald-900 dark:text-emerald-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{sendStatus}</span>
          </div>
          <button onClick={() => setSendStatus(null)} className="text-emerald-700 hover:underline text-xs">Dismiss</button>
        </div>
      )}
      {sendError && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-700 rounded-xl text-sm font-bold text-rose-900 dark:text-rose-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{sendError}</span>
          </div>
          <button onClick={() => setSendError(null)} className="text-rose-700 hover:underline text-xs">Dismiss</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: Exam Selector */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <BookOpen className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-black text-slate-900 dark:text-white">Select Exam</h2>
          </div>

          {loadingExams ? (
            <div className="flex items-center justify-center py-8 text-slate-400">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              <span className="text-xs">Loading published exams...</span>
            </div>
          ) : assessments.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">No published exams found.</p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Create and publish an exam first in the Exam Creator.</p>
              <button
                onClick={() => onNavigate('exam-creator')}
                className="mt-3 text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
              >
                Go to Exam Creator →
              </button>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-2">
                  Published Exam
                </label>
                <select
                  value={selectedExamId}
                  onChange={(e) => setSelectedExamId(e.target.value)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                >
                  <option value="">-- Select a published exam --</option>
                  {assessments.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.title} ({a.dayLabel || `Day ${a.dayId}`})
                    </option>
                  ))}
                </select>
              </div>

              {selectedExam && (
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50 border border-indigo-200 dark:border-indigo-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-mono font-black bg-indigo-200 dark:bg-indigo-900 text-indigo-900 dark:text-indigo-300 px-2 py-0.5 rounded-full">
                      {selectedExam.dayLabel || `Day ${selectedExam.dayId}`}
                    </span>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300">
                      PUBLISHED
                    </span>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                      selectedExam.difficulty === 'Hard' ? 'bg-rose-100 text-rose-800' :
                      selectedExam.difficulty === 'Medium' ? 'bg-amber-100 text-amber-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {selectedExam.difficulty}
                    </span>
                  </div>
                  <p className="text-sm font-black text-slate-900 dark:text-white">{selectedExam.title}</p>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-white dark:bg-slate-900 rounded-lg p-2.5 text-center border border-slate-200 dark:border-slate-800">
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Questions</p>
                      <p className="text-sm font-black text-indigo-600">{selectedExam.questions?.length || 0}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 rounded-lg p-2.5 text-center border border-slate-200 dark:border-slate-800">
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Total Marks</p>
                      <p className="text-sm font-black text-amber-600">{selectedExam.totalMarks}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 rounded-lg p-2.5 text-center border border-slate-200 dark:border-slate-800">
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Duration</p>
                      <p className="text-sm font-black text-slate-700 dark:text-slate-300">{selectedExam.durationMinutes}m</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-400">
                    <Award className="w-3 h-3" />
                    <span>Passing marks: <strong>{selectedExam.passingMarks}</strong> / {selectedExam.totalMarks}</span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* RIGHT: Recipients & Message */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Users className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-black text-slate-900 dark:text-white">Recipients & Message</h2>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-2">
              Recipient Emails
              <span className="ml-1 font-normal text-slate-500 dark:text-slate-400">(comma, semicolon, or new line separated)</span>
            </label>
            <textarea
              value={recipientEmails}
              onChange={(e) => setRecipientEmails(e.target.value)}
              rows={5}
              placeholder={"student1@example.com\nstudent2@example.com\nor: email1@college.edu, email2@college.edu"}
              className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-slate-100 resize-y focus:outline-none focus:border-indigo-500"
            />
            {recipientEmails && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
                📬 {recipientEmails.split(/[\n,;]+/).map(e => e.trim()).filter(Boolean).length} recipient(s) detected
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-2">
              Additional Message
              <span className="ml-1 font-normal text-slate-500 dark:text-slate-400">(optional)</span>
            </label>
            <textarea
              value={emailMessage}
              onChange={(e) => setEmailMessage(e.target.value)}
              rows={4}
              placeholder="Dear students, please note that this exam is scheduled for this week. Ensure you complete it within the time limit. Best of luck!"
              className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 resize-y focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Email Preview Info */}
          <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 space-y-1.5">
            <p className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider">Email Will Include:</p>
            {['Exam title & day/week label', 'Total marks, duration & passing marks', 'Question count & difficulty level', 'Your custom message (if provided)', 'Platform branding & footer'].map((item) => (
              <div key={item} className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-400">
                <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>

          {/* Send Button */}
          <button
            onClick={handleSendEmail}
            disabled={isSending || !selectedExamId || recipientEmails.trim() === ''}
            className={`w-full font-black text-sm py-3 rounded-xl shadow-md flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
              isSending || !selectedExamId || recipientEmails.trim() === ''
                ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:scale-[1.01]'
            }`}
          >
            {isSending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Sending Notifications...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Send Exam Email Notification
              </>
            )}
          </button>
        </div>
      </div>

      {/* Info Footer */}
      <div className="bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-xs font-black text-indigo-900 dark:text-indigo-200">Email Delivery Information</p>
            <p className="text-[11px] text-indigo-700 dark:text-indigo-400 leading-relaxed">
              Emails are sent via the platform's SMTP relay. Configure your SMTP settings in <strong>Security &amp; SMTP</strong> for custom email delivery.
              Large recipient lists may take a few seconds to process. Each recipient will receive an individual email.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
