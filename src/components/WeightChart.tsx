'use client';

import { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot } from 'recharts';
import { WeightEntry } from '@/types';
import { parseDate } from '@/utils/dates';
import { format, subDays } from 'date-fns';
import { ko } from 'date-fns/locale';

interface WeightChartProps {
  entries: WeightEntry[];
}

type FilterType = '1week' | '2weeks' | '3weeks' | '1month';

const FILTER_LABELS: Record<FilterType, string> = {
  '1week': '1주일',
  '2weeks': '2주',
  '3weeks': '3주',
  '1month': '1개월',
};

const FILTER_DAYS: Record<FilterType, number> = {
  '1week': 7,
  '2weeks': 14,
  '3weeks': 21,
  '1month': 31,
};

export default function WeightChart({ entries }: WeightChartProps) {
  const [filter, setFilter] = useState<FilterType>('1week');

  const chartData = useMemo(() => {
    const cutoff = subDays(new Date(), FILTER_DAYS[filter]);

    const filtered = entries.filter(e => parseDate(e.date) >= cutoff);
    if (filtered.length === 0) return [];

    return filtered.map(entry => ({
      date: format(parseDate(entry.date), 'M/d', { locale: ko }),
      fullDate: entry.date,
      morning: entry.morning,
      evening: entry.evening,
    }));
  }, [entries, filter]);

  // Y축: 0.2kg 간격, 데이터 기반 범위
  const { yDomain, yTicks } = useMemo(() => {
    const allValues = chartData.flatMap(d =>
      [d.morning, d.evening].filter((v): v is number => v != null)
    );
    if (allValues.length === 0) return { yDomain: [55, 60] as [number, number], yTicks: [] };

    const min = Math.min(...allValues);
    const max = Math.max(...allValues);
    // 0.2 단위로 내림/올림, 여유 0.4kg
    const yMin = Math.floor((min - 0.4) * 5) / 5;
    const yMax = Math.ceil((max + 0.4) * 5) / 5;

    const ticks: number[] = [];
    for (let v = yMin; v <= yMax + 0.01; v += 0.2) {
      ticks.push(Math.round(v * 10) / 10);
    }

    return { yDomain: [yMin, yMax] as [number, number], yTicks: ticks };
  }, [chartData]);

  // 날짜 범위 표시
  const dateRange = useMemo(() => {
    if (chartData.length === 0) return '';
    const first = chartData[0];
    const last = chartData[chartData.length - 1];
    const fd = parseDate(first.fullDate);
    const ld = parseDate(last.fullDate);
    const dayName = (d: Date) => format(d, 'EEE', { locale: ko });
    return `${format(fd, 'yyyy. M. d.')} (${dayName(fd)}) ~ ${format(ld, 'yyyy. M. d.')} (${dayName(ld)})`;
  }, [chartData]);

  // 커스텀 툴팁
  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; dataKey: string }>; label?: string }) => {
    if (!active || !payload) return null;
    return (
      <div className="bg-white rounded-lg shadow-lg border border-pink-100 px-3 py-2 text-xs">
        <p className="font-medium text-gray-700 mb-1">{label}</p>
        {payload.map((p) => (
          <p key={p.dataKey} className={p.dataKey === 'morning' ? 'text-rose-400' : 'text-blue-400'}>
            {p.dataKey === 'morning' ? '아침' : '저녁'}: {p.value}kg
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white min-h-screen">
      {/* 헤더 */}
      <div className="px-4 pt-4 pb-2">
        <h2 className="text-lg font-bold text-gray-800 mb-1">몸무게 그래프</h2>
        {dateRange && (
          <p className="text-xs text-gray-400 text-center">{dateRange}</p>
        )}
      </div>

      {/* 차트 */}
      <div className="px-1">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData} margin={{ top: 20, right: 20, bottom: 10, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
            <XAxis
              dataKey="date"
              fontSize={11}
              tick={{ fill: '#9ca3af' }}
              axisLine={{ stroke: '#e5e7eb' }}
              tickLine={false}
            />
            <YAxis
              fontSize={10}
              tick={{ fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
              domain={yDomain}
              ticks={yTicks}
              tickFormatter={(v: number) => v.toFixed(1)}
              width={40}
            />
            <Tooltip content={<CustomTooltip />} />

            {/* 저녁 라인 (파란색) */}
            <Line
              type="monotone"
              dataKey="evening"
              stroke="#93c5fd"
              strokeWidth={2}
              dot={{ r: 4, fill: '#93c5fd', stroke: '#93c5fd' }}
              connectNulls
            />

            {/* 아침 라인 (빨간색) */}
            <Line
              type="monotone"
              dataKey="morning"
              stroke="#fca5a5"
              strokeWidth={2}
              dot={{ r: 4, fill: '#fca5a5', stroke: '#fca5a5' }}
              connectNulls
            />

            {/* 데이터 포인트 위에 숫자 표시 */}
            {chartData.map((d, i) => (
              d.morning != null && (
                <ReferenceDot
                  key={`m-${i}`}
                  x={d.date}
                  y={d.morning}
                  r={0}
                  label={{ value: d.morning.toString(), position: 'top', fontSize: 10, fill: '#f87171', offset: 8 }}
                />
              )
            ))}
            {chartData.map((d, i) => (
              d.evening != null && (
                <ReferenceDot
                  key={`e-${i}`}
                  x={d.date}
                  y={d.evening}
                  r={0}
                  label={{ value: d.evening.toString(), position: 'bottom', fontSize: 10, fill: '#60a5fa', offset: 8 }}
                />
              )
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 범례 */}
      <div className="flex justify-center gap-6 py-2 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-rose-300 rounded"></span> 아침
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-blue-300 rounded"></span> 저녁
        </span>
      </div>

      {/* 기간 필터 */}
      <div className="flex justify-center gap-2 px-4 pb-6 pt-2">
        {(Object.keys(FILTER_LABELS) as FilterType[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-xs font-medium ${
              filter === f
                ? 'bg-pink-400 text-white'
                : 'bg-gray-100 text-gray-500'
            }`}
          >
            {FILTER_LABELS[f]}
          </button>
        ))}
      </div>
    </div>
  );
}
