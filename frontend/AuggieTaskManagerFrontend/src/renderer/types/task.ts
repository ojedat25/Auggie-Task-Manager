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
  due_date: string;
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
