import apiClient from './client';
import { ApiResponse, StudentAcademicProfile, SemesterRecord } from '../types';

export const getStudentAcademicProfile = async (): Promise<StudentAcademicProfile> => {
  const response = await apiClient.get<ApiResponse<StudentAcademicProfile>>('/student/academics');
  return response.data.data;
};

export const getMyAcademicProfileApi = async (): Promise<ApiResponse<StudentAcademicProfile>> => {
  const response = await apiClient.get<ApiResponse<StudentAcademicProfile>>('/student/academics');
  return response.data;
};

export const updateStudentSemesterRecord = async (
  semesterRecord: SemesterRecord
): Promise<StudentAcademicProfile> => {
  const response = await apiClient.put<ApiResponse<StudentAcademicProfile>>(
    '/student/academics/semester',
    semesterRecord
  );
  return response.data.data;
};

export const updateSemesterRecordApi = async (
  semesterRecord: SemesterRecord
): Promise<ApiResponse<StudentAcademicProfile>> => {
  const response = await apiClient.put<ApiResponse<StudentAcademicProfile>>(
    '/student/academics/semester',
    semesterRecord
  );
  return response.data;
};

export const getStudentAcademicProfileById = async (
  studentId: string
): Promise<StudentAcademicProfile> => {
  const response = await apiClient.get<ApiResponse<StudentAcademicProfile>>(
    `/students/${studentId}/academics`
  );
  return response.data.data;
};

