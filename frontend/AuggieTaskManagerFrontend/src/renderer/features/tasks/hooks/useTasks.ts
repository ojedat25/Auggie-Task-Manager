/**
 * Task list state: load from the API, import from Moodle, update, and delete.
 */
import { useState, useCallback, useMemo, useEffect } from 'react';
import { Task, TaskForm } from '../../../types/task';
import { TaskService } from '../services/taskService';
import { AuthService } from '../../auth/services/authService';
import {
  offsetDateByCalendarMonths,
  offsetDateByWeeks,
  endOfCurrentMonth,
  endOfCurrentWeek,
  startOfCurrentMonth,
  startOfCurrentWeek,
} from '../utils';

export {
  startOfCurrentWeek,
  endOfCurrentWeek,
  startOfCurrentMonth,
  endOfCurrentMonth,
} from '../utils';

/**
 * Returns task rows, Moodle URL UI state, and handlers wired to TaskService.
 */

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const initialUser = AuthService.getCurrentUser();
  const [moodleUrl, setMoodleUrl] = useState<string | null>(
    initialUser?.moodle_url || null
  );
  const [isAscending, setIsAscending] = useState<boolean>(true);
  const [hasMoodleUrl, setHasMoodleUrl] = useState<boolean>(
    moodleUrl !== null && moodleUrl !== ''
  );
  const [isMoodleSyncing, setIsMoodleSyncing] = useState(false);

  const [taskViewMode, setTaskViewMode] = useState<'weekly' | 'monthly'>(
    'weekly'
  );
  const [weekOffset, setWeekOffset] = useState(0);
  const [monthOffset, setMonthOffset] = useState(0);

  const weekStart = useMemo(() => {
    const anchor = offsetDateByWeeks(new Date(), weekOffset);
    return startOfCurrentWeek(1, anchor);
  }, [weekOffset]);

  const weekEnd = useMemo(() => {
    const anchor = offsetDateByWeeks(new Date(), weekOffset);
    return endOfCurrentWeek(1, anchor);
  }, [weekOffset]);

  const monthStart = useMemo(() => {
    const anchor = offsetDateByCalendarMonths(new Date(), monthOffset);
    return startOfCurrentMonth(anchor);
  }, [monthOffset]);

  const monthEnd = useMemo(() => {
    const anchor = offsetDateByCalendarMonths(new Date(), monthOffset);
    return endOfCurrentMonth(anchor);
  }, [monthOffset]);

  const revertMoodleUrlFromProfile = useCallback(() => {
    const saved = AuthService.getCurrentUser()?.moodle_url;
    setMoodleUrl(saved != null && saved !== '' ? saved : null);
  }, []);

  /** Syncs Moodle calendar; replaces local tasks with the full list returned by the server. */
  const handleSyncMoodleTasks = useCallback(async (): Promise<boolean> => {
    const url = (
      moodleUrl ??
      AuthService.getCurrentUser()?.moodle_url ??
      ''
    ).trim();
    if (!url) {
      setErrorMessage('Add your Moodle calendar URL to sync.');
      return false;
    }
    setIsMoodleSyncing(true);
    setErrorMessage(null);
    try {
      const result = await TaskService.loadMoodleCalendarUrl(url);
      setTasks(result);
      setHasMoodleUrl(true);
      setMoodleUrl(url);

      try {
        const current = AuthService.getCurrentUser();
        const profile = await AuthService.getUserProfile();
        if (!current || current.moodle_url !== profile.moodle_url) {
          AuthService.saveUser(profile);
        }
      } catch {
        const current = AuthService.getCurrentUser();
        if (current && current.moodle_url !== url) {
          AuthService.saveUser({ ...current, moodle_url: url });
        }
      }
      return true;
    } catch {
      setErrorMessage('Error syncing Moodle calendar');
      return false;
    } finally {
      setIsMoodleSyncing(false);
    }
  }, [moodleUrl]);

  /** Replaces local tasks with the full list from the server. */
  const fetchTasks = useCallback(async () => {
    try {
      const fetched = await TaskService.getTasks();
      setTasks(fetched);
    } catch {
      setErrorMessage('Error fetching tasks');
    }
  }, []);


  useEffect(() => {
    void fetchTasks();
  }, [fetchTasks]);

  const prevWeek = useCallback(() => {
    setWeekOffset((o) => o - 1);
  }, []);
  const nextWeek = useCallback(() => {
    setWeekOffset((o) => o + 1);
  }, []);
  const resetWeekOffset = useCallback(() => {
    setWeekOffset(0);
  }, []);

  const prevMonth = useCallback(() => {
    setMonthOffset((o) => o - 1);
  }, []);
  const nextMonth = useCallback(() => {
    setMonthOffset((o) => o + 1);
  }, []);
  const resetMonthOffset = useCallback(() => {
    setMonthOffset(0);
  }, []);

  /** Persists task changes via PUT and merges the response into local state by id. */
  const updateTask = useCallback(async (task: Task) => {
    try {
      const updated = await TaskService.updateTask(task);
      setTasks((tasks: Task[]) =>
        tasks.map((currentTask: Task) =>
          currentTask.id === task.id ? updated : currentTask
        )
      );
    } catch {
      setErrorMessage('Error updating task');
    }
  }, []);

  /** Completes a task on the server and updates the local state. */
  const completeTask = useCallback(async (task: Task) => {
    try {
      const completed = await TaskService.updateTask({
        ...task,
        completed: true,
      });
      setTasks((tasks: Task[]) =>
        tasks.map((currentTask: Task) =>
          currentTask.id === task.id ? completed : currentTask
        )
      );
    } catch {
      setErrorMessage('Error completing task');
    }
  }, []);

  /** Marks a task as not completed on the server and updates local state. */
  const uncompleteTask = useCallback(async (task: Task) => {
    try {
      const updated = await TaskService.updateTask({
        ...task,
        completed: false,
      });
      setTasks((tasks: Task[]) =>
        tasks.map((currentTask: Task) =>
          currentTask.id === task.id ? updated : currentTask
        )
      );
    } catch {
      setErrorMessage('Error updating task');
    }
  }, []);

  /** Deletes a task on the server and removes it from local state. */
  const deleteTask = useCallback(async (taskId: number) => {
    try {
      await TaskService.deleteTask(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } catch {
      setErrorMessage('Error deleting task');
    }
  }, []);

  /** Creates a new task on the server and adds it to local state. Returns whether the request succeeded. */
  const createTask = useCallback(async (values: TaskForm): Promise<boolean> => {
    try {
      const created = await TaskService.createTask(values);
      setTasks((prev) => [...prev, created]);
      return true;
    } catch {
      setErrorMessage('Error creating task');
      return false;
    }
  }, []);

  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      const aDate = new Date(a.due_date);
      const bDate = new Date(b.due_date);
      return isAscending
        ? aDate.getTime() - bDate.getTime()
        : bDate.getTime() - aDate.getTime();
    });
  }, [tasks, isAscending]);

  const clearErrorMessage = useCallback(() => {
    setErrorMessage(null);
  }, []);

  return {
    tasks,
    sortedTasks,
    isAscending,
    setIsAscending,
    errorMessage,
    clearErrorMessage,
    moodleUrl,
    setMoodleUrl,
    hasMoodleUrl,
    handleSyncMoodleTasks,
    revertMoodleUrlFromProfile,
    isMoodleSyncing,
    fetchTasks,
    updateTask,
    deleteTask,
    createTask,
    completeTask,
    uncompleteTask,
    taskViewMode,
    setTaskViewMode,
    weekOffset,
    monthOffset,
    weekStart,
    weekEnd,
    monthStart,
    monthEnd,
    prevWeek,
    nextWeek,
    resetWeekOffset,
    prevMonth,
    nextMonth,
    resetMonthOffset,
  };
}
