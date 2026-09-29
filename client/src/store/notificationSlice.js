import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

export const getNotifications = createAsyncThunk('notifications/getAll', async (_, thunkAPI) => {
  try {
    const response = await api.get('/notifications');
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const getUnreadCount = createAsyncThunk('notifications/unreadCount', async (_, thunkAPI) => {
  try {
    const response = await api.get('/notifications/unread-count');
    return response.data.count;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const markAsRead = createAsyncThunk('notifications/markRead', async (id, thunkAPI) => {
  try {
    await api.put(`/notifications/${id}/read`);
    return id;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const markAllAsRead = createAsyncThunk('notifications/markAllRead', async (_, thunkAPI) => {
  try {
    await api.put('/notifications/read-all');
    return true;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: { notifications: [], unreadCount: 0, isLoading: false },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notifications = Array.isArray(action.payload) ? action.payload : action.payload.data || [];
      })
      .addCase(getNotifications.pending, (state) => { state.isLoading = true; })
      .addCase(getUnreadCount.fulfilled, (state, action) => { state.unreadCount = action.payload; })
      .addCase(markAsRead.fulfilled, (state, action) => {
        const n = state.notifications.find(n => n._id === action.payload);
        if (n) n.read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      })
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.notifications.forEach(n => n.read = true);
        state.unreadCount = 0;
      });
  }
});

export default notificationSlice.reducer;
