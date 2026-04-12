'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import WeightInputForm from '@/components/WeightInputForm';
import WeightChart from '@/components/WeightChart';
import Dashboard from '@/components/Dashboard';
import DinosaurMascot, { messages } from '@/components/DinosaurMascot';
import PredictionCard from '@/components/PredictionCard';
import PastDataInput from '@/components/PastDataInput';
import { loadWeightData, syncFromSupabase } from '@/utils/storage';
import { calculateDashboardStats } from '@/utils/dashboard';
import { calculatePrediction } from '@/utils/prediction';
import { getInitialTheme, setTheme } from '@/utils/theme';

export default function DashboardPage() {
  const [data, setData] = useState(loadWeightData());
  const [mascotMessage, setMascotMessage] = useState('');
  const [showPastInput, setShowPastInput] = useState(false);
  const [theme, setCurrentTheme] = useState<'light' | 'dark'>(getInitialTheme());

  useEffect(() => {
    syncFromSupabase().then(synced => setData(synced));
  }, []);

  useEffect(() => {
    setTheme(theme);
  }, [theme]);

  const refreshData = () => {
    setData(loadWeightData());
  };

  const handleWeightInput = () => {
    refreshData();
    const randomMessage = messages.input[Math.floor(Math.random() * messages.input.length)];
    setMascotMessage(randomMessage);
  };

  const stats = calculateDashboardStats(data.entries, data.settings.goalWeight, data.settings.height);
  const prediction = calculatePrediction(data.entries, data.settings.goalWeight);

  // 체중 변화 감지 (간단히 최근 2개 비교)
  useEffect(() => {
    if (data.entries.length >= 2) {
      const sorted = data.entries.sort((a, b) => b.date.localeCompare(a.date));
      const latest = sorted[0];
      const previous = sorted[1];
      const latestWeight = latest.evening ?? latest.morning;
      const prevWeight = previous.evening ?? previous.morning;
      if (latestWeight && prevWeight) {
        if (latestWeight < prevWeight) {
          setMascotMessage(messages.weightDown[Math.floor(Math.random() * messages.weightDown.length)]);
        } else if (latestWeight > prevWeight) {
          setMascotMessage(messages.weightUp[Math.floor(Math.random() * messages.weightUp.length)]);
        }
      }
    }
  }, [data.entries]);

  // 목표 달성 체크
  useEffect(() => {
    const currentWeight = stats.todayEvening ?? stats.todayMorning;
    if (currentWeight && currentWeight <= data.settings.goalWeight) {
      setMascotMessage(messages.goalAchieved[Math.floor(Math.random() * messages.goalAchieved.length)]);
    }
  }, [stats, data.settings.goalWeight]);

  return (
    <div className="min-h-screen bg-pink-50 dark:bg-gray-900 py-4 px-2 sm:py-8 sm:px-4">
      <div className="max-w-6xl mx-auto">
        <header className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-pink-700 dark:text-pink-300 mb-4 text-center sm:text-left">Diet Daily 🦖</h1>
          <div className="flex justify-center sm:justify-end space-x-2 sm:space-x-4">
            <Link href="/input" className="px-3 py-2 sm:px-4 sm:py-2 bg-pink-400 text-white rounded-lg hover:bg-pink-500 text-sm sm:text-base">
              홈
            </Link>
            <Link href="/settings" className="px-3 py-2 sm:px-4 sm:py-2 bg-pink-300 text-white rounded-lg hover:bg-pink-400 text-sm sm:text-base">
              설정
            </Link>
            <button
              onClick={() => setCurrentTheme(theme === 'dark' ? 'light' : 'dark')}
              className="px-3 py-2 sm:px-4 sm:py-2 bg-pink-100 dark:bg-gray-700 rounded-lg text-sm sm:text-base text-pink-600 dark:text-pink-300"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
          </div>
        </header>

        <Dashboard stats={stats} />

        <div className="space-y-6 mb-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg sm:text-xl font-semibold text-pink-700 dark:text-pink-300">체중 입력</h2>
            <button
              onClick={() => setShowPastInput(!showPastInput)}
              className="px-3 py-1 bg-pink-400 text-white rounded text-sm hover:bg-pink-500"
            >
              {showPastInput ? '닫기' : '과거 데이터 입력'}
            </button>
          </div>
          <WeightInputForm onSubmit={handleWeightInput} />
          {showPastInput && (
            <PastDataInput onSave={handleWeightInput} />
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <PredictionCard prediction={prediction} />
        </div>

        <WeightChart entries={data.entries} goalWeight={data.settings.goalWeight} />

        <DinosaurMascot message={mascotMessage} />
      </div>
    </div>
  );
}