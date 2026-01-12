import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

// Helper function to extract error message
const getErrorMessage = (error) => {
  if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
    // Handle validation errors
    return error.response.data.errors[0]?.msg || error.response.data.errors[0]?.message || 'Validation error';
  }
  return error.response?.data?.message || error.message || 'An error occurred';
};

// Register
export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// Login
export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// Get current user
export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/auth/me');
      return response.data.user;
    } catch (error) {
      return rejectWithValue(null);
    }
  }
);

// Logout
export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await api.post('/auth/logout', {});
      return null;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// Fetch notifications
export const fetchNotifications = createAsyncThunk(
  'auth/fetchNotifications',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/auth/notifications');
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// Mark notification as read
export const markNotificationRead = createAsyncThunk(
  'auth/markNotificationRead',
  async (notificationId, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/auth/notifications/${notificationId}/read`);
      return response.data.notification;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// Mark all notifications as read
export const markAllNotificationsRead = createAsyncThunk(
  'auth/markAllNotificationsRead',
  async (_, { rejectWithValue }) => {
    try {
      await api.patch('/auth/notifications/read-all');
      return null;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,
    notifications: [],
    unreadNotificationsCount: 0
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get current user
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        if (action.payload) {
          state.user = action.payload;
          state.isAuthenticated = true;
        }
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.notifications = [];
        state.unreadNotificationsCount = 0;
      })
      // Fetch notifications
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.notifications = action.payload;
        state.unreadNotificationsCount = action.payload.filter(n => !n.read).length;
      })
      // Mark notification as read
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const index = state.notifications.findIndex(n => n._id === action.payload._id);
        if (index !== -1) {
          state.notifications[index].read = true;
          state.unreadNotificationsCount = Math.max(0, state.unreadNotificationsCount - 1);
        }
      })
      // Mark all notifications as read
      .addCase(markAllNotificationsRead.fulfilled, (state) => {
        state.notifications.forEach(n => n.read = true);
        state.unreadNotificationsCount = 0;
      });
  }
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
