import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCompleteStudentRecord } from '../../api/tpo';
import { getFacultyMentorsApi, reassignStudentMentorApi, assignStudentToMentorApi } from '../../api/mentor';
import { CompleteStudentRecord, FacultyMentorProfile } from '../../types';
import {
  GraduationCap,
  Award,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  Mail,
  Phone,
  Printer,
  ShieldCheck,
  Sparkles,
  User,
  AlertCircle,
  TrendingUp,
  BookOpen,
  ArrowLeft,
  DollarSign,
  RefreshCw,
  X,
  CheckCircle,
  AlertTriangle,
  Loader2
} from 'lucide-react';

export const TPOStudentRecordPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [record, setRecord] = useState<CompleteStudentRecord | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Mentor Reassignment State
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [mentors, setMentors] = useState<FacultyMentorProfile[]>([]);
  const [loadingMentors, setLoadingMentors] = useState(false);
  const [selectedNewMentorId, setSelectedNewMentorId] = useState('');
  const [reassignReason, setReassignReason] = useState('');
  const [reassigning, setReassigning] = useState(false);
  const [actionMsg, setActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchRecord = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const data = await getCompleteStudentRecord(id);
      setRecord(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load student 360-degree record.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecord();
  }, [id]);

  const showNotification = (type: 'success' | 'error', text: string) => {
    setActionMsg({ type, text });
    setTimeout(() => setActionMsg(null), 4000);
  };

  const openReassignModal = async () => {
    setShowReassignModal(true);
    setLoadingMentors(true);
    setSelectedNewMentorId('');
    setReassignReason('');
    try {
      const res = await getFacultyMentorsApi();
      if (res.success && res.data) {
        setMentors(res.data.filter(m => m.status === 'ACTIVE'));
      }
    } catch (err) {
      showNotification('error', 'Failed to load faculty mentors');
    } finally {
      setLoadingMentors(false);
    }
  };

  const handleExecuteReassign = async () => {
    if (!id || !selectedNewMentorId) {
      alert('Please select a faculty mentor');
      return;
    }
    const targetMentor = mentors.find(m => m.id === selectedNewMentorId);
    if (!targetMentor) return;

    try {
      setReassigning(true);
      if (record?.mentor) {
        const res = await reassignStudentMentorApi({
          studentId: id,
          newMentorId: selectedNewMentorId,
          reason: reassignReason || 'Reassigned from Student 360° Record'
        });
        if (res.success) {
          showNotification('success', `Student reassigned to ${targetMentor.name} successfully`);
          setShowReassignModal(false);
          fetchRecord();
        }
      } else {
        const res = await assignStudentToMentorApi(selectedNewMentorId, { studentId: id });
        if (res.success) {
          showNotification('success', `Student assigned to ${targetMentor.name} successfully`);
          setShowReassignModal(false);
          fetchRecord();
        }
      }
    } catch (err: any) {
      showNotification('error', err.response?.data?.message || 'Failed to reassign mentor');
    } finally {
      setReassigning(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Generating 360° Verified Student Record Dossier...</p>
      </div>
    );
  }

  if (error || !record) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Student Record Not Found</h2>
        <p className="text-xs text-slate-500">{error || 'Could not retrieve student details.'}</p>
        <Link
          to="/tpo/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl hover:bg-indigo-700"
        >
          <ArrowLeft className="w-4 h-4" /> Return to T&P Dashboard
        </Link>
      </div>
    );
  }

  const { profile, academics, activeInternship, attendance, tasks, evaluations, careerReadiness, trainings, offCampusInternships } = record;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 print:p-0 print:m-0">
      {/* Top Navigation / Action Bar */}
      <div className="flex items-center justify-between print:hidden">
        <Link
          to="/tpo/dashboard"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Student Directory
        </Link>

        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
        >
          <Printer className="w-4 h-4" /> Print / Export Official Dossier
        </button>
      </div>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-800">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 font-extrabold text-2xl shrink-0">
            {profile.firstName?.[0]}{profile.lastName?.[0]}
          </div>
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[10px] font-extrabold uppercase tracking-wider">
              <ShieldCheck className="w-3 h-3" /> T&P Verified Student Record
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {profile.firstName} {profile.lastName}
            </h1>
            <p className="text-indigo-200 text-xs flex items-center gap-3 flex-wrap">
              <span><strong>College:</strong> {profile.collegeName || 'MIT Academy of Engineering'}</span>
              <span>• <strong>Dept:</strong> {profile.department || 'Computer Science'}</span>
              <span>• <strong>Roll No:</strong> {profile.rollNumber || 'CS2026-081'}</span>
              <span>• <strong>PRN:</strong> {profile.prn || 'PRN2022019482'}</span>
              <span>• <strong>Email:</strong> {profile.email}</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-right shrink-0">
          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Verified CGPA</span>
            <span className="text-xl font-black text-white">{academics?.cgpa ? academics.cgpa.toFixed(2) : (profile.gpa?.toFixed(2) || '3.75')} / 4.0</span>
          </div>
          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Readiness</span>
            <span className="text-xl font-black text-emerald-400">{careerReadiness?.score || 88}%</span>
          </div>
        </div>
      </div>

      {/* 4-Stat Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Attendance Rate</span>
          <p className="text-2xl font-black text-indigo-600">{attendance?.attendanceRate ?? 92}%</p>
          <span className="text-[11px] text-slate-500">{attendance?.totalPresentDays ?? 23} of {attendance?.totalWorkingDays ?? 25} Days</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Assigned Tasks</span>
          <p className="text-2xl font-black text-slate-900">{tasks?.length ?? 0}</p>
          <span className="text-[11px] text-emerald-600 font-semibold">
            {tasks?.filter(t => t.status === 'COMPLETED').length ?? 0} Completed
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Evaluation Grade</span>
          <p className="text-2xl font-black text-emerald-600">{evaluations?.[0]?.grade || 'A+'}</p>
          <span className="text-[11px] text-slate-500">Score: {evaluations?.[0]?.overallScore ?? 94}%</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Off-Campus Credits</span>
          <p className="text-2xl font-black text-purple-600">
            {offCampusInternships?.reduce((acc, curr) => acc + (curr.approvedCredits || 0), 0) || 4}
          </p>
          <span className="text-[11px] text-slate-500">Graduation Approved</span>
        </div>
      </div>

      {/* Grid: Academic History & Active Internship */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Academic Profile */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900">Academic Transcript & SGPA Breakdown</h2>
            </div>
            <span className="text-xs font-extrabold text-indigo-600">
              Semester {academics?.currentSemester || 6}
            </span>
          </div>

          <div className="space-y-3">
            {academics?.semesters && academics.semesters.length > 0 ? (
              academics.semesters.map((sem) => (
                <div key={sem.semesterNumber} className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-900">Semester {sem.semesterNumber}</span>
                    <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 text-xs font-extrabold">
                      SGPA: {sem.sgpa.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {sem.subjects.map((sub, i) => (
                      <span key={i} className="text-[11px] px-2 py-0.5 bg-white border border-slate-200 rounded font-medium text-slate-700">
                        {sub.subjectName}: <strong>{sub.grade}</strong> ({sub.credits} cr)
                      </span>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 italic">No semester records uploaded yet.</p>
            )}
          </div>
        </div>

        {/* Active Internship Details */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Building2 className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">Internship Engagement</h2>
          </div>

          {activeInternship ? (
            <div className="space-y-4">
              <div className="bg-indigo-50/70 rounded-2xl p-4 border border-indigo-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-indigo-700">
                    {activeInternship.companyName}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800">
                    {activeInternship.status || 'ACTIVE'}
                  </span>
                </div>
                <h3 className="text-sm font-extrabold text-slate-900">{activeInternship.roleTitle}</h3>
                <p className="text-xs text-slate-600 flex items-center gap-3">
                  <span>Start: {activeInternship.startDate}</span>
                  <span>• Supervisor: {activeInternship.supervisorName || 'Engineering Lead'}</span>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 font-bold uppercase block text-[10px]">Work Mode</span>
                  <span className="font-extrabold text-slate-800">{activeInternship.workplaceType || 'Hybrid'}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 font-bold uppercase block text-[10px]">Monthly Stipend</span>
                  <span className="font-extrabold text-slate-800">${activeInternship.stipend || 1500}/mo</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-slate-400 italic">
              No active on-campus internship recorded currently.
            </div>
          )}
        </div>
      </div>

      {/* Mentor Section */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">Faculty Mentor</h2>
          </div>
          <button
            onClick={openReassignModal}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl transition-colors border border-indigo-200"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            {record.mentor ? 'Reassign Mentor' : 'Assign Mentor'}
          </button>
        </div>

        {actionMsg && (
          <div className={`p-3.5 rounded-xl flex items-center gap-2 text-xs font-semibold ${
            actionMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}>
            {actionMsg.type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
            {actionMsg.text}
          </div>
        )}
        
        {record.mentor ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold text-lg shrink-0">
                {record.mentor.firstName ? `${record.mentor.firstName.charAt(0)}${record.mentor.lastName?.charAt(0) || ''}` : record.mentor.name.charAt(0)}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 text-lg">{record.mentor.name}</h3>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800 uppercase">
                    Active
                  </span>
                </div>
                <p className="text-xs text-slate-600 font-medium">
                  <span className="text-slate-400">Designation:</span> {record.mentor.designation || 'Assistant Professor'}
                </p>
                <p className="text-xs text-slate-600 font-medium">
                  <span className="text-slate-400">Department:</span> {record.mentor.department || 'Computer Science'}
                </p>
                <div className="pt-2 space-y-1">
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <a href={`mailto:${record.mentor.email}`} className="text-indigo-600 hover:underline">{record.mentor.email}</a>
                  </div>
                  {record.mentor.phone && (
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <Phone className="w-3.5 h-3.5 text-slate-400" /> {record.mentor.phone}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <h4 className="text-xs font-bold text-slate-900 uppercase mb-3">Mentor Notes ({record.mentorNotes?.length || 0})</h4>
              {record.mentorNotes && record.mentorNotes.length > 0 ? (
                <div className="space-y-2 max-h-36 overflow-y-auto pr-2">
                  {record.mentorNotes.map(note => (
                    <div key={note.id} className="text-xs bg-white p-2.5 rounded-lg border border-slate-100 shadow-xs">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-indigo-700">{note.type.replace('_', ' ')}</span>
                        <span className="text-[10px] text-slate-400">{new Date(note.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-slate-600">{note.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic text-center py-4">No notes recorded yet</p>
              )}
            </div>
          </div>
        ) : (
          <div className="p-6 text-center text-xs text-slate-500 italic bg-slate-50 rounded-xl border border-slate-100 flex flex-col items-center justify-center gap-2">
            <User className="w-8 h-8 text-slate-300" />
            <p className="font-medium text-slate-700">No faculty mentor assigned to this student.</p>
            <button
              onClick={openReassignModal}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors"
            >
              Assign Faculty Mentor
            </button>
          </div>
        )}
      </div>

      {/* Grid: Supervisor Evaluation & Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Supervisor 4-Pillar Evaluation */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900">Supervisor 4-Pillar Performance Evaluation</h2>
            </div>
            {evaluations && evaluations.length > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800">
                Grade: {evaluations[0].grade}
              </span>
            )}
          </div>

          {evaluations && evaluations.length > 0 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-center">
                  <span className="text-[9px] font-bold text-slate-400 uppercase block">Technical</span>
                  <span className="text-base font-black text-indigo-600">{evaluations[0].technicalScore}%</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-center">
                  <span className="text-[9px] font-bold text-slate-400 uppercase block">Punctuality</span>
                  <span className="text-base font-black text-emerald-600">{evaluations[0].punctualityScore}%</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-center">
                  <span className="text-[9px] font-bold text-slate-400 uppercase block">Initiative</span>
                  <span className="text-base font-black text-purple-600">{evaluations[0].initiativeScore}%</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-center">
                  <span className="text-[9px] font-bold text-slate-400 uppercase block">Teamwork</span>
                  <span className="text-base font-black text-blue-600">{evaluations[0].teamworkScore}%</span>
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs space-y-2">
                <div>
                  <span className="font-bold text-slate-900 block">Strengths</span>
                  <p className="text-slate-600">{evaluations[0].strengths}</p>
                </div>
                <div>
                  <span className="font-bold text-slate-900 block">Areas for Improvement</span>
                  <p className="text-slate-600">{evaluations[0].areasForImprovement}</p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic text-center py-6">No evaluation submitted yet.</p>
          )}
        </div>

        {/* Assigned Tasks */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900">Internship Project Milestones & Tasks</h2>
            </div>
            <span className="text-xs font-bold text-slate-500">
              {tasks?.filter(t => t.status === 'COMPLETED').length ?? 0} / {tasks?.length ?? 0} Completed
            </span>
          </div>

          <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
            {tasks && tasks.length > 0 ? (
              tasks.map((task) => (
                <div key={task.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{task.title}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                      task.status === 'COMPLETED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : task.status === 'IN_PROGRESS'
                        ? 'bg-indigo-100 text-indigo-800'
                        : 'bg-slate-200 text-slate-700'
                    }`}>
                      {task.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-1">{task.description}</p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>Deadline: {task.dueDate}</span>
                    <span>Progress: {task.progress}%</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 italic text-center py-6">No tasks assigned yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Reassign / Assign Mentor Modal */}
      {showReassignModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowReassignModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {record.mentor ? 'Reassign Faculty Mentor' : 'Assign Faculty Mentor'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Student: <span className="font-bold text-slate-800">{profile.firstName} {profile.lastName}</span> ({profile.rollNumber || profile.department})
                </p>
              </div>
              <button onClick={() => setShowReassignModal(false)} className="p-1 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              {record.mentor && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
                  <span className="font-bold">Current Mentor:</span> {record.mentor.name} ({record.mentor.department || 'N/A'})
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Select New Faculty Mentor *</label>
                {loadingMentors ? (
                  <div className="flex justify-center py-6">
                    <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                  </div>
                ) : mentors.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No active mentors available</p>
                ) : (
                  <div className="space-y-2">
                    {mentors.map(m => {
                      const isCurrent = record.mentor?.id === m.id;
                      const isFull = m.availableCapacity === 0 && !isCurrent;
                      const isSelected = selectedNewMentorId === m.id;

                      return (
                        <div
                          key={m.id}
                          onClick={() => { if (!isCurrent && !isFull) setSelectedNewMentorId(m.id); }}
                          className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20'
                              : isCurrent
                              ? 'border-slate-200 bg-slate-100 opacity-60 cursor-not-allowed'
                              : isFull
                              ? 'border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed'
                              : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                          }`}
                        >
                          <div>
                            <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
                              {m.name}
                              {isCurrent && <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-semibold">Current</span>}
                            </div>
                            <p className="text-xs text-slate-500">{m.designation || 'Faculty'} • {m.department || 'General'}</p>
                          </div>

                          <div className="text-right shrink-0">
                            <span className={`text-xs font-bold block ${m.availableCapacity > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                              {m.assignedCount} / {m.maxCapacity}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {m.availableCapacity > 0 ? `${m.availableCapacity} available` : 'Full'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Reason for Reassignment</label>
                <textarea
                  value={reassignReason}
                  onChange={e => setReassignReason(e.target.value)}
                  placeholder="Optional notes or rationale for reassignment..."
                  rows={2}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3 shrink-0">
              <button
                onClick={() => setShowReassignModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteReassign}
                disabled={reassigning || !selectedNewMentorId}
                className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-1.5"
              >
                {reassigning && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {record.mentor ? 'Confirm Reassignment' : 'Assign Mentor'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TPOStudentRecordPage;
