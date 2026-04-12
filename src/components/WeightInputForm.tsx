'use client';

import { useState, useEffect } from 'react';
import { WeightEntry } from '@/types';
import { addWeightEntry, updateSettings, loadWeightData } from '@/utils/storage';
import { getToday } from '@/utils/dates';

interface WeightInputFormProps {
  onSubmit?: () => void;
}

export default function WeightInputForm({ onSubmit }: WeightInputFormProps) {
  const [date, setDate] = useState(getToday());
  const [morning, setMorning] = useState('');
  const [evening, setEvening] = useState('');
  const [goalWeight, setGoalWeight] = useState('');
  const [height, setHeight] = useState('');

  useEffect(() => {
    const data = loadWeightData();
    setGoalWeight(data.settings.goalWeight.toString());
    setHeight(data.settings.height.toString());
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const entry: WeightEntry = {
      date,
      morning: morning ? parseFloat(morning) : null,
      evening: evening ? parseFloat(evening) : null,
    };
    addWeightEntry(entry);

    if (goalWeight) updateSettings({ goalWeight: parseFloat(goalWeight) });
    if (height) updateSettings({ height: parseFloat(height) });

    // Reset form
    setMorning('');
    setEvening('');
    onSubmit?.();
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-md border border-pink-100 dark:border-gray-700">
      <h2 className="text-lg sm:text-xl font-semibold mb-4 text-pink-700 dark:text-pink-300">체중 입력</h2>
      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
        <div>
          <label className="block text-sm font-medium text-pink-600 dark:text-pink-300">날짜</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 block w-full rounded-md border-pink-200 shadow-sm focus:border-pink-400 focus:ring-pink-400 text-sm sm:text-base dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="block text-sm font-medium text-pink-600 dark:text-pink-300">아침 몸무게 (kg)</label>
            <input
              type="number"
              step="0.1"
              value={morning}
              onChange={(e) => setMorning(e.target.value)}
              placeholder="예: 65.5"
              className="mt-1 block w-full rounded-md border-pink-200 shadow-sm focus:border-pink-400 focus:ring-pink-400 text-sm sm:text-base dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-pink-600 dark:text-pink-300">저녁 몸무게 (kg)</label>
            <input
              type="number"
              step="0.1"
              value={evening}
              onChange={(e) => setEvening(e.target.value)}
              placeholder="예: 64.8"
              className="mt-1 block w-full rounded-md border-pink-200 shadow-sm focus:border-pink-400 focus:ring-pink-400 text-sm sm:text-base dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="block text-sm font-medium text-pink-600 dark:text-pink-300">목표 체중 (kg)</label>
            <input
              type="number"
              step="0.1"
              value={goalWeight}
              onChange={(e) => setGoalWeight(e.target.value)}
              placeholder="예: 60.0"
              className="mt-1 block w-full rounded-md border-pink-200 shadow-sm focus:border-pink-400 focus:ring-pink-400 text-sm sm:text-base dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-pink-600 dark:text-pink-300">키 (cm)</label>
            <input
              type="number"
              step="1"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder="예: 170"
              className="mt-1 block w-full rounded-md border-pink-200 shadow-sm focus:border-pink-400 focus:ring-pink-400 text-sm sm:text-base dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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