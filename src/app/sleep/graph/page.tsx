'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import SleepChart from '@/components/SleepChart';
import { loadSleepData, syncFromSupabase } from '@/utils/sleepStorage';

export default function SleepGraphPage() {
  const [data, setData] = useState(loadSleepData());

  useEffect(() => {
    syncFromSupabase().then(synced => setData(synced));
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-lg mx-auto">
        {/* 상단 네비게이션 */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <Link
            href="/sleep"
            className="text-indigo-500 text-sm font-medium"
          >
            ← 돌아가기
          </Link>
        </div>

        <SleepChart entries={data.entries} goalHours={data.settings.goalHours} />
      </div>
    </div>
  );
}
