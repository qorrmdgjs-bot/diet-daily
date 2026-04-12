'use client';

import Link from 'next/link';
import PastDataInput from '@/components/PastDataInput';

export default function PastInputPage() {
  const handleSave = () => {};

  return (
    <div className="min-h-screen bg-white py-4 px-2 sm:py-8 sm:px-4">
      <div className="max-w-2xl mx-auto">
        <header className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold text-pink-700">과거 데이터 입력</h1>
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
