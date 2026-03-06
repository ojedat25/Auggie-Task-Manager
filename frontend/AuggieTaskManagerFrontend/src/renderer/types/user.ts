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
