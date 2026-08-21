import apiClient from './client';
import {
  ApiResponse,
  InternshipEvaluation,
  CreateEvaluationPayload,
} from '../types';

export const submitInternshipEvaluation = async (
  payload: CreateEvaluationPayload
): Promise<InternshipEvaluation> => {
  const response = await apiClient.post<ApiResponse<InternshipEvaluation>>(
    '/company/evaluations',
    payload
  );
  return response.data.data;
};

export const getMyEvaluations = async (): Promise<InternshipEvaluation[]> => {
  const response = await apiClient.get<ApiResponse<InternshipEvaluation[]>>(
    '/student/evaluations'
  );
  return response.data.data;
};

export const getMyEvaluationsApi = async (): Promise<ApiResponse<InternshipEvaluation[]>> => {
  const response = await apiClient.get<ApiResponse<InternshipEvaluation[]>>(
    '/student/evaluations'
  );
  return response.data;
};

export const getTPOEvaluations = async (): Promise<InternshipEvaluation[]> => {
  const response = await apiClient.get<ApiResponse<InternshipEvaluation[]>>(
    '/tpo/evaluations'
  );
  return response.data.data;
};

export const getCompanyEvaluations = async (): Promise<InternshipEvaluation[]> => {
  const response = await apiClient.get<ApiResponse<InternshipEvaluation[]>>(
    '/company/evaluations'
  );
  return response.data.data;
};

