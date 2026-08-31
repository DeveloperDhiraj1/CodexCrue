import api from './api';

export const aiService = {
  async sendMessage(message) {
    const response = await api.post('/ai/chat', { message });
    return response.data.data;
  }
};