'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { loadWeightData, updateSettings } from '@/utils/storage';

export default function SettingsPage() {
  const [goalWeight, setGoalWeight] = useState('');
  const [height, setHeight] = useState('');
  const router = useRouter();

  useEffect(() => {
    const data = loadWeightData();
    setGoalWeight(data.settings.goalWeight.toString());
    setHeight(data.settings.height.toString());
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      goalWeight: parseFloat(goalWeight),
      height: parseFloat(height),
    });
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-pink-50 dark:bg-gray-900 py-4 px-2 sm:py-8 sm:px-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-pink-700 dark:text-pink-300 mb-6 text-center">설정</h1>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-md space-y-4 border border-pink-100 dark:border-gray-700">
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
              className="w-full rounded-md border-pink-200 shadow-sm focus:border-pink-400 focus:ring-pink-400 text-sm sm:text-base dark:bg-gray-700 dark:border-gray-600 dark:text-white px-3 py-2"
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
              className="w-full rounded-md border-pink-200 shadow-sm focus:border-pink-400 focus:ring-pink-400 text-sm sm:text-base dark:bg-gray-700 dark:border-gray-600 dark:text-white px-3 py-2"
              required
            />
          </div>

          <div className="flex space-x-3">
            <button
              type="submit"
              className="flex-1 bg-pink-400 text-white py-2 px-4 rounded-md hover:bg-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm sm:text-base"
            >
              저장하기
            </button>
            <button
              type="button"
              onClick={() => router.push('/')}
              className="flex-1 bg-pink-100 dark:bg-gray-600 text-pink-600 dark:text-gray-300 py-2 px-4 rounded-md hover:bg-pink-200 dark:hover:bg-gray-500 text-sm sm:text-base"
            >
              취소
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}