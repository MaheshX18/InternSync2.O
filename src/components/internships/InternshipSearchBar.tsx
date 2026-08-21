import React, { useState } from 'react';
import { Search, MapPin, X } from 'lucide-react';

interface InternshipSearchBarProps {
  initialSearch?: string;
  initialLocation?: string;
  onSearch: (search: string, location: string) => void;
}

export const InternshipSearchBar: React.FC<InternshipSearchBarProps> = ({
  initialSearch = '',
  initialLocation = '',
  onSearch,
}) => {
  const [search, setSearch] = useState(initialSearch);
  const [location, setLocation] = useState(initialLocation);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(search, location);
  };

  const handleClear = () => {
    setSearch('');
    setLocation('');
    onSearch('', '');
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-xl p-2 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center gap-2">
      <div className="relative flex-1 w-full">
        <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          id="search-title-input"
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Title, skill, or keyword..."
          className="w-full pl-10 pr-4 py-2 text-sm bg-transparent border-none text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-0"
        />
      </div>

      <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 hidden md:block" />

      <div className="relative flex-1 w-full">
        <MapPin className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          id="search-location-input"
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="City, state, or remote..."
          className="w-full pl-10 pr-4 py-2 text-sm bg-transparent border-none text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-0"
        />
      </div>

      <div className="flex items-center gap-2 w-full md:w-auto">
        {(search || location) && (
          <button
            type="button"
            onClick={handleClear}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"
            title="Clear search"
          >
            <X className="w-5 h-5" />
          </button>
        )}
        <button
          id="search-submit-btn"
          type="submit"
          className="w-full md:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-lg transition-colors"
        >
          Search
        </button>
      </div>
    </form>
  );
};
