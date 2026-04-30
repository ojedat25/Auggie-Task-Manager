// Task detail card
import { Task } from '../../../types/task';
import { TrashIcon, CheckIcon, X, Pencil } from 'lucide-react';
import { useState } from 'react';

export interface TaskCardProps {
  task: Task;
  onComplete?: () => void;
  onUncomplete?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

function formatDueDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export const TaskCard = ({
  task,
  onComplete,
  onUncomplete,
  onEdit,
  onDelete,
}: TaskCardProps) => {
  // Controls whether the delete confirmation modal is visible
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Open the modal instead of deleting the task immediately
  const openDeleteModal = () => setShowDeleteModal(true);
  const closeDeleteModal = () => setShowDeleteModal(false);

  // Confirm the deletion of the task
  const confirmDelete = () => {
    onDelete?.();
    closeDeleteModal();
  };

  return (
    <div>
      <div className="card card-border bg-base-200 w-full">
        <div className="card-body w-full">
          <div className="flex items-start justify-between gap-2">
            <h2 className="card-title">{task.title}</h2>
            {task.source === 'manual' && (
              <button
                type="button"
                className="btn btn-square btn-sm btn-ghost"
                aria-label="Edit task"
                title="Edit"
                onClick={onEdit}
              >
                <Pencil className="h-4 w-4" aria-hidden />
              </button>
            )}
          </div>
          <p>{task.description || 'No description.'}</p>
          {task.due_date != null && task.due_date !== '' && (
            <p>Due date: {formatDueDate(task.due_date)}</p>
          )}
          {task.course != null && task.course !== '' && (
            <p>Course: {task.course}</p>
          )}
          {task.semester !== '' && task.semester !== null && (
            <p>Semester: {task.semester}</p>
          )}
          <p>Completed: {task.completed ? 'Yes' : 'No'}</p>
          {task.source && <p>Source: {task.source}</p>}
          <div className="card-actions justify-end gap-1">
            {task.completed ? (
              <button
                type="button"
                className="btn btn-square btn-sm btn-outline btn-primary"
                aria-label="Mark task as not completed"
                title="Mark incomplete"
                onClick={onUncomplete}
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-square btn-sm btn-primary"
                aria-label="Mark task as completed"
                title="Mark complete"
                onClick={onComplete}
              >
                <CheckIcon className="h-4 w-4" aria-hidden />
              </button>
            )}
            <button
              type="button"
              className="btn btn-square btn-sm btn-error"
              aria-label="Delete task"
              title="Delete task"
              onClick={openDeleteModal}
            >
              <TrashIcon className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation is shown before deleting the task */}
      {showDeleteModal && (
        <div className="modal modal-open" role="dialog" aria-modal="true">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Delete task?</h3>
            <p className="py-2">
              Are you sure you want to delete{' '}
              <span className="font-semibold">{task.title}</span>?
            </p>
            <div className="modal-action">
              <button type="button" className="btn" onClick={closeDeleteModal}>
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-error"
                onClick={confirmDelete}
              >
                Confirm Delete
              </button>
            </div>
          </div>
          <button
            type="button"
            className="modal-backdrop"
            aria-label="Close delete confirmation"
            onClick={closeDeleteModal}
          />
        </div>
      )}
    </div>
  );
};
