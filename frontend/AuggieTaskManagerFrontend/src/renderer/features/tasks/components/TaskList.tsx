import { TaskCard } from './TaskCard';
import { Task } from '../../../types/task';
import { useTasks } from '../hooks/useTasks';
export interface TaskListProps {
  tasks: Task[];
}


export const TaskList = ({ tasks }: TaskListProps) => {
  const { updateTask, deleteTask } = useTasks();
  return (
    <div>
      <ul className="list bg-base-100 rounded-box shadow-md">
        <li className="p-4 pb-2 text-xl opacity-60 tracking-wide"><span className="flex items-center gap-2">Tasks</span></li>
        {tasks.map((task, index) => (
          <li className="list-row" key={task.id}>
            <div className="w-8 shrink-0 text-right text-lg font-thin opacity-30 tabular-nums">
              {index + 1}
            </div>
            <TaskCard task={task} onComplete={() => updateTask(task)} onDelete={() => deleteTask(task.id)} />
          </li>
        ))}
      </ul>
    </div>
  );
};