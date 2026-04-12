'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import WeightInputForm from '@/components/WeightInputForm';
import WeightChart from '@/components/WeightChart';
import Dashboard from '@/components/Dashboard';
import DinosaurMascot, { messages } from '@/components/DinosaurMascot';
import PredictionCard from '@/components/PredictionCard';
import { loadWeightData } from '@/utils/storage';
import { calculateDashboardStats } from '@/utils/dashboard';
import { calculatePrediction } from '@/utils/prediction';
import { exportToCSV } from '@/utils/exportCSV';
import { getInitialTheme, setTheme } from '@/utils/theme';

export default function DashboardPage() {
  const [data, setData] = useState(loadWeightData());
  const [mascotMessage, setMascotMessage] = useState('');
  const [showPastInput, setShowPastInput] = useState(false);
  const [theme, setCurrentTheme] = useState<'light' | 'dark'>(getInitialTheme());

  useEffect(() => {
    setData(loadWeightData());
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 px-2 sm:py-8 sm:px-4">
      <div className="max-w-6xl mx-auto">
        <header className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4 text-center sm:text-left">Diet Daily 🦖</h1>
          <div className="flex justify-center sm:justify-end space-x-2 sm:space-x-4">
            <Link href="/" className="px-3 py-2 sm:px-4 sm:py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 text-sm sm:text-base">
              홈
            </Link>
            <Link href="/settings" className="px-3 py-2 sm:px-4 sm:py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm sm:text-base">
              설정
            </Link>
            <button
              onClick={() => setCurrentTheme(theme === 'dark' ? 'light' : 'dark')}
              className="px-3 py-2 sm:px-4 sm:py-2 bg-gray-200 dark:bg-gray-700 rounded-lg text-sm sm:text-base"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <button
              onClick={() => exportToCSV(data.entries)}
              className="px-3 py-2 sm:px-4 sm:py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm sm:text-base"
            >
              CSV
            </button>
          </div>
        </header>

        <Dashboard stats={stats} />

        <div className="space-y-6 mb-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-white">체중 입력</h2>
            <button
              onClick={() => setShowPastInput(!showPastInput)}
              className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
            >
              {showPastInput ? '닫기' : '과거 데이터 입력'}
            </button>
          </div>
          <WeightInputForm onSubmit={handleWeightInput} />
          {showPastInput && (
            <div className="bg-yellow-50 dark:bg-yellow-900 p-4 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-2">
                💡 과거 데이터를 입력하려면 위 폼에서 날짜를 선택하세요.
              </p>
            </div>
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