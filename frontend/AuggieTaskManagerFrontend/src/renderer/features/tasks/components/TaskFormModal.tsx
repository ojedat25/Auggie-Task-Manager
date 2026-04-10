import { useState, useEffect, SubmitEvent } from 'react';
import { TaskForm } from '../../../types/task';

export interface TaskFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: TaskForm) => void | Promise<void>;
  submitting?: boolean;
  title?: string;
  descriptionText?: string;
  initialValues?: TaskForm;
}

const emptyForm = (): TaskForm => ({
  title: '',
  description: '',
  course: '',
  due_date: '',
});

export const TaskFormModal = ({
  open,
  onClose,
  onSubmit,
  submitting = false,
  title = 'New task',
  descriptionText = 'Add a task to your list.',
  initialValues,
}: TaskFormModalProps) => {
  const [values, setValues] = useState<TaskForm>(emptyForm);

  useEffect(() => {
    if (!open) return;
    setValues(initialValues ?? emptyForm());
  }, [open, initialValues]);

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const title = values.title.trim();
    if (!title || submitting) return;
    await onSubmit({
      ...values,
      title,
      description: values.description.trim(),
      course: values.course.trim(),
      due_date: values.due_date,
    });
  };

  if (!open) {
    return null;
  }

  return (
    <div
      className="modal modal-open z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-form-title"
    >
      <div className="modal-box max-w-lg">
        <h2 id="task-form-title" className="font-bold text-lg">
          {title}
        </h2>
        <p className="py-1 text-sm opacity-70">{descriptionText}</p>

        <form onSubmit={handleSubmit} className="fieldset gap-3">
          <fieldset className="fieldset">
            <label className="label" htmlFor="task-title">
              <span className="label-text">Title</span>
            </label>
            <input
              id="task-title"
              type="text"
              className="input input-bordered w-full"
              placeholder="e.g. Read chapter 3"
              value={values.title}
              onChange={(e) =>
                setValues((v) => ({ ...v, title: e.target.value }))
              }
              required
              autoFocus
              disabled={submitting}
            />

            <label className="label" htmlFor="task-description">
              <span className="label-text">Description</span>
            </label>
            <textarea
              id="task-description"
              className="textarea textarea-bordered h-24 w-full"
              placeholder="Optional details"
              value={values.description}
              onChange={(e) =>
                setValues((v) => ({ ...v, description: e.target.value }))
              }
              disabled={submitting}
            />

            <label className="label" htmlFor="task-course">
              <span className="label-text">Course</span>
            </label>
            <input
              id="task-course"
              type="text"
              className="input input-bordered w-full"
              placeholder="e.g. CS 101"
              value={values.course}
              onChange={(e) =>
                setValues((v) => ({ ...v, course: e.target.value }))
              }
              disabled={submitting}
            />

            <label className="label" htmlFor="task-due">
              <span className="label-text">Due date</span>
            </label>
            <input
              id="task-due"
              type="datetime-local"
              className="input input-bordered w-full"
              value={values.due_date}
              onChange={(e) =>
                setValues((v) => ({ ...v, due_date: e.target.value }))
              }
              disabled={submitting}
            />
          </fieldset>

          <div className="modal-action">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? (
                <span className="loading loading-spinner loading-sm" />
              ) : (
                'Save'
              )}
            </button>
          </div>
        </form>
      </div>
      <div
        className="modal-backdrop bg-black/50"
        role="presentation"
        onClick={submitting ? undefined : onClose}
      />
    </div>
  );
};
