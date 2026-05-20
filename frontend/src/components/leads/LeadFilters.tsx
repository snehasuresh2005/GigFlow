import { LEAD_SOURCES, LEAD_STATUSES } from '../../utils/constants';
import type { LeadFilters as Filters, SortOrder } from '../../types';

interface LeadFiltersProps {
  filters: Filters;
  onChange: (partial: Partial<Filters>) => void;
  onReset: () => void;
  searchInput: string;
  onSearchChange: (value: string) => void;
}

const LeadFilters = ({
  filters,
  onChange,
  onReset,
  searchInput,
  onSearchChange
}: LeadFiltersProps) => (
  <div className="bg-white dark:bg-gray-900 rounded-2xl shadow border border-gray-200 dark:border-gray-700 p-4 mb-6">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
          Search
        </label>
        <input
          type="text"
          placeholder="Name or email..."
          value={searchInput}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
          Status
        </label>
        <select
          value={filters.status}
          onChange={(e) => onChange({ status: e.target.value, page: 1 })}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
        >
          <option value="">All statuses</option>
          {LEAD_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
          Source
        </label>
        <select
          value={filters.source}
          onChange={(e) => onChange({ source: e.target.value, page: 1 })}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
        >
          <option value="">All sources</option>
          {LEAD_SOURCES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
          Sort
        </label>
        <select
          value={filters.sort}
          onChange={(e) => onChange({ sort: e.target.value as SortOrder, page: 1 })}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
        >
          <option value="latest">Latest first</option>
          <option value="oldest">Oldest first</option>
        </select>
      </div>

      <div className="flex items-end">
        <button
          type="button"
          onClick={onReset}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium"
        >
          Reset filters
        </button>
      </div>
    </div>
  </div>
);

export default LeadFilters;
