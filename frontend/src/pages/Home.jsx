import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchGigs } from '../store/slices/gigSlice';

const Home = () => {
  const dispatch = useDispatch();
  const { gigs, loading } = useSelector((state) => state.gigs);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    dispatch(fetchGigs(searchQuery));
  }, [dispatch, searchQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
    dispatch(fetchGigs(searchQuery));
  };

  return (
    <div>
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-[#8A2BE2] to-[#9C4EDD] rounded-3xl p-6 md:p-12 mb-12 text-white shadow-2xl">
        <div className="max-w-3xl">
          <h1 className="text-3xl md:text-5xl font-black mb-4 uppercase tracking-tight">
            Connect With World's Best{' '}
            <span className="inline-flex items-center">
              Freelancers
              <svg className="w-8 h-8 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
            </span>
          </h1>
          <p className="text-xl text-purple-100 mb-8 font-medium">
            Find your next freelance opportunity or post a project and get bids from talented professionals
          </p>

          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
            <input
              type="text"
              placeholder="Search gigs by title or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-6 py-4 border-0 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-300 text-gray-900 shadow-lg"
            />
            <button
              type="submit"
              className="px-8 py-4 bg-[#FFD700] text-gray-900 rounded-2xl hover:bg-[#FFC700] transition-all font-bold shadow-lg hover:shadow-xl"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Gigs Grid */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600 font-medium">Loading gigs...</p>
        </div>
      ) : gigs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 font-medium">No gigs available at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gigs.map((gig) => (
            <Link
              key={gig._id}
              to={`/gig/${gig._id}`}
              className="bg-white rounded-3xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 cursor-pointer border border-purple-100 hover:border-purple-200 transform hover:-translate-y-1"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {gig.title}
              </h3>
              <p className="text-gray-600 mb-4 line-clamp-3 text-sm">
                {gig.description}
              </p>
              <div className="flex justify-between items-center mb-4">
                <span className="text-3xl font-black text-[#8A2BE2]">
                  ${gig.budget}
                </span>
                <span className="px-4 py-1.5 bg-purple-100 text-purple-800 rounded-full text-sm font-semibold">
                  {gig.status}
                </span>
              </div>
              <p className="text-sm text-gray-500">
                Posted by <span className="font-semibold text-purple-600">{gig.ownerId?.name}</span>
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
