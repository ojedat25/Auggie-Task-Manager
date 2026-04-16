import { StudyGroup } from '../../../types/studyGroup';

const BASE_URL = '/groups';

export async function fetchStudyGroups(): Promise<StudyGroup[]> {
  const response = await fetch(`${BASE_URL}/`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }

  return response.json();
}