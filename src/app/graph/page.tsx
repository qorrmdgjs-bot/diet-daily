'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import WeightChart from '@/components/WeightChart';
import { loadWeightData, syncFromSupabase } from '@/utils/storage';

export default function GraphPage() {
  const [data, setData] = useState(loadWeightData());

  useEffect(() => {
    syncFromSupabase().then(synced => setData(synced));
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-lg mx-auto">
        {/* 상단 네비게이션 */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <Link
            href="/dashboard"
            className="text-pink-500 text-sm font-medium"
          >
            ← 돌아가기
          </Link>
        </div>

        <WeightChart entries={data.entries} />
      </div>
    </div>
  );
}
