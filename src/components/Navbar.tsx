import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  GraduationCap,
  Building2,
  Users,
  LogOut,
  User,
  LayoutDashboard,
  LogIn,
  UserPlus,
  Briefcase,
  Bookmark,
  FileText,
  Bell,
  CheckCheck,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { getNotificationsApi, markNotificationAsReadApi, markAllNotificationsAsReadApi } from '../api/client';
import { Notification } from '../types';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);

  const fetchNotifs = async () => {
    if (!isAuthenticated || !user) return;
    try {
      const res = await getNotificationsApi({ size: 10 });
      if (res.success && res.data) {
        setNotifications(res.data.content || []);
        const unread = (res.data.content || []).filter((n: Notification) => !n.read).length;
        setUnreadCount(unread);
      }
    } catch (e) {
      // Ignore background notification fetch errors
    }
  };

  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 15000);
    return () => clearInterval(interval);
  }, [isAuthenticated, user]);

  const handleMarkRead = async (id: string) => {
    try {
      await markNotificationAsReadApi(id);
      fetchNotifs();
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsReadApi();
      fetchNotifs();
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'STUDENT') return '/student/dashboard';
    if (user.role === 'COMPANY') return '/company/dashboard';
    if (user.role === 'TPO') return '/tpo/dashboard';
    if (user.role === 'ADMIN') return '/admin/dashboard';
    if (user.role === 'FACULTY_MENTOR') return '/mentor/dashboard';
    return '/';
  };

  const getProfilePath = () => {
    if (!user) return '/login';
    if (user.role === 'STUDENT') return '/student/profile';
    if (user.role === 'COMPANY') return '/company/profile';
    if (user.role === 'TPO') return '/tpo/dashboard';
    if (user.role === 'ADMIN') return '/admin/users';
    if (user.role === 'FACULTY_MENTOR') return '/mentor/dashboard';
    return '/';
  };

  return (
    <header id="navbar-header" className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 text-slate-800 shadow-sm">
      <div id="navbar-container" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link id="navbar-brand" to="/" className="flex items-center gap-3 group">
          <div id="navbar-logo-icon" className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-100 group-hover:scale-105 transition-transform">
            <div className="w-4 h-4 border-2 border-white rotate-45"></div>
          </div>
          <div>
            <span id="navbar-title" className="text-xl font-bold tracking-tight text-slate-900">
              Intern<span className="text-indigo-600">Sync</span>
            </span>
            <span id="navbar-subtitle" className="hidden sm:block text-[10px] font-medium tracking-wider text-slate-500 uppercase">
              University Internship Platform
            </span>
          </div>
        </Link>

        <nav id="navbar-links" className="flex items-center gap-2 sm:gap-4">
          <Link
            id="nav-link-internships"
            to="/internships"
            className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-indigo-600 transition-colors"
          >
            <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
            Explore Jobs
          </Link>

          {isAuthenticated && user && user.role === 'STUDENT' && (
            <>
              <Link
                id="nav-link-academics"
                to="/student/academics"
                className="hidden md:flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-indigo-600 transition-colors"
              >
                <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                Academics & CGPA
              </Link>
              <Link
                id="nav-link-internship-hub"
                to="/student/internship-hub"
                className="hidden lg:flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-indigo-50/90 px-2.5 py-1 rounded-lg border border-indigo-100 hover:bg-indigo-100 transition-colors"
              >
                <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
                Internship Hub
              </Link>
              <Link
                id="nav-link-off-campus"
                to="/student/off-campus"
                className="hidden lg:flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-indigo-600 transition-colors"
              >
                <FileText className="w-3.5 h-3.5 text-indigo-600" />
                Off-Campus
              </Link>
              <Link
                id="nav-link-career-readiness"
                to="/career-readiness"
                className="hidden xl:flex items-center gap-1.5 text-xs font-bold text-indigo-900 bg-gradient-to-r from-indigo-50 to-purple-50 px-2.5 py-1 rounded-lg border border-indigo-200 hover:border-indigo-300 transition-colors shadow-2xs"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                Readiness
              </Link>
              <Link
                id="nav-link-applications"
                to="/student/applications"
                className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-indigo-600 transition-colors"
              >
                <FileText className="w-3.5 h-3.5 text-indigo-600" />
                Applications
              </Link>
              <Link
                id="nav-link-recommendations"
                to="/recommendations"
                className="hidden 2xl:flex items-center gap-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50/80 px-2 py-1 rounded-lg border border-indigo-100 hover:bg-indigo-100 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                Matches
              </Link>
              <Link
                id="nav-link-student-trainings"
                to="/student/trainings"
                className="hidden md:flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200 hover:bg-emerald-100 transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                Trainings
              </Link>
            </>
          )}

          {isAuthenticated && user && (user.role === 'TPO' || user.role === 'ADMIN') && (
            <>
              <Link
                id="nav-link-tpo-drives"
                to="/tpo/drives"
                className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-indigo-600 transition-colors"
              >
                <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
                Drives
              </Link>
              <Link
                id="nav-link-tpo-off-campus"
                to="/tpo/off-campus"
                className="hidden md:flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200 hover:bg-indigo-100 transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                Off-Campus Approvals
              </Link>
              <Link
                id="nav-link-tpo-trainings"
                to="/tpo/trainings"
                className="hidden lg:flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-indigo-600 transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                Trainings
              </Link>
              <Link
                id="nav-link-tpo-interventions"
                to="/tpo/interventions"
                className="hidden md:flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200 hover:bg-amber-100 transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                Interventions
              </Link>
              <Link
                id="nav-link-tpo-attendance"
                to="/tpo/attendance"
                className="hidden lg:flex items-center gap-1.5 text-xs font-semibold text-cyan-700 bg-cyan-50 px-2 py-1 rounded-lg border border-cyan-200 hover:bg-cyan-100 transition-colors"
              >
                <Users className="w-3.5 h-3.5 text-cyan-600" />
                Attendance
              </Link>
              <Link
                id="nav-link-tpo-mentors"
                to="/tpo/mentors"
                className="hidden xl:flex items-center gap-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-200 hover:bg-indigo-100 transition-colors"
              >
                <Users className="w-3.5 h-3.5 text-indigo-600" />
                Faculty Mentors
              </Link>
            </>
          )}

          {isAuthenticated && user && user.role === 'COMPANY' && (
            <>
              <Link
                id="nav-link-company-applicants"
                to="/company/applications"
                className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-indigo-600 transition-colors"
              >
                <Users className="w-3.5 h-3.5 text-indigo-600" />
                Applicants
              </Link>
              <Link
                id="nav-link-company-interns"
                to="/company/intern-management"
                className="hidden md:flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200 hover:bg-indigo-100 transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5 text-indigo-600" />
                Intern Management & Evaluations
              </Link>
              <Link
                id="nav-link-company-postings"
                to="/company/internships"
                className="hidden md:flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-indigo-600 transition-colors"
              >
                <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
                Postings
              </Link>
            </>
          )}

          {isAuthenticated && user && user.role === 'FACULTY_MENTOR' && (
            <>
              <Link
                id="nav-link-mentor-dashboard"
                to="/mentor/dashboard"
                className="hidden md:flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200 hover:bg-indigo-100 transition-colors"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-indigo-600" />
                Dashboard
              </Link>
              <Link
                id="nav-link-mentor-mentees"
                to="/mentor/mentees"
                className="hidden md:flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-indigo-600 transition-colors"
              >
                <Users className="w-3.5 h-3.5 text-indigo-600" />
                My Mentees
              </Link>
            </>
          )}

          {isAuthenticated && user && user.role === 'ADMIN' && (
            <Link
              id="nav-link-admin-internships"
              to="/admin/internships"
              className="hidden md:flex items-center gap-1.5 text-xs font-semibold text-purple-700 hover:text-purple-900 transition-colors"
            >
              <Briefcase className="w-3.5 h-3.5 text-purple-600" />
              Moderate Jobs
            </Link>
          )}

          <Link
            id="nav-link-auth-hub"
            to="/auth-hub"
            className="hidden lg:flex items-center gap-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1.5 rounded-lg border border-indigo-200 hover:bg-indigo-100 transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
            Auth Hub
          </Link>

          {isAuthenticated && user ? (
            <div className="flex items-center gap-2">
              <Link
                to={getDashboardPath()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 text-xs font-bold rounded-xl transition-all"
              >
                <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
              </Link>

              {user.role !== 'ADMIN' && (
                <Link
                  to={getProfilePath()}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 text-xs font-bold rounded-xl transition-all"
                >
                  <User className="w-3.5 h-3.5" /> Profile
                </Link>
              )}

              {user.role === 'ADMIN' && (
                <Link
                  to="/admin/users"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold rounded-xl transition-all"
                >
                  <Users className="w-3.5 h-3.5" /> Users
                </Link>
              )}

              {/* Notification Bell */}
              <div className="relative">
                <button
                  id="nav-notification-bell"
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                  title="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 py-3 z-50 text-slate-800">
                    <div className="flex items-center justify-between px-4 pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-indigo-600" />
                        <h4 className="text-sm font-bold text-slate-900">Notifications</h4>
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
                        >
                          <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                        </button>
                      )}
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-xs text-slate-500">
                          No notifications yet.
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div
                            key={notif.id}
                            onClick={() => !notif.read && handleMarkRead(notif.id)}
                            className={`p-3 text-xs transition-colors cursor-pointer hover:bg-slate-50 ${
                              !notif.read ? 'bg-indigo-50/50 font-medium' : ''
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="font-bold text-slate-900">{notif.title}</span>
                              <span className="text-[10px] text-slate-400">
                                {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-slate-600 mt-1">{notif.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-900 leading-none">
                    {user.firstName} {user.lastName}
                  </div>
                  <span
                    className={`inline-block mt-0.5 text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                      user.role === 'ADMIN'
                        ? 'bg-purple-100 text-purple-800'
                        : user.role === 'COMPANY'
                        ? 'bg-blue-100 text-blue-800'
                        : user.role === 'FACULTY_MENTOR'
                        ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                        : user.role === 'TPO'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {user.role === 'FACULTY_MENTOR' ? 'Faculty Mentor' : user.role}
                  </span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-indigo-600 transition-colors flex items-center gap-1"
              >
                <LogIn className="w-3.5 h-3.5" /> Sign In
              </Link>
              <Link
                to="/register"
                className="px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-100 transition-all flex items-center gap-1"
              >
                <UserPlus className="w-3.5 h-3.5" /> Register
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
