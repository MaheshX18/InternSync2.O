import apiClient from './client';
import {
  ApiResponse,
  Application,
  ApplicationStatus,
  CreateApplicationPayload,
  PagedResponse,
  UpdateApplicationStatusPayload,
} from '../types';

export const applyToInternship = async (
  internshipId: string,
  payload: CreateApplicationPayload
): Promise<Application> => {
  const response = await apiClient.post<ApiResponse<Application>>(
    `/internships/${internshipId}/applications`,
    payload
  );
  return response.data.data;
};

export const getMyApplications = async (params?: {
  page?: number;
  size?: number;
  status?: ApplicationStatus;
}): Promise<PagedResponse<Application>> => {
  const response = await apiClient.get<ApiResponse<PagedResponse<Application>>>(
    '/applications/me',
    { params }
  );
  return response.data.data;
};

export const getMyApplicationById = async (id: string): Promise<Application> => {
  const response = await apiClient.get<ApiResponse<Application>>(`/applications/me/${id}`);
  return response.data.data;
};

export const withdrawApplication = async (id: string): Promise<Application> => {
  const response = await apiClient.put<ApiResponse<Application>>(`/applications/me/${id}/withdraw`);
  return response.data.data;
};

export const getCompanyApplications = async (params?: {
  page?: number;
  size?: number;
  internshipId?: string;
  status?: ApplicationStatus;
  search?: string;
}): Promise<PagedResponse<Application>> => {
  const response = await apiClient.get<ApiResponse<PagedResponse<Application>>>(
    '/company/applications',
    { params }
  );
  return response.data.data;
};

export const getCompanyApplicationById = async (id: string): Promise<Application> => {
  const response = await apiClient.get<ApiResponse<Application>>(`/company/applications/${id}`);
  return response.data.data;
};

export const updateApplicationStatus = async (
  id: string,
  payload: UpdateApplicationStatusPayload
): Promise<Application> => {
  const response = await apiClient.put<ApiResponse<Application>>(
    `/company/applications/${id}/status`,
    payload
  );
  return response.data.data;
};

export const getAdminApplications = async (params?: {
  page?: number;
  size?: number;
  internshipId?: string;
  companyId?: string;
  studentId?: string;
  status?: ApplicationStatus;
  search?: string;
}): Promise<PagedResponse<Application>> => {
  const response = await apiClient.get<ApiResponse<PagedResponse<Application>>>(
    '/admin/applications',
    { params }
  );
  return response.data.data;
};

export const getAdminApplicationById = async (id: string): Promise<Application> => {
  const response = await apiClient.get<ApiResponse<Application>>(`/admin/applications/${id}`);
  return response.data.data;
};
