import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  Users,
  CheckCircle,
  Clock,
  Search,
  RefreshCw,
  Award,
  AlertTriangle,
  Play
} from 'lucide-react';
import {
  getTpoTrainingsApi,
  createTpoTrainingApi,
  updateTpoTrainingStatusApi,
  assignTpoTrainingApi
} from '../../api/client';
import { TrainingProgram } from '../../types';

export const TPOTrainingManagementPage: React.FC = () => {
  const [trainings, setTrainings] = useState<TrainingProgram[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // New Training Form
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('4 Weeks');
  const [skills, setSkills] = useState('Java, Spring Boot, React');
  const [creating, setCreating] = useState(false);

  // Bulk Assign Modal
  const [selectedTraining, setSelectedTraining] = useState<TrainingProgram | null>(null);
  const [assignNeedingAttention, setAssignNeedingAttention] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [assignMessage, setAssignMessage] = useState<string | null>(null);

  const fetchTrainings = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getTpoTrainingsApi();
      if (res.success) {
        setTrainings(res.data || []);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch training programs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainings();
  }, []);

  const handleCreateTraining = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const payload = {
        title,
        description,
        duration,
        skills: skills.split(',').map((s) => s.trim()).filter(Boolean),
        status: 'ACTIVE'
      };
      const res = await createTpoTrainingApi(payload);
      if (res.success) {
        setShowCreateModal(false);
        setTitle('');
        setDescription('');
        fetchTrainings();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to create training program');
    } finally {
      setCreating(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      const res = await updateTpoTrainingStatusApi(id, nextStatus);
      if (res.success) {
        fetchTrainings();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update training status');
    }
  };

  const handleBulkAssign = async () => {
    if (!selectedTraining) return;
    setAssigning(true);
    setAssignMessage(null);
    try {
      const res = await assignTpoTrainingApi(selectedTraining.id, {
        assignAllNeedingAttention: assignNeedingAttention
      });
      if (res.success) {
        setAssignMessage(`Successfully assigned program to students!`);
        setTimeout(() => {
          setSelectedTraining(null);
          setAssignMessage(null);
          fetchTrainings();
        }, 1500);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to assign program');
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div id="tpo-training-management-page" className="min-h-screen bg-slate-50 text-slate-800 pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-900 to-purple-950 text-white py-10 px-4 sm:px-6 lg:px-8 border-b border-indigo-900/50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-1">
              <BookOpen className="w-4 h-4 text-indigo-400" /> TPO Skill Advancement & Interventions
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">Institutional Training Programs</h1>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl">
              Design specialized skill accelerator bootcamps, auto-assign modules to students requiring readiness boost, and track completion progress.
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-900/50 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Create Training Program
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-6">
        {loading ? (
          <div className="py-20 text-center text-slate-500 space-y-2">
            <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
            <p className="text-sm font-semibold">Loading training programs...</p>
          </div>
        ) : error ? (
          <div className="p-4 bg-rose-50 text-rose-800 rounded-xl border border-rose-200 text-sm flex items-center justify-between">
            <span>{error}</span>
            <button onClick={fetchTrainings} className="font-bold underline text-xs">
              Retry
            </button>
          </div>
        ) : trainings.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No Training Programs Created</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Deploy training courses like "Full-Stack Development Boot Camp" to upgrade student skills and automatically sync completed competencies to their career profile.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl hover:bg-indigo-700"
            >
              Create First Program
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trainings.map((program) => (
              <div
                key={program.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all p-6 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-base font-bold text-slate-900 leading-snug">{program.title}</h3>
                    <button
                      onClick={() => handleToggleStatus(program.id, program.status)}
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold transition-colors ${
                        program.status === 'ACTIVE'
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {program.status}
                    </button>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2">{program.description}</p>

                  <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-indigo-600" /> {program.duration}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-slate-700">
                      <Users className="w-3.5 h-3.5 text-indigo-600" /> {program.assignedStudentCount || 0} Assigned
                    </span>
                  </div>

                  {/* Skills taught */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                      Synced Competencies
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {program.skills?.map((sk) => (
                        <span key={sk} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-semibold rounded-md border border-indigo-100">
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> {program.completionRate ? `${program.completionRate.toFixed(0)}% Completed` : '0% Completed'}
                  </span>
                  <button
                    onClick={() => setSelectedTraining(program)}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1"
                  >
                    <Users className="w-3.5 h-3.5" /> Assign Students
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bulk Assign Modal */}
      {selectedTraining && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Assign Training Program</h3>
              <button onClick={() => setSelectedTraining(null)} className="text-slate-400 font-bold text-sm">
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Deploy <strong className="text-slate-900">{selectedTraining.title}</strong> to cohort students.
            </p>

            {assignMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl">
                {assignMessage}
              </div>
            )}

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={assignNeedingAttention}
                  onChange={(e) => setAssignNeedingAttention(e.target.checked)}
                  className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Auto-Assign to All Needing Attention</span>
                  <span className="text-[11px] text-slate-500 block">
                    Automatically targets students with readiness score &lt; 60 or intervention status.
                  </span>
                </div>
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedTraining(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkAssign}
                disabled={assigning}
                className="px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl hover:bg-indigo-700 disabled:opacity-50"
              >
                {assigning ? 'Assigning...' : 'Deploy Program'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Training Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Create Institutional Training Program</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 font-bold text-sm">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTraining} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Program Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Enterprise Full-Stack Spring Boot & React"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Comprehensive training designed to bridge backend and frontend skill gaps..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Estimated Duration</label>
                <input
                  type="text"
                  required
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="e.g. 4 Weeks"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Skills (Comma separated)</label>
                <input
                  type="text"
                  required
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="e.g. Java, Spring Boot, Microservices, React"
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
                  {creating ? 'Creating...' : 'Create Program'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TPOTrainingManagementPage;
