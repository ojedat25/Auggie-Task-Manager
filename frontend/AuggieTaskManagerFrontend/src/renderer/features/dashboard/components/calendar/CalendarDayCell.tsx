import type { ApiTask } from '../../../tasks/services/taskService';

import { taskBadgeClasses } from '../../utils/calendarTask';
import type { DayCell } from '../../utils/calendarDate';

export function CalendarDayCell(props: {
  cell: DayCell;
  dayTasks: ApiTask[];
  isToday: boolean;
  loading: boolean;
}) {
  const { cell, dayTasks, isToday, loading } = props;
  const dim = !cell.inCurrentMonth;

  return (
    <div
      className={
        'min-h-28 overflow-hidden bg-base-100 p-2 ' +
        (dim ? 'opacity-60 ' : '') +
        (isToday ? 'ring-2 ring-primary ring-inset ' : '')
      }
    >
      <div className="mb-2 flex items-center justify-between">
        <div className="text-sm font-semibold">{cell.date.getDate()}</div>
        {loading && <span className="loading loading-spinner loading-xs" />}
      </div>

      <div className="flex flex-col gap-1">
        {dayTasks.slice(0, 4).map((t) => (
          <div key={String(t.id)} className="flex min-w-0 items-center gap-2">
            <span className={taskBadgeClasses(t)}>
              {t.source === 'moodle' ? 'M' : 'U'}
            </span>
            <div
              className={
                'min-w-0 ' + (t.completed ? 'line-through opacity-70' : '')
              }
            >
              <div className="truncate text-sm" title={t.title}>
                {t.title}
              </div>
              {(t.course || t.description) && (
                <div
                  className="truncate text-xs opacity-70"
                  title={t.course || t.description}
                >
                  {t.course || t.description}
                </div>
              )}
            </div>
          </div>
        ))}

        {dayTasks.length > 4 && (
          <div className="text-xs opacity-70">+{dayTasks.length - 4} more</div>
        )}
      </div>
    </div>
  );
}

