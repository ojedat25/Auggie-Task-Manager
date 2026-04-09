import { useEffect, useMemo, useState } from 'react';

import type { ApiTask } from '../../tasks/services/taskService';

import { TaskCalendarService } from '../services/taskCalendarService';

import { addDays, formatYmd, startOfDay } from '../utils/calendarDate';
import { parseTaskDayKey } from '../utils/calendarTask';

export function useTaskCalendarRange(params: {
  start: Date;
  days: number;
}) {
  const [tasks, setTasks] = useState<ApiTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const rangeStart = useMemo(() => startOfDay(params.start), [params.start]);
  const rangeEnd = useMemo(
    () => addDays(rangeStart, Math.max(0, params.days - 1)),
    [rangeStart, params.days]
  );

  const dayKeys = useMemo(() => {
    const keys: string[] = [];
    for (let i = 0; i < params.days; i += 1) {
      keys.push(formatYmd(addDays(rangeStart, i)));
    }
    return keys;
  }, [params.days, rangeStart]);

  const tasksByDay = useMemo(() => {
    const map = new Map<string, ApiTask[]>();
    // ensure all keys exist so rendering can be simple
    for (const k of dayKeys) map.set(k, []);

    for (const t of tasks) {
      const key = parseTaskDayKey(t.due_date);
      if (!key) continue;
      const arr = map.get(key);
      if (arr) arr.push(t);
    }

    for (const [k, arr] of map.entries()) {
      arr.sort((a, b) => {
        const at = a.due_date ? new Date(a.due_date).getTime() : 0;
        const bt = b.due_date ? new Date(b.due_date).getTime() : 0;
        if (at !== bt) return at - bt;
        return a.title.localeCompare(b.title);
      });
      map.set(k, arr);
    }

    return map;
  }, [dayKeys, tasks]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const startIso = rangeStart.toISOString();
        const endIso = addDays(rangeEnd, 1).toISOString();
        const data = await TaskCalendarService.getRange({ start: startIso, end: endIso });
        if (!cancelled) setTasks(data);
      } catch {
        if (!cancelled) setError('Failed to load tasks for the week.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [rangeStart, rangeEnd]);

  const todayKey = useMemo(() => formatYmd(new Date()), []);

  return {
    rangeStart,
    rangeEnd,
    dayKeys,
    tasks,
    tasksByDay,
    loading,
    error,
    todayKey,
  };
}

