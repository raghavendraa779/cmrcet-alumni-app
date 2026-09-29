import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchMentorships = createAsyncThunk('mentorship/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get('/api/mentorships');
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || error.message);
  }
});

export const requestMentorship = createAsyncThunk('mentorship/request', async (data, { rejectWithValue }) => {
  try {
    const response = await axios.post('/api/mentorships/request', data);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || error.message);
  }
});

const mentorshipSlice = createSlice({
  name: 'mentorship',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMentorships.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchMentorships.fulfilled, (state, action) => { state.loading = false; state.items = action.payload; })
      .addCase(fetchMentorships.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(requestMentorship.fulfilled, (state, action) => { state.items.push(action.payload); });
  },
});

export default mentorshipSlice.reducer;
