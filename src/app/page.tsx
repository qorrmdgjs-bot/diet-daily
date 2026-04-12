'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { loadWeightData } from '@/utils/storage';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const data = loadWeightData();
    if (data.entries.length > 0) {
      router.push('/dashboard');
    } else {
      router.push('/input');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">🦄</div>
        <p className="text-pink-400">로딩 중...</p>
      </div>
    </div>
  );
}
