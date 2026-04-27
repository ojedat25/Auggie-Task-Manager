export type DayCell = {
  date: Date;
  inCurrentMonth: boolean;
  key: string; // YYYY-MM-DD
};

export function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function endOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

export function addDays(d: Date, days: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}

export function formatYmd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function buildMonthGrid(viewDate: Date): {
  gridStart: Date;
  gridEnd: Date;
  days: DayCell[];
} {
  const monthStart = startOfMonth(viewDate);
  const monthEnd = endOfMonth(viewDate);

  // Sunday-based week (0=Sun..6=Sat)
  const gridStart = addDays(monthStart, -monthStart.getDay());
  const gridEnd = addDays(monthEnd, 6 - monthEnd.getDay());

  const days: DayCell[] = [];
  for (let d = gridStart; d <= gridEnd; d = addDays(d, 1)) {
    const day = startOfDay(d);
    days.push({
      date: day,
      inCurrentMonth: day.getMonth() === viewDate.getMonth(),
      key: formatYmd(day),
    });
  }

  return { gridStart, gridEnd, days };
}

export function monthTitle(d: Date): string {
  return d.toLocaleString(undefined, { month: 'long', year: 'numeric' });
}
