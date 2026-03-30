// Task detail card
import { Task } from '../../../types/task';
import { TrashIcon, CheckIcon } from 'lucide-react';

export interface TaskCardProps {
  task: Task;
}

export const TaskCard = ({ task }: TaskCardProps) => {
  return (
    <div className="card card-border bg-base-200 w-full">
      <div className="card-body w-full">
        <h2 className="card-title">{task.title}</h2>
        <p>{task.description || 'No description.'}</p>
        {task.due_date != null && task.due_date !== '' && (
          <p>Due date: {task.due_date}</p>
        )}
        {task.course != null && task.course !== '' && (
          <p>Course: {task.course}</p>
        )}
        <p>Completed: {task.completed ? 'Yes' : 'No'}</p>
        {task.source && <p>Source: {task.source}</p>}
        <div className="card-actions justify-end">
          <CheckIcon className="btn btn-primary">Complete</CheckIcon>
          <TrashIcon className="btn btn-error">Delete</TrashIcon>
        </div>
      </div>
    </div>
  );
};
