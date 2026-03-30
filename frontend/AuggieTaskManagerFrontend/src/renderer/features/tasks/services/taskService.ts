/**
 * taskService: API calls for tasks (CRUD).
 * Use axiosInstance and ENDPOINTS from renderer/api.
 */
import { Task } from '../../../types/task';
import { axiosInstance } from '../../../api/axiosInstance';
import { ENDPOINTS } from '../../../api/endpoints';

export class TaskService {
  static async getTasks(): Promise<Task[]> {
    const response = await axiosInstance.get(ENDPOINTS.TASKS);
    return response.data;
  }

  static async loadMoodleCalendarUrl(moodle_url: string): Promise<Task[]> {
    const response = await axiosInstance.post(ENDPOINTS.MOODLE_CALENDAR_URL, {
      moodle_url: moodle_url,
    });
    return response.data.tasks;
  }

  static async createTask(task: Task): Promise<Task> {
    const response = await axiosInstance.post(ENDPOINTS.TASKS, task);
    return response.data;
  }

  static async updateTask(task: Task): Promise<Task> {
    const response = await axiosInstance.put(`${ENDPOINTS.TASKS}${task.id}/`, {
      title: task.title,
      description: task.description,
      due_date: task.due_date,
      course: task.course,
      completed: task.completed,
      source: task.source,
    });
    return response.data;
  }

  static async deleteTask(taskId: number): Promise<void> {
    await axiosInstance.delete(`${ENDPOINTS.TASKS}${taskId}/`);
  }
}
