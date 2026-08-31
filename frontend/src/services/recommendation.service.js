import api from './api';

export const recommendationService = {
  async getRecommendations() {
    const response = await api.get('/recommendations');
    return response.data.data;
  }
};