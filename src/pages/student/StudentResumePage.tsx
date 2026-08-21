import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyResumeApi, uploadResumeApi, deleteMyResumeApi } from '../../api/client';
import { ResumeAnalysisResponse } from '../../types';
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  TrendingUp,
  Award,
  BookOpen,
  Briefcase,
  Code,
  ArrowRight,
  RefreshCw,
  Trash2,
  AlertCircle,
  Zap,
} from 'lucide-react';

export const StudentResumePage: React.FC = () => {
  const [resumeData, setResumeData] = useState<ResumeAnalysisResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form states for manual/paste or file simulation
  const [pastedText, setPastedText] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  useEffect(() => {
    fetchResumeAnalysis();
  }, []);

  const fetchResumeAnalysis = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getMyResumeApi();
      if (res.success && res.data) {
        setResumeData(res.data);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load resume analysis');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeSubmit = async (customContent?: string, fileNameOverride?: string) => {
    try {
      setUploading(true);
      setError(null);
      setSuccessMsg(null);

      const contentToUpload = customContent || pastedText || 'Java Developer Resume. Skills: Java, Spring Boot, React, MongoDB, REST APIs, Git. Experience: Full-stack projects and backend microservices.';
      const fname = fileNameOverride || selectedFileName || 'student_resume.pdf';

      const res = await uploadResumeApi({
        fileName: fname,
        fileType: 'application/pdf',
        fileSize: 2048,
        contentText: contentToUpload,
      });

      if (res.success && res.data) {
        setResumeData(res.data);
        setSuccessMsg('Resume parsed successfully! Skills and profile updated.');
        setPastedText('');
        setSelectedFileName(null);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to analyze resume');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        handleAnalyzeSubmit(text, file.name);
      };
      reader.readAsText(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        handleAnalyzeSubmit(text, file.name);
      };
      reader.readAsText(file);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete your resume analysis?')) return;
    try {
      setLoading(true);
      await deleteMyResumeApi();
      setResumeData(null);
      setSuccessMsg('Resume analysis removed.');
    } catch (err: any) {
      setError('Failed to delete resume analysis.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
          <p className="text-sm font-semibold text-slate-600">Analyzing Resume & Skill Gap Profiles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-200 border border-indigo-400/30 text-xs font-bold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5 text-indigo-300" /> AI Resume Intelligence
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            AI Resume Analyzer & Skill Gap Studio
          </h1>
          <p className="text-indigo-200 text-sm leading-relaxed">
            Upload your resume to extract skills, calculate your resume readiness score, uncover hidden skill gaps, and instantly boost your AI Internship Recommendation matches.
          </p>
        </div>
      </div>

      {/* Alert Notifications */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-center gap-3 text-red-800 text-sm font-medium">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-emerald-800 text-sm font-medium">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Upload & Analysis Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Upload & Quick Actions */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-indigo-600" /> Upload Resume
              </h2>
              <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                PDF / DOCX / TEXT
              </span>
            </div>

            {/* Drag & Drop Zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer relative ${
                dragActive
                  ? 'border-indigo-600 bg-indigo-50/50'
                  : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50/50'
              }`}
            >
              <input
                type="file"
                accept=".pdf,.docx,.doc,.txt"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    {selectedFileName || 'Click to browse or drop your resume file'}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">Supports PDF, DOCX, or plain text up to 10MB</p>
                </div>
              </div>
            </div>

            {/* Quick Sample Presets or Paste text */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-700 block">
                Or Paste Resume Content / Skills Text:
              </label>
              <textarea
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="Paste your skills, experience, or raw resume text here..."
                rows={4}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
              />
            </div>

            {/* Submit Button */}
            <button
              onClick={() => handleAnalyzeSubmit()}
              disabled={uploading}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Extracting & Analyzing...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" /> Run AI Resume Analysis
                </>
              )}
            </button>

            {/* Sample Preset Shortcut */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Try a sample tech profile:</span>
              <button
                onClick={() => handleAnalyzeSubmit('Senior Java Backend Developer Resume. Skills: Java 17, Spring Boot, Microservices, PostgreSQL, MongoDB, Redis, Docker, AWS, JUnit, Git. B.Tech Computer Science, GPA 3.9.', 'Sample_Java_Backend_Resume.pdf')}
                className="text-indigo-600 font-extrabold hover:underline"
              >
                Load Sample Resume
              </button>
            </div>
          </div>

          {/* Internship Impact Widget */}
          {resumeData && (
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl border border-indigo-100 p-6 space-y-4 shadow-sm">
              <div className="flex items-center gap-2 text-indigo-900 font-bold text-base">
                <TrendingUp className="w-5 h-5 text-indigo-600" /> Internship Impact Summary
              </div>
              <p className="text-xs text-indigo-800 leading-relaxed">
                Your current resume technical profile matches <strong className="text-indigo-950 font-black">{resumeData.matchingInternshipsCount} open internships</strong>.
              </p>
              {resumeData.potentialUnlockedInternshipsCount > 0 && (
                <div className="bg-white/80 rounded-2xl p-3.5 border border-indigo-100/80 text-xs text-slate-700 space-y-1">
                  <span className="font-extrabold text-indigo-700 block flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> Potential Opportunity Multiplier:
                  </span>
                  <p>
                    Addressing top missing skills ({resumeData.missingSkills.slice(0, 2).join(', ')}) could unlock <strong className="text-emerald-700 font-black">+{resumeData.potentialUnlockedInternshipsCount} additional matching postings</strong>!
                  </p>
                </div>
              )}
              <Link
                to="/recommendations"
                className="inline-flex items-center gap-2 text-xs font-extrabold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2.5 rounded-xl transition-all shadow-sm"
              >
                View Recommended Postings <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>

        {/* Right Column: Score Breakdown & Detailed Analytics */}
        <div className="lg:col-span-7 space-y-6">
          {resumeData ? (
            <>
              {/* Overall Score Card */}
              <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-2 text-center md:text-left">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Overall Resume Readiness Score
                  </span>
                  <h3 className="text-2xl font-black text-slate-900">
                    {resumeData.resumeScore >= 80 ? 'Exceptional Tech Profile' : resumeData.resumeScore >= 65 ? 'Competitive Profile' : 'Needs Enhancement'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Extracted from <span className="font-bold text-slate-700">{resumeData.fileName}</span>
                  </p>
                </div>

                {/* Circular / Badge Score */}
                <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 border border-slate-200/80 shrink-0 w-36">
                  <span className={`text-4xl font-black ${
                    resumeData.resumeScore >= 80 ? 'text-emerald-600' : resumeData.resumeScore >= 65 ? 'text-indigo-600' : 'text-amber-600'
                  }`}>
                    {resumeData.resumeScore}
                  </span>
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mt-1">
                    OUT OF 100
                  </span>
                </div>
              </div>

              {/* Sub-Score Breakdown Grid */}
              <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-5">
                <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
                  Detailed Resume Breakdown
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: 'Technical Skills', score: resumeData.scoreBreakdown?.skillsScore || 85, icon: Code },
                    { label: 'Projects & Implementations', score: resumeData.scoreBreakdown?.projectsScore || 80, icon: BookOpen },
                    { label: 'Experience & Internships', score: resumeData.scoreBreakdown?.experienceScore || 75, icon: Briefcase },
                    { label: 'Education & Academics', score: resumeData.scoreBreakdown?.educationScore || 90, icon: Award },
                    { label: 'Certifications', score: resumeData.scoreBreakdown?.certificationsScore || 70, icon: Sparkles },
                    { label: 'Completeness & Formatting', score: resumeData.scoreBreakdown?.completenessScore || 85, icon: CheckCircle2 },
                  ].map((item, idx) => {
                    const ItemIcon = item.icon;
                    return (
                      <div key={idx} className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                            <ItemIcon className="w-4 h-4 text-indigo-600" /> {item.label}
                          </span>
                          <span className="text-xs font-black text-slate-900">{item.score}%</span>
                        </div>
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              item.score >= 80 ? 'bg-emerald-500' : item.score >= 65 ? 'bg-indigo-600' : 'bg-amber-500'
                            }`}
                            style={{ width: `${item.score}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Extracted Skills vs Skill Gap Analysis */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Extracted Skills */}
                <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Detected Resume Skills</h4>
                      <p className="text-[10px] text-slate-400">Extracted from text parsing</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {resumeData.extractedSkills.map((s, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-1">
                        ✓ {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Missing Skills Gap */}
                <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-amber-600" />
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">In-Demand Skill Gaps</h4>
                        <p className="text-[10px] text-slate-400">Required by open internships</p>
                      </div>
                    </div>

                    <Link
                      to="/skill-roadmap"
                      className="text-xs font-black text-indigo-600 hover:text-indigo-800 flex items-center gap-1 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100"
                    >
                      Skill Roadmap →
                    </Link>
                  </div>
                  {resumeData.missingSkills.length === 0 ? (
                    <p className="text-xs text-slate-500">No major skill gaps detected!</p>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-1.5">
                        {resumeData.missingSkills.map((s, idx) => (
                          <span key={idx} className="px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold flex items-center gap-1">
                            ⚠ {s}
                          </span>
                        ))}
                      </div>
                      <Link
                        to="/skill-roadmap"
                        className="inline-flex items-center gap-1 text-xs font-extrabold text-indigo-600 hover:underline pt-1"
                      >
                        Bridge these skill gaps with a personalized 4-week learning roadmap →
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {/* Extracted Projects & Education */}
              <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-5">
                <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
                  Extracted Profile Highlights
                </h3>

                <div className="space-y-4">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Education Summary
                    </span>
                    <p className="text-xs font-semibold text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                      {resumeData.educationSummary}
                    </p>
                  </div>

                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Detected Technical Projects
                    </span>
                    <ul className="space-y-1.5">
                      {resumeData.extractedProjects.map((p, idx) => (
                        <li key={idx} className="text-xs text-slate-700 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200/60 flex items-center gap-2">
                          <Code className="w-3.5 h-3.5 text-indigo-600 shrink-0" /> {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Actionable Recommendations for Improvement */}
              <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Sparkles className="w-5 h-5 text-indigo-600" /> How To Improve Your Resume
                </h3>
                <ul className="space-y-2.5">
                  {resumeData.improvements.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                      <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center shrink-0 text-[10px]">
                        {idx + 1}
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Delete Resume Action */}
              <div className="flex justify-end pt-2">
                <button
                  onClick={handleDelete}
                  className="text-xs font-bold text-red-600 hover:text-red-800 flex items-center gap-1 hover:underline"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Remove Resume Analysis
                </button>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-12 text-center space-y-4 shadow-sm">
              <div className="w-16 h-16 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                <FileText className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No Resume Uploaded Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Upload your resume in PDF/DOCX format or paste content on the left to generate your AI Resume Health Score and unlock customized internship matches!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
