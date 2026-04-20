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
  PROFILE_ME: '/users/profile/',
  // builds the url by passing in the user id
  PROFILE_DETAIL: (userId: number) => `/users/profile/${userId}/`,

  TASKS_UPCOMING: '/tasks/upcoming/',
  TASKS_CALENDAR: '/tasks/calendar/',
} as const;
