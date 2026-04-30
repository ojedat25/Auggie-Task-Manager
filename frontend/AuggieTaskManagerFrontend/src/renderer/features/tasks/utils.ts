/**
 * Date ranges and client-side grouping for weekly/monthly task views.
 */
import { Task, WeeklyTaskList, type DayOfWeek } from '../../types/task';

export const NO_TASKS_LABEL = 'No tasks';

export const WEEKDAYS: readonly DayOfWeek[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const;

/** Local calendar date at midnight — for same-day comparisons. */
export function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function isSameLocalCalendarDay(
  firstDate: Date,
  secondDate: Date
): boolean {
  return (
    startOfLocalDay(firstDate).getTime() ===
    startOfLocalDay(secondDate).getTime()
  );
}

/** Monday-first weekday label, aligned with `buildWeeklyTaskLists`. */
export function weekdayLabelForLocalDate(date: Date): DayOfWeek {
  return WEEKDAYS[(date.getDay() + 6) % 7];
}

// weekStartsOn: 0 = Sunday, 1 = Monday
export function startOfCurrentWeek(weekStartsOn: 0 | 1 = 1, date?: Date): Date {
  const anyDayInTargetWeek = date ?? new Date();
  const dayOfWeek = anyDayInTargetWeek.getDay();
  const daysToSubtractToReachWeekStart = (dayOfWeek - weekStartsOn + 7) % 7;

  const weekStart = new Date(anyDayInTargetWeek);
  weekStart.setDate(
    anyDayInTargetWeek.getDate() - daysToSubtractToReachWeekStart
  );
  weekStart.setHours(0, 0, 0, 0);
  return weekStart;
}

export function endOfCurrentWeek(weekStartsOn: 0 | 1 = 1, date?: Date): Date {
  const weekEnd = new Date(startOfCurrentWeek(weekStartsOn, date));
  weekEnd.setDate(weekEnd.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);
  return weekEnd;
}

export function startOfCurrentMonth(date?: Date): Date {
  const dayInTargetMonth = date ?? new Date();
  return new Date(
    dayInTargetMonth.getFullYear(),
    dayInTargetMonth.getMonth(),
    1,
    0,
    0,
    0,
    0
  );
}

export function endOfCurrentMonth(date?: Date): Date {
  const dayInTargetMonth = date ?? new Date();
  return new Date(
    dayInTargetMonth.getFullYear(),
    dayInTargetMonth.getMonth() + 1,
    0,
    23,
    59,
    59,
    999
  );
}

// Clone of `date` shifted by `weekDelta` weeks.
export function offsetDateByWeeks(date: Date, weekDelta: number): Date {
  const dateShiftedByWeeks = new Date(date);
  dateShiftedByWeeks.setDate(dateShiftedByWeeks.getDate() + weekDelta * 7);
  return dateShiftedByWeeks;
}

// Clone of `date` shifted by `monthDelta` calendar months.
export function offsetDateByCalendarMonths(
  date: Date,
  monthDelta: number
): Date {
  const shiftedDate = new Date(date);
  const originalDayOfMonth = shiftedDate.getDate();
  shiftedDate.setDate(1);
  shiftedDate.setMonth(shiftedDate.getMonth() + monthDelta);
  const lastDayOfTargetMonth = new Date(
    shiftedDate.getFullYear(),
    shiftedDate.getMonth() + 1,
    0
  ).getDate();
  shiftedDate.setDate(Math.min(originalDayOfMonth, lastDayOfTargetMonth));
  return shiftedDate;
}

export function filterTasksDueInRange(
  tasks: Task[],
  rangeStart: Date,
  rangeEnd: Date
): Task[] {
  return tasks.filter((task) => {
    const dueDate = new Date(task.due_date);
    if (Number.isNaN(dueDate.getTime())) return false;
    return dueDate >= rangeStart && dueDate <= rangeEnd;
  });
}

export function buildWeeklyTaskLists(
  tasks: Task[],
  weekStart: Date,
  weekEnd: Date
): WeeklyTaskList {
  const tasksInWeek = filterTasksDueInRange(tasks, weekStart, weekEnd);
  const grouped = Object.fromEntries(
    WEEKDAYS.map((day) => [day, [] as Task[]])
  ) as WeeklyTaskList;

  tasksInWeek.forEach((task) => {
    const dayLabel = weekdayLabelForLocalDate(new Date(task.due_date));
    grouped[dayLabel].push(task);
  });

  return grouped;
}

export type TasksByCalendarDay = {
  date: Date;
  tasks: Task[];
};

export function buildTasksByCalendarDays(
  tasks: Task[],
  monthStart: Date,
  monthEnd: Date
): TasksByCalendarDay[] {
  const year = monthStart.getFullYear();
  const monthIndex = monthStart.getMonth();
  const lastDayOfMonth = monthEnd.getDate();
  const tasksInMonth = filterTasksDueInRange(tasks, monthStart, monthEnd);

  const tasksByDayMap = new Map<number, Task[]>();
  tasksInMonth.forEach((task) => {
    const dueDate = new Date(task.due_date);
    const day = dueDate.getDate();
    const list = tasksByDayMap.get(day) ?? [];
    list.push(task);
    tasksByDayMap.set(day, list);
  });

  const tasksByCalendarDays: TasksByCalendarDay[] = [];
  for (let dayOfMonth = 1; dayOfMonth <= lastDayOfMonth; dayOfMonth++) {
    const calendarDate = new Date(year, monthIndex, dayOfMonth);
    tasksByCalendarDays.push({
      date: calendarDate,
      tasks: tasksByDayMap.get(dayOfMonth) ?? [],
    });
  }
  return tasksByCalendarDays;
}
