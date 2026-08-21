import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCandidateMatchesApi, recalculateCandidateMatchesApi } from '../../api/matching';
import { getCompanyInternshipById } from '../../api/internships';
import { updateApplicationStatus } from '../../api/applications';
import { CandidateMatch, Internship } from '../../types';
import { ArrowLeft, Loader2, CheckCircle2, XCircle, RefreshCw, ChevronDown, ChevronUp, UserCheck, UserX } from 'lucide-react';

export const CompanyCandidateMatchingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [internship, setInternship] = useState<Internship | null>(null);
  const [candidates, setCandidates] = useState<CandidateMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadData(id);
    }
  }, [id]);

  const loadData = async (internshipId: string) => {
    setLoading(true);
    setError(null);
    try {
      const [internshipData, candidatesData] = await Promise.all([
        getCompanyInternshipById(internshipId),
        getCandidateMatchesApi(internshipId)
      ]);
      setInternship(internshipData);
      setCandidates(candidatesData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load matching data');
    } finally {
      setLoading(false);
    }
  };

  const handleRecalculate = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const candidatesData = await recalculateCandidateMatchesApi(id);
      setCandidates(candidatesData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to recalculate matches');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (applicationId: string, status: string) => {
    try {
      await updateApplicationStatus(applicationId, { status: status as any });
      // Reload candidates to reflect status change
      if (id) loadData(id);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update application status');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error || !internship) {
    return (
      <div className="p-6">
        <div className="bg-rose-50 text-rose-700 p-4 rounded-lg">
          {error || 'Internship not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link to="/company/internships" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Candidate Matching</h1>
            <p className="text-slate-500 mt-1">For: {internship.title}</p>
          </div>
        </div>
        <button
          onClick={handleRecalculate}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 font-medium rounded-lg hover:bg-indigo-100 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Recalculate Scores
        </button>
      </div>

      <div className="space-y-4">
        {candidates.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
            <p className="text-slate-500">No candidates available for matching.</p>
          </div>
        ) : (
          candidates.map(candidate => (
            <div key={candidate.studentId} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div 
                className="p-5 flex items-center justify-between cursor-pointer"
                onClick={() => setExpandedId(expandedId === candidate.studentId ? null : candidate.studentId)}
              >
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 text-xl font-bold text-slate-600 border-2 border-white shadow-sm">
                    {candidate.studentName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      {candidate.studentName}
                      {candidate.isEligible ? (
                        <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-100 text-emerald-700 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Eligible
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-xs font-semibold bg-rose-100 text-rose-700 rounded-full flex items-center gap-1">
                          <XCircle className="w-3 h-3" /> Not Eligible
                        </span>
                      )}
                    </h3>
                    <p className="text-sm text-slate-500 mt-1 flex items-center gap-3">
                      <span>{candidate.department || 'N/A'}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                      <span>Batch: {candidate.batch || 'N/A'}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                      <span>CGPA: {candidate.cgpa.toFixed(1)}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-8">
                  <div className="text-center">
                    <div className="text-3xl font-black text-indigo-600">{candidate.matchScore}%</div>
                    <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Match Score</div>
                  </div>
                  <div className="text-slate-400">
                    {expandedId === candidate.studentId ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
                  </div>
                </div>
              </div>

              {expandedId === candidate.studentId && (
                <div className="px-5 pb-5 pt-4 border-t border-slate-100 bg-slate-50/50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wider">Eligibility Breakdown</h4>
                      <ul className="space-y-3">
                        {candidate.eligibilityReasons.map((reason, idx) => (
                          <li key={idx} className="flex items-start gap-3">
                            {reason.met ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                            ) : (
                              <XCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
                            )}
                            <div>
                              <div className="text-sm font-medium text-slate-900">{reason.criterion}</div>
                              <div className="text-xs text-slate-500 mt-0.5">{reason.detail}</div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wider">Skills Analysis</h4>
                      
                      <div className="mb-4">
                        <div className="text-xs font-medium text-emerald-600 mb-2">Matched Skills ({candidate.matchedSkills.length})</div>
                        <div className="flex flex-wrap gap-2">
                          {candidate.matchedSkills.length > 0 ? candidate.matchedSkills.map(skill => (
                            <span key={skill} className="px-2.5 py-1 text-xs font-medium bg-emerald-100 text-emerald-700 rounded-lg">
                              {skill}
                            </span>
                          )) : <span className="text-xs text-slate-500 italic">None matched</span>}
                        </div>
                      </div>

                      <div>
                        <div className="text-xs font-medium text-rose-600 mb-2">Missing Required Skills ({candidate.missingSkills.length})</div>
                        <div className="flex flex-wrap gap-2">
                          {candidate.missingSkills.length > 0 ? candidate.missingSkills.map(skill => (
                            <span key={skill} className="px-2.5 py-1 text-xs font-medium bg-rose-100 text-rose-700 rounded-lg">
                              {skill}
                            </span>
                          )) : <span className="text-xs text-slate-500 italic">None missing</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="mt-8 pt-5 border-t border-slate-200 flex items-center justify-between">
                    <div>
                      {candidate.applicationStatus ? (
                        <div className="text-sm font-medium bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg inline-flex items-center gap-2">
                          Status: <span className="font-bold">{candidate.applicationStatus}</span>
                        </div>
                      ) : (
                        <div className="text-sm text-slate-500 italic">Has not applied yet</div>
                      )}
                    </div>
                    
                    {candidate.applicationId && ['SUBMITTED', 'UNDER_REVIEW'].includes(candidate.applicationStatus || '') && (
                      <div className="flex gap-3">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleStatusUpdate(candidate.applicationId!, 'REJECTED'); }}
                          className="px-4 py-2 text-sm font-medium text-rose-700 bg-rose-50 rounded-lg hover:bg-rose-100 flex items-center gap-2"
                        >
                          <UserX className="w-4 h-4" /> Reject
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleStatusUpdate(candidate.applicationId!, 'SHORTLISTED'); }}
                          className="px-4 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 flex items-center gap-2"
                        >
                          <UserCheck className="w-4 h-4" /> Shortlist
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CompanyCandidateMatchingPage;
