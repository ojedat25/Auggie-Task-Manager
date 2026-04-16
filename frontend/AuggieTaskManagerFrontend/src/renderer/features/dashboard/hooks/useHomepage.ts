import { useEffect, useMemo, useState } from 'react';
import {
  HomePageService,
  type UpcomingTask,
  getMockUpcomingTasks,
} from '../services/homePageService';

export function useHomepage() {
  const [displayName, setDisplayName] = useState<string>('');
  const [loadingUser, setLoadingUser] = useState<boolean>(true);

  const [upcomingTasks, setUpcomingTasks] = useState<UpcomingTask[]>([]);
  const [loadingTasks, setLoadingTasks] = useState<boolean>(true);

  const sortedUpcomingTasks = useMemo(() => {
    return upcomingTasks
      .slice()
      .sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime())
      ;
  }, [upcomingTasks]);

  useEffect(() => {
    let cancelled = false;

    async function loadUser() {
      setLoadingUser(true);
      try {
        const name = await HomePageService.getDisplayName();
        if (!cancelled) setDisplayName(name);
      } catch {
        if (!cancelled) setDisplayName('');
      } finally {
        if (!cancelled) setLoadingUser(false);
      }
    }

    void loadUser();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadUpcomingTasks() {
      setLoadingTasks(true);
      try {
        // Fetch all upcoming tasks for the next 7 days (no client-side limit).
        const tasks = await HomePageService.getUpcomingTasks({ days: 7 });
        if (!cancelled) setUpcomingTasks(tasks);
      } catch {
        // keep dashboard usable if API is down
        if (!cancelled) setUpcomingTasks(getMockUpcomingTasks());
      } finally {
        if (!cancelled) setLoadingTasks(false);
      }
    }

    void loadUpcomingTasks();
    return () => {
      cancelled = true;
    };
  }, []);

  return {
    displayName,
    loadingUser,
    upcomingTasks,
    sortedUpcomingTasks,
    loadingTasks,
  };
}
