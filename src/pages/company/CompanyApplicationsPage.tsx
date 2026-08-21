import React, { useEffect, useState } from 'react';
import { getCompanyApplications, updateApplicationStatus } from '../../api/applications';
import { Application, ApplicationStatus } from '../../types';
import { ApplicationStatusBadge } from '../../components/applications/ApplicationStatusBadge';
import {
  Search,
  Filter,
  Loader2,
  Users,
  ExternalLink,
  Mail,
  Phone,
  GraduationCap,
  CheckCircle2,
  XCircle,
  FileText,
  AlertCircle,
  Clock
} from 'lucide-react';

export const CompanyApplicationsPage: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  const [statusModalOpen, setStatusModalOpen] = useState<boolean>(false);
  const [targetStatus, setTargetStatus] = useState<ApplicationStatus>('UNDER_REVIEW');
  const [recruiterNotes, setRecruiterNotes] = useState<string>('');
  const [updating, setUpdating] = useState<boolean>(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const fetchApplicants = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: any = {};
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (search.trim()) params.search = search.trim();

      const res = await getCompanyApplications(params);
      setApplications(res.content);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch applicants.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicants();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchApplicants();
  };

  const openStatusModal = (app: Application, nextStatus: ApplicationStatus) => {
    setSelectedApp(app);
    setTargetStatus(nextStatus);
    setRecruiterNotes(app.recruiterNotes || '');
    setUpdateError(null);
    setStatusModalOpen(true);
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;

    try {
      setUpdating(true);
      setUpdateError(null);
      await updateApplicationStatus(selectedApp.id, {
        status: targetStatus,
        recruiterNotes: recruiterNotes.trim()
      });
      setStatusModalOpen(false);
      setSelectedApp(null);
      await fetchApplicants();
    } catch (err: any) {
      setUpdateError(err.response?.data?.message || 'Failed to update application status.');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div id="company-applications-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Applicant Management</h1>
          <p className="text-sm text-slate-500 mt-1">Review candidates and manage applicant pipelines across your job postings.</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search candidate name, email, or job title..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </form>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
          {[
            { label: 'All', value: 'ALL' },
            { label: 'Submitted', value: 'SUBMITTED' },
            { label: 'Under Review', value: 'UNDER_REVIEW' },
            { label: 'Interviewed', value: 'INTERVIEWED' },
            { label: 'Accepted', value: 'ACCEPTED' },
            { label: 'Rejected', value: 'REJECTED' },
          ].map(tab => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-all ${
                statusFilter === tab.value
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        </div>
      ) : error ? (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-xl flex items-center gap-3 text-rose-700 dark:text-rose-300 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      ) : applications.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center">
          <Users className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Applicants Found</h3>
          <p className="text-sm text-slate-500 mt-1">There are no candidates matching your current filters.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {applications.map(app => (
            <div
              key={app.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">{app.studentName}</h2>
                    <ApplicationStatusBadge status={app.status} />
                  </div>
                  <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium mt-0.5">
                    Applied for: <span className="font-semibold text-slate-900 dark:text-white">{app.internshipTitle}</span>
                  </p>
                </div>

                <div className="text-xs text-slate-400 flex items-center gap-1 shrink-0">
                  <Clock className="w-3.5 h-3.5" />
                  {new Date(app.appliedAt).toLocaleDateString()}
                </div>
              </div>

              {/* Grid Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="truncate">{app.studentEmail}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{app.phoneNumber}</span>
                </div>
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="truncate">{app.university} ('{app.graduationYear})</span>
                </div>
                <div>
                  <a
                    href={app.resumeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                  >
                    <FileText className="w-4 h-4" /> View Resume <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Cover Letter excerpt */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-xs text-slate-700 dark:text-slate-300">
                <span className="font-semibold text-slate-900 dark:text-white">Cover Letter: </span>
                <p className="mt-1 whitespace-pre-line text-slate-600 dark:text-slate-400 italic">"{app.coverLetter}"</p>
              </div>

              {/* Candidate Skills */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {app.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-xs rounded-lg"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              {/* Status Action Workflow Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 flex-wrap">
                {app.status === 'SUBMITTED' && (
                  <button
                    onClick={() => openStatusModal(app, 'UNDER_REVIEW')}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs rounded-xl transition-colors shadow-sm"
                  >
                    Start Review
                  </button>
                )}

                {app.status === 'UNDER_REVIEW' && (
                  <>
                    <button
                      onClick={() => openStatusModal(app, 'INTERVIEWED')}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-xl transition-colors shadow-sm"
                    >
                      Schedule Interview
                    </button>
                    <button
                      onClick={() => openStatusModal(app, 'REJECTED')}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-xl transition-colors shadow-sm"
                    >
                      Reject
                    </button>
                  </>
                )}

                {app.status === 'INTERVIEWED' && (
                  <>
                    <button
                      onClick={() => openStatusModal(app, 'ACCEPTED')}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl transition-colors shadow-sm"
                    >
                      Accept Candidate
                    </button>
                    <button
                      onClick={() => openStatusModal(app, 'REJECTED')}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-xl transition-colors shadow-sm"
                    >
                      Reject Candidate
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Status Transition Modal */}
      {statusModalOpen && selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Update Application Status
            </h3>
            <p className="text-xs text-slate-500">
              Moving <strong className="text-slate-800 dark:text-slate-200">{selectedApp.studentName}</strong> from{' '}
              <strong className="text-indigo-600">{selectedApp.status}</strong> to{' '}
              <strong className="text-emerald-600">{targetStatus}</strong>.
            </p>

            {updateError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-xl text-rose-700 dark:text-rose-300 text-xs">
                {updateError}
              </div>
            )}

            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                  Recruiter Notes / Feedback
                </label>
                <textarea
                  rows={3}
                  value={recruiterNotes}
                  onChange={e => setRecruiterNotes(e.target.value)}
                  placeholder="Add optional notes for the student or internal records..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStatusModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-sm disabled:opacity-50"
                >
                  {updating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Confirm Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
