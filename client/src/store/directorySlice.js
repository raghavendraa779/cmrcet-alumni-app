import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

const initialState = {
  profiles: [],
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
};

// Get directory profiles
export const getDirectory = createAsyncThunk('directory/getAll', async (_, thunkAPI) => {
  try {
    const response = await api.get('/users/directory');
    return response.data;
  } catch (error) {
    const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

// Delete user
export const deleteUser = createAsyncThunk('directory/deleteUser', async (id, thunkAPI) => {
  try {
    const response = await api.delete(`/users/${id}`);
    return id;
  } catch (error) {
    const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const directorySlice = createSlice({
  name: 'directory',
  initialState,
  reducers: {
    resetDirectory: (state) => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getDirectory.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getDirectory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.profiles = action.payload;
      })
      .addCase(getDirectory.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.profiles = state.profiles.filter((profile) => profile._id !== action.payload);
      });
  },
});

export const { resetDirectory } = directorySlice.actions;
export default directorySlice.reducer;
