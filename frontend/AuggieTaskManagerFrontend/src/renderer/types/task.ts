import { User } from "./user";

/**
 * Task types (mirror Django models).
 */
export interface Task {
  id: number;
  user: User;
  title: string;
  description: string;
  due_date: string;
  completed: boolean;
  source: "manual" | "moodle";
  created_at: string;
}


