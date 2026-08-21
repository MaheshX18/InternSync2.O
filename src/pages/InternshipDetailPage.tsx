import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getPublicInternshipById } from '../api/internships';
import { getMyApplications } from '../api/applications';
import { Internship, Application } from '../types';
import { BookmarkButton } from '../components/internships/BookmarkButton';
import { ApplyModal } from '../components/applications/ApplyModal';
import { ApplicationStatusBadge } from '../components/applications/ApplicationStatusBadge';
import {
  Building2,
  MapPin,
  Briefcase,
  Clock,
  DollarSign,
  Calendar,
  Users,
  CheckCircle2,
  ArrowLeft,
  Loader2,
  Frown,
  Share2,
  GraduationCap,
  Sparkles,
  ShieldCheck,
  FileCheck2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const InternshipDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [internship, setInternship] = useState<Internship | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState<boolean>(false);
  const [existingApplication, setExistingApplication] = useState<Application | null>(null);
  const [checkingApp, setCheckingApp] = useState<boolean>(false);

  const fetchDetail = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const data = await getPublicInternshipById(id);
      setInternship(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load internship details.');
    } finally {
      setLoading(false);
    }
  };

  const checkExistingApplication = async () => {
    if (!id || !user || user.role !== 'STUDENT') return;
    try {
      setCheckingApp(true);
      const res = await getMyApplications();
      const match = res.content.find((app) => app.internshipId === id);
      setExistingApplication(match || null);
    } catch (err) {
      console.warn('Could not check prior application', err);
    } finally {
      setCheckingApp(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  useEffect(() => {
    checkExistingApplication();
  }, [id, user]);

  const handleApplyClick = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'STUDENT') {
      alert('Only student accounts can apply for internships.');
      return;
    }
    setIsApplyModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (error || !internship) {
    return (
      <div className="max-w-3xl mx-auto my-12 p-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center shadow-sm">
        <Frown className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Posting Not Available</h2>
        <p className="text-sm text-slate-500 mt-2">{error || 'This internship posting does not exist or is no longer published.'}</p>
        <button
          onClick={() => navigate('/internships')}
          className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium text-sm rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Internships
        </button>
      </div>
    );
  }

  const isStudent = user?.role === 'STUDENT';
  const formatWorkplace = (t: string) => {
    switch (t) {
      case 'ON_SITE': return 'On-Site';
      case 'HYBRID': return 'Hybrid';
      case 'REMOTE': return 'Remote';
      default: return t;
    }
  };

  return (
    <div id="internship-detail-page" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Link
        to="/internships"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to browse
      </Link>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 border-b border-slate-100 dark:border-slate-800 pb-6">
          <div className="flex items-start gap-4">
            {internship.companyLogoUrl ? (
              <img
                src={internship.companyLogoUrl}
                alt={internship.companyName}
                className="w-16 h-16 rounded-2xl object-cover border border-slate-100 dark:border-slate-800 shrink-0 shadow-sm"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-2xl border border-indigo-100 dark:border-indigo-900 shrink-0 shadow-sm">
                <Building2 className="w-8 h-8" />
              </div>
            )}

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{internship.title}</h1>
                {internship.internshipType && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    <ShieldCheck className="w-3 h-3" />
                    {internship.internshipType.replace('_', ' ')}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400 font-medium text-sm">
                <span className="font-semibold text-slate-800 dark:text-slate-200">{internship.companyName}</span>
                {internship.postedByRole && (
                  <span className="text-xs text-slate-500">
                    • Posted by {internship.postedByRole === 'TPO' ? 'Training & Placement Cell' : internship.postedByRole}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {isStudent && (
              <BookmarkButton
                internshipId={internship.id}
                initialBookmarked={internship.isBookmarked}
              />
            )}
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert('Link copied to clipboard!');
              }}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              title="Share"
            >
              <Share2 className="w-4 h-4" />
            </button>

            {existingApplication ? (
              <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 px-4 py-2 rounded-xl">
                <FileCheck2 className="w-4 h-4 text-indigo-600" />
                <div className="text-left">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 block">Status</span>
                  <ApplicationStatusBadge status={existingApplication.status} />
                </div>
                <Link
                  to="/student/applications"
                  className="ml-2 text-xs font-semibold text-indigo-600 hover:underline"
                >
                  View App
                </Link>
              </div>
            ) : (
              <button
                id="apply-btn"
                onClick={handleApplyClick}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl transition-all shadow-md shadow-indigo-100 hover:shadow-indigo-200"
              >
                Apply Now
              </button>
            )}
          </div>
        </div>

        {/* Quick Highlights Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 py-6 border-b border-slate-100 dark:border-slate-800">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" /> Location
            </span>
            <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">{internship.location}</p>
          </div>

          <div className="space-y-1">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5 text-slate-400" /> Workplace
            </span>
            <p className="font-semibold text-sm text-slate-900 dark:text-white">{formatWorkplace(internship.workplaceType)}</p>
          </div>

          <div className="space-y-1">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" /> Duration
            </span>
            <p className="font-semibold text-sm text-slate-900 dark:text-white">{internship.duration || '3-6 Months'}</p>
          </div>

          <div className="space-y-1">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-emerald-500" /> Stipend
            </span>
            <p className="font-semibold text-sm text-emerald-600 dark:text-emerald-400">
              {internship.isPaid
                ? `${internship.currency || '$'} ${internship.stipendOrSalaryMin || 0}${internship.stipendOrSalaryMax ? ' - ' + internship.stipendOrSalaryMax : ''}/mo`
                : 'Unpaid'}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-slate-400" /> Openings
            </span>
            <p className="font-semibold text-sm text-slate-900 dark:text-white">{internship.positionsAvailable || 1} Positions</p>
          </div>

          <div className="space-y-1">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-amber-500" /> Deadline
            </span>
            <p className="font-semibold text-sm text-slate-900 dark:text-white">
              {internship.applicationDeadline
                ? new Date(internship.applicationDeadline).toLocaleDateString()
                : 'Open Until Filled'}
            </p>
          </div>
        </div>

        {/* Eligibility Criteria Banner */}
        <div className="my-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Eligibility Criteria
              </h4>
              <p className="text-xs text-slate-500">
                Minimum CGPA: <strong className="text-slate-700 dark:text-slate-300">{internship.eligibilityCriteria?.minCgpa || '6.5'}</strong> • 
                Allowed Depts: <strong className="text-slate-700 dark:text-slate-300">{(internship.eligibilityCriteria?.allowedDepartments || ['CS', 'IT', 'ECE', 'All Engineering']).join(', ')}</strong> • 
                Batch: <strong className="text-slate-700 dark:text-slate-300">{internship.eligibilityCriteria?.batch || '2025 / 2026'}</strong>
              </p>
            </div>
          </div>
          <div className="text-xs text-slate-500 flex items-center gap-1">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <span>Verified by T&P Portal</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="py-2 space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Job Description</h3>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {internship.description}
            </p>
          </div>

          {internship.requirements && internship.requirements.length > 0 && (
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3">Requirements & Qualifications</h3>
              <ul className="space-y-2">
                {internship.requirements.map((req, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {internship.responsibilities && internship.responsibilities.length > 0 && (
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3">Key Responsibilities</h3>
              <ul className="space-y-2">
                {internship.responsibilities.map((resp, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span>{resp}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {internship.requiredSkills && internship.requiredSkills.length > 0 && (
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3">Required Technical Skills</h3>
              <div className="flex flex-wrap gap-2">
                {internship.requiredSkills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-semibold text-xs rounded-xl border border-indigo-100 dark:border-indigo-900/50"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {internship && (
        <ApplyModal
          internship={internship}
          isOpen={isApplyModalOpen}
          onClose={() => setIsApplyModalOpen(false)}
          onSuccess={async () => {
            await fetchDetail();
            await checkExistingApplication();
          }}
        />
      )}
    </div>
  );
};

