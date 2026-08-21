import React, { useEffect, useState } from 'react';
import { getAdminInternships, moderateInternshipStatus, deleteAdminInternship } from '../api/internships';
import { Internship, PagedResponse, InternshipStatus } from '../types';
import { PostingStatusBadge } from '../components/internships/PostingStatusBadge';
import { Shield, Search, Trash2, Loader2, Building2, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminInternshipManagementPage: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<PagedResponse<Internship> | null>(null);
  const [page, setPage] = useState<number>(0);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const res = await getAdminInternships({
        search: search || undefined,
        status: (statusFilter as InternshipStatus) || undefined,
        page,
        size: 10,
      });
      setData(res);
    } catch (err) {
      console.error('Failed to fetch admin internships', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [page, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    fetchAdminData();
  };

  const handleStatusChange = async (id: string, newStatus: InternshipStatus) => {
    try {
      setActionLoading(id);
      await moderateInternshipStatus(id, newStatus);
      await fetchAdminData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update status.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this posting as admin?')) return;
    try {
      setActionLoading(id);
      await deleteAdminInternship(id);
      await fetchAdminData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete posting.');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div id="admin-internships-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 rounded-xl">
          <Shield className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Job Moderation</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            Review, moderate, and manage all internship postings across the platform.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title, company, or location..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
          />
        </form>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(0);
            }}
            className="px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-0 cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="UNPUBLISHED">Unpublished</option>
            <option value="CLOSED">Closed</option>
            <option value="REMOVED_BY_ADMIN">Removed by Admin</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        </div>
      ) : !data || data.content.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-500">
          No internship postings found matching your filter criteria.
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-xs font-semibold uppercase text-slate-500 tracking-wider">
                  <th className="py-3.5 px-4">Title & Company</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Created Date</th>
                  <th className="py-3.5 px-4 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
                {data.content.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        <Link to={`/internships/${item.id}`} className="hover:text-indigo-600 inline-flex items-center gap-1">
                          {item.title}
                          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                        </Link>
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <Building2 className="w-3 h-3" />
                        <span>{item.companyName}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-slate-600 dark:text-slate-400 text-xs">
                      {item.workplaceType} • {item.employmentType}
                    </td>
                    <td className="py-4 px-4">
                      <PostingStatusBadge status={item.status} />
                    </td>
                    <td className="py-4 px-4 text-slate-500 text-xs">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {item.status !== 'REMOVED_BY_ADMIN' && (
                          <button
                            onClick={() => handleStatusChange(item.id, 'REMOVED_BY_ADMIN')}
                            disabled={actionLoading === item.id}
                            className="px-2.5 py-1 text-xs font-medium bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 rounded-md hover:bg-rose-100"
                          >
                            Remove
                          </button>
                        )}

                        {item.status === 'REMOVED_BY_ADMIN' && (
                          <button
                            onClick={() => handleStatusChange(item.id, 'PUBLISHED')}
                            disabled={actionLoading === item.id}
                            className="px-2.5 py-1 text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 rounded-md hover:bg-emerald-100"
                          >
                            Restore
                          </button>
                        )}

                        <button
                          onClick={() => handleDelete(item.id)}
                          disabled={actionLoading === item.id}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                          title="Permanent Delete"
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
