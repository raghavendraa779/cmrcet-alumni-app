import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

export const getReports = createAsyncThunk('reports/getAll', async (_, thunkAPI) => {
  try {
    const response = await api.get('/reports');
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const createReport = createAsyncThunk('reports/create', async (data, thunkAPI) => {
  try {
    const response = await api.post('/reports', data);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const reviewReport = createAsyncThunk('reports/review', async ({ id, action }, thunkAPI) => {
  try {
    const response = await api.put(`/reports/${id}/review`, { action });
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

const reportSlice = createSlice({
  name: 'reports',
  initialState: { reports: [], isLoading: false },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getReports.fulfilled, (state, action) => {
        state.reports = action.payload;
      })
      .addCase(reviewReport.fulfilled, (state, action) => {
        const index = state.reports.findIndex(r => r._id === action.payload._id);
        if (index !== -1) state.reports[index] = action.payload;
      });
  }
});

export default reportSlice.reducer;
