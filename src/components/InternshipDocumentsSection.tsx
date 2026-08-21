import React, { useState, useEffect } from 'react';
import { InternshipDocument, UserRole } from '../types';
import { getApplicationDocumentsApi, uploadDocumentApi, verifyDocumentApi } from '../api/documents';
import { FileText, CheckCircle, XCircle, Clock, Upload, Eye, Loader2 } from 'lucide-react';

interface InternshipDocumentsSectionProps {
  applicationId: string;
  internshipId: string;
  studentId: string;
  userRole: UserRole;
}

export const InternshipDocumentsSection: React.FC<InternshipDocumentsSectionProps> = ({ applicationId, internshipId, studentId, userRole }) => {
  const [documents, setDocuments] = useState<InternshipDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Upload State
  const [uploading, setUploading] = useState(false);
  const [docType, setDocType] = useState<any>('OFFER_LETTER');
  const [fileUrl, setFileUrl] = useState('');

  useEffect(() => {
    loadDocuments();
  }, [applicationId]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const docs = await getApplicationDocumentsApi(applicationId);
      setDocuments(docs);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileUrl.trim()) return;
    
    try {
      setUploading(true);
      const newDoc = await uploadDocumentApi({
        internshipId,
        studentId,
        applicationId,
        documentType: docType,
        fileName: `${docType}_${new Date().getTime()}`,
        fileUrl: fileUrl.trim()
      });
      setDocuments([...documents, newDoc]);
      setFileUrl('');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleVerify = async (docId: string, status: 'VERIFIED' | 'REJECTED') => {
    try {
      const reason = status === 'REJECTED' ? window.prompt('Reason for rejection:') : undefined;
      if (status === 'REJECTED' && !reason) return; // cancelled

      const updated = await verifyDocumentApi(docId, { status, reason: reason || undefined });
      setDocuments(documents.map(d => d.id === docId ? updated : d));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to verify document');
    }
  };

  if (loading) return <div className="p-4 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-indigo-600" /></div>;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-600" />
          Document Management
        </h3>
      </div>

      <div className="p-5">
        {error && <div className="mb-4 text-sm text-rose-600 bg-rose-50 p-3 rounded-lg">{error}</div>}

        {documents.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm">
            No documents uploaded yet.
          </div>
        ) : (
          <ul className="space-y-3 mb-6">
            {documents.map(doc => (
              <li key={doc.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">{doc.documentType.replace(/_/g, ' ')}</div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Uploaded by {doc.uploadedByName} on {new Date(doc.uploadDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {/* Status Badge */}
                  <span className={`px-2.5 py-1 text-xs font-semibold rounded-full flex items-center gap-1 ${
                    doc.verificationStatus === 'VERIFIED' ? 'bg-emerald-100 text-emerald-700' :
                    doc.verificationStatus === 'REJECTED' ? 'bg-rose-100 text-rose-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {doc.verificationStatus === 'VERIFIED' && <CheckCircle className="w-3 h-3" />}
                    {doc.verificationStatus === 'REJECTED' && <XCircle className="w-3 h-3" />}
                    {['PENDING', 'UPLOADED', 'UNDER_REVIEW'].includes(doc.verificationStatus) && <Clock className="w-3 h-3" />}
                    {doc.verificationStatus}
                  </span>

                  <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="p-1.5 text-slate-400 hover:text-indigo-600 transition-colors bg-slate-50 hover:bg-indigo-50 rounded">
                    <Eye className="w-4 h-4" />
                  </a>

                  {/* Verification Actions (TPO/ADMIN) */}
                  {(userRole === 'TPO' || userRole === 'ADMIN') && doc.verificationStatus !== 'VERIFIED' && (
                    <div className="flex gap-2 border-l border-slate-200 pl-4 ml-2">
                      <button onClick={() => handleVerify(doc.id, 'VERIFIED')} className="text-xs px-2 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded font-medium">Approve</button>
                      <button onClick={() => handleVerify(doc.id, 'REJECTED')} className="text-xs px-2 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded font-medium">Reject</button>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Upload Form */}
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
          <h4 className="text-sm font-semibold text-slate-800 mb-3">Upload New Document</h4>
          <form onSubmit={handleUpload} className="flex items-end gap-3">
            <div className="flex-1">
              <label className="block text-xs font-medium text-slate-600 mb-1">Document Type</label>
              <select value={docType} onChange={e => setDocType(e.target.value)} className="w-full text-sm border-slate-300 rounded-lg">
                <option value="OFFER_LETTER">Offer Letter</option>
                <option value="JOINING_LETTER">Joining Letter</option>
                <option value="ACCEPTANCE_LETTER">Acceptance Letter</option>
                <option value="COMPLETION_CERTIFICATE">Completion Certificate</option>
                <option value="PPO_LETTER">PPO Letter</option>
              </select>
            </div>
            <div className="flex-[2]">
              <label className="block text-xs font-medium text-slate-600 mb-1">Document Link (URL)</label>
              <input type="url" value={fileUrl} onChange={e => setFileUrl(e.target.value)} placeholder="https://drive.google.com/..." required className="w-full text-sm border-slate-300 rounded-lg" />
            </div>
            <button type="submit" disabled={uploading || !fileUrl} className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2">
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              Upload
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default InternshipDocumentsSection;
