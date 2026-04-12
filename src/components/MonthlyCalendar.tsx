'use client';

import { useState } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isToday } from 'date-fns';
import { ko } from 'date-fns/locale';
import { WeightEntry } from '@/types';

interface MonthlyCalendarProps {
  entries: WeightEntry[];
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

export default function MonthlyCalendar({ entries }: MonthlyCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  // 날짜별 데이터 맵
  const entryMap = new Map<string, WeightEntry>();
  for (const entry of entries) {
    entryMap.set(entry.date, entry);
  }

  // 달력 날짜 배열 생성
  const days: Date[] = [];
  let day = calendarStart;
  while (day <= calendarEnd) {
    days.push(day);
    day = addDays(day, 1);
  }

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-pink-100 p-3 sm:p-5">
      {/* 월 네비게이션 */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={handlePrevMonth} className="p-2 text-pink-500 hover:bg-pink-50 rounded-lg text-lg">
          ◀
        </button>
        <h2 className="text-lg sm:text-xl font-bold text-pink-700">
          {format(currentMonth, 'yyyy년 M월', { locale: ko })}
        </h2>
        <button onClick={handleNextMonth} className="p-2 text-pink-500 hover:bg-pink-50 rounded-lg text-lg">
          ▶
        </button>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map((wd, i) => (
          <div
            key={wd}
            className={`text-center text-xs font-semibold py-1 ${
              i === 0 ? 'text-rose-400' : i === 6 ? 'text-blue-400' : 'text-gray-500'
            }`}
          >
            {wd}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div className="grid grid-cols-7 gap-[1px] bg-pink-50 rounded-lg overflow-hidden">
        {days.map((d) => {
          const dateStr = format(d, 'yyyy-MM-dd');
          const entry = entryMap.get(dateStr);
          const inMonth = isSameMonth(d, currentMonth);
          const today = isToday(d);
          const dayOfWeek = d.getDay();

          return (
            <div
              key={dateStr}
              className={`bg-white p-1 sm:p-1.5 min-h-[60px] sm:min-h-[75px] ${
                !inMonth ? 'opacity-30' : ''
              }`}
            >
              {/* 날짜 숫자 */}
              <div className="flex justify-center mb-0.5">
                <span
                  className={`text-xs sm:text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full ${
                    today
                      ? 'bg-pink-500 text-white'
                      : dayOfWeek === 0
                        ? 'text-rose-400'
                        : dayOfWeek === 6
                          ? 'text-blue-400'
                          : 'text-gray-700'
                  }`}
                >
                  {format(d, 'd')}
                </span>
              </div>

              {/* 체중 데이터 */}
              {inMonth && entry && (
                <div className="text-center space-y-0">
                  {entry.morning != null && (
                    <p className="text-[10px] sm:text-xs text-pink-500 leading-tight">
                      {entry.morning}kg
                    </p>
                  )}
                  {entry.evening != null && (
                    <p className="text-[10px] sm:text-xs text-purple-400 leading-tight">
                      {entry.evening}kg
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 범례 */}
      <div className="flex justify-center gap-4 mt-3 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-pink-500"></span> 아침
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-purple-400"></span> 저녁
        </span>
      </div>
    </div>
  );
}
