/**
 * API route constants (Django backend).
 */
export const ENDPOINTS = {
  SIGNUP: '/users/signup/',
  AUTH_LOGIN: '/users/login/',
  AUTH_LOGOUT: '/users/logout/',
  AUTH_ME: '/users/me/',
  PROFILE_ME: '/users/profile/',
} as const;
