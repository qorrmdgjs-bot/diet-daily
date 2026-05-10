'use client';

import { useState, useEffect } from 'react';

interface DinosaurMascotProps {
  message?: string;
  streak?: number;
}

function mascotEmoji(streak: number): string {
  if (streak >= 100) return '🌟🦄👑';
  if (streak >= 30) return '🦄👑';
  if (streak >= 7) return '🦄✨';
  return '🦄';
}

const messages = {
  input: [
    '오늘도 기록했다! 이게 바로 실천이야 💪',
    '꾸준히 쓰는 너, 진짜 멋져 🦄',
    '기록하는 것만으로도 반은 성공이야!',
    '매일 한 줄이 모여 기적이 돼 ✨',
    '오늘의 나를 기억해줘서 고마워!',
    '작은 습관이 큰 변화를 만들어!',
    '기록이 쌓일수록 더 정확해져!',
    '오늘도 스스로를 챙겼네, 대단해!',
  ],
  weightDown: [
    '줄었다! 노력이 보이기 시작했어 🎉',
    '와, 진짜 잘하고 있어! 이 흐름 놓치지 마!',
    '숫자가 말해주고 있어. 너 잘하고 있다고 💪',
    '한 걸음씩, 확실히 나아가고 있어!',
    '오늘의 결과는 어제의 노력 덕분이야!',
    '몸이 변하고 있어. 느껴지지? ✨',
    '꾸준함의 힘이야. 계속 가자!',
    '거울 속 너, 점점 달라지고 있어!',
  ],
  weightUp: [
    '괜찮아, 하루 올라간 건 아무것도 아니야 😊',
    '힘든 거 알아. 그래도 가는 거야!',
    '올라갈 때도 있어. 포기만 안 하면 돼!',
    '지금 멈추지 않으면, 반드시 도착해!',
    '체중은 파도처럼 출렁여. 방향만 맞으면 돼!',
    '오늘 하루가 전부가 아니야. 길게 보자!',
    '어제보다 나은 선택 하나면 충분해!',
    '넘어져도 일어나는 게 진짜 강한 거야 💪',
    '할 수 있어. 이미 하고 있잖아!',
    '잠깐 쉬어가는 것도 괜찮아. 다시 가면 돼!',
  ],
  goalAchieved: [
    '해냈다!! 진짜 해냈어!! 🎊',
    '목표 달성! 너무너무 대단해! 🏆',
    '꿈꾸던 숫자에 도착했어! 축하해!',
    '포기하지 않은 너에게 박수! 👏',
    '이건 끝이 아니라 새로운 시작이야 ✨',
    '증명했어. 넌 해내는 사람이야!',
  ],
  welcome: [
    '오늘도 와줬네! 함께 힘내자 🦄',
    '꾸준함이 승리의 열쇠야!',
    '어제의 나보다 오늘의 내가 더 강해!',
    '한 걸음씩이면 충분해. 같이 가자!',
    '오늘 하루도 나를 위해 시작하자!',
    '기록하러 온 너, 이미 대단해!',
  ],
};

export default function DinosaurMascot({ message, streak = 0 }: DinosaurMascotProps) {
  const [currentMessage, setCurrentMessage] = useState('');

  useEffect(() => {
    if (message) {
      setCurrentMessage(message);
      const timer = setTimeout(() => setCurrentMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const getRandomMessage = (type: keyof typeof messages) => {
    const msgs = messages[type];
    return msgs[Math.floor(Math.random() * msgs.length)];
  };

  return (
    <div className="fixed bottom-2 right-2 sm:bottom-4 sm:right-4 z-50">
      {currentMessage && (
        <div className="relative mb-1 sm:mb-2">
          <div className="bg-pink-100 text-pink-700 px-3 py-2 sm:px-4 sm:py-2 rounded-xl shadow-lg max-w-[200px] sm:max-w-xs text-sm sm:text-base border border-pink-200">
            {currentMessage}
          </div>
          <div className="absolute top-full right-2 sm:right-4 w-0 h-0 border-l-2 border-r-2 border-t-2 sm:border-l-4 sm:border-r-4 sm:border-t-4 border-transparent border-t-pink-100"></div>
        </div>
      )}
      <div className="text-4xl sm:text-5xl whitespace-nowrap">{mascotEmoji(streak)}</div>
    </div>
  );
}

export { messages };