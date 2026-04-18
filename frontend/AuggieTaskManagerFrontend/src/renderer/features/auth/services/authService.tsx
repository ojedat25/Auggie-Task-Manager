import { axiosInstance } from '../../../api/axiosInstance';
import { ENDPOINTS } from '../../../api/endpoints';
import {
  UserProfile,
  SignupData,
  LoginData,
  AuthResponse,
} from '../../../types/user';

// Key used to store the authentication token in localStorage
export const TOKEN_KEY = 'auggie_token';
export const USER_KEY = 'user';
// Handles all authentication-related API calls and session management
export class AuthService {
  // Fetch the currently logged-in user's profile from the backend
  static async getUserProfile(): Promise<UserProfile> {
    try {
      const response = await axiosInstance.get(ENDPOINTS.PROFILE_ME);
      return response.data;
    } catch (error: any) {
      // Return a readable error if the request fails
      throw new Error(
        error.response?.data?.error || 'Failed to fetch user data'
      );
    }
  }

  // Send signup data to the backend to create a new user
  static async signup(data: SignupData): Promise<{ message: string }> {
    try {
      const response = await axiosInstance.post(ENDPOINTS.SIGNUP, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Signup failed');
    }
  }

  // Log in a user with username/email and password
  static async logIn(credentials: LoginData): Promise<AuthResponse> {
    try {
      const response = await axiosInstance.post(ENDPOINTS.AUTH_LOGIN, {
        // Send both username and email so the backend can accept either
        username: credentials.identifier,
        email: credentials.identifier,
        password: credentials.password,
      });

      const { token, user } = response.data;

      // Store the authentication token for future requests
      this.saveToken(token);
      // Cache full user profile (includes moodle_url, etc.)
      try {
        const profile = await this.getUserProfile();
        console.log('profile', profile);
        this.saveUser(profile);
      } catch {
        // Fallback to minimal user payload from login response.
        this.saveUser(user);
      }

      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Login failed');
    }
  }

  static async logOut(): Promise<{ message: string }> {
    try {
      const response = await axiosInstance.post(ENDPOINTS.AUTH_LOGOUT);
      this.removeToken();
      this.removeUser();
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Logout failed');
    }
  }

  // Save authentication token to localStorage
  static saveToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }

  // Retrieve authentication token from localStorage
  static getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  // Remove authentication token from localStorage
  static removeToken(): void {
    localStorage.removeItem(TOKEN_KEY);
  }

  // Check if a user is currently authenticated
  static isAuthenticated(): boolean {
    return this.getToken() !== null;
  }

  // Retrieve the current user's data from localStorage
  static getCurrentUser() {
    const userJson = localStorage.getItem(USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  }

  // Save the current user's data to localStorage
  static saveUser(user: UserProfile): void {
    // Store user data in localStorage
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  static removeUser(): void {
    localStorage.removeItem(USER_KEY);
  }
}
