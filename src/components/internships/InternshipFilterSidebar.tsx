import React from 'react';
import { WorkplaceType, EmploymentType } from '../../types';
import { Filter, RotateCcw } from 'lucide-react';

export interface FilterState {
  workplaceType?: WorkplaceType;
  employmentType?: EmploymentType;
  isPaid?: boolean;
  minSalary?: number;
  maxSalary?: number;
}

interface InternshipFilterSidebarProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onReset: () => void;
}

export const InternshipFilterSidebar: React.FC<InternshipFilterSidebarProps> = ({
  filters,
  onChange,
  onReset,
}) => {
  const handleWorkplaceChange = (wp?: WorkplaceType) => {
    onChange({ ...filters, workplaceType: filters.workplaceType === wp ? undefined : wp });
  };

  const handleEmploymentChange = (emp?: EmploymentType) => {
    onChange({ ...filters, employmentType: filters.employmentType === emp ? undefined : emp });
  };

  const handlePaidChange = (isPaid?: boolean) => {
    onChange({ ...filters, isPaid: filters.isPaid === isPaid ? undefined : isPaid });
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white text-base">
          <Filter className="w-4 h-4 text-indigo-600" />
          <span>Filters</span>
        </div>
        <button
          id="reset-filters-btn"
          type="button"
          onClick={onReset}
          className="text-xs text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 font-medium flex items-center gap-1"
        >
          <RotateCcw className="w-3 h-3" />
          Reset
        </button>
      </div>

      {/* Workplace Type */}
      <div>
        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5">
          Workplace Type
        </h4>
        <div className="space-y-1.5">
          {[
            { id: 'REMOTE', label: 'Remote' },
            { id: 'HYBRID', label: 'Hybrid' },
            { id: 'ON_SITE', label: 'On-site' },
          ].map((item) => (
            <label
              key={item.id}
              className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer hover:text-indigo-600"
            >
              <input
                type="checkbox"
                checked={filters.workplaceType === item.id}
                onChange={() => handleWorkplaceChange(item.id as WorkplaceType)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>{item.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Employment Type */}
      <div>
        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5">
          Employment Type
        </h4>
        <div className="space-y-1.5">
          {[
            { id: 'INTERNSHIP', label: 'Internship' },
            { id: 'FULL_TIME', label: 'Full-time' },
            { id: 'PART_TIME', label: 'Part-time' },
            { id: 'CONTRACT', label: 'Contract' },
          ].map((item) => (
            <label
              key={item.id}
              className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer hover:text-indigo-600"
            >
              <input
                type="checkbox"
                checked={filters.employmentType === item.id}
                onChange={() => handleEmploymentChange(item.id as EmploymentType)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>{item.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Compensation */}
      <div>
        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5">
          Compensation
        </h4>
        <div className="space-y-1.5">
          <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer hover:text-indigo-600">
            <input
              type="checkbox"
              checked={filters.isPaid === true}
              onChange={() => handlePaidChange(true)}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span>Paid Only</span>
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer hover:text-indigo-600">
            <input
              type="checkbox"
              checked={filters.isPaid === false}
              onChange={() => handlePaidChange(false)}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span>Unpaid</span>
          </label>
        </div>
      </div>
    </div>
  );
};
