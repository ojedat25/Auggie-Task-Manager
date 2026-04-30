import { User } from './user';

/**
 * Task types (mirror Django models).
 */
export interface Task {
  id: number;
  user: User;
  title: string;
  description: string;
  course: string;
  semester: 'Spring' | 'Fall' | '';
  external_id: string;
  due_date: string | null;
  completed: boolean;
  source: 'manual' | 'moodle';
  created_at: string;
}

export type TaskForm = {
  title: string;
  description: string;
  course: string;
  due_date: string;
};

export type WeeklyTaskList = {
  Sunday: Task[];
  Monday: Task[];
  Tuesday: Task[];
  Wednesday: Task[];
  Thursday: Task[];
  Friday: Task[];
  Saturday: Task[];
};

export type DayOfWeek = keyof WeeklyTaskList;

export type MonthlyTaskList = {
  week1: Task[];
  week2: Task[];
  week3: Task[];
  week4: Task[];
  week5?: Task[];
};
