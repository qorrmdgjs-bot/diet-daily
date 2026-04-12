'use client';

import { DashboardStats } from '@/types';

interface DashboardProps {
  stats: DashboardStats;
}

export default function Dashboard({ stats }: DashboardProps) {
  const formatNumber = (num: number | null, decimals = 1) => num?.toFixed(decimals) || '-';

  const getChangeColor = (change: number | null) => {
    if (!change) return 'text-pink-300';
    return change < 0 ? 'text-emerald-400' : 'text-rose-500';
  };

  const getChangeIcon = (change: number | null) => {
    if (!change) return '';
    return change < 0 ? '▼' : '▲';
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 shadow-md border border-pink-100 dark:border-gray-700">
        <h3 className="text-xs sm:text-sm font-medium text-pink-400 dark:text-pink-300">오늘 아침</h3>
        <p className="text-lg sm:text-2xl font-bold text-pink-700 dark:text-white">{formatNumber(stats.todayMorning)} kg</p>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 shadow-md border border-pink-100 dark:border-gray-700">
        <h3 className="text-xs sm:text-sm font-medium text-pink-400 dark:text-pink-300">오늘 저녁</h3>
        <p className="text-lg sm:text-2xl font-bold text-pink-700 dark:text-white">{formatNumber(stats.todayEvening)} kg</p>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 shadow-md border border-pink-100 dark:border-gray-700">
        <h3 className="text-xs sm:text-sm font-medium text-pink-400 dark:text-pink-300">어제 대비</h3>
        <p className={`text-lg sm:text-2xl font-bold ${getChangeColor(stats.yesterdayChange)}`}>
          {getChangeIcon(stats.yesterdayChange)} {formatNumber(Math.abs(stats.yesterdayChange || 0))} kg
        </p>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 shadow-md border border-pink-100 dark:border-gray-700">
        <h3 className="text-xs sm:text-sm font-medium text-pink-400 dark:text-pink-300">이번 주 감량</h3>
        <p className="text-lg sm:text-2xl font-bold text-emerald-400">{formatNumber(stats.weeklyLoss)} kg</p>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 shadow-md border border-pink-100 dark:border-gray-700">
        <h3 className="text-xs sm:text-sm font-medium text-pink-400 dark:text-pink-300">목표까지</h3>
        <p className="text-lg sm:text-2xl font-bold text-pink-500">{formatNumber(stats.remainingKg)} kg</p>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 shadow-md border border-pink-100 dark:border-gray-700">
        <h3 className="text-xs sm:text-sm font-medium text-pink-400 dark:text-pink-300">연속 입력</h3>
        <p className="text-lg sm:text-2xl font-bold text-rose-400">🔥 {stats.streak}일</p>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 shadow-md border border-pink-100 dark:border-gray-700">
        <h3 className="text-xs sm:text-sm font-medium text-pink-400 dark:text-pink-300">BMI</h3>
        <p className="text-lg sm:text-2xl font-bold text-fuchsia-400">{formatNumber(stats.bmi, 1)}</p>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 shadow-md border border-pink-100 dark:border-gray-700">
        <h3 className="text-xs sm:text-sm font-medium text-pink-400 dark:text-pink-300">하루 변동폭</h3>
        <p className="text-lg sm:text-2xl font-bold text-purple-400">{formatNumber(stats.dailyVariation)} kg</p>
      </div>
    </div>
  );
}