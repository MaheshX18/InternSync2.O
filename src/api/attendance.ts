import apiClient from './client';
import {
  ApiResponse,
  InternshipAttendance,
  StudentAttendanceSummary,
  TPOAttendanceOverview,
} from '../types';

export const checkInAttendance = async (notes?: string): Promise<{ record: InternshipAttendance; summary: StudentAttendanceSummary }> => {
  const response = await apiClient.post<ApiResponse<{ record: InternshipAttendance; summary: StudentAttendanceSummary }>>(
    '/student/attendance/check-in',
    { notes }
  );
  return response.data.data;
};

export const checkInAttendanceApi = async (notes?: string): Promise<ApiResponse<{ record: InternshipAttendance; summary: StudentAttendanceSummary }>> => {
  const response = await apiClient.post<ApiResponse<{ record: InternshipAttendance; summary: StudentAttendanceSummary }>>(
    '/student/attendance/check-in',
    { notes }
  );
  return response.data;
};

export const getMyAttendance = async (): Promise<StudentAttendanceSummary> => {
  const response = await apiClient.get<ApiResponse<StudentAttendanceSummary>>(
    '/student/attendance'
  );
  return response.data.data;
};

export const getMyAttendanceApi = async (): Promise<ApiResponse<StudentAttendanceSummary>> => {
  const response = await apiClient.get<ApiResponse<StudentAttendanceSummary>>(
    '/student/attendance'
  );
  return response.data;
};

export const getTPOAttendanceOverview = async (): Promise<TPOAttendanceOverview> => {
  const response = await apiClient.get<ApiResponse<TPOAttendanceOverview>>(
    '/tpo/attendance'
  );
  return response.data.data;
};

export const getCompanyAttendanceLogs = async (internshipId?: string): Promise<InternshipAttendance[]> => {
  const response = await apiClient.get<ApiResponse<InternshipAttendance[]>>(
    '/company/attendance',
    { params: { internshipId } }
  );
  return response.data.data;
};

