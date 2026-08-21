import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getMyAcademicProfileApi, updateSemesterRecordApi } from '../../api/academics';
import { StudentAcademicProfile, SemesterRecord, AcademicSubject } from '../../types';
import {
  GraduationCap,
  BookOpen,
  Award,
  AlertTriangle,
  PlusCircle,
  CheckCircle2,
  XCircle,
  TrendingUp,
  FileCheck,
  Building,
  Hash,
  Sparkles
} from 'lucide-react';

export const StudentAcademicsPage: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<StudentAcademicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeSemTab, setActiveSemTab] = useState<number>(1);

  // New semester form state
  const [newSemNum, setNewSemNum] = useState<number>(1);
  const [newSemYear, setNewSemYear] = useState<string>('2025-2026');
  const [newSubjects, setNewSubjects] = useState<AcademicSubject[]>([
    { code: 'CS601', name: 'Cloud Computing & Distributed Systems', credits: 4, marks: 88, maxMarks: 100, grade: 'A', status: 'PASS' },
    { code: 'CS602', name: 'Machine Learning & Neural Networks', credits: 4, marks: 92, maxMarks: 100, grade: 'A+', status: 'PASS' },
    { code: 'CS603', name: 'DevOps & Microservices Lab', credits: 6, marks: 95, maxMarks: 100, grade: 'A+', status: 'PASS' }
  ]);
  const [savingSem, setSavingSem] = useState(false);

  const fetchAcademics = async () => {
    try {
      setLoading(true);
      const res = await getMyAcademicProfileApi();
      if (res.success && res.data) {
        setProfile(res.data);
        if (res.data.semesters && res.data.semesters.length > 0) {
          setActiveSemTab(res.data.semesters[res.data.semesters.length - 1].semester);
          setNewSemNum(res.data.semesters.length + 1);
        }
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load academic records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAcademics();
  }, []);

  const handleAddSubjectRow = () => {
    setNewSubjects([
      ...newSubjects,
      { code: `CS${newSemNum}0${newSubjects.length + 1}`, name: '', credits: 4, marks: 80, maxMarks: 100, grade: 'A', status: 'PASS' }
    ]);
  };

  const handleSubjectChange = (index: number, field: keyof AcademicSubject, value: any) => {
    const updated = [...newSubjects];
    updated[index] = { ...updated[index], [field]: value };

    // Auto calculate grade & status on marks change
    if (field === 'marks') {
      const m = Number(value);
      if (m >= 90) {
        updated[index].grade = 'A+';
        updated[index].status = 'PASS';
      } else if (m >= 80) {
        updated[index].grade = 'A';
        updated[index].status = 'PASS';
      } else if (m >= 70) {
        updated[index].grade = 'B+';
        updated[index].status = 'PASS';
      } else if (m >= 60) {
        updated[index].grade = 'B';
        updated[index].status = 'PASS';
      } else if (m >= 50) {
        updated[index].grade = 'C';
        updated[index].status = 'PASS';
      } else {
        updated[index].grade = 'F';
        updated[index].status = 'FAIL';
      }
    }

    setNewSubjects(updated);
  };

  const handleRemoveSubject = (index: number) => {
    if (newSubjects.length <= 1) return;
    setNewSubjects(newSubjects.filter((_, i) => i !== index));
  };

  const handleSaveSemester = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingSem(true);
      // Compute SGPA for this semester
      const totalCredits = newSubjects.reduce((acc, s) => acc + Number(s.credits), 0);
      const passedCredits = newSubjects.filter(s => s.status === 'PASS').reduce((acc, s) => acc + Number(s.credits), 0);
      
      const gradePointsMap: Record<string, number> = { 'A+': 4.0, 'A': 3.75, 'B+': 3.25, 'B': 3.0, 'C': 2.5, 'F': 0.0 };
      const totalPoints = newSubjects.reduce((acc, s) => acc + (gradePointsMap[s.grade] || 3.0) * Number(s.credits), 0);
      const sgpa = totalCredits > 0 ? Number((totalPoints / totalCredits).toFixed(2)) : 3.5;

      const semPayload: SemesterRecord = {
        semester: Number(newSemNum),
        academicYear: newSemYear,
        sgpa,
        totalCredits,
        passedCredits,
        status: newSubjects.some(s => s.status === 'FAIL') ? 'FAIL' : 'PASS',
        subjects: newSubjects
      };

      const res = await updateSemesterRecordApi(semPayload);
      if (res.success && res.data) {
        setProfile(res.data);
        setActiveSemTab(semPayload.semester);
        setShowAddModal(false);
      }
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to save semester record');
    } finally {
      setSavingSem(false);
    }
  };

  const currentSemRecord = profile?.semesters.find(s => s.semester === activeSemTab);

  return (
    <div id="student-academics-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Banner */}
      <div id="academics-header" className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
                Academic Performance Record
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold px-3 py-1 rounded-full">
                T&P Verified
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {user?.firstName} {user?.lastName} - Transcript & CGPA
            </h1>
            <p className="text-slate-300 text-sm mt-1 flex items-center gap-4 flex-wrap">
              <span className="flex items-center gap-1.5">
                <Building className="w-4 h-4 text-indigo-400" />
                {user?.collegeName || user?.institutionId || 'College of Engineering & Technology'}
              </span>
              <span className="flex items-center gap-1.5">
                <Hash className="w-4 h-4 text-indigo-400" />
                PRN: {user?.prn || `PRN-${user?.rollNumber || '2026CS042'}`}
              </span>
              <span className="flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-indigo-400" />
                {user?.department || 'Computer Science'} ({user?.batch || 'Batch 2026'})
              </span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="btn-add-semester"
              onClick={() => setShowAddModal(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              Add / Update Semester
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div id="academic-kpi-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div id="kpi-cgpa" className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Cumulative GPA (CGPA)</p>
            <p className="text-2xl font-bold text-slate-900">{profile?.cgpa?.toFixed(2) || (user?.gpa ? Number(user.gpa).toFixed(2) : '3.80')} <span className="text-xs text-slate-400">/ 4.0</span></p>
            <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-0.5">
              <TrendingUp className="w-3 h-3" /> Eligible for Tier-1 Drives
            </p>
          </div>
        </div>

        <div id="kpi-current-sem" className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Current Semester</p>
            <p className="text-2xl font-bold text-slate-900">Semester {profile?.currentSemester || 6}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">{profile?.semesters?.length || 5} Semesters Recorded</p>
          </div>
        </div>

        <div id="kpi-passed-subjects" className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Passed Subjects</p>
            <p className="text-2xl font-bold text-slate-900">{profile?.totalPassedSubjects || 24} Courses</p>
            <p className="text-[11px] text-emerald-600 font-medium mt-0.5">100% Course Clearance</p>
          </div>
        </div>

        <div id="kpi-backlogs" className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
            (profile?.backlogsCount || 0) > 0 ? 'bg-amber-50 border border-amber-200 text-amber-600' : 'bg-slate-50 border border-slate-200 text-slate-400'
          }`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Active Backlogs</p>
            <p className="text-2xl font-bold text-slate-900">{profile?.backlogsCount || 0}</p>
            <p className={`text-[11px] font-medium mt-0.5 ${(profile?.backlogsCount || 0) === 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
              {(profile?.backlogsCount || 0) === 0 ? 'Clean Academic Standing' : 'Remedial Support Recommended'}
            </p>
          </div>
        </div>
      </div>

      {/* Semester Breakdown Navigation */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 mb-8">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6 flex-wrap gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Semester Grade Sheets & Course Transcripts</h2>
            <p className="text-xs text-slate-500">Official course scores and credit weightings used for Placement eligibility checks</p>
          </div>

          {/* Semester Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            {profile?.semesters.map(sem => (
              <button
                key={sem.semester}
                onClick={() => setActiveSemTab(sem.semester)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeSemTab === sem.semester
                    ? 'bg-white text-indigo-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Sem {sem.semester}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Semester Details */}
        {currentSemRecord ? (
          <div>
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 mb-6 flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-6">
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Semester SGPA</span>
                  <p className="text-xl font-bold text-indigo-600">{currentSemRecord.sgpa.toFixed(2)} / 4.0</p>
                </div>
                <div className="h-8 w-px bg-slate-200"></div>
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Academic Year</span>
                  <p className="text-sm font-semibold text-slate-800">{currentSemRecord.academicYear}</p>
                </div>
                <div className="h-8 w-px bg-slate-200"></div>
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Total Credits</span>
                  <p className="text-sm font-semibold text-slate-800">{currentSemRecord.passedCredits} / {currentSemRecord.totalCredits} Earned</p>
                </div>
              </div>

              <div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  currentSemRecord.status === 'PASS' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}>
                  {currentSemRecord.status === 'PASS' ? 'SEMESTER CLEARED' : 'BACKLOGS PRESENT'}
                </span>
              </div>
            </div>

            {/* Subject Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider">
                    <th className="py-3 px-4 rounded-l-xl">Course Code</th>
                    <th className="py-3 px-4">Subject Name</th>
                    <th className="py-3 px-4 text-center">Credits</th>
                    <th className="py-3 px-4 text-center">Marks</th>
                    <th className="py-3 px-4 text-center">Grade</th>
                    <th className="py-3 px-4 text-right rounded-r-xl">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentSemRecord.subjects.map((sub, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-indigo-700">{sub.code}</td>
                      <td className="py-3.5 px-4 font-medium text-slate-900">{sub.name}</td>
                      <td className="py-3.5 px-4 text-center font-semibold text-slate-700">{sub.credits}</td>
                      <td className="py-3.5 px-4 text-center font-bold text-slate-900">{sub.marks} / {sub.maxMarks}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded font-bold text-xs ${
                          sub.grade === 'A+' ? 'bg-purple-100 text-purple-700' :
                          sub.grade === 'A' ? 'bg-indigo-100 text-indigo-700' :
                          sub.grade.startsWith('B') ? 'bg-blue-100 text-blue-700' :
                          sub.grade === 'F' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {sub.grade}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span className={`inline-flex items-center gap-1 font-bold ${
                          sub.status === 'PASS' ? 'text-emerald-600' : 'text-rose-600'
                        }`}>
                          {sub.status === 'PASS' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                          {sub.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500">No course data found for this semester.</p>
          </div>
        )}
      </div>

      {/* Modal to Add/Update Semester */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Add or Update Semester Record</h3>
                  <p className="text-xs text-slate-500">Enter semester course grades to recalculate cumulative CGPA</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSemester} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Semester Number</label>
                  <select
                    value={newSemNum}
                    onChange={e => setNewSemNum(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                      <option key={n} value={n}>Semester {n}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Academic Year</label>
                  <input
                    type="text"
                    value={newSemYear}
                    onChange={e => setNewSemYear(e.target.value)}
                    placeholder="e.g. 2025-2026"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    required
                  />
                </div>
              </div>

              {/* Subject Rows */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-700">Course Marks & Credits</label>
                  <button
                    type="button"
                    onClick={handleAddSubjectRow}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                  >
                    <PlusCircle className="w-3.5 h-3.5" /> Add Course
                  </button>
                </div>

                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {newSubjects.map((sub, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-12 gap-2 items-center text-xs">
                      <div className="col-span-3">
                        <input
                          type="text"
                          placeholder="Code (e.g. CS601)"
                          value={sub.code}
                          onChange={e => handleSubjectChange(idx, 'code', e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 font-mono text-xs"
                          required
                        />
                      </div>
                      <div className="col-span-4">
                        <input
                          type="text"
                          placeholder="Course Title"
                          value={sub.name}
                          onChange={e => handleSubjectChange(idx, 'name', e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs"
                          required
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          placeholder="Marks (0-100)"
                          value={sub.marks}
                          onChange={e => handleSubjectChange(idx, 'marks', e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-center font-bold"
                          min="0"
                          max="100"
                          required
                        />
                      </div>
                      <div className="col-span-2 text-center font-bold text-indigo-700 bg-indigo-50 py-1.5 rounded-lg border border-indigo-100">
                        {sub.grade} ({sub.status})
                      </div>
                      <div className="col-span-1 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveSubject(idx)}
                          className="text-slate-400 hover:text-rose-500 font-bold"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingSem}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-md transition-all disabled:opacity-50"
                >
                  {savingSem ? 'Saving...' : 'Save & Calculate CGPA'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
