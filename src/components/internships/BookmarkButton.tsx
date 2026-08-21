import React, { useState } from 'react';
import { Bookmark } from 'lucide-react';
import { toggleBookmark } from '../../api/internships';

interface BookmarkButtonProps {
  internshipId: string;
  initialBookmarked?: boolean;
  onToggle?: (isBookmarked: boolean) => void;
  className?: string;
}

export const BookmarkButton: React.FC<BookmarkButtonProps> = ({
  internshipId,
  initialBookmarked = false,
  onToggle,
  className = '',
}) => {
  const [isBookmarked, setIsBookmarked] = useState<boolean>(initialBookmarked);
  const [loading, setLoading] = useState<boolean>(false);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;

    try {
      setLoading(true);
      const updatedState = await toggleBookmark(internshipId);
      setIsBookmarked(updatedState);
      if (onToggle) onToggle(updatedState);
    } catch (err) {
      console.error('Failed to toggle bookmark', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      id={`bookmark-btn-${internshipId}`}
      type="button"
      onClick={handleClick}
      disabled={loading}
      aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark internship'}
      className={`p-2 rounded-full transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 ${
        isBookmarked ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 hover:text-slate-600'
      } ${className}`}
    >
      <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
    </button>
  );
};
