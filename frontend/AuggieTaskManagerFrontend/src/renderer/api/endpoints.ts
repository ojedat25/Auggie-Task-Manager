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

  STUDY_GROUPS_ALL: '/groups/all/', // Endpoint to fetch all study groups
  STUDY_GROUPS: '/groups/', // Endpoint to fetch study groups the user is a member of, and to create new study groups
  STUDY_GROUPS_JOIN: (groupId: number) => `/groups/${groupId}/join/`, // Endpoint to join a study group
  STUDY_GROUPS_LEAVE: (groupId: number) => `/groups/${groupId}/leave/`, // Endpoint to leave a study group
  STUDY_GROUPS_CREATE: '/groups/', // Endpoint to create a new study group
  STUDY_GROUPS_UPDATE_GROUP: (groupID: number) =>
    `/groups/${groupID}/update_group/`,
  STUDY_GROUPS_UPDATE_IMAGE: (groupID: number) =>
    `/groups/${groupID}/update_image/`,
  STUDY_GROUPS_DELETE: (groupID: number) => `/groups/${groupID}/delete/`,
} as const;
