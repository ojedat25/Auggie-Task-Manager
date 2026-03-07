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
  major: string;
  minor: string | null;
  bio: string | null;
}

export interface SignupData {
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  password: string;
  major: string;
  minor?: string;
}


