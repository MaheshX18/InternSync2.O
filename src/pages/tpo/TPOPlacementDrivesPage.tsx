import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Plus,
  Users,
  CheckCircle,
  XCircle,
  Calendar,
  DollarSign,
  Building,
  RefreshCw,
  Search,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Filter
} from 'lucide-react';
import {
  getTpoPlacementDrivesApi,
  createTpoPlacementDriveApi,
  getTpoPlacementDriveEligibilityApi
} from '../../api/client';
import { PlacementDrive, DriveEligibilityResult } from '../../types';

export const TPOPlacementDrivesPage: React.FC = () => {
  const [drives, setDrives] = useState<PlacementDrive[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // New Drive Modal
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [companyName, setCompanyName] = useState('');
  const [role, setRole] = useState('');
  const [packageOffered, setPackageOffered] = useState('12 LPA');
  const [minCgpa, setMinCgpa] = useState<number>(3.0);
  const [allowedDepts, setAllowedDepts] = useState<string>('Computer Science, Information Technology');
  const [requiredSkills, setRequiredSkills] = useState<string>('Java, Spring Boot, React, SQL');
  const [deadline, setDeadline] = useState<string>('2026-09-30');
  const [creating, setCreating] = useState(false);

  // Eligibility Drawer
  const [selectedDrive, setSelectedDrive] = useState<PlacementDrive | null>(null);
  const [eligibilityResults, setEligibilityResults] = useState<DriveEligibilityResult[]>([]);
  const [loadingEligibility, setLoadingEligibility] = useState(false);
  const [eligibilityFilter, setEligibilityFilter] = useState<'ALL' | 'ELIGIBLE' | 'INELIGIBLE'>('ALL');

  const fetchDrives = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getTpoPlacementDrivesApi();
      if (res.success) {
        setDrives(res.data || []);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch placement drives');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrives();
  }, []);

  const handleCreateDrive = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const payload = {
        companyName,
        role,
        packageOffered,
        package: packageOffered,
        minCgpa: Number(minCgpa),
        allowedDepartments: allowedDepts.split(',').map((s) => s.trim()).filter(Boolean),
        requiredSkills: requiredSkills.split(',').map((s) => s.trim()).filter(Boolean),
        deadline,
        status: 'OPEN'
      };

      const res = await createTpoPlacementDriveApi(payload);
      if (res.success) {
        setShowCreateModal(false);
        setCompanyName('');
        setRole('');
        fetchDrives();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to create placement drive');
    } finally {
      setCreating(false);
    }
  };

  const handleAnalyzeEligibility = async (drive: PlacementDrive) => {
    setSelectedDrive(drive);
    setLoadingEligibility(true);
    try {
      const res = await getTpoPlacementDriveEligibilityApi(drive.id);
      if (res.success) {
        setEligibilityResults(res.data || []);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoadingEligibility(false);
    }
  };

  const filteredEligibility = eligibilityResults.filter((item) => {
    if (eligibilityFilter === 'ELIGIBLE') return item.isEligible;
    if (eligibilityFilter === 'INELIGIBLE') return !item.isEligible;
    return true;
  });

  return (
    <div id="tpo-placement-drives-page" className="min-h-screen bg-slate-50 text-slate-800 pb-16">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white py-10 px-4 sm:px-6 lg:px-8 border-b border-indigo-900/50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-1">
              <Briefcase className="w-4 h-4 text-indigo-400" /> TPO Campus Placements
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">On-Campus Placement Drives</h1>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl">
              Configure placement drives, set department CGPA cutoffs, and dynamically calculate student cohort eligibility matching skills.
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-900/50 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Schedule New Drive
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-6">
        {loading ? (
          <div className="py-20 text-center text-slate-500 space-y-2">
            <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
            <p className="text-sm font-semibold">Loading placement drives...</p>
          </div>
        ) : error ? (
          <div className="p-4 bg-rose-50 text-rose-800 rounded-xl border border-rose-200 text-sm flex items-center justify-between">
            <span>{error}</span>
            <button onClick={fetchDrives} className="font-bold underline text-xs">
              Retry
            </button>
          </div>
        ) : drives.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <Briefcase className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No Campus Placement Drives Yet</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Schedule your first corporate placement drive to start matching eligible students and managing company recruitment pipelines.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl hover:bg-indigo-700"
            >
              Schedule Drive Now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {drives.map((drive) => (
              <div
                key={drive.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all p-6 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 font-black flex items-center justify-center shrink-0">
                        {drive.companyName?.[0]}
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-900">{drive.role}</h3>
                        <p className="text-xs text-slate-500 font-semibold">{drive.companyName}</p>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                        drive.status === 'OPEN'
                          ? 'bg-emerald-100 text-emerald-800'
                          : drive.status === 'UPCOMING'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {drive.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-semibold block">Package / CTC</span>
                      <span className="font-bold text-emerald-700">{drive.package || '10 LPA'}</span>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-semibold block">Min CGPA</span>
                      <span className="font-bold text-slate-800">{drive.minCgpa || 3.0}</span>
                    </div>
                  </div>

                  {/* Skills */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                      Required Stack
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {drive.requiredSkills?.map((sk) => (
                        <span key={sk} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-semibold rounded-md border border-indigo-100">
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Departments */}
                  <div className="text-[11px] text-slate-500">
                    <span className="font-semibold text-slate-700">Depts: </span>
                    {drive.allowedDepartments?.join(', ') || 'All Departments'}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" /> Deadline: {drive.deadline}
                  </span>
                  <button
                    onClick={() => handleAnalyzeEligibility(drive)}
                    className="px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold text-xs rounded-xl transition-colors flex items-center gap-1"
                  >
                    <Users className="w-3.5 h-3.5" /> Analyze Cohort
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cohort Eligibility Drawer Modal */}
      {selectedDrive && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto p-6 space-y-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Eligibility Breakdown for {selectedDrive.role} ({selectedDrive.companyName})
                </h3>
                <p className="text-xs text-slate-500">
                  Cutoff: CGPA {selectedDrive.minCgpa} • Required Stack Match &gt;= 50%
                </p>
              </div>
              <button
                onClick={() => setSelectedDrive(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* Filter */}
            <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <span className="text-xs font-bold text-slate-700">Filter Eligible Candidates</span>
              <div className="flex gap-1">
                {(['ALL', 'ELIGIBLE', 'INELIGIBLE'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setEligibilityFilter(mode)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      eligibilityFilter === mode
                        ? 'bg-white text-indigo-600 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {loadingEligibility ? (
              <div className="py-12 text-center text-slate-500 space-y-2">
                <RefreshCw className="w-6 h-6 animate-spin text-indigo-600 mx-auto" />
                <p className="text-xs font-semibold">Running automated student profile matching...</p>
              </div>
            ) : filteredEligibility.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No students match the current eligibility view.
              </div>
            ) : (
              <div className="space-y-2">
                {filteredEligibility.map((item) => (
                  <div
                    key={item.studentId}
                    className={`p-3.5 rounded-xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                      item.isEligible
                        ? 'bg-emerald-50/50 border-emerald-200'
                        : 'bg-rose-50/40 border-rose-200'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {item.isEligible ? (
                          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                        )}
                        <span className="font-bold text-slate-900">{item.studentName}</span>
                        <span className="text-[10px] text-slate-500">({item.department})</span>
                      </div>
                      <div className="text-[11px] text-slate-600 pl-6">
                        CGPA: <strong>{item.gpa?.toFixed(2)}</strong> • Readiness: <strong>{item.readinessScore}</strong>
                      </div>
                    </div>

                    <div className="pl-6 sm:pl-0">
                      {item.isEligible ? (
                        <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-lg text-[10px]">
                          Eligible to Apply
                        </span>
                      ) : (
                        <div className="text-right">
                          <span className="px-2.5 py-1 bg-rose-100 text-rose-800 font-bold rounded-lg text-[10px] block sm:inline-block">
                            Ineligible
                          </span>
                          <p className="text-[10px] text-rose-600 mt-0.5 max-w-xs">{item.reasons?.join(', ')}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Schedule Drive Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Schedule Campus Placement Drive</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 text-sm font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateDrive} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Company Name</label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Goldman Sachs"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Role Title</label>
                <input
                  type="text"
                  required
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Software Development Engineer"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Package Offered (CTC)</label>
                  <input
                    type="text"
                    required
                    value={packageOffered}
                    onChange={(e) => setPackageOffered(e.target.value)}
                    placeholder="e.g. 15 LPA"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Min CGPA Cutoff</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={minCgpa}
                    onChange={(e) => setMinCgpa(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Allowed Departments (Comma separated)</label>
                <input
                  type="text"
                  value={allowedDepts}
                  onChange={(e) => setAllowedDepts(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Required Tech Stack (Comma separated)</label>
                <input
                  type="text"
                  value={requiredSkills}
                  onChange={(e) => setRequiredSkills(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Application Deadline</label>
                <input
                  type="date"
                  required
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50"
                >
                  {creating ? 'Scheduling...' : 'Confirm Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TPOPlacementDrivesPage;
