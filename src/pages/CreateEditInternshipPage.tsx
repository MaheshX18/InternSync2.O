import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { createInternship, getCompanyInternshipById, updateInternship } from '../api/internships';
import { WorkplaceType, EmploymentType, ExperienceLevel } from '../types';
import { ArrowLeft, Loader2, Plus, X } from 'lucide-react';

export const CreateEditInternshipPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [loading, setLoading] = useState<boolean>(isEdit);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState<string[]>(['']);
  const [responsibilities, setResponsibilities] = useState<string[]>(['']);
  const [requiredSkills, setRequiredSkills] = useState<string[]>(['']);
  const [location, setLocation] = useState('');
  const [workplaceType, setWorkplaceType] = useState<WorkplaceType>('HYBRID');
  const [employmentType, setEmploymentType] = useState<EmploymentType>('INTERNSHIP');
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>('ENTRY_LEVEL');
  const [stipendOrSalaryMin, setStipendOrSalaryMin] = useState<number | ''>('');
  const [stipendOrSalaryMax, setStipendOrSalaryMax] = useState<number | ''>('');
  const [currency, setCurrency] = useState('USD');
  const [isPaid, setIsPaid] = useState<boolean>(true);
  const [positionsAvailable, setPositionsAvailable] = useState<number>(1);
  const [applicationDeadline, setApplicationDeadline] = useState('');
  const [publishImmediately, setPublishImmediately] = useState<boolean>(true);

  // New Fields
  const [duration, setDuration] = useState('');
  const [minCgpa, setMinCgpa] = useState<number | ''>('');
  const [allowedDepartments, setAllowedDepartments] = useState('');
  const [maxBacklogs, setMaxBacklogs] = useState<number | ''>('');
  const [passingYear, setPassingYear] = useState('');

  useEffect(() => {
    if (isEdit && id) {
      const fetchDetails = async () => {
        try {
          setLoading(true);
          const data = await getCompanyInternshipById(id);
          setTitle(data.title);
          setDescription(data.description);
          setRequirements(data.requirements?.length ? data.requirements : ['']);
          setResponsibilities(data.responsibilities?.length ? data.responsibilities : ['']);
          setRequiredSkills(data.requiredSkills?.length ? data.requiredSkills : ['']);
          setLocation(data.location);
          setWorkplaceType(data.workplaceType);
          setEmploymentType(data.employmentType);
          setExperienceLevel(data.experienceLevel);
          setStipendOrSalaryMin(data.stipendOrSalaryMin ?? '');
          setStipendOrSalaryMax(data.stipendOrSalaryMax ?? '');
          setCurrency(data.currency || 'USD');
          setIsPaid(data.isPaid);
          setPositionsAvailable(data.positionsAvailable || 1);
          if (data.applicationDeadline) {
            setApplicationDeadline(data.applicationDeadline.split('T')[0]);
          }
          setDuration(data.duration || '');
          if (data.eligibilityCriteria) {
            setMinCgpa(data.eligibilityCriteria.minCgpa ?? '');
            setAllowedDepartments(data.eligibilityCriteria.allowedDepartments?.join(', ') || '');
            setMaxBacklogs(data.eligibilityCriteria.maxBacklogs ?? '');
            setPassingYear(data.eligibilityCriteria.passingYear || '');
          }
        } catch (err: any) {
          setError(err.response?.data?.message || 'Failed to load internship details.');
        } finally {
          setLoading(false);
        }
      };
      fetchDetails();
    }
  }, [id, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const filteredReqs = requirements.map((r) => r.trim()).filter(Boolean);
    const filteredResps = responsibilities.map((r) => r.trim()).filter(Boolean);
    const filteredSkills = requiredSkills.map((s) => s.trim()).filter(Boolean);

    if (filteredReqs.length === 0) {
      setError('At least one requirement is required.');
      return;
    }

    if (filteredSkills.length === 0) {
      setError('At least one required skill is required.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        title,
        description,
        requirements: filteredReqs,
        responsibilities: filteredResps,
        requiredSkills: filteredSkills,
        location,
        workplaceType,
        employmentType,
        experienceLevel,
        stipendOrSalaryMin: stipendOrSalaryMin !== '' ? Number(stipendOrSalaryMin) : undefined,
        stipendOrSalaryMax: stipendOrSalaryMax !== '' ? Number(stipendOrSalaryMax) : undefined,
        currency,
        isPaid,
        positionsAvailable,
        applicationDeadline: applicationDeadline ? new Date(applicationDeadline).toISOString() : undefined,
        duration: duration.trim() || undefined,
        eligibilityCriteria: {
          minCgpa: minCgpa !== '' ? Number(minCgpa) : undefined,
          allowedDepartments: allowedDepartments.trim() ? allowedDepartments.split(',').map(d => d.trim()) : undefined,
          maxBacklogs: maxBacklogs !== '' ? Number(maxBacklogs) : undefined,
          passingYear: passingYear.trim() || undefined
        }
      };

      if (isEdit && id) {
        await updateInternship(id, payload);
      } else {
        await createInternship({
          ...payload,
          publishImmediately,
        });
      }

      navigate('/company/internships');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save internship posting.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div id="create-edit-posting-page" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Link
        to="/company/internships"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-indigo-600"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to postings
      </Link>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          {isEdit ? 'Edit Internship Posting' : 'Create New Internship Posting'}
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
          Fill out the details below to recruit top talent for your organization.
        </p>

        {error && (
          <div className="mt-4 p-4 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          {/* Title & Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                Job Title *
              </label>
              <input
                id="posting-title-input"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Software Engineering Intern"
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                Location *
              </label>
              <input
                id="posting-location-input"
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. San Francisco, CA or Remote"
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Types */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                Workplace Type *
              </label>
              <select
                id="posting-workplace-select"
                value={workplaceType}
                onChange={(e) => setWorkplaceType(e.target.value as WorkplaceType)}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ON_SITE">On-site</option>
                <option value="HYBRID">Hybrid</option>
                <option value="REMOTE">Remote</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                Employment Type *
              </label>
              <select
                id="posting-employment-select"
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value as EmploymentType)}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="INTERNSHIP">Internship</option>
                <option value="FULL_TIME">Full-time</option>
                <option value="PART_TIME">Part-time</option>
                <option value="CONTRACT">Contract</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                Experience Level
              </label>
              <select
                id="posting-experience-select"
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value as ExperienceLevel)}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ENTRY_LEVEL">Entry Level</option>
                <option value="JUNIOR">Junior</option>
                <option value="MID_LEVEL">Mid Level</option>
              </select>
            </div>
          </div>

          {/* Compensation */}
          <div className="space-y-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-800 dark:text-slate-200 cursor-pointer">
                <input
                  id="posting-ispaid-checkbox"
                  type="checkbox"
                  checked={isPaid}
                  onChange={(e) => setIsPaid(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                This is a paid position
              </label>
            </div>

            {isPaid && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                    Min Compensation ($)
                  </label>
                  <input
                    id="posting-salary-min"
                    type="number"
                    min="0"
                    value={stipendOrSalaryMin}
                    onChange={(e) => setStipendOrSalaryMin(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="e.g. 2000"
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                    Max Compensation ($)
                  </label>
                  <input
                    id="posting-salary-max"
                    type="number"
                    min="0"
                    value={stipendOrSalaryMax}
                    onChange={(e) => setStipendOrSalaryMax(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="e.g. 4000"
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                    Currency
                  </label>
                  <input
                    type="text"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    placeholder="USD"
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
              Description *
            </label>
            <textarea
              id="posting-description-input"
              required
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide an overview of the role, team, and company culture..."
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Requirements List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Requirements *
              </label>
              <button
                type="button"
                onClick={() => setRequirements([...requirements, ''])}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Requirement
              </button>
            </div>
            <div className="space-y-2">
              {requirements.map((req, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={req}
                    onChange={(e) => {
                      const updated = [...requirements];
                      updated[idx] = e.target.value;
                      setRequirements(updated);
                    }}
                    placeholder={`Requirement #${idx + 1}`}
                    className="flex-1 px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  />
                  {requirements.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setRequirements(requirements.filter((_, i) => i !== idx))}
                      className="p-2 text-slate-400 hover:text-rose-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Required Skills */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Required Skills *
              </label>
              <button
                type="button"
                onClick={() => setRequiredSkills([...requiredSkills, ''])}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Skill
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {requiredSkills.map((skill, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={skill}
                    onChange={(e) => {
                      const updated = [...requiredSkills];
                      updated[idx] = e.target.value;
                      setRequiredSkills(updated);
                    }}
                    placeholder="e.g. Java, React, SQL"
                    className="flex-1 px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  />
                  {requiredSkills.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setRequiredSkills(requiredSkills.filter((_, i) => i !== idx))}
                      className="p-2 text-slate-400 hover:text-rose-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Eligibility Criteria & Duration */}
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4">Eligibility Criteria & Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                  Duration
                </label>
                <input
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="e.g. 6 Months"
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                  Minimum CGPA
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={minCgpa}
                  onChange={(e) => setMinCgpa(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="e.g. 7.5"
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                  Allowed Departments (comma separated)
                </label>
                <input
                  type="text"
                  value={allowedDepartments}
                  onChange={(e) => setAllowedDepartments(e.target.value)}
                  placeholder="e.g. Computer Science, Information Technology"
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                  Target Passing Year (Batch)
                </label>
                <input
                  type="text"
                  value={passingYear}
                  onChange={(e) => setPassingYear(e.target.value)}
                  placeholder="e.g. 2026"
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                  Maximum Backlogs Allowed
                </label>
                <input
                  type="number"
                  min="0"
                  value={maxBacklogs}
                  onChange={(e) => setMaxBacklogs(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="e.g. 0"
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Deadline & Positions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                Application Deadline
              </label>
              <input
                id="posting-deadline-input"
                type="date"
                value={applicationDeadline}
                onChange={(e) => setApplicationDeadline(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                Positions Available
              </label>
              <input
                type="number"
                min="1"
                value={positionsAvailable}
                onChange={(e) => setPositionsAvailable(Number(e.target.value))}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {!isEdit && (
            <div className="pt-2">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-800 dark:text-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={publishImmediately}
                  onChange={(e) => setPublishImmediately(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                Publish immediately upon saving (uncheck to save as Draft)
              </label>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-200 dark:border-slate-800">
            <Link
              to="/company/internships"
              className="px-4 py-2.5 text-sm font-medium rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Cancel
            </Link>
            <button
              id="save-posting-btn"
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-lg transition-colors disabled:opacity-50"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {isEdit ? 'Update Posting' : 'Save Posting'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
