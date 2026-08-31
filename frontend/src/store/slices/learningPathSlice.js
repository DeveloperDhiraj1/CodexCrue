import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchLearningPath = createAsyncThunk('learningPath/fetch', async (_, thunkAPI) => {
  try {
    const response = await api.get('/learning-path');
    return response.data.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message);
  }
});

const learningPathSlice = createSlice({
  name: 'learningPath',
  initialState: { path: null, loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLearningPath.fulfilled, (state, action) => {
        state.path = action.payload;
      });
  }
});

export default learningPathSlice.reducer;