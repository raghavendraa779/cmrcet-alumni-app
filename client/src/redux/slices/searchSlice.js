import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const searchUsers = createAsyncThunk('search/users', async (params, { rejectWithValue }) => {
  try {
    const response = await axios.get('/api/search', { params });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || error.message);
  }
});

const searchSlice = createSlice({
  name: 'search',
  initialState: {
    results: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearSearch: (state) => { state.results = []; state.error = null; }
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchUsers.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(searchUsers.fulfilled, (state, action) => { state.loading = false; state.results = action.payload; })
      .addCase(searchUsers.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  },
});

export const { clearSearch } = searchSlice.actions;
export default searchSlice.reducer;
