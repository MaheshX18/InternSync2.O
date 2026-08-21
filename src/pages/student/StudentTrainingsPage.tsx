import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  CheckCircle,
  Clock,
  RefreshCw,
  Award,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import {
  getStudentTrainingsApi,
  completeStudentTrainingApi
} from '../../api/client';
import { TrainingAssignment } from '../../types';

export const StudentTrainingsPage: React.FC = () => {
  const [assignments, setAssignments] = useState<TrainingAssignment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [completingId, setCompletingId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchMyTrainings = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getStudentTrainingsApi();
      if (res.success) {
        setAssignments(res.data || []);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch assigned training modules');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyTrainings();
  }, []);

  const handleComplete = async (assignmentId: string) => {
    setCompletingId(assignmentId);
    setSuccessMsg(null);
    try {
      const res = await completeStudentTrainingApi(assignmentId);
      if (res.success) {
        setSuccessMsg('Training completed! Skills have been automatically synchronized to your student profile.');
        fetchMyTrainings();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to complete training program');
    } finally {
      setCompletingId(null);
    }
  };

  return (
    <div id="student-trainings-page" className="min-h-screen bg-slate-50 text-slate-800 pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-900 to-purple-900 text-white py-10 px-4 sm:px-6 lg:px-8 border-b border-indigo-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-1">
            <BookOpen className="w-4 h-4 text-indigo-400" /> TPO Assigned Modules
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Institutional Training Bootcamps</h1>
          <p className="text-slate-300 text-sm mt-1 max-w-2xl">
            Skill accelerator programs assigned by your Training & Placement Officer. Completing these modules updates your verified skills and boosts your career readiness score.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-6">
        {successMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-3 text-xs font-bold">
            <Sparkles className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {loading ? (
          <div className="py-20 text-center text-slate-500 space-y-2">
            <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
            <p className="text-sm font-semibold">Loading assigned training programs...</p>
          </div>
        ) : error ? (
          <div className="p-4 bg-rose-50 text-rose-800 rounded-xl border border-rose-200 text-sm flex items-center justify-between">
            <span>{error}</span>
            <button onClick={fetchMyTrainings} className="font-bold underline text-xs">
              Retry
            </button>
          </div>
        ) : assignments.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No Assigned Training Programs</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              You do not have any pending training boot camps assigned by your placement officer. Keep building your profile!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {assignments.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all p-6 space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">
                        Assigned on {new Date(item.assignedAt).toLocaleDateString()}
                      </span>
                      <h3 className="text-lg font-bold text-slate-900 mt-0.5">{item.trainingTitle}</h3>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                        item.status === 'COMPLETED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <span>Module Progress</span>
                      <span>{item.progress || (item.status === 'COMPLETED' ? 100 : 0)}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div
                        className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${item.progress || (item.status === 'COMPLETED' ? 100 : 0)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  {item.status === 'COMPLETED' ? (
                    <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 text-emerald-600" /> Completed on {new Date(item.completedAt || Date.now()).toLocaleDateString()}
                    </span>
                  ) : (
                    <button
                      onClick={() => handleComplete(item.id)}
                      disabled={completingId === item.id}
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {completingId === item.id ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" /> Synchronizing Skills...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4" /> Mark Training Completed
                        </>
                      )}
                    </button>
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

export default StudentTrainingsPage;
