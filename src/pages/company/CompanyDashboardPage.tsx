import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getCompanyDashboardApi } from '../../api/client';
import { CompanyDashboardData } from '../../types';
import {
  Building2,
  Briefcase,
  Users,
  Clock,
  Edit3,
  Globe,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  PlusCircle,
} from 'lucide-react';

export const CompanyDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<CompanyDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await getCompanyDashboardApi();
        if (res.success) {
          setData(res.data);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load company dashboard.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Loading Company Partner Dashboard...</p>
      </div>
    );
  }

  const profile = data?.userProfile || user;
  const completeness = data?.profileCompleteness ?? profile?.profileCompleteness ?? 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start md:items-center gap-5">
            {profile?.companyLogoUrl ? (
              <img
                src={profile.companyLogoUrl}
                alt={profile.companyName || 'Company Logo'}
                className="w-16 h-16 rounded-2xl object-cover bg-white p-1 border border-slate-700 shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center text-indigo-300 shrink-0">
                <Building2 className="w-8 h-8" />
              </div>
            )}
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-semibold uppercase tracking-wider">
                <Building2 className="w-3.5 h-3.5" /> Employer Partner
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight">
                {profile?.companyName || `${profile?.firstName}'s Organization`}
              </h1>
              <p className="text-indigo-200 text-sm flex items-center gap-3 flex-wrap">
                {profile?.industry && <span>Industry: {profile.industry}</span>}
                {profile?.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" /> {profile.location}
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/company/profile"
              className="px-5 py-2.5 bg-white text-indigo-950 font-bold text-xs rounded-xl hover:bg-indigo-50 shadow-md transition-all flex items-center gap-2 shrink-0"
            >
              <Edit3 className="w-4 h-4 text-indigo-600" /> Company Profile
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

      {/* Completeness bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">Employer Profile Completeness</h2>
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
            ? 'Complete your company overview, logo, industry, and website to build trust with student applicants.'
            : 'Your company profile is 100% complete! Ready to publish internship positions in Phase 4.'}
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Active Postings</span>
            <Briefcase className="w-5 h-5 text-indigo-600" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{data?.activeJobPostingsCount ?? 0}</p>
          <p className="text-xs text-slate-500">Phase 4 Internship Directory</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Applicants</span>
            <Users className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{data?.totalApplicantsCount ?? 0}</p>
          <p className="text-xs text-slate-500">Phase 5 Candidate Submissions</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Pending Reviews</span>
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{data?.pendingReviewsCount ?? 0}</p>
          <p className="text-xs text-slate-500">Applications Awaiting Action</p>
        </div>
      </div>

      {/* Overview Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">Company Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div>
            <span className="text-slate-400 font-semibold block uppercase mb-1">Company Description</span>
            <p className="text-slate-700 leading-relaxed">
              {profile?.companyDescription || 'No company description provided yet. Add an overview in your company profile.'}
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <span className="text-slate-400 font-semibold block uppercase">Official Website</span>
              {profile?.companyWebsite ? (
                <a
                  href={profile.companyWebsite}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-indigo-600 hover:underline inline-flex items-center gap-1"
                >
                  {profile.companyWebsite} <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <span className="text-slate-500 italic">Not specified</span>
              )}
            </div>

            <div>
              <span className="text-slate-400 font-semibold block uppercase">Recruiter Contact Name</span>
              <span className="font-bold text-slate-800">
                {profile?.firstName} {profile?.lastName}
              </span>
            </div>

            <div>
              <span className="text-slate-400 font-semibold block uppercase">Recruiter Email</span>
              <span className="font-bold text-slate-800">{profile?.email}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyDashboardPage;
