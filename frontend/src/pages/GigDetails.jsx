import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchGig, clearCurrentGig } from '../store/slices/gigSlice';
import { submitBid, fetchBidsForGig, hireFreelancer, clearError } from '../store/slices/bidSlice';
import BidComparison from '../components/BidComparison';
import BackButton from '../components/BackButton';

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

  useEffect(() => {
    if (currentGig && isAuthenticated && user) {
      // Handle both populated ownerId object and ownerId string
      const ownerId = currentGig.ownerId?._id || currentGig.ownerId;
      const userId = user?.id || user?._id;
      
      if (ownerId && userId && String(ownerId) === String(userId)) {
        dispatch(fetchBidsForGig(id));
      }
    }
  }, [dispatch, id, currentGig, isAuthenticated, user]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  // Handle both populated ownerId object and ownerId string
  const ownerId = currentGig?.ownerId?._id || currentGig?.ownerId;
  const userId = user?.id || user?._id;
  const isOwner = currentGig && isAuthenticated && ownerId && userId && String(ownerId) === String(userId);
  const isOpen = currentGig?.status === 'open';

  const handleBidSubmit = async (e) => {
    e.preventDefault();
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
  };

  const handleHire = async (bidId) => {
    if (window.confirm('Are you sure you want to hire this freelancer?')) {
      const result = await dispatch(hireFreelancer(bidId));
      if (hireFreelancer.fulfilled.match(result)) {
        dispatch(fetchGig(id));
        dispatch(fetchBidsForGig(id));
        alert('Freelancer hired successfully!');
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

  return (
    <div className="max-w-4xl mx-auto">
      <BackButton />
      <div className="bg-white rounded-3xl shadow-lg p-8 mb-6 border border-purple-100">
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tight">{currentGig.title}</h1>
          <span className={`px-4 py-1.5 rounded-full text-sm font-bold shadow-sm ${
            currentGig.status === 'open' 
              ? 'bg-[#FFD700] text-gray-900' 
              : 'bg-gray-200 text-gray-800'
          }`}>
            {currentGig.status}
          </span>
        </div>
        
        <p className="text-gray-600 mb-6 whitespace-pre-wrap font-medium leading-relaxed">
          {currentGig.description}
        </p>
        
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500 font-medium">Posted by</p>
            <p className="font-bold text-[#8A2BE2] text-lg">{currentGig.ownerId.name}</p>
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
