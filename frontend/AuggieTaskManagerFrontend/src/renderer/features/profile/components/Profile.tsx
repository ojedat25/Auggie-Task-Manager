import React, {useEffect, useState} from 'react';
import { ProfileService } from '../services/profileService';
import {UserProfile} from '../../../types/user';
import {AlertCard} from '../../../components/common/AlertCard';

/**
 * User Profile Page which shows the currently logged in user's profile data
 * Uses the auth token to fetch the profile data from the backend
 */
export const Profile: React.FC = () => {
    const [profile, setProfile] = useState<UserProfile | null > (null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() =>{
        const loadProfile = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await ProfileService.getProfile();
                setProfile(data);
            } catch (error: any) {
                setError(error instanceof Error ? error.message : 'Failed to load the usersprofile')
            } finally {
                setLoading(false);
            }
        };
        loadProfile();
    }, []);

    if (loading) {
        return <div className = "p-4">Loading profile...</div>;
    } 
    if (error) {
    return (
        <div className = "p-4 space-y-4">
                <AlertCard type = "error" message = {error} />
            </div>
        );
    }

    if (!profile) {
        return <div className = "p-4"> No profile data found.</div>;
    }

    const {user, schoolYear, major, minor, bio} = profile;

    return (
        <div className = "p-4 space-y-4">
            <h1 className = "text-2xl font-bold">My Profile</h1>

            <div className = "card bg-base-100 shadow-md">
                <div className = "card-body space-y-2">
                    <div className = "text-lg font-semibold">
                        {user.first_name} {user.last_name}
                    </div>
                    <div className = "text-sm text-gray-500">@{user.username}</div>
                    <div className = "text-sm text-gray-500">{user.email}</div>

                    <div className = "space-y-1">
                        <div>School Year: {schoolYear || 'N/A'}</div>
                        <div>Major: {major || 'N/A'}</div>
                        <div>Minor: {minor || 'N/A'}</div>
                        <div>Bio: {bio || 'N/A'}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;