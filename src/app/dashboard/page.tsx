'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import WeightChart from '@/components/WeightChart';
import Dashboard from '@/components/Dashboard';
import DinosaurMascot, { messages } from '@/components/DinosaurMascot';
import PredictionCard from '@/components/PredictionCard';
import { loadWeightData, syncFromSupabase } from '@/utils/storage';
import { calculateDashboardStats } from '@/utils/dashboard';
import { calculatePrediction } from '@/utils/prediction';

export default function DashboardPage() {
  const [data, setData] = useState(loadWeightData());
  const [mascotMessage, setMascotMessage] = useState('');

  useEffect(() => {
    syncFromSupabase().then(synced => setData(synced));
  }, []);

  const stats = calculateDashboardStats(data.entries, data.settings.goalWeight, data.settings.height);
  const prediction = calculatePrediction(data.entries, data.settings.goalWeight);

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

  useEffect(() => {
    const currentWeight = stats.todayEvening ?? stats.todayMorning;
    if (currentWeight && currentWeight <= data.settings.goalWeight) {
      setMascotMessage(messages.goalAchieved[Math.floor(Math.random() * messages.goalAchieved.length)]);
    }
  }, [stats, data.settings.goalWeight]);

  return (
    <div className="min-h-screen bg-white py-4 px-2 sm:py-8 sm:px-4">
      <div className="max-w-6xl mx-auto">
        <header className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-pink-700 mb-4 text-center sm:text-left">Diet Daily 🐶</h1>
          <div className="flex justify-center sm:justify-end space-x-2 sm:space-x-4">
            <Link href="/input" className="px-3 py-2 sm:px-4 sm:py-2 bg-pink-400 text-white rounded-lg hover:bg-pink-500 text-sm sm:text-base">
              홈
            </Link>
            <Link href="/settings" className="px-3 py-2 sm:px-4 sm:py-2 bg-pink-300 text-white rounded-lg hover:bg-pink-400 text-sm sm:text-base">
              설정
            </Link>
          </div>
        </header>

        <Dashboard stats={stats} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <PredictionCard prediction={prediction} />
        </div>

        <WeightChart entries={data.entries} goalWeight={data.settings.goalWeight} />

        <DinosaurMascot message={mascotMessage} />
      </div>
    </div>
  );
}
