'use client';

import { Prediction } from '@/types';

interface PredictionCardProps {
  prediction: Prediction;
}

export default function PredictionCard({ prediction }: PredictionCardProps) {
  return (
    <div className="bg-white rounded-xl p-4 sm:p-6 shadow-md border border-pink-100">
      <h2 className="text-lg sm:text-xl font-semibold mb-4 text-pink-700">예측</h2>
      <div className="space-y-3 sm:space-y-4">
        <div>
          <p className="text-sm text-pink-400">현재 추세라면 목표 체중까지</p>
          <p className="text-xl sm:text-2xl font-bold text-fuchsia-500">
            {prediction.daysToGoal ? `${prediction.daysToGoal}일 후` : '데이터 부족'}
          </p>
        </div>
        <div>
          <p className="text-sm text-pink-400">주간 평균 감량 속도</p>
          <p className="text-xl sm:text-2xl font-bold text-emerald-400">{prediction.weeklyLossRate.toFixed(2)} kg/주</p>
        </div>
      </div>
    </div>
  );
}