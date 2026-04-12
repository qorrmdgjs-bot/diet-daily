'use client';

import Link from 'next/link';
import PastDataInput from '@/components/PastDataInput';

export default function PastInputPage() {
  const handleSave = () => {
    // 저장 후 별도 동작 없음 (컴포넌트 내부에서 저장 완료 표시)
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black py-4 px-2 sm:py-8 sm:px-4">
      <div className="max-w-2xl mx-auto">
        <header className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold text-pink-700 dark:text-pink-300">과거 데이터 입력</h1>
          <Link
            href="/dashboard"
            className="px-3 py-2 sm:px-4 sm:py-2 bg-pink-400 text-white rounded-lg hover:bg-pink-500 text-sm sm:text-base"
          >
            대시보드로 돌아가기
          </Link>
        </header>

        <PastDataInput onSave={handleSave} />
      </div>
    </div>
  );
}
