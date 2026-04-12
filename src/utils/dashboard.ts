import { WeightEntry, DashboardStats } from '@/types';
import { parseDate, getToday, formatDate } from './dates';
import { subDays } from 'date-fns';
import { calculateBMI } from './bmi';

function getWeight(entry: WeightEntry): number | null {
  return entry.evening ?? entry.morning;
}

export function calculateDashboardStats(
  entries: WeightEntry[],
  goalWeight: number,
  height: number
): DashboardStats {
  const today = getToday();
  const yesterday = formatDate(subDays(new Date(), 1));

  const todayEntry = entries.find(e => e.date === today);
  const yesterdayEntry = entries.find(e => e.date === yesterday);

  const todayMorning = todayEntry?.morning || null;
  const todayEvening = todayEntry?.evening || null;

  const yesterdayWeight = yesterdayEntry ? getWeight(yesterdayEntry) : null;
  const todayWeight = todayEntry ? getWeight(todayEntry) : null;
  const yesterdayChange = yesterdayWeight && todayWeight ? todayWeight - yesterdayWeight : null;

  // 주간 감량: 최근 7일 첫날과 마지막날 비교
  const weekEntries = entries
    .filter(e => {
      const date = parseDate(e.date);
      const weekAgo = subDays(new Date(), 7);
      return date >= weekAgo;
    })
    .sort((a, b) => a.date.localeCompare(b.date));

  const weeklyLoss = weekEntries.length >= 2
    ? (getWeight(weekEntries[0]) || 0) - (getWeight(weekEntries[weekEntries.length - 1]) || 0)
    : 0;

  const currentWeight = todayWeight || yesterdayWeight || 0;
  const remainingKg = currentWeight - goalWeight;

  // 스트릭: 연속 입력 일수
  let streak = 0;
  const sortedEntries = entries.sort((a, b) => b.date.localeCompare(a.date));
  const todayDate = new Date();
  for (let i = 0; ; i++) {
    const checkDate = formatDate(subDays(todayDate, i));
    const entry = sortedEntries.find(e => e.date === checkDate);
    if (!entry || (!entry.morning && !entry.evening)) break;
    streak++;
  }

  const bmi = currentWeight && height ? calculateBMI(currentWeight, height) : null;
  const dailyVariation = todayMorning && todayEvening ? todayEvening - todayMorning : null;

  return {
    todayMorning,
    todayEvening,
    yesterdayChange,
    weeklyLoss,
    remainingKg,
    streak,
    bmi,
    dailyVariation,
  };
}