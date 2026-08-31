import api from './api';

export const authService = {
  async login(credentials) {
    const response = await api.post('/auth/login', credentials);
    if (response.data.data.token) {
      localStorage.setItem('cortex_token', response.data.data.token);
    }
    return response.data.data;
  },
  async register(userData) {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  logout() {
    return api.post('/auth/logout').finally(() => localStorage.removeItem('cortex_token'));
  }
};
