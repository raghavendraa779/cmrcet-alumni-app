import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchNotifications = createAsyncThunk(
  'notifications/fetchAll',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { user: { token } } = getState().auth;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await axios.get('/api/notifications', config);
      return data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const markAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (id, { getState, rejectWithValue }) => {
    try {
      const { user: { token } } = getState().auth;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await axios.put(`/api/notifications/${id}/read`, {}, config);
      return data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const markAllAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { user: { token } } = getState().auth;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.put('/api/notifications/read-all', {}, config);
      return;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    items: [],
    loading: false,
    error: null,
    unreadCount: 0
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.unreadCount = action.payload.filter(n => !n.isRead).length;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        const index = state.items.findIndex(n => n._id === action.payload._id);
        if (index !== -1) {
          state.items[index].isRead = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.items.forEach(n => n.isRead = true);
        state.unreadCount = 0;
      });
  }
});

export default notificationSlice.reducer;
