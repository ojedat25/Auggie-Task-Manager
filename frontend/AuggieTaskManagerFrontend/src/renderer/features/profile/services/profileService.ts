import { axiosInstance } from '../../../api/axiosInstance';
import { ENDPOINTS } from '../../../api/endpoints';
import { UserProfile } from '../../../types/user';

// Handles all the profile-related API calls used by the profile page
export class ProfileService {
  static async getProfile(): Promise<UserProfile> {
    try {
      const response = await axiosInstance.get(ENDPOINTS.PROFILE_ME);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to load profile');
    }
  }
  /**
   * Updates the current user's profile data
   */
  static async updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const response = await axiosInstance.patch(ENDPOINTS.PROFILE_ME, data);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error || 'Failed to update profile'
      );
    }
  }

  /**
   * Deletes the current user's account and all associated data
   */
  static async deleteProfile(): Promise<void> {
    try {
      await axiosInstance.delete(ENDPOINTS.PROFILE_ME);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error || 'Failed to delete account'
      );
    }
  }
}
