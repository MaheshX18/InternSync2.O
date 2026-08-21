import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  getMyAttendanceApi,
  checkInAttendanceApi
} from '../../api/attendance';
import {
  getMyTasksApi,
  updateTaskProgressApi
} from '../../api/tasks';
import {
  getMyEvaluationsApi
} from '../../api/evaluations';
import {
  StudentAttendanceSummary,
  InternshipTask,
  InternshipEvaluation
} from '../../types';
import {
  Briefcase,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Award,
  AlertTriangle,
  ListTodo,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Building2,
  Sparkles,
  Send,
  FileCheck2,
  Star
} from 'lucide-react';

export const StudentInternshipHubPage: React.FC = () => {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState<StudentAttendanceSummary | null>(null);
  const [tasks, setTasks] = useState<InternshipTask[]>([]);
  const [evaluations, setEvaluations] = useState<InternshipEvaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkInNotes, setCheckInNotes] = useState('');
  const [activeTab, setActiveTab] = useState<'attendance' | 'tasks' | 'evaluation'>('attendance');

  // Task submission modal / state
  const [selectedTask, setSelectedTask] = useState<InternshipTask | null>(null);
  const [taskProgress, setTaskProgress] = useState<number>(0);
  const [taskSubmissionUrl, setTaskSubmissionUrl] = useState<string>('');
  const [taskSubmissionNotes, setTaskSubmissionNotes] = useState<string>('');
  const [updatingTask, setUpdatingTask] = useState(false);

  const fetchHubData = async () => {
    try {
      setLoading(true);
      const [attRes, taskRes, evalRes] = await Promise.all([
        getMyAttendanceApi(),
        getMyTasksApi(),
        getMyEvaluationsApi()
      ]);

      if (attRes.success && attRes.data) setAttendance(attRes.data);
      if (taskRes.success && taskRes.data) setTasks(taskRes.data);
      if (evalRes.success && evalRes.data) setEvaluations(evalRes.data);
    } catch (err) {
      console.error('Failed to load student internship hub data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHubData();
  }, []);

  const handleCheckIn = async () => {
    try {
      setCheckingIn(true);
      const res = await checkInAttendanceApi(checkInNotes || undefined);
      if (res.success && res.data) {
        setAttendance(res.data.summary);
        setCheckInNotes('');
      }
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to record attendance');
    } finally {
      setCheckingIn(false);
    }
  };

  const handleOpenTaskModal = (task: InternshipTask) => {
    setSelectedTask(task);
    setTaskProgress(task.progressPercentage || 0);
    setTaskSubmissionUrl(task.submissionUrl || '');
    setTaskSubmissionNotes(task.submissionNotes || '');
  };

  const handleSaveTaskProgress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;

    try {
      setUpdatingTask(true);
      const newStatus = taskProgress === 100 ? 'COMPLETED' : taskProgress > 0 ? 'IN_PROGRESS' : 'TODO';
      const res = await updateTaskProgressApi(selectedTask.id, {
        status: newStatus,
        progressPercentage: taskProgress,
        submissionUrl: taskSubmissionUrl || undefined,
        submissionNotes: taskSubmissionNotes || undefined
      });

      if (res.success && res.data) {
        setTasks(tasks.map(t => t.id === selectedTask.id ? res.data : t));
        setSelectedTask(null);
      }
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to update task');
    } finally {
      setUpdatingTask(false);
    }
  };

  return (
    <div id="student-internship-hub-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Banner */}
      <div id="internship-hub-header" className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Active Internship Tracking
              </span>
              <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold px-3 py-1 rounded-full">
                Semester 6 Credits
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {attendance?.internshipTitle || 'Fullstack Software Engineering Intern'}
            </h1>
            <p className="text-slate-300 text-sm mt-1 flex items-center gap-4 flex-wrap">
              <span className="flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-indigo-400" />
                {attendance?.companyName || 'TechCorp Solutions'}
              </span>
              <span className="flex items-center gap-1.5">
                <CalendarCheck className="w-4 h-4 text-emerald-400" />
                Attendance: {attendance?.attendancePercentage || 95.5}%
              </span>
              <span className="flex items-center gap-1.5">
                <ListTodo className="w-4 h-4 text-purple-400" />
                Tasks: {tasks.filter(t => t.status === 'COMPLETED').length} / {tasks.length} Completed
              </span>
            </p>
          </div>

          {/* Quick 1-Click Check In Action */}
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 flex flex-col sm:flex-row items-center gap-3">
            {attendance?.isPresentToday ? (
              <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs bg-emerald-500/20 border border-emerald-500/30 px-4 py-2.5 rounded-xl">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Checked in for Today
              </div>
            ) : (
              <button
                id="btn-quick-check-in"
                onClick={handleCheckIn}
                disabled={checkingIn}
                className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <CalendarCheck className="w-4 h-4" />
                {checkingIn ? 'Checking In...' : "I'm Present Today"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 bg-slate-200/70 p-1.5 rounded-2xl w-fit mb-8">
        <button
          onClick={() => setActiveTab('attendance')}
          className={`px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'attendance'
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <CalendarCheck className="w-4 h-4" />
          Attendance & Daily Logs
        </button>
        <button
          onClick={() => setActiveTab('tasks')}
          className={`px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'tasks'
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ListTodo className="w-4 h-4" />
          Tasks & PR Progress ({tasks.length})
        </button>
        <button
          onClick={() => setActiveTab('evaluation')}
          className={`px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'evaluation'
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Award className="w-4 h-4" />
          Supervisor Evaluation ({evaluations.length})
        </button>
      </div>

      {/* Tab Content 1: Attendance */}
      {activeTab === 'attendance' && (
        <div className="space-y-8">
          {/* Attendance KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Overall Attendance</p>
                <p className="text-2xl font-bold text-slate-900">{attendance?.attendancePercentage || 95.5}%</p>
                <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">
                  {(attendance?.attendancePercentage || 95.5) >= 75 ? 'Above 75% Threshold' : 'At-Risk (< 75%)'}
                </p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                <CalendarCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Days Present</p>
                <p className="text-2xl font-bold text-slate-900">{attendance?.presentDays || 21} Days</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Out of {attendance?.totalWorkingDays || 22} Working Days</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Days Absent / Leave</p>
                <p className="text-2xl font-bold text-slate-900">{attendance?.absentDays || 1} Day</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Medical leave noted</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
                <FileCheck2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Academic Credits</p>
                <p className="text-2xl font-bold text-slate-900">8 Credits</p>
                <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">T&P Direct Verification</p>
              </div>
            </div>
          </div>

          {/* Attendance Log Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Daily Attendance History</h3>
                <p className="text-xs text-slate-500">Official log sent to company mentor and college T&P cell</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider">
                    <th className="py-3 px-4 rounded-l-xl">Date</th>
                    <th className="py-3 px-4">Internship & Company</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4">Check-in Notes & Sprint Activity</th>
                    <th className="py-3 px-4 text-right rounded-r-xl">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {attendance?.records && attendance.records.length > 0 ? (
                    attendance.records.map((rec) => (
                      <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{rec.date}</td>
                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-slate-800">{rec.internshipTitle}</p>
                          <p className="text-[11px] text-slate-500">{rec.companyName}</p>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`px-2.5 py-1 rounded-full font-bold text-[11px] inline-flex items-center gap-1 ${
                            rec.status === 'PRESENT' ? 'bg-emerald-100 text-emerald-800' :
                            rec.status === 'ABSENT' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {rec.status === 'PRESENT' ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                            {rec.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-700">{rec.notes || 'Daily sprint check-in'}</td>
                        <td className="py-3.5 px-4 text-right text-slate-400 font-mono text-[11px]">
                          {new Date(rec.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-slate-400">No attendance records logged yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content 2: Tasks */}
      {activeTab === 'tasks' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Internship Project Tasks & Deliverables</h3>
              <p className="text-xs text-slate-500">Track milestones assigned by your engineering lead or T&P supervisor</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tasks.map(task => (
              <div key={task.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between hover:border-indigo-200 transition-all">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                      task.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                      task.status === 'IN_PROGRESS' ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {task.status.replace('_', ' ')}
                    </span>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                      <Clock className="w-3 h-3" />
                      Due {new Date(task.deadline).toLocaleDateString()}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-900 text-sm mb-2">{task.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">{task.description}</p>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
                      <span>Progress</span>
                      <span>{task.progressPercentage || 0}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          (task.progressPercentage || 0) === 100 ? 'bg-emerald-500' : 'bg-indigo-600'
                        }`}
                        style={{ width: `${task.progressPercentage || 0}%` }}
                      ></div>
                    </div>
                  </div>

                  {task.submissionUrl && (
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 mb-4 text-xs">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Submission Link</span>
                      <a
                        href={task.submissionUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1 truncate"
                      >
                        <ExternalLink className="w-3 h-3 shrink-0" />
                        {task.submissionUrl}
                      </a>
                    </div>
                  )}

                  {task.feedback && (
                    <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-100 mb-4 text-xs">
                      <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block mb-0.5">Mentor Feedback</span>
                      <p className="text-emerald-900 font-medium italic">"{task.feedback}"</p>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <button
                    onClick={() => handleOpenTaskModal(task)}
                    className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold py-2 rounded-xl transition-colors flex items-center justify-center gap-1.5"
                  >
                    Update Progress & Submit PR
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Content 3: Company Evaluation */}
      {activeTab === 'evaluation' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Official Company Performance Evaluation</h3>
              <p className="text-xs text-slate-500">Evaluated across Technical, Attendance, Deliverables, and Professionalism</p>
            </div>
          </div>

          {evaluations.length > 0 ? (
            evaluations.map(evalItem => (
              <div key={evalItem.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 pb-6 mb-6 gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="bg-purple-100 text-purple-800 text-xs font-bold px-3 py-1 rounded-full">
                        Official Evaluation
                      </span>
                      <span className="text-xs text-slate-400">Evaluated on {new Date(evalItem.evaluatedAt).toLocaleDateString()}</span>
                    </div>
                    <h4 className="text-xl font-bold text-slate-900">{evalItem.companyName} - {evalItem.internshipTitle}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Evaluator: <span className="font-semibold text-slate-700">{evalItem.evaluatorName}</span> ({evalItem.evaluatorRole || 'Lead Engineering Mentor'})
                    </p>
                  </div>

                  <div className="flex items-center gap-4 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Overall Score</span>
                      <p className="text-2xl font-extrabold text-indigo-600">{evalItem.overallScore} / 100</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-extrabold text-xl shadow-md">
                      {evalItem.grade}
                    </div>
                  </div>
                </div>

                {/* 4 Pillars Breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                    <span className="text-xs font-semibold text-slate-500">1. Technical Proficiency</span>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xl font-bold text-slate-900">{evalItem.technicalScore}%</span>
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${evalItem.technicalScore}%` }}></div>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                    <span className="text-xs font-semibold text-slate-500">2. Attendance & Punctuality</span>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xl font-bold text-slate-900">{evalItem.attendanceScore}%</span>
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${evalItem.attendanceScore}%` }}></div>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                    <span className="text-xs font-semibold text-slate-500">3. Task Completion</span>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xl font-bold text-slate-900">{evalItem.taskCompletionScore}%</span>
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div className="bg-blue-500 h-full rounded-full" style={{ width: `${evalItem.taskCompletionScore}%` }}></div>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                    <span className="text-xs font-semibold text-slate-500">4. Professionalism</span>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xl font-bold text-slate-900">{evalItem.professionalismScore}%</span>
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div className="bg-purple-500 h-full rounded-full" style={{ width: `${evalItem.professionalismScore}%` }}></div>
                    </div>
                  </div>
                </div>

                {/* Feedback & Recommendations */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-5">
                    <h5 className="text-xs font-bold text-indigo-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      Supervisor Qualitative Feedback
                    </h5>
                    <p className="text-xs text-indigo-950 leading-relaxed italic">
                      "{evalItem.feedback}"
                    </p>
                  </div>

                  <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-5">
                    <h5 className="text-xs font-bold text-emerald-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-emerald-600" />
                      Pre-Placement & Credit Recommendation
                    </h5>
                    <p className="text-xs text-emerald-950 leading-relaxed font-semibold">
                      "{evalItem.recommendations}"
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
              <Award className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h4 className="font-bold text-slate-800 text-sm">No Evaluation Submitted Yet</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Your company supervisor will submit the formal 4-pillar evaluation at the mid-term and completion of your internship.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Task Update Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">{selectedTask.title}</h4>
                <p className="text-[11px] text-slate-500">Update completion progress and deliverable links</p>
              </div>
              <button
                onClick={() => setSelectedTask(null)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveTaskProgress} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Progress Percentage ({taskProgress}%)
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={taskProgress}
                  onChange={e => setTaskProgress(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>0% (Todo)</span>
                  <span>50% (In Progress)</span>
                  <span>100% (Completed)</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Submission / Pull Request URL (GitHub, GitLab, Figma, etc.)
                </label>
                <input
                  type="url"
                  placeholder="https://github.com/myorg/project/pull/42"
                  value={taskSubmissionUrl}
                  onChange={e => setTaskSubmissionUrl(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Submission Notes & Deliverables Summary
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe your implementation, unit tests, and key milestones accomplished..."
                  value={taskSubmissionNotes}
                  onChange={e => setTaskSubmissionNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setSelectedTask(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingTask}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md transition-all disabled:opacity-50"
                >
                  {updatingTask ? 'Saving...' : 'Submit Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
