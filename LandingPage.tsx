import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Bot, FileText, Compass, Award, CheckCircle2 } from 'lucide-react';
import { AscentPath } from '../components/AscentPath';

interface LandingPageProps {
  onNavigate: (page: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col">
      {/* Hero Section */}
      <section className="relative pt-16 pb-14 px-6 max-w-7xl mx-auto w-full text-center">
        <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 px-3.5 py-1 rounded-full text-xs font-mono font-bold text-amber-700 mb-5 shadow-xs">
          <Sparkles className="w-4 h-4 text-amber-500" />
          TALENT SPHERE ELEVATE PLATFORM
        </div>

        <h1 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 max-w-4xl mx-auto leading-tight">
          Discover Your Talent. Develop Your Skills. <span className="text-amber-600">Elevate Your Future.</span>
        </h1>

        <p className="mt-5 text-sm md:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          The AI-powered cross-domain student talent development, performance assessment, and career guidance platform — featuring progressive day-wise RAG knowledge vector search, OCR diagram intelligence, and automated email notifications.
        </p>

        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => onNavigate('register')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-6 py-3 rounded-lg shadow-xs flex items-center gap-2 transition-all hover:scale-102"
          >
            Start Your Ascent <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => onNavigate('login')}
            className="bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold px-5 py-3 rounded-lg border border-slate-300 shadow-xs transition-all"
          >
            Sign In to Dashboard
          </button>
        </div>

        {/* Ascent Path Visual Showcase */}
        <div className="mt-12 text-left max-w-4xl mx-auto">
          <AscentPath currentUnlockedDay={1} maxDays={3} />
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-14 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-xl font-bold text-center text-slate-900 mb-10">
            Architected for Real Talent Development
          </h2>

          <div className="grid md:grid-cols-3 gap-5">
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 shadow-xs space-y-2.5">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                <Bot className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">TalentSphere AI Chatbot</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Ask questions grounded strictly on your unlocked Day 1, Day 2, or Day 3 PDF materials. Includes active source citations and instant OCR image context parsing.
              </p>
            </div>

            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 shadow-xs space-y-2.5">
              <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Progressive Day-Wise RAG</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Deterministic ChromaDB vector filtering (<code className="font-mono text-amber-700 bg-amber-50 px-1 rounded">day_id &lt;= unlockedDay</code>). Locked future module PDFs are strictly excluded from retrieval.
              </p>
            </div>

            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 shadow-xs space-y-2.5">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">AI Career Pathing & Portfolios</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Calculates real skill gaps against target roles (AI Engineer, Data Scientist, Full Stack Developer) and auto-generates 7-phase roadmaps and shareable digital portfolios.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-6 border-t border-slate-200 text-center text-xs text-slate-500 bg-slate-50">
        <p>© 2026 Talent Sphere Elevate. All rights reserved.</p>
        <p className="mt-1 text-[10px] text-slate-400">Tagline: "Discover Your Talent. Develop Your Skills. Elevate Your Future."</p>
      </footer>
    </div>
  );
};
