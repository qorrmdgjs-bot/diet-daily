'use client';

import { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, ReferenceDot } from 'recharts';
import { SleepEntry } from '@/types';
import { parseDate } from '@/utils/dates';
import { format, subDays } from 'date-fns';
import { ko } from 'date-fns/locale';

interface SleepChartProps {
  entries: SleepEntry[];
  goalHours: number;
}

type FilterType = '1week' | '2weeks' | '3weeks' | '1month' | '3months' | 'all';

const FILTER_LABELS: Record<FilterType, string> = {
  '1week': '1주일',
  '2weeks': '2주',
  '3weeks': '3주',
  '1month': '1개월',
  '3months': '3개월',
  'all': '전체',
};

const FILTER_DAYS: Record<FilterType, number> = {
  '1week': 7,
  '2weeks': 14,
  '3weeks': 21,
  '1month': 31,
  '3months': 90,
  'all': 0,
};

const SHOW_LABELS: Set<FilterType> = new Set(['1week', '2weeks', '3weeks', '1month']);

export default function SleepChart({ entries, goalHours }: SleepChartProps) {
  const [filter, setFilter] = useState<FilterType>('1week');

  const chartData = useMemo(() => {
    const daysBack = FILTER_DAYS[filter];
    const filtered = daysBack === 0
      ? entries
      : entries.filter(e => parseDate(e.date) >= subDays(new Date(), daysBack));
    if (filtered.length === 0) return [];

    return filtered.map(entry => ({
      date: format(parseDate(entry.date), 'M/d', { locale: ko }),
      fullDate: entry.date,
      hours: entry.hours,
    }));
  }, [entries, filter]);

  // Y축: 0.5시간 간격, 데이터 + 목표시간 기반 범위
  const { yDomain, yTicks } = useMemo(() => {
    const allValues = chartData
      .map(d => d.hours)
      .filter((v): v is number => v != null);
    allValues.push(goalHours);
    if (allValues.length === 0) return { yDomain: [6, 9] as [number, number], yTicks: [] };

    const min = Math.min(...allValues);
    const max = Math.max(...allValues);
    // 0.5 단위로 내림/올림, 여유 0.5시간
    const yMin = Math.max(0, Math.floor((min - 0.5) * 2) / 2);
    const yMax = Math.ceil((max + 0.5) * 2) / 2;

    const ticks: number[] = [];
    for (let v = yMin; v <= yMax + 0.01; v += 0.5) {
      ticks.push(Math.round(v * 10) / 10);
    }

    return { yDomain: [yMin, yMax] as [number, number], yTicks: ticks };
  }, [chartData, goalHours]);

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
    if (!active || !payload || payload.length === 0) return null;
    return (
      <div className="bg-white rounded-lg shadow-lg border border-indigo-100 px-3 py-2 text-xs">
        <p className="font-medium text-gray-700 mb-1">{label}</p>
        <p className="text-indigo-500">수면: {payload[0].value}시간</p>
      </div>
    );
  };

  return (
    <div className="bg-white min-h-screen">
      {/* 헤더 */}
      <div className="px-4 pt-4 pb-2">
        <h2 className="text-lg font-bold text-gray-800 mb-1">수면시간 그래프</h2>
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

            {/* 목표 수면시간 기준선 */}
            <ReferenceLine
              y={goalHours}
              stroke="#fbbf24"
              strokeDasharray="4 4"
              label={{ value: `목표 ${goalHours}h`, position: 'right', fontSize: 10, fill: '#f59e0b' }}
            />

            {/* 수면시간 라인 (인디고) */}
            <Line
              type="monotone"
              dataKey="hours"
              stroke="#818cf8"
              strokeWidth={2}
              dot={SHOW_LABELS.has(filter) ? { r: 4, fill: '#818cf8', stroke: '#818cf8' } : { r: 1.5, fill: '#818cf8', stroke: '#818cf8' }}
              connectNulls
            />

            {/* 데이터 포인트 위에 숫자 표시 (단기 필터만) */}
            {SHOW_LABELS.has(filter) && chartData.map((d, i) => (
              d.hours != null && (
                <ReferenceDot
                  key={`h-${i}`}
                  x={d.date}
                  y={d.hours}
                  r={0}
                  label={{ value: d.hours.toString(), position: 'top', fontSize: 10, fill: '#6366f1', offset: 8 }}
                />
              )
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 범례 */}
      <div className="flex justify-center gap-6 py-2 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-indigo-300 rounded"></span> 수면시간
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-amber-300 rounded"></span> 목표
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
                ? 'bg-indigo-400 text-white'
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
