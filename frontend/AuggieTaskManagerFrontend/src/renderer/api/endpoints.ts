/**
 * API route constants (Django backend).
 */
export const ENDPOINTS = {
  SIGNUP: '/users/signup/',
  AUTH_LOGIN: '/users/login/',
  AUTH_LOGOUT: '/users/logout/',
  AUTH_ME: '/users/me/',
  TASKS: '/tasks/',
  MOODLE_CALENDAR_URL: '/tasks/import_moodle_calendar/',
} as const;
