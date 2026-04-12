import { WeightEntry, Prediction } from '@/types';
import { parseDate } from './dates';

function getWeight(entry: WeightEntry): number | null {
  return entry.evening ?? entry.morning;
}

export function calculatePrediction(entries: WeightEntry[], goalWeight: number): Prediction {
  // 최근 7일 데이터
  const recentEntries = entries
    .filter(e => getWeight(e) !== null)
    .sort((a, b) => parseDate(b.date).getTime() - parseDate(a.date).getTime())
    .slice(0, 7)
    .reverse(); // 오래된 순

  if (recentEntries.length < 2) {
    return { daysToGoal: null, weeklyLossRate: 0 };
  }

  const weights = recentEntries.map(e => getWeight(e)!);
  const dates = recentEntries.map(e => parseDate(e.date).getTime());

  // 선형 회귀: y = mx + b, m = slope
  const n = weights.length;
  const sumX = dates.reduce((a, b) => a + b, 0);
  const sumY = weights.reduce((a, b) => a + b, 0);
  const sumXY = dates.reduce((sum, x, i) => sum + x * weights[i], 0);
  const sumXX = dates.reduce((sum, x) => sum + x * x, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // 일일 변화율 (kg/day), 음수면 감량
  const dailyChange = slope * (24 * 60 * 60 * 1000); // ms to day

  const currentWeight = weights[weights.length - 1];
  const remaining = currentWeight - goalWeight;

  let daysToGoal: number | null = null;
  if (dailyChange < 0) { // 감량 중
    daysToGoal = Math.ceil(remaining / dailyChange);
  }

  // 주간 감량 속도: kg/week, 양수로
  const weeklyLossRate = Math.abs(dailyChange * 7);

  return { daysToGoal, weeklyLossRate };
}