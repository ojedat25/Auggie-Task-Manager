import { useMemo } from 'react';
import { TaskList } from './TaskList';
import { Task } from '../../../types/task';
import {
  buildTasksByCalendarDays,
  NO_TASKS_LABEL,
  isSameLocalCalendarDay,
} from '../utils';

export interface MonthlyTasksProps {
  tasks: Task[];
  monthStart: Date;
  monthEnd: Date;
  monthOffset: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onResetMonth: () => void;
  onEditTask?: (task: Task) => void;
  deleteTask: (taskId: number) => Promise<void>;
  completeTask: (task: Task) => Promise<void>;
  uncompleteTask: (task: Task) => Promise<void>;
}

const monthTitleFormatter = new Intl.DateTimeFormat(undefined, {
  month: 'long',
  year: 'numeric',
});

const dayHeadingFormatter = new Intl.DateTimeFormat(undefined, {
  weekday: 'long',
  month: 'short',
  day: 'numeric',
});

export const MonthlyTasks = ({
  tasks,
  monthStart,
  monthEnd,
  monthOffset,
  onPrevMonth,
  onNextMonth,
  onResetMonth,
  onEditTask,
  deleteTask,
  completeTask,
  uncompleteTask,
}: MonthlyTasksProps) => {
  const dayBuckets = useMemo(
    () => buildTasksByCalendarDays(tasks, monthStart, monthEnd),
    [tasks, monthStart, monthEnd]
  );

  const monthTitle = monthTitleFormatter.format(monthStart);
  const today = new Date();

  return (
    <div className="space-y-4">
      <div className="card bg-base-100 shadow-md">
        <div className="card-body gap-3">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="card-title text-2xl">Monthly Tasks</h1>
              <p className="text-sm opacity-70">{monthTitle}</p>
            </div>
            <div className="join">
              <button
                type="button"
                className="btn join-item"
                onClick={onPrevMonth}
              >
                Prev
              </button>
              <button
                type="button"
                className="btn btn-primary join-item"
                onClick={onResetMonth}
                disabled={monthOffset === 0}
              >
                Current
              </button>
              <button
                type="button"
                className="btn join-item"
                onClick={onNextMonth}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {dayBuckets.map(({ date: bucketDate, tasks: dayTasks }) => {
        const isTodaySection = isSameLocalCalendarDay(bucketDate, today);
        return (
          <div
            key={bucketDate.toISOString()}
            className={`rounded-box border border-base-300 bg-base-100 p-2 ${
              isTodaySection ? 'ring-2 ring-primary ring-inset ' : ''
            }`}
            aria-current={isTodaySection ? 'date' : undefined}
          >
            <h2 className="text-2xl font-bold">
              {dayHeadingFormatter.format(bucketDate)}
            </h2>
            {dayTasks.length === 0 ? (
              <p className="text-sm opacity-70">{NO_TASKS_LABEL}</p>
            ) : (
              <TaskList
                tasks={dayTasks}
                completeTask={completeTask}
                uncompleteTask={uncompleteTask}
                deleteTask={deleteTask}
                onEditTask={onEditTask}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};
