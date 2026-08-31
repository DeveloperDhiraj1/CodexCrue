import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchRecommendations = createAsyncThunk('recommendations/fetch', async (_, thunkAPI) => {
  try {
    const response = await api.get('/recommendations');
    return response.data.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message);
  }
});

const recommendationSlice = createSlice({
  name: 'recommendations',
  initialState: { items: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRecommendations.fulfilled, (state, action) => {
        state.items = action.payload;
      });
  }
});

export default recommendationSlice.reducer;