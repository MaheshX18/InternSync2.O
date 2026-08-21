import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Briefcase, Building2, Calendar, DollarSign, Clock } from 'lucide-react';
import { InternshipSummary } from '../../types';
import { BookmarkButton } from './BookmarkButton';
import { PostingStatusBadge } from './PostingStatusBadge';

interface InternshipCardProps {
  internship: InternshipSummary;
  showBookmark?: boolean;
  showStatus?: boolean;
  onBookmarkToggle?: (id: string, isBookmarked: boolean) => void;
  actionButtons?: React.ReactNode;
}

export const InternshipCard: React.FC<InternshipCardProps> = ({
  internship,
  showBookmark = true,
  showStatus = false,
  onBookmarkToggle,
  actionButtons,
}) => {
  const formatSalary = () => {
    if (!internship.isPaid) return 'Unpaid';
    const min = internship.stipendOrSalaryMin;
    const max = internship.stipendOrSalaryMax;
    const curr = internship.currency || 'USD';
    if (min && max) return `${curr} ${min.toLocaleString()} - ${max.toLocaleString()}`;
    if (min) return `${curr} ${min.toLocaleString()}+`;
    return 'Paid';
  };

  const formatWorkplace = (wp: string) => {
    switch (wp) {
      case 'ON_SITE':
        return 'On-site';
      case 'HYBRID':
        return 'Hybrid';
      case 'REMOTE':
        return 'Remote';
      default:
        return wp;
    }
  };

  const formatEmployment = (emp: string) => {
    switch (emp) {
      case 'INTERNSHIP':
        return 'Internship';
      case 'FULL_TIME':
        return 'Full-time';
      case 'PART_TIME':
        return 'Part-time';
      case 'CONTRACT':
        return 'Contract';
      default:
        return emp;
    }
  };

  return (
    <div
      id={`internship-card-${internship.id}`}
      className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between"
    >
      <div>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            {internship.companyLogoUrl ? (
              <img
                src={internship.companyLogoUrl}
                alt={internship.companyName}
                className="w-12 h-12 rounded-lg object-cover border border-slate-100"
              />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-lg border border-indigo-100 dark:border-indigo-900">
                <Building2 className="w-6 h-6" />
              </div>
            )}
            <div>
              <Link
                to={`/internships/${internship.id}`}
                className="font-semibold text-slate-900 dark:text-white text-lg hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors line-clamp-1"
              >
                {internship.title}
              </Link>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-sm mt-0.5">
                <span className="font-medium text-slate-800 dark:text-slate-200">{internship.companyName}</span>
                {showStatus && <PostingStatusBadge status={internship.status} />}
              </div>
            </div>
          </div>

          {showBookmark && (
            <BookmarkButton
              internshipId={internship.id}
              initialBookmarked={internship.isBookmarked}
              onToggle={(newState) => onBookmarkToggle?.(internship.id, newState)}
            />
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-2 gap-x-4 mt-4 text-xs text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="truncate">{internship.location}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Briefcase className="w-4 h-4 text-slate-400 shrink-0" />
            <span>{formatWorkplace(internship.workplaceType)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-slate-400 shrink-0" />
            <span>{formatEmployment(internship.employmentType)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-emerald-500 shrink-0" />
            <span className="font-medium text-slate-800 dark:text-slate-200">{formatSalary()}</span>
          </div>
          {internship.applicationDeadline && (
            <div className="flex items-center gap-1.5 col-span-2 sm:col-span-1">
              <Calendar className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Deadline: {new Date(internship.applicationDeadline).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        {internship.requiredSkills && internship.requiredSkills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4">
            {internship.requiredSkills.slice(0, 4).map((skill, idx) => (
              <span
                key={idx}
                className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                {skill}
              </span>
            ))}
            {internship.requiredSkills.length > 4 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs text-slate-500">
                +{internship.requiredSkills.length - 4} more
              </span>
            )}
          </div>
        )}
      </div>

      <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <span className="text-xs text-slate-400">
          Posted {new Date(internship.createdAt).toLocaleDateString()}
        </span>

        <div className="flex items-center gap-2">
          {actionButtons ? (
            actionButtons
          ) : (
            <Link
              id={`view-details-${internship.id}`}
              to={`/internships/${internship.id}`}
              className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:text-indigo-400 dark:hover:bg-indigo-900/50 transition-colors"
            >
              View Details
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
