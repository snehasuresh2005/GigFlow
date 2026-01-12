import { useState } from 'react';

const BidComparison = ({ bids, onHire, isOpen }) => {
  const [selectedBids, setSelectedBids] = useState([]);
  const [comparisonMode, setComparisonMode] = useState(false);

  const toggleBidSelection = (bidId) => {
    if (selectedBids.includes(bidId)) {
      setSelectedBids(selectedBids.filter(id => id !== bidId));
    } else {
      if (selectedBids.length < 3) { // Limit to 3 bids for comparison
        setSelectedBids([...selectedBids, bidId]);
      }
    }
  };

  const clearSelection = () => {
    setSelectedBids([]);
    setComparisonMode(false);
  };

  const pendingBids = bids.filter(bid => bid.status === 'pending');
  const selectedBidsData = bids.filter(bid => selectedBids.includes(bid._id));

  if (pendingBids.length === 0) {
    return (
      <div className="bg-white rounded-3xl shadow-lg p-8 border border-purple-100">
        <p className="text-gray-600 text-center font-medium">No pending bids to compare.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-lg p-8 border border-purple-100">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Bid Comparison</h3>
        <div className="flex gap-3 items-center">
          {!comparisonMode ? (
            <>
              <button
                onClick={() => setComparisonMode(true)}
                className="px-5 py-2.5 bg-[#FFD700] text-gray-900 rounded-2xl hover:bg-[#FFC700] transition-all font-bold shadow-md hover:shadow-lg"
              >
                Compare Bids
              </button>
              <span className="text-sm text-gray-600 font-medium">
                Select up to 3 bids to compare
              </span>
            </>
          ) : (
            <button
              onClick={clearSelection}
              className="px-5 py-2.5 bg-gray-200 text-gray-700 rounded-2xl hover:bg-purple-100 hover:text-purple-700 transition-all font-medium shadow-sm"
            >
              Cancel Comparison
            </button>
          )}
        </div>
      </div>

      {!comparisonMode ? (
        // List view
        <div className="space-y-4">
          {pendingBids.map((bid) => (
            <div
              key={bid._id}
              className="p-5 border border-purple-200 rounded-2xl hover:border-purple-300 transition-all shadow-sm hover:shadow-md"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-bold text-gray-900 text-lg">
                    {bid.freelancerId.name}
                  </p>
                  <p className="text-sm text-gray-500 font-medium">
                    {bid.freelancerId.email}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-[#8A2BE2]">
                    ${bid.price}
                  </p>
                  <span className="text-xs px-3 py-1 rounded-full bg-purple-100 text-purple-800 font-bold">
                    {bid.status}
                  </span>
                </div>
              </div>
              <p className="text-gray-700 mb-4 font-medium">{bid.message}</p>
              {isOpen && (
                <button
                  onClick={() => onHire(bid._id)}
                  className="px-5 py-2.5 bg-[#FFD700] text-gray-900 rounded-2xl hover:bg-[#FFC700] transition-all font-black shadow-md hover:shadow-lg"
                >
                  Hire This Freelancer
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        // Comparison mode
        <>
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">
              Select up to 3 bids to compare side by side:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingBids.map((bid) => {
                const isSelected = selectedBids.includes(bid._id);
                return (
                  <div
                    key={bid._id}
                    onClick={() => toggleBidSelection(bid._id)}
                    className={`p-5 border-2 rounded-2xl cursor-pointer transition-all shadow-sm hover:shadow-md ${
                      isSelected
                        ? 'border-[#8A2BE2] bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleBidSelection(bid._id)}
                        className="w-4 h-4 text-purple-600"
                      />
                      <p className="font-semibold text-gray-900">
                        {bid.freelancerId.name}
                      </p>
                      <p className="text-xl font-black text-[#8A2BE2]">
                        ${bid.price}
                      </p>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {bid.message}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {selectedBidsData.length > 0 && (
            <div className="mt-6">
              <h4 className="text-xl font-black mb-4 text-gray-900 uppercase">
                Side-by-Side Comparison ({selectedBidsData.length} selected)
              </h4>
              <div className="overflow-x-auto">
                <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${selectedBidsData.length}, minmax(250px, 1fr))` }}>
                  {selectedBidsData.map((bid) => (
                    <div
                      key={bid._id}
                      className="border border-purple-200 rounded-2xl p-5 bg-white shadow-sm"
                    >
                      <div className="mb-4">
                        <p className="font-black text-lg text-gray-900 mb-1">
                          {bid.freelancerId.name}
                        </p>
                        <p className="text-sm text-gray-500 mb-2 font-medium">
                          {bid.freelancerId.email}
                        </p>
                        <p className="text-3xl font-black text-[#8A2BE2]">
                          ${bid.price}
                        </p>
                      </div>
                      <div className="mb-4">
                        <p className="text-xs text-gray-500 mb-1 font-bold">Message:</p>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap font-medium">
                          {bid.message}
                        </p>
                      </div>
                      <div className="mb-4">
                        <p className="text-xs text-gray-500 mb-1 font-bold">Submitted:</p>
                        <p className="text-sm text-gray-600 font-medium">
                          {new Date(bid.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      {isOpen && (
                        <button
                          onClick={() => onHire(bid._id)}
                          className="w-full px-4 py-2.5 bg-[#FFD700] text-gray-900 rounded-2xl hover:bg-[#FFC700] transition-all font-black shadow-md hover:shadow-lg"
                        >
                          Hire This Freelancer
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BidComparison;
