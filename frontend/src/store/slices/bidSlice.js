import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

// Helper function to extract error message
const getErrorMessage = (error) => {
  if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
    return error.response.data.errors[0]?.msg || error.response.data.errors[0]?.message || 'Validation error';
  }
  return error.response?.data?.message || error.message || 'An error occurred';
};

// Submit bid
export const submitBid = createAsyncThunk(
  'bids/submitBid',
  async (bidData, { rejectWithValue }) => {
    try {
      const response = await api.post('/bids', bidData);
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// Get bids for a gig
export const fetchBidsForGig = createAsyncThunk(
  'bids/fetchBidsForGig',
  async (gigId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/bids/${gigId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// Hire freelancer
export const hireFreelancer = createAsyncThunk(
  'bids/hireFreelancer',
  async (bidId, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/bids/${bidId}/hire`, {});
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

const bidSlice = createSlice({
  name: 'bids',
  initialState: {
    bids: [],
    loading: false,
    error: null,
    notification: null
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setNotification: (state, action) => {
      state.notification = action.payload;
    },
    clearNotification: (state) => {
      state.notification = null;
    },
    addNewBid: (state, action) => {
      // Check if bid already exists (avoid duplicates)
      const bidExists = state.bids.some(bid => bid._id === action.payload._id);
      if (!bidExists) {
        state.bids.unshift(action.payload); // Add to beginning of array
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Submit bid
      .addCase(submitBid.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitBid.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(submitBid.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch bids
      .addCase(fetchBidsForGig.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBidsForGig.fulfilled, (state, action) => {
        state.loading = false;
        state.bids = action.payload;
      })
      .addCase(fetchBidsForGig.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Hire freelancer
      .addCase(hireFreelancer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(hireFreelancer.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(hireFreelancer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError, setNotification, clearNotification, addNewBid } = bidSlice.actions;
export default bidSlice.reducer;
