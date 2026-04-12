import { WeightEntry } from '@/types';

export function exportToCSV(entries: WeightEntry[]): void {
  const headers = ['날짜', '아침 체중', '저녁 체중'];
  const rows = entries.map(entry => [
    entry.date,
    entry.morning?.toString() || '',
    entry.evening?.toString() || '',
  ]);

  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', 'weight-data.csv');
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}