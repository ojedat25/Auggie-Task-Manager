import { TaskCard } from './TaskCard';
import { Task } from '../../../types/task';

export interface TaskListProps {
  tasks: Task[];
}

export const TaskList = ({ tasks }: TaskListProps) => {
  return (
    <div>
      
        <ul className="list bg-base-100 rounded-box shadow-md">
        <li className="p-4 pb-2 text-xs opacity-60 tracking-wide">Tasks</li>
        {tasks.map((task) => (
        <li className="list-row" key={task.id}>
          <div className="text-4xl font-thin opacity-30 tabular-nums">{task.id}</div>
          <TaskCard task={task} />
        </li>
        ))}
      </ul>
    </div>
  );
};