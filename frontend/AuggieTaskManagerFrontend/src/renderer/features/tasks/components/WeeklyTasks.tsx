import { useMemo } from 'react';
import { TaskList } from './TaskList';
import { Task, WeeklyTaskList, type DayOfWeek } from '../../../types/task';

const WEEKDAYS: readonly DayOfWeek[] = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

export interface WeeklyTasksProps {
  tasks: Task[];
  updateTask: (task: Task) => Promise<void>;
  deleteTask: (taskId: number) => Promise<void>;
  completeTask: (task: Task) => Promise<void>;
  uncompleteTask: (task: Task) => Promise<void>;
}

export const WeeklyTasks = ({
  tasks,
  updateTask,
  deleteTask,
  completeTask,
  uncompleteTask,
}: WeeklyTasksProps) => {

  const weeklyTasks = useMemo(() => {
    return WEEKDAYS.reduce((acc: WeeklyTaskList, day, dayIndex) => {
      acc[day] = tasks.filter(
        (task) => new Date(task.due_date).getDay() === dayIndex
      );
      return acc;
    }, {} as WeeklyTaskList);
  }, [tasks]);

  return (
    <div>
      <h1>Weekly Tasks</h1>

      {WEEKDAYS.map((day) => {
        const tasks = weeklyTasks[day];
        return (
          <div key={day}>
            <h2 className="text-2xl font-bold">{day}</h2>
            <TaskList
              tasks={tasks}
              completeTask={completeTask}
              uncompleteTask={uncompleteTask}
              updateTask={updateTask}
              deleteTask={deleteTask}
            />
          </div>
        );
      })}
    </div>
  );
};
