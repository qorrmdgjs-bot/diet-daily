import { WeightData, WeightEntry, UserSettings } from '@/types';

const STORAGE_KEY = 'diet-daily-data';

const defaultSettings: UserSettings = {
  goalWeight: 60,
  height: 170,
};

const defaultData: WeightData = {
  entries: [],
  settings: defaultSettings,
};

export function loadWeightData(): WeightData {
  if (typeof window === 'undefined') return defaultData;
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return defaultData;
    const parsed = JSON.parse(data);
    return {
      entries: parsed.entries || [],
      settings: { ...defaultSettings, ...parsed.settings },
    };
  } catch {
    return defaultData;
  }
}

export function saveWeightData(data: WeightData): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function addWeightEntry(entry: WeightEntry): void {
  const data = loadWeightData();
  const existingIndex = data.entries.findIndex(e => e.date === entry.date);
  if (existingIndex >= 0) {
    data.entries[existingIndex] = { ...data.entries[existingIndex], ...entry };
  } else {
    data.entries.push(entry);
  }
  data.entries.sort((a, b) => a.date.localeCompare(b.date));
  saveWeightData(data);
}

export function updateSettings(settings: Partial<UserSettings>): void {
  const data = loadWeightData();
  data.settings = { ...data.settings, ...settings };
  saveWeightData(data);
}