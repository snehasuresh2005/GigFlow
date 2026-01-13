import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchGig, clearCurrentGig } from '../store/slices/gigSlice';
import { submitBid, fetchBidsForGig, hireFreelancer, clearError } from '../store/slices/bidSlice';
import BidComparison from '../components/BidComparison';
import BackButton from '../components/BackButton';
import { getSocket } from '../utils/socket';

const GigDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentGig } = useSelector((state) => state.gigs);
  const { bids, loading: bidsLoading, error: bidError } = useSelector((state) => state.bids);
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const [bidForm, setBidForm] = useState({
    message: '',
    price: ''
  });
  const [showBidForm, setShowBidForm] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'comparison'

  useEffect(() => {
    dispatch(fetchGig(id));
    return () => {
      dispatch(clearCurrentGig());
    };
  }, [dispatch, id]);

  // Calculate owner and status BEFORE useEffects that depend on them
  // Handle both populated ownerId object and ownerId string
  const ownerId = currentGig?.ownerId?._id || currentGig?.ownerId;
  const userId = user?.id || user?._id;
  const isOwner = currentGig && isAuthenticated && ownerId && userId && String(ownerId) === String(userId);
  // Make isOpen reactive to currentGig.status changes
  const isOpen = currentGig?.status === 'open';

  useEffect(() => {
    if (currentGig && isAuthenticated && user) {
      // Fetch bids if user is owner, regardless of gig status
      if (isOwner) {
        dispatch(fetchBidsForGig(id));
      }
    }
  }, [dispatch, id, currentGig, isAuthenticated, user, isOwner]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  // Set up socket listener for gig owner to refresh when gig is assigned
  useEffect(() => {
    if (isAuthenticated && isOwner) {
      const socket = getSocket();

      if (socket) {
        const handleGigAssigned = (data) => {
          // Refresh the gig data to show updated status
          dispatch(fetchGig(id));
          dispatch(fetchBidsForGig(id));
        };

        socket.on('gigAssigned', handleGigAssigned);

        return () => {
          socket.off('gigAssigned', handleGigAssigned);
        };
      }
    }
  }, [dispatch, id, isAuthenticated, isOwner]);

  const handleBidSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await dispatch(submitBid({
        gigId: id,
        ...bidForm,
        price: parseFloat(bidForm.price)
      }));

      if (submitBid.fulfilled.match(result)) {
        setBidForm({ message: '', price: '' });
        setShowBidForm(false);
        alert('Bid submitted successfully!');
      }
    } catch (error) {
      console.error('Error submitting bid:', error);
    }
  };

  const handleHire = async (bidId) => {
    if (window.confirm('Are you sure you want to hire this freelancer?')) {
      try {
        const result = await dispatch(hireFreelancer(bidId));
        if (hireFreelancer.fulfilled.match(result)) {
          // Refresh gig and bids to get updated status
          await Promise.all([
            dispatch(fetchGig(id)),
            dispatch(fetchBidsForGig(id))
          ]);
          // No alert needed - the UI will update automatically
        }
      } catch (error) {
        console.error('Error hiring freelancer:', error);
      }
    }
  };

  if (!currentGig) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Loading gig details...</p>
      </div>
    );
  }

  // Find hired bid if gig is assigned
  const hiredBid = bids.find(bid => bid.status === 'hired');

  return (
    <div className="max-w-4xl mx-auto">
      <BackButton />
      <div className="bg-white rounded-3xl shadow-lg p-8 mb-6 border border-purple-100">
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tight">{currentGig.title}</h1>
          <span className={`px-4 py-1.5 rounded-full text-sm font-bold shadow-sm ${currentGig.status === 'open'
              ? 'bg-[#FFD700] text-gray-900'
              : 'bg-green-100 text-green-800'
            }`}>
            {currentGig.status === 'open' ? 'Open' : 'Assigned'}
          </span>
        </div>

        <p className="text-gray-600 mb-6 whitespace-pre-wrap font-medium leading-relaxed">
          {currentGig.description}
        </p>

        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500 font-medium">Posted by</p>
            <p className="font-bold text-[#8A2BE2] text-lg">
              {currentGig.ownerId?.name || 'Unknown'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500 font-medium">Budget</p>
            <p className="text-4xl font-black text-[#8A2BE2]">${currentGig.budget}</p>
          </div>
        </div>
      </div>

      {isAuthenticated && !isOwner && isOpen && (
        <div className="bg-white rounded-3xl shadow-lg p-8 mb-6 border border-purple-100">
          {!showBidForm ? (
            <button
              onClick={() => setShowBidForm(true)}
              className="w-full py-4 bg-[#FFD700] text-gray-900 rounded-2xl hover:bg-[#FFC700] transition-all font-black text-lg shadow-md hover:shadow-lg"
            >
              Submit a Bid
            </button>
          ) : (
            <div>
              <h3 className="text-2xl font-black mb-4 text-gray-900 uppercase">Submit Your Bid</h3>
              {bidError && (
                <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-2xl font-medium">
                  {bidError}
                </div>
              )}
              <form onSubmit={handleBidSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2 font-bold">Your Message</label>
                  <textarea
                    value={bidForm.message}
                    onChange={(e) => setBidForm({ ...bidForm, message: e.target.value })}
                    required
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 shadow-sm"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2 font-bold">Your Price ($)</label>
                  <input
                    type="number"
                    value={bidForm.price}
                    onChange={(e) => setBidForm({ ...bidForm, price: e.target.value })}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 shadow-sm"
                  />
                </div>
                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={bidsLoading}
                    className="flex-1 py-3 bg-[#FFD700] text-gray-900 rounded-2xl hover:bg-[#FFC700] transition-all disabled:opacity-50 font-black shadow-md hover:shadow-lg"
                  >
                    {bidsLoading ? 'Submitting...' : 'Submit Bid'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowBidForm(false);
                      setBidForm({ message: '', price: '' });
                    }}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-2xl hover:bg-purple-50 hover:border-purple-300 transition-all font-medium shadow-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {isOwner && (
        <div>
          {bidsLoading ? (
            <div className="bg-white rounded-3xl shadow-lg p-8 border border-purple-100">
              <p className="text-gray-600 text-center font-medium">Loading bids...</p>
            </div>
          ) : !isOpen ? (
            <div className="space-y-6">
              {hiredBid && (
                <div className="bg-white rounded-3xl shadow-lg p-8 border border-green-100 overflow-hidden relative">
                  <div className="absolute top-0 right-0 bg-green-100 text-green-800 px-6 py-2 rounded-bl-3xl font-bold">
                    HIRED FREELANCER
                  </div>
                  <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
                    <span className="w-4 h-4 bg-green-500 rounded-full shadow-sm"></span>
                    Project Assigned
                  </h2>

                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-sm text-gray-500 font-bold uppercase tracking-wider mb-2">Freelancer Details</h3>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-xl">
                          {hiredBid.freelancerId.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-xl font-bold text-gray-900">{hiredBid.freelancerId.name}</p>
                          <p className="text-gray-600">{hiredBid.freelancerId.email}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-2xl p-6">
                      <h3 className="text-sm text-gray-500 font-bold uppercase tracking-wider mb-3">Agreed Terms</h3>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-600 font-medium">Price</span>
                        <span className="text-2xl font-black text-[#8A2BE2]">${hiredBid.price}</span>
                      </div>
                      <div className="text-sm text-gray-500">
                        Hired on {new Date(currentGig.assignedAt || new Date()).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <h3 className="text-sm text-gray-500 font-bold uppercase tracking-wider mb-2">Proposal Message</h3>
                    <p className="text-gray-700 italic bg-gray-50 p-4 rounded-xl">
                      "{hiredBid.message}"
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : bids.length === 0 ? (
            <div className="bg-white rounded-3xl shadow-lg p-8 border border-purple-100">
              <p className="text-gray-600 text-center font-medium">No bids yet. Check back later!</p>
            </div>
          ) : (
            <BidComparison
              bids={bids}
              onHire={handleHire}
              isOpen={isOpen}
            />
          )}
        </div>
      )}

      {!isAuthenticated && (
        <div className="bg-white rounded-3xl shadow-lg p-8 text-center border border-purple-100">
          <p className="text-gray-600 mb-4 font-medium">
            Please login to submit a bid on this gig.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-3 bg-[#FFD700] text-gray-900 rounded-2xl hover:bg-[#FFC700] transition-all font-black shadow-md hover:shadow-lg"
          >
            Login
          </button>
        </div>
      )}
    </div>
  );
};

export default GigDetails;
