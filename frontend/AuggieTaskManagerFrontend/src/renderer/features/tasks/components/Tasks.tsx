import { useEffect, useState } from 'react';
import { TaskList } from './TaskList';
import { AlertCard } from '../../../components/common/AlertCard';
import { useTasks } from '../hooks/useTasks';

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

  useEffect(() => {
    void fetchTasks();
  }, [fetchTasks]);

  const [showWeeklyTasks, setShowWeeklyTasks] = useState(true);
  const [showMonthlyTasks, setShowMonthlyTasks] = useState(false);

  const handleShowWeeklyTasks = () => {
    setShowWeeklyTasks(true);
  };

  const handleShowMonthlyTasks = () => {
    setShowMonthlyTasks(true);
  };

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
      <TaskList
        tasks={sortedTasks}
        isAscending={isAscending}
        setIsAscending={setIsAscending}
        completeTask={completeTask}
        uncompleteTask={uncompleteTask}
        updateTask={updateTask}
        deleteTask={deleteTask}
        createTask={createTask}
        onSyncMoodle={hasMoodleUrl ? handleSyncMoodleTasks : undefined}
        isMoodleSyncing={hasMoodleUrl ? isMoodleSyncing : undefined}
      />
    </div>
  );
};
