'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import MonthlyCalendar from '@/components/MonthlyCalendar';
import DinosaurMascot, { messages } from '@/components/DinosaurMascot';
import { loadWeightData, syncFromSupabase } from '@/utils/storage';

export default function DashboardPage() {
  const [data, setData] = useState(loadWeightData());
  const [mascotMessage, setMascotMessage] = useState('');

  useEffect(() => {
    syncFromSupabase().then(synced => setData(synced));
  }, []);

  // 목표까지 남은 kg 계산
  const latestEntry = data.entries.length > 0
    ? data.entries[data.entries.length - 1]
    : null;
  const currentWeight = latestEntry?.evening ?? latestEntry?.morning ?? null;
  const remaining = currentWeight != null
    ? Math.round((currentWeight - data.settings.goalWeight) * 10) / 10
    : null;

  // 체중 변화 감지
  useEffect(() => {
    if (data.entries.length >= 2) {
      const sorted = [...data.entries].sort((a, b) => b.date.localeCompare(a.date));
      const latest = sorted[0];
      const previous = sorted[1];
      const latestW = latest.evening ?? latest.morning;
      const prevW = previous.evening ?? previous.morning;
      if (latestW && prevW) {
        if (latestW < prevW) {
          setMascotMessage(messages.weightDown[Math.floor(Math.random() * messages.weightDown.length)]);
        } else if (latestW > prevW) {
          setMascotMessage(messages.weightUp[Math.floor(Math.random() * messages.weightUp.length)]);
        }
      }
    }
  }, [data.entries]);

  return (
    <div className="min-h-screen bg-white py-4 px-2 sm:py-6 sm:px-4">
      <div className="max-w-lg mx-auto">
        {/* 상단 목표 안내 */}
        {remaining != null && (
          <div className="flex items-center gap-2 mb-4 px-2">
            <span className="text-2xl">🦄</span>
            <p className="text-sm text-pink-600 font-medium">
              목표 몸무게까지 <span className="font-bold text-pink-700">{remaining > 0 ? `-${remaining}` : `+${Math.abs(remaining)}`}Kg</span> 남았어요!
            </p>
          </div>
        )}

        {/* 달력 */}
        <MonthlyCalendar entries={data.entries} />

        {/* 하단 버튼 */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <Link href="/input" className="text-center px-4 py-3 bg-pink-400 text-white rounded-xl hover:bg-pink-500 font-medium text-sm">
            체중 입력
          </Link>
          <Link href="/graph" className="text-center px-4 py-3 bg-pink-400 text-white rounded-xl hover:bg-pink-500 font-medium text-sm">
            그래프
          </Link>
          <Link href="/past-input" className="text-center px-4 py-3 bg-pink-100 text-pink-600 rounded-xl hover:bg-pink-200 font-medium text-sm">
            과거 데이터
          </Link>
          <Link href="/settings" className="text-center px-4 py-3 bg-pink-100 text-pink-600 rounded-xl hover:bg-pink-200 font-medium text-sm">
            설정
          </Link>
        </div>

        <DinosaurMascot message={mascotMessage} />
      </div>
    </div>
  );
}
