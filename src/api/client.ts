import axios from 'axios';
import {
  ApiResponse,
  AuthData,
  HealthData,
  UserProfile,
  StudentDashboardData,
  CompanyDashboardData,
  AdminDashboardData,
  PagedUserResponse,
  UpdateProfilePayload,
  AdminUpdateUserPayload,
  UserRole,
  UserStatus,
} from '../types';

const apiClient = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Axios Request Interceptor: Attach Bearer Token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('internsync_access_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Health API
export const checkHealth = async (): Promise<ApiResponse<HealthData>> => {
  const response = await apiClient.get<ApiResponse<HealthData>>('/health');
  return response.data;
};

// Auth APIs
export const loginApi = async (credentials: { email: string; password: string }): Promise<ApiResponse<AuthData>> => {
  const response = await apiClient.post<ApiResponse<AuthData>>('/auth/login', credentials);
  return response.data;
};

export const registerApi = async (data: Record<string, any>): Promise<ApiResponse<AuthData>> => {
  const response = await apiClient.post<ApiResponse<AuthData>>('/auth/register', data);
  return response.data;
};

export const refreshTokenApi = async (refreshToken: string): Promise<ApiResponse<AuthData>> => {
  const response = await apiClient.post<ApiResponse<AuthData>>('/auth/refresh', { refreshToken });
  return response.data;
};

export const logoutApi = async (refreshToken: string): Promise<ApiResponse<string>> => {
  const response = await apiClient.post<ApiResponse<string>>('/auth/logout', { refreshToken });
  return response.data;
};

// User Profile APIs
export const getUserProfileApi = async (): Promise<ApiResponse<UserProfile>> => {
  const response = await apiClient.get<ApiResponse<UserProfile>>('/users/me');
  return response.data;
};

export const updateUserProfileApi = async (payload: UpdateProfilePayload): Promise<ApiResponse<UserProfile>> => {
  const response = await apiClient.put<ApiResponse<UserProfile>>('/users/me', payload);
  return response.data;
};

// Dashboard APIs
export const getStudentDashboardApi = async (): Promise<ApiResponse<StudentDashboardData>> => {
  const response = await apiClient.get<ApiResponse<StudentDashboardData>>('/dashboards/student');
  return response.data;
};

export const getCompanyDashboardApi = async (): Promise<ApiResponse<CompanyDashboardData>> => {
  const response = await apiClient.get<ApiResponse<CompanyDashboardData>>('/dashboards/company');
  return response.data;
};

export const getAdminDashboardApi = async (): Promise<ApiResponse<AdminDashboardData>> => {
  const response = await apiClient.get<ApiResponse<AdminDashboardData>>('/dashboards/admin');
  return response.data;
};

// Admin User Management APIs
export const getAdminUsersApi = async (params: {
  page?: number;
  size?: number;
  role?: UserRole;
  status?: UserStatus;
  search?: string;
}): Promise<ApiResponse<PagedUserResponse>> => {
  const response = await apiClient.get<ApiResponse<PagedUserResponse>>('/admin/users', { params });
  return response.data;
};

export const getAdminUserByIdApi = async (id: string): Promise<ApiResponse<UserProfile>> => {
  const response = await apiClient.get<ApiResponse<UserProfile>>(`/admin/users/${id}`);
  return response.data;
};

export const updateAdminUserStatusApi = async (id: string, status: UserStatus): Promise<ApiResponse<UserProfile>> => {
  const response = await apiClient.put<ApiResponse<UserProfile>>(`/admin/users/${id}/status`, { status });
  return response.data;
};

export const updateAdminUserApi = async (id: string, payload: AdminUpdateUserPayload): Promise<ApiResponse<UserProfile>> => {
  const response = await apiClient.put<ApiResponse<UserProfile>>(`/admin/users/${id}`, payload);
  return response.data;
};

export const deleteAdminUserApi = async (id: string): Promise<ApiResponse<void>> => {
  const response = await apiClient.delete<ApiResponse<void>>(`/admin/users/${id}`);
  return response.data;
};

// Notification APIs
export const getNotificationsApi = async (params?: { page?: number; size?: number; unreadOnly?: boolean }) => {
  const response = await apiClient.get('/notifications', { params });
  return response.data;
};

export const getUnreadNotificationsCountApi = async () => {
  const response = await apiClient.get('/notifications/unread-count');
  return response.data;
};

export const markNotificationAsReadApi = async (id: string) => {
  const response = await apiClient.put(`/notifications/${id}/read`);
  return response.data;
};

export const markAllNotificationsAsReadApi = async () => {
  const response = await apiClient.put('/notifications/read-all');
  return response.data;
};

// Recommendation APIs
export const getRecommendationsApi = async (params?: {
  role?: string;
  location?: string;
  minMatchScore?: number;
  page?: number;
  size?: number;
}) => {
  const response = await apiClient.get('/recommendations', { params });
  return response.data;
};

// Resume APIs
export const uploadResumeApi = async (payload: { fileName?: string; fileType?: string; fileSize?: number; contentText?: string }) => {
  const response = await apiClient.post('/resume/upload', payload);
  return response.data;
};

export const getMyResumeApi = async () => {
  const response = await apiClient.get('/resume/me');
  return response.data;
};

export const deleteMyResumeApi = async () => {
  const response = await apiClient.delete('/resume/me');
  return response.data;
};

// Phase 9 Skill Gap & Roadmap APIs
export const getSkillRolesApi = async () => {
  const response = await apiClient.get('/skills/roles');
  return response.data;
};

export const getSkillGapsApi = async (targetRole?: string) => {
  const response = await apiClient.get('/skills/gaps', { params: { targetRole } });
  return response.data;
};

export const getSkillRoadmapApi = async (targetRole?: string) => {
  const response = await apiClient.get('/skills/roadmap', { params: { targetRole } });
  return response.data;
};

export const startRoadmapItemApi = async (itemId: string) => {
  const response = await apiClient.post(`/skills/roadmap/${itemId}/start`);
  return response.data;
};

export const completeRoadmapItemApi = async (itemId: string) => {
  const response = await apiClient.post(`/skills/roadmap/${itemId}/complete`);
  return response.data;
};

export const updateRoadmapItemStatusApi = async (itemId: string, status: string, progress?: number) => {
  const response = await apiClient.post(`/skills/roadmap/${itemId}/status`, { status, progress });
  return response.data;
};

export const updateSkillLevelApi = async (skill: string, level: string) => {
  const response = await apiClient.put('/skills/level', { skill, level });
  return response.data;
};

export const updateTargetRoleApi = async (targetRole: string) => {
  const response = await apiClient.put('/skills/target-role', { targetRole });
  return response.data;
};

// Phase 10 Career Readiness API
export const getCareerReadinessApi = async (targetRole?: string) => {
  const response = await apiClient.get('/career/readiness', { params: { targetRole } });
  return response.data;
};

// Phase 11 TPO (Training & Placement Officer) API
export const getTpoDashboardApi = async () => {
  const response = await apiClient.get('/tpo/dashboard');
  return response.data;
};

export const getTpoAttendanceApi = async () => {
  const response = await apiClient.get('/tpo/attendance');
  return response.data;
};

export const getTpoStudentsApi = async (params?: { search?: string; department?: string; readinessLevel?: string; placementStatus?: string; page?: number; size?: number }) => {
  const response = await apiClient.get('/tpo/students', { params });
  return response.data;
};

export const getTpoStudentDetailApi = async (id: string) => {
  const response = await apiClient.get(`/tpo/students/${id}`);
  return response.data;
};

export const getTpoInterventionsApi = async () => {
  const response = await apiClient.get('/tpo/interventions');
  return response.data;
};

export const resolveTpoInterventionApi = async (id: string, notes?: string) => {
  const response = await apiClient.post(`/tpo/interventions/${id}/resolve`, { notes });
  return response.data;
};

export const getTpoAnalyticsApi = async () => {
  const response = await apiClient.get('/tpo/analytics');
  return response.data;
};

export const getTpoDepartmentsApi = async () => {
  const response = await apiClient.get('/tpo/departments');
  return response.data;
};

export const getTpoTrainingsApi = async () => {
  const response = await apiClient.get('/tpo/training');
  return response.data;
};

export const createTpoTrainingApi = async (payload: { title: string; description: string; duration: string; skills: string[]; status?: string }) => {
  const response = await apiClient.post('/tpo/training', payload);
  return response.data;
};

export const updateTpoTrainingApi = async (id: string, payload: { title?: string; description?: string; duration?: string; skills?: string[]; status?: string }) => {
  const response = await apiClient.put(`/tpo/training/${id}`, payload);
  return response.data;
};

export const updateTpoTrainingStatusApi = async (id: string, status: string) => {
  const response = await apiClient.patch(`/tpo/training/${id}/status`, null, { params: { status } });
  return response.data;
};

export const assignTpoTrainingApi = async (trainingId: string, payload: { studentIds?: string[]; assignAllNeedingAttention?: boolean }) => {
  const response = await apiClient.post(`/tpo/training/${trainingId}/assign`, payload);
  return response.data;
};

export const getTpoPlacementDrivesApi = async () => {
  const response = await apiClient.get('/tpo/placement-drives');
  return response.data;
};

export const createTpoPlacementDriveApi = async (payload: { companyName: string; role: string; package?: string; packageOffered?: string; minCgpa?: number; allowedDepartments?: string[]; requiredSkills: string[]; deadline: string; status?: string }) => {
  const body = {
    ...payload,
    packageOffered: payload.packageOffered || payload.package || '10 LPA'
  };
  const response = await apiClient.post('/tpo/placement-drives', body);
  return response.data;
};

export const getTpoPlacementDriveEligibilityApi = async (driveId: string) => {
  const response = await apiClient.get(`/tpo/placement-drives/${driveId}/eligible-students`);
  return response.data;
};

// Student Training APIs
export const getStudentTrainingsApi = async () => {
  const response = await apiClient.get('/student/trainings');
  return response.data;
};

export const completeStudentTrainingApi = async (assignmentId: string) => {
  const response = await apiClient.post(`/student/trainings/${assignmentId}/complete`);
  return response.data;
};

// PPO (Pre-Placement Offer) APIs
export const getCompanyPpoApi = async () => {
  const response = await apiClient.get('/company/ppo');
  return response.data;
};

export const getStudentPpoApi = async () => {
  const response = await apiClient.get('/student/ppo');
  return response.data;
};

export const recommendPpoApi = async (payload: { studentId: string; internshipId: string; remarks?: string }) => {
  const response = await apiClient.post('/company/ppo/recommend', payload);
  return response.data;
};

export const offerPpoApi = async (payload: { studentId: string; internshipId: string; offerDetails?: string; salaryPackage?: string }) => {
  const response = await apiClient.post('/company/ppo/offer', payload);
  return response.data;
};

export const acceptPpoApi = async (ppoId: string) => {
  const response = await apiClient.post(`/student/ppo/${ppoId}/accept`);
  return response.data;
};

export const declinePpoApi = async (ppoId: string) => {
  const response = await apiClient.post(`/student/ppo/${ppoId}/decline`);
  return response.data;
};

export const getTpoPpoAnalyticsApi = async () => {
  const response = await apiClient.get('/tpo/analytics/ppo');
  return response.data;
};

export default apiClient;
