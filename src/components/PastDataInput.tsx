'use client';

import { useState, useEffect } from 'react';
import { format, getDaysInMonth } from 'date-fns';
import { ko } from 'date-fns/locale';
import { loadWeightData, addWeightEntry } from '@/utils/storage';
import { WeightEntry } from '@/types';

interface PastDataInputProps {
  onSave: () => void;
}

interface DayInput {
  morning: string;
  evening: string;
}

export default function PastDataInput({ onSave }: PastDataInputProps) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [days, setDays] = useState<Record<number, DayInput>>({});
  const [saved, setSaved] = useState(false);

  const daysInMonth = getDaysInMonth(new Date(year, month - 1));
  const monthLabel = format(new Date(year, month - 1), 'yyyy년 M월', { locale: ko });

  // 월이 바뀌면 기존 데이터 로드
  useEffect(() => {
    const data = loadWeightData();
    const initialDays: Record<number, DayInput> = {};
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const existing = data.entries.find(e => e.date === dateStr);
      initialDays[d] = {
        morning: existing?.morning != null ? String(existing.morning) : '',
        evening: existing?.evening != null ? String(existing.evening) : '',
      };
    }
    setDays(initialDays);
    setSaved(false);
  }, [year, month, daysInMonth]);

  const handleChange = (day: number, field: 'morning' | 'evening', value: string) => {
    setDays(prev => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }));
    setSaved(false);
  };

  const handlePrevMonth = () => {
    if (month === 1) {
      setYear(year - 1);
      setMonth(12);
    } else {
      setMonth(month - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 12) {
      setYear(year + 1);
      setMonth(1);
    } else {
      setMonth(month + 1);
    }
  };

  const handleSave = () => {
    for (let d = 1; d <= daysInMonth; d++) {
      const input = days[d];
      if (!input) continue;
      const morning = input.morning ? parseFloat(input.morning) : null;
      const evening = input.evening ? parseFloat(input.evening) : null;
      if (morning === null && evening === null) continue;

      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const entry: WeightEntry = { date: dateStr, morning, evening };
      addWeightEntry(entry);
    }
    setSaved(true);
    onSave();
  };

  const getDayOfWeek = (day: number) => {
    const date = new Date(year, month - 1, day);
    return format(date, 'EEE', { locale: ko });
  };

  const isWeekend = (day: number) => {
    const date = new Date(year, month - 1, day);
    const dow = date.getDay();
    return dow === 0 || dow === 6;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 sm:p-6">
      {/* 월 네비게이션 */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handlePrevMonth}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
        >
          ◀
        </button>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{monthLabel}</h3>
        <button
          onClick={handleNextMonth}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
        >
          ▶
        </button>
      </div>

      {/* 테이블 헤더 */}
      <div className="grid grid-cols-[60px_1fr_1fr] gap-1 mb-2 text-center text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400">
        <div>날짜</div>
        <div>아침 (kg)</div>
        <div>저녁 (kg)</div>
      </div>

      {/* 일별 입력 */}
      <div className="space-y-1 max-h-[400px] overflow-y-auto">
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => (
          <div
            key={day}
            className={`grid grid-cols-[60px_1fr_1fr] gap-1 items-center ${
              isWeekend(day) ? 'bg-blue-50 dark:bg-blue-900/20' : ''
            } rounded px-1 py-0.5`}
          >
            <div className={`text-xs sm:text-sm font-medium text-center ${
              isWeekend(day) ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
            }`}>
              {day}일 {getDayOfWeek(day)}
            </div>
            <input
              type="number"
              step="0.1"
              min="20"
              max="300"
              placeholder="-"
              value={days[day]?.morning ?? ''}
              onChange={e => handleChange(day, 'morning', e.target.value)}
              className="w-full px-2 py-1.5 text-sm text-center border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />
            <input
              type="number"
              step="0.1"
              min="20"
              max="300"
              placeholder="-"
              value={days[day]?.evening ?? ''}
              onChange={e => handleChange(day, 'evening', e.target.value)}
              className="w-full px-2 py-1.5 text-sm text-center border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />
          </div>
        ))}
      </div>

      {/* 저장 버튼 */}
      <div className="mt-4 flex items-center justify-end gap-3">
        {saved && (
          <span className="text-sm text-green-600 dark:text-green-400">저장 완료!</span>
        )}
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium text-sm"
        >
          저장
        </button>
      </div>
    </div>
  );
}
