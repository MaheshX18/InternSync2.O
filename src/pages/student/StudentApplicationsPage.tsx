import React, { useEffect, useState } from 'react';
import { getMyApplications, withdrawApplication } from '../../api/applications';
import { Application, ApplicationStatus } from '../../types';
import { ApplicationStatusBadge } from '../../components/applications/ApplicationStatusBadge';
import { Loader2, FileText, Calendar, Building2, ExternalLink, AlertCircle, Ban } from 'lucide-react';
import { Link } from 'react-router-dom';

export const StudentApplicationsPage: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: any = {};
      if (statusFilter !== 'ALL') {
        params.status = statusFilter;
      }
      const data = await getMyApplications(params);
      setApplications(data.content);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load applications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [statusFilter]);

  const handleWithdraw = async (id: string) => {
    if (!window.confirm('Are you sure you want to withdraw this application? This action cannot be undone.')) {
      return;
    }
    try {
      setActionLoading(id);
      await withdrawApplication(id);
      await fetchApplications();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to withdraw application.');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div id="student-applications-page" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Applications</h1>
          <p className="text-sm text-slate-500 mt-1">Track and manage all internship applications submitted by you.</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800">
        {[
          { label: 'All Statuses', value: 'ALL' },
          { label: 'Submitted', value: 'SUBMITTED' },
          { label: 'Under Review', value: 'UNDER_REVIEW' },
          { label: 'Interview Scheduled', value: 'INTERVIEWED' },
          { label: 'Accepted', value: 'ACCEPTED' },
          { label: 'Rejected', value: 'REJECTED' },
          { label: 'Withdrawn', value: 'WITHDRAWN' },
        ].map(tab => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`px-3.5 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-all ${
              statusFilter === tab.value
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
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
          <FileText className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Applications Found</h3>
          <p className="text-sm text-slate-500 mt-1">
            {statusFilter === 'ALL'
              ? 'You have not submitted any internship applications yet.'
              : `No applications with status "${statusFilter}".`}
          </p>
          <Link
            to="/internships"
            className="inline-flex items-center gap-2 mt-6 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-xl transition-colors shadow-sm"
          >
            Browse Internships
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {applications.map(app => (
            <div
              key={app.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <ApplicationStatusBadge status={app.status} />
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> Applied on {new Date(app.appliedAt).toLocaleDateString()}
                  </span>
                </div>

                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white hover:text-indigo-600 transition-colors">
                    <Link to={`/internships/${app.internshipId}`}>{app.internshipTitle}</Link>
                  </h2>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                    <Building2 className="w-4 h-4 text-slate-400" />
                    {app.companyName}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                  <span>University: <strong className="text-slate-700 dark:text-slate-300">{app.university}</strong></span>
                  <span>Phone: <strong className="text-slate-700 dark:text-slate-300">{app.phoneNumber}</strong></span>
                  <a
                    href={app.resumeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                  >
                    View Resume <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {app.recruiterNotes && (
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-800">
                    <span className="font-semibold text-slate-900 dark:text-white">Note from Company: </span>
                    {app.recruiterNotes}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
                <Link
                  to={`/internships/${app.internshipId}`}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors border border-slate-200 dark:border-slate-800"
                >
                  View Job
                </Link>

                {app.status === 'SUBMITTED' && (
                  <button
                    onClick={() => handleWithdraw(app.id)}
                    disabled={actionLoading === app.id}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors border border-rose-200 dark:border-rose-900/50"
                  >
                    {actionLoading === app.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Ban className="w-3.5 h-3.5" />
                    )}
                    Withdraw
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
