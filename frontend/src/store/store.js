import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import courseReducer from './slices/courseSlice';
import recommendationReducer from './slices/recommendationSlice';
import learningPathReducer from './slices/learningPathSlice';
import aiReducer from './slices/aiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    courses: courseReducer,
    recommendations: recommendationReducer,
    learningPath: learningPathReducer,
    ai: aiReducer
  }
});