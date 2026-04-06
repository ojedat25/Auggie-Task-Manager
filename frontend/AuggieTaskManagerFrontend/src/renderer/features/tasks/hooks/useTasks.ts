/**
 * Task list state: load from the API, import from Moodle, update, and delete.
 */
import { useState, useCallback } from 'react';
import { Task } from '../../../types/task';
import { TaskService } from '../services/taskService';
import { AuthService } from '../../auth/services/authService';

/**
 * Returns task rows, Moodle URL UI state, and handlers wired to TaskService.
 */
export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [moodleUrl, setMoodleUrl] = useState<string | null>(
    AuthService.getCurrentUser()?.moodle_url
  );
  const [hasMoodleUrl, setHasMoodleUrl] = useState<boolean>(
    moodleUrl !== null && moodleUrl !== ''
  );

  /** Loads tasks from the user’s Moodle calendar URL and appends them to the list. */
  const handleImportMoodleTasks = useCallback(async () => {
    if (moodleUrl) {
      const result = await TaskService.loadMoodleCalendarUrl(moodleUrl);
      setTasks((prev) => [...prev, ...result]);
      setHasMoodleUrl(true);
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
      const completed = await TaskService.updateTask({ ...task, completed: true });
      setTasks((tasks: Task[]) =>
        tasks.map((currentTask: Task) => currentTask.id === task.id ? completed : currentTask)
      );
    } catch {
      setErrorMessage('Error completing task');
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

  /** Creates a new task on the server and adds it to local state. */
  const createTask = useCallback(async (task: Task) => {
    try {
      const created = await TaskService.createTask(task);
      setTasks((prev) => [...prev, created]);
    } catch {
      setErrorMessage('Error creating task');
    }
  }, []);

  return {
    tasks,
    errorMessage,
    moodleUrl,
    setMoodleUrl,
    hasMoodleUrl,
    handleImportMoodleTasks,
    fetchTasks,
    updateTask,
    deleteTask,
    createTask,
    completeTask,
  };
}
