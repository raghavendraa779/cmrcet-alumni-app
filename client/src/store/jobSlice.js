import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

const initialState = {
  jobs: [],
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
};

// Create job
export const createJob = createAsyncThunk('jobs/create', async (jobData, thunkAPI) => {
  try {
    const response = await api.post('/jobs', jobData);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

// Get all jobs
export const getJobs = createAsyncThunk('jobs/getAll', async (_, thunkAPI) => {
  try {
    const response = await api.get('/jobs');
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

// Delete job
export const deleteJob = createAsyncThunk('jobs/delete', async (id, thunkAPI) => {
  try {
    await api.delete(`/jobs/${id}`);
    return id;
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

export const jobSlice = createSlice({
  name: 'jobs',
  initialState,
  reducers: {
    resetJobs: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(createJob.pending, (state) => { state.isLoading = true; })
      .addCase(createJob.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.jobs.unshift(action.payload);
      })
      .addCase(createJob.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getJobs.pending, (state) => { state.isLoading = true; })
      .addCase(getJobs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        // The backend returns { data: [...], pagination: {...} }
        state.jobs = action.payload.data || [];
      })
      .addCase(getJobs.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(deleteJob.fulfilled, (state, action) => {
        state.jobs = state.jobs.filter((job) => job._id !== action.payload);
      });
  },
});

export const { resetJobs } = jobSlice.actions;
export default jobSlice.reducer;
