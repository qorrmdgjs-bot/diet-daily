'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { addWeightEntry, updateSettings } from '@/utils/storage';
import { getToday } from '@/utils/dates';
import { WeightEntry } from '@/types';

export default function InputPage() {
  const [date, setDate] = useState(getToday());
  const [morning, setMorning] = useState('');
  const [evening, setEvening] = useState('');
  const [goalWeight, setGoalWeight] = useState('');
  const [height, setHeight] = useState('');
  const router = useRouter();

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

    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black py-8 px-4 flex items-center justify-center">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-pink-700 dark:text-pink-300 mb-4">Diet Daily 🦕</h1>
          <p className="text-pink-400 dark:text-pink-300">체중 관리를 시작해보세요!</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md space-y-4 border border-pink-100 dark:border-gray-700">
          <div>
            <label className="block text-sm font-medium text-pink-600 dark:text-pink-300 mb-2">
              오늘 날짜
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-md border-pink-200 shadow-sm focus:border-pink-400 focus:ring-pink-400 dark:bg-gray-700 dark:border-gray-600 dark:text-white px-3 py-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-pink-600 dark:text-pink-300 mb-2">
                아침 체중 (kg)
              </label>
              <input
                type="number"
                step="0.1"
                value={morning}
                onChange={(e) => setMorning(e.target.value)}
                placeholder="예: 65.5"
                className="w-full rounded-md border-pink-200 shadow-sm focus:border-pink-400 focus:ring-pink-400 dark:bg-gray-700 dark:border-gray-600 dark:text-white px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-pink-600 dark:text-pink-300 mb-2">
                저녁 체중 (kg)
              </label>
              <input
                type="number"
                step="0.1"
                value={evening}
                onChange={(e) => setEvening(e.target.value)}
                placeholder="예: 64.8"
                className="w-full rounded-md border-pink-200 shadow-sm focus:border-pink-400 focus:ring-pink-400 dark:bg-gray-700 dark:border-gray-600 dark:text-white px-3 py-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-pink-600 dark:text-pink-300 mb-2">
                목표 체중 (kg)
              </label>
              <input
                type="number"
                step="0.1"
                value={goalWeight}
                onChange={(e) => setGoalWeight(e.target.value)}
                placeholder="예: 60.0"
                className="w-full rounded-md border-pink-200 shadow-sm focus:border-pink-400 focus:ring-pink-400 dark:bg-gray-700 dark:border-gray-600 dark:text-white px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-pink-600 dark:text-pink-300 mb-2">
                키 (cm)
              </label>
              <input
                type="number"
                step="1"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="예: 170"
                className="w-full rounded-md border-pink-200 shadow-sm focus:border-pink-400 focus:ring-pink-400 dark:bg-gray-700 dark:border-gray-600 dark:text-white px-3 py-2"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-pink-400 text-white py-3 px-4 rounded-md hover:bg-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-400 text-lg font-semibold"
          >
            시작하기
          </button>
        </form>
      </div>
    </div>
  );
}