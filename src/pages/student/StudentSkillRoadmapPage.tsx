import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  getSkillRolesApi,
  getSkillRoadmapApi,
  updateTargetRoleApi,
  startRoadmapItemApi,
  completeRoadmapItemApi,
  updateSkillLevelApi,
  updateRoadmapItemStatusApi
} from '../../api/client';
import { TargetRoleOption, LearningRoadmap, RoadmapItem } from '../../types';
import {
  Target,
  Zap,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  ArrowRight,
  Sparkles,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Award,
  Clock,
  Play,
  RotateCcw,
  Briefcase
} from 'lucide-react';

export const StudentSkillRoadmapPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const focusSkill = searchParams.get('skill');

  const [roles, setRoles] = useState<TargetRoleOption[]>([]);
  const [roadmap, setRoadmap] = useState<LearningRoadmap | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingRole, setUpdatingRole] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [rolesRes, roadmapRes] = await Promise.all([
        getSkillRolesApi(),
        getSkillRoadmapApi()
      ]);

      if (rolesRes.success && rolesRes.data) {
        setRoles(rolesRes.data);
      }
      if (roadmapRes.success && roadmapRes.data) {
        setRoadmap(roadmapRes.data);
      }
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to load skill roadmap data');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (newRole: string) => {
    try {
      setUpdatingRole(true);
      const res = await updateTargetRoleApi(newRole);
      if (res.success && res.data) {
        setRoadmap(res.data);
      }
    } catch (e: any) {
      setError('Failed to update target role');
    } finally {
      setUpdatingRole(false);
    }
  };

  const handleStartItem = async (itemId: string) => {
    try {
      setActionLoading(itemId);
      const res = await startRoadmapItemApi(itemId);
      if (res.success && res.data) {
        setRoadmap(res.data);
      }
    } catch (e) {
      setError('Failed to start roadmap module');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCompleteItem = async (itemId: string) => {
    try {
      setActionLoading(itemId);
      const res = await completeRoadmapItemApi(itemId);
      if (res.success && res.data) {
        setRoadmap(res.data);
      }
    } catch (e) {
      setError('Failed to mark item complete');
    } finally {
      setActionLoading(null);
    }
  };

  const handleLevelChange = async (skill: string, level: string) => {
    try {
      const res = await updateSkillLevelApi(skill, level);
      if (res.success && res.data) {
        setRoadmap(res.data);
      }
    } catch (e) {
      setError('Failed to update skill level');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-8 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-slate-600">Analyzing skill gaps & building roadmap...</p>
        </div>
      </div>
    );
  }

  const currentRole = roadmap?.targetRole || 'Backend Developer';
  const readiness = roadmap?.readinessScore ?? 0;
  const items = roadmap?.items || [];

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 text-white shadow-xl border border-slate-800 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-wider border border-indigo-400/30">
              <Sparkles className="w-3.5 h-3.5" /> Phase 9 Career Intelligence Engine
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              Personalized Skill Roadmap
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl">
              Turn skill gaps into career opportunities. Master in-demand technologies required by active internships and unlock new placements.
            </p>
          </div>

          {/* Readiness Dial */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 flex items-center gap-5 shrink-0 shadow-lg backdrop-blur-md">
            <div className="relative w-20 h-20 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="40" cy="40" r="32" stroke="currentColor" strokeWidth="6" className="text-slate-700" fill="transparent" />
                <circle
                  cx="40"
                  cy="40"
                  r="32"
                  stroke="currentColor"
                  strokeWidth="6"
                  className="text-indigo-400 transition-all duration-1000 ease-out"
                  strokeDasharray={200}
                  strokeDashoffset={200 - (200 * readiness) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <span className="absolute text-xl font-black text-white">{readiness}%</span>
            </div>
            <div className="space-y-1">
              <div className="text-xs uppercase font-extrabold text-indigo-300">Target Role Readiness</div>
              <div className="text-lg font-black text-white">{currentRole}</div>
              <p className="text-[11px] text-slate-400">
                {readiness >= 80 ? 'Ready for top-tier roles!' : 'Bridge gaps to boost match rate'}
              </p>
            </div>
          </div>
        </div>

        {/* Role Selector */}
        <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2 flex items-center gap-1">
            <Target className="w-3.5 h-3.5 text-indigo-400" /> Target Career Path:
          </span>
          {roles.map((r) => (
            <button
              key={r.role}
              onClick={() => handleRoleChange(r.role)}
              disabled={updatingRole}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                r.role === currentRole
                  ? 'bg-indigo-600 text-white shadow-md border border-indigo-400'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60'
              }`}
            >
              {r.role}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-semibold flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-xs font-bold underline">Dismiss</button>
        </div>
      )}

      {/* Feature 1 & 4: Skill Gap Analysis Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" /> Detected Skill Gaps for {currentRole}
            </h2>
            <p className="text-xs text-slate-500">Calculated directly from live MongoDB internship requirements and your current profile.</p>
          </div>
          <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 font-extrabold text-xs border border-indigo-200">
            {items.length} Missing Skills Identified
          </span>
        </div>

        {items.length === 0 ? (
          <div className="p-8 rounded-3xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h3 className="text-lg font-bold text-emerald-900">Zero Skill Gaps Detected!</h3>
            <p className="text-xs text-emerald-700 max-w-lg mx-auto">
              You meet all core skill requirements for {currentRole}. Explore live internships or pick another target career path above.
            </p>
            <Link
              to="/student/recommendations"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-extrabold text-xs shadow-md hover:bg-emerald-500"
            >
              <Briefcase className="w-4 h-4" /> View Top Matching Internships <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {items.map((gap) => {
              const isFocused = focusSkill && gap.skill.toLowerCase().includes(focusSkill.toLowerCase());
              return (
                <div
                  key={gap.itemId}
                  className={`bg-white rounded-2xl p-6 border shadow-sm space-y-4 transition-all relative ${
                    isFocused ? 'border-2 border-indigo-600 ring-4 ring-indigo-50' : 'border-slate-200/80 hover:border-indigo-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        gap.priority === 'HIGH'
                          ? 'bg-rose-100 text-rose-700 border border-rose-200'
                          : gap.priority === 'MEDIUM'
                          ? 'bg-amber-100 text-amber-700 border border-amber-200'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {gap.priority} PRIORITY
                    </span>
                    <span className="text-xs font-extrabold text-slate-500">Week {gap.week} Module</span>
                  </div>

                  <div>
                    <h3 className="text-xl font-black text-slate-900">{gap.skill}</h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{gap.priorityReason}</p>
                  </div>

                  {/* Impact Stats */}
                  <div className="grid grid-cols-2 gap-2 bg-slate-50 rounded-xl p-3 border border-slate-100 text-center">
                    <div>
                      <div className="text-lg font-black text-indigo-600">{gap.requiredByCount}</div>
                      <div className="text-[10px] font-bold text-slate-500 uppercase">Internships Need It</div>
                    </div>
                    <div>
                      <div className="text-lg font-black text-emerald-600">+{gap.potentialOpportunity}</div>
                      <div className="text-[10px] font-bold text-slate-500 uppercase">Matches Unlocked</div>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-xs">
                    <Link
                      to={`/student/recommendations?query=${encodeURIComponent(gap.skill)}`}
                      className="text-indigo-600 font-extrabold hover:text-indigo-800 flex items-center gap-1"
                    >
                      <Briefcase className="w-3.5 h-3.5" /> Matching Jobs <ChevronRight className="w-3.5 h-3.5" />
                    </Link>

                    <button
                      onClick={() => {
                        const el = document.getElementById(`module-${gap.itemId}`);
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="text-slate-700 font-bold hover:text-indigo-600 flex items-center gap-1"
                    >
                      Study Plan <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Feature 5: Personalized 4-Week Learning Roadmap Timeline */}
      <div className="space-y-6 pt-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-indigo-600" /> 4-Week Personalized Curriculum
          </h2>
          <p className="text-xs text-slate-500">Dynamic learning modules generated to bridge your exact missing skills for {currentRole}.</p>
        </div>

        <div className="space-y-6">
          {items.map((item, idx) => {
            const isCompleted = item.status === 'COMPLETED';
            const isInProgress = item.status === 'IN_PROGRESS';

            return (
              <div
                id={`module-${item.itemId}`}
                key={item.itemId}
                className={`bg-white rounded-3xl p-6 md:p-8 border shadow-sm transition-all relative ${
                  isCompleted
                    ? 'border-emerald-200 bg-emerald-50/20'
                    : isInProgress
                    ? 'border-indigo-300 ring-2 ring-indigo-100'
                    : 'border-slate-200/80'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                  {/* Left Column: Module Metadata */}
                  <div className="space-y-4 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-3 py-1 rounded-lg bg-slate-900 text-white font-black text-xs uppercase tracking-wider">
                        Week {item.week}
                      </span>
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                          item.priority === 'HIGH'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {item.priority} Priority
                      </span>
                      {isCompleted && (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[10px] flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Completed
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="text-2xl font-black text-slate-900">{item.title}</h3>
                      <p className="text-xs text-slate-600 mt-1">{item.description}</p>
                    </div>

                    {/* Learning Objectives */}
                    <div className="space-y-2 bg-slate-50 rounded-2xl p-4 border border-slate-100">
                      <h4 className="text-xs font-black uppercase text-slate-700 tracking-wider">Learning Objectives</h4>
                      <ul className="space-y-1.5 text-xs text-slate-600">
                        {item.learningObjectives.map((obj, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-indigo-600 font-extrabold">✓</span>
                            <span>{obj}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Practice Task */}
                    <div className="bg-indigo-50/50 rounded-2xl p-4 border border-indigo-100/80 space-y-1">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-700">Hands-on Practice Task</span>
                      <p className="text-xs font-bold text-slate-800">{item.practiceTask}</p>
                    </div>

                    {/* Feature 6: Verified Learning Resources */}
                    {item.resources && item.resources.length > 0 && (
                      <div className="space-y-2 pt-2">
                        <span className="text-xs font-extrabold text-slate-700">Curated Learning Resources</span>
                        <div className="flex flex-wrap gap-2">
                          {item.resources.map((res, rIdx) => (
                            <a
                              key={rIdx}
                              href={res.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition-colors border border-slate-200"
                            >
                              <span>{res.title}</span>
                              <span className="text-[10px] font-extrabold text-indigo-600">({res.provider})</span>
                              <ExternalLink className="w-3 h-3 text-slate-400" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Progress & Control Panel */}
                  <div className="w-full lg:w-72 bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-5 shrink-0 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-extrabold text-slate-700">Module Progress</span>
                        <span className="font-black text-indigo-600">{item.progress}%</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            isCompleted ? 'bg-emerald-500' : 'bg-indigo-600'
                          }`}
                          style={{ width: `${item.progress}%` }}
                        ></div>
                      </div>

                      {/* Feature 8: Skill Level Dropdown */}
                      <div className="space-y-1 pt-2">
                        <label className="text-[11px] font-extrabold text-slate-500 uppercase">Self-Assessed Skill Level</label>
                        <select
                          value={item.skillLevel || 'UNKNOWN'}
                          onChange={(e) => handleLevelChange(item.skill, e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="UNKNOWN">UNKNOWN</option>
                          <option value="BEGINNER">BEGINNER</option>
                          <option value="INTERMEDIATE">INTERMEDIATE</option>
                          <option value="ADVANCED">ADVANCED</option>
                        </select>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2 pt-2">
                      {!isCompleted ? (
                        <>
                          {item.status === 'NOT_STARTED' && (
                            <button
                              onClick={() => handleStartItem(item.itemId)}
                              disabled={actionLoading === item.itemId}
                              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                            >
                              <Play className="w-3.5 h-3.5 fill-current" /> Start Learning
                            </button>
                          )}
                          <button
                            onClick={() => handleCompleteItem(item.itemId)}
                            disabled={actionLoading === item.itemId}
                            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Mark Complete
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleStartItem(item.itemId)}
                          disabled={actionLoading === item.itemId}
                          className="w-full py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-extrabold text-xs transition-all flex items-center justify-center gap-1.5"
                        >
                          <RotateCcw className="w-3.5 h-3.5" /> Review / Re-open
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
