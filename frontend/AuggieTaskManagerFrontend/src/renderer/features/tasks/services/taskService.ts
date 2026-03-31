/**
 * taskService: API calls for tasks (CRUD).
 * Use axiosInstance and ENDPOINTS from renderer/api.
 */
import { axiosInstance } from '../../../api/axiosInstance';
import { ENDPOINTS } from '../../../api/endpoints';

export type ApiTask = {
  id: number | string;
  title: string;
  description?: string;
  due_date: string | null;
  course: string;
  source: 'manual' | 'moodle';
  completed: boolean;
};

export type UpcomingTask = {
  id: string;
  title: string;
  dueAt: string;
  course?: string;
};

function toUpcomingTask(t: ApiTask): UpcomingTask | null {
  if (!t.due_date) return null;
  return {
    id: String(t.id),
    title: t.title,
    dueAt: t.due_date,
    course: t.course || undefined,
  };
}

export const TaskService = {
  async getUpcomingTasks(params?: { limit?: number; days?: number }): Promise<UpcomingTask[]> {
    const resp = await axiosInstance.get<ApiTask[]>(ENDPOINTS.TASKS_UPCOMING, { params });
    return resp.data.map(toUpcomingTask).filter((x): x is UpcomingTask => x !== null);
  },
};
