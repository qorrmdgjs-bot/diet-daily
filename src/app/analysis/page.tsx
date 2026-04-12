'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DinosaurMascot from '@/components/DinosaurMascot';
import { loadWeightData, syncFromSupabase } from '@/utils/storage';
import { WeightData } from '@/types';

export default function AnalysisPage() {
  const [data, setData] = useState<WeightData>(loadWeightData());
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    syncFromSupabase().then(synced => {
      setData(synced);
    });
  }, []);

  const analyze = async () => {
    if (data.entries.length < 3) {
      setError('데이터가 부족해! 최소 3일 이상 기록해야 분석할 수 있어 🦄');
      return;
    }

    setLoading(true);
    setError(null);
    setAnalysis('');

    try {
      const res = await fetch('/api/analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entries: data.entries,
          settings: data.settings,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.error || '분석에 실패했어. 다시 시도해줘!');
        return;
      }

      setAnalysis(result.analysis);
    } catch {
      setError('네트워크 오류가 발생했어. 인터넷 연결을 확인해줘!');
    } finally {
      setLoading(false);
    }
  };

  // 현재 체중 계산
  const latestEntry = data.entries.length > 0
    ? data.entries[data.entries.length - 1]
    : null;
  const currentWeight = latestEntry?.evening ?? latestEntry?.morning ?? null;
  const remaining = currentWeight != null
    ? Math.round((currentWeight - data.settings.goalWeight) * 10) / 10
    : null;

  return (
    <div className="min-h-screen bg-white py-4 px-2 sm:py-6 sm:px-4">
      <div className="max-w-lg mx-auto">
        {/* 뒤로가기 */}
        <Link href="/dashboard" className="inline-block mb-4 text-pink-400 hover:text-pink-600 text-sm px-2">
          ← 돌아가기
        </Link>

        {/* 제목 */}
        <h1 className="text-2xl font-bold text-pink-700 text-center mb-4">
          AI 건강 분석 🦄
        </h1>

        {/* 요약 카드 */}
        {currentWeight != null && (
          <div className="bg-pink-50 rounded-xl p-4 mb-4 border border-pink-100">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-xs text-pink-400">현재 체중</p>
                <p className="text-lg font-bold text-pink-700">{currentWeight}kg</p>
              </div>
              <div>
                <p className="text-xs text-pink-400">목표 체중</p>
                <p className="text-lg font-bold text-pink-700">{data.settings.goalWeight}kg</p>
              </div>
              <div>
                <p className="text-xs text-pink-400">남은 감량</p>
                <p className="text-lg font-bold text-pink-700">
                  {remaining != null ? `${remaining > 0 ? remaining : 0}kg` : '-'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 분석 버튼 */}
        {!loading && !analysis && (
          <button
            onClick={analyze}
            className="w-full py-3 bg-pink-400 text-white rounded-xl hover:bg-pink-500 font-medium text-sm mb-4"
          >
            AI 분석 시작하기
          </button>
        )}

        {/* 로딩 */}
        {loading && (
          <div className="text-center py-12">
            <div className="text-5xl mb-4 animate-bounce">🦄</div>
            <p className="text-pink-400 font-medium">분석 중...</p>
            <p className="text-pink-300 text-sm mt-1">체중 데이터를 살펴보고 있어!</p>
          </div>
        )}

        {/* 에러 */}
        {error && (
          <div className="bg-pink-50 rounded-xl p-4 mb-4 border border-pink-200">
            <p className="text-pink-600 text-sm">{error}</p>
            <button
              onClick={analyze}
              className="mt-2 text-sm text-pink-400 hover:text-pink-600 underline"
            >
              다시 시도하기
            </button>
          </div>
        )}

        {/* 분석 결과 */}
        {analysis && (
          <div className="bg-pink-50 rounded-xl p-4 mb-4 border border-pink-100">
            <div className="text-sm text-pink-800 leading-relaxed whitespace-pre-line">
              {analysis}
            </div>
          </div>
        )}

        {/* 다시 분석 버튼 */}
        {analysis && !loading && (
          <button
            onClick={analyze}
            className="w-full py-3 bg-pink-100 text-pink-600 rounded-xl hover:bg-pink-200 font-medium text-sm mb-4"
          >
            다시 분석하기
          </button>
        )}

        <DinosaurMascot />
      </div>
    </div>
  );
}
