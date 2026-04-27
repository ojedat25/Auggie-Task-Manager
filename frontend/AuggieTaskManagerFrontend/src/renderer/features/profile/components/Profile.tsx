import React, { useEffect, useState } from 'react';
import { ProfileService } from '../services/profileService';
import { UserProfile } from '../../../types/user';
import { AlertCard } from '../../../components/common/AlertCard';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../../auth/services/authService';

/**
 * User Profile Page which shows the currently logged in user's profile data
 * Uses the auth token to fetch the profile data from the backend
 */
export const Profile: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);
  // Success message when profile is updated successfully
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [schoolYearInput, setSchoolYearInput] = useState<string>('');
  const [majorInput, setMajorInput] = useState<string>('');
  const [minorInput, setMinorInput] = useState<string>('');
  const [bioInput, setBioInput] = useState<string>('');

  const navigate = useNavigate();

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await ProfileService.getProfile();
        setProfile(data);
      } catch (error: any) {
        setError(
          error instanceof Error
            ? error.message
            : 'Failed to load the usersprofile'
        );
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
  // Cancels the editing mode and resets the form fields
  const cancelEditing = () => {
    setIsEditing(false);
    setSaving(false);
    setError(null);
    setSuccessMessage(null);
  };
  // Saving profile changes to the backend
  const handleSave = async () => {
    if (!profile) return;

    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    // Building the values for PATCH
    const schoolYearValue = schoolYearInput.trim();
    const majorValue = majorInput.trim();

    let minorValue: string | null;
    if (minorInput.trim() === '') minorValue = null;
    else minorValue = minorInput.trim();

    let bioValue: string | null;
    if (bioInput.trim() === '') bioValue = null;
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
      setSuccessMessage('Profile updated successfully!');
    } catch (error: any) {
      setError(
        error instanceof Error ? error.message : 'Failed to update profile'
      );
    } finally {
      setSaving(false);
    }
  };
  const handleDelete = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone.'
    );
    if (!confirmed) return;
    try {
      setDeleting(true);
      setError(null);
      setSuccessMessage(null);

      await ProfileService.deleteProfile();

      // Clearing local session
      AuthService.removeToken();
      AuthService.removeUser();

      // redirect to login page
      navigate('/login');
    } catch (error: any) {
      setError(
        error instanceof Error ? error.message : 'Failed to delete account'
      );
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <div className="p-4">Loading profile...</div>;
  }
  if (error) {
    return (
      <div className="p-4 space-y-4">
        <AlertCard type="error" message={error} autoHideMs={null} />
      </div>
    );
  }
  // Fallback if no profile data is found
  if (!profile) {
    return <div className="p-4"> No profile data found.</div>;
  }

  const { user, schoolYear, major, minor, bio } = profile;

  if (isEditing) {
    return (
      <div className="p-4 space-y-4">
        <h1 className="text-2xl font-bold">My Profile</h1>
        {successMessage && (
          <AlertCard
            type="success"
            message={successMessage}
            onDismiss={() => setSuccessMessage(null)}
          />
        )}
        {error && (
          <AlertCard
            type="error"
            message={error}
            onDismiss={() => setError(null)}
          />
        )}

        <div className="card bg-base-100 shadow-md">
          <div className="card-body space-y-3">
            <div className="text-lg font-semibold">
              {profile?.user.first_name} {profile?.user.last_name}
            </div>

            <label className="fieldset">
              <span className="label">School Year</span>
              <select
                value={schoolYearInput}
                onChange={(e) => setSchoolYearInput(e.target.value)}
                className="select select-primary validator"
                required
              >
                <option value="">Select year</option>
                <option value="Freshman">Freshman</option>
                <option value="Sophomore">Sophomore</option>
                <option value="Junior">Junior</option>
                <option value="Senior">Senior</option>
                <option value="Graduate">Graduate</option>
              </select>
            </label>

            <label className="fieldset">
              <span className="label">Major</span>
              <select
                value={majorInput}
                onChange={(e) => setMajorInput(e.target.value)}
                className="select select-primary validator"
                required
              >
                <option value="">Select a major</option>
                <option value="CS">Computer Science</option>
                <option value="CpE">Computer Engineering</option>
                <option value="EE">Electrical Engineering</option>
                <option value="ME">Mechanical Engineering</option>
                <option value="CE">Civil Engineering</option>
                <option value="BIO">Biology</option>
                <option value="CHEM">Chemistry</option>
                <option value="BUS">Business Administration</option>
                <option value="PSY">Psychology</option>
                <option value="NURS">Nursing</option>
                <option value="OTHER">Other</option>
              </select>
            </label>

            <label className="fieldset">
              <span className="label">Minor</span>
              <select
                value={minorInput}
                onChange={(e) => setMinorInput(e.target.value)}
                className="select select-primary validator"
              >
                <option value="">Select a minor</option>
                <option value="CS">Computer Science</option>
                <option value="CE">Computer Engineering</option>
                <option value="EE">Electrical Engineering</option>
                <option value="ME">Mechanical Engineering</option>
                <option value="CE">Civil Engineering</option>
                <option value="BIO">Biology</option>
                <option value="CHEM">Chemistry</option>
                <option value="BUS">Business Administration</option>
                <option value="PSY">Psychology</option>
                <option value="NURS">Nursing</option>
                <option value="OTHER">Other</option>
              </select>
            </label>

            <label className="fieldset">
              <span className="label">Bio</span>
              <input
                className="input input-primary validator w-full"
                value={bioInput}
                onChange={(e) => setBioInput(e.target.value)}
                placeholder="Short bio"
              />
            </label>

            <div className="flex gap-2 pt-2">
              <button
                className="btn btn-neutral"
                onClick={handleSave}
                disabled={saving}
              >
                Save Changes
              </button>
              <button
                className="btn btn-ghost"
                onClick={cancelEditing}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                className="btn btn-error"
                onClick={handleDelete}
                disabled={deleting || saving}
              >
                {deleting ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">My Profile</h1>

      {successMessage && (
        <AlertCard
          type="success"
          message={successMessage}
          onDismiss={() => setSuccessMessage(null)}
        />
      )}

      <div className="card bg-base-100 shadow-md">
        <div className="card-body space-y-2">
          <div className="text-lg font-semibold">
            {user.first_name} {user.last_name}
          </div>
          <div className="text-sm text-gray-500">@{user.username}</div>
          <div className="text-sm text-gray-500">{user.email}</div>

          <div className="space-y-1">
            <div>School Year: {schoolYear || 'N/A'}</div>
            <div>Major: {major || 'N/A'}</div>
            <div>Minor: {minor || 'N/A'}</div>
            <div>Bio: {bio || 'N/A'}</div>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button className="btn btn-primary btn-sm px-4" onClick={startEditing}>
          Edit Profile
        </button>
        <button
          className="btn btn-error btn-sm px-4"
          onClick={handleDelete}
          disabled={deleting || saving}
        >
          {deleting ? 'Deleting...' : saving ? 'Saving...' : 'Delete Account'}
        </button>
      </div>
    </div>
  );
};

export default Profile;
