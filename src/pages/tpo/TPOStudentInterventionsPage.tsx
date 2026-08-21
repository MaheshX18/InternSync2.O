import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  BookOpen,
  UserCheck,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import {
  getTpoInterventionsApi,
  resolveTpoInterventionApi
} from '../../api/client';
import { InterventionItem } from '../../types';

export const TPOStudentInterventionsPage: React.FC = () => {
  const [interventions, setInterventions] = useState<InterventionItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Resolution Modal
  const [selectedIntervention, setSelectedIntervention] = useState<InterventionItem | null>(null);
  const [notes, setNotes] = useState('');
  const [resolving, setResolving] = useState(false);

  const fetchInterventions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getTpoInterventionsApi();
      if (res.success) {
        setInterventions(res.data || []);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch interventions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterventions();
  }, []);

  const handleResolve = async () => {
    if (!selectedIntervention) return;
    setResolving(true);
    try {
      const res = await resolveTpoInterventionApi(selectedIntervention.id, notes);
      if (res.success) {
        setSelectedIntervention(null);
        setNotes('');
        fetchInterventions();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to resolve intervention');
    } finally {
      setResolving(false);
    }
  };

  return (
    <div id="tpo-student-interventions-page" className="min-h-screen bg-slate-50 text-slate-800 pb-16">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 text-white py-10 px-4 sm:px-6 lg:px-8 border-b border-amber-900/50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
              <ShieldAlert className="w-4 h-4 text-amber-400" /> TPO Automated Skill Gap Interventions
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">At-Risk Student Intervention Audit</h1>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl">
              Real-time monitoring of students with career readiness score &lt; 60 or missing critical skills. Review auto-generated remediation roadmaps and resolve cases.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-6">
        {loading ? (
          <div className="py-20 text-center text-slate-500 space-y-2">
            <RefreshCw className="w-8 h-8 text-amber-600 animate-spin mx-auto" />
            <p className="text-sm font-semibold">Scanning student cohort for skill gaps and low readiness...</p>
          </div>
        ) : error ? (
          <div className="p-4 bg-rose-50 text-rose-800 rounded-xl border border-rose-200 text-sm flex items-center justify-between">
            <span>{error}</span>
            <button onClick={fetchInterventions} className="font-bold underline text-xs">
              Retry
            </button>
          </div>
        ) : interventions.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No Pending Interventions</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              All cohort students currently meet baseline career readiness standards. No students are flagged for critical intervention.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {interventions.map((item) => (
              <div
                key={item.id}
                className={`bg-white rounded-2xl border shadow-xs p-6 space-y-4 transition-all ${
                  item.status === 'RESOLVED'
                    ? 'border-emerald-200 bg-emerald-50/20'
                    : 'border-amber-200 bg-amber-50/20'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl font-bold flex items-center justify-center shrink-0 text-sm ${
                        item.status === 'RESOLVED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {item.studentName?.[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900">{item.studentName}</h3>
                        <span className="text-xs text-slate-500">({item.department})</span>
                      </div>
                      <p className="text-xs text-slate-500">{item.studentEmail} • CGPA: {item.gpa?.toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Readiness Score</span>
                      <span
                        className={`text-lg font-black ${
                          item.readinessScore < 60 ? 'text-amber-700' : 'text-emerald-700'
                        }`}
                      >
                        {item.readinessScore} / 100
                      </span>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        item.status === 'RESOLVED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="p-3.5 bg-white rounded-xl border border-amber-100 space-y-1.5">
                    <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> Flagged Reasons
                    </span>
                    <ul className="space-y-1 text-xs text-slate-700 list-disc list-inside font-medium">
                      {item.reasons?.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3.5 bg-white rounded-xl border border-indigo-100 space-y-1.5">
                    <span className="text-[10px] font-bold text-indigo-800 uppercase tracking-wider block flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5 text-indigo-600" /> TPO Recommended Actions
                    </span>
                    <ul className="space-y-1 text-xs text-slate-700 list-disc list-inside font-medium">
                      {item.recommendedActions?.map((act, i) => (
                        <li key={i}>{act}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {item.status !== 'RESOLVED' && (
                  <div className="flex justify-end pt-2 border-t border-slate-100">
                    <button
                      onClick={() => setSelectedIntervention(item)}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                    >
                      <UserCheck className="w-4 h-4" /> Resolve Intervention
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Resolve Intervention Modal */}
      {selectedIntervention && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Resolve Student Intervention</h3>
              <button onClick={() => setSelectedIntervention(null)} className="text-slate-400 font-bold text-sm">
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Mark intervention for <strong className="text-slate-900">{selectedIntervention.studentName}</strong> as resolved after completing counseling or assigning training.
            </p>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">Resolution & Guidance Notes</label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Student enrolled in Java Boot Camp & updated resume..."
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedIntervention(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleResolve}
                disabled={resolving}
                className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700 disabled:opacity-50"
              >
                {resolving ? 'Resolving...' : 'Confirm Resolved'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TPOStudentInterventionsPage;
