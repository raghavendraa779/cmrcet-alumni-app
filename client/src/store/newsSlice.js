import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

const initialState = {
  news: [],
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
};

// Create new news
export const createNews = createAsyncThunk('news/create', async (newsData, thunkAPI) => {
  try {
    const response = await api.post('/news', newsData);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

// Get all news
export const getNews = createAsyncThunk('news/getAll', async (_, thunkAPI) => {
  try {
    const response = await api.get('/news');
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

// Delete news
export const deleteNews = createAsyncThunk('news/delete', async (id, thunkAPI) => {
  try {
    await api.delete(`/news/${id}`);
    return id;
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

// Pin News
export const pinNews = createAsyncThunk('news/pin', async (id, thunkAPI) => {
  try {
    const response = await api.put(`/news/${id}/pin`);
    return response.data; // returns populated news
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

// Toggle Like
export const toggleLike = createAsyncThunk('news/like', async (id, thunkAPI) => {
  try {
    const response = await api.put(`/news/${id}/like`);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

// Add Comment
export const addComment = createAsyncThunk('news/comment', async ({ id, text }, thunkAPI) => {
  try {
    const response = await api.post(`/news/${id}/comment`, { text });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

// Delete Comment
export const deleteComment = createAsyncThunk('news/uncomment', async ({ id, commentId }, thunkAPI) => {
  try {
    const response = await api.delete(`/news/${id}/comment/${commentId}`);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});


export const newsSlice = createSlice({
  name: 'news',
  initialState,
  reducers: {
    resetNews: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(createNews.pending, (state) => { state.isLoading = true; })
      .addCase(createNews.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.news.unshift(action.payload); // Add to top
      })
      .addCase(createNews.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getNews.pending, (state) => { state.isLoading = true; })
      .addCase(getNews.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.news = action.payload.data || action.payload || [];
      })
      .addCase(getNews.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(deleteNews.fulfilled, (state, action) => {
        state.news = state.news.filter((news) => news._id !== action.payload);
      })
      // Update individual post in state (for like, comment, pin)
      .addMatcher(
        (action) => [pinNews.fulfilled.type, toggleLike.fulfilled.type, addComment.fulfilled.type, deleteComment.fulfilled.type].includes(action.type),
        (state, action) => {
          const index = state.news.findIndex(n => n._id === action.payload._id);
          if (index !== -1) {
            state.news[index] = action.payload;
          }
          // Resort by pin status
          state.news.sort((a, b) => b.isPinned - a.isPinned || new Date(b.createdAt) - new Date(a.createdAt));
        }
      );
  },
});

export const { resetNews } = newsSlice.actions;
export default newsSlice.reducer;
