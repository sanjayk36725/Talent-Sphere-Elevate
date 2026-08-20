import React, { useState } from 'react';
import { Compass, Sparkles, CheckCircle2, ArrowRight, Loader2, Award, Target } from 'lucide-react';
import { CareerRecommendation, StudentProfile } from '../types';
import { safeFetchJson } from '../lib/api';

interface CareerPageProps {
  profile: StudentProfile | null;
  onNavigate?: (page: string) => void;
}

export const CareerPage: React.FC<CareerPageProps> = ({ profile, onNavigate }) => {
  const [targetRole, setTargetRole] = useState(profile?.targetRole || 'AI Talent Architect');
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<CareerRecommendation | null>({
    targetRole: 'AI Talent Architect & Employee Performance Strategist',
    matchPercentage: 82,
    requiredSkills: ['Performance Metrics', 'Data Analytics', 'OKRs & KPIs', 'Strategic Talent Management', 'Python / SQL', 'Leadership Communication'],
    skillGaps: ['Advanced 360 Feedback Systems', 'Strategic Talent Analytics', 'AI Performance Modeling'],
    roadmapPhases: [
      { phase: 1, title: 'Foundations & OKR Alignment', description: 'Master performance management fundamentals, KPI setting, and organizational goals.', duration: '2 Weeks' },
      { phase: 2, title: 'Data-Driven Performance Analytics', description: 'Learn talent analytics metrics, SQL querying, and evaluation dashboards.', duration: '3 Weeks' },
      { phase: 3, title: 'Day-Wise Skill Matrix & Competency Mapping', description: 'Implement dynamic competency maps and skill gap identification workflows.', duration: '2 Weeks' },
      { phase: 4, title: 'AI & RAG Integration in HR Tech', description: 'Build AI-powered career pathing tools and conversational talent bots.', duration: '4 Weeks' },
      { phase: 5, title: '360-Degree Feedback & Leadership Development', description: 'Deploy peer review systems, succession planning, and executive feedback.', duration: '3 Weeks' },
      { phase: 6, title: 'Capstone Portfolio Project', description: 'Design an end-to-end Talent Management & Performance Platform.', duration: '4 Weeks' },
      { phase: 7, title: 'Placement & Industry Interview Prep', description: 'System design, mock technical interviews, and portfolio showcasing.', duration: '2 Weeks' },
    ],
    recommendedProjects: ['AI Talent Development Dashboard', '360 Performance Review Platform', 'Predictive Skill Decay & Retention Engine'],
    suggestedCertifications: ['Certified Performance Management Professional', 'AI in Talent Analytics Specialization'],
  });

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('ts_token');
      const { ok, data } = await safeFetchJson('/api/career/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ targetRole }),
      });
      if (ok && data?.recommendation) {
        setRecommendation(data.recommendation);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Title */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs font-mono font-bold text-indigo-600">AI CAREER PATHING ENGINE</span>
          <h1 className="text-2xl font-black text-slate-900 mt-0.5">Personalized Career Guidance</h1>
          <p className="text-xs text-slate-500">Analyzes your skills, CGPA, and assessment results against target roles to construct 7-phase roadmaps.</p>
        </div>

        {onNavigate && (
          <button
            onClick={() => onNavigate('mock-interview')}
            className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-sm cursor-pointer shrink-0"
          >
            <Sparkles className="w-4 h-4" />
            Launch AI Mock Interview &rarr;
          </button>
        )}
      </div>

      {/* Role Selection Form */}
      <form onSubmit={handleAnalyze} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Target className="w-4 h-4 text-amber-500 absolute left-3 top-3.5" />
          <input
            type="text"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            placeholder="Target Career Role (e.g. AI Talent Architect, Full Stack Developer, Data Scientist)..."
            className="w-full bg-white text-slate-900 text-xs font-semibold pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2.5 rounded-lg shadow-xs flex items-center justify-center gap-2 transition-all shrink-0"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Sparkles className="w-4 h-4 text-amber-400" /> Generate AI Gap Analysis</>}
        </button>
      </form>

      {/* Analysis Results */}
      {recommendation && (
        <div className="space-y-6">
          {/* Match & Gaps Summary */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs text-center space-y-2">
              <span className="text-xs font-mono font-bold text-slate-500">ROLE MATCH INDEX</span>
              <div className="text-5xl font-black font-mono text-amber-600">{recommendation.matchPercentage}%</div>
              <span className="text-xs font-bold text-slate-900 block">{recommendation.targetRole}</span>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
              <span className="text-xs font-mono font-bold text-emerald-600">REQUIRED COMPETENCIES</span>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {recommendation.requiredSkills.map((sk) => (
                  <span key={sk} className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-1 rounded border border-emerald-200 font-mono font-semibold">
                    ✓ {sk}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
              <span className="text-xs font-mono font-bold text-rose-600">IDENTIFIED SKILL GAPS</span>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {recommendation.skillGaps.map((gap) => (
                  <span key={gap} className="text-[10px] bg-rose-50 text-rose-700 px-2 py-1 rounded border border-rose-200 font-mono font-semibold">
                    ⚠️ {gap}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* 7-Phase Ascent Path Roadmap */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <Compass className="w-5 h-5 text-indigo-600" /> 7-Phase Ascent Path Career Roadmap
            </h3>

            <div className="space-y-3">
              {recommendation.roadmapPhases.map((phase) => (
                <div key={phase.phase} className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex items-start gap-4">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-mono font-bold text-sm flex items-center justify-center shrink-0">
                    P{phase.phase}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900">{phase.title}</h4>
                      <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">{phase.duration}</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">{phase.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
