import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';
import { getErrorMessage } from '../../utils/getErrorMessage';
import type { User } from '../../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  initializing: boolean;
  error: string | null;
}

interface Credentials {
  email: string;
  password: string;
}

interface RegisterData extends Credentials {
  name: string;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  initializing: true,
  error: null
};

export const register = createAsyncThunk(
  'auth/register',
  async (userData: RegisterData, { rejectWithValue }) => {
    try {
      const response = await api.post<{ data: { user: User } }>('/auth/register', userData);
      return response.data.data!.user;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: Credentials, { rejectWithValue }) => {
    try {
      const response = await api.post<{ data: { user: User } }>('/auth/login', credentials);
      return response.data.data!.user;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<{ data: { user: User } }>('/auth/me');
      return response.data.data!.user;
    } catch {
      return rejectWithValue(null);
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await api.post('/auth/logout');
    return null;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.initializing = false;
        if (action.payload) {
          state.user = action.payload;
          state.isAuthenticated = true;
        }
      })
      .addCase(getCurrentUser.rejected, (state) => {
        state.initializing = false;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
      });
  }
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
