import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getFacultyDashboardApi } from '../../api/mentor';
import { FacultyDashboardData, FacultyMenteeDetail } from '../../types';
import {
  Users,
  BarChart3,
  AlertTriangle,
  FileText,
  Briefcase,
  ChevronRight,
  Loader2,
  Search,
  Sparkles,
  ShieldAlert
} from 'lucide-react';

export const MentorDashboardPage: React.FC = () => {
  const [data, setData] = useState<FacultyDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter State for My Mentees Section
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('ALL');
  const [deptFilter, setDeptFilter] = useState<string>('ALL');
  const [attendanceFilter, setAttendanceFilter] = useState<string>('ALL');
  const [internshipFilter, setInternshipFilter] = useState<string>('ALL');

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getFacultyDashboardApi();
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Filtered Mentees
  const filteredMentees = useMemo(() => {
    if (!data?.mentees) return [];
    return data.mentees.filter(mentee => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches =
          mentee.name.toLowerCase().includes(q) ||
          mentee.email.toLowerCase().includes(q) ||
          (mentee.rollNumber && mentee.rollNumber.toLowerCase().includes(q)) ||
          (mentee.department && mentee.department.toLowerCase().includes(q));
        if (!matches) return false;
      }

      // Department
      if (deptFilter !== 'ALL' && mentee.department !== deptFilter) {
        return false;
      }

      // Risk
      if (riskFilter !== 'ALL' && mentee.riskLevel !== riskFilter) {
        return false;
      }

      // Attendance
      if (attendanceFilter === 'LOW' && (mentee.attendance?.attendancePercentage ?? 100) >= 75) {
        return false;
      }
      if (attendanceFilter === 'GOOD' && (mentee.attendance?.attendancePercentage ?? 0) < 75) {
        return false;
      }

      // Internship
      if (internshipFilter === 'ACTIVE' && !mentee.internship) {
        return false;
      }
      if (internshipFilter === 'NONE' && mentee.internship) {
        return false;
      }

      return true;
    });
  }, [data?.mentees, searchQuery, riskFilter, deptFilter, attendanceFilter, internshipFilter]);

  // Students requiring attention
  const attentionStudents = useMemo(() => {
    if (data?.studentsRequiringAttention && data.studentsRequiringAttention.length > 0) {
      return data.studentsRequiringAttention;
    }
    if (!data?.mentees) return [];
    return data.mentees.filter(m =>
      m.riskLevel === 'HIGH' ||
      m.riskLevel === 'MEDIUM' ||
      (m.attendance && m.attendance.attendancePercentage < 75 && m.attendance.totalDays > 0) ||
      (m.cgpa && m.cgpa < 6.0) ||
      (m.backlogsCount && m.backlogsCount > 0) ||
      (m.logbooks && m.logbooks.pending > 0)
    ).map(m => {
      const reasons: string[] = [];
      if (m.attendance && m.attendance.attendancePercentage < 75) reasons.push(`Attendance: ${m.attendance.attendancePercentage}%`);
      if (m.cgpa && m.cgpa < 6.0) reasons.push(`CGPA: ${Number(m.cgpa).toFixed(2)}`);
      if (m.backlogsCount && m.backlogsCount > 0) reasons.push(`${m.backlogsCount} Backlog(s)`);
      if (m.logbooks && m.logbooks.pending > 0) reasons.push(`${m.logbooks.pending} Pending Logbook(s)`);
      return { ...m, attentionReasons: reasons };
    });
  }, [data]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <p className="text-sm text-slate-500 font-medium">Loading faculty mentoring dashboard...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-4xl mx-auto p-6 m-6 bg-rose-50 border border-rose-200 rounded-2xl text-center">
        <AlertTriangle className="w-8 h-8 text-rose-600 mx-auto mb-2" />
        <h3 className="text-base font-bold text-rose-900">Failed to Load Dashboard</h3>
        <p className="text-xs text-rose-700 mt-1">{error || 'Something went wrong while retrieving mentor data.'}</p>
        <button
          onClick={loadDashboard}
          className="mt-4 px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  const mentorProfile = data.mentorProfile;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Dynamic Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
            <Sparkles className="w-3.5 h-3.5" /> Faculty Mentoring Workspace
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            {getGreeting()}, {mentorProfile ? mentorProfile.name : 'Faculty Mentor'}
          </h1>
          <p className="text-sm text-slate-300 flex flex-wrap items-center gap-x-3 gap-y-1">
            <span>{mentorProfile?.designation || 'Faculty Mentor'}</span>
            <span className="text-slate-600">•</span>
            <span>{mentorProfile?.department || 'Department of Computer Science'}</span>
            {mentorProfile?.employeeId && (
              <>
                <span className="text-slate-600">•</span>
                <span className="text-indigo-300 font-mono text-xs">ID: {mentorProfile.employeeId}</span>
              </>
            )}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 px-5 border border-white/10 text-right">
            <span className="text-[10px] uppercase font-bold text-slate-300 block">Mentorship Capacity</span>
            <span className="text-lg font-black text-white">
              {data.totalMentees} <span className="text-xs font-normal text-slate-300">/ {data.maxCapacity} Seats</span>
            </span>
          </div>
          <Link
            to="/mentor/mentees"
            className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-2xl transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-2"
          >
            <Users className="w-4 h-4" /> All Mentees
          </Link>
        </div>
      </div>

      {/* 5 Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
              Active
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900">{data.totalMentees}</div>
          <div className="text-xs font-semibold text-slate-500 mt-0.5">Total Mentees</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center font-bold">
              <BarChart3 className="w-5 h-5" />
            </div>
            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${data.averageAttendance >= 75 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
              {data.averageAttendance >= 75 ? 'Good' : 'Low'}
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900">{data.averageAttendance}%</div>
          <div className="text-xs font-semibold text-slate-500 mt-0.5">Average Attendance</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center font-bold">
              <AlertTriangle className="w-5 h-5" />
            </div>
            {data.atRiskStudents > 0 && (
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 animate-pulse">
                Action
              </span>
            )}
          </div>
          <div className="text-2xl font-black text-slate-900">{data.atRiskStudents}</div>
          <div className="text-xs font-semibold text-slate-500 mt-0.5">Need Attention</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            {data.pendingLogbooks > 0 && (
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-50 text-amber-800">
                To Review
              </span>
            )}
          </div>
          <div className="text-2xl font-black text-slate-900">{data.pendingLogbooks}</div>
          <div className="text-xs font-semibold text-slate-500 mt-0.5">Pending Logbooks</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-bold">
              <Briefcase className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
              Industry
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900">{data.activeInterns}</div>
          <div className="text-xs font-semibold text-slate-500 mt-0.5">Currently Interning</div>
        </div>
      </div>

      {/* Prominent Attention Required Section */}
      {attentionStudents.length > 0 && (
        <div className="bg-gradient-to-br from-rose-50/80 via-white to-amber-50/50 rounded-3xl border border-rose-200/80 p-6 sm:p-7 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-rose-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-rose-600 text-white rounded-xl flex items-center justify-center font-bold shadow-md shadow-rose-200">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  Students Requiring Attention
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-600 text-white">
                    {attentionStudents.length}
                  </span>
                </h2>
                <p className="text-xs text-slate-500">Mentees flagged for low attendance, backlogs, or pending reviews</p>
              </div>
            </div>
            <span className="text-xs font-semibold text-rose-700 bg-rose-100/80 px-3 py-1 rounded-full self-start sm:self-auto">
              High Priority Mentoring
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {attentionStudents.map((st) => (
              <div
                key={st.id}
                className="bg-white rounded-2xl p-5 border border-rose-200/60 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-rose-100 text-rose-800 rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                        {st.firstName ? `${st.firstName.charAt(0)}${st.lastName?.charAt(0) || ''}` : st.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm leading-tight">{st.name}</h3>
                        <p className="text-xs text-slate-500 font-medium">{st.rollNumber || 'No Roll No'} • {st.department || 'N/A'}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 text-[10px] font-extrabold uppercase rounded-full shrink-0 ${
                      st.riskLevel === 'HIGH' ? 'bg-rose-100 text-rose-700 border border-rose-200' : 'bg-amber-100 text-amber-700 border border-amber-200'
                    }`}>
                      {st.riskLevel} Risk
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 my-3 p-2.5 bg-slate-50 rounded-xl text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Attendance</span>
                      <span className={`font-black ${st.attendance && st.attendance.attendancePercentage < 75 ? 'text-rose-600' : 'text-slate-800'}`}>
                        {st.attendance?.attendancePercentage ?? 0}%
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">CGPA</span>
                      <span className={`font-black ${(st.cgpa || 0) < 6.0 ? 'text-amber-600' : 'text-slate-800'}`}>
                        {st.cgpa ? Number(st.cgpa).toFixed(2) : 'N/A'}
                      </span>
                    </div>
                  </div>

                  {/* Attention reasons tags */}
                  {st.attentionReasons && st.attentionReasons.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {st.attentionReasons.map((reason, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-100">
                          ⚠ {reason}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <Link
                    to={`/mentor/students/${st.id}`}
                    className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl text-center transition-colors flex items-center justify-center gap-1"
                  >
                    View 360° Profile <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* My Mentees Section */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden space-y-4 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">My Mentees</h2>
            <p className="text-xs text-slate-500 mt-0.5">Assigned students under your faculty guidance</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full">
              Showing {filteredMentees.length} of {data.totalMentees} Students
            </span>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-1">
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, roll no..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50/50 text-slate-900"
            />
          </div>

          <select
            value={riskFilter}
            onChange={e => setRiskFilter(e.target.value)}
            className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50/50 text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="ALL">All Risk Levels</option>
            <option value="LOW">Low Risk</option>
            <option value="MEDIUM">Medium Risk</option>
            <option value="HIGH">High Risk</option>
          </select>

          <select
            value={attendanceFilter}
            onChange={e => setAttendanceFilter(e.target.value)}
            className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50/50 text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="ALL">All Attendance</option>
            <option value="GOOD">Good (≥ 75%)</option>
            <option value="LOW">Low (&lt; 75%)</option>
          </select>

          <select
            value={internshipFilter}
            onChange={e => setInternshipFilter(e.target.value)}
            className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50/50 text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="ALL">All Internships</option>
            <option value="ACTIVE">Active Intern</option>
            <option value="NONE">No Internship</option>
          </select>
        </div>

        {/* Mentees Table */}
        {filteredMentees.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-base font-bold text-slate-700">
              {data.totalMentees === 0 ? 'No students have been assigned to you yet.' : 'No Matching Mentees Found'}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {data.totalMentees === 0
                ? 'Your assigned mentees from the T&P department will appear here once allocated.'
                : 'Try adjusting your filters or search query.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider bg-slate-50/80">
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-3">Roll No</th>
                  <th className="py-3 px-3">CGPA</th>
                  <th className="py-3 px-3">Attendance</th>
                  <th className="py-3 px-3">Internship</th>
                  <th className="py-3 px-3">Risk Level</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMentees.map(mentee => {
                  const attPercent = mentee.attendance?.attendancePercentage ?? 0;
                  return (
                    <tr key={mentee.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold text-xs shrink-0">
                            {mentee.firstName ? `${mentee.firstName.charAt(0)}${mentee.lastName?.charAt(0) || ''}` : mentee.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-sm">{mentee.name}</div>
                            <div className="text-[11px] text-slate-400">{mentee.department || 'General'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 font-semibold text-slate-700">
                        {mentee.rollNumber || 'N/A'}
                      </td>
                      <td className="py-3.5 px-3 font-bold text-slate-900">
                        {mentee.cgpa ? Number(mentee.cgpa).toFixed(2) : 'N/A'}
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${attPercent >= 75 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                              style={{ width: `${Math.min(100, attPercent)}%` }}
                            />
                          </div>
                          <span className={`font-bold text-[11px] ${attPercent >= 75 ? 'text-emerald-700' : 'text-rose-700'}`}>
                            {attPercent}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-3">
                        {mentee.internship ? (
                          <div>
                            <span className="font-bold text-slate-800 text-xs block">{mentee.internship.companyName}</span>
                            <span className="text-[10px] font-semibold text-emerald-600 uppercase tracking-tight">
                              {mentee.internship.status}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">None</span>
                        )}
                      </td>
                      <td className="py-3.5 px-3">
                        <span className={`px-2.5 py-0.5 text-[10px] font-extrabold uppercase rounded-full ${
                          mentee.riskLevel === 'HIGH' ? 'bg-rose-100 text-rose-700 border border-rose-200' :
                          mentee.riskLevel === 'MEDIUM' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                          'bg-emerald-100 text-emerald-700 border border-emerald-200'
                        }`}>
                          {mentee.riskLevel}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          to={`/mentor/students/${mentee.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl transition-colors border border-indigo-200"
                        >
                          View Profile <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MentorDashboardPage;
