import { TaskList } from "./TaskList";
import { Task } from "../../../types/task";
import { useState, useEffect } from "react";
import { TaskService } from "../services/taskService";
import { AuthService } from "../../auth/services/authService";
import { useNavigate } from "react-router-dom/dist";
import { AlertCard } from "../../../components/common/AlertCard";

export const Tasks = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const moodleUrl = AuthService.getCurrentUser()?.moodle_url;
    const navigate = useNavigate();
    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const tasks = await TaskService.getTasks();
                setTasks(tasks);
            } catch (error) {
                setErrorMessage("Error fetching tasks");
            }
        };
        fetchTasks();
    }, []);

    return (
        <div>
            {errorMessage && <AlertCard type="error" message={errorMessage} />}
            <TaskList tasks={tasks} />
        </div>
    );
};