import { TaskCard } from './TaskCard';
import { Task } from '../../../types/task';

export interface TaskListProps {
  tasks: Task[];
  completeTask: (task: Task) => Promise<void>;
  uncompleteTask: (task: Task) => Promise<void>;
  deleteTask: (taskId: number) => Promise<void>;
  onEditTask?: (task: Task) => void;
}

export const TaskList = ({
  tasks,
  completeTask,
  uncompleteTask,
  deleteTask,
  onEditTask,
}: TaskListProps) => {
  return (
    <ul className="list divide-y divide-base-300 rounded-box border border-base-200 bg-base-100">
      {tasks.map((task, index) => (
        <li className="list-row" key={task.id}>
          <div className="w-8 shrink-0 text-right text-lg font-thin opacity-30 tabular-nums">
            {index + 1}
          </div>
          <TaskCard
            task={task}
            onComplete={() => completeTask(task)}
            onUncomplete={() => uncompleteTask(task)}
            onEdit={
              task.source === 'manual' && onEditTask
                ? () => onEditTask(task)
                : undefined
            }
            onDelete={() => deleteTask(task.id)}
          />
        </li>
      ))}
    </ul>
  );
};
