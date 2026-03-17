import { axiosInstance } from '../../../api/axiosInstance';
import { ENDPOINTS } from '../../../api/endpoints';
import { UserProfile } from '../../../types/user';


// Handles all the profile-related API calls used by the profile page
export class ProfileService { 
    static async getProfile(userId: number): Promise<UserProfile> {
        try {
            const response = await axiosInstance.get(ENDPOINTS.PROFILE_DETAIL(userId));
            return response.data; 
        } catch (error: any) {
            throw new Error(error.response?.data?.error || "Failed to load profile");
        }
    }

    static async updateProfile(userId: number, data: Partial<UserProfile>): Promise<UserProfile> {
        try {
            const response = await axiosInstance.patch(ENDPOINTS.PROFILE_DETAIL(userId), data);
            return response.data;
        } catch(error: any) {
            throw new Error(error.response?.data?.error || 'Failed to update profile');
        }
    }

    static async deleteProfile(userId: number): Promise<void> {
        try {
            await axiosInstance.delete(ENDPOINTS.PROFILE_DETAIL(userId));
        } catch(error: any) {
            throw new Error(error.response?.data?.error || 'Failed to delete account');
        }
    }
}