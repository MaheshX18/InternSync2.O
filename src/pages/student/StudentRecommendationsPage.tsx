import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getRecommendationsApi } from '../../api/client';
import { RecommendationResponse } from '../../types';
import {
  Sparkles,
  Filter,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Briefcase,
  Building,
  Search,
  SlidersHorizontal,
  ChevronRight,
  ExternalLink,
  DollarSign,
  Award,
  BookOpen
} from 'lucide-react';

export const StudentRecommendationsPage: React.FC = () => {
  const [recommendations, setRecommendations] = useState<RecommendationResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [locationFilter, setLocationFilter] = useState<string>('');
  const [minMatchScore, setMinMatchScore] = useState<number>(0);

  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getRecommendationsApi({
        role: roleFilter || undefined,
        location: locationFilter || undefined,
        minMatchScore: minMatchScore > 0 ? minMatchScore : undefined,
        size: 20
      });
      if (res.success && res.data) {
        setRecommendations(res.data.content || []);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load personalized recommendations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [minMatchScore]);

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRecommendations();
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 85) return 'bg-emerald-500 text-white shadow-emerald-200';
    if (score >= 70) return 'bg-indigo-600 text-white shadow-indigo-200';
    if (score >= 50) return 'bg-amber-500 text-white shadow-amber-200';
    return 'bg-slate-500 text-white shadow-slate-200';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950 via-indigo-900 to-slate-900 text-white p-8 shadow-xl">
        <div className="relative z-10 space-y-3 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/30 border border-indigo-400/40 text-indigo-200 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-indigo-300" /> AI Internship Matching Engine
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Recommended Internships For You
          </h1>
          <p className="text-indigo-200 text-sm leading-relaxed">
            Our deterministic AI matching algorithm evaluates your technical skills, field of study, GPA, and location preferences against real company position requirements to highlight your best-fit internship opportunities.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <form onSubmit={handleFilterSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Role / Industry
            </label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                placeholder="e.g. Software, Backend, Data"
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Location / Workplace
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                placeholder="e.g. Remote, New York, Hybrid"
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Minimum Match Score
            </label>
            <select
              value={minMatchScore}
              onChange={(e) => setMinMatchScore(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
            >
              <option value={0}>All Match Scores (0%+)</option>
              <option value={50}>Good Match (50%+)</option>
              <option value={70}>High Match (70%+)</option>
              <option value={85}>Top Match (85%+)</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" /> Apply Filters
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-sm flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Recommendation Results List */}
      {loading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500 font-medium">Calculating personalized internship matches...</p>
        </div>
      ) : recommendations.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
          <Sparkles className="w-12 h-12 text-indigo-400 mx-auto" />
          <h3 className="text-lg font-bold text-slate-900">No Matching Internships Found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Try adjusting your role or location filters, or lower the minimum match score to explore broader internship postings.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {recommendations.map((rec) => {
            const job = rec.internship;
            return (
              <div
                key={job.id}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all p-6 space-y-6"
              >
                {/* Card Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center font-bold text-indigo-600 text-lg border border-slate-200 shrink-0">
                      {job.companyLogoUrl ? (
                        <img src={job.companyLogoUrl} alt={job.companyName} className="w-full h-full object-cover rounded-2xl" />
                      ) : (
                        job.companyName?.substring(0, 2).toUpperCase() || 'CO'
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-extrabold text-slate-900">{job.title}</h2>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 uppercase">
                          {job.employmentType}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                        <span className="font-semibold text-slate-800 flex items-center gap-1">
                          <Building className="w-3.5 h-3.5 text-indigo-600" /> {job.companyName}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" /> {job.location || 'Flexible'} ({job.workplaceType})
                        </span>
                        {job.stipendOrSalaryMin && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1 text-emerald-600 font-bold">
                              <DollarSign className="w-3.5 h-3.5" /> ${job.stipendOrSalaryMin} - ${job.stipendOrSalaryMax} / month
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Match Score Badge */}
                  <div className="flex items-center md:flex-col items-end justify-between md:justify-center shrink-0 gap-2">
                    <div className={`px-4 py-2 rounded-2xl text-center shadow-sm ${getScoreBadgeColor(rec.matchScore)}`}>
                      <span className="text-xl font-black block leading-none">{rec.matchScore}%</span>
                      <span className="text-[10px] font-bold tracking-wider uppercase opacity-90 block mt-0.5">
                        MATCH SCORE
                      </span>
                    </div>
                  </div>
                </div>

                {/* Score Breakdown Progress Bars */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50/80 p-4 rounded-2xl border border-slate-100 text-xs">
                  <div>
                    <div className="flex justify-between text-slate-600 font-semibold mb-1">
                      <span>Skills Match</span>
                      <span className="font-bold text-slate-900">{rec.skillMatchPercentage}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5">
                      <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${rec.skillMatchPercentage}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-600 font-semibold mb-1">
                      <span>Role Match</span>
                      <span className="font-bold text-slate-900">{rec.roleMatchPercentage}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5">
                      <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${rec.roleMatchPercentage}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-600 font-semibold mb-1">
                      <span>Experience</span>
                      <span className="font-bold text-slate-900">{rec.experienceMatchPercentage}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5">
                      <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${rec.experienceMatchPercentage}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-600 font-semibold mb-1">
                      <span>Location</span>
                      <span className="font-bold text-slate-900">{rec.locationMatchPercentage}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5">
                      <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${rec.locationMatchPercentage}%` }} />
                    </div>
                  </div>
                </div>

                {/* Why Matches & Missing Skills Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                  {/* Why this matches you */}
                  <div className="space-y-2">
                    <h4 className="font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 text-[11px] text-emerald-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Why This Matches You
                    </h4>
                    <ul className="space-y-1.5 text-slate-700 bg-emerald-50/50 p-3.5 rounded-2xl border border-emerald-100">
                      {rec.whyMatches.map((reason, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-emerald-600 font-bold shrink-0">{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Missing Skills */}
                  <div className="space-y-2">
                    <h4 className="font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 text-[11px] text-amber-700">
                      <AlertTriangle className="w-4 h-4 text-amber-600" /> Skills Gap / Requirements
                    </h4>
                    <div className="bg-amber-50/50 p-3.5 rounded-2xl border border-amber-100">
                      {rec.missingSkills && rec.missingSkills.length > 0 ? (
                        <div className="space-y-1.5">
                          <p className="text-slate-600 text-[11px]">
                            Adding these skills to your profile or resume can increase your match score:
                          </p>
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {rec.missingSkills.map((skill, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 bg-amber-100 text-amber-800 font-semibold rounded-md text-[11px]"
                              >
                                ⚠ {skill}
                              </span>
                            ))}
                          </div>
                          <div className="pt-1">
                            <Link
                              to={`/skill-roadmap?skill=${encodeURIComponent(rec.missingSkills[0] || '')}`}
                              className="text-[11px] font-extrabold text-indigo-600 hover:underline inline-flex items-center gap-1"
                            >
                              <BookOpen className="w-3 h-3" /> Learn Missing Skills on Roadmap →
                            </Link>
                          </div>
                        </div>
                      ) : (
                        <p className="text-emerald-700 font-medium">
                          ✓ You possess all primary skills explicitly required for this position!
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="text-[11px] text-slate-400">
                    Posted {new Date(job.createdAt).toLocaleDateString()}
                  </span>
                  <div className="flex items-center gap-3">
                    <Link
                      to={`/internships/${job.id}`}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5"
                    >
                      View Posting <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                    <Link
                      to={`/internships/${job.id}`}
                      className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
                    >
                      Apply Now <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StudentRecommendationsPage;
