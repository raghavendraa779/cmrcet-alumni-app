import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

const initialState = {
  events: [],
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
};

// Create event
export const createEvent = createAsyncThunk('events/create', async (eventData, thunkAPI) => {
  try {
    const response = await api.post('/events', eventData);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

// Get all events
export const getEvents = createAsyncThunk('events/getAll', async (_, thunkAPI) => {
  try {
    const response = await api.get('/events');
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

// Delete event
export const deleteEvent = createAsyncThunk('events/delete', async (id, thunkAPI) => {
  try {
    await api.delete(`/events/${id}`);
    return id;
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

// Toggle RSVP
export const toggleRSVP = createAsyncThunk('events/rsvp', async (id, thunkAPI) => {
  try {
    const response = await api.put(`/events/${id}/rsvp`);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

export const eventSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    resetEvents: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(createEvent.pending, (state) => { state.isLoading = true; })
      .addCase(createEvent.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        // Keep sorted by date
        state.events.push(action.payload);
        state.events.sort((a, b) => new Date(a.date) - new Date(b.date));
      })
      .addCase(createEvent.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getEvents.pending, (state) => { state.isLoading = true; })
      .addCase(getEvents.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.events = action.payload.data || action.payload || [];
      })
      .addCase(getEvents.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(deleteEvent.fulfilled, (state, action) => {
        state.events = state.events.filter((evt) => evt._id !== action.payload);
      })
      .addCase(toggleRSVP.fulfilled, (state, action) => {
        const index = state.events.findIndex(e => e._id === action.payload._id);
        if (index !== -1) {
          state.events[index] = action.payload;
        }
      });
  },
});

export const { resetEvents } = eventSlice.actions;
export default eventSlice.reducer;
