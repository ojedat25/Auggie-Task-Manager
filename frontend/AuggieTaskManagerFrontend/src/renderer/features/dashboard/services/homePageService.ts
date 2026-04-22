import { axiosInstance } from '../../../api/axiosInstance';
import { AuthService } from '../../auth/services/authService';

export type UpcomingTask = {
  id: string;
  title: string;
  dueAt: string;
  course?: string;
};

type UnknownRecord = Record<string, unknown>;
type UserLike = UnknownRecord;

const LOCAL_STORAGE_USER_KEYS = ['user', 'currentUser', 'auggie_user'];

function fallbackId(): string {
  // Avoid depending on crypto.randomUUID() which may not be present in this project's TS lib.
  return `tmp-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null;
}

function safeParseJson(value: string | null): unknown | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return null;
  }
}

function getStringField(user: UserLike, key: string): string | null {
  const v = user[key];
  return typeof v === 'string' && v.trim() ? v.trim() : null;
}

export function getDisplayNameFromUser(user: unknown): string | null {
  if (!isRecord(user)) return null;

  const direct =
    getStringField(user, 'name') ??
    getStringField(user, 'username') ??
    getStringField(user, 'first_name') ??
    getStringField(user, 'firstName') ??
    getStringField(user, 'email');

  if (direct) return direct;

  const first =
    getStringField(user, 'first_name') ?? getStringField(user, 'firstName');
  const last =
    getStringField(user, 'last_name') ?? getStringField(user, 'lastName');
  if (first) return `${first} ${last ?? ''}`.trim();

  return null;
}

function getUserFromLocalStorage(): unknown | null {
  for (const key of LOCAL_STORAGE_USER_KEYS) {
    const parsed = safeParseJson(localStorage.getItem(key));
    if (parsed) return parsed;
  }
  return null;
}

// Mock data until we have a stable "upcoming" endpoint.
export function getMockUpcomingTasks(now = new Date()): UpcomingTask[] {
  const base = now.getTime();
  const hours = (n: number) => 1000 * 60 * 60 * n;
  return [
    {
      id: 'mock-1',
      title: 'Read Chapter 7 + notes',
      course: 'PSYC 101',
      dueAt: new Date(base + hours(18)).toISOString(),
    },
    {
      id: 'mock-2',
      title: 'Homework 4: Database joins',
      course: 'CSCI 241',
      dueAt: new Date(base + hours(40)).toISOString(),
    },
    {
      id: 'mock-3',
      title: 'Quiz: Cell structure',
      course: 'BIOL 102',
      dueAt: new Date(base + hours(72)).toISOString(),
    },
  ];
}

function toUpcomingTask(task: unknown): UpcomingTask {
  const rec: UnknownRecord = isRecord(task) ? task : {};

  const str = (key: string): string | null => {
    const v = rec[key];
    return typeof v === 'string' && v.trim() ? v : null;
  };

  const num = (key: string): number | null => {
    const v = rec[key];
    return typeof v === 'number' ? v : null;
  };

  // Backend Task uses due_date; keep UI using dueAt.
  const dueAt: string = str('dueAt') ?? str('due_date') ?? str('dueDate') ?? '';

  const title: string = str('title') ?? str('name') ?? 'Untitled';

  const id: string =
    str('id') ??
    (num('id') !== null ? String(num('id')) : null) ??
    fallbackId();

  const course: string | undefined =
    str('course') ?? str('course_name') ?? str('courseName') ?? undefined;

  return { id, title, dueAt, course };
}

export class HomePageService {
  static async getDisplayName(): Promise<string> {
    // Prefer cached user data.
    const cachedUser = getUserFromLocalStorage();
    const cachedName = getDisplayNameFromUser(cachedUser);
    if (cachedName) return cachedName;

    if (!AuthService.isAuthenticated()) return '';

    const profile = await AuthService.getUserProfile();
    try {
      AuthService.saveUser(profile);
    } catch {
      // ignore caching errors
    }
    return getDisplayNameFromUser(profile) ?? '';
  }

  static async getUpcomingTasks(params?: {
    limit?: number;
    days?: number;
  }): Promise<UpcomingTask[]> {
    if (!AuthService.isAuthenticated()) {
      return getMockUpcomingTasks();
    }

    // If no limit is provided, fetch "everything" within the next N days.
    const limit = params?.limit ?? 50;
    const days = params?.days ?? 7;
    const now = new Date();
    const end = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    // Prefer the backend's dedicated endpoint.
    try {
      const upcomingRes = await axiosInstance.get('/tasks/upcoming/', {
        params: {
          limit,
          days,
        },
      });
      const data = Array.isArray(upcomingRes.data)
        ? upcomingRes.data
        : upcomingRes.data?.results;
      const items = Array.isArray(data) ? data : [];

      // Defensive client-side filtering in case backend behavior changes.
      return items
        .map(toUpcomingTask)
        .filter((t) => {
          const due = new Date(t.dueAt);
          return !Number.isNaN(due.getTime()) && due >= now && due <= end;
        })
        .sort(
          (a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime()
        );
    } catch {
      // fall through
    }

    // Fallback: fetch all tasks and reduce client-side.
    try {
      const res = await axiosInstance.get('/tasks/');
      const data = Array.isArray(res.data) ? res.data : res.data?.results;
      const items = Array.isArray(data) ? data : [];

      return items
        .map(toUpcomingTask)
        .filter((t) => {
          const due = new Date(t.dueAt);
          return !Number.isNaN(due.getTime()) && due >= now && due <= end;
        })
        .sort(
          (a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime()
        );
    } catch {
      return getMockUpcomingTasks();
    }
  }
}
