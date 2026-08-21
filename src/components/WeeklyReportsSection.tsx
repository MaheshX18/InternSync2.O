import React, { useState, useEffect } from 'react';
import { WeeklyReport, UserRole } from '../types';
import { getInternshipWeeklyReportsApi, createWeeklyReportApi, submitWeeklyReportApi, reviewWeeklyReportApi, updateWeeklyReportApi } from '../api/weeklyReports';
import { Calendar, CheckCircle, Clock, FileText, Send, AlertCircle, Edit2, Loader2, MessageSquare } from 'lucide-react';

interface WeeklyReportsSectionProps {
  internshipId: string;
  studentId?: string; // If provided, filters specifically for this student
  userRole: UserRole;
  isStudent?: boolean;
}

export const WeeklyReportsSection: React.FC<WeeklyReportsSectionProps> = ({ internshipId, studentId, userRole, isStudent = false }) => {
  const [reports, setReports] = useState<WeeklyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    weekNumber: 1,
    startDate: '',
    endDate: '',
    workCompleted: '',
    hoursWorked: 40,
    challengesFaced: '',
    progressLearning: '',
    nextWeekPlan: ''
  });

  // Review State
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [reviewComment, setReviewComment] = useState('');

  useEffect(() => {
    loadReports();
  }, [internshipId]);

  const loadReports = async () => {
    try {
      setLoading(true);
      let data = await getInternshipWeeklyReportsApi(internshipId);
      if (studentId) {
        data = data.filter(r => r.studentId === studentId);
      }
      // Sort by week number descending
      setReports(data.sort((a, b) => b.weekNumber - a.weekNumber));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load weekly reports');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveForm = async (e: React.FormEvent, submitImmediately: boolean) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        internshipId,
        status: submitImmediately ? 'SUBMITTED' : 'DRAFT'
      };

      if (editingId) {
        await updateWeeklyReportApi(editingId, payload);
      } else {
        await createWeeklyReportApi(payload);
      }

      setShowForm(false);
      setEditingId(null);
      loadReports();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save report');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReport = async (id: string) => {
    if (!window.confirm('Are you sure you want to submit this report? You cannot edit it after submission.')) return;
    try {
      await submitWeeklyReportApi(id);
      loadReports();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit report');
    }
  };

  const handleReview = async (id: string, status: 'APPROVED' | 'REVISION_REQUIRED') => {
    try {
      await reviewWeeklyReportApi(id, { 
        status, 
        comments: reviewComment, 
        role: userRole === 'FACULTY_MENTOR' ? 'MENTOR' : 'COMPANY' 
      });
      setReviewingId(null);
      setReviewComment('');
      loadReports();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit review');
    }
  };

  const openEditForm = (report: WeeklyReport) => {
    setFormData({
      weekNumber: report.weekNumber,
      startDate: report.startDate.split('T')[0],
      endDate: report.endDate.split('T')[0],
      workCompleted: report.workCompleted,
      hoursWorked: report.hoursWorked,
      challengesFaced: report.challengesFaced,
      progressLearning: report.progressLearning,
      nextWeekPlan: report.nextWeekPlan
    });
    setEditingId(report.id);
    setShowForm(true);
  };

  if (loading) return <div className="p-4 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-indigo-600" /></div>;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-indigo-600" />
          Weekly Logbook & Progress
        </h3>
        {isStudent && !showForm && (
          <button 
            onClick={() => {
              const nextWeek = reports.length > 0 ? reports[0].weekNumber + 1 : 1;
              setFormData({ ...formData, weekNumber: nextWeek });
              setEditingId(null);
              setShowForm(true);
            }} 
            className="px-3 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded hover:bg-indigo-700"
          >
            + New Weekly Report
          </button>
        )}
      </div>

      <div className="p-5">
        {error && <div className="mb-4 text-sm text-rose-600 bg-rose-50 p-3 rounded-lg">{error}</div>}

        {showForm && (
          <div className="mb-8 bg-slate-50 border border-slate-200 rounded-xl p-5">
            <h4 className="text-md font-bold text-slate-800 mb-4">{editingId ? 'Edit Report' : 'Create Weekly Report'}</h4>
            <form>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Week Number</label>
                  <input type="number" min="1" value={formData.weekNumber} onChange={e => setFormData({...formData, weekNumber: Number(e.target.value)})} className="w-full text-sm border-slate-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Start Date</label>
                  <input type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} className="w-full text-sm border-slate-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">End Date</label>
                  <input type="date" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} className="w-full text-sm border-slate-300 rounded-lg" />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-xs font-medium text-slate-600 mb-1">Work Completed</label>
                <textarea rows={3} value={formData.workCompleted} onChange={e => setFormData({...formData, workCompleted: e.target.value})} placeholder="Describe the tasks completed this week..." className="w-full text-sm border-slate-300 rounded-lg" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Challenges Faced</label>
                  <textarea rows={2} value={formData.challengesFaced} onChange={e => setFormData({...formData, challengesFaced: e.target.value})} className="w-full text-sm border-slate-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Learning & Progress</label>
                  <textarea rows={2} value={formData.progressLearning} onChange={e => setFormData({...formData, progressLearning: e.target.value})} className="w-full text-sm border-slate-300 rounded-lg" />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-xs font-medium text-slate-600 mb-1">Next Week's Plan</label>
                <input type="text" value={formData.nextWeekPlan} onChange={e => setFormData({...formData, nextWeekPlan: e.target.value})} className="w-full text-sm border-slate-300 rounded-lg" />
              </div>
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg">Cancel</button>
                <button type="button" onClick={e => handleSaveForm(e, false)} disabled={submitting} className="px-4 py-2 text-sm font-medium bg-slate-200 text-slate-800 hover:bg-slate-300 rounded-lg">Save as Draft</button>
                <button type="button" onClick={e => handleSaveForm(e, true)} disabled={submitting} className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg flex items-center gap-2">
                  <Send className="w-4 h-4" /> Submit Report
                </button>
              </div>
            </form>
          </div>
        )}

        {reports.length === 0 && !showForm ? (
          <div className="text-center py-8 text-slate-500 text-sm">
            No weekly reports have been submitted yet.
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map(report => (
              <div key={report.id} className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="p-4 bg-white flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900">Week {report.weekNumber}</h4>
                    <div className="text-xs text-slate-500 mt-1">
                      {new Date(report.startDate).toLocaleDateString()} - {new Date(report.endDate).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full flex items-center gap-1 ${
                      report.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                      report.status === 'REVISION_REQUIRED' ? 'bg-rose-100 text-rose-700' :
                      report.status === 'SUBMITTED' ? 'bg-blue-100 text-blue-700' :
                      report.status === 'UNDER_REVIEW' ? 'bg-amber-100 text-amber-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {report.status}
                    </span>
                    
                    {/* Student Actions */}
                    {isStudent && (report.status === 'DRAFT' || report.status === 'REVISION_REQUIRED') && (
                      <>
                        <button onClick={() => openEditForm(report)} className="p-1.5 text-slate-400 hover:text-indigo-600 rounded bg-slate-50 hover:bg-indigo-50" title="Edit">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {report.status === 'DRAFT' && (
                          <button onClick={() => handleSubmitReport(report.id)} className="p-1.5 text-slate-400 hover:text-emerald-600 rounded bg-slate-50 hover:bg-emerald-50" title="Submit">
                            <Send className="w-4 h-4" />
                          </button>
                        )}
                      </>
                    )}

                    {/* Reviewer Actions */}
                    {!isStudent && (report.status === 'SUBMITTED' || report.status === 'UNDER_REVIEW') && (
                      <button 
                        onClick={() => setReviewingId(reviewingId === report.id ? null : report.id)} 
                        className="text-xs px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded font-medium flex items-center gap-1"
                      >
                        <MessageSquare className="w-3 h-3" /> Review
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="p-4 bg-slate-50 border-t border-slate-100 text-sm">
                  <div className="mb-3">
                    <strong className="text-slate-700 block mb-1">Work Completed:</strong>
                    <p className="text-slate-600 whitespace-pre-wrap">{report.workCompleted}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div>
                      <strong className="text-slate-700 block mb-1">Challenges:</strong>
                      <p className="text-slate-600">{report.challengesFaced || 'None'}</p>
                    </div>
                    <div>
                      <strong className="text-slate-700 block mb-1">Learning:</strong>
                      <p className="text-slate-600">{report.progressLearning || 'None'}</p>
                    </div>
                  </div>

                  {/* Comments Section */}
                  {(report.companyComments || report.mentorComments) && (
                    <div className="mt-4 p-3 bg-white border border-slate-200 rounded-lg">
                      <strong className="text-xs text-slate-500 uppercase tracking-wider mb-2 block">Feedback</strong>
                      {report.companyComments && (
                        <div className="text-sm mb-2"><span className="font-medium text-slate-700">Company:</span> {report.companyComments}</div>
                      )}
                      {report.mentorComments && (
                        <div className="text-sm"><span className="font-medium text-slate-700">Mentor:</span> {report.mentorComments}</div>
                      )}
                    </div>
                  )}

                  {/* Active Review Form */}
                  {reviewingId === report.id && (
                    <div className="mt-4 p-4 bg-white border border-indigo-200 rounded-lg">
                      <label className="block text-xs font-semibold text-slate-700 mb-2">Leave Review Comments</label>
                      <textarea 
                        rows={3} 
                        value={reviewComment} 
                        onChange={e => setReviewComment(e.target.value)}
                        placeholder="Provide feedback on the student's progress..."
                        className="w-full text-sm border-slate-300 rounded-lg mb-3"
                      />
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => handleReview(report.id, 'REVISION_REQUIRED')} className="px-3 py-1.5 text-xs font-medium bg-rose-50 text-rose-700 hover:bg-rose-100 rounded">Request Revision</button>
                        <button onClick={() => handleReview(report.id, 'APPROVED')} className="px-3 py-1.5 text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 rounded">Approve Report</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WeeklyReportsSection;
