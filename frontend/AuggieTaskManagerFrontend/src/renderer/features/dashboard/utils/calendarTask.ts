import type { ApiTask } from '../../tasks/services/taskService';

import { formatYmd } from './calendarDate';

export function parseTaskDayKey(due_date: string | null): string | null {
  if (!due_date) return null;
  const dt = new Date(due_date);
  if (Number.isNaN(dt.getTime())) return null;
  return formatYmd(dt);
}

export function taskBadgeClasses(t: ApiTask): string {
  if (t.source === 'moodle') {
    return t.completed
      ? 'badge badge-outline border-info text-info opacity-70'
      : 'badge badge-info text-info-content';
  }
  return t.completed
    ? 'badge badge-outline border-secondary text-secondary opacity-70'
    : 'badge badge-secondary text-secondary-content';
}

