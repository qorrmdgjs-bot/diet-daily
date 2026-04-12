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

  // 주 단위로 나누기
  const weeks: Date[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  // 주간 평균 계산
  const getWeekAvg = (weekDays: Date[]) => {
    const mornings: number[] = [];
    const evenings: number[] = [];
    for (const d of weekDays) {
      if (!isSameMonth(d, currentMonth)) continue;
      const entry = entryMap.get(format(d, 'yyyy-MM-dd'));
      if (entry?.morning != null) mornings.push(entry.morning);
      if (entry?.evening != null) evenings.push(entry.evening);
    }
    return {
      morning: mornings.length > 0 ? Math.round((mornings.reduce((a, b) => a + b, 0) / mornings.length) * 10) / 10 : null,
      evening: evenings.length > 0 ? Math.round((evenings.reduce((a, b) => a + b, 0) / evenings.length) * 10) / 10 : null,
    };
  };

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

      {/* 요일 헤더 (8열: 일~토 + 평균) */}
      <div className="grid grid-cols-8 mb-1">
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
        <div className="text-center text-xs font-semibold py-1 text-amber-500">평균</div>
      </div>

      {/* 주별 그리드 */}
      <div className="space-y-[1px] bg-pink-50 rounded-lg overflow-hidden">
        {weeks.map((weekDays, wi) => {
          const avg = getWeekAvg(weekDays);
          return (
            <div key={wi} className="grid grid-cols-8 gap-[1px]">
              {/* 7일 */}
              {weekDays.map((d) => {
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

              {/* 주간 평균 셀 */}
              <div className="bg-amber-50 p-1 sm:p-1.5 min-h-[60px] sm:min-h-[75px] flex flex-col items-center justify-center">
                {(avg.morning != null || avg.evening != null) ? (
                  <div className="text-center space-y-0.5">
                    {avg.morning != null && (
                      <p className="text-[10px] sm:text-xs text-pink-500 font-semibold leading-tight">
                        {avg.morning}
                      </p>
                    )}
                    {avg.evening != null && (
                      <p className="text-[10px] sm:text-xs text-purple-400 font-semibold leading-tight">
                        {avg.evening}
                      </p>
                    )}
                  </div>
                ) : (
                  <span className="text-[10px] text-gray-300">-</span>
                )}
              </div>
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
