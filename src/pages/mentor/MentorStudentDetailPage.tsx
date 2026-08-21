import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  getFacultyMenteeDetailApi,
  createMentorNoteApi,
  createMentorReviewApi,
  createMentorActionItemApi,
  updateMentorActionItemApi,
  deleteMentorActionItemApi
} from '../../api/mentor';
import { FacultyMenteeDetail, MentorNote, MentorReview, MentorActionItem, MentoringTimelineEvent } from '../../types';
import {
  ArrowLeft,
  Loader2,
  Mail,
  Phone,
  GraduationCap,
  Building,
  Briefcase,
  FileText,
  AlertTriangle,
  Plus,
  Star,
  ClipboardList,
  MessageSquare,
  CheckCircle2,
  Clock,
  XCircle,
  ShieldAlert,
  Calendar,
  Layers,
  CheckSquare,
  ListOrdered,
  Sparkles,
  Trash2,
  Check,
  History
} from 'lucide-react';

export const MentorStudentDetailPage: React.FC = () => {
  const { id, studentId } = useParams<{ id?: string; studentId?: string }>();
  const effectiveId = id || studentId || '';
  const [data, setData] = useState<FacultyMenteeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'notes' | 'action-items' | 'reviews' | 'timeline'>('overview');

  // Note form state
  const [noteType, setNoteType] = useState<string>('NOTE');
  const [noteContent, setNoteContent] = useState('');
  const [addingNote, setAddingNote] = useState(false);

  // Review form state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    feedback: '',
    strengths: '',
    concerns: '',
    actionItems: ''
  });
  const [submittingReview, setSubmittingReview] = useState(false);

  // Action item form state
  const [showActionItemForm, setShowActionItemForm] = useState(false);
  const [actionItemForm, setActionItemForm] = useState({
    title: '',
    description: '',
    dueDate: ''
  });
  const [creatingActionItem, setCreatingActionItem] = useState(false);

  useEffect(() => {
    if (effectiveId) loadData(effectiveId);
  }, [effectiveId]);

  const loadData = async (targetStudentId: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await getFacultyMenteeDetailApi(targetStudentId);
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load student details or unauthorized.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!effectiveId || !noteContent.trim()) return;
    try {
      setAddingNote(true);
      await createMentorNoteApi(effectiveId, { type: noteType, content: noteContent });
      setNoteContent('');
      await loadData(effectiveId);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add note');
    } finally {
      setAddingNote(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!effectiveId) return;
    try {
      setSubmittingReview(true);
      await createMentorReviewApi(effectiveId, reviewForm);
      setShowReviewForm(false);
      setReviewForm({ rating: 5, feedback: '', strengths: '', concerns: '', actionItems: '' });
      await loadData(effectiveId);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleCreateActionItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!effectiveId || !actionItemForm.title.trim()) return;
    try {
      setCreatingActionItem(true);
      await createMentorActionItemApi(effectiveId, actionItemForm);
      setShowActionItemForm(false);
      setActionItemForm({ title: '', description: '', dueDate: '' });
      await loadData(effectiveId);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create action item');
    } finally {
      setCreatingActionItem(false);
    }
  };

  const handleToggleActionItemStatus = async (item: MentorActionItem) => {
    const nextStatus = item.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    try {
      await updateMentorActionItemApi(item.id, { status: nextStatus });
      if (effectiveId) loadData(effectiveId);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update action item');
    }
  };

  const handleDeleteActionItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this action item?')) return;
    try {
      await deleteMentorActionItemApi(itemId);
      if (effectiveId) loadData(effectiveId);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete action item');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <p className="text-sm text-slate-500 font-medium">Loading Student 360° Profile...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-3xl mx-auto p-8 m-6 bg-rose-50 border border-rose-200 rounded-3xl text-center space-y-3">
        <ShieldAlert className="w-10 h-10 text-rose-600 mx-auto" />
        <h3 className="text-lg font-bold text-rose-900">Access Denied or Not Found</h3>
        <p className="text-xs text-rose-700 max-w-md mx-auto">{error || 'This student profile could not be loaded.'}</p>
        <div className="pt-3">
          <Link
            to="/mentor/mentees"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Back to My Mentees
          </Link>
        </div>
      </div>
    );
  }

  const noteTypeColors: Record<string, { bg: string; text: string; border: string }> = {
    NOTE: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    GUIDANCE: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
    CONCERN: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' },
    ACTION_ITEM: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' }
  };

  const attPercent = data.attendance?.attendancePercentage ?? 0;
  const academics = data.academics;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Top Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/mentor/mentees"
            className="p-2.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-2xl transition-colors text-slate-600 shadow-xs"
            title="Back to Mentees"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{data.name}</h1>
              <span className={`px-3 py-0.5 text-xs font-black uppercase rounded-full tracking-wider ${
                data.riskLevel === 'HIGH' ? 'bg-rose-100 text-rose-700 border border-rose-200' :
                data.riskLevel === 'MEDIUM' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                'bg-emerald-100 text-emerald-700 border border-emerald-200'
              }`}>
                {data.riskLevel} Risk
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5 flex flex-wrap items-center gap-2">
              <span className="font-mono text-slate-700 font-bold">{data.rollNumber || 'No Roll No'}</span>
              <span>•</span>
              <span>{data.department || 'General'}</span>
              <span>•</span>
              <span>Batch {data.batch || '2024-2028'}</span>
              {data.assignedAt && (
                <>
                  <span>•</span>
                  <span className="text-indigo-600">Assigned: {new Date(data.assignedAt).toLocaleDateString()}</span>
                </>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('notes')}
            className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl transition-all border border-indigo-200 flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Add Note
          </button>
          <button
            onClick={() => {
              setActiveTab('reviews');
              setShowReviewForm(true);
            }}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-indigo-200 flex items-center gap-1.5"
          >
            <Star className="w-3.5 h-3.5" /> Give Review
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl w-fit overflow-x-auto max-w-full">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'overview' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="w-3.5 h-3.5" /> 360° Overview
        </button>
        <button
          onClick={() => setActiveTab('notes')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'notes' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" /> Mentoring Notes ({data.mentorNotes?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('action-items')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'action-items' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <CheckSquare className="w-3.5 h-3.5" /> Action Items ({data.actionItems?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('reviews')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'reviews' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Star className="w-3.5 h-3.5" /> Reviews & Feedback ({data.mentorReviews?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('timeline')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'timeline' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <History className="w-3.5 h-3.5" /> Mentoring History
        </button>
      </div>

      {/* TAB 1: 360° OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (Student Meta & Academics & Attendance) */}
          <div className="space-y-6">
            {/* Student Info Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">Student Profile</h3>
              <div className="space-y-3 text-xs">
                <div className="flex items-center gap-3 text-slate-700">
                  <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <span className="font-semibold truncate">{data.email}</span>
                </div>
                {data.phone && (
                  <div className="flex items-center gap-3 text-slate-700">
                    <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                      <Phone className="w-4 h-4" />
                    </div>
                    <span className="font-semibold">{data.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-slate-700">
                  <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <span className="font-semibold">{data.department || 'N/A'} • {data.batch || 'Batch 2026'}</span>
                </div>
              </div>

              {data.skills && data.skills.length > 0 && (
                <div className="pt-3 border-t border-slate-100">
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase mb-2">Technical Skills</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {data.skills.map(s => (
                      <span key={s} className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Academic Performance */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">Academic Performance</h3>
                <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                  CGPA: {data.cgpa ? Number(data.cgpa).toFixed(2) : 'N/A'}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-3 bg-slate-50 rounded-2xl">
                  <span className="text-lg font-black text-slate-900 block">{data.cgpa ? Number(data.cgpa).toFixed(2) : 'N/A'}</span>
                  <span className="text-[10px] font-bold uppercase text-slate-400">Overall CGPA</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl">
                  <span className="text-lg font-black text-slate-900 block">{data.currentSemester || 'Sem 4'}</span>
                  <span className="text-[10px] font-bold uppercase text-slate-400">Current Sem</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl">
                  <span className={`text-lg font-black block ${data.backlogsCount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {data.backlogsCount || 0}
                  </span>
                  <span className="text-[10px] font-bold uppercase text-slate-400">Backlogs</span>
                </div>
              </div>

              {/* Semester SGPA Breakdown if available */}
              {academics?.semesters && academics.semesters.length > 0 && (
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <h4 className="text-[11px] font-bold text-slate-500 uppercase">Semester Breakdown</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {academics.semesters.map((sem, idx) => (
                      <div key={idx} className="p-2 bg-slate-50 rounded-xl flex items-center justify-between">
                        <span className="font-semibold text-slate-600">Sem {sem.semesterNumber}</span>
                        <span className="font-black text-slate-900">{sem.sgpa?.toFixed(2) || 'N/A'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Attendance Section */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">Attendance Rate</h3>
                <span className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
                  attPercent >= 75 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}>
                  {attPercent}% Overall
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${attPercent >= 75 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                  style={{ width: `${Math.min(100, attPercent)}%` }}
                />
              </div>

              {attPercent < 75 && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-center gap-2 font-medium">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>⚠ Attendance is below 75% threshold. Mentoring intervention required.</span>
                </div>
              )}

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2.5 bg-slate-50 rounded-xl">
                  <span className="text-sm font-bold text-slate-900 block">{data.attendance.totalDays}</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Working Days</span>
                </div>
                <div className="p-2.5 bg-emerald-50 rounded-xl">
                  <span className="text-sm font-bold text-emerald-700 block">{data.attendance.presentDays}</span>
                  <span className="text-[10px] text-emerald-600 font-bold uppercase">Present</span>
                </div>
                <div className="p-2.5 bg-rose-50 rounded-xl">
                  <span className="text-sm font-bold text-rose-700 block">{data.attendance.absentDays}</span>
                  <span className="text-[10px] text-rose-600 font-bold uppercase">Absent</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Internship, Logbooks, Documents, Risk Reasons */}
          <div className="lg:col-span-2 space-y-6">
            {/* Internship Section */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">Internship Details</h3>
              {data.internship ? (
                <div className="p-4 bg-gradient-to-br from-slate-50 to-indigo-50/40 rounded-2xl border border-indigo-100 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-bold">
                        <Building className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{data.internship.companyName}</h4>
                        <p className="text-xs text-slate-600 font-medium">{data.internship.title || 'Intern'}</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 text-xs font-extrabold uppercase bg-emerald-100 text-emerald-800 rounded-full">
                      {data.internship.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs border-t border-indigo-100">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Workplace</span>
                      <span className="font-semibold text-slate-700">{data.internship.type || 'On-site'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Start Date</span>
                      <span className="font-semibold text-slate-700">
                        {data.internship.startDate ? new Date(data.internship.startDate).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">End Date</span>
                      <span className="font-semibold text-slate-700">
                        {data.internship.endDate ? new Date(data.internship.endDate).toLocaleDateString() : 'Ongoing'}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-500 text-xs">
                  <Briefcase className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="font-bold text-slate-700">No Active Internship</p>
                  <p className="text-slate-400 mt-0.5">Student is currently focusing on campus academics.</p>
                </div>
              )}
            </div>

            {/* Logbook Section */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">Internship Logbooks</h3>
                <span className="text-xs font-bold text-slate-500">Total: {data.logbooks.total}</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                <div className="p-3 bg-slate-50 rounded-2xl">
                  <span className="text-base font-black text-slate-900 block">{data.logbooks.total}</span>
                  <span className="text-[10px] font-bold uppercase text-slate-400">Total Entries</span>
                </div>
                <div className="p-3 bg-emerald-50 rounded-2xl">
                  <span className="text-base font-black text-emerald-700 block">{data.logbooks.approved}</span>
                  <span className="text-[10px] font-bold uppercase text-emerald-600">Approved</span>
                </div>
                <div className="p-3 bg-amber-50 rounded-2xl">
                  <span className="text-base font-black text-amber-700 block">{data.logbooks.pending}</span>
                  <span className="text-[10px] font-bold uppercase text-amber-600">Pending</span>
                </div>
                <div className="p-3 bg-rose-50 rounded-2xl">
                  <span className="text-base font-black text-rose-700 block">{data.logbooks.revisionRequired}</span>
                  <span className="text-[10px] font-bold uppercase text-rose-600">Revision</span>
                </div>
              </div>

              {/* Weekly reports list if available */}
              {data.weeklyReports && data.weeklyReports.length > 0 && (
                <div className="pt-2 space-y-2">
                  <h4 className="text-[11px] font-bold text-slate-500 uppercase">Recent Submissions</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {data.weeklyReports.slice(0, 5).map(report => (
                      <div key={report.id} className="p-3 bg-slate-50 rounded-xl flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-slate-800 block">Week {report.weekNumber} Report</span>
                          <span className="text-[10px] text-slate-400">
                            {report.weekStartDate ? `${new Date(report.weekStartDate).toLocaleDateString()} - ${new Date(report.weekEndDate || '').toLocaleDateString()}` : 'Date recorded'}
                          </span>
                        </div>
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase ${
                          report.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                          report.status === 'REVISION_REQUIRED' ? 'bg-rose-100 text-rose-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {report.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Documents Section */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">Student Documents</h3>
              {data.documents && data.documents.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {data.documents.map(doc => (
                    <div key={doc.id} className="p-3 bg-slate-50 rounded-2xl flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="font-semibold text-slate-800 truncate">{doc.fileName}</span>
                      </div>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md shrink-0 ${
                        doc.status === 'VERIFIED' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {doc.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-slate-50 rounded-2xl text-center text-xs text-slate-400">
                  No verified documents uploaded yet.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MENTORING NOTES */}
      {activeTab === 'notes' && (
        <div className="space-y-6">
          {/* Add Note Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Add Mentoring Note for {data.name}</h3>

            <div className="flex flex-wrap gap-2">
              {(['NOTE', 'GUIDANCE', 'CONCERN', 'ACTION_ITEM'] as const).map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setNoteType(t)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                    noteType === t
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {t.replace('_', ' ')}
                </button>
              ))}
            </div>

            <textarea
              value={noteContent}
              onChange={e => setNoteContent(e.target.value)}
              placeholder="Record guidance, progress observations, concerns, or recommendations..."
              rows={3}
              className="w-full px-4 py-3 text-xs border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50/50 text-slate-900"
            />

            <div className="flex justify-end">
              <button
                onClick={handleAddNote}
                disabled={addingNote || !noteContent.trim()}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-indigo-100 disabled:opacity-50 flex items-center gap-2"
              >
                {addingNote ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Save Mentoring Note
              </button>
            </div>
          </div>

          {/* Notes History */}
          <div className="space-y-3">
            {(data.mentorNotes || []).length === 0 ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-400 text-xs">
                <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                No mentoring notes recorded yet for this student.
              </div>
            ) : (
              (data.mentorNotes || []).map(note => {
                const style = noteTypeColors[note.type] || noteTypeColors.NOTE;
                return (
                  <div key={note.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`px-2.5 py-0.5 text-[10px] font-black uppercase rounded-full border ${style.bg} ${style.text} ${style.border}`}>
                        {note.type.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        {new Date(note.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 font-normal leading-relaxed whitespace-pre-wrap">
                      {note.content}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 3: ACTION ITEMS */}
      {activeTab === 'action-items' && (
        <div className="space-y-6">
          {/* Top Actions */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Student Action Items</h3>
              <p className="text-xs text-slate-500">Tasks and milestones assigned to {data.name}</p>
            </div>
            {!showActionItemForm && (
              <button
                onClick={() => setShowActionItemForm(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-indigo-100 flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Create Action Item
              </button>
            )}
          </div>

          {/* Action Item Creation Form */}
          {showActionItemForm && (
            <form onSubmit={handleCreateActionItem} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <h4 className="text-sm font-bold text-slate-900">New Action Item</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Improve attendance above 75%, Submit weekly logbook..."
                    value={actionItemForm.title}
                    onChange={e => setActionItemForm({ ...actionItemForm, title: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50/50 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Description / Instructions</label>
                  <textarea
                    rows={2}
                    placeholder="Additional context or expectations..."
                    value={actionItemForm.description}
                    onChange={e => setActionItemForm({ ...actionItemForm, description: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50/50 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={actionItemForm.dueDate}
                    onChange={e => setActionItemForm({ ...actionItemForm, dueDate: e.target.value })}
                    className="px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50/50 text-slate-900"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowActionItemForm(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingActionItem}
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md shadow-indigo-100 disabled:opacity-50 flex items-center gap-1.5"
                >
                  {creatingActionItem ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Assign Action Item
                </button>
              </div>
            </form>
          )}

          {/* Action Items List */}
          {(data.actionItems || []).length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-400 text-xs">
              <CheckSquare className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              No action items currently assigned to this student.
            </div>
          ) : (
            <div className="space-y-3">
              {(data.actionItems || []).map(item => {
                const isCompleted = item.status === 'COMPLETED';
                return (
                  <div
                    key={item.id}
                    className={`bg-white p-5 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                      isCompleted ? 'border-emerald-200 bg-emerald-50/20' : 'border-slate-200 shadow-xs'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => handleToggleActionItemStatus(item)}
                        className={`w-5 h-5 rounded-md flex items-center justify-center mt-0.5 transition-colors ${
                          isCompleted
                            ? 'bg-emerald-600 text-white'
                            : 'border-2 border-slate-300 hover:border-indigo-600'
                        }`}
                      >
                        {isCompleted && <Check className="w-3.5 h-3.5" />}
                      </button>
                      <div>
                        <h4 className={`text-xs font-bold ${isCompleted ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                          {item.title}
                        </h4>
                        {item.description && (
                          <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-400 font-medium">
                          {item.dueDate && <span>Due: {item.dueDate}</span>}
                          <span>•</span>
                          <span>Assigned: {new Date(item.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`px-2.5 py-0.5 text-[10px] font-extrabold uppercase rounded-full ${
                        isCompleted ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {item.status}
                      </span>
                      <button
                        onClick={() => handleDeleteActionItem(item.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                        title="Delete Action Item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: MENTOR REVIEWS & FEEDBACK */}
      {activeTab === 'reviews' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Faculty Mentor Reviews</h3>
              <p className="text-xs text-slate-500">Formal performance reviews and student guidance ratings</p>
            </div>
            {!showReviewForm && (
              <button
                onClick={() => setShowReviewForm(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-indigo-100 flex items-center gap-1.5"
              >
                <Star className="w-4 h-4" /> Submit New Review
              </button>
            )}
          </div>

          {showReviewForm && (
            <form onSubmit={handleSubmitReview} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <h4 className="text-sm font-bold text-slate-900">Submit Performance Review for {data.name}</h4>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Rating</label>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                      className={`p-2 rounded-xl transition-colors ${
                        reviewForm.rating >= star ? 'text-amber-500 bg-amber-50' : 'text-slate-300 bg-slate-50 hover:bg-slate-100'
                      }`}
                    >
                      <Star className="w-5 h-5 fill-current" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Overall Feedback *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Summary of student's academic and internship performance..."
                  value={reviewForm.feedback}
                  onChange={e => setReviewForm({ ...reviewForm, feedback: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50/50 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Observed Strengths</label>
                  <textarea
                    rows={2}
                    placeholder="Key areas where student excels..."
                    value={reviewForm.strengths}
                    onChange={e => setReviewForm({ ...reviewForm, strengths: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50/50 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Concerns / Red Flags</label>
                  <textarea
                    rows={2}
                    placeholder="Attendance, backlog, or attitude concerns..."
                    value={reviewForm.concerns}
                    onChange={e => setReviewForm({ ...reviewForm, concerns: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50/50 text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Recommended Actions</label>
                <textarea
                  rows={2}
                  placeholder="Steps the mentee must take..."
                  value={reviewForm.actionItems}
                  onChange={e => setReviewForm({ ...reviewForm, actionItems: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50/50 text-slate-900"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md shadow-indigo-100 disabled:opacity-50 flex items-center gap-1.5"
                >
                  {submittingReview ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} Submit Formal Review
                </button>
              </div>
            </form>
          )}

          {/* Reviews List */}
          {(data.mentorReviews || []).length === 0 && !showReviewForm ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-400 text-xs">
              <Star className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              No reviews submitted yet for this mentee.
            </div>
          ) : (
            <div className="space-y-4">
              {(data.mentorReviews || []).map(review => (
                <div key={review.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-0.5 text-amber-500">
                        {Array.from({ length: review.rating || 5 }).map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-current" />
                        ))}
                      </div>
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-tight">
                        • {review.reviewType || 'GENERAL'} REVIEW
                      </span>
                    </div>
                    <span className="text-xs text-slate-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                  </div>

                  {review.feedback && (
                    <p className="text-xs text-slate-800 font-medium leading-relaxed bg-slate-50 p-3 rounded-xl">
                      {review.feedback}
                    </p>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {review.strengths && (
                      <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl">
                        <span className="text-[10px] font-black uppercase text-emerald-700 block mb-0.5">Strengths</span>
                        <p className="text-emerald-900">{review.strengths}</p>
                      </div>
                    )}
                    {review.concerns && (
                      <div className="p-3 bg-rose-50/70 border border-rose-100 rounded-xl">
                        <span className="text-[10px] font-black uppercase text-rose-700 block mb-0.5">Concerns</span>
                        <p className="text-rose-900">{review.concerns}</p>
                      </div>
                    )}
                  </div>

                  {review.actionItems && (
                    <div className="p-3 bg-purple-50/70 border border-purple-100 rounded-xl text-xs">
                      <span className="text-[10px] font-black uppercase text-purple-700 block mb-0.5">Action Items</span>
                      <p className="text-purple-900">{review.actionItems}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: MENTORING HISTORY & TIMELINE */}
      {activeTab === 'timeline' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Mentoring History Timeline</h3>
            <p className="text-xs text-slate-500">Comprehensive log of all interactions, reviews, notes, and action items</p>
          </div>

          {(data.timeline || []).length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              <History className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              No interactions recorded yet on this timeline.
            </div>
          ) : (
            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {(data.timeline || []).map((ev, idx) => (
                <div key={ev.id || idx} className="relative group">
                  <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full border-2 border-white bg-indigo-600 shadow-xs" />
                  <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-100 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-900">{ev.title}</span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {new Date(ev.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{ev.content}</p>
                    {ev.authorName && (
                      <span className="text-[10px] font-semibold text-slate-400 block pt-1">
                        By {ev.authorName}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MentorStudentDetailPage;
