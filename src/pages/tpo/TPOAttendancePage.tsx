import React, { useState, useEffect } from 'react';
import {
  Users,
  AlertCircle,
  CheckCircle,
  Calendar,
  Clock,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Search,
  Filter,
  Eye,
  ShieldCheck,
  Building
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getTpoAttendanceApi } from '../../api/client';
import { TPOAttendanceOverview } from '../../types';

export const TPOAttendancePage: React.FC = () => {
  const [data, setData] = useState<TPOAttendanceOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchAttendance = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getTpoAttendanceApi();
      if (res.success) {
        setData(res.data);
      } else {
        setError(res.message || 'Failed to fetch attendance data');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching attendance data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const filteredStudents = data?.studentSummaries?.filter(s =>
    s.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.internshipTitle?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div id="tpo-attendance-page" className="min-h-screen bg-slate-50 text-slate-800 pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-purple-900 text-white py-10 px-4 sm:px-6 lg:px-8 border-b border-indigo-900/50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4 text-indigo-400" /> Training & Placement Officer Portal
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">Institutional Attendance Monitor</h1>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl">
              Track student internship attendance, identify at-risk students, and monitor daily check-ins across all partner companies.
            </p>
          </div>
          <button
            onClick={fetchAttendance}
            disabled={loading}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl backdrop-blur-md border border-white/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh Data
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        {loading && !data ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
            <p className="text-sm font-semibold text-slate-600">Loading Attendance Metrics...</p>
          </div>
        ) : error ? (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl flex items-center justify-between shadow-sm">
            <span>{error}</span>
            <button onClick={fetchAttendance} className="text-xs font-bold text-rose-700 underline hover:text-rose-900">
              Retry
            </button>
          </div>
        ) : data ? (
          <>
            {/* KPI Metrics Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Active Interns</span>
                  <Users className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="text-3xl font-black text-slate-900">{data.totalActiveInterns || 0}</div>
                <p className="text-[11px] text-slate-500 mt-1">Total placed students currently interning</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Present Today</span>
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-3xl font-black text-emerald-600">{data.totalPresentToday || 0}</div>
                <div className="flex items-center mt-1 text-[11px] text-emerald-600 font-medium">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Checked in today
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Avg Attendance</span>
                  <TrendingUp className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="text-3xl font-black text-slate-900">{data.averageAttendance || 0}%</div>
                <p className="text-[11px] text-slate-500 mt-1">Across all active internships</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border-l-4 border-l-rose-500 border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between text-rose-500 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">At Risk (&lt; 75%)</span>
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                </div>
                <div className="text-3xl font-black text-rose-600">{data.lowAttendanceCount || 0}</div>
                <div className="flex items-center mt-1 text-[11px] text-rose-600 font-medium">
                  <TrendingDown className="w-3 h-3 mr-1" />
                  Needs intervention
                </div>
              </div>
            </div>

            {/* Attendance Details Table */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Student Attendance Records</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Comprehensive view of all active intern attendance</p>
                </div>
                <div className="relative w-full sm:w-72">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by student, company..."
                    className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white"
                  />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Student</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Company & Role</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Attendance %</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status Today</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {filteredStudents.length > 0 ? (
                      filteredStudents.map((student, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 text-indigo-600 flex items-center justify-center rounded-full font-bold shadow-sm">
                                {student.studentName?.charAt(0) || 'S'}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-bold text-slate-900">{student.studentName || 'Unknown'}</div>
                                <div className="text-[11px] text-slate-500">{student.studentEmail || 'No email provided'}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {student.activeInternship ? (
                              <>
                                <div className="text-sm text-slate-900 font-medium flex items-center gap-1">
                                  <Building className="w-3 h-3 text-slate-400" />
                                  {student.companyName || 'Company'}
                                </div>
                                <div className="text-[11px] text-slate-500">{student.internshipTitle || 'Role'}</div>
                              </>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                                Not Assigned
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {student.activeInternship ? (
                              <div className="flex items-center">
                                <span className={`text-sm font-bold mr-2 ${
                                  (student.attendancePercentage || 0) >= 75 ? 'text-emerald-600' : 'text-rose-600'
                                }`}>
                                  {student.attendancePercentage || 0}%
                                </span>
                                <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${
                                      (student.attendancePercentage || 0) >= 75 ? 'bg-emerald-500' : 'bg-rose-500'
                                    }`}
                                    style={{ width: `${Math.min(student.attendancePercentage || 0, 100)}%` }}
                                  ></div>
                                </div>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {student.activeInternship ? (
                              student.isPresentToday ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Present
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
                                  <AlertCircle className="w-3 h-3 mr-1" />
                                  Absent
                                </span>
                              )
                            ) : (
                              <span className="text-xs text-slate-400">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Link
                              to={`/tpo/students/${student.studentId}/record`}
                              className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1"
                            >
                              <Eye className="w-3 h-3" /> View Record
                            </Link>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-500">
                          <div className="flex flex-col items-center">
                            <Users className="w-8 h-8 text-slate-300 mb-2" />
                            <p>No student attendance records found.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};
