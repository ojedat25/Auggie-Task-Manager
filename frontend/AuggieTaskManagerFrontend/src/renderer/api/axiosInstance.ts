/**
 * Base axios instance for Django API.
 * Set baseURL and add request/response interceptors (auth, errors) here.
 */
import axios, { InternalAxiosRequestConfig } from 'axios';
import {AuthService} from '../features/auth/services/authService';
import { API_BASE } from '../../config';
import { ENDPOINTS } from './endpoints';

/** Dispatched when a 401 on a protected request should send the user to login (MemoryRouter). */
export const SESSION_EXPIRED_EVENT = 'auggie:session-expired';

function isPublicAuthPath(url: string | undefined): boolean {
  if (!url) return false;
  const path = url.split('?')[0];
  return path === ENDPOINTS.AUTH_LOGIN || path === ENDPOINTS.SIGNUP;
}

export const axiosInstance = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Request: attach token except for login/signup so DRF does not 401 on invalid stale tokens before the view runs.
axiosInstance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (isPublicAuthPath(config.url)) {
    return config;
  }

  const token = AuthService.getToken();
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }

  return config;
});

// Response: on 401 from protected calls, clear persisted auth and notify the app (in-router navigation).
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    const requestUrl = error.config?.url as string | undefined;
    if (isPublicAuthPath(requestUrl)) {
      return Promise.reject(error);
    }

    AuthService.removeToken();
    AuthService.removeUser();
    window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));

    return Promise.reject(error);
  }
);
