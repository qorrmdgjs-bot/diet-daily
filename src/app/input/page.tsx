'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { addWeightEntry, updateSettings, loadWeightData } from '@/utils/storage';
import { getToday } from '@/utils/dates';
import { WeightEntry } from '@/types';

export default function InputPage() {
  const [date, setDate] = useState(getToday());
  const [morning, setMorning] = useState('');
  const [evening, setEvening] = useState('');
  const [goalWeight, setGoalWeight] = useState('');
  const [height, setHeight] = useState('');
  const [hasData, setHasData] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const data = loadWeightData();
    if (data.settings.goalWeight) setGoalWeight(data.settings.goalWeight.toString());
    if (data.settings.height) setHeight(data.settings.height.toString());
    setHasData(data.entries.length > 0);
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

    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-white py-8 px-4 flex items-center justify-center">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-pink-700 mb-4">Diet Daily 🐰</h1>
          <p className="text-pink-400">오늘의 체중을 입력해주세요!</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-md space-y-4 border border-pink-100">
          <div>
            <label className="block text-sm font-medium text-pink-600 mb-2">
              날짜
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-md border-pink-200 shadow-sm focus:border-pink-400 focus:ring-pink-400 px-3 py-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-pink-600 mb-2">
                아침 체중 (kg)
              </label>
              <input
                type="number"
                step="0.1"
                value={morning}
                onChange={(e) => setMorning(e.target.value)}
                placeholder="예: 65.5"
                className="w-full rounded-md border-pink-200 shadow-sm focus:border-pink-400 focus:ring-pink-400 px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-pink-600 mb-2">
                저녁 체중 (kg)
              </label>
              <input
                type="number"
                step="0.1"
                value={evening}
                onChange={(e) => setEvening(e.target.value)}
                placeholder="예: 64.8"
                className="w-full rounded-md border-pink-200 shadow-sm focus:border-pink-400 focus:ring-pink-400 px-3 py-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-pink-600 mb-2">
                목표 체중 (kg)
              </label>
              <input
                type="number"
                step="0.1"
                value={goalWeight}
                onChange={(e) => setGoalWeight(e.target.value)}
                placeholder="예: 60.0"
                className="w-full rounded-md border-pink-200 shadow-sm focus:border-pink-400 focus:ring-pink-400 px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-pink-600 mb-2">
                키 (cm)
              </label>
              <input
                type="number"
                step="1"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="예: 170"
                className="w-full rounded-md border-pink-200 shadow-sm focus:border-pink-400 focus:ring-pink-400 px-3 py-2"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-pink-400 text-white py-3 px-4 rounded-md hover:bg-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-400 text-lg font-semibold"
          >
            저장하고 분석 보기
          </button>
        </form>

        {hasData && (
          <div className="mt-4 flex justify-center gap-3">
            <Link href="/dashboard" className="px-4 py-2 bg-pink-100 text-pink-600 rounded-lg hover:bg-pink-200 text-sm">
              분석 보기
            </Link>
            <Link href="/past-input" className="px-4 py-2 bg-pink-100 text-pink-600 rounded-lg hover:bg-pink-200 text-sm">
              과거 데이터 입력
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
