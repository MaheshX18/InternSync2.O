import apiClient from './client';
import { ApiResponse, CandidateMatch } from '../types';

export const getCandidateMatchesApi = async (internshipId: string): Promise<CandidateMatch[]> => {
  const response = await apiClient.get<ApiResponse<CandidateMatch[]>>(`/company/internships/${internshipId}/candidates`);
  return response.data.data;
};

export const recalculateCandidateMatchesApi = async (internshipId: string): Promise<CandidateMatch[]> => {
  const response = await apiClient.post<ApiResponse<CandidateMatch[]>>(`/company/internships/${internshipId}/candidates/recalculate`);
  return response.data.data;
};
