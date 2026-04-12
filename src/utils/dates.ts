import { format, addDays, subDays, isSameDay, parseISO } from 'date-fns';

export function formatDate(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function getToday(): string {
  return formatDate(new Date());
}

export function getDateRange(days: number): string[] {
  const dates: string[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    dates.push(formatDate(subDays(today, i)));
  }
  return dates;
}

export function parseDate(dateStr: string): Date {
  return parseISO(dateStr);
}

export function isToday(dateStr: string): boolean {
  return isSameDay(parseDate(dateStr), new Date());
}