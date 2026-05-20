import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import api from '../../utils/api';
import { getErrorMessage } from '../../utils/getErrorMessage';
import type { Lead, LeadFilters, PaginationMeta } from '../../types';

interface LeadFormData {
  name: string;
  email: string;
  status: string;
  source: string;
}

interface LeadsState {
  leads: Lead[];
  currentLead: Lead | null;
  pagination: PaginationMeta | null;
  filters: LeadFilters;
  loading: boolean;
  detailLoading: boolean;
  error: string | null;
  exportLoading: boolean;
}

const initialFilters: LeadFilters = {
  status: '',
  source: '',
  search: '',
  sort: 'latest',
  page: 1
};

const initialState: LeadsState = {
  leads: [],
  currentLead: null,
  pagination: null,
  filters: initialFilters,
  loading: false,
  detailLoading: false,
  error: null,
  exportLoading: false
};

const buildQueryParams = (filters: LeadFilters): Record<string, string> => {
  const params: Record<string, string> = {
    page: String(filters.page),
    sort: filters.sort
  };
  if (filters.status) params.status = filters.status;
  if (filters.source) params.source = filters.source;
  if (filters.search.trim()) params.search = filters.search.trim();
  return params;
};

export const fetchLeads = createAsyncThunk(
  'leads/fetchLeads',
  async (filters: LeadFilters, { rejectWithValue }) => {
    try {
      const response = await api.get<{
        data: Lead[];
        pagination: PaginationMeta;
      }>('/leads', { params: buildQueryParams(filters) });
      return {
        leads: response.data.data ?? [],
        pagination: response.data.pagination
      };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchLeadById = createAsyncThunk(
  'leads/fetchLeadById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get<{ data: Lead }>(`/leads/${id}`);
      return response.data.data!;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const createLead = createAsyncThunk(
  'leads/createLead',
  async (data: LeadFormData, { rejectWithValue }) => {
    try {
      const response = await api.post<{ data: Lead }>('/leads', data);
      return response.data.data!;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const updateLead = createAsyncThunk(
  'leads/updateLead',
  async ({ id, data }: { id: string; data: LeadFormData }, { rejectWithValue }) => {
    try {
      const response = await api.put<{ data: Lead }>(`/leads/${id}`, data);
      return response.data.data!;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const deleteLead = createAsyncThunk(
  'leads/deleteLead',
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/leads/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const exportLeadsCsv = createAsyncThunk(
  'leads/exportCsv',
  async (filters: LeadFilters, { rejectWithValue }) => {
    try {
      const response = await api.get('/leads/export/csv', {
        params: buildQueryParams(filters),
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `leads-export-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      return true;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

const leadSlice = createSlice({
  name: 'leads',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<LeadFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = { ...initialFilters };
    },
    clearLeadError: (state) => {
      state.error = null;
    },
    clearCurrentLead: (state) => {
      state.currentLead = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLeads.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLeads.fulfilled, (state, action) => {
        state.loading = false;
        state.leads = action.payload.leads;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchLeads.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchLeadById.pending, (state) => {
        state.detailLoading = true;
        state.error = null;
      })
      .addCase(fetchLeadById.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.currentLead = action.payload;
      })
      .addCase(fetchLeadById.rejected, (state, action) => {
        state.detailLoading = false;
        state.error = action.payload as string;
      })
      .addCase(createLead.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(updateLead.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(deleteLead.fulfilled, (state, action) => {
        state.leads = state.leads.filter((l) => l.id !== action.payload);
      })
      .addCase(deleteLead.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(exportLeadsCsv.pending, (state) => {
        state.exportLoading = true;
      })
      .addCase(exportLeadsCsv.fulfilled, (state) => {
        state.exportLoading = false;
      })
      .addCase(exportLeadsCsv.rejected, (state, action) => {
        state.exportLoading = false;
        state.error = action.payload as string;
      });
  }
});

export const { setFilters, resetFilters, clearLeadError, clearCurrentLead } =
  leadSlice.actions;
export default leadSlice.reducer;
