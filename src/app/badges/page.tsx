'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { loadWeightData, syncFromSupabase } from '@/utils/storage';
import { ALL_BADGE_IDS, BADGES, BadgeId, computeEarnedBadges, computeStreak } from '@/utils/badges';
import { WeightData } from '@/types';

export default function BadgesPage() {
  const [data, setData] = useState<WeightData>(loadWeightData());

  useEffect(() => {
    syncFromSupabase().then(synced => setData(synced));
  }, []);

  const earned = new Set<BadgeId>(computeEarnedBadges(data.entries, data.settings));
  const streak = computeStreak(data.entries);
  const totalDays = data.entries.length;

  return (
    <div className="min-h-screen bg-white py-4 px-2 sm:py-6 sm:px-4">
      <div className="max-w-lg mx-auto">
        <Link href="/settings" className="inline-block mb-4 text-pink-400 hover:text-pink-600 text-sm px-2">
          ← 돌아가기
        </Link>

        <h1 className="text-2xl font-bold text-pink-700 text-center mb-2">뱃지 컬렉션</h1>

        <div className="bg-pink-50 rounded-xl border border-pink-100 p-4 mb-5 text-center">
          <p className="text-sm text-pink-500">유니콘과 함께한 시간</p>
          <p className="text-2xl font-bold text-pink-700 mt-1">
            🦄 {totalDays}일째
            <span className="text-sm font-medium text-pink-500 ml-2">(연속 {streak}일)</span>
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {ALL_BADGE_IDS.map(id => {
            const meta = BADGES[id];
            const got = earned.has(id);
            return (
              <div
                key={id}
                className={`rounded-xl p-3 text-center border ${
                  got
                    ? 'bg-white border-pink-200 shadow-sm'
                    : 'bg-gray-50 border-gray-200 opacity-60'
                }`}
              >
                <div className={`text-3xl mb-1 ${got ? '' : 'grayscale'}`}>
                  {got ? meta.emoji : '🔒'}
                </div>
                <p className={`text-xs font-semibold ${got ? 'text-pink-700' : 'text-gray-400'}`}>
                  {meta.title}
                </p>
                <p className={`text-[10px] mt-0.5 ${got ? 'text-pink-400' : 'text-gray-400'}`}>
                  {meta.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
