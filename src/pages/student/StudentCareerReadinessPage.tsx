import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCareerReadinessApi, getSkillRolesApi } from '../../api/client';
import { CareerReadinessResponse, TargetRoleOption, ReadinessComponent } from '../../types';
import {
  Award,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  FileText,
  BookOpen,
  Briefcase,
  User,
  Video,
  ChevronRight,
  TrendingUp,
  RefreshCw,
  Target,
  BarChart2,
  ShieldCheck,
  Zap,
  Info,
  HelpCircle,
} from 'lucide-react';

export const StudentCareerReadinessPage: React.FC = () => {
  const navigate = useNavigate();
  const [readiness, setReadiness] = useState<CareerReadinessResponse | null>(null);
  const [roles, setRoles] = useState<TargetRoleOption[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>('Backend Developer');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'breakdown' | 'recommendations' | 'interview'>('overview');
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<number | null>(null);

  useEffect(() => {
    fetchAvailableRoles();
  }, []);

  useEffect(() => {
    fetchReadiness(selectedRole);
  }, [selectedRole]);

  const fetchAvailableRoles = async () => {
    try {
      const res = await getSkillRolesApi();
      if (res.success && res.data) {
        setRoles(res.data);
      }
    } catch (e) {
      // Ignore background role fetching errors
    }
  };

  const fetchReadiness = async (targetRole?: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getCareerReadinessApi(targetRole);
      if (res.success && res.data) {
        setReadiness(res.data);
      } else {
        setError(res.message || 'Failed to load career readiness analysis.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to connect to readiness engine.');
    } finally {
      setLoading(false);
    }
  };

  const getBadgeClasses = (color: string) => {
    switch (color) {
      case 'emerald':
        return 'bg-emerald-500/10 text-emerald-700 border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-300';
      case 'indigo':
        return 'bg-indigo-500/10 text-indigo-700 border-indigo-300 dark:bg-indigo-500/20 dark:text-indigo-300';
      case 'amber':
        return 'bg-amber-500/10 text-amber-700 border-amber-300 dark:bg-amber-500/20 dark:text-amber-300';
      case 'rose':
        return 'bg-rose-500/10 text-rose-700 border-rose-300 dark:bg-rose-500/20 dark:text-rose-300';
      default:
        return 'bg-slate-500/10 text-slate-700 border-slate-300';
    }
  };

  const getComponentIcon = (key: string) => {
    switch (key) {
      case 'technical_skills':
        return <Zap className="w-5 h-5 text-indigo-600" />;
      case 'dsa_coding':
        return <Target className="w-5 h-5 text-blue-600" />;
      case 'resume_quality':
        return <FileText className="w-5 h-5 text-emerald-600" />;
      case 'projects_experience':
        return <Briefcase className="w-5 h-5 text-purple-600" />;
      case 'internship_activity':
        return <Sparkles className="w-5 h-5 text-amber-600" />;
      case 'interview_preparation':
        return <Video className="w-5 h-5 text-rose-600" />;
      case 'learning_progress':
        return <BookOpen className="w-5 h-5 text-teal-600" />;
      case 'profile_completeness':
        return <User className="w-5 h-5 text-cyan-600" />;
      case 'application_activity':
        return <BarChart2 className="w-5 h-5 text-indigo-600" />;
      default:
        return <Award className="w-5 h-5 text-slate-600" />;
    }
  };

  if (loading && !readiness) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-600 font-semibold">Calculating Career Readiness Engine...</p>
      </div>
    );
  }

  const score = readiness?.score || 0;
  const level = readiness?.level || 'Developing';
  const badgeColor = readiness?.badgeColor || 'indigo';

  // Sample Interview Prep Questions for practice tab
  const interviewQuestions = [
    {
      topic: 'Java & Spring Boot',
      question: 'Explain Dependency Injection in Spring Boot and how it enables loose coupling.',
      hint: 'Mention @Component, @Autowired, constructor injection, and inversion of control container.'
    },
    {
      topic: 'Data Structures & Algorithms',
      question: 'How do you optimize searching for duplicate elements in an array from O(N^2) to O(N)?',
      hint: 'Discuss using a HashSet or HashMap for O(1) lookup time.'
    },
    {
      topic: 'System Design & REST API',
      question: 'What are the main idempotency principles in REST APIs for POST vs PUT vs DELETE methods?',
      hint: 'PUT and DELETE are idempotent; POST is generally non-idempotent.'
    },
    {
      topic: 'Behavioral',
      question: 'Describe a time when you had to debug a difficult production or assignment error under pressure.',
      hint: 'Use the STAR method: Situation, Task, Action, and Result.'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-8 shadow-xl border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider">
              <Award className="w-3.5 h-3.5" /> Career Intelligence Platform • Phase 10 Engine
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Placement Readiness Score
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl">
              An explainable, data-driven evaluation of your technical skills, resume impact, roadmap progress, and internship application velocity.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Target Role</label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {roles.length > 0 ? (
                  roles.map((r) => (
                    <option key={r.role} value={r.role}>
                      {r.role}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="Backend Developer">Backend Developer</option>
                    <option value="Frontend Developer">Frontend Developer</option>
                    <option value="Full Stack Developer">Full Stack Developer</option>
                    <option value="Data Engineer">Data Engineer</option>
                    <option value="DevOps Engineer">DevOps Engineer</option>
                  </>
                )}
              </select>
            </div>

            <button
              onClick={() => fetchReadiness(selectedRole)}
              disabled={loading}
              className="self-end px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Recalculate
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-sm flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Hero Readiness Overview Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Circular Score Ring */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 bg-gradient-to-br from-slate-50 to-indigo-50/50 rounded-2xl border border-slate-100">
            <div className="relative w-44 h-44 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-200"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className={score >= 80 ? 'text-emerald-500' : score >= 65 ? 'text-indigo-600' : score >= 50 ? 'text-amber-500' : 'text-rose-500'}
                  strokeDasharray={`${score}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute flex flex-col items-center text-center">
                <span className="text-4xl font-extrabold text-slate-900 tracking-tight">{score}</span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">/ 100 PTS</span>
              </div>
            </div>

            <div className="mt-4 flex flex-col items-center gap-1.5 text-center">
              <span className={`px-4 py-1 rounded-full text-xs font-extrabold border ${getBadgeClasses(badgeColor)}`}>
                {level}
              </span>
              <p className="text-xs font-semibold text-slate-500 pt-1">Target Path: {selectedRole}</p>
            </div>
          </div>

          {/* Right Summary & Key Driver Details */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
                <h2 className="text-xl font-extrabold text-slate-900">Career Evaluation Summary</h2>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                {readiness?.summary}
              </p>
            </div>

            {readiness?.pointImprovement !== undefined && readiness.pointImprovement !== 0 && (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>
                  {readiness.pointImprovement > 0
                    ? `Readiness score increased by +${readiness.pointImprovement} points from platform actions!`
                    : `Score updated based on current profile metrics.`}
                </span>
              </div>
            )}

            {/* Metric Chips */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Components</span>
                <span className="text-sm font-bold text-slate-900">9 Core Drivers</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Methodology</span>
                <span className="text-sm font-bold text-slate-900">Weighted Real-Data</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1 col-span-2 sm:col-span-1">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Last Updated</span>
                <span className="text-xs font-semibold text-slate-700">Just Now</span>
              </div>
            </div>
          </div>
        </div>

        {/* Historical Score Trajectory / Trend Bar */}
        {readiness?.trend && readiness.trend.length > 0 && (
          <div className="pt-6 border-t border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-indigo-600" /> Historical Readiness Trajectory
              </h3>
              <span className="text-xs font-semibold text-slate-400">Score Progress Over Time</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {readiness.trend.map((pt, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 space-y-1 flex flex-col justify-between">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">{pt.date}</span>
                  <div className="flex items-baseline justify-between pt-1">
                    <span className="text-lg font-extrabold text-slate-900">{pt.score} <span className="text-xs font-normal text-slate-400">pts</span></span>
                    <span className="text-[10px] font-bold text-indigo-600">{pt.level}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 font-bold text-xs rounded-xl transition-all ${
            activeTab === 'overview'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Score Breakdown (9 Drivers)
        </button>
        <button
          onClick={() => setActiveTab('recommendations')}
          className={`px-4 py-2 font-bold text-xs rounded-xl transition-all ${
            activeTab === 'recommendations'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Action Plan ({readiness?.recommendations?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('interview')}
          className={`px-4 py-2 font-bold text-xs rounded-xl transition-all ${
            activeTab === 'interview'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Interview Screening Prep
        </button>
      </div>

      {/* TAB 1: 9-COMPONENT BREAKDOWN & STRENGTHS/WEAKNESSES */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Strengths and Weaknesses Split Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-emerald-50/50 border border-emerald-200/80 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2 text-emerald-800 font-bold">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base">Top Profile Strengths</h3>
              </div>
              <ul className="space-y-2 text-xs text-emerald-900 font-medium">
                {readiness?.strengths?.map((s, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-white/80 p-2.5 rounded-xl border border-emerald-100 shadow-2xs">
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-amber-50/50 border border-amber-200/80 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2 text-amber-800 font-bold">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <h3 className="text-base">Key Improvement Areas</h3>
              </div>
              <ul className="space-y-2 text-xs text-amber-900 font-medium">
                {readiness?.weaknesses?.length ? (
                  readiness.weaknesses.map((w, idx) => (
                    <li key={idx} className="flex items-start gap-2 bg-white/80 p-2.5 rounded-xl border border-amber-100 shadow-2xs">
                      <span>{w}</span>
                    </li>
                  ))
                ) : (
                  <li className="p-2.5 bg-white/80 rounded-xl text-slate-600">
                    No critical weaknesses detected! Your profile meets high readiness across all 9 drivers.
                  </li>
                )}
              </ul>
            </div>
          </div>

          {/* 9-Component Score Driver Cards Grid */}
          <div className="space-y-4">
            <h3 className="text-lg font-extrabold text-slate-900">Explainable Component Breakdown</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {readiness?.components?.map((c: ReadinessComponent) => (
                <div
                  key={c.key}
                  className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-slate-100 border border-slate-200 shrink-0">
                          {getComponentIcon(c.key)}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">{c.name}</h4>
                          <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                            {c.weight}% Weight
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-lg font-extrabold text-slate-900">{c.score}</span>
                        <span className="text-xs text-slate-400 font-bold block">/ 100</span>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-2.5 rounded-full transition-all duration-500 ${
                          c.score >= 80 ? 'bg-emerald-500' : c.score >= 65 ? 'bg-indigo-600' : c.score >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                        }`}
                        style={{ width: `${Math.max(8, c.score)}%` }}
                      />
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed font-normal">
                      {c.explanation}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500">
                    <span>Contribution: +{c.weightedScore} pts</span>
                    <span className="uppercase text-[10px] text-slate-400">{c.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ACTIONABLE RECOMMENDATIONS */}
      {activeTab === 'recommendations' && (
        <div className="space-y-6">
          <div className="space-y-1">
            <h3 className="text-xl font-extrabold text-slate-900">Personalized Improvement Action Plan</h3>
            <p className="text-xs text-slate-500">
              Targeted recommendations generated by analyzing your profile gaps and target role requirements.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {readiness?.recommendations?.map((rec) => (
              <div
                key={rec.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-indigo-200 transition-all"
              >
                <div className="space-y-2 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {rec.category}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                        rec.priority === 'HIGH'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : rec.priority === 'MEDIUM'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {rec.priority} Priority
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-slate-900">{rec.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{rec.description}</p>
                </div>

                <Link
                  to={rec.actionRoute}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 shrink-0 self-start md:self-center"
                >
                  {rec.actionText} <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: MOCK INTERVIEW SCREENING PREP */}
      {activeTab === 'interview' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm space-y-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold border border-purple-200">
              <Video className="w-3.5 h-3.5" /> Technical Interview Screening Practice
            </div>
            <h3 className="text-xl font-extrabold text-slate-900">Practice Technical & Behavioral Questions</h3>
            <p className="text-xs text-slate-500">
              Select questions aligned with {selectedRole} interview loops to evaluate verbal and technical preparedness.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {interviewQuestions.map((q, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl border border-slate-200/80 hover:border-indigo-300 bg-slate-50/50 space-y-3 transition-all cursor-pointer"
                onClick={() => setSelectedQuestionIndex(selectedQuestionIndex === idx ? null : idx)}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">{q.topic}</span>
                  <span className="text-xs font-semibold text-slate-400">Question #{idx + 1}</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 leading-snug">{q.question}</h4>

                {selectedQuestionIndex === idx ? (
                  <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-xs text-indigo-900 space-y-1">
                    <span className="font-bold block">💡 Guidance Hint:</span>
                    <p>{q.hint}</p>
                  </div>
                ) : (
                  <p className="text-[11px] font-bold text-slate-500 hover:text-indigo-600 transition-colors">
                    Click to reveal answer hint & guidelines →
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
export default StudentCareerReadinessPage;
