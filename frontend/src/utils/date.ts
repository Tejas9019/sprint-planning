// Centralized date helpers so the entire app shares one notion of "today".
// Everything here is computed from the real system clock — no hardcoded dates.

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/** Real "today" normalized to local midnight (no time component). */
export function getToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

/** Format a Date as a local YYYY-MM-DD string (avoids UTC off-by-one from toISOString). */
export function toDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Parse a YYYY-MM-DD string as a LOCAL date (not UTC), so the weekday/day never shifts. */
export function parseDateStr(str: string): Date {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

/** Today as a YYYY-MM-DD string. */
export function todayStr(): string {
  return toDateStr(getToday());
}

/** Return a new Date offset by `days` from the given date. */
export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/** YYYY-MM-DD string for a date `n` days from today (negative = past). */
export function daysFromTodayStr(n: number): string {
  return toDateStr(addDays(getToday(), n));
}

/** "June 2026" style label. */
export function formatMonthYear(date: Date): string {
  return `${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
}

/** True when two dates fall on the same calendar day. */
export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** True when the date string is today. */
export function isTodayStr(dateStr: string): boolean {
  return dateStr === todayStr();
}

/** A task/item is overdue when its date is before today and it isn't already done. */
export function isOverdue(dateStr?: string, status?: string): boolean {
  if (!dateStr || status === 'done') return false;
  return parseDateStr(dateStr).getTime() < getToday().getTime();
}

export interface CalendarDay {
  day: number;
  date: Date;
  dateStr: string;
  isCurrentMonth: boolean;
  isToday: boolean;
}

/**
 * Build a 6-week (42-cell) month grid for the given view date.
 * `weekStartsOn` controls alignment: 0 = Sunday (mini calendar), 1 = Monday (full calendar).
 */
export function buildMonthGrid(viewDate: Date, weekStartsOn: 0 | 1 = 0): CalendarDay[] {
  const today = getToday();
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstOfMonth = new Date(year, month, 1);
  const firstWeekday = firstOfMonth.getDay(); // 0 = Sunday
  const lead = (firstWeekday - weekStartsOn + 7) % 7;
  const gridStart = addDays(firstOfMonth, -lead);

  const days: CalendarDay[] = [];
  for (let i = 0; i < 42; i++) {
    const d = addDays(gridStart, i);
    days.push({
      day: d.getDate(),
      date: d,
      dateStr: toDateStr(d),
      isCurrentMonth: d.getMonth() === month,
      isToday: isSameDay(d, today),
    });
  }
  return days;
}
