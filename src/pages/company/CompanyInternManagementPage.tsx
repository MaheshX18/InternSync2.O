import React, { useEffect, useState } from 'react';
import { getCompanyApplications } from '../../api/applications';
import { getCompanyTasks, createInternshipTask } from '../../api/tasks';
import { getCompanyAttendanceLogs } from '../../api/attendance';
import { getCompanyEvaluations, submitInternshipEvaluation } from '../../api/evaluations';
import {
  Application,
  InternshipTask,
  InternshipAttendance,
  InternshipEvaluation,
  CreateTaskPayload,
  CreateEvaluationPayload
} from '../../types';
import {
  Users,
  CheckCircle2,
  Calendar,
  Clock,
  Award,
  FileText,
  PlusCircle,
  AlertCircle,
  Sparkles,
  TrendingUp,
  Star,
  ChevronRight,
  ShieldCheck,
  Building2
} from 'lucide-react';

export const CompanyInternManagementPage: React.FC = () => {
  const [interns, setInterns] = useState<Application[]>([]);
  const [tasks, setTasks] = useState<InternshipTask[]>([]);
  const [attendance, setAttendance] = useState<InternshipAttendance[]>([]);
  const [evaluations, setEvaluations] = useState<InternshipEvaluation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Tabs: interns | tasks | attendance | evaluations
  const [activeTab, setActiveTab] = useState<'interns' | 'tasks' | 'attendance' | 'evaluations'>('interns');

  // Task creation modal state
  const [taskModalOpen, setTaskModalOpen] = useState<boolean>(false);
  const [taskStudentId, setTaskStudentId] = useState<string>('');
  const [taskTitle, setTaskTitle] = useState<string>('');
  const [taskDesc, setTaskDesc] = useState<string>('');
  const [taskDue, setTaskDue] = useState<string>('');
  const [taskPriority, setTaskPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [taskSubmitting, setTaskSubmitting] = useState<boolean>(false);

  // Evaluation modal state
  const [evalModalOpen, setEvalModalOpen] = useState<boolean>(false);
  const [evalStudentId, setEvalStudentId] = useState<string>('');
  const [evalTech, setEvalTech] = useState<number>(85);
  const [evalAtt, setEvalAtt] = useState<number>(90);
  const [evalTask, setEvalTask] = useState<number>(88);
  const [evalProf, setEvalProf] = useState<number>(92);
  const [evalFeedback, setEvalFeedback] = useState<string>('');
  const [evalRec, setEvalRec] = useState<string>('Recommended for full-time placement & graduation credit.');
  const [evalSubmitting, setEvalSubmitting] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [appsRes, tasksData, attData, evalsData] = await Promise.all([
        getCompanyApplications({ status: 'ACCEPTED' }),
        getCompanyTasks(),
        getCompanyAttendanceLogs(),
        getCompanyEvaluations(),
      ]);

      setInterns(appsRes.content || []);
      setTasks(tasksData || []);
      setAttendance(attData || []);
      setEvaluations(evalsData || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load intern management data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskStudentId || !taskTitle.trim() || !taskDue) {
      setError('Please fill in all required task fields.');
      return;
    }

    try {
      setTaskSubmitting(true);
      setError(null);
      const payload: CreateTaskPayload = {
        internshipId: 'int_001',
        studentId: taskStudentId,
        title: taskTitle.trim(),
        description: taskDesc.trim(),
        dueDate: taskDue,
        priority: taskPriority,
      };

      await createInternshipTask(payload);
      setSuccessMsg('New task assigned to intern successfully!');
      setTaskModalOpen(false);
      setTaskTitle('');
      setTaskDesc('');
      setTaskDue('');
      await fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create task.');
    } finally {
      setTaskSubmitting(false);
    }
  };

  const handleSubmitEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evalStudentId) {
      setError('Please select a student intern for evaluation.');
      return;
    }

    try {
      setEvalSubmitting(true);
      setError(null);
      const payload: CreateEvaluationPayload = {
        internshipId: 'int_001',
        studentId: evalStudentId,
        technicalScore: Number(evalTech),
        attendanceScore: Number(evalAtt),
        taskCompletionScore: Number(evalTask),
        professionalismScore: Number(evalProf),
        feedback: evalFeedback.trim() || 'Demonstrated outstanding technical proficiency and proactive teamwork.',
        recommendations: evalRec.trim(),
      };

      await submitInternshipEvaluation(payload);
      setSuccessMsg('Intern performance evaluation submitted successfully to T&P and student!');
      setEvalModalOpen(false);
      setEvalFeedback('');
      await fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit evaluation.');
    } finally {
      setEvalSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-semibold uppercase tracking-wider">
            <Building2 className="w-3.5 h-3.5" /> Employer Workspace
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Intern Cohort Management & Performance Evaluation
          </h1>
          <p className="text-xs sm:text-sm text-indigo-200 max-w-2xl leading-relaxed">
            Assign project milestones, review daily intern check-ins, and submit verified 4-pillar performance evaluations to the University T&P Cell.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => {
              if (interns.length > 0) setTaskStudentId(interns[0].studentId);
              setTaskModalOpen(true);
            }}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" /> Assign Task
          </button>
          <button
            onClick={() => {
              if (interns.length > 0) setEvalStudentId(interns[0].studentId);
              setEvalModalOpen(true);
            }}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
          >
            <Award className="w-4 h-4" /> Submit Evaluation
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {[
          { id: 'interns', label: `Active Interns (${interns.length})`, icon: Users },
          { id: 'tasks', label: `Assigned Tasks (${tasks.length})`, icon: FileText },
          { id: 'attendance', label: `Attendance Log (${attendance.length})`, icon: Calendar },
          { id: 'evaluations', label: `Evaluations (${evaluations.length})`, icon: Award },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Active Interns */}
      {activeTab === 'interns' && (
        <div className="grid gap-4">
          {interns.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-2">
              <Users className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-900">No Accepted Interns Yet</h3>
              <p className="text-xs text-slate-500">
                Review applicant submissions and accept candidates to manage them here.
              </p>
            </div>
          ) : (
            interns.map(intern => (
              <div
                key={intern.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-extrabold text-base shrink-0">
                    {intern.studentName?.[0] || 'S'}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{intern.studentName}</h3>
                    <p className="text-xs text-slate-500">
                      {intern.internshipTitle} • {intern.studentEmail}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setTaskStudentId(intern.studentId);
                      setTaskModalOpen(true);
                    }}
                    className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl transition-all"
                  >
                    + Assign Task
                  </button>
                  <button
                    onClick={() => {
                      setEvalStudentId(intern.studentId);
                      setEvalModalOpen(true);
                    }}
                    className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs rounded-xl transition-all"
                  >
                    ★ Submit Evaluation
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Assigned Tasks */}
      {activeTab === 'tasks' && (
        <div className="grid gap-4">
          {tasks.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-2">
              <FileText className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-900">No Tasks Assigned</h3>
              <p className="text-xs text-slate-500">Create project deliverables and assign deadlines to your interns.</p>
            </div>
          ) : (
            tasks.map(t => (
              <div key={t.id} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-extrabold text-slate-900">{t.title}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                      t.priority === 'HIGH' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {t.priority}
                    </span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    t.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : 'bg-indigo-100 text-indigo-800'
                  }`}>
                    {t.status} ({t.progress}%)
                  </span>
                </div>
                <p className="text-xs text-slate-600">{t.description}</p>
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                  <span>Assigned to: <strong>{t.studentName || t.studentId}</strong></span>
                  <span>Due Date: <strong>{t.dueDate}</strong></span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 3: Attendance Logs */}
      {activeTab === 'attendance' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900">Daily Intern Check-In Logs</h2>
          {attendance.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-6 text-center">No attendance check-ins recorded yet.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {attendance.map(a => (
                <div key={a.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900">{a.studentName || 'Student Intern'}</span>
                    <span className="text-slate-400 ml-2">Date: {a.date} ({a.checkInTime ? new Date(a.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '09:00 AM'})</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase">
                    {a.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Evaluations */}
      {activeTab === 'evaluations' && (
        <div className="grid gap-4">
          {evaluations.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-2">
              <Award className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-900">No Evaluations Submitted</h3>
              <p className="text-xs text-slate-500">Submit 4-pillar performance evaluations to officially rate your interns.</p>
            </div>
          ) : (
            evaluations.map(ev => (
              <div key={ev.id} className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{ev.studentName}</h3>
                    <p className="text-xs text-slate-500">Evaluated on {new Date(ev.evaluatedAt).toLocaleDateString()}</p>
                  </div>
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-black text-sm rounded-xl">
                    Grade: {ev.grade} ({ev.overallScore}%)
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Technical</span>
                    <span className="text-sm font-extrabold text-indigo-600">{ev.technicalScore}%</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Attendance</span>
                    <span className="text-sm font-extrabold text-emerald-600">{ev.attendanceScore}%</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Tasks</span>
                    <span className="text-sm font-extrabold text-purple-600">{ev.taskCompletionScore}%</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Professionalism</span>
                    <span className="text-sm font-extrabold text-amber-600">{ev.professionalismScore}%</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
                  <p className="text-slate-700 italic">"{ev.feedback}"</p>
                  <p className="text-indigo-600 font-semibold">{ev.recommendations}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Task Creation Modal */}
      {taskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Assign Milestone / Task</h3>
            <form onSubmit={handleCreateTask} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">Select Intern</label>
                <select
                  value={taskStudentId}
                  onChange={e => setTaskStudentId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                >
                  <option value="">-- Choose Intern --</option>
                  {interns.map(i => (
                    <option key={i.studentId} value={i.studentId}>{i.studentName} ({i.internshipTitle})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">Task Title</label>
                <input
                  type="text"
                  value={taskTitle}
                  onChange={e => setTaskTitle(e.target.value)}
                  placeholder="e.g. Implement OAuth Auth Middleware"
                  className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">Description / Deliverables</label>
                <textarea
                  rows={3}
                  value={taskDesc}
                  onChange={e => setTaskDesc(e.target.value)}
                  placeholder="Detail the expected technical outcome and repo deliverables..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">Due Date</label>
                  <input
                    type="date"
                    value={taskDue}
                    onChange={e => setTaskDue(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">Priority</label>
                  <select
                    value={taskPriority}
                    onChange={e => setTaskPriority(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="LOW">Low Priority</option>
                    <option value="MEDIUM">Medium Priority</option>
                    <option value="HIGH">High Priority</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setTaskModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={taskSubmitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm disabled:opacity-50"
                >
                  {taskSubmitting ? 'Assigning...' : 'Assign Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4-Pillar Evaluation Modal */}
      {evalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-4 max-h-[90vh] overflow-y-auto">
            <div>
              <span className="px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800">
                Official 4-Pillar Evaluation
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-2">Submit Performance Evaluation</h3>
            </div>

            <form onSubmit={handleSubmitEvaluation} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">Select Intern</label>
                <select
                  value={evalStudentId}
                  onChange={e => setEvalStudentId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                >
                  <option value="">-- Choose Intern --</option>
                  {interns.map(i => (
                    <option key={i.studentId} value={i.studentId}>{i.studentName} ({i.internshipTitle})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Technical Score (0-100)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={evalTech}
                    onChange={e => setEvalTech(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Attendance Score (0-100)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={evalAtt}
                    onChange={e => setEvalAtt(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Task Completion (0-100)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={evalTask}
                    onChange={e => setEvalTask(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Professionalism (0-100)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={evalProf}
                    onChange={e => setEvalProf(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">Supervisor Feedback</label>
                <textarea
                  rows={2}
                  value={evalFeedback}
                  onChange={e => setEvalFeedback(e.target.value)}
                  placeholder="Qualitative remarks on performance, work ethic, and achievements..."
                  className="w-full px-3.5 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">Recommendation</label>
                <input
                  type="text"
                  value={evalRec}
                  onChange={e => setEvalRec(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEvalModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={evalSubmitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm disabled:opacity-50"
                >
                  {evalSubmitting ? 'Submitting...' : 'Submit Evaluation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyInternManagementPage;
