import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = '/api/gigs';

// Fetch all gigs
export const fetchGigs = createAsyncThunk(
  'gigs/fetchGigs',
  async (searchQuery = '', { rejectWithValue }) => {
    try {
      const url = searchQuery ? `${API_URL}?search=${encodeURIComponent(searchQuery)}` : API_URL;
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch gigs');
    }
  }
);

// Create gig
export const createGig = createAsyncThunk(
  'gigs/createGig',
  async (gigData, { rejectWithValue }) => {
    try {
      const response = await axios.post(API_URL, gigData, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create gig');
    }
  }
);

// Get single gig
export const fetchGig = createAsyncThunk(
  'gigs/fetchGig',
  async (gigId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/${gigId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch gig');
    }
  }
);

// Fetch user's own gigs
export const fetchMyGigs = createAsyncThunk(
  'gigs/fetchMyGigs',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/my-gigs`, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch your gigs');
    }
  }
);

// Fetch user's active gigs (all gigs where user has submitted bids)
export const fetchActiveGigs = createAsyncThunk(
  'gigs/fetchActiveGigs',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/my-active-gigs`, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch your active gigs');
    }
  }
);

const gigSlice = createSlice({
  name: 'gigs',
  initialState: {
    gigs: [],
    myGigs: [],
    activeGigs: [],
    currentGig: null,
    loading: false,
    myGigsLoading: false,
    activeGigsLoading: false,
    error: null
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentGig: (state) => {
      state.currentGig = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch gigs
      .addCase(fetchGigs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGigs.fulfilled, (state, action) => {
        state.loading = false;
        state.gigs = action.payload;
      })
      .addCase(fetchGigs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create gig
      .addCase(createGig.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createGig.fulfilled, (state, action) => {
        state.loading = false;
        state.gigs.unshift(action.payload);
        // Also add to myGigs if it exists
        state.myGigs.unshift(action.payload);
      })
      .addCase(createGig.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch single gig
      .addCase(fetchGig.fulfilled, (state, action) => {
        state.currentGig = action.payload;
      })
      // Fetch my gigs
      .addCase(fetchMyGigs.pending, (state) => {
        state.myGigsLoading = true;
        state.error = null;
      })
      .addCase(fetchMyGigs.fulfilled, (state, action) => {
        state.myGigsLoading = false;
        state.myGigs = action.payload;
      })
      .addCase(fetchMyGigs.rejected, (state, action) => {
        state.myGigsLoading = false;
        state.error = action.payload;
      })
      // Fetch active gigs
      .addCase(fetchActiveGigs.pending, (state) => {
        state.activeGigsLoading = true;
        state.error = null;
      })
      .addCase(fetchActiveGigs.fulfilled, (state, action) => {
        state.activeGigsLoading = false;
        state.activeGigs = action.payload;
      })
      .addCase(fetchActiveGigs.rejected, (state, action) => {
        state.activeGigsLoading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError, clearCurrentGig } = gigSlice.actions;
export default gigSlice.reducer;
