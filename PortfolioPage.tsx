import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Award,
  ExternalLink,
  Share2,
  Shield,
  CheckCircle2,
  User as UserIcon,
  Edit3,
  Plus,
  Trash2,
  Save,
  X,
  Sparkles,
  Code,
  GraduationCap,
} from 'lucide-react';
import { StudentProfile, User } from '../types';

interface PortfolioPageProps {
  user: User | null;
  profile: StudentProfile | null;
  onUpdateProfile?: (updatedProfile: Partial<StudentProfile>) => void;
  isReadOnly?: boolean;
  publicUser?: { name: string; role: string } | null;
  publicProfile?: StudentProfile | null;
}

export const PortfolioPage: React.FC<PortfolioPageProps> = ({
  user,
  profile,
  onUpdateProfile,
  isReadOnly = false,
  publicUser = null,
  publicProfile = null,
}) => {
  const [copied, setCopied] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeEditTab, setActiveEditTab] = useState<'info' | 'skills' | 'projects' | 'certificates'>('info');

  const displayProfile = publicProfile || profile;
  const displayUser = publicUser || user;
  const displayName = displayUser?.name || 'Student';

  // Form State
  const [targetRole, setTargetRole] = useState(displayProfile?.targetRole || 'AI Talent Architect');
  const [college, setCollege] = useState(displayProfile?.college || 'Talent Sphere Academy');
  const [degree, setDegree] = useState(displayProfile?.degree || 'Bachelor of Technology');
  const [year, setYear] = useState(displayProfile?.year || '1st Year');
  const [cgpa, setCgpa] = useState(displayProfile?.cgpa || 8.5);
  const [bio, setBio] = useState(
    displayProfile?.bio || 'Passionate student strategist building scalable talent management and AI performance solutions.'
  );
  const [careerGoal, setCareerGoal] = useState(
    displayProfile?.careerGoal || 'Talent Management & Engineering Specialist'
  );

  // Lists
  const defaultSkills = [
    { name: 'Performance Management', level: 'Intermediate', score: 85 },
    { name: 'OKRs & KPI Systems', level: 'Advanced', score: 90 },
    { name: 'Talent Analytics', level: 'Intermediate', score: 80 },
    { name: 'Python & AI Engineering', level: 'Beginner', score: 75 },
    { name: 'Competency Mapping', level: 'Intermediate', score: 88 },
  ];

  const defaultProjects = [
    {
      id: 'proj_1',
      title: 'AI Talent Development Dashboard',
      description: 'End-to-end competency tracking system featuring real-time proctoring metrics, AI study chat, and interactive analytics.',
      technologies: ['React 19', 'TypeScript', 'TailwindCSS', 'Groq AI', 'Express'],
      githubUrl: 'https://github.com/talentsphere/talent-dashboard',
    },
    {
      id: 'proj_2',
      title: '360 Performance Review & OCR Evaluator',
      description: 'Computer vision and NLP module for extracting textbook diagrams and grading student rubric performance.',
      technologies: ['Node.js', 'ChromaDB', 'Google GenAI', 'Recharts'],
      githubUrl: 'https://github.com/talentsphere/ocr-evaluator',
    },
  ];

  const defaultCertificates = [
    { id: 'cert_1', name: 'Certified Talent Management Professional', issuer: 'Talent Sphere Elevate', date: '2026' },
    { id: 'cert_2', name: 'AI & Data-Driven HR Architect', issuer: 'Global Skill Institute', date: '2026' },
  ];

  const [skills, setSkills] = useState(displayProfile?.skills && displayProfile.skills.length > 0 ? displayProfile.skills : defaultSkills);
  const [projects, setProjects] = useState(displayProfile?.projects && displayProfile.projects.length > 0 ? displayProfile.projects : defaultProjects);
  const [certificates, setCertificates] = useState(displayProfile?.certificates && displayProfile.certificates.length > 0 ? displayProfile.certificates : defaultCertificates);

  useEffect(() => {
    if (displayProfile) {
      if (displayProfile.targetRole) setTargetRole(displayProfile.targetRole);
      if (displayProfile.college) setCollege(displayProfile.college);
      if (displayProfile.degree) setDegree(displayProfile.degree);
      if (displayProfile.year) setYear(displayProfile.year);
      if (displayProfile.cgpa) setCgpa(displayProfile.cgpa);
      if (displayProfile.bio) setBio(displayProfile.bio);
      if (displayProfile.careerGoal) setCareerGoal(displayProfile.careerGoal);
      if (displayProfile.skills && displayProfile.skills.length > 0) setSkills(displayProfile.skills);
      if (displayProfile.projects && displayProfile.projects.length > 0) setProjects(displayProfile.projects);
      if (displayProfile.certificates && displayProfile.certificates.length > 0) setCertificates(displayProfile.certificates);
    }
  }, [displayProfile]);

  // New item inputs
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillScore, setNewSkillScore] = useState(80);

  const [newProjTitle, setNewProjTitle] = useState('');
  const [newProjDesc, setNewProjDesc] = useState('');
  const [newProjTech, setNewProjTech] = useState('');
  const [newProjUrl, setNewProjUrl] = useState('');

  const [newCertName, setNewCertName] = useState('');
  const [newCertIssuer, setNewCertIssuer] = useState('Talent Sphere Academy');

  const isPublic = displayProfile?.publicPortfolio ?? true;

  const handleTogglePublic = () => {
    if (onUpdateProfile) {
      onUpdateProfile({ publicPortfolio: !isPublic });
    }
  };

  const portfolioUrl = displayUser ? `${window.location.origin}/portfolio/${displayUser.id}` : '';

  const handleCopyLink = () => {
    if (portfolioUrl) {
      navigator.clipboard.writeText(portfolioUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleSaveAll = () => {
    if (onUpdateProfile) {
      onUpdateProfile({
        targetRole,
        college,
        degree,
        year,
        cgpa: Number(cgpa),
        bio,
        careerGoal,
        skills,
        projects,
        certificates,
      });
    }
    setIsEditModalOpen(false);
  };

  const handleAddSkill = () => {
    if (!newSkillName.trim()) return;
    const level = newSkillScore >= 85 ? 'Advanced' : newSkillScore >= 65 ? 'Intermediate' : 'Beginner';
    setSkills((prev) => [...prev, { name: newSkillName.trim(), score: newSkillScore, level }]);
    setNewSkillName('');
    setNewSkillScore(80);
  };

  const handleRemoveSkill = (idx: number) => {
    setSkills((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleAddProject = () => {
    if (!newProjTitle.trim()) return;
    const techs = newProjTech.split(',').map((t) => t.trim()).filter(Boolean);
    setProjects((prev) => [
      ...prev,
      {
        id: `proj_${Date.now()}`,
        title: newProjTitle.trim(),
        description: newProjDesc.trim() || 'Comprehensive portfolio project showcasing technical problem solving.',
        technologies: techs.length > 0 ? techs : ['TypeScript', 'React', 'AI'],
        githubUrl: newProjUrl.trim() || undefined,
      },
    ]);
    setNewProjTitle('');
    setNewProjDesc('');
    setNewProjTech('');
    setNewProjUrl('');
  };

  const handleRemoveProject = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  const handleAddCertificate = () => {
    if (!newCertName.trim()) return;
    setCertificates((prev) => [
      ...prev,
      {
        id: `cert_${Date.now()}`,
        name: newCertName.trim(),
        issuer: newCertIssuer.trim() || 'Talent Sphere Academy',
        date: new Date().getFullYear().toString(),
      },
    ]);
    setNewCertName('');
  };

  const handleRemoveCertificate = (id: string) => {
    setCertificates((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 text-slate-900 dark:text-slate-100">
      {/* Share & Edit Controls Banner */}
      {!isReadOnly && (
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-black text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                VERIFIED DIGITAL PORTFOLIO
              </span>
              <span className="text-xs font-mono font-black text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
                LIVE RESUME PROFILE
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-950 dark:text-white mt-1">{displayName}'s Showcase Portfolio</h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
              Shareable portfolio for recruiters, talent evaluators, hackathons, and placement drives.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950 dark:hover:bg-indigo-900 text-indigo-950 dark:text-indigo-300 font-black text-xs px-3.5 py-2 rounded-xl border border-indigo-200 dark:border-indigo-800 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Edit3 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Edit Portfolio
            </button>

            <button
              onClick={handleTogglePublic}
              className={`text-xs font-black px-3 py-2 rounded-xl border transition-all cursor-pointer ${
                isPublic
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
                  : 'bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800'
              }`}
            >
              {isPublic ? '🌐 Public Mode' : '🔒 Private Mode'}
            </button>

            <button
              onClick={handleCopyLink}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs px-4 py-2 rounded-xl shadow-md shadow-indigo-600/30 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              {copied ? 'Copied!' : 'Share Link'}
            </button>
          </div>
        </div>
      )}

      {/* Main Portfolio Showcase Card */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-8 shadow-sm">
        {/* Identity Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 border-b border-slate-200 dark:border-slate-800 pb-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-2xl shadow-md shrink-0">
            {displayName.slice(0, 2).toUpperCase()}
          </div>

          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-2xl font-black text-slate-950 dark:text-white">{displayName}</h2>
              <span className="text-[10px] font-mono font-black bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-300 dark:border-amber-800">
                {displayProfile?.targetRole || targetRole}
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              {displayProfile?.college || college} • {displayProfile?.degree || degree} ({displayProfile?.year || year}) • CGPA: {displayProfile?.cgpa || cgpa}
            </p>
            <p className="text-xs text-slate-700 dark:text-slate-300 pt-1.5 font-medium italic max-w-2xl leading-relaxed">
              "{displayProfile?.bio || bio}"
            </p>
          </div>
        </div>

        {/* Verified Skills Competency */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-slate-950 dark:text-white uppercase font-mono flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" /> Verified Skills & Competency Matrix
            </h3>
            <span className="text-[11px] font-mono text-slate-500 font-bold">{skills.length} Competencies</span>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {skills.map((sk, idx) => (
              <span
                key={idx}
                className="bg-slate-50 dark:bg-slate-800/80 text-slate-950 dark:text-slate-100 text-xs font-bold px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-2.5 shadow-2xs"
              >
                <span>{sk.name}</span>
                <span className="text-[10px] font-mono font-black text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
                  {sk.score}% ({sk.level})
                </span>
              </span>
            ))}
          </div>
        </div>

        {/* Portfolio Projects */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-slate-950 dark:text-white uppercase font-mono flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Showcase Projects ({projects.length})
            </h3>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {projects.map((p) => (
              <div
                key={p.id}
                className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <h4 className="text-sm font-black text-slate-950 dark:text-white">{p.title}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">{p.description}</p>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex flex-wrap gap-1.5">
                    {p.technologies.map((t) => (
                      <span
                        key={t}
                        className="text-[10px] font-mono font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-800"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  {p.githubUrl && (
                    <a
                      href={p.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                    >
                      View Source Code <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Verifiable Certifications */}
        <div className="space-y-3">
          <h3 className="text-xs font-black text-slate-950 dark:text-white uppercase font-mono flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Verifiable Certifications & Badges ({certificates.length})
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {certificates.map((c) => (
              <div
                key={c.id}
                className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3"
              >
                <div>
                  <h4 className="text-xs font-black text-slate-950 dark:text-white">{c.name}</h4>
                  <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                    {c.issuer} • Issued {c.date}
                  </span>
                </div>
                <span className="text-[10px] font-mono font-black bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800 flex items-center gap-1 shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Verified
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Edit Portfolio Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-950 dark:text-white flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-indigo-600" /> Edit Digital Portfolio
                </h3>
                <p className="text-xs text-slate-500">Update your public profile, skills, projects, and certifications.</p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2">
              {(['info', 'skills', 'projects', 'certificates'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveEditTab(tab)}
                  className={`py-2 px-3 text-xs font-black capitalize border-b-2 transition-all cursor-pointer ${
                    activeEditTab === tab
                      ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab 1: Info */}
            {activeEditTab === 'info' && (
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-black mb-1">Target Role</label>
                    <input
                      type="text"
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-black mb-1">College / Institution</label>
                    <input
                      type="text"
                      value={college}
                      onChange={(e) => setCollege(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-black mb-1">Degree</label>
                    <input
                      type="text"
                      value={degree}
                      onChange={(e) => setDegree(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-black mb-1">Year</label>
                    <input
                      type="text"
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-black mb-1">CGPA</label>
                    <input
                      type="number"
                      step="0.1"
                      value={cgpa}
                      onChange={(e) => setCgpa(Number(e.target.value))}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-black mb-1">Bio / Headline</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl font-medium"
                  />
                </div>
              </div>
            )}

            {/* Tab 2: Skills */}
            {activeEditTab === 'skills' && (
              <div className="space-y-4 text-xs">
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <label className="block font-black mb-1">Skill Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Talent Analytics, Python"
                      value={newSkillName}
                      onChange={(e) => setNewSkillName(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl font-bold"
                    />
                  </div>
                  <div className="w-24">
                    <label className="block font-black mb-1">Score ({newSkillScore}%)</label>
                    <input
                      type="number"
                      min={10}
                      max={100}
                      value={newSkillScore}
                      onChange={(e) => setNewSkillScore(Number(e.target.value))}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl font-bold"
                    />
                  </div>
                  <button
                    onClick={handleAddSkill}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-4 py-2.5 rounded-xl cursor-pointer"
                  >
                    Add
                  </button>
                </div>

                <div className="space-y-2">
                  {skills.map((s, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
                    >
                      <span className="font-bold">{s.name} ({s.score}% - {s.level})</span>
                      <button
                        onClick={() => handleRemoveSkill(idx)}
                        className="text-rose-600 hover:text-rose-800 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 3: Projects */}
            {activeEditTab === 'projects' && (
              <div className="space-y-4 text-xs">
                <div className="space-y-2.5 p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700">
                  <input
                    type="text"
                    placeholder="Project Title"
                    value={newProjTitle}
                    onChange={(e) => setNewProjTitle(e.target.value)}
                    className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-bold"
                  />
                  <textarea
                    placeholder="Description"
                    value={newProjDesc}
                    onChange={(e) => setNewProjDesc(e.target.value)}
                    rows={2}
                    className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-medium"
                  />
                  <input
                    type="text"
                    placeholder="Technologies (comma-separated, e.g. React, TypeScript, Groq)"
                    value={newProjTech}
                    onChange={(e) => setNewProjTech(e.target.value)}
                    className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-mono"
                  />
                  <button
                    onClick={handleAddProject}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-4 py-2 rounded-xl cursor-pointer"
                  >
                    Add Project
                  </button>
                </div>

                <div className="space-y-2">
                  {projects.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-start justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
                    >
                      <div>
                        <h4 className="font-bold">{p.title}</h4>
                        <p className="text-[11px] text-slate-500">{p.description}</p>
                      </div>
                      <button
                        onClick={() => handleRemoveProject(p.id)}
                        className="text-rose-600 hover:text-rose-800 p-1 cursor-pointer shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 4: Certificates */}
            {activeEditTab === 'certificates' && (
              <div className="space-y-4 text-xs">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Certificate Name"
                    value={newCertName}
                    onChange={(e) => setNewCertName(e.target.value)}
                    className="flex-1 p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl font-bold"
                  />
                  <button
                    onClick={handleAddCertificate}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-4 py-2.5 rounded-xl cursor-pointer"
                  >
                    Add
                  </button>
                </div>

                <div className="space-y-2">
                  {certificates.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
                    >
                      <div>
                        <span className="font-bold">{c.name}</span>
                        <span className="text-[10px] text-slate-400 block">{c.issuer} • {c.date}</span>
                      </div>
                      <button
                        onClick={() => handleRemoveCertificate(c.id)}
                        className="text-rose-600 hover:text-rose-800 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer actions */}
            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAll}
                className="px-5 py-2 text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" /> Save Portfolio
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

