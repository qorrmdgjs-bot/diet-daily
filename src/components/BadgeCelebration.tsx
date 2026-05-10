'use client';

import { BADGES, BadgeId } from '@/utils/badges';

const CELEBRATE_MESSAGES = [
  '와아 진짜 멋져! 너 정말 자랑스러워 🦄',
  '함께 와줘서 너무 고마워, 우리 계속 가자!',
  '한 걸음씩 모인 시간이 결국 빛이 됐어 ✨',
  '이 순간 꼭 기억해줘. 너는 해내는 사람이야!',
  '오늘의 너에게 박수를! 너무 잘하고 있어 💖',
];

interface BadgeCelebrationProps {
  badge: BadgeId;
  onClose: () => void;
}

export default function BadgeCelebration({ badge, onClose }: BadgeCelebrationProps) {
  const meta = BADGES[badge];
  const message = CELEBRATE_MESSAGES[Math.floor(Math.random() * CELEBRATE_MESSAGES.length)];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-pink-500/30 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative bg-gradient-to-b from-pink-50 to-pink-100 rounded-3xl shadow-2xl border-2 border-pink-200 max-w-sm w-full p-6 text-center overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="confetti-wrap absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
          {Array.from({ length: 18 }).map((_, i) => (
            <span key={i} className={`confetti-piece confetti-${i % 6}`} style={{ left: `${(i * 5.5) % 100}%`, animationDelay: `${(i % 6) * 0.15}s` }} />
          ))}
        </div>

        <div className="relative">
          <div className="text-7xl mb-3 animate-bounce">{meta.emoji}</div>
          <h2 className="text-2xl font-bold text-pink-700 mb-1">{meta.title}</h2>
          <p className="text-sm text-pink-500 mb-4">{meta.description}</p>
          <p className="text-base text-pink-700 leading-relaxed mb-5">🦄 {message}</p>
          <button
            onClick={onClose}
            className="w-full bg-pink-400 text-white py-3 rounded-xl hover:bg-pink-500 font-semibold"
          >
            고마워 🦄
          </button>
        </div>
      </div>

      <style jsx>{`
        .confetti-piece {
          position: absolute;
          top: -10%;
          width: 8px;
          height: 14px;
          opacity: 0.9;
          animation: fall 3s linear infinite;
          border-radius: 2px;
        }
        .confetti-0 { background: #f9a8d4; }
        .confetti-1 { background: #fbcfe8; }
        .confetti-2 { background: #fde68a; }
        .confetti-3 { background: #c4b5fd; }
        .confetti-4 { background: #93c5fd; }
        .confetti-5 { background: #f472b6; }
        @keyframes fall {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(420px) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
