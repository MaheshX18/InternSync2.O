import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  getMyOffCampusInternshipsApi,
  submitOffCampusInternshipApi
} from '../../api/offCampus';
import { OffCampusInternship, CreateOffCampusPayload } from '../../types';
import {
  Building2,
  Briefcase,
  PlusCircle,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  MapPin,
  Calendar,
  ExternalLink,
  ShieldCheck,
  UserCheck,
  Phone,
  Mail,
  Sparkles
} from 'lucide-react';

export const StudentOffCampusPage: React.FC = () => {
  const { user } = useAuth();
  const [internships, setInternships] = useState<OffCampusInternship[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState<CreateOffCampusPayload>({
    companyName: '',
    internshipTitle: '',
    description: '',
    startDate: '',
    endDate: '',
    duration: '6 Months',
    location: '',
    mode: 'HYBRID',
    stipend: '₹25,000 / month',
    offerLetterUrl: '',
    supervisorName: '',
    supervisorEmail: '',
    supervisorPhone: ''
  });

  const fetchOffCampus = async () => {
    try {
      setLoading(true);
      const res = await getMyOffCampusInternshipsApi();
      if (res.success && res.data) {
        setInternships(res.data);
      }
    } catch (err) {
      console.error('Failed to load off-campus internships:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffCampus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await submitOffCampusInternshipApi(formData);
      if (res.success && res.data) {
        setInternships([res.data, ...internships]);
        setShowModal(false);
        setFormData({
          companyName: '',
          internshipTitle: '',
          description: '',
          startDate: '',
          endDate: '',
          duration: '6 Months',
          location: '',
          mode: 'HYBRID',
          stipend: '₹25,000 / month',
          offerLetterUrl: '',
          supervisorName: '',
          supervisorEmail: '',
          supervisorPhone: ''
        });
      }
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to submit off-campus internship');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div id="student-off-campus-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Banner */}
      <div id="off-campus-header" className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
                External Internship Tracking
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold px-3 py-1 rounded-full">
                T&P Credit Verification
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Off-Campus Internship Submissions
            </h1>
            <p className="text-slate-300 text-sm mt-1">
              Secured an internship independently? Submit your offer letter and mentor details for university approval and credit allocation.
            </p>
          </div>

          <button
            id="btn-submit-off-campus"
            onClick={() => setShowModal(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-5 py-3 rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            Submit Off-Campus Internship
          </button>
        </div>
      </div>

      {/* Submissions List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Your Submitted Off-Campus Internships</h2>
          <span className="text-xs text-slate-500 font-medium">{internships.length} Submissions</span>
        </div>

        {internships.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {internships.map(item => (
              <div
                key={item.id}
                className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between hover:border-indigo-200 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 ${
                      item.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                      item.status === 'REJECTED' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {item.status === 'APPROVED' ? <CheckCircle2 className="w-3.5 h-3.5" /> :
                       item.status === 'REJECTED' ? <XCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                      {item.status === 'APPROVED' ? 'T&P APPROVED & CREDITED' :
                       item.status === 'REJECTED' ? 'REJECTED BY T&P' : 'PENDING T&P REVIEW'}
                    </span>

                    <span className="text-xs text-slate-400 font-medium">
                      Submitted {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mb-1">{item.internshipTitle}</h3>
                  <p className="text-sm font-semibold text-indigo-600 flex items-center gap-1.5 mb-3">
                    <Building2 className="w-4 h-4" />
                    {item.companyName}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{item.startDate} to {item.endDate}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{item.location} ({item.mode})</span>
                    </div>
                    {item.stipend && (
                      <div className="flex items-center gap-1.5 col-span-2">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="font-semibold text-emerald-700">Stipend: {item.stipend}</span>
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed mb-4">{item.description}</p>

                  {/* Supervisor Info */}
                  {item.supervisorName && (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs mb-4">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Company Mentor</span>
                      <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                        {item.supervisorName}
                      </p>
                      <div className="flex items-center gap-4 text-[11px] text-slate-500 mt-1">
                        {item.supervisorEmail && (
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3 text-slate-400" /> {item.supervisorEmail}
                          </span>
                        )}
                        {item.supervisorPhone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" /> {item.supervisorPhone}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Offer Letter link */}
                  {item.offerLetterUrl && (
                    <div className="mb-4">
                      <a
                        href={item.offerLetterUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        View Attached Offer Letter PDF
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}

                  {/* TPO Notes */}
                  {item.verificationNotes && (
                    <div className={`p-3.5 rounded-2xl text-xs border ${
                      item.status === 'APPROVED' ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950' : 'bg-rose-50/80 border-rose-200 text-rose-950'
                    }`}>
                      <div className="flex items-center gap-1.5 font-bold mb-1">
                        <ShieldCheck className="w-4 h-4 text-indigo-600" />
                        T&P Office Verification Remarks
                      </div>
                      <p className="italic">"{item.verificationNotes}"</p>
                      {item.verifiedBy && (
                        <p className="text-[10px] text-slate-500 font-semibold mt-1">— Verified by {item.verifiedBy}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-800 text-base">No Off-Campus Internships Submitted</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto mb-6">
              If you received an internship offer from an external company, submit it here to ensure your university attendance and academic credits are counted.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md transition-all inline-flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              Submit First Off-Campus Internship
            </button>
          </div>
        )}
      </div>

      {/* Submission Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Submit Off-Campus Internship</h3>
                  <p className="text-xs text-slate-500">Provide company, offer letter, and supervisor details for T&P verification</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Company / Organization Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Infosys, Bosch, Microsoft"
                    value={formData.companyName}
                    onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Internship Job Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Cloud & DevOps Engineering Intern"
                    value={formData.internshipTitle}
                    onChange={e => setFormData({ ...formData, internshipTitle: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Job Description & Responsibilities</label>
                <textarea
                  rows={2}
                  placeholder="Outline key project deliverables, tech stack, and responsibilities..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">End Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Work Mode</label>
                  <select
                    value={formData.mode}
                    onChange={e => setFormData({ ...formData, mode: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  >
                    <option value="HYBRID">Hybrid</option>
                    <option value="ON_SITE">On-Site</option>
                    <option value="REMOTE">Remote</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Location / Office City</label>
                  <input
                    type="text"
                    placeholder="e.g. Pune, Maharashtra"
                    value={formData.location}
                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Monthly Stipend</label>
                  <input
                    type="text"
                    placeholder="e.g. ₹25,000 / month"
                    value={formData.stipend}
                    onChange={e => setFormData({ ...formData, stipend: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Offer Letter Document Link (PDF / Cloud Drive) *</label>
                <input
                  type="url"
                  required
                  placeholder="https://drive.google.com/file/d/offer-letter.pdf"
                  value={formData.offerLetterUrl}
                  onChange={e => setFormData({ ...formData, offerLetterUrl: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-xs font-bold text-slate-800 block mb-3">Company Mentor / Supervisor Contact Details</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <input
                      type="text"
                      placeholder="Supervisor Name"
                      value={formData.supervisorName}
                      onChange={e => setFormData({ ...formData, supervisorName: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <input
                      type="email"
                      placeholder="Official Email"
                      value={formData.supervisorEmail}
                      onChange={e => setFormData({ ...formData, supervisorEmail: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      value={formData.supervisorPhone}
                      onChange={e => setFormData({ ...formData, supervisorPhone: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-md transition-all disabled:opacity-50"
                >
                  {submitting ? 'Submitting to T&P...' : 'Submit for T&P Verification'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
