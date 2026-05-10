import { WeightEntry, UserSettings } from '@/types';
import { subDays } from 'date-fns';
import { formatDate } from './dates';

export type BadgeId =
  | 'first_step'
  | 'week_streak'
  | 'month_streak'
  | 'hundred_streak'
  | 'one_year'
  | 'goal_reached'
  | 'lost_1kg'
  | 'lost_5kg'
  | 'morning_evening_week';

export interface BadgeMeta {
  id: BadgeId;
  emoji: string;
  title: string;
  description: string;
}

export const BADGES: Record<BadgeId, BadgeMeta> = {
  first_step: { id: 'first_step', emoji: '🌱', title: '첫 걸음', description: '첫 기록 완료!' },
  week_streak: { id: 'week_streak', emoji: '⭐', title: '한 주 챔피언', description: '7일 연속 기록' },
  month_streak: { id: 'month_streak', emoji: '🌟', title: '한 달 챔피언', description: '30일 연속 기록' },
  hundred_streak: { id: 'hundred_streak', emoji: '💎', title: '100일 전설', description: '100일 연속 기록' },
  one_year: { id: 'one_year', emoji: '👑', title: '1주년', description: '365일 연속 기록' },
  goal_reached: { id: 'goal_reached', emoji: '🎯', title: '목표 달성', description: '목표 체중 도달' },
  lost_1kg: { id: 'lost_1kg', emoji: '🍀', title: '첫 -1kg', description: '시작 대비 1kg 감량' },
  lost_5kg: { id: 'lost_5kg', emoji: '🌸', title: '첫 -5kg', description: '시작 대비 5kg 감량' },
  morning_evening_week: { id: 'morning_evening_week', emoji: '✨', title: '꼼꼼이', description: '7일 연속 아침·저녁 모두 측정' },
};

export const ALL_BADGE_IDS: BadgeId[] = Object.keys(BADGES) as BadgeId[];

function getWeight(entry: WeightEntry): number | null {
  return entry.evening ?? entry.morning;
}

export function computeStreak(entries: WeightEntry[]): number {
  const map = new Map(entries.map(e => [e.date, e]));
  let streak = 0;
  for (let i = 0; ; i++) {
    const checkDate = formatDate(subDays(new Date(), i));
    const entry = map.get(checkDate);
    if (!entry || (entry.morning == null && entry.evening == null)) break;
    streak++;
  }
  return streak;
}

function morningEveningStreak(entries: WeightEntry[]): number {
  const map = new Map(entries.map(e => [e.date, e]));
  let streak = 0;
  for (let i = 0; ; i++) {
    const checkDate = formatDate(subDays(new Date(), i));
    const entry = map.get(checkDate);
    if (!entry || entry.morning == null || entry.evening == null) break;
    streak++;
  }
  return streak;
}

export function computeEarnedBadges(entries: WeightEntry[], settings: UserSettings): BadgeId[] {
  const earned: BadgeId[] = [];
  if (entries.length === 0) return earned;

  if (entries.some(e => e.morning != null || e.evening != null)) {
    earned.push('first_step');
  }

  const streak = computeStreak(entries);
  if (streak >= 7) earned.push('week_streak');
  if (streak >= 30) earned.push('month_streak');
  if (streak >= 100) earned.push('hundred_streak');
  if (streak >= 365) earned.push('one_year');

  if (morningEveningStreak(entries) >= 7) earned.push('morning_evening_week');

  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  const startWeight = sorted.map(getWeight).find((w): w is number => w != null);
  const latestWeight = [...sorted].reverse().map(getWeight).find((w): w is number => w != null);

  if (startWeight != null && latestWeight != null) {
    const lost = startWeight - latestWeight;
    if (lost >= 1) earned.push('lost_1kg');
    if (lost >= 5) earned.push('lost_5kg');
    if (latestWeight <= settings.goalWeight) earned.push('goal_reached');
  }

  return earned;
}

const SEEN_KEY = 'diet-daily-seen-badges';

export function loadSeenBadges(): BadgeId[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(SEEN_KEY);
    return raw ? (JSON.parse(raw) as BadgeId[]) : [];
  } catch {
    return [];
  }
}

export function markBadgesSeen(ids: BadgeId[]): void {
  if (typeof window === 'undefined') return;
  const merged = Array.from(new Set([...loadSeenBadges(), ...ids]));
  localStorage.setItem(SEEN_KEY, JSON.stringify(merged));
}
