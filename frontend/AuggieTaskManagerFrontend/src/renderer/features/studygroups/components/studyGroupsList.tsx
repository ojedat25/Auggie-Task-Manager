import React, { useEffect } from 'react';
import { useStudyGroups } from '../hooks/useStudyGroups';
import { API_BASE } from '../../../../config';

export const StudyGroupList: React.FC = () => {
  const { groups, loading, error, fetchStudyGroups } = useStudyGroups();

  useEffect(() => {
    fetchStudyGroups();
  }, [fetchStudyGroups]);

  if (loading) return <p>Loading study groups...</p>;
  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;

  return (
    <div className="control-pane">
      <div className="control-section">
        <p style={{ fontSize: '20px', fontWeight: 600 }}>Study Groups</p>
        <div id="list-study-groups" style={{ maxHeight: 500, overflowY: 'auto' }}>
          {groups.length === 0 && <p>No study groups found.</p>}
          {groups.map((group) => (
            <div
              key={group.groupID}
              className="e-list-wrapper"
              style={{ borderBottom: 'inset', padding: '10px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', whiteSpace: 'normal' }}>
                {group.image ? (
                  <img
                    className="e-avatar"
                    src={
                      group.image.startsWith('http')
                        ? group.image
                        : `${API_BASE}${group.image.startsWith('/') ? '' : '/'}${group.image}`
                    }
                    alt={group.name}
                    style={{
                      width: '100px',
                      height: '100px',
                      borderRadius: '4px',
                      objectFit: 'cover',
                      flexShrink: 0,
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '100px',
                      height: '100px',
                      borderRadius: '4px',
                      background: '#BCBCBC',
                      flexShrink: 0,
                    }}
                  />
                )}
                <div
                  style={{
                    marginLeft: '20px',
                    textAlign: 'left',
                    maxWidth: '600px',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <span style={{ fontSize: '18px', fontWeight: 600, paddingBottom: '3px' }}>
                    {group.name}
                  </span>
                  <span style={{ fontSize: '14px', color: '#666', paddingBottom: '6px' }}>
                    {group.members.length} member{group.members.length !== 1 ? 's' : ''} · Created{' '}
                    {new Date(group.created_at).toLocaleDateString()}
                  </span>
                  <div style={{ fontSize: '15px' }}>{group.description}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
