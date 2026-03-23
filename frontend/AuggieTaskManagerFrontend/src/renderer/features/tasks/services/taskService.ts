/**
 * taskService: API calls for tasks (CRUD).
 * Use axiosInstance and ENDPOINTS from renderer/api.
 */
import { Task } from '../../../types/task';
import { axiosInstance } from '../../../api/axiosInstance';
import { ENDPOINTS } from '../../../api/endpoints';
import { AuthService } from '../../auth/services/authService';

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
}