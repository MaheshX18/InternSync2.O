import apiClient from './client';
import { ApiResponse, InternshipLifecycle, LifecycleStage } from '../types';

export const getLifecycleApi = async (applicationId: string): Promise<InternshipLifecycle> => {
  const response = await apiClient.get<ApiResponse<InternshipLifecycle>>(`/lifecycle/${applicationId}`);
  return response.data.data;
};

export const advanceLifecycleApi = async (applicationId: string, payload: { stage: LifecycleStage, notes?: string }): Promise<InternshipLifecycle> => {
  const response = await apiClient.put<ApiResponse<InternshipLifecycle>>(`/lifecycle/${applicationId}/advance`, payload);
  return response.data.data;
};

export const getStudentLifecyclesApi = async (): Promise<InternshipLifecycle[]> => {
  const response = await apiClient.get<ApiResponse<InternshipLifecycle[]>>(`/student/lifecycle`);
  return response.data.data;
};

export const getCompanyLifecyclesApi = async (): Promise<InternshipLifecycle[]> => {
  const response = await apiClient.get<ApiResponse<InternshipLifecycle[]>>(`/company/lifecycle`);
  return response.data.data;
};
