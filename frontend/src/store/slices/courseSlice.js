import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchCourses = createAsyncThunk('courses/fetchCourses', async (_, thunkAPI) => {
  try {
    const response = await api.get('/courses');
    return response.data.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message);
  }
});

const courseSlice = createSlice({
  name: 'courses',
  initialState: { list: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.list = action.payload;
      });
  }
});

export default courseSlice.reducer;