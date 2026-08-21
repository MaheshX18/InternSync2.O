import apiClient from './client';
import { ApiResponse, WeeklyReport, WeeklyReportStatus } from '../types';

export const createWeeklyReportApi = async (payload: Partial<WeeklyReport>): Promise<WeeklyReport> => {
  const response = await apiClient.post<ApiResponse<WeeklyReport>>(`/weekly-reports`, payload);
  return response.data.data;
};

export const updateWeeklyReportApi = async (id: string, payload: Partial<WeeklyReport>): Promise<WeeklyReport> => {
  const response = await apiClient.put<ApiResponse<WeeklyReport>>(`/weekly-reports/${id}`, payload);
  return response.data.data;
};

export const submitWeeklyReportApi = async (id: string): Promise<WeeklyReport> => {
  const response = await apiClient.put<ApiResponse<WeeklyReport>>(`/weekly-reports/${id}/submit`);
  return response.data.data;
};

export const getMyWeeklyReportsApi = async (): Promise<WeeklyReport[]> => {
  const response = await apiClient.get<ApiResponse<WeeklyReport[]>>(`/weekly-reports/me`);
  return response.data.data;
};

export const getInternshipWeeklyReportsApi = async (internshipId: string): Promise<WeeklyReport[]> => {
  const response = await apiClient.get<ApiResponse<WeeklyReport[]>>(`/weekly-reports/internship/${internshipId}`);
  return response.data.data;
};

export const reviewWeeklyReportApi = async (id: string, payload: { status: WeeklyReportStatus, comments: string, role: 'MENTOR' | 'COMPANY' }): Promise<WeeklyReport> => {
  const response = await apiClient.put<ApiResponse<WeeklyReport>>(`/weekly-reports/${id}/review`, payload);
  return response.data.data;
};
