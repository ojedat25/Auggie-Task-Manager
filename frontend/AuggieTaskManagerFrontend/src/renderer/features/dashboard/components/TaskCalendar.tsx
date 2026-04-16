import { useTaskCalendar } from '../hooks/useTaskCalendar';
import { CalendarGrid } from './calendar/CalendarGrid';
import {
  CalendarHeader,
  makeCalendarHeaderHandlers,
} from './calendar/CalendarHeader';

export const TaskCalendar = () => {
  const { viewDate, setViewDate, days, tasksByDay, loading, error, todayKey } =
    useTaskCalendar();

  const { onPrevMonth, onNextMonth, onToday } =
    makeCalendarHeaderHandlers(setViewDate);

  return (
    <div className="w-full">
      <CalendarHeader
        viewDate={viewDate}
        onPrevMonth={onPrevMonth}
        onNextMonth={onNextMonth}
        onToday={onToday}
      />

      {error && <div className="alert alert-error mb-4">{error}</div>}

      <CalendarGrid
        days={days}
        tasksByDay={tasksByDay}
        todayKey={todayKey}
        loading={loading}
      />
    </div>
  );
};

