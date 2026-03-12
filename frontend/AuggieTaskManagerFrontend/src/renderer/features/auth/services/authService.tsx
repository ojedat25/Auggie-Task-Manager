import { axiosInstance } from '../../../api/axiosInstance';
import { ENDPOINTS } from '../../../api/endpoints';
import { UserProfile, SignupData, LoginData, AuthResponse } from '../../../types/user';

// Handles all authentication-related API calls and session management
export class AuthService {

  // Key used to store the authentication token in sessionStorage
  private static TOKEN_KEY = 'auggie_token';

  // Fetch the currently logged-in user's profile from the backend
  static async getUserProfile(): Promise<UserProfile> {
    try {
      const response = await axiosInstance.get(ENDPOINTS.AUTH_ME);
      return response.data;
    } catch (error: any) {
      // Return a readable error if the request fails
      throw new Error(error.response?.data?.error || 'Failed to fetch user data');
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
        username: credentials.usernameOrEmail,
        email: credentials.usernameOrEmail,
        password: credentials.password,
      });

      const { token, user } = response.data;

      // Store the authentication token for future requests
      this.saveToken(token);

      // Store user data in sessionStorage
      sessionStorage.setItem('user', JSON.stringify(user));

      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Login failed');
    }
  }

  // Save authentication token to sessionStorage
  static saveToken(token: string): void {
    sessionStorage.setItem(this.TOKEN_KEY, token);
  }

  // Retrieve authentication token from sessionStorage
  static getToken(): string | null {
    return sessionStorage.getItem(this.TOKEN_KEY);
  }

  // Remove authentication token from sessionStorage
  static removeToken(): void {
    sessionStorage.removeItem(this.TOKEN_KEY);
  }

  // Check if a user is currently authenticated
  static isAuthenticated(): boolean {
    return this.getToken() !== null;
  }

  // Retrieve the current user's data from sessionStorage
  static getCurrentUser() {
    const userJson = sessionStorage.getItem('user');
    return userJson ? JSON.parse(userJson) : null;
  }

  // Log out the user by clearing stored authentication data
  static logOut(): void {
    this.removeToken();
    sessionStorage.removeItem('user');
  }
}