import React from 'react';
import { InternshipStatus } from '../../types';

interface PostingStatusBadgeProps {
  status: InternshipStatus;
  className?: string;
}

export const PostingStatusBadge: React.FC<PostingStatusBadgeProps> = ({ status, className = '' }) => {
  let badgeStyle = 'bg-gray-100 text-gray-800 border-gray-200';
  let label = status;

  switch (status) {
    case 'DRAFT':
      badgeStyle = 'bg-amber-50 text-amber-700 border-amber-200';
      label = 'Draft';
      break;
    case 'PUBLISHED':
      badgeStyle = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      label = 'Published';
      break;
    case 'UNPUBLISHED':
      badgeStyle = 'bg-slate-100 text-slate-700 border-slate-300';
      label = 'Unpublished';
      break;
    case 'CLOSED':
      badgeStyle = 'bg-rose-50 text-rose-700 border-rose-200';
      label = 'Closed';
      break;
    case 'REMOVED_BY_ADMIN':
      badgeStyle = 'bg-red-100 text-red-800 border-red-300';
      label = 'Removed by Admin';
      break;
  }

  return (
    <span id={`status-badge-${status}`} className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${badgeStyle} ${className}`}>
      {label}
    </span>
  );
};
