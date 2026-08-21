import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAdminDashboardApi } from '../../api/client';
import { AdminDashboardData } from '../../types';
import {
  ShieldAlert,
  Users,
  GraduationCap,
  Building2,
  UserCheck,
  UserX,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  Clock,
  Sparkles,
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await getAdminDashboardApi();
        if (res.success) {
          setData(res.data);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load system admin metrics.');
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
        <p className="text-sm text-slate-500 font-medium">Loading System Administrator Metrics...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-purple-950 to-indigo-950 text-white p-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-200 text-xs font-semibold uppercase tracking-wider">
              <ShieldAlert className="w-3.5 h-3.5" /> System Control Center
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">System Admin Console</h1>
            <p className="text-purple-200 text-sm max-w-xl">
              Monitor total registrations, user status compliance, and role distribution across InternSync.
            </p>
          </div>

          <Link
            to="/admin/users"
            className="px-5 py-2.5 bg-white text-slate-900 font-bold text-xs rounded-xl hover:bg-slate-100 shadow-md transition-all flex items-center gap-2 shrink-0"
          >
            <Users className="w-4 h-4 text-purple-600" /> Manage All Users <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Users</span>
          <p className="text-3xl font-extrabold text-slate-900">{data?.totalUsers ?? 0}</p>
          <span className="text-[11px] text-slate-500">Registered Platform Accounts</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
            <GraduationCap className="w-3.5 h-3.5 text-indigo-600" /> Students
          </span>
          <p className="text-3xl font-extrabold text-indigo-600">{data?.totalStudents ?? 0}</p>
          <span className="text-[11px] text-slate-500">Candidates & Applicants</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5 text-purple-600" /> Companies
          </span>
          <p className="text-3xl font-extrabold text-purple-600">{data?.totalCompanies ?? 0}</p>
          <span className="text-[11px] text-slate-500">Employer Partners</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600" /> Admins
          </span>
          <p className="text-3xl font-extrabold text-amber-600">{data?.totalAdmins ?? 0}</p>
          <span className="text-[11px] text-slate-500">System Administrators</span>
        </div>
      </div>

      {/* Account Status Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-emerald-50/60 border border-emerald-200/80 p-5 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-emerald-800">
            <span className="text-xs font-bold uppercase tracking-wider">Active Users</span>
            <UserCheck className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-950">{data?.activeUsers ?? 0}</p>
          <span className="text-xs text-emerald-700">Full platform access enabled</span>
        </div>

        <div className="bg-amber-50/60 border border-amber-200/80 p-5 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-amber-800">
            <span className="text-xs font-bold uppercase tracking-wider">Inactive Users</span>
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <p className="text-2xl font-extrabold text-amber-950">{data?.inactiveUsers ?? 0}</p>
          <span className="text-xs text-amber-700">Pending profile setup</span>
        </div>

        <div className="bg-rose-50/60 border border-rose-200/80 p-5 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-rose-800">
            <span className="text-xs font-bold uppercase tracking-wider">Suspended Users</span>
            <UserX className="w-5 h-5 text-rose-600" />
          </div>
          <p className="text-2xl font-extrabold text-rose-950">{data?.suspendedUsers ?? 0}</p>
          <span className="text-xs text-rose-700">Access blocked due to policy</span>
        </div>
      </div>

      {/* Recent Registrations Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden space-y-4 p-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="space-y-0.5">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" /> Recent User Registrations
            </h2>
            <p className="text-xs text-slate-500">Most recently registered platform users</p>
          </div>
          <Link
            to="/admin/users"
            className="text-xs font-bold text-purple-600 hover:underline flex items-center gap-1"
          >
            View All Users <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="p-3 rounded-l-lg">User</th>
                <th className="p-3">Role</th>
                <th className="p-3">Status</th>
                <th className="p-3 rounded-r-lg text-right">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data?.recentRegistrations && data.recentRegistrations.length > 0 ? (
                data.recentRegistrations.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3">
                      <div className="font-bold text-slate-900">
                        {u.firstName} {u.lastName}
                      </div>
                      <div className="text-slate-400 font-mono text-[11px]">{u.email}</div>
                    </td>
                    <td className="p-3">
                      <span className="px-2.5 py-1 font-bold rounded-lg uppercase tracking-wider text-[10px] bg-slate-100 text-slate-700 border border-slate-200">
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2.5 py-1 font-bold rounded-lg uppercase tracking-wider text-[10px] ${
                          u.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : u.status === 'SUSPENDED'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="p-3 text-right text-slate-500 font-mono">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-slate-400 italic">
                    No users registered yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
