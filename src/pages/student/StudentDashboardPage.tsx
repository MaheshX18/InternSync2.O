import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getStudentDashboardApi, getRecommendationsApi, getMyResumeApi, getSkillRoadmapApi, getCareerReadinessApi } from '../../api/client';
import { getStudentFacultyMentorApi, getStudentMentorFeedbackApi, updateStudentActionItemStatusApi } from '../../api/mentor';
import { StudentDashboardData, RecommendationResponse, ResumeAnalysisResponse, LearningRoadmap, CareerReadinessResponse, StudentMentorInfo, StudentMentorFeedbackData } from '../../types';
import {
  GraduationCap,
  FileText,
  Briefcase,
  Bookmark,
  UserCheck,
  Award,
  Sparkles,
  Edit3,
  CheckCircle2,
  AlertCircle,
  Building,
  ExternalLink,
  ChevronRight,
  MapPin,
  AlertTriangle,
  Zap,
  TrendingUp,
  ShieldCheck,
  Mail,
  User,
  Star,
  CheckSquare,
  Check,
  History,
  MessageSquare
} from 'lucide-react';

export const StudentDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<StudentDashboardData | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendationResponse[]>([]);
  const [resumeHealth, setResumeHealth] = useState<ResumeAnalysisResponse | null>(null);
  const [roadmap, setRoadmap] = useState<LearningRoadmap | null>(null);
  const [readiness, setReadiness] = useState<CareerReadinessResponse | null>(null);
  const [mentorInfo, setMentorInfo] = useState<StudentMentorInfo | null>(null);
  const [mentorFeedback, setMentorFeedback] = useState<StudentMentorFeedbackData | null>(null);
  const [loading, setLoading] = useState(true);
  const [recLoading, setRecLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await getStudentDashboardApi();
        if (res.success) {
          setData(res.data);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load student dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    const fetchTopRecommendations = async () => {
      try {
        const res = await getRecommendationsApi({ size: 3 });
        if (res.success && res.data) {
          setRecommendations(res.data.content || []);
        }
      } catch (e) {
        // Ignore background rec loading error
      } finally {
        setRecLoading(false);
      }
    };

    const fetchResumeData = async () => {
      try {
        const res = await getMyResumeApi();
        if (res.success && res.data) {
          setResumeHealth(res.data);
        }
      } catch (e) {
        // Ignore resume error
      }
    };

    const fetchRoadmap = async () => {
      try {
        const res = await getSkillRoadmapApi();
        if (res.success && res.data) {
          setRoadmap(res.data);
        }
      } catch (e) {
        // Ignore roadmap error
      }
    };

    const fetchReadiness = async () => {
      try {
        const res = await getCareerReadinessApi();
        if (res.success && res.data) {
          setReadiness(res.data);
        }
      } catch (e) {
        // Ignore readiness error
      }
    };

    const fetchMentorData = async () => {
      try {
        const res = await getStudentMentorFeedbackApi();
        if (res.success && res.data) {
          setMentorFeedback(res.data);
          setMentorInfo({ mentor: res.data.mentor, assignment: res.data.assignment });
        }
      } catch (e) {
        try {
          const mRes = await getStudentFacultyMentorApi();
          if (mRes.success && mRes.data) {
            setMentorInfo(mRes.data);
          }
        } catch (err) {
          // Ignore
        }
      }
    };

    fetchDashboard();
    fetchTopRecommendations();
    fetchResumeData();
    fetchRoadmap();
    fetchReadiness();
    fetchMentorData();
  }, []);

  const handleToggleStudentActionItem = async (itemId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    try {
      await updateStudentActionItemStatusApi(itemId, nextStatus);
      const res = await getStudentMentorFeedbackApi();
      if (res.success && res.data) {
        setMentorFeedback(res.data);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update action item');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Loading Student Dashboard...</p>
      </div>
    );
  }

  const profile = data?.userProfile || user;
  const completeness = data?.profileCompleteness ?? profile?.profileCompleteness ?? 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white p-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-semibold uppercase tracking-wider">
              <GraduationCap className="w-3.5 h-3.5" /> Student Portal • Batch {profile?.batch || '2026'}
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Welcome back, {profile?.firstName} {profile?.lastName}!
            </h1>
            <p className="text-indigo-200 text-sm max-w-xl">
              {profile?.department ? `${profile.department} • ` : ''}
              {profile?.institutionId ? `ID: ${profile.institutionId}` : 'Student Account'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/student/profile"
              className="px-5 py-2.5 bg-white text-indigo-950 font-bold text-xs rounded-xl hover:bg-indigo-50 shadow-md transition-all flex items-center gap-2 shrink-0"
            >
              <Edit3 className="w-4 h-4 text-indigo-600" /> Edit Profile
            </Link>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* PHASE 10: CAREER / PLACEMENT READINESS HERO CARD */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 text-white shadow-xl border border-slate-800 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shrink-0">
              <Award className="w-8 h-8" />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                  Career Intelligence Platform
                </span>
                {readiness && (
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                    readiness.score >= 80 ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30' :
                    readiness.score >= 65 ? 'bg-indigo-500/20 text-indigo-300 border-indigo-400/30' :
                    readiness.score >= 50 ? 'bg-amber-500/20 text-amber-300 border-amber-400/30' :
                    'bg-rose-500/20 text-rose-300 border-rose-400/30'
                  }`}>
                    {readiness.level}
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-extrabold text-white tracking-tight">
                Placement Readiness Score: {readiness ? `${readiness.score}/100` : 'Calculating...'}
              </h2>
              <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                {readiness?.summary || 'Deterministic evaluation based on technical skills, resume impact, roadmap progress, and internship application velocity.'}
              </p>
            </div>
          </div>

          <Link
            to="/career-readiness"
            className="shrink-0 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs transition-all shadow-md flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" /> View Readiness Breakdown <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {readiness?.components && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-2.5 pt-4 border-t border-slate-800">
            {readiness.components.map((c) => (
              <div key={c.key} className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50 space-y-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block truncate">{c.name}</span>
                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-extrabold text-white">{c.score}</span>
                  <span className="text-[9px] text-indigo-300 font-semibold">{c.weight}%</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Profile Completeness & Quick Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900">Profile Completeness</h2>
            </div>
            <span className="text-sm font-extrabold text-indigo-600">{completeness}%</span>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
            <div
              className="bg-indigo-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${completeness}%` }}
            />
          </div>

          <p className="text-xs text-slate-500">
            {completeness < 100
              ? 'Complete your bio, skills, resume link, and social profiles to increase your recruiter visibility.'
              : 'Your student profile is fully complete and ready for application submissions!'}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase tracking-wider">
              <FileText className="w-4 h-4 text-emerald-600" /> Resume Status
            </div>
            <p className="text-lg font-bold text-slate-900">
              {data?.hasResume ? 'Resume Uploaded' : 'No Resume Attached'}
            </p>
          </div>
          {data?.hasResume ? (
            <a
              href={profile?.resumeUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-semibold text-emerald-600 hover:underline inline-flex items-center gap-1 pt-3"
            >
              View Document <ExternalLink className="w-3 h-3" />
            </a>
          ) : (
            <Link to="/student/profile" className="text-xs font-semibold text-indigo-600 hover:underline pt-3">
              + Add Resume Link
            </Link>
          )}
        </div>
      </div>

      {/* Your Faculty Mentor Widget */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-100 text-indigo-800">
            Guidance & Support
          </span>
        </div>
        <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <User className="w-5 h-5 text-indigo-600" /> Your Faculty Mentor
        </h3>
        
        {mentorInfo?.mentor ? (
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-lg shrink-0 shadow-md">
                {mentorInfo.mentor.firstName.charAt(0)}{mentorInfo.mentor.lastName.charAt(0)}
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-lg">{mentorInfo.mentor.name}</h4>
                <p className="text-sm text-slate-500 font-medium">{mentorInfo.mentor.designation || 'Faculty'} • {mentorInfo.mentor.department || 'General'}</p>
                {mentorInfo.assignment && (
                  <p className="text-xs text-slate-400 mt-1">Assigned on: {new Date(mentorInfo.assignment.assignedAt).toLocaleDateString()}</p>
                )}
              </div>
            </div>
            
            <a 
              href={`mailto:${mentorInfo.mentor.email}`}
              className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-indigo-600 font-bold text-sm rounded-xl transition-all shadow-sm flex items-center gap-2 shrink-0 w-full md:w-auto justify-center"
            >
              <Mail className="w-4 h-4" /> Contact Mentor
            </a>
          </div>
        ) : (
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 bg-slate-200 text-slate-400 rounded-full flex items-center justify-center mb-3">
              <User className="w-6 h-6" />
            </div>
            <h4 className="font-semibold text-slate-700">Faculty mentor has not been assigned yet.</h4>
            <p className="text-sm text-slate-500 mt-1 max-w-md">
              A faculty mentor will be assigned to you soon to guide you through your internship journey and review your logbooks.
            </p>
          </div>
        )}
      </div>

      {/* Resume Health Widget */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 text-white shadow-md flex flex-col md:flex-row items-center justify-between gap-6 border border-slate-800">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400 shrink-0">
            <FileText className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">Resume Health Studio</span>
              {resumeHealth && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  {resumeHealth.resumeScore}/100 SCORE
                </span>
              )}
            </div>
            <h3 className="text-lg font-extrabold text-white">
              {resumeHealth ? `Resume Score: ${resumeHealth.resumeScore}/100 — ${resumeHealth.extractedSkills.length} Skills Extracted` : 'AI Resume Health Score: Not Analyzed Yet'}
            </h3>
            <p className="text-xs text-slate-300">
              {resumeHealth && resumeHealth.missingSkills.length > 0
                ? `Detected ${resumeHealth.missingSkills.length} skill gaps (${resumeHealth.missingSkills.slice(0, 3).join(', ')}) required by active internships.`
                : 'Upload your resume to extract skills, analyze gaps, and boost your internship recommendations.'}
            </p>
          </div>
        </div>

        <Link
          to="/resume"
          className="shrink-0 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs transition-all shadow-md flex items-center gap-1.5"
        >
          <Zap className="w-4 h-4" /> {resumeHealth ? 'Improve Resume' : 'Analyze Resume'} <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Feature 13: Your Skill Roadmap Widget */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-100 text-indigo-800">
                AI Roadmap Engine
              </span>
              <span className="text-xs font-bold text-slate-500">
                Target: <strong className="text-slate-900">{roadmap?.targetRole || 'Backend Developer'}</strong>
              </span>
            </div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" /> Your Skill Roadmap
            </h3>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-xs font-extrabold text-slate-500 uppercase">Readiness</div>
              <div className="text-lg font-black text-indigo-600">{roadmap?.readinessScore ?? 0}%</div>
            </div>

            <Link
              to="/skill-roadmap"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs transition-all shadow-md flex items-center gap-1.5"
            >
              View Full Roadmap <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {roadmap && roadmap.items && roadmap.items.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {roadmap.items.slice(0, 3).map((item) => (
              <div key={item.itemId} className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900">{item.skill}</span>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-rose-100 text-rose-800">
                    {item.priority} PRIORITY
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                    <span>Required by {item.requiredByCount} internships</span>
                    <span>{item.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-indigo-600 h-full" style={{ width: `${item.progress}%` }}></div>
                  </div>
                </div>

                <Link
                  to={`/skill-roadmap?skill=${encodeURIComponent(item.skill)}`}
                  className="text-indigo-600 font-extrabold text-xs hover:underline block pt-1"
                >
                  Start Module →
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500">
            No skill gaps detected for {roadmap?.targetRole || 'your profile'}! You are 100% ready.
          </p>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Applications</span>
          <p className="text-2xl font-extrabold text-slate-900">{data?.applicationsCount ?? 0}</p>
          <span className="text-[11px] text-slate-500">Phase 4 Active Tracking</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Saved Roles</span>
          <p className="text-2xl font-extrabold text-slate-900">{data?.savedInternshipsCount ?? 0}</p>
          <span className="text-[11px] text-slate-500">Bookmarked Listings</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Skills Listed</span>
          <p className="text-2xl font-extrabold text-slate-900">{data?.skillsCount ?? 0}</p>
          <span className="text-[11px] text-slate-500">Tech & Soft Skills</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Cumulative GPA</span>
          <p className="text-2xl font-extrabold text-slate-900">{data?.gpa ? data.gpa.toFixed(2) : 'N/A'}</p>
          <span className="text-[11px] text-slate-500">Academic Score</span>
        </div>
      </div>

      {/* Recommended For You Section */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Recommended For You</h2>
              <p className="text-xs text-slate-500">AI-matched internship opportunities based on your skills & profile</p>
            </div>
          </div>
          <Link
            to="/recommendations"
            className="text-xs font-extrabold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 hover:underline"
          >
            Explore All Matches <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {recLoading ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            Calculating match scores...
          </div>
        ) : recommendations.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-xs space-y-2">
            <p>No recommendations available yet. Browse open postings or complete your skills in your profile!</p>
            <Link to="/internships" className="text-indigo-600 font-bold inline-block hover:underline">
              Browse Open Postings
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recommendations.map((rec) => {
              const job = rec.internship;
              const isTopMatch = rec.matchScore >= 85;
              return (
                <div
                  key={job.id}
                  className="bg-slate-50/70 hover:bg-slate-50 rounded-2xl border border-slate-200/80 p-5 flex flex-col justify-between space-y-4 hover:border-indigo-200 hover:shadow-md transition-all"
                >
                  <div className="space-y-3">
                    {/* Header Badge */}
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                        <Building className="w-3.5 h-3.5 text-indigo-600" /> {job.companyName}
                      </span>
                      <span
                        className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider ${
                          isTopMatch
                            ? 'bg-emerald-500 text-white shadow-sm'
                            : 'bg-indigo-600 text-white shadow-sm'
                        }`}
                      >
                        {rec.matchScore}% MATCH
                      </span>
                    </div>

                    {/* Job Title & Location */}
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-base leading-tight hover:text-indigo-600">
                        <Link to={`/internships/${job.id}`}>{job.title}</Link>
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" /> {job.location || 'Flexible'} ({job.workplaceType})
                      </p>
                    </div>

                    {/* Matched Skills */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block">
                        Matched Skills
                      </span>
                      {rec.matchedSkills && rec.matchedSkills.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {rec.matchedSkills.slice(0, 3).map((s, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                              ✓ {s}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic block">General profile match</span>
                      )}
                    </div>

                    {/* Missing Skills */}
                    {rec.missingSkills && rec.missingSkills.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-extrabold uppercase text-amber-600/80 tracking-wider block">
                          Missing:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {rec.missingSkills.slice(0, 2).map((s, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-semibold">
                              ⚠ {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-200/60">
                    <Link
                      to={`/internships/${job.id}`}
                      className="flex-1 text-center py-2 bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs rounded-xl border border-slate-200 transition-all"
                    >
                      View Posting
                    </Link>
                    <Link
                      to={`/internships/${job.id}`}
                      className="flex-1 text-center py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all shadow-sm"
                    >
                      Apply
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Faculty Mentor & Mentoring Workspace */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-bold">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Your Faculty Mentor</h2>
              <p className="text-xs text-slate-500">Dedicated academic mentorship & internship guidance</p>
            </div>
          </div>
          {mentorFeedback?.mentor && (
            <span className="text-[10px] font-extrabold uppercase px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 self-start sm:self-auto">
              Active Mentorship
            </span>
          )}
        </div>

        {!mentorFeedback?.mentor ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-500 text-xs">
            <User className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="font-bold text-slate-700">Faculty mentor has not been assigned yet.</p>
            <p className="text-slate-400 mt-1">Your department T&P coordinator will assign a mentor to guide your academic and internship journey.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Mentor Profile Header Card */}
            <div className="p-5 bg-gradient-to-r from-slate-50 to-indigo-50/40 rounded-2xl border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center font-bold text-base shadow-md shadow-indigo-200">
                  {mentorFeedback.mentor.firstName.charAt(0)}{mentorFeedback.mentor.lastName.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{mentorFeedback.mentor.name}</h3>
                  <p className="text-xs text-slate-600 font-medium">
                    {mentorFeedback.mentor.designation || 'Faculty Mentor'} • {mentorFeedback.mentor.department || 'Department of Computer Science'}
                  </p>
                  {mentorFeedback.mentor.assignedAt && (
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Assigned on {new Date(mentorFeedback.mentor.assignedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>

              <a
                href={`mailto:${mentorFeedback.mentor.email}`}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-indigo-100 flex items-center gap-2 self-start sm:self-auto"
              >
                <Mail className="w-4 h-4" /> Contact Mentor
              </a>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Latest Review / Feedback */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-amber-500" /> Latest Mentor Feedback
                </h4>

                {mentorFeedback.latestReview ? (
                  <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-amber-500">
                        {Array.from({ length: mentorFeedback.latestReview.rating || 5 }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-current" />
                        ))}
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {new Date(mentorFeedback.latestReview.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {mentorFeedback.latestReview.feedback && (
                      <p className="text-slate-800 font-medium leading-relaxed">
                        "{mentorFeedback.latestReview.feedback}"
                      </p>
                    )}

                    {mentorFeedback.latestReview.strengths && (
                      <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-100 text-emerald-900">
                        <span className="font-bold text-[10px] uppercase text-emerald-700 block">Strengths</span>
                        {mentorFeedback.latestReview.strengths}
                      </div>
                    )}

                    {mentorFeedback.latestReview.concerns && (
                      <div className="p-2.5 bg-rose-50 rounded-xl border border-rose-100 text-rose-900">
                        <span className="font-bold text-[10px] uppercase text-rose-700 block">Areas for Improvement</span>
                        {mentorFeedback.latestReview.concerns}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-6 text-center bg-slate-50 rounded-2xl border border-slate-100 text-slate-400 text-xs">
                    No formal review submitted by mentor yet.
                  </div>
                )}
              </div>

              {/* Action Items Checklist */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                  <CheckSquare className="w-3.5 h-3.5 text-indigo-600" /> Mentor Action Items ({mentorFeedback.actionItems?.length || 0})
                </h4>

                {(mentorFeedback.actionItems || []).length === 0 ? (
                  <div className="p-6 text-center bg-slate-50 rounded-2xl border border-slate-100 text-slate-400 text-xs">
                    No active action items assigned by your mentor.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {mentorFeedback.actionItems.map(item => {
                      const isDone = item.status === 'COMPLETED';
                      return (
                        <div
                          key={item.id}
                          className={`p-3.5 rounded-2xl border transition-all flex items-start gap-3 text-xs ${
                            isDone ? 'bg-emerald-50/40 border-emerald-200' : 'bg-slate-50 border-slate-200'
                          }`}
                        >
                          <button
                            onClick={() => handleToggleStudentActionItem(item.id, item.status)}
                            className={`w-5 h-5 rounded-md flex items-center justify-center mt-0.5 transition-colors shrink-0 ${
                              isDone ? 'bg-emerald-600 text-white' : 'border-2 border-slate-300 hover:border-indigo-600 bg-white'
                            }`}
                          >
                            {isDone && <Check className="w-3.5 h-3.5" />}
                          </button>
                          <div className="flex-1">
                            <h5 className={`font-bold ${isDone ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                              {item.title}
                            </h5>
                            {item.description && (
                              <p className="text-slate-500 text-[11px] mt-0.5 leading-relaxed">{item.description}</p>
                            )}
                            {item.dueDate && (
                              <span className="text-[10px] font-semibold text-slate-400 block mt-1">
                                Due by: {item.dueDate}
                              </span>
                            )}
                          </div>
                          <span className={`px-2 py-0.5 text-[9px] font-extrabold uppercase rounded-full shrink-0 ${
                            isDone ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {item.status}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Mentoring History Timeline */}
            {(mentorFeedback.timeline || []).length > 0 && (
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-indigo-600" /> Mentoring History
                </h4>
                <div className="space-y-2">
                  {mentorFeedback.timeline.slice(0, 4).map((ev, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-xl flex items-start justify-between gap-3 text-xs">
                      <div>
                        <span className="font-bold text-slate-800 block">{ev.title}</span>
                        <p className="text-slate-600 text-[11px] mt-0.5">{ev.content}</p>
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium shrink-0">
                        {new Date(ev.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Academic Details Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Award className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">Academic Overview</h2>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-400 font-semibold block uppercase">Department</span>
              <span className="font-bold text-slate-800">{profile?.department || 'Not specified'}</span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block uppercase">Roll Number</span>
              <span className="font-bold text-slate-800">{profile?.rollNumber || 'Not specified'}</span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block uppercase">Batch</span>
              <span className="font-bold text-slate-800">{profile?.batch || 'Not specified'}</span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block uppercase">Institution ID</span>
              <span className="font-bold text-slate-800">{profile?.institutionId || 'Not specified'}</span>
            </div>
          </div>
        </div>

        {/* Skills & Bio Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">Skills & Bio</h2>
          </div>

          <div className="space-y-3">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                Technical Skills
              </span>
              {profile?.skills && profile.skills.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {profile.skills.map((skill, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-lg"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No skills listed yet. Add skills in your profile.</p>
              )}
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Bio</span>
              <p className="text-xs text-slate-600 line-clamp-3">
                {profile?.bio || 'No bio provided. Tell recruiters about yourself by updating your profile.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboardPage;
