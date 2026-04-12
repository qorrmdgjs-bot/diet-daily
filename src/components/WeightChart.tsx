'use client';

import { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { WeightEntry } from '@/types';
import { parseDate, formatDate } from '@/utils/dates';

interface WeightChartProps {
  entries: WeightEntry[];
  goalWeight: number;
}

type FilterType = '7days' | '30days' | 'all';

export default function WeightChart({ entries, goalWeight }: WeightChartProps) {
  const [filter, setFilter] = useState<FilterType>('30days');

  const chartData = useMemo(() => {
    let filteredEntries = entries;

    if (filter === '7days') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      filteredEntries = entries.filter(e => parseDate(e.date) >= sevenDaysAgo);
    } else if (filter === '30days') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      filteredEntries = entries.filter(e => parseDate(e.date) >= thirtyDaysAgo);
    }

    // 이동 평균 계산 (7일)
    const movingAverage: (number | null)[] = [];
    for (let i = 0; i < filteredEntries.length; i++) {
      const window = filteredEntries.slice(Math.max(0, i - 6), i + 1);
      const weights = window.map(e => e.evening ?? e.morning).filter(w => w !== null) as number[];
      movingAverage[i] = weights.length > 0 ? weights.reduce((a, b) => a + b, 0) / weights.length : null;
    }

    return filteredEntries.map((entry, index) => ({
      date: formatDate(parseDate(entry.date)),
      morning: entry.morning,
      evening: entry.evening,
      goal: goalWeight,
      movingAverage: movingAverage[index],
    }));
  }, [entries, filter, goalWeight]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-md border border-pink-100 dark:border-gray-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
        <h2 className="text-lg sm:text-xl font-semibold text-pink-700 dark:text-pink-300 mb-2 sm:mb-0">체중 추이</h2>
        <div className="flex flex-wrap gap-1 sm:gap-2">
          {(['7days', '30days', 'all'] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2 py-1 sm:px-3 sm:py-1 rounded text-xs sm:text-sm ${
                filter === f
                  ? 'bg-pink-400 text-white'
                  : 'bg-pink-100 dark:bg-gray-700 text-pink-600 dark:text-gray-300'
              }`}
            >
              {f === '7days' ? '7일' : f === '30days' ? '30일' : '전체'}
            </button>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#fce4ec" />
          <XAxis dataKey="date" fontSize={12} />
          <YAxis fontSize={12} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="morning" stroke="#f472b6" name="아침" strokeWidth={2} />
          <Line type="monotone" dataKey="evening" stroke="#c084fc" name="저녁" strokeWidth={2} />
          <Line type="monotone" dataKey="goal" stroke="#fb923c" strokeDasharray="5 5" name="목표" strokeWidth={2} />
          <Line type="monotone" dataKey="movingAverage" stroke="#f43f5e" name="7일 평균" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}