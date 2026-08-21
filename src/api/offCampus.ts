import apiClient from './client';
import {
  ApiResponse,
  OffCampusInternship,
  CreateOffCampusPayload,
  ReviewOffCampusPayload,
} from '../types';

export const submitOffCampusInternship = async (
  payload: CreateOffCampusPayload
): Promise<OffCampusInternship> => {
  const response = await apiClient.post<ApiResponse<OffCampusInternship>>(
    '/student/off-campus-internships',
    payload
  );
  return response.data.data;
};

export const submitOffCampusInternshipApi = async (
  payload: CreateOffCampusPayload
): Promise<ApiResponse<OffCampusInternship>> => {
  const response = await apiClient.post<ApiResponse<OffCampusInternship>>(
    '/student/off-campus-internships',
    payload
  );
  return response.data;
};

export const getMyOffCampusInternships = async (): Promise<OffCampusInternship[]> => {
  const response = await apiClient.get<ApiResponse<OffCampusInternship[]>>(
    '/student/off-campus-internships'
  );
  return response.data.data;
};

export const getMyOffCampusInternshipsApi = async (): Promise<ApiResponse<OffCampusInternship[]>> => {
  const response = await apiClient.get<ApiResponse<OffCampusInternship[]>>(
    '/student/off-campus-internships'
  );
  return response.data;
};

export const getTPOOffCampusInternships = async (status?: string): Promise<OffCampusInternship[]> => {
  const response = await apiClient.get<ApiResponse<OffCampusInternship[]>>(
    '/tpo/off-campus-internships',
    { params: { status } }
  );
  return response.data.data;
};

export const getTPOOffCampusInternshipsApi = async (status?: string): Promise<ApiResponse<OffCampusInternship[]>> => {
  const response = await apiClient.get<ApiResponse<OffCampusInternship[]>>(
    '/tpo/off-campus-internships',
    { params: { status } }
  );
  return response.data;
};

export const reviewOffCampusInternship = async (
  id: string,
  payload: ReviewOffCampusPayload
): Promise<OffCampusInternship> => {
  const response = await apiClient.put<ApiResponse<OffCampusInternship>>(
    `/tpo/off-campus-internships/${id}/review`,
    payload
  );
  return response.data.data;
};

export const reviewOffCampusInternshipApi = async (
  id: string,
  payload: ReviewOffCampusPayload
): Promise<ApiResponse<OffCampusInternship>> => {
  const response = await apiClient.put<ApiResponse<OffCampusInternship>>(
    `/tpo/off-campus-internships/${id}/review`,
    payload
  );
  return response.data;
};

