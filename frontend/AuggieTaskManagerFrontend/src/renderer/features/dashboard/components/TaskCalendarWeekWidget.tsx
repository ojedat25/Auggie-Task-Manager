import { useMemo } from 'react';

import { useTaskCalendarRange } from '../hooks/useTaskCalendarRange';
import { addDays, formatYmd, startOfDay } from '../utils/calendarDate';
import { taskBadgeClasses } from '../utils/calendarTask';

export const TaskCalendarWeekWidget = () => {
  const start = useMemo(() => startOfDay(new Date()), []);

  const { dayKeys, tasksByDay, loading, error, todayKey } = useTaskCalendarRange({
    start,
    days: 7,
  });

  const dateLabels = useMemo(() => {
    return dayKeys.map((key, idx) => {
      const d = addDays(start, idx);
      return {
        key,
        dow: d.toLocaleDateString(undefined, { weekday: 'short' }),
        day: d.getDate(),
      };
    });
  }, [dayKeys, start]);

  return (
    <div className="space-y-3">
      {error && <div className="alert alert-error">{error}</div>}

      <div className="grid grid-cols-7 gap-2">
        {dateLabels.map(({ key, dow, day }) => {
          const dayTasks = tasksByDay.get(key) ?? [];
          const isToday = key === todayKey;

          return (
            <div
              key={key}
              className={
                'rounded-box border border-base-300 bg-base-100 p-2 ' +
                (isToday ? 'ring-2 ring-primary ring-inset ' : '')
              }
            >
              <div className="mb-2 flex items-center justify-between">
                <div className="text-xs font-semibold opacity-70">{dow}</div>
                <div className="text-sm font-bold">{day}</div>
              </div>

              {loading ? (
                <div className="space-y-2">
                  <div className="skeleton h-4 w-full" />
                  <div className="skeleton h-4 w-3/4" />
                </div>
              ) : dayTasks.length === 0 ? (
                <div className="text-xs opacity-60">—</div>
              ) : (
                <div className="space-y-1">
                  {dayTasks.slice(0, 2).map((t) => (
                    <div key={String(t.id)} className="flex items-center gap-1.5">
                      <span className={taskBadgeClasses(t)}>
                        {t.source === 'moodle' ? 'M' : 'U'}
                      </span>
                      <div
                        className={
                          'truncate text-xs ' +
                          (t.completed ? 'line-through opacity-70' : '')
                        }
                        title={t.title}
                      >
                        {t.title}
                      </div>
                    </div>
                  ))}
                  {dayTasks.length > 2 && (
                    <div className="text-xs opacity-60">+{dayTasks.length - 2}</div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-end gap-2 text-sm">
        <span className="badge badge-info">Moodle</span>
        <span className="badge badge-secondary">Manual</span>
      </div>
    </div>
  );
};

