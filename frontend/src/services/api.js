import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';
import { firebaseAuth } from './firebase';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Firebase refreshes its ID token automatically; the backend verifies this token.
api.interceptors.request.use(async (config) => {
  const user = firebaseAuth.currentUser;
  if (user) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${await user.getIdToken()}`;
  }
  return config;
});

export default api;
