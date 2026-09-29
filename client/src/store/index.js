import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import newsReducer from './newsSlice';
import themeReducer from './themeSlice';
import directoryReducer from './directorySlice';
import dashboardReducer from './dashboardSlice';
import jobReducer from './jobSlice';
import eventReducer from './eventSlice';
import messageReducer from './messageSlice';
import notificationReducer from './notificationSlice';
import mentorshipReducer from './mentorshipSlice';
import savedJobReducer from './savedJobSlice';
import reportReducer from './reportSlice';
import analyticsReducer from './analyticsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    news: newsReducer,
    theme: themeReducer,
    directory: directoryReducer,
    dashboard: dashboardReducer,
    jobs: jobReducer,
    events: eventReducer,
    messages: messageReducer,
    notifications: notificationReducer,
    mentorship: mentorshipReducer,
    savedJobs: savedJobReducer,
    reports: reportReducer,
    analytics: analyticsReducer,
  },
});
