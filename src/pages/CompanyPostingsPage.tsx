import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyCompanyInternships, updateInternshipStatus, deleteInternship } from '../api/internships';
import { Internship, PagedResponse, InternshipStatus } from '../types';
import { PostingStatusBadge } from '../components/internships/PostingStatusBadge';
import { Plus, Edit, Trash2, Eye, Loader2, Briefcase, Globe, FileText, CheckCircle2, XCircle, Users } from 'lucide-react';

export const CompanyPostingsPage: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<PagedResponse<Internship> | null>(null);
  const [page, setPage] = useState<number>(0);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchPostings = async () => {
    try {
      setLoading(true);
      const res = await getMyCompanyInternships({ page, size: 10 });
      setData(res);
    } catch (err) {
      console.error('Failed to fetch company internships', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPostings();
  }, [page]);

  const handleStatusChange = async (id: string, newStatus: InternshipStatus) => {
    try {
      setActionLoading(id);
      await updateInternshipStatus(id, newStatus);
      await fetchPostings();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update status.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this internship posting?')) return;
    try {
      setActionLoading(id);
      await deleteInternship(id);
      await fetchPostings();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete internship.');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div id="company-postings-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Internship Postings</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
            Manage your company's active, draft, and archived job listings.
          </p>
        </div>

        <Link
          id="create-posting-btn"
          to="/company/internships/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-lg transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Create New Posting
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        </div>
      ) : !data || data.content.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-3">
          <Briefcase className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">No job postings created yet</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Get started by creating your first internship or job posting to connect with candidates.
          </p>
          <Link
            to="/company/internships/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium text-sm rounded-lg hover:bg-indigo-700 mt-2"
          >
            <Plus className="w-4 h-4" /> Create Posting
          </Link>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-xs font-semibold uppercase text-slate-500 tracking-wider">
                  <th className="py-3.5 px-4">Title</th>
                  <th className="py-3.5 px-4">Type & Location</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Applicants</th>
                  <th className="py-3.5 px-4">Posted Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
                {data.content.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-4 px-4 font-semibold text-slate-900 dark:text-white">
                      <Link to={`/internships/${item.id}`} className="hover:text-indigo-600 line-clamp-1">
                        {item.title}
                      </Link>
                    </td>
                    <td className="py-4 px-4 text-slate-600 dark:text-slate-400">
                      <div>{item.location}</div>
                      <div className="text-xs text-slate-400">{item.workplaceType} • {item.employmentType}</div>
                    </td>
                    <td className="py-4 px-4">
                      <PostingStatusBadge status={item.status} />
                    </td>
                    <td className="py-4 px-4 font-medium text-slate-700 dark:text-slate-300">
                      {item.applicantCount || 0} applicants
                    </td>
                    <td className="py-4 px-4 text-slate-500 text-xs">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {item.status === 'DRAFT' || item.status === 'UNPUBLISHED' ? (
                          <button
                            onClick={() => handleStatusChange(item.id, 'PUBLISHED')}
                            disabled={actionLoading === item.id}
                            className="text-xs font-medium px-2.5 py-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 rounded-md hover:bg-emerald-100"
                            title="Publish"
                          >
                            Publish
                          </button>
                        ) : item.status === 'PUBLISHED' ? (
                          <button
                            onClick={() => handleStatusChange(item.id, 'UNPUBLISHED')}
                            disabled={actionLoading === item.id}
                            className="text-xs font-medium px-2.5 py-1 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 rounded-md hover:bg-slate-200"
                            title="Unpublish"
                          >
                            Unpublish
                          </button>
                        ) : null}

                        {item.status !== 'CLOSED' && item.status !== 'REMOVED_BY_ADMIN' && (
                          <button
                            onClick={() => handleStatusChange(item.id, 'CLOSED')}
                            disabled={actionLoading === item.id}
                            className="text-xs font-medium px-2 py-1 bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 rounded-md hover:bg-rose-100"
                            title="Close"
                          >
                            Close
                          </button>
                        )}

                        <Link
                          to={`/company/internships/${item.id}/candidates`}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="Match Candidates"
                        >
                          <Users className="w-4 h-4" />
                        </Link>

                        <Link
                          to={`/company/internships/${item.id}/edit`}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>

                        <button
                          onClick={() => handleDelete(item.id)}
                          disabled={actionLoading === item.id}
                          className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {data.totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-slate-200 dark:border-slate-800">
              <button
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-300 dark:border-slate-700 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Page {page + 1} of {data.totalPages}
              </span>
              <button
                disabled={data.last}
                onClick={() => setPage((p) => p + 1)}
                className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-300 dark:border-slate-700 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
