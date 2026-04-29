import React, { useEffect, useState } from 'react';
import { useStudyGroups } from '../hooks/useStudyGroups';
import { StudyGroupService } from '../services/studyGroupService';
import { API_BASE } from '../../../../config';

interface StudyGroupFormProps {
  groupID?: number | null;
  onBack: () => void;
}

export const StudyGroupForm: React.FC<StudyGroupFormProps> = ({
  groupID,
  onBack,
}) => {
  const {
    groups,
    fetchAllStudyGroups,
    createStudyGroup,
    updateStudyGroup,
    loading,
    error,
  } = useStudyGroups();

  const isEditing = !!groupID;
  const existingGroup = groups.find((g) => g.groupID === groupID);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!image) {
      setPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(image);
    setPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [image]);

  useEffect(() => {
    if (isEditing && groups.length === 0) {
      fetchAllStudyGroups();
    }
  }, [isEditing, groups.length, fetchAllStudyGroups]);

  useEffect(() => {
    if (!isEditing) {
      setName('');
      setDescription('');
      setIsPrivate(false);
      setImage(null);
      return;
    }

    if (existingGroup) {
      setName(existingGroup.name);
      setDescription(existingGroup.description);
      setIsPrivate(existingGroup.private);
    }
  }, [isEditing, existingGroup]);

  const handleSubmit = async () => {
    if (isEditing && groupID) {
      const success = await updateStudyGroup(
        groupID,
        name,
        description,
        isPrivate
      );
      if (success && image) {
        await StudyGroupService.updateStudyGroupImage(groupID, image);
      }
      if (success) onBack();
    } else {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('private', String(isPrivate));
      if (image) formData.append('image', image);

      const result = await createStudyGroup(formData);
      if (result) onBack();
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '24px' }}>
      <h2 style={{ fontSize: '22px', fontWeight: 600, marginBottom: '24px' }}>
        {isEditing ? 'Edit Study Group' : 'Create Study Group'}
      </h2>

      {error && (
        <p style={{ color: 'red', marginBottom: '16px' }}>Error: {error}</p>
      )}

      <div style={{ marginBottom: '16px' }}>
        <label
          style={{ display: 'block', marginBottom: '6px', fontWeight: 500 }}
        >
          Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{
            width: '100%',
            padding: '8px',
            borderRadius: '4px',
            border: '1px solid #ccc',
            fontSize: '15px',
          }}
        />
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label
          style={{ display: 'block', marginBottom: '6px', fontWeight: 500 }}
        >
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          style={{
            width: '100%',
            padding: '8px',
            borderRadius: '4px',
            border: '1px solid #ccc',
            fontSize: '15px',
          }}
        />
      </div>

      <div
        style={{
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        <label style={{ fontWeight: 500 }}>Private</label>
        <input
          type="checkbox"
          checked={isPrivate}
          onChange={(e) => setIsPrivate(e.target.checked)}
          style={{ width: '16px', height: '16px' }}
        />
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label
          style={{ display: 'block', marginBottom: '6px', fontWeight: 500 }}
        >
          {isEditing ? 'Update Image (optional)' : 'Image (optional)'}
        </label>
        <div
          style={{
            border: '2px dashed #ccc',
            borderRadius: '8px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px',
            background: '#730101',
          }}
        >
          {isEditing && existingGroup?.image && !image && (
            <div style={{ textAlign: 'center' }}>
              <p
                style={{ fontSize: '13px', color: '#666', marginBottom: '4px' }}
              >
                Current image:
              </p>
              <img
                src={`${API_BASE}${existingGroup.image}`}
                alt="Current group"
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '4px',
                  objectFit: 'cover',
                }}
              />
            </div>
          )}
          {image && previewUrl && (
            <div style={{ textAlign: 'center' }}>
              <p
                style={{ fontSize: '13px', color: '#666', marginBottom: '4px' }}
              >
                New image:
              </p>
              <img
                src={previewUrl}
                alt="Preview"
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '4px',
                  objectFit: 'cover',
                }}
              />
            </div>
          )}
          <label
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              fontSize: '14px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              background: '#fff',
              cursor: 'pointer',
              color: '#333',
            }}
          >
            📎 {image ? image.name : 'Choose image'}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files?.[0] ?? null)}
              style={{ display: 'none' }}
            />
          </label>
          <p style={{ fontSize: '13px', color: '#999', margin: 0 }}>
            PNG, JPG, GIF up to 10MB
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px' }}>
        <button
          onClick={handleSubmit}
          disabled={loading || !name}
          className="btn btn-primary"
        >
          {loading ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Group'}
        </button>
        <button onClick={onBack} className="btn btn-primary">
          Cancel
        </button>
      </div>
    </div>
  );
};
