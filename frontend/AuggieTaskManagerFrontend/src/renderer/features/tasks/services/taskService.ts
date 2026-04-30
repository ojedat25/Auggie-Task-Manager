/**
 * taskService: API calls for tasks (CRUD).
 * Use axiosInstance and ENDPOINTS from renderer/api.
 */
import { Task, TaskForm } from '../../../types/task';
import { axiosInstance } from '../../../api/axiosInstance';
import { ENDPOINTS } from '../../../api/endpoints';

export class TaskService {
  static async getTasks(params?: {
    start?: string;
    end?: string;
  }): Promise<Task[]> {
    if (!params) {
      const response = await axiosInstance.get(ENDPOINTS.TASKS);
      return response.data;
    }
    const response = await axiosInstance.get<Task[]>(ENDPOINTS.TASKS_CALENDAR, {
      params,
    });
    return response.data;
  }

  static async loadMoodleCalendarUrl(moodle_url: string): Promise<Task[]> {
    const response = await axiosInstance.post(ENDPOINTS.MOODLE_CALENDAR_URL, {
      moodle_url: moodle_url,
    });
    return response.data.tasks;
  }

  static async getUpcomingTasks(params?: {
    limit?: number;
    days?: number;
  }): Promise<UpcomingTask[]> {
    const resp = await axiosInstance.get<ApiTask[]>(ENDPOINTS.TASKS_UPCOMING, {
      params,
    });
    return resp.data
      .map(toUpcomingTask)
      .filter((x): x is UpcomingTask => x !== null);
  }

  static async getCalendarTasks(params?: {
    start?: string;
    end?: string;
  }): Promise<ApiTask[]> {
    const resp = await axiosInstance.get<ApiTask[]>(ENDPOINTS.TASKS_CALENDAR, {
      params,
    });
    return resp.data;
  }

  static async createTask(form: TaskForm): Promise<Task> {
    const response = await axiosInstance.post(ENDPOINTS.TASKS, {
      title: form.title,
      description: form.description,
      course: form.course,
      due_date: form.due_date.trim() === '' ? null : form.due_date,
      completed: false,
    });
    return response.data;
  }

  static async updateTask(task: Task): Promise<Task> {
    const response = await axiosInstance.put(`${ENDPOINTS.TASKS}${task.id}/`, {
      title: task.title,
      description: task.description,
      due_date: task.due_date,
      course: task.course,
      semester: task.semester,
      completed: task.completed,
      source: task.source,
    });
    return response.data;
  }

  static async deleteTask(taskId: number): Promise<void> {
    await axiosInstance.delete(`${ENDPOINTS.TASKS}${taskId}/`);
  }
}

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
