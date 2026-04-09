import { TaskService, type ApiTask } from '../../tasks/services/taskService';

/**
 * Dashboard calendar-specific service layer.
 * Keeps hooks/components aligned with the Homepage pattern: component -> hook -> service.
 */
export const TaskCalendarService = {
  async getRange(params?: { start?: string; end?: string }): Promise<ApiTask[]> {
    return TaskService.getCalendarTasks(params);
  },
};

