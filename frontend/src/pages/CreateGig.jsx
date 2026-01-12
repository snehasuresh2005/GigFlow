import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createGig, clearError } from '../store/slices/gigSlice';
import BackButton from '../components/BackButton';

const CreateGig = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budget: ''
  });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.gigs);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(createGig({
      ...formData,
      budget: parseFloat(formData.budget)
    }));
    
    if (createGig.fulfilled.match(result)) {
      navigate('/');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <BackButton />
      <div className="bg-white rounded-3xl shadow-lg p-8 border border-purple-100">
        <h2 className="text-4xl font-black text-gray-900 mb-6 uppercase tracking-tight">
          Post a New Gig
        </h2>
        
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-2xl font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label htmlFor="title" className="block text-gray-700 mb-2 font-bold">
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-5 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 shadow-sm"
            />
          </div>

          <div className="mb-5">
            <label htmlFor="description" className="block text-gray-700 mb-2 font-bold">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={6}
              className="w-full px-5 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 shadow-sm"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="budget" className="block text-gray-700 mb-2 font-bold">
              Budget ($)
            </label>
            <input
              type="number"
              id="budget"
              name="budget"
              value={formData.budget}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className="w-full px-5 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 shadow-sm"
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3.5 bg-[#FFD700] text-gray-900 rounded-2xl hover:bg-[#FFC700] transition-all disabled:opacity-50 font-black shadow-md hover:shadow-lg"
            >
              {loading ? 'Posting...' : 'Post Gig'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-6 py-3.5 border border-gray-300 text-gray-700 rounded-2xl hover:bg-purple-50 hover:border-purple-300 transition-all font-medium shadow-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGig;
