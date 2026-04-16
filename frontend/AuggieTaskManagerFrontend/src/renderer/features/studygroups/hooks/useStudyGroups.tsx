import { useCallback, useState } from 'react';

import { StudyGroupService } from '../services/studyGroupService';
import { StudyGroup } from '../../../types/studyGroup';

export const useStudyGroups = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [groups, setGroups] = useState<StudyGroup[]>([]);

  const fetchStudyGroups = useCallback(async (): Promise<StudyGroup[] | null> => {
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
  }, []);

  return { loading, error, groups, fetchStudyGroups };
};