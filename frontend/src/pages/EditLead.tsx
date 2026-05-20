import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchLeadById, updateLead, clearCurrentLead } from '../store/slices/leadSlice';
import LeadForm from '../components/leads/LeadForm';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorAlert from '../components/ui/ErrorAlert';
import type { LeadSource, LeadStatus } from '../types';

const EditLead = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { currentLead, detailLoading } = useAppSelector((state) => state.leads);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) dispatch(fetchLeadById(id));
    return () => {
      dispatch(clearCurrentLead());
    };
  }, [id, dispatch]);

  const handleSubmit = async (data: {
    name: string;
    email: string;
    status: LeadStatus;
    source: LeadSource;
  }) => {
    if (!id) return;
    setLoading(true);
    setError(null);
    const result = await dispatch(updateLead({ id, data }));
    setLoading(false);
    if (updateLead.fulfilled.match(result)) {
      navigate(`/leads/${id}`);
    } else {
      setError(result.payload as string);
    }
  };

  if (detailLoading) return <LoadingSpinner />;
  if (!currentLead) return null;

  return (
    <div className="max-w-lg">
      <Link
        to={`/leads/${id}`}
        className="text-brand-600 hover:underline font-medium mb-4 inline-block"
      >
        ← Back to lead
      </Link>
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow border border-gray-200 dark:border-gray-700 p-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Edit Lead</h1>
        {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}
        <LeadForm
          initial={currentLead}
          onSubmit={handleSubmit}
          loading={loading}
          submitLabel="Update Lead"
        />
      </div>
    </div>
  );
};

export default EditLead;
