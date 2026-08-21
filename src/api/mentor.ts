import apiClient from './client';
import {
  ApiResponse,
  FacultyMentorProfile,
  FacultyMentorAssignment,
  FacultyMenteeDetail,
  FacultyDashboardData,
  StudentMentorInfo,
  MentorReview,
  MentorNote,
  MentorAssignment,
  UserProfile,
  WeeklyReport,
  InternshipTask,
} from '../types';

// ===== TPO / ADMIN Faculty Mentor APIs =====

export const getFacultyMentorsApi = async (params?: { search?: string; department?: string; status?: string; capacityFilter?: string }): Promise<ApiResponse<FacultyMentorProfile[]>> => {
  const response = await apiClient.get<ApiResponse<FacultyMentorProfile[]>>('/tpo/faculty-mentors', { params });
  return response.data;
};

export const createFacultyMentorApi = async (payload: {
  firstName: string; lastName: string; email: string; password: string;
  phone?: string; department?: string; designation?: string; employeeId?: string; maxCapacity?: number;
}): Promise<ApiResponse<FacultyMentorProfile>> => {
  const response = await apiClient.post<ApiResponse<FacultyMentorProfile>>('/tpo/faculty-mentors', payload);
  return response.data;
};

export const updateFacultyMentorApi = async (id: string, payload: {
  firstName?: string; lastName?: string; phone?: string; department?: string;
  designation?: string; employeeId?: string; maxCapacity?: number;
}): Promise<ApiResponse<FacultyMentorProfile>> => {
  const response = await apiClient.put<ApiResponse<FacultyMentorProfile>>(`/tpo/faculty-mentors/${id}`, payload);
  return response.data;
};

export const updateFacultyMentorStatusApi = async (id: string, status: 'ACTIVE' | 'INACTIVE'): Promise<ApiResponse<FacultyMentorProfile>> => {
  const response = await apiClient.put<ApiResponse<FacultyMentorProfile>>(`/tpo/faculty-mentors/${id}/status`, { status });
  return response.data;
};

export const getFacultyMentorMenteesApi = async (mentorId: string): Promise<ApiResponse<{ mentor: FacultyMentorProfile; mentees: FacultyMenteeDetail[] }>> => {
  const response = await apiClient.get<ApiResponse<{ mentor: FacultyMentorProfile; mentees: FacultyMenteeDetail[] }>>(`/tpo/faculty-mentors/${mentorId}/mentees`);
  return response.data;
};

export const assignStudentToMentorApi = async (mentorId: string, payload: { studentId: string; internshipId?: string }): Promise<ApiResponse<FacultyMentorAssignment>> => {
  const response = await apiClient.post<ApiResponse<FacultyMentorAssignment>>(`/tpo/faculty-mentors/${mentorId}/assign-student`, payload);
  return response.data;
};

export const reassignStudentMentorApi = async (payload: { studentId: string; newMentorId: string; reason?: string }): Promise<ApiResponse<{ oldAssignment: FacultyMentorAssignment; newAssignment: FacultyMentorAssignment }>> => {
  const response = await apiClient.post<ApiResponse<{ oldAssignment: FacultyMentorAssignment; newAssignment: FacultyMentorAssignment }>>('/tpo/faculty-mentors/reassign', payload);
  return response.data;
};

// ===== Student Faculty Mentor API =====

export const getStudentFacultyMentorApi = async (): Promise<ApiResponse<StudentMentorInfo>> => {
  const response = await apiClient.get<ApiResponse<StudentMentorInfo>>('/student/faculty-mentor');
  return response.data;
};

// ===== Faculty Mentor's Own APIs =====

export const getFacultyMenteesApi = async (): Promise<ApiResponse<FacultyMenteeDetail[]>> => {
  const response = await apiClient.get<ApiResponse<FacultyMenteeDetail[]>>('/faculty/mentees');
  return response.data;
};

export const getFacultyMenteeDetailApi = async (studentId: string): Promise<ApiResponse<FacultyMenteeDetail>> => {
  const response = await apiClient.get<ApiResponse<FacultyMenteeDetail>>(`/faculty/mentees/${studentId}`);
  return response.data;
};

export const getFacultyDashboardApi = async (): Promise<ApiResponse<FacultyDashboardData>> => {
  const response = await apiClient.get<ApiResponse<FacultyDashboardData>>('/faculty/dashboard');
  return response.data;
};

export const createMentorReviewApi = async (studentId: string, payload: {
  rating?: number; feedback?: string; strengths?: string; concerns?: string; actionItems?: string; reviewType?: string;
}): Promise<ApiResponse<MentorReview>> => {
  const response = await apiClient.post<ApiResponse<MentorReview>>(`/faculty/mentees/${studentId}/reviews`, payload);
  return response.data;
};

export const getMentorReviewsApi = async (studentId: string): Promise<ApiResponse<MentorReview[]>> => {
  const response = await apiClient.get<ApiResponse<MentorReview[]>>(`/faculty/mentees/${studentId}/reviews`);
  return response.data;
};

export const createMentorNoteApi = async (studentId: string, payload: { type: string; content: string }): Promise<ApiResponse<MentorNote>> => {
  const response = await apiClient.post<ApiResponse<MentorNote>>(`/faculty/mentees/${studentId}/notes`, payload);
  return response.data;
};

export const getMentorNotesApi = async (studentId: string): Promise<ApiResponse<MentorNote[]>> => {
  const response = await apiClient.get<ApiResponse<MentorNote[]>>(`/faculty/mentees/${studentId}/notes`);
  return response.data;
};

// ===== Faculty Mentor Action Items APIs =====

export const createMentorActionItemApi = async (studentId: string, payload: { title: string; description?: string; dueDate?: string }): Promise<ApiResponse<any>> => {
  const response = await apiClient.post<ApiResponse<any>>(`/faculty/mentees/${studentId}/action-items`, payload);
  return response.data;
};

export const getMentorActionItemsApi = async (studentId: string): Promise<ApiResponse<any[]>> => {
  const response = await apiClient.get<ApiResponse<any[]>>(`/faculty/mentees/${studentId}/action-items`);
  return response.data;
};

export const updateMentorActionItemApi = async (id: string, payload: { title?: string; description?: string; status?: string; dueDate?: string }): Promise<ApiResponse<any>> => {
  const response = await apiClient.put<ApiResponse<any>>(`/faculty/action-items/${id}`, payload);
  return response.data;
};

export const deleteMentorActionItemApi = async (id: string): Promise<ApiResponse<any>> => {
  const response = await apiClient.delete<ApiResponse<any>>(`/faculty/action-items/${id}`);
  return response.data;
};

// ===== Student Mentoring Feedback & Action Items APIs =====

export const getStudentMentorFeedbackApi = async (): Promise<ApiResponse<any>> => {
  const response = await apiClient.get<ApiResponse<any>>('/student/mentor-feedback');
  return response.data;
};

export const getStudentMentorActionItemsApi = async (): Promise<ApiResponse<any[]>> => {
  const response = await apiClient.get<ApiResponse<any[]>>('/student/mentor-action-items');
  return response.data;
};

export const updateStudentActionItemStatusApi = async (id: string, status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'): Promise<ApiResponse<any>> => {
  const response = await apiClient.patch<ApiResponse<any>>(`/student/mentor-action-items/${id}/status`, { status });
  return response.data;
};

// ===== Legacy Mentor APIs (backward compat) =====

export const assignMentorApi = async (payload: { mentorId: string, studentId: string, internshipId: string }): Promise<MentorAssignment> => {
  const response = await apiClient.post<ApiResponse<MentorAssignment>>(`/tpo/mentors/assign`, payload);
  return response.data.data;
};

export const getMentorAssignmentsApi = async (): Promise<MentorAssignment[]> => {
  const response = await apiClient.get<ApiResponse<MentorAssignment[]>>(`/tpo/mentors`);
  return response.data.data;
};

export const reassignMentorApi = async (id: string, mentorId: string): Promise<MentorAssignment> => {
  const response = await apiClient.put<ApiResponse<MentorAssignment>>(`/tpo/mentors/${id}/reassign`, { mentorId });
  return response.data.data;
};

export const getMentorDashboardApi = async (): Promise<{ assignments: MentorAssignment[], stats: any }> => {
  const response = await apiClient.get<ApiResponse<{ assignments: MentorAssignment[], stats: any }>>(`/mentor/dashboard`);
  return response.data.data;
};

export const getMentorStudentsApi = async (): Promise<MentorAssignment[]> => {
  const response = await apiClient.get<ApiResponse<MentorAssignment[]>>(`/mentor/students`);
  return response.data.data;
};

export const getMentorStudentDetailApi = async (studentId: string): Promise<{ profile: UserProfile, assignment: MentorAssignment, weeklyReports: WeeklyReport[], tasks: InternshipTask[] }> => {
  const response = await apiClient.get<ApiResponse<any>>(`/mentor/students/${studentId}`);
  return response.data.data;
};

export const addMentorReviewApi = async (payload: Partial<MentorReview>): Promise<MentorReview> => {
  const response = await apiClient.post<ApiResponse<MentorReview>>(`/mentor/reviews`, payload);
  return response.data.data;
};
