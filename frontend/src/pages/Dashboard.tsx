import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { useDebounce } from '../hooks/useDebounce';
import {
  fetchLeads,
  setFilters,
  resetFilters,
  deleteLead,
  exportLeadsCsv,
  clearLeadError
} from '../store/slices/leadSlice';
import LeadFilters from '../components/leads/LeadFilters';
import Pagination from '../components/leads/Pagination';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import ErrorAlert from '../components/ui/ErrorAlert';
import { STATUS_COLORS } from '../utils/constants';

const Dashboard = () => {
  const dispatch = useAppDispatch();
  const { leads, pagination, filters, loading, error, exportLoading } = useAppSelector(
    (state) => state.leads
  );
  const { user } = useAppSelector((state) => state.auth);
  const [searchInput, setSearchInput] = useState(filters.search);
  const debouncedSearch = useDebounce(searchInput, 400);

  useEffect(() => {
    dispatch(setFilters({ search: debouncedSearch, page: 1 }));
  }, [debouncedSearch, dispatch]);

  useEffect(() => {
    dispatch(fetchLeads(filters));
  }, [dispatch, filters]);

  const handleFilterChange = (partial: Partial<typeof filters>) => {
    dispatch(setFilters(partial));
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete lead "${name}"?`)) return;
    await dispatch(deleteLead(id));
    dispatch(fetchLeads(filters));
  };

  const handleExport = () => {
    dispatch(exportLeadsCsv(filters));
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">GigFlow Leads</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage and filter your sales leads
          </p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleExport}
            disabled={exportLoading}
            className="px-4 py-2 border border-brand-600 text-brand-600 dark:text-brand-400 rounded-xl hover:bg-brand-50 dark:hover:bg-brand-900/30 font-medium disabled:opacity-50"
          >
            {exportLoading ? 'Exporting...' : 'Export CSV'}
          </button>
          <Link
            to="/leads/new"
            className="px-5 py-2 bg-brand-600 text-white rounded-xl hover:bg-brand-700 font-semibold shadow"
          >
            + Add Lead
          </Link>
        </div>
      </div>

      <LeadFilters
        filters={filters}
        searchInput={searchInput}
        onSearchChange={setSearchInput}
        onChange={handleFilterChange}
        onReset={() => {
          setSearchInput('');
          dispatch(resetFilters());
        }}
      />

      {error && (
        <ErrorAlert message={error} onDismiss={() => dispatch(clearLeadError())} />
      )}

      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <LoadingSpinner label="Loading leads..." />
        ) : leads.length === 0 ? (
          <EmptyState
            title="No leads found"
            description="Try adjusting your filters or add a new lead."
            action={
              <Link
                to="/leads/new"
                className="inline-block px-5 py-2 bg-brand-600 text-white rounded-xl hover:bg-brand-700 font-semibold"
              >
                Add Lead
              </Link>
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Name
                    </th>
                    <th className="px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Email
                    </th>
                    <th className="px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Status
                    </th>
                    <th className="px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Source
                    </th>
                    <th className="px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Created
                    </th>
                    <th className="px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr
                      key={lead.id}
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                        {lead.name}
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{lead.email}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[lead.status]}`}
                        >
                          {lead.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                        {lead.source}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-500">
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Link
                            to={`/leads/${lead.id}`}
                            className="text-brand-600 hover:underline text-sm font-medium"
                          >
                            View
                          </Link>
                          <Link
                            to={`/leads/${lead.id}/edit`}
                            className="text-gray-600 dark:text-gray-400 hover:underline text-sm font-medium"
                          >
                            Edit
                          </Link>
                          {user?.role === 'admin' && (
                            <button
                              type="button"
                              onClick={() => handleDelete(lead.id, lead.name)}
                              className="text-red-600 hover:underline text-sm font-medium"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {pagination && (
              <div className="px-4 pb-4">
                <Pagination
                  pagination={pagination}
                  onPageChange={(page) => handleFilterChange({ page })}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
