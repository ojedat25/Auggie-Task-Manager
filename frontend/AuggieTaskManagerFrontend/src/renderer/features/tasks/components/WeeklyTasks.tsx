import { useEffect, useMemo } from 'react';
import { TaskList } from './TaskList';
import { AlertCard } from '../../../components/common/AlertCard';
import { endOfCurrentWeek, startOfCurrentWeek, useTasks } from '../hooks/useTasks';
import { Task, WeeklyTaskList } from '../../../types/task';


export const WeeklyTasks = () => {
    const {
        sortedTasks,
        isAscending,
        setIsAscending,
        errorMessage,
        clearErrorMessage,
        moodleUrl,
        setMoodleUrl,
        hasMoodleUrl,
        handleSyncMoodleTasks,
        isMoodleSyncing,
        fetchTasks,
        updateTask,
        deleteTask,
        completeTask,
        uncompleteTask,
        createTask,
        fetchWeeklyTasks,
      } = useTasks();

      const WEEKDAYS = [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
      ] as const;

      const weeklyTasks = useMemo(() => {
        return WEEKDAYS.reduce((acc: WeeklyTaskList, day, dayIndex) => {
          acc[day] = sortedTasks.filter((task) => new Date(task.due_date).getDay() === dayIndex);
          return acc;
        }, {} as WeeklyTaskList);
      }, [sortedTasks, WEEKDAYS]);

    useEffect(() => {
        fetchWeeklyTasks();
    }, [fetchWeeklyTasks]);

    return (
        <div>
            <h1>Weekly Tasks</h1>

            {Object.entries(weeklyTasks).map(([day, tasks]: [string, Task[]]) => (
                <div key={day}>
                    <h2 className="text-2xl font-bold">{day}</h2>
                    <TaskList tasks={tasks} isAscending={isAscending} setIsAscending={setIsAscending} completeTask={completeTask} uncompleteTask={uncompleteTask} updateTask={updateTask} deleteTask={deleteTask} createTask={createTask} />
                </div>
            ))}

        </div>
    );
};