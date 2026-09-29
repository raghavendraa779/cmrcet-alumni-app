import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

export const getMentors = createAsyncThunk('mentorship/getMentors', async (filters, thunkAPI) => {
  try {
    const response = await api.get('/mentorship/mentors', { params: filters });
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const getMyRequests = createAsyncThunk('mentorship/getMyRequests', async (_, thunkAPI) => {
  try {
    const response = await api.get('/mentorship/requests');
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const sendRequest = createAsyncThunk('mentorship/sendRequest', async (data, thunkAPI) => {
  try {
    const response = await api.post('/mentorship/request', data);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const respondToRequest = createAsyncThunk('mentorship/respondToRequest', async ({ id, status }, thunkAPI) => {
  try {
    const response = await api.put(`/mentorship/request/${id}`, { status });
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

const mentorshipSlice = createSlice({
  name: 'mentorship',
  initialState: { mentors: [], requests: [], isLoading: false },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getMentors.pending, (state) => { state.isLoading = true; })
      .addCase(getMentors.fulfilled, (state, action) => {
        state.isLoading = false;
        state.mentors = action.payload;
      })
      .addCase(getMyRequests.fulfilled, (state, action) => {
        state.requests = action.payload;
      })
      .addCase(respondToRequest.fulfilled, (state, action) => {
        const index = state.requests.findIndex(r => r._id === action.payload._id);
        if (index !== -1) state.requests[index] = action.payload;
      });
  }
});

export default mentorshipSlice.reducer;
