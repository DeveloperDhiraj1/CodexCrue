import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const sendAIMessage = createAsyncThunk('ai/sendMessage', async (message, thunkAPI) => {
  try {
    const response = await api.post('/ai/chat', { message });
    return response.data.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message);
  }
});

const aiSlice = createSlice({
  name: 'ai',
  initialState: { messages: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(sendAIMessage.fulfilled, (state, action) => {
        state.messages.push({ sender: 'ai', content: action.payload.reply });
      });
  }
});

export default aiSlice.reducer;