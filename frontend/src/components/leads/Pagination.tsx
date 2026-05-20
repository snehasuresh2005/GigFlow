import type { PaginationMeta } from '../../types';

interface PaginationProps {
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
}

const Pagination = ({ pagination, onPageChange }: PaginationProps) => (
  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
    <p className="text-sm text-gray-600 dark:text-gray-400">
      Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} leads)
    </p>
    <div className="flex gap-2">
      <button
        type="button"
        disabled={!pagination.hasPrevPage}
        onClick={() => onPageChange(pagination.page - 1)}
        className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium"
      >
        Previous
      </button>
      <button
        type="button"
        disabled={!pagination.hasNextPage}
        onClick={() => onPageChange(pagination.page + 1)}
        className="px-4 py-2 rounded-xl bg-brand-600 text-white disabled:opacity-40 hover:bg-brand-700 font-medium"
      >
        Next
      </button>
    </div>
  </div>
);

export default Pagination;
