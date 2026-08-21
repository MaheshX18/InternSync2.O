import apiClient from './client';
import { ApiResponse, InternshipDocument, DocumentType, DocumentVerificationStatus } from '../types';

export const uploadDocumentApi = async (payload: { internshipId: string, studentId: string, applicationId?: string, documentType: DocumentType, fileName: string, fileUrl: string }): Promise<InternshipDocument> => {
  const response = await apiClient.post<ApiResponse<InternshipDocument>>(`/documents`, payload);
  return response.data.data;
};

export const getApplicationDocumentsApi = async (applicationId: string): Promise<InternshipDocument[]> => {
  const response = await apiClient.get<ApiResponse<InternshipDocument[]>>(`/documents/application/${applicationId}`);
  return response.data.data;
};

export const verifyDocumentApi = async (id: string, payload: { status: DocumentVerificationStatus, reason?: string }): Promise<InternshipDocument> => {
  const response = await apiClient.put<ApiResponse<InternshipDocument>>(`/documents/${id}/verify`, payload);
  return response.data.data;
};

export const getStudentDocumentsApi = async (): Promise<InternshipDocument[]> => {
  const response = await apiClient.get<ApiResponse<InternshipDocument[]>>(`/student/documents`);
  return response.data.data;
};

export const getCompanyDocumentsApi = async (): Promise<InternshipDocument[]> => {
  const response = await apiClient.get<ApiResponse<InternshipDocument[]>>(`/company/documents`);
  return response.data.data;
};
