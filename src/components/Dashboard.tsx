'use client';

import { DashboardStats } from '@/types';
import { calculateDashboardStats } from '@/utils/dashboard';

interface DashboardProps {
  stats: DashboardStats;
}

export default function Dashboard({ stats }: DashboardProps) {
  const formatNumber = (num: number | null, decimals = 1) => num?.toFixed(decimals) || '-';

  const getChangeColor = (change: number | null) => {
    if (!change) return 'text-gray-500';
    return change < 0 ? 'text-green-500' : 'text-red-500';
  };

  const getChangeIcon = (change: number | null) => {
    if (!change) return '';
    return change < 0 ? '▼' : '▲';
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 shadow-md">
        <h3 className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">오늘 아침</h3>
        <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">{formatNumber(stats.todayMorning)} kg</p>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 shadow-md">
        <h3 className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">오늘 저녁</h3>
        <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">{formatNumber(stats.todayEvening)} kg</p>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 shadow-md">
        <h3 className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">어제 대비</h3>
        <p className={`text-lg sm:text-2xl font-bold ${getChangeColor(stats.yesterdayChange)}`}>
          {getChangeIcon(stats.yesterdayChange)} {formatNumber(Math.abs(stats.yesterdayChange || 0))} kg
        </p>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 shadow-md">
        <h3 className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">이번 주 감량</h3>
        <p className="text-lg sm:text-2xl font-bold text-green-500">{formatNumber(stats.weeklyLoss)} kg</p>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 shadow-md">
        <h3 className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">목표까지</h3>
        <p className="text-lg sm:text-2xl font-bold text-blue-500">{formatNumber(stats.remainingKg)} kg</p>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 shadow-md">
        <h3 className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">연속 입력</h3>
        <p className="text-lg sm:text-2xl font-bold text-orange-500">🔥 {stats.streak}일</p>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 shadow-md">
        <h3 className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">BMI</h3>
        <p className="text-lg sm:text-2xl font-bold text-purple-500">{formatNumber(stats.bmi, 1)}</p>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 shadow-md">
        <h3 className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">하루 변동폭</h3>
        <p className="text-lg sm:text-2xl font-bold text-indigo-500">{formatNumber(stats.dailyVariation)} kg</p>
      </div>
    </div>
  );
}