import React, { useState } from 'react';
import { Internship, CreateApplicationPayload } from '../../types';
import { applyToInternship } from '../../api/applications';
import { useAuth } from '../../context/AuthContext';
import { X, Loader2, Send, AlertCircle, CheckCircle2 } from 'lucide-react';

interface ApplyModalProps {
  internship: Internship;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ApplyModal: React.FC<ApplyModalProps> = ({ internship, isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();

  const [coverLetter, setCoverLetter] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>(user?.phone || '');
  const [university, setUniversity] = useState<string>(user?.department ? `${user.department} Student` : 'State University');
  const [graduationYear, setGraduationYear] = useState<string>(user?.batch || '2026');
  const [skillsInput, setSkillsInput] = useState<string>((user?.skills || ['React', 'TypeScript']).join(', '));
  const [resumeUrl, setResumeUrl] = useState<string>(user?.resumeUrl || 'https://example.com/my-resume.pdf');

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Frontend validation
    if (coverLetter.trim().length < 20) {
      setError('Cover letter must be at least 20 characters long.');
      return;
    }

    if (!phoneNumber.trim()) {
      setError('Phone number is required.');
      return;
    }

    if (!university.trim()) {
      setError('University name is required.');
      return;
    }

    if (!graduationYear.trim()) {
      setError('Graduation year is required.');
      return;
    }

    const skillsArray = skillsInput
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    if (skillsArray.length === 0) {
      setError('Please list at least one skill.');
      return;
    }

    if (!resumeUrl.trim().startsWith('http://') && !resumeUrl.trim().startsWith('https://')) {
      setError('Resume URL must be a valid HTTP or HTTPS link.');
      return;
    }

    const payload: CreateApplicationPayload = {
      coverLetter: coverLetter.trim(),
      phoneNumber: phoneNumber.trim(),
      university: university.trim(),
      graduationYear: graduationYear.trim(),
      skills: skillsArray,
      resumeUrl: resumeUrl.trim(),
    };

    try {
      setLoading(true);
      await applyToInternship(internship.id, payload);
      setSubmitted(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      if (err.response?.status === 409) {
        setError('You have already applied to this internship.');
      } else {
        setError(err.response?.data?.message || 'Failed to submit application. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Apply to Internship</h2>
            <p className="text-sm text-slate-500 mt-0.5">{internship.title} • {internship.companyName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {submitted ? (
          <div className="p-8 text-center space-y-4">
            <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto animate-bounce" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Application Submitted!</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Your application for <span className="font-semibold">{internship.title}</span> has been sent to {internship.companyName}.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-xl flex items-start gap-3 text-rose-700 dark:text-rose-300 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                Cover Letter <span className="text-rose-500">*</span> (min 20 chars)
              </label>
              <textarea
                required
                rows={4}
                value={coverLetter}
                onChange={e => setCoverLetter(e.target.value)}
                placeholder="Explain why you are a great fit for this internship..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <p className="text-xs text-slate-400 mt-1 text-right">{coverLetter.length} / 3000 chars</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                  Phone Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={phoneNumber}
                  onChange={e => setPhoneNumber(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                  University <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={university}
                  onChange={e => setUniversity(e.target.value)}
                  placeholder="University Name"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                  Graduation Year <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={graduationYear}
                  onChange={e => setGraduationYear(e.target.value)}
                  placeholder="2026"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                  Resume URL <span className="text-rose-500">*</span>
                </label>
                <input
                  type="url"
                  required
                  value={resumeUrl}
                  onChange={e => setResumeUrl(e.target.value)}
                  placeholder="https://drive.google.com/your-resume.pdf"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                Skills (comma-separated) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={skillsInput}
                onChange={e => setSkillsInput(e.target.value)}
                placeholder="React, TypeScript, Java, Node.js"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-xl transition-colors disabled:opacity-50 shadow-sm"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Application
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
