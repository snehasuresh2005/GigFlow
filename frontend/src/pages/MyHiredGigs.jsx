import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchActiveGigs } from '../store/slices/gigSlice';
import BackButton from '../components/BackButton';

const ActiveGigs = () => {
  const dispatch = useDispatch();
  const { activeGigs, activeGigsLoading } = useSelector((state) => state.gigs);

  useEffect(() => {
    dispatch(fetchActiveGigs());
  }, [dispatch]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'hired':
        return (
          <span className="px-4 py-1.5 bg-green-100 text-green-800 rounded-full text-sm font-bold shadow-sm">
            Hired
          </span>
        );
      case 'pending':
        return (
          <span className="px-4 py-1.5 bg-[#FFD700] text-gray-900 rounded-full text-sm font-bold shadow-sm">
            Awaiting Response
          </span>
        );
      case 'rejected':
        return (
          <span className="px-4 py-1.5 bg-red-100 text-red-800 rounded-full text-sm font-bold shadow-sm">
            Rejected
          </span>
        );
      default:
        return (
          <span className="px-4 py-1.5 bg-gray-100 text-gray-800 rounded-full text-sm font-bold shadow-sm">
            {status}
          </span>
        );
    }
  };

  const getCardBorderColor = (status) => {
    switch (status) {
      case 'hired':
        return 'hover:border-green-200 border-green-100';
      case 'pending':
        return 'hover:border-yellow-200 border-yellow-100';
      case 'rejected':
        return 'hover:border-red-200 border-red-100';
      default:
        return 'hover:border-gray-200 border-gray-100';
    }
  };

  // Group gigs by status for better organization
  const hiredGigs = activeGigs.filter(gig => gig.bid?.status === 'hired');
  const pendingGigs = activeGigs.filter(gig => gig.bid?.status === 'pending');
  const rejectedGigs = activeGigs.filter(gig => gig.bid?.status === 'rejected');

  return (
    <div>
      <BackButton />
      <div className="mb-8">
        <h1 className="text-4xl font-black text-gray-900 mb-2 uppercase tracking-tight">Active Gigs</h1>
        <p className="text-gray-600 font-medium">Track all gigs where you've submitted bids</p>
      </div>

      {activeGigsLoading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading your active gigs...</p>
        </div>
      ) : activeGigs.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-3xl shadow-lg border border-purple-100">
          <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-600 mb-4 font-medium">You haven't submitted any bids yet.</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#FFD700] text-gray-900 rounded-2xl hover:bg-[#FFC700] transition-all font-bold shadow-md hover:shadow-lg"
          >
            Browse Available Gigs
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Hired Gigs Section */}
          {hiredGigs.length > 0 && (
            <div>
              <h2 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-3">
                <span className="w-3 h-3 bg-green-500 rounded-full shadow-sm"></span>
                Hired ({hiredGigs.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {hiredGigs.map((gig) => (
                  <Link
                    key={gig._id}
                    to={`/gig/${gig._id}`}
                    className={`bg-white rounded-3xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 cursor-pointer border transform hover:-translate-y-1 ${getCardBorderColor(gig.bid?.status)}`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-semibold text-gray-900 flex-1">
                        {gig.title}
                      </h3>
                      {getStatusBadge(gig.bid?.status)}
                    </div>
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {gig.description}
                    </p>
                    <div className="mb-4 p-4 bg-purple-50 rounded-2xl">
                      <p className="text-sm text-gray-600 mb-1 font-medium">Your Bid:</p>
                      <p className="text-xl font-black text-[#8A2BE2]">${gig.bid?.price}</p>
                      {gig.bid?.message && (
                        <p className="text-xs text-gray-500 mt-2 line-clamp-2">{gig.bid.message}</p>
                      )}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-3xl font-black text-[#8A2BE2]">
                        ${gig.budget}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(gig.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-4">
                      Posted by <span className="font-medium text-purple-600">{gig.ownerId?.name}</span>
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Awaiting Response Section */}
          {pendingGigs.length > 0 && (
            <div>
              <h2 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-3">
                <span className="w-3 h-3 bg-[#FFD700] rounded-full shadow-sm"></span>
                Awaiting Response ({pendingGigs.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pendingGigs.map((gig) => (
                  <Link
                    key={gig._id}
                    to={`/gig/${gig._id}`}
                    className={`bg-white rounded-3xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 cursor-pointer border transform hover:-translate-y-1 ${getCardBorderColor(gig.bid?.status)}`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-semibold text-gray-900 flex-1">
                        {gig.title}
                      </h3>
                      {getStatusBadge(gig.bid?.status)}
                    </div>
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {gig.description}
                    </p>
                    <div className="mb-4 p-4 bg-purple-50 rounded-2xl">
                      <p className="text-sm text-gray-600 mb-1 font-medium">Your Bid:</p>
                      <p className="text-xl font-black text-[#8A2BE2]">${gig.bid?.price}</p>
                      {gig.bid?.message && (
                        <p className="text-xs text-gray-500 mt-2 line-clamp-2">{gig.bid.message}</p>
                      )}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-3xl font-black text-[#8A2BE2]">
                        ${gig.budget}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(gig.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-4">
                      Posted by <span className="font-medium text-purple-600">{gig.ownerId?.name}</span>
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Rejected Gigs Section */}
          {rejectedGigs.length > 0 && (
            <div>
              <h2 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-3">
                <span className="w-3 h-3 bg-red-500 rounded-full shadow-sm"></span>
                Rejected ({rejectedGigs.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rejectedGigs.map((gig) => (
                  <Link
                    key={gig._id}
                    to={`/gig/${gig._id}`}
                    className={`bg-white rounded-3xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 cursor-pointer border opacity-75 ${getCardBorderColor(gig.bid?.status)}`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-semibold text-gray-900 flex-1">
                        {gig.title}
                      </h3>
                      {getStatusBadge(gig.bid?.status)}
                    </div>
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {gig.description}
                    </p>
                    <div className="mb-4 p-4 bg-purple-50 rounded-2xl">
                      <p className="text-sm text-gray-600 mb-1 font-medium">Your Bid:</p>
                      <p className="text-xl font-black text-[#8A2BE2]">${gig.bid?.price}</p>
                      {gig.bid?.message && (
                        <p className="text-xs text-gray-500 mt-2 line-clamp-2">{gig.bid.message}</p>
                      )}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-3xl font-black text-[#8A2BE2]">
                        ${gig.budget}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(gig.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-4">
                      Posted by <span className="font-medium text-purple-600">{gig.ownerId?.name}</span>
                    </p>
                    {gig.bid?.rejectedAt && (
                      <p className="text-xs text-red-500 mt-2">
                        Rejected on {new Date(gig.bid.rejectedAt).toLocaleDateString()}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ActiveGigs;
