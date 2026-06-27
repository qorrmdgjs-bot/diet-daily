'use client';

import { useState } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isToday } from 'date-fns';
import { ko } from 'date-fns/locale';
import { SleepEntry } from '@/types';

interface MonthlySleepCalendarProps {
  entries: SleepEntry[];
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

export default function MonthlySleepCalendar({ entries }: MonthlySleepCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  // 날짜별 데이터 맵
  const entryMap = new Map<string, SleepEntry>();
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
  const getWeekAvg = (weekDays: Date[]): number | null => {
    const hoursList: number[] = [];
    for (const d of weekDays) {
      const entry = entryMap.get(format(d, 'yyyy-MM-dd'));
      if (entry?.hours != null) hoursList.push(entry.hours);
    }
    return hoursList.length > 0
      ? Math.round((hoursList.reduce((a, b) => a + b, 0) / hoursList.length) * 10) / 10
      : null;
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-indigo-100 p-3 sm:p-5">
      {/* 월 네비게이션 */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={handlePrevMonth} className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-lg text-lg">
          ◀
        </button>
        <h2 className="text-lg sm:text-xl font-bold text-indigo-700">
          {format(currentMonth, 'yyyy년 M월', { locale: ko })}
        </h2>
        <button onClick={handleNextMonth} className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-lg text-lg">
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
      <div className="space-y-[1px] bg-indigo-50 rounded-lg overflow-hidden">
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
                    className={`relative bg-white p-1 sm:p-1.5 min-h-[60px] sm:min-h-[75px] ${
                      !inMonth ? 'bg-gray-50' : ''
                    }`}
                  >
                    <div className="flex justify-center mb-0.5">
                      <span
                        className={`text-xs sm:text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full ${
                          today
                            ? 'bg-indigo-500 text-white'
                            : !inMonth
                              ? 'text-gray-300'
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

                    {entry?.hours != null && (
                      <div className="text-center">
                        <p className="text-[10px] sm:text-xs text-indigo-500 font-medium leading-tight">
                          {entry.hours}h
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* 주간 평균 셀 */}
              <div className="bg-amber-50 p-1 sm:p-1.5 min-h-[60px] sm:min-h-[75px] flex flex-col items-center justify-center">
                {avg != null ? (
                  <p className="text-[10px] sm:text-xs text-indigo-500 font-semibold leading-tight">
                    {avg}h
                  </p>
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
          <span className="w-2 h-2 rounded-full bg-indigo-500"></span> 수면시간
        </span>
      </div>
    </div>
  );
}
