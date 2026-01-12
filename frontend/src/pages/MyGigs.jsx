import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchMyGigs } from '../store/slices/gigSlice';
import BackButton from '../components/BackButton';

const MyGigs = () => {
  const dispatch = useDispatch();
  const { myGigs, myGigsLoading } = useSelector((state) => state.gigs);

  useEffect(() => {
    dispatch(fetchMyGigs());
  }, [dispatch]);

  return (
    <div>
      <BackButton />
      <div className="mb-8">
        <h1 className="text-4xl font-black text-gray-900 mb-2 uppercase tracking-tight">My Gigs</h1>
        <p className="text-gray-600 font-medium">Manage all the gigs you've posted</p>
      </div>

      {myGigsLoading ? (
        <div className="text-center py-12">
          <p className="text-gray-600 font-medium">Loading your gigs...</p>
        </div>
      ) : myGigs.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-3xl shadow-lg border border-purple-100">
          <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-600 mb-4 font-medium">You haven't posted any gigs yet.</p>
          <Link
            to="/create-gig"
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#FFD700] text-gray-900 rounded-2xl hover:bg-[#FFC700] transition-all font-bold shadow-md hover:shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Post Your First Gig
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myGigs.map((gig) => (
            <Link
              key={gig._id}
              to={`/gig/${gig._id}`}
              className="bg-white rounded-3xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 cursor-pointer border border-purple-100 hover:border-purple-200 transform hover:-translate-y-1"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-xl font-bold text-gray-900 flex-1">
                  {gig.title}
                </h3>
                <span
                  className={`px-4 py-1.5 rounded-full text-sm font-bold shadow-sm ${
                    gig.status === 'open'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-purple-100 text-purple-800'
                  }`}
                >
                  {gig.status}
                </span>
              </div>
              <p className="text-gray-600 mb-4 line-clamp-3 text-sm">
                {gig.description}
              </p>
              <div className="flex justify-between items-center">
                <span className="text-3xl font-black text-[#8A2BE2]">
                  ${gig.budget}
                </span>
                <span className="text-sm text-gray-500 font-medium">
                  {new Date(gig.createdAt).toLocaleDateString()}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyGigs;
