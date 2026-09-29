import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

export const getSavedJobs = createAsyncThunk('savedJobs/getAll', async (_, thunkAPI) => {
  try {
    const response = await api.get('/jobs/saved');
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const toggleSaveJob = createAsyncThunk('savedJobs/toggle', async (jobId, thunkAPI) => {
  try {
    const response = await api.post(`/jobs/${jobId}/save`);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

const savedJobSlice = createSlice({
  name: 'savedJobs',
  initialState: { savedJobs: [], isLoading: false },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getSavedJobs.fulfilled, (state, action) => {
        state.savedJobs = action.payload;
      })
      .addCase(toggleSaveJob.fulfilled, (state, action) => {
        if (action.payload.saved) {
          state.savedJobs.push(action.payload.job);
        } else {
          state.savedJobs = state.savedJobs.filter(j => j._id !== action.payload.jobId);
        }
      });
  }
});

export default savedJobSlice.reducer;
