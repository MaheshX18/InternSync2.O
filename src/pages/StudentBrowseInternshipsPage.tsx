import React, { useEffect, useState } from 'react';
import { getPublicInternships } from '../api/internships';
import { InternshipSummary, PagedResponse, WorkplaceType, EmploymentType } from '../types';
import { InternshipCard } from '../components/internships/InternshipCard';
import { InternshipSearchBar } from '../components/internships/InternshipSearchBar';
import { InternshipFilterSidebar, FilterState } from '../components/internships/InternshipFilterSidebar';
import { Loader2, ArrowUpDown, Frown } from 'lucide-react';

export const StudentBrowseInternshipsPage: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<PagedResponse<InternshipSummary> | null>(null);
  const [search, setSearch] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [filters, setFilters] = useState<FilterState>({});
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortDir, setSortDir] = useState<string>('DESC');
  const [page, setPage] = useState<number>(0);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getPublicInternships({
        search: search || undefined,
        location: location || undefined,
        workplaceType: filters.workplaceType,
        employmentType: filters.employmentType,
        isPaid: filters.isPaid,
        minSalary: filters.minSalary,
        maxSalary: filters.maxSalary,
        page,
        size: 9,
        sortBy,
        sortDir,
      });
      setData(res);
    } catch (err) {
      console.error('Failed to fetch public internships', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, location, filters, sortBy, sortDir, page]);

  const handleSearch = (newSearch: string, newLocation: string) => {
    setSearch(newSearch);
    setLocation(newLocation);
    setPage(0);
  };

  const handleBookmarkToggle = (id: string, isBookmarked: boolean) => {
    if (data) {
      setData({
        ...data,
        content: data.content.map((item) =>
          item.id === id ? { ...item, isBookmarked } : item
        ),
      });
    }
  };

  return (
    <div id="student-browse-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Explore Internships & Jobs</h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
          Discover opportunities matching your skills and start building your career.
        </p>
      </div>

      <InternshipSearchBar
        initialSearch={search}
        initialLocation={location}
        onSearch={handleSearch}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        <div className="lg:col-span-1">
          <InternshipFilterSidebar
            filters={filters}
            onChange={(newFilters) => {
              setFilters(newFilters);
              setPage(0);
            }}
            onReset={() => {
              setFilters({});
              setPage(0);
            }}
          />
        </div>

        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800 text-sm">
            <span className="text-slate-600 dark:text-slate-400">
              Showing <strong className="text-slate-900 dark:text-white">{data?.totalElements || 0}</strong> positions
            </span>

            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-slate-400" />
              <select
                id="sort-select"
                value={`${sortBy}-${sortDir}`}
                onChange={(e) => {
                  const [b, d] = e.target.value.split('-');
                  setSortBy(b);
                  setSortDir(d);
                  setPage(0);
                }}
                className="bg-transparent border-none text-slate-700 dark:text-slate-300 font-medium focus:ring-0 text-sm py-0 cursor-pointer"
              >
                <option value="createdAt-DESC">Most Recent</option>
                <option value="createdAt-ASC">Oldest First</option>
                <option value="stipendOrSalaryMin-DESC">Highest Paid</option>
                <option value="title-ASC">Title (A-Z)</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            </div>
          ) : !data || data.content.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center">
              <Frown className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">No internships found</h3>
              <p className="text-sm text-slate-500 mt-1">
                Try adjusting your search query or filters to discover more opportunities.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.content.map((item) => (
                <InternshipCard
                  key={item.id}
                  internship={item}
                  onBookmarkToggle={handleBookmarkToggle}
                />
              ))}
            </div>
          )}

          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-4 mt-6">
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
      </div>
    </div>
  );
};
