export type MoodKey = 'great' | 'good' | 'soso' | 'tired' | 'sad';

export interface WeightEntry {
  date: string; // YYYY-MM-DD
  morning: number | null;
  evening: number | null;
  mood?: MoodKey | null;
  note?: string | null;
}

export interface UserSettings {
  goalWeight: number;
  height: number; // cm
}

export interface WeightData {
  entries: WeightEntry[];
  settings: UserSettings;
}

export interface Prediction {
  daysToGoal: number | null;
  weeklyLossRate: number; // kg per week
}

export interface DashboardStats {
  todayMorning: number | null;
  todayEvening: number | null;
  yesterdayChange: number | null;
  weeklyLoss: number;
  remainingKg: number;
  streak: number;
  bmi: number | null;
  dailyVariation: number | null;
}