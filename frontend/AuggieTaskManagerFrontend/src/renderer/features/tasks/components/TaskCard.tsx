// Task detail card
import { Task } from '../../../types/task';
import { TrashIcon, CheckIcon, X, Pencil, CalendarDays } from 'lucide-react';
import { useState } from 'react';

export interface TaskCardProps {
  task: Task;
  onComplete?: () => void;
  onUncomplete?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

function taskBadgeClasses(t: Task): string {
  if (t.source === 'moodle') {
    return t.completed
      ? 'badge badge-outline border-info text-info opacity-70'
      : 'badge badge-info text-info-content';
  }
  return t.completed
    ? 'badge badge-outline border-secondary text-secondary opacity-70'
    : 'badge badge-secondary text-secondary-content';
}

function formatDueParts(iso: string): {
  dateLabel: string;
  timeLabel: string;
} | null {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  const dateLabel = date.toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  const timeLabel = date.toLocaleString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
  return { dateLabel, timeLabel };
}

export const TaskCard = ({
  task,
  onComplete,
  onUncomplete,
  onEdit,
  onDelete,
}: TaskCardProps) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const openDeleteModal = () => setShowDeleteModal(true);
  const closeDeleteModal = () => setShowDeleteModal(false);

  const confirmDelete = () => {
    onDelete?.();
    closeDeleteModal();
  };

  const trimmedDescription =
    typeof task.description === 'string' ? task.description.trim() : '';
  const hasDescription = trimmedDescription !== '';
  const rawDue =
    typeof task.due_date === 'string' && task.due_date !== ''
      ? task.due_date
      : null;
  const dueParts = rawDue != null ? formatDueParts(rawDue) : null;

  return (
    <div className="flex w-full min-w-0 items-start gap-3 py-2">
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className={taskBadgeClasses(task)}
            aria-label={`Source: ${task.source === 'moodle' ? 'Imported from Moodle' : 'Made by User'}`}
            title={
              task.source === 'moodle' ? 'Imported from Moodle' : 'Made by User'
            }
          >
            {task.source === 'moodle' ? 'Moodle' : 'User'}
          </span>
          <h2
            className={`min-w-0 flex-1 truncate text-base font-semibold ${
              task.completed ? 'line-through opacity-70' : ''
            }`}
          >
            {task.title}
          </h2>
          {onEdit && (
            <button
              type="button"
              className="btn btn-square btn-sm btn-ghost shrink-0"
              aria-label="Edit task"
              title="Edit"
              onClick={onEdit}
            >
              <Pencil className="h-4 w-4" aria-hidden />
            </button>
          )}
        </div>

        {(rawDue != null ||
          (task.course != null && task.course !== '') ||
          (task.semester != null && task.semester !== '')) && (
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            {rawDue != null && (
              <span className="inline-flex items-center gap-1 text-xs opacity-70">
                <CalendarDays
                  className="h-3.5 w-3.5 shrink-0 opacity-80"
                  aria-hidden
                />
                <span>
                  {dueParts != null ? (
                    <>
                      <span>{dueParts.dateLabel}</span>
                      <span className="opacity-60">
                        {' '}
                        · {dueParts.timeLabel}
                      </span>
                    </>
                  ) : (
                    rawDue
                  )}
                </span>
              </span>
            )}
            {task.course != null && task.course !== '' && (
              <span className="badge badge-sm badge-outline opacity-90">
                {task.course}
              </span>
            )}
            {task.semester != null && task.semester !== '' && (
              <span className="badge badge-sm badge-outline opacity-90">
                {task.semester}
              </span>
            )}
          </div>
        )}

        {hasDescription && (
          <p className="line-clamp-2 text-sm opacity-75">
            {trimmedDescription}
          </p>
        )}
      </div>

      <div className="flex shrink-0 gap-1">
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

      {showDeleteModal && (
        <div className="modal modal-open" role="dialog" aria-modal="true">
          <div className="modal-box">
            <h3 className="text-lg font-bold">Delete task?</h3>
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
