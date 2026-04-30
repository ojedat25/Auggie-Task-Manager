import { useState } from 'react';
import { TaskCard } from './TaskCard';
import { Task, TaskForm } from '../../../types/task';
import { TaskFormModal } from './TaskFormModal';

export interface TaskListProps {
  tasks: Task[];
  completeTask: (task: Task) => Promise<void>;
  uncompleteTask: (task: Task) => Promise<void>;
  updateTask: (task: Task) => Promise<void>;
  deleteTask: (taskId: number) => Promise<void>;
}

export const TaskList = ({
  tasks,
  completeTask,
  uncompleteTask,
  updateTask,
  deleteTask,
}: TaskListProps) => {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const handleEditClose = () => {
    if (isSavingEdit) return;
    setIsEditOpen(false);
    setEditingTask(null);
  };

  const handleEditSubmit = async (values: TaskForm) => {
    if (!editingTask) return;
    setIsSavingEdit(true);
    try {
      await updateTask({
        ...editingTask,
        title: values.title,
        description: values.description,
        course: values.course,
        due_date: values.due_date,
      });
      setIsEditOpen(false);
      setEditingTask(null);
    } finally {
      setIsSavingEdit(false);
    }
  };

  const toDateTimeLocal = (iso: string | null | undefined): string => {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  return (
    <div>
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
                task.source === 'manual'
                  ? () => {
                      setEditingTask(task);
                      setIsEditOpen(true);
                    }
                  : undefined
              }
              onDelete={() => deleteTask(task.id)}
            />
          </li>
        ))}
      </ul>
      <TaskFormModal
        open={isEditOpen}
        onClose={handleEditClose}
        onSubmit={handleEditSubmit}
        submitting={isSavingEdit}
        title="Edit task"
        descriptionText="Update task details."
        initialValues={
          editingTask
            ? {
                title: editingTask.title ?? '',
                description: editingTask.description ?? '',
                course: editingTask.course ?? '',
                due_date: toDateTimeLocal(editingTask.due_date),
              }
            : undefined
        }
      />
    </div>
  );
};
