'use client';

import { useState, useEffect } from 'react';
import { WeightEntry, MoodKey } from '@/types';
import { addWeightEntry, updateSettings, loadWeightData } from '@/utils/storage';
import { getToday } from '@/utils/dates';
import { MOOD_OPTIONS } from '@/constants/mood';

interface WeightInputFormProps {
  onSubmit?: () => void;
}

export default function WeightInputForm({ onSubmit }: WeightInputFormProps) {
  const [date, setDate] = useState(getToday());
  const [morning, setMorning] = useState('');
  const [evening, setEvening] = useState('');
  const [mood, setMood] = useState<MoodKey | null>(null);
  const [goalWeight, setGoalWeight] = useState('');
  const [height, setHeight] = useState('');

  useEffect(() => {
    const data = loadWeightData();
    setGoalWeight(data.settings.goalWeight.toString());
    setHeight(data.settings.height.toString());
    const todayEntry = data.entries.find(e => e.date === date);
    if (todayEntry?.mood) setMood(todayEntry.mood);
  }, [date]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const entry: WeightEntry = {
      date,
      morning: morning ? parseFloat(morning) : null,
      evening: evening ? parseFloat(evening) : null,
      mood,
    };
    addWeightEntry(entry);

    if (goalWeight) updateSettings({ goalWeight: parseFloat(goalWeight) });
    if (height) updateSettings({ height: parseFloat(height) });

    setMorning('');
    setEvening('');
    onSubmit?.();
  };

  return (
    <div className="bg-white rounded-xl p-4 sm:p-6 shadow-md border border-pink-100">
      <h2 className="text-lg sm:text-xl font-semibold mb-4 text-pink-700">체중 입력</h2>
      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
        <div>
          <label className="block text-sm font-medium text-pink-600">날짜</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 block w-full rounded-md border-pink-200 shadow-sm focus:border-pink-400 focus:ring-pink-400 text-sm sm:text-base"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="block text-sm font-medium text-pink-600">아침 몸무게 (kg)</label>
            <input
              type="number"
              step="0.1"
              value={morning}
              onChange={(e) => setMorning(e.target.value)}
              placeholder="예: 65.5"
              className="mt-1 block w-full rounded-md border-pink-200 shadow-sm focus:border-pink-400 focus:ring-pink-400 text-sm sm:text-base"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-pink-600">저녁 몸무게 (kg)</label>
            <input
              type="number"
              step="0.1"
              value={evening}
              onChange={(e) => setEvening(e.target.value)}
              placeholder="예: 64.8"
              className="mt-1 block w-full rounded-md border-pink-200 shadow-sm focus:border-pink-400 focus:ring-pink-400 text-sm sm:text-base"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-pink-600 mb-1.5">오늘 기분은?</label>
          <div className="flex gap-1.5 sm:gap-2">
            {MOOD_OPTIONS.map(opt => {
              const selected = mood === opt.key;
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setMood(selected ? null : opt.key)}
                  className={`flex-1 flex flex-col items-center justify-center py-2 rounded-xl border transition ${
                    selected
                      ? 'bg-pink-100 border-pink-400 ring-2 ring-pink-300'
                      : 'bg-white border-pink-200 hover:bg-pink-50'
                  }`}
                  aria-pressed={selected}
                  aria-label={opt.label}
                >
                  <span className="text-xl sm:text-2xl">{opt.emoji}</span>
                  <span className={`text-[10px] sm:text-xs mt-0.5 ${selected ? 'text-pink-700 font-medium' : 'text-pink-400'}`}>
                    {opt.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="block text-sm font-medium text-pink-600">목표 체중 (kg)</label>
            <input
              type="number"
              step="0.1"
              value={goalWeight}
              onChange={(e) => setGoalWeight(e.target.value)}
              placeholder="예: 60.0"
              className="mt-1 block w-full rounded-md border-pink-200 shadow-sm focus:border-pink-400 focus:ring-pink-400 text-sm sm:text-base"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-pink-600">키 (cm)</label>
            <input
              type="number"
              step="1"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder="예: 170"
              className="mt-1 block w-full rounded-md border-pink-200 shadow-sm focus:border-pink-400 focus:ring-pink-400 text-sm sm:text-base"
            />
          </div>
        </div>
        <button
          type="submit"
          className="w-full bg-pink-400 text-white py-2 px-4 rounded-md hover:bg-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm sm:text-base"
        >
          저장하기
        </button>
      </form>
    </div>
  );
}