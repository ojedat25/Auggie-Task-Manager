import React, { useEffect, useState } from 'react';
import { ProfileService } from '../services/profileService';
import { UserProfile } from '../../../types/user';
import { AlertCard } from '../../../components/common/AlertCard';
import { useNavigate } from 'react-router-dom';
//import { AuthService } from '../../'

/**
 * User Profile Page which shows the currently logged in user's profile data
 * Uses the auth token to fetch the profile data from the backend
 */
export const Profile: React.FC = () => {
    const [profile, setProfile] = useState<UserProfile | null > (null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [saving, setSaving] = useState<boolean>(false);

    // Success message when profile is updated successfully
    const [successMessage, setSuccessMessage] = useState<string | null > (null);

    const [schoolYearInput, setSchoolYearInput] = useState<string>('');
    const [majorInput, setMajorInput ] = useState<string>('');
    const [minorInput, setMinorInput ] = useState<string>('');
    const [bioInput, setBioInput ] = useState<string>('');

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

    const startEditing = () => {
        if (!profile) return;

        setIsEditing(true);
        setError(null);
        setSuccessMessage(null);

        setSchoolYearInput(profile.schoolYear);
        setMajorInput(profile.major);

        // Minor and bio can have null values, so we convert them to '' for inputs
        if (profile.minor == null) setMinorInput('');
        else setMinorInput(profile.minor);

        if (profile.bio == null) setBioInput('');
        else setBioInput(profile.bio);
    };

    const cancelEditing = () => {
        setIsEditing(false);
        setSaving(false);
        setError(null);
        setSuccessMessage(null);
    };

    const handleSave = async () => {
        if (!profile) return;

        setSaving(true);
        setError(null);
        setSuccessMessage(null);

        // Building the values for PATCH
        const schoolYearValue = schoolYearInput.trim();
        const majorValue = majorInput.trim();

        let minorValue: string | null;
        if(minorInput.trim() === '') minorValue = null;
        else minorValue = minorInput.trim();

        let bioValue: string | null;
        if(bioInput.trim() === '') bioValue = null;
        else bioValue = bioInput.trim();

        try {
            const updated = await ProfileService.updateProfile({
                schoolYear: schoolYearValue,
                major: majorValue,
                minor: minorValue,
                bio: bioValue,
            });

            setProfile(updated);
            setIsEditing(false);
            setSuccessMessage("Profile updated successfully!");
        } catch (error: any) {
            setError(error instanceof Error ? error.message : 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };
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

    if (isEditing) {
        return (
            <div className="p-4 space-y-4">
                <h1 className="text-2xl font-bold">My Profile</h1>
                {successMessage && <AlertCard type="success" message={successMessage} />}
                {error && <AlertCard type="error" message={error} />}

                <div className="card bg-base-100 shadow-md">
                    <div className="card-body space-y-3">
                        <div className="text-lg font-semibold">
                            {profile?.user.first_name} {profile?.user.last_name}
                        </div>

                        <label className = "fieldset">
                            <span className = "label">School Year</span>
                            <input
                                className = "input input-primary validator w-full"
                                value = {schoolYearInput}
                                onChange = {(e) => setSchoolYearInput(e.target.value)}
                            />
                        </label>

                        <label className = "fieldset">
                            <span className = "label">Major</span>
                            <input
                                className = "input input-primary validator w-full"
                                value = {majorInput}
                                onChange = {(e) => setMajorInput(e.target.value)}
                                placeholder = "Enter your major"
                            />
                        </label>

                        <label className = "fieldset">
                            <span className = "label">Minor</span>
                            <input
                                className = "input input-primary validator w-full"
                                value = {minorInput}
                                onChange = {(e) => setMinorInput(e.target.value)}
                                placeholder = "Leave blank if NA"
                            />
                        </label>
                        <label className = "fieldset">
                            <span className = "label">Bio</span>
                            <input
                                className = "input input-primary validator w-full"
                                value = {bioInput}
                                onChange = {(e) => setBioInput(e.target.value)}
                                placeholder = "Short bio"
                            />
                        </label>

                        <div className = "flex gap-2 pt-2">
                            <button className = "btn btn-neutral" onClick = {handleSave} disabled = {saving}>
                                Save Changes
                            </button>
                            <button className = "btn btn-ghost" onClick = {cancelEditing} disabled = {saving}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className = "p-4 space-y-4">
            <h1 className = "text-2xl font-bold">My Profile</h1>

            {successMessage && <AlertCard type="success" message={successMessage} />}


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
                    <button className = "btn btn-primary" onClick = {startEditing}>Edit Profile</button>
                </div>
            </div>
        </div>
    );
};

export default Profile;