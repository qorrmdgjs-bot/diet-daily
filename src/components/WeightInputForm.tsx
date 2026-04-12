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
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 shadow-md">
      <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-800 dark:text-white">체중 입력</h2>
      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">날짜</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 text-sm sm:text-base dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">아침 몸무게 (kg)</label>
            <input
              type="number"
              step="0.1"
              value={morning}
              onChange={(e) => setMorning(e.target.value)}
              placeholder="예: 65.5"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 text-sm sm:text-base dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">저녁 몸무게 (kg)</label>
            <input
              type="number"
              step="0.1"
              value={evening}
              onChange={(e) => setEvening(e.target.value)}
              placeholder="예: 64.8"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 text-sm sm:text-base dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">목표 체중 (kg)</label>
            <input
              type="number"
              step="0.1"
              value={goalWeight}
              onChange={(e) => setGoalWeight(e.target.value)}
              placeholder="예: 60.0"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 text-sm sm:text-base dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">키 (cm)</label>
            <input
              type="number"
              step="1"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder="예: 170"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 text-sm sm:text-base dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        </div>
        <button
          type="submit"
          className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
        >
          저장하기
        </button>
      </form>
    </div>
  );
}