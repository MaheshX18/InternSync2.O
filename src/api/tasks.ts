import apiClient from './client';
import {
  ApiResponse,
  InternshipTask,
  CreateTaskPayload,
  UpdateTaskProgressPayload,
} from '../types';

export const getMyTasks = async (): Promise<InternshipTask[]> => {
  const response = await apiClient.get<ApiResponse<InternshipTask[]>>('/student/tasks');
  return response.data.data;
};

export const getMyTasksApi = async (): Promise<ApiResponse<InternshipTask[]>> => {
  const response = await apiClient.get<ApiResponse<InternshipTask[]>>('/student/tasks');
  return response.data;
};

export const updateTaskStatus = async (
  taskId: string,
  payload: UpdateTaskProgressPayload
): Promise<InternshipTask> => {
  const response = await apiClient.patch<ApiResponse<InternshipTask>>(
    `/student/tasks/${taskId}/status`,
    payload
  );
  return response.data.data;
};

export const updateTaskProgressApi = async (
  taskId: string,
  payload: UpdateTaskProgressPayload
): Promise<ApiResponse<InternshipTask>> => {
  const response = await apiClient.patch<ApiResponse<InternshipTask>>(
    `/student/tasks/${taskId}/status`,
    payload
  );
  return response.data;
};

export const getCompanyTasks = async (internshipId?: string): Promise<InternshipTask[]> => {
  const response = await apiClient.get<ApiResponse<InternshipTask[]>>('/company/tasks', {
    params: { internshipId },
  });
  return response.data.data;
};

export const createInternshipTask = async (
  payload: CreateTaskPayload
): Promise<InternshipTask> => {
  const response = await apiClient.post<ApiResponse<InternshipTask>>('/company/tasks', payload);
  return response.data.data;
};

export const getTPOTasks = async (): Promise<InternshipTask[]> => {
  const response = await apiClient.get<ApiResponse<InternshipTask[]>>('/tpo/tasks');
  return response.data.data;
};

