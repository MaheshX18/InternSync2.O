import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldX, ArrowLeft, LayoutDashboard } from 'lucide-react';

export const UnauthorizedPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'STUDENT') return '/student/dashboard';
    if (user.role === 'COMPANY') return '/company/dashboard';
    if (user.role === 'TPO') return '/tpo/dashboard';
    if (user.role === 'ADMIN') return '/admin/dashboard';
    if (user.role === 'FACULTY_MENTOR') return '/mentor/dashboard';
    return '/';
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-8 text-center space-y-6">
        <div className="inline-flex p-4 bg-rose-100 text-rose-600 rounded-full border border-rose-200">
          <ShieldX className="w-12 h-12" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-900">403 — Access Forbidden</h1>
          <p className="text-sm text-slate-600">
            You do not have authorization or the required role permission to view this page.
          </p>
          {user && (
            <p className="text-xs font-semibold text-slate-500 bg-slate-100 py-1.5 px-3 rounded-lg inline-block">
              Your Current Role: <span className="text-indigo-600 uppercase">{user.role}</span>
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all flex items-center justify-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" /> Go Back
          </button>
          <Link
            to={getDashboardPath()}
            className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-100 transition-all flex items-center justify-center gap-1.5"
          >
            <LayoutDashboard className="w-4 h-4" /> Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
