import { useEffect, useMemo, useState } from 'react';

import { TaskService, type ApiTask } from '../../tasks/services/taskService';

import {
  addDays,
  buildMonthGrid,
  formatYmd,
  startOfMonth,
} from '../utils/calendarDate';
import { parseTaskDayKey } from '../utils/calendarTask';

export function useTaskCalendar() {
  const [viewDate, setViewDate] = useState<Date>(() =>
    startOfMonth(new Date())
  );
  const [tasks, setTasks] = useState<ApiTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { gridStart, gridEnd, days } = useMemo(
    () => buildMonthGrid(viewDate),
    [viewDate]
  );

  const tasksByDay = useMemo(() => {
    const map = new Map<string, ApiTask[]>();
    for (const t of tasks) {
      const key = parseTaskDayKey(t.due_date);
      if (!key) continue;
      const arr = map.get(key);
      if (arr) arr.push(t);
      else map.set(key, [t]);
    }

    // Stable ordering: due time then title
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
  }, [tasks]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        // Query range: inclusive start..end, so end is end-of-day.
        const startIso = gridStart.toISOString();
        const endIso = addDays(gridEnd, 1).toISOString();
        const data = await TaskService.getCalendarTasks({
          start: startIso,
          end: endIso,
        });
        if (!cancelled) setTasks(data);
      } catch {
        if (!cancelled) setError('Failed to load tasks for calendar.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [gridStart, gridEnd]);

  const todayKey = useMemo(() => formatYmd(new Date()), []);

  return {
    viewDate,
    setViewDate,
    gridStart,
    gridEnd,
    days,
    tasks,
    tasksByDay,
    loading,
    error,
    todayKey,
  };
}
