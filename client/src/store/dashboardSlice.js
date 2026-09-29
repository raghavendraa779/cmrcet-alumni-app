import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

const initialState = {
  stats: null,
  pendingUsers: [],
  networkSuggestions: [],
  isLoading: false,
  isError: false,
  message: '',
};

export const fetchAdminStats = createAsyncThunk('dashboard/stats', async (_, thunkAPI) => {
  try {
    const response = await api.get('/users/stats');
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

export const fetchPendingVerifications = createAsyncThunk('dashboard/pending', async (_, thunkAPI) => {
  try {
    const response = await api.get('/users/pending');
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

export const fetchNetworkSuggestions = createAsyncThunk('dashboard/network', async (_, thunkAPI) => {
  try {
    const response = await api.get('/users/network');
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

export const approveUser = createAsyncThunk('dashboard/approve', async (id, thunkAPI) => {
  try {
    const response = await api.put(`/users/${id}/approve`);
    return response.data; // { message, id }
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

export const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Admin Stats
      .addCase(fetchAdminStats.pending, (state) => { state.isLoading = true; })
      .addCase(fetchAdminStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload;
      })
      .addCase(fetchAdminStats.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Pending Users
      .addCase(fetchPendingVerifications.fulfilled, (state, action) => {
        state.pendingUsers = action.payload;
      })
      // Network Suggestions
      .addCase(fetchNetworkSuggestions.fulfilled, (state, action) => {
        state.networkSuggestions = action.payload;
      })
      // Approve User
      .addCase(approveUser.fulfilled, (state, action) => {
        // Remove approved user from pending list
        state.pendingUsers = state.pendingUsers.filter((u) => u._id !== action.payload.id);
      });
  },
});

export default dashboardSlice.reducer;
