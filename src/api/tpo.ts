import apiClient from './client';
import {
  ApiResponse,
  TPODashboardOverview,
  TPOStudentSummary,
  TPOStudentDetail,
  CompleteStudentRecord,
  InterventionItem,
  TrainingProgram,
  TrainingAssignment,
  PlacementDrive,
  DriveEligibilityResult,
  DepartmentAnalytics,
} from '../types';

export const getTPODashboardOverview = async (): Promise<TPODashboardOverview> => {
  const response = await apiClient.get<ApiResponse<TPODashboardOverview>>('/tpo/overview');
  return response.data.data;
};

export const getTPOStudents = async (params?: {
  department?: string;
  readinessLevel?: string;
  placementStatus?: string;
  needsAttention?: boolean;
  search?: string;
}): Promise<TPOStudentSummary[]> => {
  const response = await apiClient.get<ApiResponse<TPOStudentSummary[]>>('/tpo/students', { params });
  return response.data.data;
};

export const getTPOStudentDetail = async (id: string): Promise<TPOStudentDetail> => {
  const response = await apiClient.get<ApiResponse<TPOStudentDetail>>(`/tpo/students/${id}`);
  return response.data.data;
};

export const getCompleteStudentRecord = async (id: string): Promise<CompleteStudentRecord> => {
  const response = await apiClient.get<ApiResponse<CompleteStudentRecord>>(`/tpo/students/${id}/complete-profile`);
  return response.data.data;
};

export const getTPOInterventions = async (status?: string): Promise<InterventionItem[]> => {
  const response = await apiClient.get<ApiResponse<InterventionItem[]>>('/tpo/interventions', {
    params: { status },
  });
  return response.data.data;
};

export const resolveIntervention = async (id: string, notes?: string): Promise<InterventionItem> => {
  const response = await apiClient.post<ApiResponse<InterventionItem>>(`/tpo/interventions/${id}/resolve`, {
    notes,
  });
  return response.data.data;
};

export const getTPOTrainings = async (): Promise<TrainingProgram[]> => {
  const response = await apiClient.get<ApiResponse<TrainingProgram[]>>('/tpo/training');
  return response.data.data;
};

export const createTPOTraining = async (payload: {
  title: string;
  description: string;
  duration: string;
  skills: string[];
}): Promise<TrainingProgram> => {
  const response = await apiClient.post<ApiResponse<TrainingProgram>>('/tpo/training', payload);
  return response.data.data;
};

export const assignTPOTraining = async (
  trainingId: string,
  payload: { studentIds?: string[]; department?: string }
): Promise<{ count: number; assignments: TrainingAssignment[] }> => {
  const response = await apiClient.post<ApiResponse<{ count: number; assignments: TrainingAssignment[] }>>(
    `/tpo/training/${trainingId}/assign`,
    payload
  );
  return response.data.data;
};

export const getTPOPlacementDrives = async (): Promise<PlacementDrive[]> => {
  const response = await apiClient.get<ApiResponse<PlacementDrive[]>>('/tpo/placement-drives');
  return response.data.data;
};

export const createTPOPlacementDrive = async (payload: {
  companyName: string;
  role: string;
  package?: string;
  minCgpa?: number;
  allowedDepartments?: string[];
  requiredSkills: string[];
  batch?: string;
  deadline: string;
}): Promise<PlacementDrive> => {
  const response = await apiClient.post<ApiResponse<PlacementDrive>>('/tpo/placement-drives', payload);
  return response.data.data;
};

export const evaluateDriveEligibility = async (driveId: string): Promise<DriveEligibilityResult[]> => {
  const response = await apiClient.get<ApiResponse<DriveEligibilityResult[]>>(
    `/tpo/placement-drives/${driveId}/eligibility`
  );
  return response.data.data;
};

export const getDepartmentAnalytics = async (): Promise<DepartmentAnalytics[]> => {
  const response = await apiClient.get<ApiResponse<DepartmentAnalytics[]>>('/tpo/analytics/departments');
  return response.data.data;
};
