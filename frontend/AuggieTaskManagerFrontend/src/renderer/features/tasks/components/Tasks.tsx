import { TaskList } from './TaskList';
import { Task } from '../../../types/task';
import { useState, useEffect } from 'react';
import { TaskService } from '../services/taskService';
import { AuthService } from '../../auth/services/authService';
import { useNavigate } from 'react-router-dom/dist';
import { AlertCard } from '../../../components/common/AlertCard';

export const Tasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [moodleUrl, setMoodleUrl] = useState<string | null>(
    AuthService.getCurrentUser()?.moodle_url
  );
  const [hasMoodleUrl, setHasMoodleUrl] = useState<boolean>(moodleUrl !== null);

  const handleImportMoodleTasks = async () => {
    if (moodleUrl) {
      const result = await TaskService.loadMoodleCalendarUrl(moodleUrl);
      setTasks((tasks) => [...tasks, ...result]);
      setHasMoodleUrl(true);
    }
  };

  // const navigate = useNavigate();
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const tasks = await TaskService.getTasks();
        setTasks(tasks);
      } catch (error) {
        setErrorMessage('Error fetching tasks');
      }
    };
    fetchTasks();
  }, []);

  return (
    <div>
      {errorMessage && <AlertCard type="error" message={errorMessage} />}
      {!hasMoodleUrl && (
        <div>
          <label>
            Add your Moodle URL to your profile to see your tasks here.
          </label>
          <input
            type="text"
            placeholder="Moodle URL"
            onChange={(e) => setMoodleUrl(e.target.value)}
          />
          <button onClick={handleImportMoodleTasks}>Import Tasks</button>
        </div>
      )}
      <TaskList tasks={tasks} />
    </div>
  );
};
