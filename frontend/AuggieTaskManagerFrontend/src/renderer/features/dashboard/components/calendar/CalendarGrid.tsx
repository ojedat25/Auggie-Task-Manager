import type { ApiTask } from '../../../tasks/services/taskService';

import type { DayCell } from '../../utils/calendarDate';
import { CalendarDayCell } from './CalendarDayCell';

export function CalendarGrid(props: {
  days: DayCell[];
  tasksByDay: Map<string, ApiTask[]>;
  todayKey: string;
  loading: boolean;
}) {
  const { days, tasksByDay, todayKey, loading } = props;

  return (
    <div className="overflow-x-auto">
      <div className="min-w-215">
        <div className="grid grid-cols-7 gap-px rounded-box bg-base-300 p-px">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div
              key={d}
              className="bg-base-200 px-2 py-2 text-center text-sm font-semibold"
            >
              {d}
            </div>
          ))}

          {days.map((cell) => (
            <CalendarDayCell
              key={cell.key}
              cell={cell}
              dayTasks={tasksByDay.get(cell.key) ?? []}
              isToday={cell.key === todayKey}
              loading={loading}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

