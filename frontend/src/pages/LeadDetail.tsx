import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchLeadById, clearCurrentLead } from '../store/slices/leadSlice';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorAlert from '../components/ui/ErrorAlert';
import { STATUS_COLORS } from '../utils/constants';

const LeadDetail = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { currentLead, detailLoading, error } = useAppSelector((state) => state.leads);

  useEffect(() => {
    if (id) dispatch(fetchLeadById(id));
    return () => {
      dispatch(clearCurrentLead());
    };
  }, [id, dispatch]);

  if (detailLoading) return <LoadingSpinner label="Loading lead details..." />;
  if (error) return <ErrorAlert message={error} />;
  if (!currentLead) return null;

  return (
    <div className="max-w-2xl">
      <Link
        to="/"
        className="text-brand-600 hover:underline font-medium mb-4 inline-block"
      >
        ← Back to dashboard
      </Link>

      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow border border-gray-200 dark:border-gray-700 p-8">
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {currentLead.name}
          </h1>
          <span
            className={`px-3 py-1 rounded-full text-sm font-semibold ${STATUS_COLORS[currentLead.status]}`}
          >
            {currentLead.status}
          </span>
        </div>

        <dl className="space-y-4">
          <div>
            <dt className="text-sm font-semibold text-gray-500 dark:text-gray-400">Email</dt>
            <dd className="text-lg text-gray-900 dark:text-white">{currentLead.email}</dd>
          </div>
          <div>
            <dt className="text-sm font-semibold text-gray-500 dark:text-gray-400">Source</dt>
            <dd className="text-lg text-gray-900 dark:text-white">{currentLead.source}</dd>
          </div>
          <div>
            <dt className="text-sm font-semibold text-gray-500 dark:text-gray-400">Created</dt>
            <dd className="text-lg text-gray-900 dark:text-white">
              {new Date(currentLead.createdAt).toLocaleString()}
            </dd>
          </div>
          {currentLead.createdBy && (
            <div>
              <dt className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                Created By
              </dt>
              <dd className="text-lg text-gray-900 dark:text-white">
                {currentLead.createdBy.name} ({currentLead.createdBy.email})
              </dd>
            </div>
          )}
        </dl>

        <Link
          to={`/leads/${currentLead.id}/edit`}
          className="mt-8 inline-block px-5 py-2 bg-brand-600 text-white rounded-xl hover:bg-brand-700 font-semibold"
        >
          Edit Lead
        </Link>
      </div>
    </div>
  );
};

export default LeadDetail;
