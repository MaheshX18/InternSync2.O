import React, { useState, useEffect } from 'react';
import {
  Users,
  Award,
  TrendingUp,
  AlertTriangle,
  Briefcase,
  BookOpen,
  CheckCircle,
  Search,
  Filter,
  Eye,
  Plus,
  ShieldCheck,
  UserCheck,
  Building,
  RefreshCw,
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  getTpoDashboardApi,
  getTpoStudentsApi,
  getTpoStudentDetailApi,
  getTpoAnalyticsApi,
  assignTpoTrainingApi,
  getTpoTrainingsApi
} from '../../api/client';
import {
  TPODashboardOverview,
  TPOStudentSummary,
  TPOStudentDetail,
  DepartmentAnalytics,
  TrainingProgram
} from '../../types';

export const TPODashboardPage: React.FC = () => {
  const [overview, setOverview] = useState<TPODashboardOverview | null>(null);
  const [students, setStudents] = useState<TPOStudentSummary[]>([]);
  const [analytics, setAnalytics] = useState<DepartmentAnalytics[]>([]);
  const [trainings, setTrainings] = useState<TrainingProgram[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [readinessFilter, setReadinessFilter] = useState('');

  // Selected Student Modal
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [studentDetail, setStudentDetail] = useState<TPOStudentDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);

  // Quick Assign Training Modal
  const [assignModalStudent, setAssignModalStudent] = useState<TPOStudentSummary | null>(null);
  const [selectedTrainingId, setSelectedTrainingId] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [assignSuccessMsg, setAssignSuccessMsg] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [dashRes, stdRes, anaRes, trnRes] = await Promise.all([
        getTpoDashboardApi(),
        getTpoStudentsApi({ search: searchTerm, department: selectedDept, readinessLevel: readinessFilter }),
        getTpoAnalyticsApi(),
        getTpoTrainingsApi()
      ]);

      if (dashRes.success) setOverview(dashRes.data);
      if (stdRes.success) setStudents(stdRes.data || []);
      if (anaRes.success) setAnalytics(anaRes.data || []);
      if (trnRes.success) setTrainings(trnRes.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load TPO Dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [searchTerm, selectedDept, readinessFilter]);

  const handleOpenDetail = async (studentId: string) => {
    setSelectedStudentId(studentId);
    setLoadingDetail(true);
    try {
      const res = await getTpoStudentDetailApi(studentId);
      if (res.success) {
        setStudentDetail(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleAssignTraining = async () => {
    if (!selectedTrainingId || !assignModalStudent) return;
    setAssigning(true);
    setAssignSuccessMsg(null);
    try {
      const res = await assignTpoTrainingApi(selectedTrainingId, {
        studentIds: [assignModalStudent.id]
      });
      if (res.success) {
        setAssignSuccessMsg(`Successfully assigned training to ${assignModalStudent.firstName}!`);
        setTimeout(() => {
          setAssignModalStudent(null);
          setAssignSuccessMsg(null);
          fetchDashboardData();
        }, 1500);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to assign training');
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div id="tpo-dashboard-page" className="min-h-screen bg-slate-50 text-slate-800 pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-purple-900 text-white py-10 px-4 sm:px-6 lg:px-8 border-b border-indigo-900/50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4 text-indigo-400" /> Training & Placement Officer Portal
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">Institutional Placement & Readiness Control Center</h1>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl">
              Monitor student career readiness, manage placement drives, deploy targeted skill interventions, and analyze cohort conversion metrics.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              to="/tpo/off-campus"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" /> Off-Campus Approvals
            </Link>
            <Link
              to="/tpo/drives"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Create Drive
            </Link>
            <Link
              to="/tpo/trainings"
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl backdrop-blur-md border border-white/20 transition-all flex items-center gap-1.5"
            >
              <BookOpen className="w-4 h-4" /> Manage Trainings
            </Link>
            <Link
              to="/tpo/interventions"
              className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold rounded-xl border border-amber-400/30 transition-all flex items-center gap-1.5"
            >
              <AlertTriangle className="w-4 h-4" /> Interventions
            </Link>
            <Link
              to="/tpo/attendance"
              className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-bold rounded-xl border border-cyan-400/30 transition-all flex items-center gap-1.5"
            >
              <Users className="w-4 h-4" /> Attendance
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        {loading && !overview ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
            <p className="text-sm font-semibold text-slate-600">Loading TPO Analytics & Placement Metrics...</p>
          </div>
        ) : error ? (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl flex items-center justify-between">
            <span>{error}</span>
            <button onClick={fetchDashboardData} className="text-xs font-bold text-rose-700 underline">
              Retry
            </button>
          </div>
        ) : (
          <>
            {/* Overview Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Total Students</span>
                  <Users className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="text-2xl font-bold text-slate-900">{overview?.totalStudents || 0}</div>
                <p className="text-[11px] text-slate-500 mt-1">Enrolled in batch</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Placement Rate</span>
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-bold text-emerald-600">
                  {overview?.placementRate ? `${overview.placementRate.toFixed(1)}%` : '0%'}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">{overview?.placedCount || 0} Placed Students</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Avg Readiness</span>
                  <Award className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="text-2xl font-bold text-indigo-600">
                  {overview?.avgReadinessScore ? overview.avgReadinessScore.toFixed(0) : 0} <span className="text-xs font-medium text-slate-400">/ 100</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">{overview?.careerReadyCount || 0} Career Ready</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-amber-200 bg-amber-50/30 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-amber-700 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Needs Attention</span>
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                </div>
                <div className="text-2xl font-bold text-amber-700">{overview?.needingAttentionCount || 0}</div>
                <p className="text-[11px] text-amber-600 mt-1">Readiness score &lt; 60</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Active Drives</span>
                  <Briefcase className="w-4 h-4 text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-purple-600">{overview?.recentDrivesCount || 0}</div>
                <p className="text-[11px] text-slate-500 mt-1">Ongoing placement drives</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Trainings</span>
                  <BookOpen className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-blue-600">{overview?.activeTrainingsCount || 0}</div>
                <p className="text-[11px] text-slate-500 mt-1">Active skill modules</p>
              </div>
            </div>

            {/* Pipeline & Readiness Distribution Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Placement Pipeline */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Placement Conversion Pipeline</h2>
                    <p className="text-xs text-slate-500">Cohort applications status progression across all companies</p>
                  </div>
                  <Building className="w-5 h-5 text-indigo-600" />
                </div>

                <div className="space-y-3 pt-2">
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                      <span>Applications Submitted</span>
                      <span>{overview?.pipelineStats?.applied || 0}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5">
                      <div className="bg-slate-500 h-2.5 rounded-full" style={{ width: '100%' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                      <span>Shortlisted for Review</span>
                      <span>{overview?.pipelineStats?.shortlisted || 0}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5">
                      <div
                        className="bg-blue-500 h-2.5 rounded-full transition-all duration-500"
                        style={{
                          width: `${
                            overview?.pipelineStats?.applied
                              ? (overview.pipelineStats.shortlisted / overview.pipelineStats.applied) * 100
                              : 0
                          }%`
                        }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                      <span>Interviews Scheduled</span>
                      <span>{overview?.pipelineStats?.interview || 0}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5">
                      <div
                        className="bg-purple-500 h-2.5 rounded-full transition-all duration-500"
                        style={{
                          width: `${
                            overview?.pipelineStats?.applied
                              ? (overview.pipelineStats.interview / overview.pipelineStats.applied) * 100
                              : 0
                          }%`
                        }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-emerald-800 mb-1">
                      <span>Offers Selected & Accepted</span>
                      <span className="font-bold text-emerald-600">{overview?.pipelineStats?.selected || 0}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5">
                      <div
                        className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500"
                        style={{
                          width: `${
                            overview?.pipelineStats?.applied
                              ? (overview.pipelineStats.selected / overview.pipelineStats.applied) * 100
                              : 0
                          }%`
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Readiness Distribution */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Career Readiness Cohort Breakdown</h2>
                    <p className="text-xs text-slate-500">Distribution of readiness tiers calculated by AI algorithms</p>
                  </div>
                  <Award className="w-5 h-5 text-indigo-600" />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                    <span className="text-xs font-bold text-emerald-800 uppercase block">Highly Ready (85+)</span>
                    <span className="text-2xl font-black text-emerald-700">{overview?.readinessDistribution?.highlyReady || 0}</span>
                    <span className="text-[10px] text-emerald-600 block mt-1">Prime placement candidates</span>
                  </div>

                  <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
                    <span className="text-xs font-bold text-indigo-800 uppercase block">Career Ready (70-84)</span>
                    <span className="text-2xl font-black text-indigo-700">{overview?.readinessDistribution?.careerReady || 0}</span>
                    <span className="text-[10px] text-indigo-600 block mt-1">Ready for drives</span>
                  </div>

                  <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                    <span className="text-xs font-bold text-blue-800 uppercase block">Developing (60-69)</span>
                    <span className="text-2xl font-black text-blue-700">{overview?.readinessDistribution?.developing || 0}</span>
                    <span className="text-[10px] text-blue-600 block mt-1">Moderate guidance needed</span>
                  </div>

                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <span className="text-xs font-bold text-amber-800 uppercase block">Needs Attention (&lt;60)</span>
                    <span className="text-2xl font-black text-amber-700">{overview?.readinessDistribution?.needsAttention || 0}</span>
                    <span className="text-[10px] text-amber-600 block mt-1">Auto-assigned interventions</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Department Analytics Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Departmental Performance Breakdown</h2>
                  <p className="text-xs text-slate-500">Placement statistics and readiness averages grouped by department</p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3">Department</th>
                      <th className="px-6 py-3">Total Students</th>
                      <th className="px-6 py-3">Placed</th>
                      <th className="px-6 py-3">Placement Rate</th>
                      <th className="px-6 py-3">Avg CGPA</th>
                      <th className="px-6 py-3">Avg Readiness Score</th>
                      <th className="px-6 py-3">Active Apps</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {analytics.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                          No department analytics data available.
                        </td>
                      </tr>
                    ) : (
                      analytics.map((dept) => (
                        <tr key={dept.department} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-6 py-4 font-bold text-slate-900">{dept.department}</td>
                          <td className="px-6 py-4 text-slate-600">{dept.totalStudents}</td>
                          <td className="px-6 py-4 text-emerald-700 font-bold">{dept.placedCount}</td>
                          <td className="px-6 py-4">
                            <span className="inline-block px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {dept.placementRate.toFixed(1)}%
                            </span>
                          </td>
                          <td className="px-6 py-4">{dept.avgGpa ? dept.avgGpa.toFixed(2) : 'N/A'}</td>
                          <td className="px-6 py-4">
                            <span className="font-bold text-indigo-600">{dept.avgReadinessScore.toFixed(0)}</span> / 100
                          </td>
                          <td className="px-6 py-4 text-slate-600">{dept.activeApplications}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Student Directory & Readiness Filter */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Student Readiness & Placement Directory</h2>
                  <p className="text-xs text-slate-500">Filter students by readiness level, assign trainings, or inspect individual profiles</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search name, email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 pr-3 py-1.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20 outline-none w-48"
                    />
                  </div>

                  <select
                    value={selectedDept}
                    onChange={(e) => setSelectedDept(e.target.value)}
                    className="px-3 py-1.5 border border-slate-300 rounded-xl text-xs bg-white text-slate-700 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                  >
                    <option value="">All Departments</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Electrical Engineering">Electrical Engineering</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                  </select>

                  <select
                    value={readinessFilter}
                    onChange={(e) => setReadinessFilter(e.target.value)}
                    className="px-3 py-1.5 border border-slate-300 rounded-xl text-xs bg-white text-slate-700 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                  >
                    <option value="">All Tiers</option>
                    <option value="Highly Ready">Highly Ready (&gt;=85)</option>
                    <option value="Career Ready">Career Ready (70-84)</option>
                    <option value="Needs Improvement">Needs Attention (&lt;60)</option>
                  </select>
                </div>
              </div>

              {/* Students Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Student</th>
                      <th className="px-4 py-3">Department & CGPA</th>
                      <th className="px-4 py-3">Readiness Score</th>
                      <th className="px-4 py-3">Placement Status</th>
                      <th className="px-4 py-3">Apps / Interviews</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {students.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                          No students found matching current filters.
                        </td>
                      </tr>
                    ) : (
                      students.map((student) => (
                        <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0 text-xs">
                                {student.firstName?.[0]}
                                {student.lastName?.[0]}
                              </div>
                              <div>
                                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                  {student.firstName} {student.lastName}
                                  {student.needsAttention && (
                                    <span className="px-1.5 py-0.2 text-[9px] font-extrabold bg-amber-100 text-amber-800 rounded">
                                      Needs Intervention
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-500">{student.email}</div>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-3">
                            <div className="text-slate-800 font-semibold">{student.department || 'CS'}</div>
                            <div className="text-[11px] text-slate-500">CGPA: {student.gpa ? student.gpa.toFixed(2) : '3.50'}</div>
                          </td>

                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span
                                className={`font-extrabold text-sm ${
                                  student.readinessScore >= 85
                                    ? 'text-emerald-600'
                                    : student.readinessScore >= 70
                                    ? 'text-indigo-600'
                                    : student.readinessScore >= 60
                                    ? 'text-blue-600'
                                    : 'text-amber-600'
                                }`}
                              >
                                {student.readinessScore}
                              </span>
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                  student.readinessScore >= 85
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : student.readinessScore >= 70
                                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                                }`}
                              >
                                {student.readinessLevel}
                              </span>
                            </div>
                          </td>

                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                                student.placementStatus === 'PLACED'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : student.placementStatus === 'INTERVIEWING'
                                  ? 'bg-purple-100 text-purple-800'
                                  : student.placementStatus === 'APPLYING'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {student.placementStatus}
                            </span>
                          </td>

                          <td className="px-4 py-3">
                            <div className="text-slate-700">
                              {student.applicationCount} Applied / {student.interviewCount} Interviews
                            </div>
                          </td>

                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Link
                                to={`/tpo/students/${student.id}/record`}
                                className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors flex items-center gap-1 text-[11px] font-bold"
                                title="Open 360 Verified Dossier"
                              >
                                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                <span className="hidden xl:inline">360° Record</span>
                              </Link>
                              <button
                                onClick={() => handleOpenDetail(student.id)}
                                className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                title="Quick Preview"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setAssignModalStudent(student)}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Assign Training Program"
                              >
                                <BookOpen className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Student Detail Modal */}
      {selectedStudentId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 space-y-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Student Placement Audit Profile</h3>
                <p className="text-xs text-slate-500">Comprehensive readiness details and application history</p>
              </div>
              <button
                onClick={() => setSelectedStudentId(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold px-2"
              >
                ✕
              </button>
            </div>

            {loadingDetail || !studentDetail ? (
              <div className="py-12 text-center text-slate-500 space-y-2">
                <RefreshCw className="w-6 h-6 animate-spin text-indigo-600 mx-auto" />
                <p className="text-xs font-semibold">Loading student breakdown...</p>
              </div>
            ) : (
              <div className="space-y-6 text-xs text-slate-700">
                {/* Header Info */}
                <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white font-black text-base flex items-center justify-center">
                    {studentDetail.firstName?.[0]}
                    {studentDetail.lastName?.[0]}
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-900">
                      {studentDetail.firstName} {studentDetail.lastName}
                    </h4>
                    <p className="text-slate-500"><strong>College:</strong> {studentDetail.collegeName || 'MIT Academy of Engineering'} • <strong>Dept:</strong> {studentDetail.department}</p>
                    <p className="text-slate-500"><strong>Email:</strong> {studentDetail.email} • <strong>Roll No:</strong> {studentDetail.rollNumber || 'N/A'} • <strong>PRN:</strong> {studentDetail.prn || 'N/A'}</p>
                    <p className="text-slate-500"><strong>CGPA:</strong> {studentDetail.gpa} • <strong>Batch:</strong> {studentDetail.batch}</p>
                  </div>
                </div>

                {/* Score breakdown */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl">
                    <span className="text-[10px] font-bold text-indigo-800 uppercase block">Career Readiness</span>
                    <span className="text-xl font-bold text-indigo-700">{studentDetail.readiness?.score || 0} / 100</span>
                    <span className="text-[10px] text-indigo-600 block mt-0.5">{studentDetail.readiness?.level}</span>
                  </div>
                  <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase block">Resume Score</span>
                    <span className="text-xl font-bold text-emerald-700">{studentDetail.resumeScore || 0} / 100</span>
                    <span className="text-[10px] text-emerald-600 block mt-0.5">Parsed via AI</span>
                  </div>
                </div>

                {/* Applications list */}
                <div>
                  <h5 className="font-bold text-slate-900 mb-2">Applied Internships & Drives</h5>
                  {studentDetail.applications?.length === 0 ? (
                    <p className="text-slate-400 italic">No applications submitted yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {studentDetail.applications.map((app) => (
                        <div key={app.id} className="p-3 border border-slate-200 rounded-xl flex items-center justify-between">
                          <div>
                            <div className="font-bold text-slate-900">{app.internshipTitle}</div>
                            <div className="text-[10px] text-slate-500">{app.companyName}</div>
                          </div>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                            {app.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Skill Gaps */}
                <div>
                  <h5 className="font-bold text-slate-900 mb-2">Identified Skill Gaps</h5>
                  <div className="flex flex-wrap gap-1.5">
                    {studentDetail.skillGaps?.map((sg) => (
                      <span key={sg} className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-[10px] font-semibold">
                        {sg}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Assign Training Modal */}
      {assignModalStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Assign Training Program</h3>
              <button onClick={() => setAssignModalStudent(null)} className="text-slate-400 hover:text-slate-600 text-sm font-bold">
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Assign a training program to <strong className="text-slate-900">{assignModalStudent.firstName} {assignModalStudent.lastName}</strong> ({assignModalStudent.department}).
            </p>

            {assignSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl">
                {assignSuccessMsg}
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">Select Program</label>
              <select
                value={selectedTrainingId}
                onChange={(e) => setSelectedTrainingId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-indigo-500/20 outline-none"
              >
                <option value="">-- Choose Module --</option>
                {trainings.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title} ({t.duration})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setAssignModalStudent(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignTraining}
                disabled={!selectedTrainingId || assigning}
                className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50"
              >
                {assigning ? 'Assigning...' : 'Confirm Assignment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TPODashboardPage;
