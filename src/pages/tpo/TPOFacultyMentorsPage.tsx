import React, { useEffect, useState } from 'react';
import { getFacultyMentorsApi, createFacultyMentorApi, updateFacultyMentorApi, updateFacultyMentorStatusApi, getFacultyMentorMenteesApi, assignStudentToMentorApi, reassignStudentMentorApi } from '../../api/mentor';
import { getTpoStudentsApi } from '../../api/client';
import { FacultyMentorProfile, FacultyMenteeDetail, TPOStudentSummary } from '../../types';
import { Users, Plus, Search, Edit3, Eye, UserPlus, RefreshCw, Loader2, X, AlertTriangle, CheckCircle, XCircle, ChevronDown, GraduationCap, Mail, Phone, Building, Shield } from 'lucide-react';

export const TPOFacultyMentorsPage: React.FC = () => {
  const [mentors, setMentors] = useState<FacultyMentorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [capacityFilter, setCapacityFilter] = useState('');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMenteesModal, setShowMenteesModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState<FacultyMentorProfile | null>(null);
  const [mentees, setMentees] = useState<FacultyMenteeDetail[]>([]);
  const [menteesLoading, setMenteesLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Create form
  const [createForm, setCreateForm] = useState({ firstName: '', lastName: '', email: '', phone: '', department: '', designation: '', employeeId: '', password: '', maxCapacity: 10 });
  const [creating, setCreating] = useState(false);

  // Edit form
  const [editForm, setEditForm] = useState({ firstName: '', lastName: '', phone: '', department: '', designation: '', employeeId: '', maxCapacity: 10 });
  const [editing, setEditing] = useState(false);

  // Assign
  const [students, setStudents] = useState<TPOStudentSummary[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentSearch, setStudentSearch] = useState('');
  const [assigning, setAssigning] = useState(false);

  const loadMentors = async () => {
    try {
      setLoading(true);
      const res = await getFacultyMentorsApi({ search, department: deptFilter, status: statusFilter, capacityFilter });
      if (res.success) setMentors(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load mentors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadMentors(); }, [search, deptFilter, statusFilter, capacityFilter]);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setActionMsg({ type, text });
    setTimeout(() => setActionMsg(null), 4000);
  };

  const handleCreate = async () => {
    if (!createForm.firstName || !createForm.lastName || !createForm.email || !createForm.password) {
      showMessage('error', 'Please fill all required fields');
      return;
    }
    try {
      setCreating(true);
      const res = await createFacultyMentorApi(createForm);
      if (res.success) {
        showMessage('success', 'Faculty mentor created successfully');
        setShowCreateModal(false);
        setCreateForm({ firstName: '', lastName: '', email: '', phone: '', department: '', designation: '', employeeId: '', password: '', maxCapacity: 10 });
        loadMentors();
      }
    } catch (err: any) {
      showMessage('error', err.response?.data?.message || 'Failed to create mentor');
    } finally {
      setCreating(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedMentor) return;
    try {
      setEditing(true);
      const res = await updateFacultyMentorApi(selectedMentor.id, editForm);
      if (res.success) {
        showMessage('success', 'Mentor updated successfully');
        setShowEditModal(false);
        loadMentors();
      }
    } catch (err: any) {
      showMessage('error', err.response?.data?.message || 'Failed to update mentor');
    } finally {
      setEditing(false);
    }
  };

  const handleToggleStatus = async (mentor: FacultyMentorProfile) => {
    const newStatus = mentor.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    if (!confirm(`Are you sure you want to ${newStatus === 'ACTIVE' ? 'activate' : 'deactivate'} ${mentor.name}?`)) return;
    try {
      const res = await updateFacultyMentorStatusApi(mentor.id, newStatus);
      if (res.success) {
        showMessage('success', `Mentor ${newStatus === 'ACTIVE' ? 'activated' : 'deactivated'} successfully`);
        loadMentors();
      }
    } catch (err: any) {
      showMessage('error', err.response?.data?.message || 'Failed to update status');
    }
  };

  const openMentees = async (mentor: FacultyMentorProfile) => {
    setSelectedMentor(mentor);
    setShowMenteesModal(true);
    setMenteesLoading(true);
    try {
      const res = await getFacultyMentorMenteesApi(mentor.id);
      if (res.success) setMentees(res.data.mentees);
    } catch (err: any) {
      showMessage('error', err.response?.data?.message || 'Failed to load mentees');
    } finally {
      setMenteesLoading(false);
    }
  };

  const openAssign = async (mentor: FacultyMentorProfile) => {
    setSelectedMentor(mentor);
    setShowAssignModal(true);
    setStudentsLoading(true);
    setStudentSearch('');
    try {
      const res = await getTpoStudentsApi({ size: 200 });
      if (res.success && res.data) {
        const list = Array.isArray(res.data) ? res.data : ((res.data as any).content || []);
        setStudents(list);
      }
    } catch (err: any) {
      showMessage('error', 'Failed to load students');
    } finally {
      setStudentsLoading(false);
    }
  };

  const reloadStudentsAfterAssignment = async () => {
    try {
      const res = await getTpoStudentsApi({ size: 200 });
      if (res.success && res.data) {
        const list = Array.isArray(res.data) ? res.data : ((res.data as any).content || []);
        setStudents(list);
      }
    } catch (e) {
      // Ignore
    }
  };

  const handleAssignStudent = async (student: TPOStudentSummary) => {
    if (!selectedMentor) return;
    try {
      setAssigning(true);
      const res = await assignStudentToMentorApi(selectedMentor.id, { studentId: student.id });
      if (res.success) {
        showMessage('success', `${student.firstName} ${student.lastName} assigned to ${selectedMentor.name}`);
        setShowAssignModal(false);
        loadMentors();
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to assign student';
      if (msg.includes('already assigned') || student.currentMentor) {
        handleReassignStudent(student);
      } else {
        showMessage('error', msg);
      }
    } finally {
      setAssigning(false);
    }
  };

  const handleReassignStudent = async (student: TPOStudentSummary) => {
    if (!selectedMentor) return;
    const currentMentorName = student.currentMentor?.name || 'their current mentor';
    const confirmed = confirm(
      `Student ${student.firstName} ${student.lastName} is currently assigned to ${currentMentorName}.\n\nDo you want to reassign this student to ${selectedMentor.name}?`
    );
    if (!confirmed) return;

    try {
      setAssigning(true);
      const reassignRes = await reassignStudentMentorApi({
        studentId: student.id,
        newMentorId: selectedMentor.id,
        reason: `Reassigned from ${currentMentorName} by TPO`
      });
      if (reassignRes.success) {
        showMessage('success', `${student.firstName} ${student.lastName} reassigned to ${selectedMentor.name}`);
        setShowAssignModal(false);
        loadMentors();
      }
    } catch (reassignErr: any) {
      showMessage('error', reassignErr.response?.data?.message || 'Failed to reassign student');
    } finally {
      setAssigning(false);
    }
  };

  const openEdit = (mentor: FacultyMentorProfile) => {
    setSelectedMentor(mentor);
    setEditForm({
      firstName: mentor.firstName,
      lastName: mentor.lastName,
      phone: mentor.phone || '',
      department: mentor.department || '',
      designation: mentor.designation || '',
      employeeId: mentor.employeeId || '',
      maxCapacity: mentor.maxCapacity
    });
    setShowEditModal(true);
  };

  const departments = [...new Set(mentors.map(m => m.department).filter(Boolean))] as string[];
  const filteredStudents = students.filter(s => {
    if (!studentSearch.trim()) return true;
    const q = studentSearch.toLowerCase().trim();
    return (
      (s.firstName && s.firstName.toLowerCase().includes(q)) ||
      (s.lastName && s.lastName.toLowerCase().includes(q)) ||
      (s.email && s.email.toLowerCase().includes(q)) ||
      (s.rollNumber && s.rollNumber.toLowerCase().includes(q)) ||
      (s.department && s.department.toLowerCase().includes(q)) ||
      (s.currentMentor?.name && s.currentMentor.name.toLowerCase().includes(q))
    );
  });

  if (loading && mentors.length === 0) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Faculty Mentors</h1>
          <p className="text-slate-500 mt-1">Manage faculty mentors and student assignments</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-100"
        >
          <Plus className="w-4 h-4" /> Add Faculty Mentor
        </button>
      </div>

      {/* Action Message */}
      {actionMsg && (
        <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 text-sm font-medium ${actionMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'}`}>
          {actionMsg.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          {actionMsg.text}
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 text-sm">{error}</div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text" placeholder="Search name, email, ID..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white text-slate-900"
            />
          </div>
          <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)} className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none">
            <option value="">All Departments</option>
            {departments.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none">
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
          <select value={capacityFilter} onChange={e => setCapacityFilter(e.target.value)} className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none">
            <option value="">All Capacity</option>
            <option value="AVAILABLE">Available</option>
            <option value="FULL">Full</option>
          </select>
        </div>
      </div>

      {/* Mentor Cards */}
      {mentors.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200 shadow-sm">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-700">No Faculty Mentors Found</h3>
          <p className="text-sm text-slate-500 mt-2">Click "Add Faculty Mentor" to create one.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {mentors.map(mentor => (
            <div key={mentor.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold text-sm">
                      {mentor.firstName.charAt(0)}{mentor.lastName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{mentor.name}</h3>
                      <p className="text-xs text-slate-500">{mentor.designation || 'Faculty'}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full ${mentor.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                    {mentor.status}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 mb-4">
                  <div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-slate-400" /> {mentor.email}</div>
                  {mentor.department && <div className="flex items-center gap-2"><Building className="w-3.5 h-3.5 text-slate-400" /> {mentor.department}</div>}
                  {mentor.employeeId && <div className="flex items-center gap-2"><Shield className="w-3.5 h-3.5 text-slate-400" /> {mentor.employeeId}</div>}
                  {mentor.phone && <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-slate-400" /> {mentor.phone}</div>}
                </div>

                {/* Capacity bar */}
                <div className="bg-slate-50 rounded-lg p-3 mb-4">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-slate-700">{mentor.assignedCount} / {mentor.maxCapacity} Students</span>
                    <span className={`font-bold ${mentor.availableCapacity > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {mentor.availableCapacity > 0 ? `${mentor.availableCapacity} available` : 'Full'}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${mentor.availableCapacity > 0 ? 'bg-indigo-500' : 'bg-rose-500'}`}
                      style={{ width: `${Math.min(100, (mentor.assignedCount / mentor.maxCapacity) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-wrap">
                  <button onClick={() => openMentees(mentor)} className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors border border-indigo-200">
                    <Eye className="w-3.5 h-3.5" /> Mentees
                  </button>
                  <button onClick={() => openAssign(mentor)} disabled={mentor.status !== 'ACTIVE' || mentor.availableCapacity === 0}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors border border-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <UserPlus className="w-3.5 h-3.5" /> Assign
                  </button>
                  <button onClick={() => openEdit(mentor)} className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors border border-slate-200">
                    <Edit3 className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button onClick={() => handleToggleStatus(mentor)}
                    className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-colors border ${mentor.status === 'ACTIVE' ? 'text-amber-700 bg-amber-50 border-amber-200 hover:bg-amber-100' : 'text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100'}`}
                  >
                    {mentor.status === 'ACTIVE' ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
                    {mentor.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowCreateModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Add Faculty Mentor</h2>
              <button onClick={() => setShowCreateModal(false)} className="p-1 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5 text-slate-500" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">First Name *</label>
                  <input type="text" value={createForm.firstName} onChange={e => setCreateForm({ ...createForm, firstName: e.target.value })} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-slate-900" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Last Name *</label>
                  <input type="text" value={createForm.lastName} onChange={e => setCreateForm({ ...createForm, lastName: e.target.value })} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-slate-900" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email *</label>
                <input type="email" value={createForm.email} onChange={e => setCreateForm({ ...createForm, email: e.target.value })} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-slate-900" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Password *</label>
                <input type="password" value={createForm.password} onChange={e => setCreateForm({ ...createForm, password: e.target.value })} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-slate-900" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
                  <input type="text" value={createForm.phone} onChange={e => setCreateForm({ ...createForm, phone: e.target.value })} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-slate-900" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                  <input type="text" value={createForm.department} onChange={e => setCreateForm({ ...createForm, department: e.target.value })} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-slate-900" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Designation</label>
                  <input type="text" value={createForm.designation} onChange={e => setCreateForm({ ...createForm, designation: e.target.value })} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-slate-900" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Employee ID</label>
                  <input type="text" value={createForm.employeeId} onChange={e => setCreateForm({ ...createForm, employeeId: e.target.value })} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-slate-900" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Max Capacity</label>
                <input type="number" min="1" value={createForm.maxCapacity} onChange={e => setCreateForm({ ...createForm, maxCapacity: parseInt(e.target.value) || 10 })} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-slate-900" />
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 flex items-center justify-end gap-3">
              <button onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">Cancel</button>
              <button onClick={handleCreate} disabled={creating} className="px-4 py-2 text-sm font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2">
                {creating && <Loader2 className="w-4 h-4 animate-spin" />} Create Mentor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedMentor && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowEditModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Edit Mentor: {selectedMentor.name}</h2>
              <button onClick={() => setShowEditModal(false)} className="p-1 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5 text-slate-500" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">First Name</label>
                  <input type="text" value={editForm.firstName} onChange={e => setEditForm({ ...editForm, firstName: e.target.value })} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-slate-900" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Last Name</label>
                  <input type="text" value={editForm.lastName} onChange={e => setEditForm({ ...editForm, lastName: e.target.value })} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-slate-900" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
                  <input type="text" value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-slate-900" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                  <input type="text" value={editForm.department} onChange={e => setEditForm({ ...editForm, department: e.target.value })} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-slate-900" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Designation</label>
                  <input type="text" value={editForm.designation} onChange={e => setEditForm({ ...editForm, designation: e.target.value })} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-slate-900" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Employee ID</label>
                  <input type="text" value={editForm.employeeId} onChange={e => setEditForm({ ...editForm, employeeId: e.target.value })} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-slate-900" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Max Capacity (current: {selectedMentor.assignedCount} assigned)</label>
                <input type="number" min={selectedMentor.assignedCount} value={editForm.maxCapacity} onChange={e => setEditForm({ ...editForm, maxCapacity: parseInt(e.target.value) || 10 })} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-slate-900" />
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 flex items-center justify-end gap-3">
              <button onClick={() => setShowEditModal(false)} className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">Cancel</button>
              <button onClick={handleEdit} disabled={editing} className="px-4 py-2 text-sm font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2">
                {editing && <Loader2 className="w-4 h-4 animate-spin" />} Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mentees Modal */}
      {showMenteesModal && selectedMentor && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowMenteesModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">{selectedMentor.name}'s Mentees</h2>
                <p className="text-xs text-slate-500 mt-0.5">{selectedMentor.assignedCount} / {selectedMentor.maxCapacity} assigned</p>
              </div>
              <button onClick={() => setShowMenteesModal(false)} className="p-1 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5 text-slate-500" /></button>
            </div>
            <div className="p-6">
              {menteesLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-indigo-600" /></div>
              ) : mentees.length === 0 ? (
                <div className="text-center py-8 text-slate-500">No students assigned to this mentor.</div>
              ) : (
                <div className="space-y-3">
                  {mentees.map(mentee => (
                    <div key={mentee.id} className="p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold text-xs">{mentee.firstName.charAt(0)}{mentee.lastName.charAt(0)}</div>
                          <div>
                            <h4 className="font-bold text-sm text-slate-900">{mentee.name}</h4>
                            <p className="text-xs text-slate-500">{mentee.rollNumber || 'N/A'} · {mentee.department || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-xs">
                          <span className="text-slate-600">CGPA: <b>{mentee.cgpa || 'N/A'}</b></span>
                          <span className="text-slate-600">Att: <b>{mentee.attendance.attendancePercentage}%</b></span>
                          <span className={`px-2 py-0.5 rounded-full font-bold ${mentee.riskLevel === 'HIGH' ? 'bg-rose-100 text-rose-700' : mentee.riskLevel === 'MEDIUM' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                            {mentee.riskLevel}
                          </span>
                        </div>
                      </div>
                      {mentee.internship && (
                        <div className="mt-2 text-xs text-slate-500">
                          <span className="font-medium text-slate-700">{mentee.internship.companyName}</span> — {mentee.internship.title}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Assign / Reassign Student Modal */}
      {showAssignModal && selectedMentor && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowAssignModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[88vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-200 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Assign Student to {selectedMentor.name}</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Department: <span className="font-semibold text-slate-700">{selectedMentor.department || 'All'}</span> • Available Capacity: <span className={`font-bold ${selectedMentor.availableCapacity > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{selectedMentor.availableCapacity} / {selectedMentor.maxCapacity}</span>
                </p>
              </div>
              <button onClick={() => setShowAssignModal(false)} className="p-1 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5 text-slate-500" /></button>
            </div>

            <div className="p-4 border-b border-slate-100 shrink-0 bg-slate-50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search students by name, email, roll no, department..."
                  value={studentSearch}
                  onChange={e => setStudentSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-slate-900"
                />
              </div>
            </div>

            <div className="p-4 overflow-y-auto flex-1">
              {studentsLoading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                  <span className="text-xs text-slate-500">Loading student directory...</span>
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold">No students found</p>
                  <p className="text-xs text-slate-400 mt-1">Try clearing your search query</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider bg-slate-50">
                        <th className="py-2.5 px-3">Student Name</th>
                        <th className="py-2.5 px-3">Roll No</th>
                        <th className="py-2.5 px-3">Department</th>
                        <th className="py-2.5 px-3">Current Mentor</th>
                        <th className="py-2.5 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredStudents.map(s => {
                        const isCurrentMentor = s.currentMentor?.id === selectedMentor.id;
                        const hasOtherMentor = s.currentMentor && !isCurrentMentor;

                        return (
                          <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold text-xs shrink-0">
                                  {s.firstName.charAt(0)}{s.lastName.charAt(0)}
                                </div>
                                <div>
                                  <div className="font-bold text-slate-900">{s.firstName} {s.lastName}</div>
                                  <div className="text-[11px] text-slate-400">{s.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-3 font-medium text-slate-700">
                              {s.rollNumber || 'N/A'}
                            </td>
                            <td className="py-3 px-3 text-slate-600">
                              {s.department || 'N/A'}
                            </td>
                            <td className="py-3 px-3">
                              {isCurrentMentor ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[11px] bg-indigo-50 text-indigo-700 border border-indigo-200">
                                  <CheckCircle className="w-3 h-3" /> This Mentor
                                </span>
                              ) : hasOtherMentor ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-semibold text-[11px] bg-amber-50 text-amber-800 border border-amber-200">
                                  {s.currentMentor!.name}
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-medium text-[11px] bg-slate-100 text-slate-600">
                                  Not Assigned
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-3 text-right">
                              {isCurrentMentor ? (
                                <span className="text-xs font-semibold text-slate-400">Assigned</span>
                              ) : hasOtherMentor ? (
                                <button
                                  onClick={() => handleReassignStudent(s)}
                                  disabled={assigning || selectedMentor.availableCapacity === 0}
                                  className="px-3 py-1.5 text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-lg transition-colors disabled:opacity-50"
                                >
                                  Reassign
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleAssignStudent(s)}
                                  disabled={assigning || selectedMentor.availableCapacity === 0}
                                  className="px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50"
                                >
                                  Assign
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
              <span className="text-xs text-slate-500">Showing {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''}</span>
              <button onClick={() => setShowAssignModal(false)} className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TPOFacultyMentorsPage;
