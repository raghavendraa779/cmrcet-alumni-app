import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

export const getAnalytics = createAsyncThunk('analytics/get', async (_, thunkAPI) => {
  try {
    const response = await api.get('/admin/analytics');
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState: { data: null, isLoading: false },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getAnalytics.pending, (state) => { state.isLoading = true; })
      .addCase(getAnalytics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
      })
      .addCase(getAnalytics.rejected, (state) => {
        state.isLoading = false;
      });
  }
});

export default analyticsSlice.reducer;
