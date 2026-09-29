import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

const initialState = {
  conversations: [],
  messages: [],
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
};

// Get all conversations
export const getConversations = createAsyncThunk('messages/getConversations', async (_, thunkAPI) => {
  try {
    const response = await api.get('/messages/conversations');
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

// Get messages for a specific user
export const getMessages = createAsyncThunk('messages/getMessages', async (userId, thunkAPI) => {
  try {
    const response = await api.get(`/messages/${userId}`);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

// Send a message
export const sendMessage = createAsyncThunk('messages/sendMessage', async (data, thunkAPI) => {
  try {
    const response = await api.post(`/messages/${data.userId}`, { text: data.text });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

export const messageSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    resetMessages: (state) => {
      state.isError = false;
      state.isSuccess = false;
      state.isLoading = false;
      state.message = '';
    },
    // Useful for real-time updates when socket receives a message
    addMessageToStore: (state, action) => {
      state.messages.push(action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getConversations.pending, (state) => { state.isLoading = true; })
      .addCase(getConversations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.conversations = action.payload;
      })
      .addCase(getConversations.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getMessages.pending, (state) => { state.isLoading = true; })
      .addCase(getMessages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.messages = action.payload;
      })
      .addCase(getMessages.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.messages.push(action.payload);
      });
  },
});

export const { resetMessages, addMessageToStore } = messageSlice.actions;
export default messageSlice.reducer;
