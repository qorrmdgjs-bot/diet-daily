'use client';

import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { WeightEntry } from '@/types';
import { parseDate } from '@/utils/dates';
import { startOfWeek, format, addDays } from 'date-fns';
import { ko } from 'date-fns/locale';

interface WeightChartProps {
  entries: WeightEntry[];
  goalWeight: number;
}

export default function WeightChart({ entries, goalWeight }: WeightChartProps) {
  const chartData = useMemo(() => {
    if (entries.length === 0) return [];

    // 주간별로 그룹핑
    const weekMap = new Map<string, { mornings: number[]; evenings: number[] }>();

    for (const entry of entries) {
      const date = parseDate(entry.date);
      const weekStart = startOfWeek(date, { weekStartsOn: 1 }); // 월요일 시작
      const weekEnd = addDays(weekStart, 6);
      const key = format(weekStart, 'MM/dd', { locale: ko }) + '~' + format(weekEnd, 'MM/dd', { locale: ko });

      if (!weekMap.has(key)) {
        weekMap.set(key, { mornings: [], evenings: [] });
      }
      const week = weekMap.get(key)!;
      if (entry.morning != null) week.mornings.push(entry.morning);
      if (entry.evening != null) week.evenings.push(entry.evening);
    }

    return Array.from(weekMap.entries()).map(([week, data]) => {
      const avgMorning = data.mornings.length > 0
        ? Math.round((data.mornings.reduce((a, b) => a + b, 0) / data.mornings.length) * 10) / 10
        : null;
      const avgEvening = data.evenings.length > 0
        ? Math.round((data.evenings.reduce((a, b) => a + b, 0) / data.evenings.length) * 10) / 10
        : null;
      return {
        week,
        morning: avgMorning,
        evening: avgEvening,
        goal: goalWeight,
      };
    });
  }, [entries, goalWeight]);

  // Y축 범위를 데이터 기반으로 계산
  const yDomain = useMemo(() => {
    const allValues = chartData.flatMap(d => [d.morning, d.evening, d.goal].filter((v): v is number => v != null));
    if (allValues.length === 0) return [40, 65];
    const min = Math.floor(Math.min(...allValues) - 2);
    const max = Math.ceil(Math.max(...allValues) + 2);
    return [min, max];
  }, [chartData]);

  return (
    <div className="bg-white rounded-xl p-4 sm:p-6 shadow-md border border-pink-100">
      <h2 className="text-lg sm:text-xl font-semibold text-pink-700 mb-4">체중 추이 (주간 평균)</h2>
      <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#fce4ec" />
          <XAxis dataKey="week" fontSize={11} />
          <YAxis fontSize={12} domain={yDomain} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="morning" stroke="#f472b6" name="아침 평균" strokeWidth={2} connectNulls />
          <Line type="monotone" dataKey="evening" stroke="#c084fc" name="저녁 평균" strokeWidth={2} connectNulls />
          <Line type="monotone" dataKey="goal" stroke="#fb923c" strokeDasharray="5 5" name="목표" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
