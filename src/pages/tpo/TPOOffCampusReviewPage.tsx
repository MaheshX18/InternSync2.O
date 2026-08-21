import React, { useEffect, useState } from 'react';
import { getTPOOffCampusInternshipsApi, reviewOffCampusInternshipApi } from '../../api/offCampus';
import { OffCampusInternship, ReviewOffCampusPayload } from '../../types';
import {
  Building2,
  Calendar,
  DollarSign,
  FileCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  AlertCircle,
  ExternalLink,
  Award,
  ShieldCheck,
  GraduationCap
} from 'lucide-react';

export const TPOOffCampusReviewPage: React.FC = () => {
  const [internships, setInternships] = useState<OffCampusInternship[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');

  const [selectedInternship, setSelectedInternship] = useState<OffCampusInternship | null>(null);
  const [decision, setDecision] = useState<'APPROVED' | 'REJECTED'>('APPROVED');
  const [credits, setCredits] = useState<number>(4);
  const [remarks, setRemarks] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchInternships = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getTPOOffCampusInternshipsApi(filter === 'ALL' ? undefined : filter);
      if (res.success && res.data) {
        setInternships(res.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch off-campus internships for TPO.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInternships();
  }, [filter]);

  const handleOpenReviewModal = (internship: OffCampusInternship, defaultDecision: 'APPROVED' | 'REJECTED') => {
    setSelectedInternship(internship);
    setDecision(defaultDecision);
    setCredits(internship.approvedCredits || 4);
    setRemarks('');
    setActionSuccess(null);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInternship) return;

    try {
      setSubmitting(true);
      setError(null);
      const payload: ReviewOffCampusPayload = {
        status: decision,
        adminRemarks: remarks.trim() || undefined,
        approvedCredits: decision === 'APPROVED' ? Number(credits) : undefined
      };

      const res = await reviewOffCampusInternshipApi(selectedInternship.id, payload);
      if (res.success) {
        setActionSuccess(`Internship for ${selectedInternship.studentName} successfully ${decision.toLowerCase()}!`);
        setSelectedInternship(null);
        await fetchInternships();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit review decision.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredList = internships.filter(item => {
    const q = search.toLowerCase();
    return (
      item.studentName?.toLowerCase().includes(q) ||
      item.companyName?.toLowerCase().includes(q) ||
      item.roleTitle?.toLowerCase().includes(q) ||
      item.studentEmail?.toLowerCase().includes(q) ||
      item.department?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-semibold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" /> T&P Verification Authority
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Off-Campus Internship Approvals & Credit Verification
          </h1>
          <p className="text-xs sm:text-sm text-indigo-200 max-w-2xl leading-relaxed">
            Audit student-submitted off-campus offers, verify corporate authenticity, and award academic graduation credits.
          </p>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by student name, roll number, company, or department..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
          {[
            { label: 'All', value: 'ALL' },
            { label: 'Pending Review', value: 'PENDING' },
            { label: 'Approved', value: 'APPROVED' },
            { label: 'Rejected', value: 'REJECTED' },
          ].map(tab => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-all ${
                filter === tab.value
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Internship Cards List */}
      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Loading off-campus submissions...</p>
        </div>
      ) : filteredList.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <FileCheck className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">No Submissions Found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            There are currently no off-campus internship submissions matching this filter.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredList.map(item => {
            const isPending = item.status === 'PENDING';
            const isApproved = item.status === 'APPROVED';
            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:border-slate-300 transition-all space-y-4"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-extrabold text-slate-900">{item.studentName}</span>
                      <span className="text-xs text-slate-500">({item.studentEmail})</span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {item.department || 'Engineering'}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-indigo-600 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-slate-700" />
                      {item.roleTitle} @ {item.companyName}
                    </h3>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${
                        isApproved
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : item.status === 'REJECTED'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {isApproved && <CheckCircle2 className="w-3.5 h-3.5" />}
                      {item.status === 'REJECTED' && <XCircle className="w-3.5 h-3.5" />}
                      {isPending && <Clock className="w-3.5 h-3.5" />}
                      {item.status}
                    </span>

                    {isApproved && (
                      <span className="px-3 py-1 rounded-xl text-xs font-black bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-indigo-600" />
                        {item.approvedCredits || 4} Academic Credits
                      </span>
                    )}
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 font-semibold block uppercase">Duration</span>
                    <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {item.startDate} to {item.endDate}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 font-semibold block uppercase">Stipend</span>
                    <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                      {item.stipend ? `$${item.stipend}/mo` : 'Unpaid / Voluntary'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 font-semibold block uppercase">Supervisor</span>
                    <span className="font-bold text-slate-800 mt-0.5 block truncate">
                      {item.supervisorName || 'N/A'} ({item.supervisorEmail || 'N/A'})
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 font-semibold block uppercase">Offer Letter / Proof</span>
                    {item.offerLetterUrl ? (
                      <a
                        href={item.offerLetterUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-bold text-indigo-600 hover:underline flex items-center gap-1 mt-0.5"
                      >
                        View Document <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-slate-400 italic">No document attached</span>
                    )}
                  </div>
                </div>

                {/* Remarks & Description */}
                {item.jobDescription && (
                  <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-700">
                    <span className="font-bold text-slate-900 block mb-0.5">Role Description:</span>
                    <p className="line-clamp-2">{item.jobDescription}</p>
                  </div>
                )}

                {item.adminRemarks && (
                  <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 text-xs text-indigo-900">
                    <span className="font-bold block mb-0.5">T&P Officer Review Remarks:</span>
                    <p>{item.adminRemarks}</p>
                  </div>
                )}

                {/* Actions */}
                {isPending && (
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => handleOpenReviewModal(item, 'APPROVED')}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Approve & Assign Credits
                    </button>
                    <button
                      onClick={() => handleOpenReviewModal(item, 'REJECTED')}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Reject Submission
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Review Modal */}
      {selectedInternship && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-5">
            <div>
              <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase bg-indigo-100 text-indigo-800">
                T&P Evaluation Action
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-2">
                Review Off-Campus Internship for {selectedInternship.studentName}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {selectedInternship.roleTitle} at {selectedInternship.companyName}
              </p>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                  Verification Decision
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDecision('APPROVED')}
                    className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                      decision === 'APPROVED'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    ✓ Approve Internship
                  </button>
                  <button
                    type="button"
                    onClick={() => setDecision('REJECTED')}
                    className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                      decision === 'REJECTED'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    ✕ Reject Internship
                  </button>
                </div>
              </div>

              {decision === 'APPROVED' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                    Graduation Credits to Award
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={credits}
                    onChange={e => setCredits(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                    required
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Standard semester curriculum grants 4 credits for verified 12-16 week internships.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                  Official T&P Remarks / Feedback
                </label>
                <textarea
                  rows={3}
                  value={remarks}
                  onChange={e => setRemarks(e.target.value)}
                  placeholder="Add comments on company validation, job relevance, or reasons for decision..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setSelectedInternship(null)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md disabled:opacity-50"
                >
                  {submitting ? 'Submitting Decision...' : 'Confirm Decision'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TPOOffCampusReviewPage;
