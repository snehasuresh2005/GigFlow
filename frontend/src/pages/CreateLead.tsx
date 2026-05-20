import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../store/hooks';
import { createLead } from '../store/slices/leadSlice';
import LeadForm from '../components/leads/LeadForm';
import ErrorAlert from '../components/ui/ErrorAlert';
import type { LeadSource, LeadStatus } from '../types';

const CreateLead = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: {
    name: string;
    email: string;
    status: LeadStatus;
    source: LeadSource;
  }) => {
    setLoading(true);
    setError(null);
    const result = await dispatch(createLead(data));
    setLoading(false);
    if (createLead.fulfilled.match(result)) {
      navigate('/');
    } else {
      setError(result.payload as string);
    }
  };

  return (
    <div className="max-w-lg">
      <Link to="/" className="text-brand-600 hover:underline font-medium mb-4 inline-block">
        ← Back to dashboard
      </Link>
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow border border-gray-200 dark:border-gray-700 p-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Add New Lead</h1>
        {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}
        <LeadForm onSubmit={handleSubmit} loading={loading} submitLabel="Create Lead" />
      </div>
    </div>
  );
};

export default CreateLead;
