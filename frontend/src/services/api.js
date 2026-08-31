import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('cortex_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let refreshPromise = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isAuthRequest = originalRequest?.url?.startsWith('/auth/');
    if (error.response?.status !== 401 || originalRequest?._retry || isAuthRequest) {
      return Promise.reject(error);
    }
    originalRequest._retry = true;
    refreshPromise ||= api.post('/auth/refresh').then((response) => {
      const token = response.data?.data?.token;
      if (!token) throw new Error('Refresh response did not include an access token.');
      localStorage.setItem('cortex_token', token);
      return token;
    }).catch((refreshError) => {
      localStorage.removeItem('cortex_token');
      window.dispatchEvent(new Event('auth:expired'));
      throw refreshError;
    }).finally(() => {
      refreshPromise = null;
    });
    const token = await refreshPromise;
    originalRequest.headers.Authorization = `Bearer ${token}`;
    return api(originalRequest);
  }
);

export default api;
