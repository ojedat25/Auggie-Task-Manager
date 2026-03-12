/**
 * Base axios instance for Django API.
 * Set baseURL and add request/response interceptors (auth, errors) here.
 */
import axios from 'axios';
import { API_BASE } from '../../config';

export const axiosInstance = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: attach auth token to every request if it exists
axiosInstance.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('auggie_token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Response interceptor: handle authentication errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid → clear stored session
      sessionStorage.removeItem('auggie_token');
      sessionStorage.removeItem('user');

      // Redirect user back to login page
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);
