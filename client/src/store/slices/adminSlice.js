import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchReports = createAsyncThunk(
  'admin/fetchReports',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { user: { token } } = getState().auth;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await axios.get('/api/reports', config);
      return data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const updateReportStatus = createAsyncThunk(
  'admin/updateReportStatus',
  async ({ id, status, resolutionNotes }, { getState, rejectWithValue }) => {
    try {
      const { user: { token } } = getState().auth;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await axios.put(`/api/reports/${id}`, { status, resolutionNotes }, config);
      return data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    reports: [],
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchReports.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchReports.fulfilled, (state, action) => {
        state.loading = false;
        state.reports = action.payload;
      })
      .addCase(fetchReports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateReportStatus.fulfilled, (state, action) => {
        const index = state.reports.findIndex(r => r._id === action.payload._id);
        if (index !== -1) {
          state.reports[index] = action.payload;
        }
      });
  }
});

export default adminSlice.reducer;
