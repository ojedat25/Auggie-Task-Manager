import { useMemo } from 'react';
import { TaskList } from './TaskList';
import { Task, type DayOfWeek } from '../../../types/task';
import {
  buildWeeklyTaskLists,
  WEEKDAYS,
  NO_TASKS_LABEL,
  startOfLocalDay,
  weekdayLabelForLocalDate,
} from '../utils';

export interface WeeklyTasksProps {
  tasks: Task[];
  weekStart: Date;
  weekEnd: Date;
  weekOffset: number;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onResetWeek: () => void;
  updateTask: (task: Task) => Promise<void>;
  deleteTask: (taskId: number) => Promise<void>;
  completeTask: (task: Task) => Promise<void>;
  uncompleteTask: (task: Task) => Promise<void>;
}

const formatRange = (start: Date, end: Date) => {
  const formatter = new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
  });
  return `${formatter.format(start)} – ${formatter.format(end)}`;
};

export const WeeklyTasks = ({
  tasks,
  weekStart,
  weekEnd,
  weekOffset,
  onPrevWeek,
  onNextWeek,
  onResetWeek,
  updateTask,
  deleteTask,
  completeTask,
  uncompleteTask,
}: WeeklyTasksProps) => {
  const weeklyTasks = useMemo(
    () => buildWeeklyTaskLists(tasks, weekStart, weekEnd),
    [tasks, weekStart, weekEnd]
  );

  const today = new Date();
  const todayAtMidnight = startOfLocalDay(today);
  const isTodayInsideDisplayedWeek =
    todayAtMidnight >= weekStart && todayAtMidnight <= weekEnd;
  const todayWeekdayLabel = weekdayLabelForLocalDate(today);

  return (
    <div className="space-y-4">
      <div className="card bg-base-100 shadow-md">
        <div className="card-body gap-3">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="card-title text-2xl">Weekly Tasks</h1>
              <p className="text-sm opacity-70">
                {formatRange(weekStart, weekEnd)}
              </p>
            </div>
            <div className="join">
              <button
                type="button"
                className="btn join-item"
                onClick={onPrevWeek}
              >
                Prev
              </button>
              <button
                type="button"
                className="btn btn-primary join-item"
                onClick={onResetWeek}
                disabled={weekOffset === 0}
              >
                Current
              </button>
              <button
                type="button"
                className="btn join-item"
                onClick={onNextWeek}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {WEEKDAYS.map((day: DayOfWeek) => {
        const dayTasks = weeklyTasks[day];
        const isTodaySection =
          isTodayInsideDisplayedWeek && day === todayWeekdayLabel;
        return (
          <div
            key={day}
            className={`rounded-box border border-base-300 bg-base-100 p-2 ${
              isTodaySection ? 'ring-2 ring-primary ring-inset ' : ''
            }`}
            aria-current={isTodaySection ? 'date' : undefined}
          >
            <h2 className="text-2xl font-bold">
              {day}{' '}
              <span className="text-lg font-normal opacity-50">
                {new Date(
                  weekStart.getTime() + WEEKDAYS.indexOf(day) * 86400000
                ).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </h2>
            {dayTasks.length === 0 ? (
              <p className="text-sm opacity-70">{NO_TASKS_LABEL}</p>
            ) : (
              <TaskList
                tasks={dayTasks}
                completeTask={completeTask}
                uncompleteTask={uncompleteTask}
                updateTask={updateTask}
                deleteTask={deleteTask}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};
