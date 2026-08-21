import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getFacultyMenteesApi } from '../../api/mentor';
import { FacultyMenteeDetail } from '../../types';
import {
  Users,
  Search,
  Loader2,
  ChevronRight,
  AlertTriangle,
  Building,
  GraduationCap,
  ArrowUpDown,
  LayoutGrid,
  List,
  CheckCircle2,
  Clock,
  Sparkles
} from 'lucide-react';

export const MentorMenteesPage: React.FC = () => {
  const [mentees, setMentees] = useState<FacultyMenteeDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter State
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [attendanceFilter, setAttendanceFilter] = useState('ALL');
  const [internshipFilter, setInternshipFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<'NAME' | 'CGPA' | 'ATTENDANCE' | 'RISK'>('NAME');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('ASC');
  const [viewMode, setViewMode] = useState<'GRID' | 'TABLE'>('GRID');

  useEffect(() => {
    loadMentees();
  }, []);

  const loadMentees = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getFacultyMenteesApi();
      if (res.success && res.data) {
        setMentees(res.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load mentees');
    } finally {
      setLoading(false);
    }
  };

  const departments = useMemo(() => {
    return Array.from(new Set(mentees.map(m => m.department).filter(Boolean))) as string[];
  }, [mentees]);

  const filteredAndSortedMentees = useMemo(() => {
    let result = mentees.filter(m => {
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matches =
          m.name.toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q) ||
          (m.rollNumber && m.rollNumber.toLowerCase().includes(q)) ||
          (m.department && m.department.toLowerCase().includes(q)) ||
          (m.internship?.companyName && m.internship.companyName.toLowerCase().includes(q));
        if (!matches) return false;
      }

      if (deptFilter !== 'ALL' && m.department !== deptFilter) return false;
      if (riskFilter !== 'ALL' && m.riskLevel !== riskFilter) return false;

      if (attendanceFilter === 'LOW' && (m.attendance?.attendancePercentage ?? 100) >= 75) return false;
      if (attendanceFilter === 'GOOD' && (m.attendance?.attendancePercentage ?? 0) < 75) return false;

      if (internshipFilter === 'ACTIVE' && !m.internship) return false;
      if (internshipFilter === 'NONE' && m.internship) return false;

      return true;
    });

    result.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'NAME') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === 'CGPA') {
        const cgpaA = Number(a.cgpa || 0);
        const cgpaB = Number(b.cgpa || 0);
        comparison = cgpaB - cgpaA;
      } else if (sortBy === 'ATTENDANCE') {
        const attA = a.attendance?.attendancePercentage ?? 0;
        const attB = b.attendance?.attendancePercentage ?? 0;
        comparison = attB - attA;
      } else if (sortBy === 'RISK') {
        const riskWeight: Record<string, number> = { HIGH: 3, MEDIUM: 2, LOW: 1 };
        comparison = (riskWeight[b.riskLevel] || 0) - (riskWeight[a.riskLevel] || 0);
      }

      return sortOrder === 'ASC' ? comparison : -comparison;
    });

    return result;
  }, [mentees, search, deptFilter, riskFilter, attendanceFilter, internshipFilter, sortBy, sortOrder]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <p className="text-sm text-slate-500 font-medium">Loading your student mentees...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6 m-6 bg-rose-50 border border-rose-200 rounded-2xl text-center">
        <AlertTriangle className="w-8 h-8 text-rose-600 mx-auto mb-2" />
        <h3 className="text-base font-bold text-rose-900">Failed to Load Mentees</h3>
        <p className="text-xs text-rose-700 mt-1">{error}</p>
        <button
          onClick={loadMentees}
          className="mt-4 px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Dedicated Mentees Directory</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Monitoring and academic mentorship for {mentees.length} assigned students
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-slate-100 p-1 rounded-xl flex items-center">
            <button
              onClick={() => setViewMode('GRID')}
              className={`p-2 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'GRID' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-700'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('TABLE')}
              className={`p-2 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'TABLE' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-700'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          <Link
            to="/mentor/dashboard"
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all"
          >
            Dashboard Overview
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, roll number, email, company..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50/50 text-slate-900"
            />
          </div>

          <select
            value={deptFilter}
            onChange={e => setDeptFilter(e.target.value)}
            className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50/50 text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="ALL">All Departments</option>
            {departments.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          <select
            value={riskFilter}
            onChange={e => setRiskFilter(e.target.value)}
            className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50/50 text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="ALL">All Risk Levels</option>
            <option value="HIGH">High Risk Only</option>
            <option value="MEDIUM">Medium Risk</option>
            <option value="LOW">Low Risk</option>
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
        </div>

        {/* Sorting & Results summary */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Sort by:</span>
            <button
              onClick={() => {
                if (sortBy === 'NAME') setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
                else { setSortBy('NAME'); setSortOrder('ASC'); }
              }}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                sortBy === 'NAME' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Name {sortBy === 'NAME' && (sortOrder === 'ASC' ? '↑' : '↓')}
            </button>
            <button
              onClick={() => {
                if (sortBy === 'CGPA') setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
                else { setSortBy('CGPA'); setSortOrder('ASC'); }
              }}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                sortBy === 'CGPA' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              CGPA {sortBy === 'CGPA' && (sortOrder === 'ASC' ? '↑' : '↓')}
            </button>
            <button
              onClick={() => {
                if (sortBy === 'ATTENDANCE') setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
                else { setSortBy('ATTENDANCE'); setSortOrder('ASC'); }
              }}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                sortBy === 'ATTENDANCE' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Attendance {sortBy === 'ATTENDANCE' && (sortOrder === 'ASC' ? '↑' : '↓')}
            </button>
            <button
              onClick={() => {
                if (sortBy === 'RISK') setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
                else { setSortBy('RISK'); setSortOrder('ASC'); }
              }}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                sortBy === 'RISK' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Risk {sortBy === 'RISK' && (sortOrder === 'ASC' ? '↑' : '↓')}
            </button>
          </div>

          <span className="text-slate-500 font-semibold">
            Showing <strong className="text-slate-900">{filteredAndSortedMentees.length}</strong> of {mentees.length} mentees
          </span>
        </div>
      </div>

      {/* Mentees Listing */}
      {filteredAndSortedMentees.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 shadow-xs">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Mentees Match Filter</h3>
          <p className="text-xs text-slate-400 mt-1">
            {mentees.length === 0 ? 'No students have been assigned to you by the TPO yet.' : 'Try adjusting your search criteria.'}
          </p>
        </div>
      ) : viewMode === 'GRID' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAndSortedMentees.map(mentee => {
            const attPercent = mentee.attendance?.attendancePercentage ?? 0;
            return (
              <div
                key={mentee.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all flex flex-col justify-between space-y-4 group"
              >
                <div>
                  {/* Top: Avatar, Name, Risk */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                        {mentee.firstName ? `${mentee.firstName.charAt(0)}${mentee.lastName?.charAt(0) || ''}` : mentee.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors leading-tight">
                          {mentee.name}
                        </h3>
                        <p className="text-xs text-slate-500 font-medium">
                          {mentee.rollNumber || 'No Roll'} • {mentee.department || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2.5 py-0.5 text-[10px] font-extrabold uppercase rounded-full shrink-0 ${
                      mentee.riskLevel === 'HIGH' ? 'bg-rose-100 text-rose-700 border border-rose-200' :
                      mentee.riskLevel === 'MEDIUM' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                      'bg-emerald-100 text-emerald-700 border border-emerald-200'
                    }`}>
                      {mentee.riskLevel}
                    </span>
                  </div>

                  {/* 3 Metric Badges */}
                  <div className="grid grid-cols-3 gap-2 p-2.5 bg-slate-50 rounded-xl text-center text-xs my-3">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">CGPA</span>
                      <span className="font-bold text-slate-900">
                        {mentee.cgpa ? Number(mentee.cgpa).toFixed(2) : 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Attendance</span>
                      <span className={`font-bold ${attPercent < 75 ? 'text-rose-600' : 'text-emerald-700'}`}>
                        {attPercent}%
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Backlogs</span>
                      <span className={`font-bold ${mentee.backlogsCount > 0 ? 'text-rose-600' : 'text-slate-800'}`}>
                        {mentee.backlogsCount || 0}
                      </span>
                    </div>
                  </div>

                  {/* Internship Status */}
                  <div className="text-xs p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <div className="flex items-center gap-2 truncate">
                      <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="text-slate-700 font-medium truncate">
                        {mentee.internship?.companyName || 'No active internship'}
                      </span>
                    </div>
                    {mentee.internship && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0">
                        Active
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer Action */}
                <div className="pt-2 border-t border-slate-100">
                  <Link
                    to={`/mentor/students/${mentee.id}`}
                    className="w-full py-2.5 bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 border border-indigo-200 hover:border-indigo-600"
                  >
                    Open Student 360° Profile <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider bg-slate-50/80">
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-3">Roll No</th>
                  <th className="py-3 px-3">Department</th>
                  <th className="py-3 px-3">CGPA</th>
                  <th className="py-3 px-3">Attendance</th>
                  <th className="py-3 px-3">Internship</th>
                  <th className="py-3 px-3">Risk Level</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAndSortedMentees.map(mentee => {
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
                            <div className="text-[11px] text-slate-400">{mentee.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 font-semibold text-slate-700">
                        {mentee.rollNumber || 'N/A'}
                      </td>
                      <td className="py-3.5 px-3 text-slate-600">
                        {mentee.department || 'N/A'}
                      </td>
                      <td className="py-3.5 px-3 font-bold text-slate-900">
                        {mentee.cgpa ? Number(mentee.cgpa).toFixed(2) : 'N/A'}
                      </td>
                      <td className="py-3.5 px-3">
                        <span className={`font-bold ${attPercent < 75 ? 'text-rose-600' : 'text-emerald-700'}`}>
                          {attPercent}%
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        {mentee.internship ? (
                          <span className="font-semibold text-slate-800">{mentee.internship.companyName}</span>
                        ) : (
                          <span className="text-slate-400 italic">None</span>
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
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white font-bold text-xs rounded-xl transition-all border border-indigo-200"
                        >
                          View 360° <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorMenteesPage;
