import { useEffect } from 'react';
import { TaskList } from './TaskList';
import { AlertCard } from '../../../components/common/AlertCard';
import { useTasks } from '../hooks/useTasks';

export const WeeklyTasks = () => {
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
      
    return (
        <div>
            <h1>Weekly Tasks</h1>
        </div>
    );
};