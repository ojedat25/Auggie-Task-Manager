/**
 * User types (mirror Django auth/user models).
 */
export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

export interface UserProfile {
  user: User;
  schoolYear: string;
  major: string;
  minor: string | null;
  bio: string | null;
  moodle_url: string | null;
}

export interface SignupData {
  firstname: string;
  lastname: string;
  username: string;
  email: string;
  password: string;
  schoolyear?: string;
  major: string;
  minor?: string;
}

/**
 * Data sent from the login form.
 * Either email or username can be used to log in.
 */
export interface LoginData {
  identifier: string; // can be email or username
  password: string;
}

/**
 * Data returned from the backend after login/signup.
 */
export interface AuthResponse {
  user: User;             // the logged-in user info
  token: string;          // auth token (JWT or session token)
  profile?: UserProfile;  // optional profile info
  message?: string;       // optional message from the server
}

