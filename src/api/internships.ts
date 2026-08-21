import apiClient from './client';
import {
  ApiResponse,
  CreateInternshipPayload,
  Internship,
  InternshipStatus,
  InternshipSummary,
  PagedResponse,
  UpdateInternshipPayload,
  EmploymentType,
  WorkplaceType,
} from '../types';

export const createInternship = async (payload: CreateInternshipPayload): Promise<Internship> => {
  const response = await apiClient.post<ApiResponse<Internship>>('/internships', payload);
  return response.data.data;
};

export const getMyCompanyInternships = async (params?: {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: string;
}): Promise<PagedResponse<Internship>> => {
  const response = await apiClient.get<ApiResponse<PagedResponse<Internship>>>('/internships/company/me', { params });
  return response.data.data;
};

export const getCompanyInternshipById = async (id: string): Promise<Internship> => {
  const response = await apiClient.get<ApiResponse<Internship>>(`/internships/company/me/${id}`);
  return response.data.data;
};

export const updateInternship = async (id: string, payload: UpdateInternshipPayload): Promise<Internship> => {
  const response = await apiClient.put<ApiResponse<Internship>>(`/internships/company/me/${id}`, payload);
  return response.data.data;
};

export const updateInternshipStatus = async (id: string, status: InternshipStatus): Promise<Internship> => {
  const response = await apiClient.put<ApiResponse<Internship>>(`/internships/company/me/${id}/status`, { status });
  return response.data.data;
};

export const deleteInternship = async (id: string): Promise<void> => {
  await apiClient.delete<ApiResponse<void>>(`/internships/company/me/${id}`);
};

export const getPublicInternships = async (params?: {
  search?: string;
  workplaceType?: WorkplaceType;
  employmentType?: EmploymentType;
  location?: string;
  isPaid?: boolean;
  minSalary?: number;
  maxSalary?: number;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: string;
}): Promise<PagedResponse<InternshipSummary>> => {
  const response = await apiClient.get<ApiResponse<PagedResponse<InternshipSummary>>>('/internships/public', { params });
  return response.data.data;
};

export const getPublicInternshipById = async (id: string): Promise<Internship> => {
  const response = await apiClient.get<ApiResponse<Internship>>(`/internships/public/${id}`);
  return response.data.data;
};

export const toggleBookmark = async (id: string): Promise<boolean> => {
  const response = await apiClient.post<ApiResponse<boolean>>(`/internships/bookmarks/${id}`);
  return response.data.data;
};

export const getBookmarks = async (params?: {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: string;
}): Promise<PagedResponse<InternshipSummary>> => {
  const response = await apiClient.get<ApiResponse<PagedResponse<InternshipSummary>>>('/internships/bookmarks', { params });
  return response.data.data;
};

export const getAdminInternships = async (params?: {
  companyId?: string;
  status?: InternshipStatus;
  search?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: string;
}): Promise<PagedResponse<Internship>> => {
  const response = await apiClient.get<ApiResponse<PagedResponse<Internship>>>('/admin/internships', { params });
  return response.data.data;
};

export const moderateInternshipStatus = async (id: string, status: InternshipStatus): Promise<Internship> => {
  const response = await apiClient.put<ApiResponse<Internship>>(`/admin/internships/${id}/status`, { status });
  return response.data.data;
};

export const deleteAdminInternship = async (id: string): Promise<void> => {
  await apiClient.delete<ApiResponse<void>>(`/admin/internships/${id}`);
};
