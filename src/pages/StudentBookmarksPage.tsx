import React, { useEffect, useState } from 'react';
import { getBookmarks } from '../api/internships';
import { InternshipSummary, PagedResponse } from '../types';
import { InternshipCard } from '../components/internships/InternshipCard';
import { Bookmark, Loader2, Frown } from 'lucide-react';

export const StudentBookmarksPage: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<PagedResponse<InternshipSummary> | null>(null);
  const [page, setPage] = useState<number>(0);

  const fetchBookmarks = async () => {
    try {
      setLoading(true);
      const res = await getBookmarks({ page, size: 9 });
      setData(res);
    } catch (err) {
      console.error('Failed to fetch bookmarks', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookmarks();
  }, [page]);

  const handleBookmarkToggle = (id: string, isBookmarked: boolean) => {
    if (!isBookmarked && data) {
      setData({
        ...data,
        content: data.content.filter((item) => item.id !== id),
        totalElements: data.totalElements - 1,
      });
    }
  };

  return (
    <div id="student-bookmarks-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-xl">
          <Bookmark className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Saved Internships</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            Keep track of opportunities you've bookmarked to review or apply later.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        </div>
      ) : !data || data.content.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center">
          <Frown className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">No saved internships</h3>
          <p className="text-sm text-slate-500 mt-1">
            Browse internships and click the bookmark icon to save positions here.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.content.map((item) => (
              <InternshipCard
                key={item.id}
                internship={{ ...item, isBookmarked: true }}
                onBookmarkToggle={handleBookmarkToggle}
              />
            ))}
          </div>

          {data.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-4">
              <button
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-300 dark:border-slate-700 disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Previous
              </button>
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Page {page + 1} of {data.totalPages}
              </span>
              <button
                disabled={data.last}
                onClick={() => setPage((p) => p + 1)}
                className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-300 dark:border-slate-700 disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
