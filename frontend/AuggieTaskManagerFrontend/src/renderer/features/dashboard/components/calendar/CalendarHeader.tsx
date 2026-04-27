import { ChevronLeft, ChevronRight } from 'lucide-react';

import { monthTitle, startOfMonth } from '../../utils/calendarDate';

export function CalendarHeader(props: {
  viewDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
}) {
  const { viewDate, onPrevMonth, onNextMonth, onToday } = props;

  return (
    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <button
          className="btn btn-sm btn-ghost"
          onClick={onPrevMonth}
          aria-label="Previous month"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="text-lg font-semibold">{monthTitle(viewDate)}</div>
        <button
          className="btn btn-sm btn-ghost"
          onClick={onNextMonth}
          aria-label="Next month"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button className="btn btn-sm" onClick={onToday}>
          Today
        </button>
        <div className="flex items-center gap-2 text-sm">
          <span className="badge badge-info">Moodle</span>
          <span className="badge badge-secondary">Manual</span>
        </div>
      </div>
    </div>
  );
}

export function makeCalendarHeaderHandlers(
  setViewDate: (updater: (d: Date) => Date) => void
) {
  return {
    onPrevMonth: () =>
      setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1)),
    onNextMonth: () =>
      setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1)),
    onToday: () => setViewDate(() => startOfMonth(new Date())),
  };
}
