import { useState } from 'react';

import { StudyGroupService } from '../services/studyGroupService';
import { StudyGroup } from '../../../types/studyGroup';
import { AuthService } from '../../auth/services/authService';

export const useStudyGroups = () => {
  const currentUser = AuthService.getCurrentUser();
  const currentUserID = currentUser?.user?.id;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [groups, setGroups] = useState<StudyGroup[]>([]);

  const fetchMyStudyGroups = async (): Promise<StudyGroup[] | null> => {
    setLoading(true);
    setError(null);

    try {
      const data = await StudyGroupService.fetchStudyGroups();
      setGroups(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch study groups');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchAllStudyGroups = async (): Promise<StudyGroup[] | null> => {
    setLoading(true);
    setError(null);

    try {
      const data = await StudyGroupService.fetchAllStudyGroups();
      setGroups(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch all study groups');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const joinStudyGroup = async (groupID: number): Promise<{ message: string } | null> => {
    setLoading(true);
    setError(null);

    try {
      const data = await StudyGroupService.joinStudyGroup(groupID);
      setGroups((prev) =>
        prev.map((g) =>
          g.groupID === groupID ? { ...g, members: [...g.members, currentUserID] } : g
        )
      );
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join study group');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const leaveStudyGroup = async (groupID: number): Promise<{ message: string } | null> => {
    setLoading(true);
    setError(null);

    try {
      const data = await StudyGroupService.leaveStudyGroup(groupID);
      setGroups((prev) =>
        prev.map((g) =>
          g.groupID === groupID ? { ...g, members: g.members.filter((id) => id !== currentUserID) } : g
        )
      );
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to leave study group');
      return null;
    } finally {
      setLoading(false);
    }
  };



  const createStudyGroup = async (formData: FormData): Promise<StudyGroup | null> => {
    setLoading(true);
    setError(null);

    try {
      const data = await StudyGroupService.createStudyGroup(formData);
      await fetchMyStudyGroups(); // ← refetch instead of local state update
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create study group');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateStudyGroup = async (groupID: number, name: string, description: string, private_: boolean): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      await StudyGroupService.updateStudyGroup(groupID, name, description, private_);
      setGroups((prev) =>
        prev.map((g) =>
          g.groupID === groupID ? { ...g, name, description, private: private_ } : g
        )
      );
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update study group');
      return false;
    } finally {
      setLoading(false);
    }
  };


  const deleteStudyGroup = async (groupID: number): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      await StudyGroupService.deleteStudyGroup(groupID);
      setGroups((prev) => prev.filter((g) => g.groupID !== groupID));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete study group');
      return false;
    } finally {
      setLoading(false);
    }
  };

// add to return:
return { loading, error, groups, fetchMyStudyGroups, fetchAllStudyGroups, joinStudyGroup, leaveStudyGroup, createStudyGroup, updateStudyGroup, deleteStudyGroup };
};