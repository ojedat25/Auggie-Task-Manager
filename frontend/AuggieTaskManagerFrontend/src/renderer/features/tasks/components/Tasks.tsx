import { useCallback, useEffect, useState } from 'react';
import { ArrowDownNarrowWide, ArrowUpNarrowWide } from 'lucide-react';
import { TaskFormModal } from './TaskFormModal';
import { WeeklyTasks } from './WeeklyTasks';
import { MonthlyTasks } from './MonthlyTasks';
import { AlertCard } from '../../../components/common/AlertCard';
import { useTasks } from '../hooks/useTasks';
import { TaskForm } from '../../../types/task';

export const Tasks = () => {
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
  } = useTasks();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [mode, setMode] = useState<'weekly' | 'monthly'>('weekly');

  useEffect(() => {
    void fetchTasks();
  }, [fetchTasks, mode]);

  const handleCreateClose = useCallback(() => {
    setIsCreateOpen(false);
  }, []);

  const handleCreateSubmit = useCallback(
    async (values: TaskForm) => {
      const ok = await createTask(values);
      if (ok) {
        setIsCreateOpen(false);
      }
    },
    [createTask]
  );

  const listHeader = (
    <>
      <span>Tasks</span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="btn btn-primary btn-square btn-sm"
          aria-pressed={isAscending}
          aria-label={
            isAscending
              ? 'Sorted by due date ascending. Activate to sort descending.'
              : 'Sorted by due date descending. Activate to sort ascending.'
          }
          title={
            isAscending
              ? 'Due date ascending — click for descending'
              : 'Due date descending — click for ascending'
          }
          onClick={() => setIsAscending((prev) => !prev)}
        >
          {isAscending ? (
            <ArrowUpNarrowWide className="h-4 w-4" aria-hidden />
          ) : (
            <ArrowDownNarrowWide className="h-4 w-4" aria-hidden />
          )}
        </button>
        {hasMoodleUrl && (
          <button
            type="button"
            className="btn btn-outline btn-primary shrink-0 whitespace-nowrap"
            disabled={isMoodleSyncing}
            onClick={() => handleSyncMoodleTasks()}
          >
            {isMoodleSyncing ? 'Syncing…' : 'Sync from Moodle'}
          </button>
        )}
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setIsCreateOpen(true)}
        >
          Add Task
        </button>
      </div>
    </>
  );

  return (
    <div>
      {errorMessage && (
        <AlertCard
          type="error"
          message={errorMessage}
          onDismiss={clearErrorMessage}
        />
      )}
      {!hasMoodleUrl && (
        <div className="rounded-box border border-base-300 bg-base-200/40 p-4 shadow-sm">
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Moodle calendar URL</legend>
            <div className="flex flex-row items-stretch gap-2">
              <input
                type="text"
                className="input min-w-0 flex-1"
                placeholder="Paste your Moodle calendar URL"
                value={moodleUrl ?? ''}
                onChange={(e) => setMoodleUrl(e.target.value)}
              />
              <button
                type="button"
                className="btn btn-primary shrink-0 whitespace-nowrap"
                disabled={isMoodleSyncing}
                onClick={handleSyncMoodleTasks}
              >
                {isMoodleSyncing ? 'Syncing…' : 'Import Tasks'}
              </button>
            </div>
            <p className="label mt-1">
              Add your Moodle URL to your profile to see your tasks here.
            </p>
          </fieldset>
        </div>
      )}
      <div className="flex items-center justify-between gap-2 p-4 pb-2 text-xl opacity-60 tracking-wide">
        {listHeader}
      </div>

      {mode === 'weekly' ? (
        <WeeklyTasks
          tasks={sortedTasks}
          completeTask={completeTask}
          uncompleteTask={uncompleteTask}
          updateTask={updateTask}
          deleteTask={deleteTask}
        />
      ) : (
        <MonthlyTasks />
      )}
      <TaskFormModal
        open={isCreateOpen}
        onClose={handleCreateClose}
        onSubmit={handleCreateSubmit}
      />
    </div>
  );
};
